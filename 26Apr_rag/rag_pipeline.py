import os
import glob
import logging
from typing import List, Dict, Any, Tuple

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from groq import Groq

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Beginner-friendly RAG Pipeline.
    Handles PDF loading, text chunking, embedding via Ollama (nomic-embed-text),
    storage in local ChromaDB, and answering questions via Groq LLM.
    """

    def __init__(
        self,
        data_dir: str = "data",
        chroma_dir: str = "chroma_db",
        collection_name: str = "pdf_collection",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ):
        self.data_dir = data_dir
        self.chroma_dir = chroma_dir
        self.collection_name = collection_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Use nomic-embed-text via Ollama (free, local, open-source)
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")

        # Stores
        self.documents: List[Document] = []
        self.chunk_store: List[Dict[str, Any]] = []
        self.vectorstore = None

    def load_and_chunk(self) -> List[Dict[str, Any]]:
        """
        Reads all PDF files from the data directory, extracts text,
        and splits it into meaningful chunks.
        """
        pdf_files = glob.glob(os.path.join(self.data_dir, "*.pdf"))
        if not pdf_files:
            raise ValueError("No PDF files found in data/ directory. Please add your PDFs first.")

        all_docs = []
        for pdf_path in pdf_files:
            try:
                loader = PyPDFLoader(pdf_path)
                docs = loader.load()
                for doc in docs:
                    doc.metadata["source"] = os.path.basename(pdf_path)
                all_docs.extend(docs)
                logger.info(f"Loaded {len(docs)} pages from {os.path.basename(pdf_path)}")
            except Exception as e:
                logger.error(f"Failed to load {pdf_path}: {e}")
                raise RuntimeError(f"Error reading {os.path.basename(pdf_path)}: {e}")

        # Split text into chunks using LangChain's recursive splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", "! ", "? ", ",", " ", ""],
        )
        self.documents = text_splitter.split_documents(all_docs)

        # Build a simple JSON-friendly chunk store for the UI
        self.chunk_store = []
        for i, chunk in enumerate(self.documents):
            self.chunk_store.append({
                "id": i,
                "content": chunk.page_content,
                "source": chunk.metadata.get("source", "unknown"),
                "page": chunk.metadata.get("page", 0),
            })

        logger.info(f"Created {len(self.chunk_store)} chunks from {len(pdf_files)} PDF(s).")
        return self.chunk_store

    def index_documents(self) -> int:
        """
        Converts all chunks into embeddings using nomic-embed-text
        and stores them in a persistent local ChromaDB instance.
        """
        if not self.documents:
            raise ValueError("No documents to index. Run load_and_chunk() first.")

        self.vectorstore = Chroma.from_documents(
            documents=self.documents,
            embedding=self.embeddings,
            persist_directory=self.chroma_dir,
            collection_name=self.collection_name,
        )

        # Persist to disk (ensures data survives between runs)
        if hasattr(self.vectorstore, "persist"):
            self.vectorstore.persist()

        logger.info(f"Indexed {len(self.documents)} chunks into ChromaDB at '{self.chroma_dir}'.")
        return len(self.documents)

    def similarity_search(self, query: str, k: int = 5) -> List[Tuple[Document, float]]:
        """
        Converts the user query into an embedding and performs
        similarity search against the local ChromaDB collection.
        Returns a list of (Document, score) tuples.
        """
        if self.vectorstore is None:
            # Re-initialize from disk if not already in memory
            self.vectorstore = Chroma(
                persist_directory=self.chroma_dir,
                embedding_function=self.embeddings,
                collection_name=self.collection_name,
            )

        results = self.vectorstore.similarity_search_with_score(query, k=k)
        return results

    def generate_answer(
        self,
        query: str,
        chunks_with_scores: List[Tuple[Document, float]],
        api_key: str,
        model: str,
    ) -> str:
        """
        Builds a prompt from the retrieved chunks and sends it to the Groq LLM.
        """
        context_blocks = []
        for doc, score in chunks_with_scores:
            meta = f"[Source: {doc.metadata.get('source', 'unknown')}, Page: {doc.metadata.get('page', 0)}]"
            context_blocks.append(f"{meta}\n{doc.page_content}")

        context = "\n\n---\n\n".join(context_blocks)

        prompt = (
            "You are a helpful assistant. Use the provided context to answer the user's question.\n"
            "If the answer is not contained in the context, say exactly:\n"
            "'I don't have enough information to answer this.'\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {query}\n\n"
            "Answer:"
        )

        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            temperature=0.5,
            max_tokens=1024,
        )
        return chat_completion.choices[0].message.content
