"""
Map Search & Geospatial Educational API Routes
Exposes keyword search and GeoJSON location endpoints for frontend mapping components.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Query
from app.vision.map_searcher import map_searcher

router = APIRouter(prefix="/api/map", tags=["Educational Geospatial Map"])

@router.get("/search")
def search_map_locations(
    keyword: str = Query(..., description="Search keyword e.g. 'Addis Ababa', 'Jimma', 'Menelik', 'MOE', 'University'"),
    region: Optional[str] = Query(None, description="Filter by region e.g. 'Oromia', 'Amhara', 'Addis Ababa'"),
    category: Optional[str] = Query(None, description="Filter by category e.g. 'University', 'Secondary', 'Bureau'"),
    user_id: Optional[str] = Query("student_moe", description="User identifier for audit logging")
) -> Dict[str, Any]:
    """
    Search educational landmarks and institutions in Ethiopia by keyword.
    Returns list of locations, GeoJSON feature collection, and interactive map embed URLs.
    """
    return map_searcher.search_by_keyword(
        keyword=keyword,
        region=region,
        category=category,
        user_id=user_id
    )

@router.get("/locations")
def list_all_map_locations() -> Dict[str, Any]:
    """
    Returns all registered educational bureaus, universities, and schools with spatial coordinates.
    """
    locations = map_searcher.get_all_locations()
    return {
        "status": "success",
        "total": len(locations),
        "locations": locations
    }
