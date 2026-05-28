import os
import sys

# Ensure we can import from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from rag_pipeline import RAGPipeline

def main():
    print("=" * 60)
    print("Testing Local RAG Pipeline")
    print("=" * 60)

    rag = RAGPipeline(data_dir="data", chroma_dir="chroma_db")

    # Step 1: Load and chunk PDFs
    print("\n[1/4] Loading and chunking PDFs...")
    try:
        chunks = rag.load_and_chunk()
        print(f"  -> Created {len(chunks)} chunks.")
        print(f"  -> First chunk preview: {chunks[0]['content'][:200]}...")
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return

    # Step 2: Index into ChromaDB
    print("\n[2/4] Indexing chunks into ChromaDB with nomic-embed-text...")
    try:
        count = rag.index_documents()
        print(f"  -> Indexed {count} documents into ChromaDB.")
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return

    # Step 3: Similarity search
    query = "What are the product requirements for VWO?"
    print(f"\n[3/4] Testing similarity search for query: '{query}'")
    try:
        results = rag.similarity_search(query, k=3)
        print(f"  -> Retrieved {len(results)} chunks.")
        for i, (doc, score) in enumerate(results, 1):
            print(f"     {i}. Score={score:.4f} | {doc.metadata} | {doc.page_content[:150]}...")
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return

    # Step 4: Groq LLM generation
    print("\n[4/4] Generating answer via Groq LLM...")
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    if not api_key:
        print("  -> SKIP: GROQ_API_KEY not found in environment.")
        return

    try:
        answer = rag.generate_answer(query, results, api_key, model)
        print(f"  -> Model: {model}")
        print(f"  -> Answer:\n{answer}")
    except Exception as e:
        print(f"  -> ERROR: {e}")

    print("\n" + "=" * 60)
    print("Pipeline test complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
