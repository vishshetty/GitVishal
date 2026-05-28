const API_BASE = ""; // same origin

function log(msg) {
    const el = document.getElementById("debugLogs");
    const time = new Date().toLocaleTimeString();
    el.textContent += `[${time}] ${msg}\n`;
    el.scrollTop = el.scrollHeight;
}

function clearLogs() {
    document.getElementById("debugLogs").textContent = "";
}

function setStatus(msg, isError = false) {
    const el = document.getElementById("statusMsg");
    el.textContent = msg;
    el.style.color = isError ? "#c62828" : "#2e7d32";
}

function setLoading(id, loading) {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = loading;
}

async function loadPreview() {
    setLoading("btnPreview", true);
    log("Fetching PDF previews...");
    try {
        const res = await fetch(`${API_BASE}/api/preview`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById("previewContent");
        container.innerHTML = "";
        data.previews.forEach(p => {
            const div = document.createElement("div");
            div.className = "chunk-card";
            div.innerHTML = `<div class="chunk-meta">${p.filename} (${p.pages_loaded} pages)</div><div>${escapeHtml(p.preview)}</div>`;
            container.appendChild(div);
        });

        document.getElementById("previewSection").style.display = "block";
        log(`Preview loaded for ${data.previews.length} PDF(s).`);
        setStatus(`Preview loaded for ${data.previews.length} PDF(s).`);
    } catch (e) {
        log("Preview error: " + e.message);
        setStatus("Failed to load preview: " + e.message, true);
    } finally {
        setLoading("btnPreview", false);
    }
}

async function processPDFs() {
    setLoading("btnProcess", true);
    log("Processing PDFs: extracting text, chunking, embedding, storing in ChromaDB...");
    try {
        const res = await fetch(`${API_BASE}/api/process`, { method: "POST" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        log(`Processing complete: ${data.total_chunks} chunks indexed.`);
        setStatus(`Success: ${data.total_chunks} chunks indexed into ChromaDB.`);
        alert(`Done! Indexed ${data.total_chunks} chunks. You can now view chunks or ask questions.`);
    } catch (e) {
        log("Process error: " + e.message);
        setStatus("Processing failed: " + e.message, true);
    } finally {
        setLoading("btnProcess", false);
    }
}

async function loadChunks() {
    setLoading("btnChunks", true);
    log("Fetching generated chunks...");
    try {
        const res = await fetch(`${API_BASE}/api/chunks`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById("chunksContent");
        container.innerHTML = "";
        if (!data.chunks || data.chunks.length === 0) {
            container.innerHTML = "<p>No chunks found. Please process PDFs first.</p>";
        } else {
            data.chunks.forEach(c => {
                const div = document.createElement("div");
                div.className = "chunk-card";
                div.innerHTML = `<div class="chunk-meta">ID ${c.id} | ${c.source} | Page ${c.page}</div><div>${escapeHtml(c.content)}</div>`;
                container.appendChild(div);
            });
        }

        document.getElementById("chunksSection").style.display = "block";
        log(`Loaded ${data.total} chunks.`);
        setStatus(`Loaded ${data.total} chunks.`);
    } catch (e) {
        log("Chunks error: " + e.message);
        setStatus("Failed to load chunks: " + e.message, true);
    } finally {
        setLoading("btnChunks", false);
    }
}

async function inspectDB() {
    setLoading("btnInspect", true);
    log("Inspecting ChromaDB collection...");
    try {
        const res = await fetch(`${API_BASE}/api/inspect`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById("inspectContent");
        container.innerHTML = `
<strong>Collection:</strong> ${data.collection_name}<br>
<strong>Persist Directory:</strong> ${data.persist_directory}<br>
<strong>Total Documents:</strong> ${data.total_documents}<br><br>
<strong>Sample Documents:</strong><br>
${data.sample_documents.map(d => `
<div class="retrieved-item">
    <div class="retrieved-meta">ID: ${d.id}</div>
    <div>${escapeHtml(d.content)}</div>
    <div class="retrieved-meta">Meta: ${JSON.stringify(d.metadata)}</div>
</div>
`).join("")}
        `;

        document.getElementById("inspectSection").style.display = "block";
        log(`ChromaDB inspection complete. ${data.total_documents} documents stored.`);
        setStatus(`ChromaDB has ${data.total_documents} documents.`);
    } catch (e) {
        log("Inspect error: " + e.message);
        setStatus("Inspection failed: " + e.message, true);
    } finally {
        setLoading("btnInspect", false);
    }
}

async function askQuestion() {
    const input = document.getElementById("queryInput");
    const query = input.value.trim();
    if (!query) {
        alert("Please enter a question.");
        return;
    }

    setLoading("btnAsk", true);
    log(`Submitting question: "${query}"`);

    // Show result section skeleton
    const resultSection = document.getElementById("resultSection");
    resultSection.style.display = "block";
    document.getElementById("flowQuestion").textContent = query;
    document.getElementById("flowEmbedding").textContent = "Generating query embedding with nomic-embed-text (Ollama)...";
    document.getElementById("flowChunks").innerHTML = "Searching ChromaDB...";
    document.getElementById("flowAnswer").textContent = "Waiting for LLM response...";
    document.getElementById("chunkCount").textContent = "";
    document.getElementById("llmModel").textContent = "";

    try {
        const res = await fetch(`${API_BASE}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        // Update embedding status
        document.getElementById("flowEmbedding").innerHTML = `
            <div>Status: <strong>${data.embedding_status}</strong></div>
            <div>Model: <strong>${data.embedding_model}</strong></div>
            <div class="retrieved-meta">Embedding vector generated locally via Ollama.</div>
        `;

        // Update chunks
        const chunksContainer = document.getElementById("flowChunks");
        chunksContainer.innerHTML = "";
        if (data.retrieved_chunks && data.retrieved_chunks.length > 0) {
            document.getElementById("chunkCount").textContent = `(${data.retrieved_chunks.length} chunks)`;
            data.retrieved_chunks.forEach((c, idx) => {
                const div = document.createElement("div");
                div.className = "retrieved-item";
                div.innerHTML = `
                    <div class="retrieved-meta">#${idx + 1} | ${c.source} | Page ${c.page}</div>
                    <div>${escapeHtml(c.content)}</div>
                    <span class="retrieved-score">Score: ${c.score}</span>
                `;
                chunksContainer.appendChild(div);
            });
        } else {
            chunksContainer.innerHTML = "<em>No chunks retrieved.</em>";
        }

        // Update answer
        document.getElementById("llmModel").textContent = `(${data.llm_model})`;
        document.getElementById("flowAnswer").innerHTML = escapeHtml(data.llm_response).replace(/\n/g, "<br>");

        log("RAG query complete. Retrieved " + (data.retrieved_chunks?.length || 0) + " chunk(s).");
        setStatus("Answer generated successfully.");
    } catch (e) {
        log("Query error: " + e.message);
        setStatus("Query failed: " + e.message, true);
        document.getElementById("flowAnswer").textContent = "Error: " + e.message;
    } finally {
        setLoading("btnAsk", false);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
