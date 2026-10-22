"""
FastAPI Router for Specialized Agents:
1. YouTube Searcher & Transcriber Agents
2. Map Searcher & Spatial Understanding Agent
3. Google Search Engine & Web Content Processor Agent
4. Image Processor & Visual Web Crawler Agent
5. Book Searcher & Online Reader Agent (Open Library, Google Books, Gutenberg, DOAB)
6. Link Data Reader & Continuous Online Book Ingestion Agent
7. Ethiopian Education & Biology Knowledge Endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any

from app.agents.specialized.youtube_agent import youtube_searcher_agent, youtube_transcriber_agent
from app.agents.specialized.map_agent import map_searcher_agent
from app.agents.specialized.search_engine_agent import search_engine_agent, GoogleSearchEngineAgent
from app.agents.specialized.image_processor_agent import image_processor_agent
from app.agents.specialized.book_searcher_agent import book_searcher_agent
from app.agents.specialized.link_book_reader_agent import link_book_reader_agent
from app.data.knowledge_seeder import knowledge_seeder
from app.data.ethiopian_education_history import ETHIOPIAN_EDUCATION_RECORDS
from app.data.ethiopian_biology_data import ETHIOPIAN_BIOLOGY_RECORDS
from app.api.routes.auth import get_token_from_header
from app.services.user_service import user_service

router = APIRouter(prefix="/api/agents", tags=["Specialized Agents & Knowledge"])

# Backwards compatibility alias
google_search_engine_agent = search_engine_agent

# -----------------
# Pydantic Schemas
# -----------------
class YouTubeSearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 6

class YouTubeTranscribeRequest(BaseModel):
    url_or_id: str
    title: Optional[str] = None

class MapSearchRequest(BaseModel):
    query: str

class GoogleSearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 4

class BookSearchRequest(BaseModel):
    query: str
    subject: Optional[str] = None
    limit: Optional[int] = 8

class ImageSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 8

class ImageUrlExtractRequest(BaseModel):
    url: str
    limit: Optional[int] = 8

class LinkReaderRequest(BaseModel):
    url: str
    title: Optional[str] = None


# -----------------
# 1. YouTube Agents
# -----------------
@router.post("/youtube/search")
def search_youtube_endpoint(req: YouTubeSearchRequest):
    """Searches YouTube videos with verified playable embed links, thumbnails, and channel metadata."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")
    videos = youtube_searcher_agent.search_videos(req.query, max_results=req.max_results or 6)
    return {
        "query": req.query,
        "count": len(videos),
        "videos": videos
    }

@router.post("/youtube/transcribe")
def transcribe_youtube_endpoint(req: YouTubeTranscribeRequest):
    """Extracts transcripts, parses timestamped chapters, summarizes, and indexes video data in PostgreSQL."""
    if not req.url_or_id.strip():
        raise HTTPException(status_code=400, detail="YouTube URL or Video ID is required.")
    res = youtube_transcriber_agent.transcribe_video(req.url_or_id, title=req.title)
    return res


# -----------------
# 2. Map Searcher Agent
# -----------------
@router.post("/maps/search")
def search_map_endpoint(req: MapSearchRequest):
    """Geolocates landmarks, coordinates, elevation, OpenStreetMap embed, and historical context."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Location query is required.")
    res = map_searcher_agent.search_location(req.query)
    return res


# -----------------
# 3. Google Search Engine Agent
# -----------------
@router.post("/google/search")
def search_google_endpoint(req: GoogleSearchRequest):
    """Searches Google/web, parses live Google News RSS, Wikipedia, and returns extracted text."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")
    res = search_engine_agent.search_and_extract(req.query, max_results=req.max_results or 4)
    return res


# -----------------
# 4. Book Searcher & Online Reader Agent
# -----------------
@router.post("/books/search")
def search_books_endpoint(req: BookSearchRequest):
    """Searches Open Library and Google Books API for online educational reading."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")
    books = book_searcher_agent.search_books(req.query, subject=req.subject, limit=req.limit or 8)
    return {
        "query": req.query,
        "count": len(books),
        "books": books
    }

@router.get("/books/read/gutenberg/{book_id}")
def read_gutenberg_endpoint(book_id: int):
    """Reads full plain text for a Project Gutenberg public domain book and indexes into PostgreSQL."""
    res = book_searcher_agent.read_gutenberg_book(book_id)
    return res

@router.get("/books/portals")
def get_book_portals_endpoint():
    """Returns the 12 curated educational online book portals."""
    return {
        "portals": book_searcher_agent.get_portals_reference()
    }


# -----------------
# 5. Image Processor & Vision Searcher Agent
# -----------------
@router.post("/image/search")
def search_images_endpoint(req: ImageSearchRequest):
    """Searches images across Wikimedia Commons API, Unsplash, and 40+ curated free photo directories."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")
    imgs = image_processor_agent.search_images(req.query, limit=req.limit or 8)
    return {
        "query": req.query,
        "count": len(imgs),
        "images": imgs
    }

@router.post("/image/process")
async def process_image_endpoint(
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    context_query: Optional[str] = Form(None)
):
    """Analyzes image with YOLOv8, extracts visual features, and crawls web for source origin."""
    image_bytes = None
    if image:
        image_bytes = await image.read()

    if not image_bytes and not image_url:
        raise HTTPException(status_code=400, detail="Either an uploaded image file or image_url is required.")

    res = image_processor_agent.process_image_and_sources(
        image_bytes=image_bytes,
        image_url=image_url,
        context_query=context_query
    )
    return res

@router.post("/image/extract-from-url")
def extract_images_from_url_endpoint(req: ImageUrlExtractRequest):
    """Crawls a live website and extracts content images with alt-text and page titles."""
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="Valid URL is required.")
    extracted = image_processor_agent.extract_images_from_url(req.url, limit=req.limit or 8)
    return {
        "url": req.url,
        "count": len(extracted),
        "images": extracted
    }

@router.get("/image/portals")
def get_image_portals_endpoint():
    """Returns the 40+ free image directories catalog."""
    return {
        "portals": image_processor_agent.get_free_directories()
    }


# -----------------
# 6. Link Data Reader & Continuous Online Book Ingestion
# -----------------
@router.post("/links/read")
def read_link_endpoint(
    req: LinkReaderRequest,
    token: Optional[str] = Depends(get_token_from_header)
):
    """Continuously ingests online books, articles, or papers by URL into PostgreSQL (BYTEA) and ChromaDB."""
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="Valid URL is required.")

    user_id = None
    if token:
        user = user_service.get_current_user_from_token(token)
        if user:
            user_id = user.get("id")

    res = link_book_reader_agent.read_and_ingest_link(
        url=req.url,
        custom_title=req.title,
        user_id=user_id
    )
    return res


# -----------------
# 7. Ethiopian Knowledge Archive Endpoints
# -----------------
@router.post("/knowledge/seed")
def seed_knowledge_endpoint(force: Optional[bool] = False):
    """Seeds Ethiopian Education History and Biological Dossiers into PostgreSQL and ChromaDB."""
    res = knowledge_seeder.seed_all(force=force)
    return res

@router.get("/knowledge/education")
def get_education_knowledge():
    """Returns curated Ethiopian history of education records."""
    return {
        "count": len(ETHIOPIAN_EDUCATION_RECORDS),
        "records": ETHIOPIAN_EDUCATION_RECORDS
    }

@router.get("/knowledge/biology")
def get_biology_knowledge():
    """Returns curated Ethiopian biological, botanical, and endemic fauna records."""
    return {
        "count": len(ETHIOPIAN_BIOLOGY_RECORDS),
        "records": ETHIOPIAN_BIOLOGY_RECORDS
    }

@router.get("/knowledge/stats")
def get_knowledge_stats():
    """Returns statistics on seeded knowledge, dossiers in PostgreSQL, and topics."""
    return {
        "education_dossiers": len(ETHIOPIAN_EDUCATION_RECORDS),
        "biology_dossiers": len(ETHIOPIAN_BIOLOGY_RECORDS),
        "total_records": len(ETHIOPIAN_EDUCATION_RECORDS) + len(ETHIOPIAN_BIOLOGY_RECORDS)
    }
