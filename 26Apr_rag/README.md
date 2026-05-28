# Local RAG Pipeline - PDF Chatbot

A beginner-friendly, fully local Retrieval-Augmented Generation (RAG) application.
Upload PDFs, chunk them, embed with **Nomic Embeddings via Ollama**, store in **ChromaDB**,
and ask questions answered by a **Groq LLM**.

---

## Features

- PDF text extraction and chunking (LangChain)
- Local embeddings with `nomic-embed-text` (Ollama)
- Persistent vector storage with ChromaDB
- Visual HTML UI showing the full RAG pipeline
- ChromaDB inspector and debug logs
- Groq API integration for fast LLM inference

---

## Project Structure

```
26Apr_rag/
├── data/                  # Place your PDFs here
│   └── README.md
├── static/
│   ├── style.css          # Frontend styling
│   └── script.js          # Frontend logic
├── templates/
│   └── index.html         # Main UI
├── rag_pipeline.py        # Core RAG logic (PDF → Chunks → DB → Answer)
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── .env                   # API keys (keep secret!)
├── .gitignore
└── README.md
```

---

## Prerequisites

1. **Python 3.9+** installed
2. **Ollama** installed and running locally  
   - Download: https://ollama.com
   - Pull the embedding model:
     ```bash
     ollama pull nomic-embed-text
     ```
3. **Groq API Key**  
   - Sign up at https://console.groq.com/keys
   - The key is already placed in `.env` for you.

---

## Installation

### 1. Create a virtual environment

```bash
cd 26Apr_rag
python -m venv venv
```

### 2. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

## Configuration

The `.env` file is already created with your Groq API key:

```bash
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
```

You can change the model to any other Groq-supported open-source model, for example:
- `llama3-8b-8192`
- `mixtral-8x7b-32768`
- `gemma-7b-it`

---

## Running the Project

### 1. Ensure Ollama is running

```bash
ollama serve
```

Or simply keep the Ollama desktop app open.

### 2. Start the Flask server

```bash
python app.py
```

### 3. Open the UI

Navigate to: **http://localhost:5000**

---

## How to Use

1. **Place PDFs** inside the `data/` folder.
2. Open the web UI and click **"Preview PDFs"** to verify content.
3. Click **"Process & Index PDFs"** to:
   - Extract text
   - Split into chunks
   - Generate embeddings (nomic-embed-text via Ollama)
   - Save into local ChromaDB (`chroma_db/`)
4. Click **"View Chunks"** to inspect the generated chunks.
5. Click **"Inspect ChromaDB"** to see stored vectors/metadata.
6. Type a question and click **"Ask"**.
7. Watch the full RAG flow in the UI:
   - Your question
   - Query embedding step
   - Retrieved chunks with similarity scores
   - Final LLM answer

---

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Flask |
| PDF Parsing | PyPDFLoader (LangChain) |
| Chunking | RecursiveCharacterTextSplitter (LangChain) |
| Embeddings | Nomic Embed Text via Ollama |
| Vector DB | ChromaDB (persistent local) |
| LLM | Groq API (open-source models) |
| Frontend | HTML, CSS, JavaScript |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Ollama connection refused` | Make sure Ollama is running (`ollama serve`) and `nomic-embed-text` is pulled. |
| `No PDF files found` | Place `.pdf` files in the `data/` folder before processing. |
| `GROQ_API_KEY missing` | Check that `.env` exists and is readable. |
| `ChromaDB errors` | Delete the `chroma_db/` folder and re-process PDFs. |

---

## Notes

- **Security**: The `.env` file contains your API key. It is ignored by Git (see `.gitignore`). Do not commit it.
- **Privacy**: All embeddings are generated locally. Only the final prompt + retrieved chunks are sent to Groq's LLM API.
- **Storage**: ChromaDB data is stored locally in `chroma_db/` and persists across restarts.
