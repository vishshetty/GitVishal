import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

print("Loading embeddings...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("Embeddings loaded")

print("Loading Chroma...")
vectordb = Chroma(persist_directory="chroma_db", embedding_function=embeddings, collection_name="langchain")
print("Chroma loaded")

print("Searching...")
docs = vectordb.similarity_search("login", k=2)
print(f"Found {len(docs)} docs")
for d in docs:
    print("Content:", d.page_content[:100])
    print("Metadata:", d.metadata)
    print("---")
print("Done")