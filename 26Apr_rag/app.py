import os
import logging

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import chromadb

from rag_pipeline import RAGPipeline

# Load environment variables (e.g., GROQ_API_KEY)
load_dotenv()

# Flask app setup
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Environment config
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Initialize RAG pipeline
rag = RAGPipeline(data_dir="data", chroma_dir="chroma_db")


@app.route("/")
def index():
    """Serve the main HTML UI."""
    return render_template("index.html")


@app.route("/api/process", methods=["POST"])
def process_pdfs():
    """
    Endpoint to read PDFs from the data/ folder,
    chunk them, embed them via nomic-embed-text (Ollama),
    and store them in local ChromaDB.
    """
    try:
        chunks = rag.load_and_chunk()
        total_indexed = rag.index_documents()
        return jsonify({
            "success": True,
            "message": f"Processed PDFs into {total_indexed} chunks and indexed in ChromaDB.",
            "total_chunks": total_indexed,
            "chunks": chunks,
        })
    except Exception as e:
        logger.exception("Error processing PDFs")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/preview", methods=["GET"])
def preview_pdfs():
    """
    Returns a text preview of the first few pages of each PDF
    found in the data/ directory.
    """
    import glob
    from langchain_community.document_loaders import PyPDFLoader

    pdf_files = glob.glob(os.path.join("data", "*.pdf"))
    previews = []

    for pdf_path in pdf_files:
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            # Concatenate first 3 pages (or all if fewer)
            preview_text = "\n".join([d.page_content for d in docs[:3]])
            previews.append({
                "filename": os.path.basename(pdf_path),
                "pages_loaded": len(docs),
                "preview": preview_text[:2000],  # cap for UI
            })
        except Exception as e:
            previews.append({
                "filename": os.path.basename(pdf_path),
                "error": str(e),
            })

    return jsonify({"success": True, "previews": previews})


@app.route("/api/chunks", methods=["GET"])
def get_chunks():
    """Return the currently loaded/generated chunks."""
    return jsonify({
        "success": True,
        "chunks": rag.chunk_store,
        "total": len(rag.chunk_store),
    })


@app.route("/api/inspect", methods=["GET"])
def inspect_chromadb():
    """
    Inspect the local ChromaDB collection:
    total document count and a small sample with metadata.
    """
    try:
        client = chromadb.PersistentClient(path="chroma_db")
        collection = client.get_collection("pdf_collection")
        count = collection.count()

        sample = collection.get(limit=min(10, count))
        sample_docs = []
        if sample and sample.get("documents"):
            for i in range(len(sample["documents"])):
                sample_docs.append({
                    "id": sample["ids"][i] if "ids" in sample else i,
                    "content": sample["documents"][i][:300] + "..." if len(sample["documents"][i]) > 300 else sample["documents"][i],
                    "metadata": sample["metadatas"][i] if "metadatas" in sample and sample["metadatas"] else {},
                })

        return jsonify({
            "success": True,
            "collection_name": "pdf_collection",
            "persist_directory": "chroma_db",
            "total_documents": count,
            "sample_documents": sample_docs,
        })
    except Exception as e:
        logger.exception("Error inspecting ChromaDB")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/query", methods=["POST"])
def query_rag():
    """
    Full RAG query endpoint:
    1. Embed the query (nomic-embed-text via Ollama)
    2. Search ChromaDB for top-k chunks
    3. Send retrieved chunks + question to Groq LLM
    4. Return the final answer with full debug visibility.
    """
    data = request.get_json(silent=True) or {}
    user_query = data.get("query", "").strip()

    if not user_query:
        return jsonify({"success": False, "error": "Query cannot be empty."}), 400

    if not GROQ_API_KEY:
        return jsonify({"success": False, "error": "GROQ_API_KEY is missing from .env"}), 500

    try:
        # Step 1: Embed query
        logger.info(f"Embedding query: '{user_query}'")
        query_embedding = rag.embeddings.embed_query(user_query)

        # Step 2: Similarity search in local ChromaDB
        logger.info("Performing similarity search in ChromaDB...")
        results_with_scores = rag.similarity_search(user_query, k=5)

        if not results_with_scores:
            return jsonify({
                "success": True,
                "query": user_query,
                "embedding_status": "success",
                "retrieved_chunks": [],
                "llm_response": "No relevant chunks were found in the database.",
            })

        # Format chunks for the response
        retrieved_chunks = []
        for doc, score in results_with_scores:
            retrieved_chunks.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page", 0),
                "score": round(float(score), 5),
            })

        # Step 3: Generate answer via Groq
        logger.info("Sending context + question to Groq LLM...")
        answer = rag.generate_answer(
            query=user_query,
            chunks_with_scores=results_with_scores,
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
        )

        return jsonify({
            "success": True,
            "query": user_query,
            "embedding_status": "success",
            "embedding_model": "nomic-embed-text (Ollama)",
            "retrieved_chunks": retrieved_chunks,
            "llm_model": GROQ_MODEL,
            "llm_response": answer,
        })

    except Exception as e:
        logger.exception("Error during RAG query")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    # Run on localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=True)
