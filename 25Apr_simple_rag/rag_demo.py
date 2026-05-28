import os
import json
from pathlib import Path

# Install required packages (run once):
# pip install nomic tqdm

# Path to the story document
STORY_PATH = Path(__file__).parent / "story.txt"

# Simple chunker – split the document into paragraphs (blank line separator)
def chunk_text(text: str, min_len: int = 100, max_len: int = 300) -> list[str]:
    """Split `text` into chunks whose length is between `min_len` and `max_len` characters.
    It first splits by double new‑lines (paragraphs) and then merges consecutive
    paragraphs until the length constraints are satisfied.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) + 1 <= max_len:
            current = f"{current}\n\n{para}" if current else para
        else:
            if current:
                chunks.append(current.strip())
            # If a single paragraph is larger than max_len, we still keep it as its own chunk
            current = para
    if current:
        chunks.append(current.strip())
    # Ensure each chunk meets the minimum length (merge with next if needed)
    merged: list[str] = []
    i = 0
    while i < len(chunks):
        cur = chunks[i]
        while len(cur) < min_len and i + 1 < len(chunks):
            cur = f"{cur}\n\n{chunks[i+1]}"
            i += 1
        merged.append(cur)
        i += 1
    return merged

def main():
    if not STORY_PATH.is_file():
        raise FileNotFoundError(f"Story file not found at {STORY_PATH}")
    raw_text = STORY_PATH.read_text(encoding="utf-8")
    chunks = chunk_text(raw_text)
    print("=== CHUNKS ===")
    for idx, chunk in enumerate(chunks, 1):
        print(f"--- Chunk {idx} (len={len(chunk)}) ---")
        # Safely print chunk handling any Unicode characters
        # Replace non‑breaking hyphen (U+2011) with regular hyphen
        safe_chunk = chunk.replace('\u2011', '-')
        print(safe_chunk)

        print()

    # Generate embeddings using Nomic Embed (requires internet access & API key if you have one)
    try:
        from nomic import embed
        # Embed each chunk – the function returns a list of vectors
        embeddings = embed.embed_documents(chunks, model="nomic-embed-qa:latest")
    except Exception as exc:
        print("Nomic package not available or failed to generate embeddings. Using dummy embeddings.")
        import numpy as np
        # Create a dummy 768‑dim vector for each chunk (common size for many models)
        embeddings = [np.random.rand(768).tolist() for _ in chunks]
        print("Generated dummy embeddings of dimension", len(embeddings[0]))
    # For demonstration we just print the shape of the first embedding
    print("Embedding dimension:", len(embeddings[0]))
    # Save embeddings and chunks to a JS file so it can be viewed locally without a server
    out_path = Path(__file__).parent / "chunks_data.js"
    data = [{"chunk": c, "embedding": e} for c, e in zip(chunks, embeddings)]
    out_path.write_text("const chunksData = " + json.dumps(data, indent=2) + ";", encoding="utf-8")
    print(f"Saved {len(chunks)} chunks with embeddings to {out_path}")

if __name__ == "__main__":
    main()
