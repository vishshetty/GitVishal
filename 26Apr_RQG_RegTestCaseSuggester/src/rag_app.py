import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import requests

from ingest import load_excel, chunk_documents

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in .env")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
LLM_MODEL = "llama-3.3-70b-versatile"


class NomicLocalEmbeddings:
    def __init__(self, model="nomic-embed-text-v1.5"):
        from nomic import embed
        self._embed = embed
        self.model = model

    def embed_documents(self, texts):
        result = self._embed.text(
            texts=texts,
            model=self.model,
            task_type="search_document",
            inference_mode="local"
        )
        return result["embeddings"]

    def embed_query(self, text):
        result = self._embed.text(
            texts=[text],
            model=self.model,
            task_type="search_query",
            inference_mode="local"
        )
        return result["embeddings"][0]

    def __call__(self, text):
        return self.embed_query(text)


embeddings = NomicLocalEmbeddings(model="nomic-embed-text-v1.5")

CHROMA_PATH = Path(__file__).parent / "chroma_db"
COLLECTION_NAME = "langchain"
CHROMA_PATH.mkdir(parents=True, exist_ok=True)

if not any(CHROMA_PATH.iterdir()):
    docs = load_excel()
    chunks = chunk_documents(docs)
    texts = [c.page_content for c in chunks]
    metadatas = [c.metadata for c in chunks]
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    vectordb = Chroma.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas, ids=ids, persist_directory=str(CHROMA_PATH), collection_name=COLLECTION_NAME)
    vectordb.persist()
else:
    vectordb = Chroma(persist_directory=str(CHROMA_PATH), embedding_function=embeddings, collection_name=COLLECTION_NAME)

app = FastAPI()
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

class GroqLLM:
    def __init__(self, api_key, model=LLM_MODEL):
        self.api_key = api_key
        self.model = model

    def __call__(self, prompt_text):
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt_text}],
            "temperature": 0.3,
        }
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

llm = GroqLLM(api_key=GROQ_API_KEY)

def get_answer(query):
    results = vectordb.similarity_search_with_score(query, k=5)
    context = "\n\n".join([f"[{d.metadata.get('Test Case ID', 'N/A')}] {d.page_content}" for d, s in results])
    full_prompt = f"Context:\n{context}\n\nQuery: {query}\n\nProvide test case matches and suggest regression tests:"
    answer = llm(full_prompt)
    chunks = []
    for d, score in results:
        chunks.append({
            "id": d.metadata.get("Test Case ID", "N/A"),
            "module": d.metadata.get("Module", "N/A"),
            "feature": d.metadata.get("Feature", "N/A"),
            "text": d.page_content,
            "distance": round(float(score), 4)
        })
    return answer, chunks, context

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(request, "index.html", {})

class SearchRequest(BaseModel):
    query: str

@app.post("/search")
async def search(req: SearchRequest):
    answer, chunks, context = get_answer(req.query)
    return {"answer": answer, "chunks": chunks, "context": context}