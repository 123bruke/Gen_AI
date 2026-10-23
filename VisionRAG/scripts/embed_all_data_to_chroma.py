"""
Full Data Embedding & ChromaDB Population Script.
Embeds all documents, educational catalogs, exam prep notes, textbooks, and video transcripts
into ChromaDB (vector collection: ethiopia_multimodal_knowledge).
"""

import sys
import os
import glob
import json
import uuid

# Ensure backend is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.rag.embeddings import embedding_service
from app.db.chroma_client import chroma_store
from app.db.log_db import log_database

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DOCS_DIR = os.path.join(DATA_DIR, "raw", "documents")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
ANNOTATIONS_DIR = os.path.join(DATA_DIR, "annotations")
VIDEOS_DIR = os.path.join(DATA_DIR, "raw", "videos")

def chunk_text(text: str, chunk_size: int = 600) -> list:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    curr = []
    curr_len = 0
    for p in paragraphs:
        if curr_len + len(p) > chunk_size and curr:
            chunks.append("\n\n".join(curr))
            curr = [p]
            curr_len = len(p)
        else:
            curr.append(p)
            curr_len += len(p) + 2
    if curr:
        chunks.append("\n\n".join(curr))
    return chunks

def embed_all_educational_data():
    print("=" * 60)
    print("INGESTING & EMBEDDING ALL EDUCATIONAL DATA INTO CHROMADB")
    print("=" * 60)

    total_embedded = 0

    # 1. Embed Raw Documents (Markdown, Text)
    doc_files = glob.glob(os.path.join(DOCS_DIR, "*.*"))
    print(f"\n[-] Embedding {len(doc_files)} raw policy & curriculum documents...")
    for fpath in doc_files:
        fname = os.path.basename(fpath)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
            content = fp.read()
        chunks = chunk_text(content, chunk_size=700)
        for idx, ch in enumerate(chunks[:25]):  # Up to 25 chunks per doc
            doc_id = f"doc_{fname}_{idx}_{uuid.uuid4().hex[:6]}"
            emb = embedding_service.embed_query(ch)
            chroma_store.add_item(
                item_id=doc_id,
                embedding=emb,
                document=ch,
                metadata={"source": "moe_documents", "filename": fname, "chunk": idx}
            )
            total_embedded += 1
        print(f"  + Indexed '{fname}' ({len(chunks)} chunks)")

    # 2. Embed Processed Educational Catalogs (Textbooks, Websites, Notes, Videos)
    proc_files = glob.glob(os.path.join(PROCESSED_DIR, "*.json"))
    print(f"\n[-] Embedding {len(proc_files)} processed educational catalogs...")
    for fpath in proc_files:
        fname = os.path.basename(fpath)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
            data = json.load(fp)

        # Iterate over records or chunk json representation
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            # Extract list values
            items = []
            for k, v in data.items():
                if isinstance(v, list):
                    items.extend(v)
            if not items:
                items = [data]
        else:
            items = []

        for idx, item in enumerate(items[:60]):
            text_repr = json.dumps(item, indent=2, ensure_ascii=False)
            emb = embedding_service.embed_query(text_repr[:800])
            cat_id = f"cat_{fname}_{idx}_{uuid.uuid4().hex[:6]}"
            chroma_store.add_item(
                item_id=cat_id,
                embedding=emb,
                document=text_repr[:1200],
                metadata={"source": "educational_catalogs", "filename": fname, "item_index": idx}
            )
            total_embedded += 1
        print(f"  + Indexed catalog '{fname}' ({len(items)} items)")

    # 3. Embed Annotations
    ann_files = glob.glob(os.path.join(ANNOTATIONS_DIR, "*.json"))
    print(f"\n[-] Embedding {len(ann_files)} multimodal annotations...")
    for fpath in ann_files:
        fname = os.path.basename(fpath)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
            data = json.load(fp)
        items = data if isinstance(data, list) else [data]
        for idx, item in enumerate(items[:40]):
            text_repr = json.dumps(item, indent=2, ensure_ascii=False)
            emb = embedding_service.embed_query(text_repr[:800])
            ann_id = f"ann_{fname}_{idx}_{uuid.uuid4().hex[:6]}"
            chroma_store.add_item(
                item_id=ann_id,
                embedding=emb,
                document=text_repr[:1000],
                metadata={"source": "annotations", "filename": fname}
            )
            total_embedded += 1
        print(f"  + Indexed annotations '{fname}'")

    print("\n" + "=" * 60)
    print(f"CHROMADB EMBEDDING COMPLETE: {total_embedded} total chunks indexed!")
    print(f"ChromaDB total vectors in store: {chroma_store.collection.count()}")
    print("=" * 60)

    # Log to visible database
    log_database.record_event(
        event_type="CHROMADB_MASS_EMBEDDING_COMPLETE",
        stage="CHROMA_EMBEDDER",
        status="SUCCESS",
        user_id="data_processor",
        payload={
            "total_new_vectors_indexed": total_embedded,
            "total_vectors_in_store": chroma_store.collection.count()
        }
    )

if __name__ == "__main__":
    embed_all_educational_data()
