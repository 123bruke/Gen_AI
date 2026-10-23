"""
Map Searcher & Geospatial Educational Explorer (map_searcher.py)
Filters keywords to resolve Ethiopian Ministry of Education headquarters, Regional Education Bureaus (REBs),
high schools, universities, national exam centers, and historical educational landmarks.
Generates structured GeoJSON features, coordinates, and OpenStreetMap interactive embeds for the frontend.
All queries and keyword filtering events are recorded in the visible log database.
"""

from typing import List, Dict, Any, Optional
import os
import re
import urllib.parse
from app.db.log_db import log_database

class EducationalMapSearcher:
    """
    Geospatial Educational Search Engine for Ethiopian Ministry of Education.
    Enables keyword filtering across regions, schools, universities, and exam centers.
    """

    def __init__(self):
        # Comprehensive Ethiopian Educational and Spatial Registry
        self.locations: List[Dict[str, Any]] = [
            {
                "id": "moe_hq_arada",
                "name": "FDRE Ministry of Education Headquarters (ትምህርት ሚኒስቴር)",
                "lat": 9.0345,
                "lng": 38.7525,
                "elevation_m": 2400,
                "region": "Addis Ababa",
                "subcity": "Arada",
                "category": "Federal Ministry Headquarters",
                "languages": ["Amharic", "English", "Afaan Oromoo"],
                "description": "National executive headquarters for general education, curriculum policy, teacher certification, and national examinations under Proclamation No. 1368/2025.",
                "keywords": ["moe", "ministry", "education", "headquarters", "arada", "addis ababa", "federal", "curriculum", "neaea"],
                "osm_url": "https://www.openstreetmap.org/#map=16/9.0345/38.7525",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7475,9.0295,38.7575,9.0395&layer=mapnik&marker=9.0345,38.7525"
            },
            {
                "id": "reb_oromia",
                "name": "Oromia Education Bureau (Biiroo Barnootaa Oromiyaa)",
                "lat": 8.5411,
                "lng": 39.2689,
                "elevation_m": 1712,
                "region": "Oromia",
                "city": "Adama / Finfinnee",
                "category": "Regional Education Bureau",
                "languages": ["Afaan Oromoo", "English", "Amharic"],
                "description": "Regional education administrative bureau coordinating primary, middle, and secondary schools, Afaan Oromoo curriculum materials, and regional educational zones.",
                "keywords": ["oromia", "biiroo barnootaa", "adama", "finfinnee", "afaan oromoo", "regional", "reb", "oromo"],
                "osm_url": "https://www.openstreetmap.org/#map=15/8.5411/39.2689",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=39.2589,8.5311,39.2789,8.5511&layer=mapnik&marker=8.5411,39.2689"
            },
            {
                "id": "reb_amhara",
                "name": "Amhara Education Bureau (የአማራ ክልል ትምህርት ቢሮ)",
                "lat": 11.5936,
                "lng": 37.3908,
                "elevation_m": 1800,
                "region": "Amhara",
                "city": "Bahir Dar",
                "category": "Regional Education Bureau",
                "languages": ["Amharic", "English"],
                "description": "Oversees secondary education, teacher capacity programs, and Grade 12 examination centers across North Gondar, South Wollo, Gojjam, and Shewa zones.",
                "keywords": ["amhara", "bahir dar", "ትምህርት ቢሮ", "gondar", "wollo", "gojjam", "reb"],
                "osm_url": "https://www.openstreetmap.org/#map=15/11.5936/37.3908",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=37.3808,11.5836,37.4008,11.6036&layer=mapnik&marker=11.5936,37.3908"
            },
            {
                "id": "reb_addis_ababa",
                "name": "Addis Ababa City Administration Education Bureau",
                "lat": 9.0180,
                "lng": 38.7490,
                "elevation_m": 2355,
                "region": "Addis Ababa",
                "subcity": "Kirkos",
                "category": "City Education Administration",
                "languages": ["Amharic", "Afaan Oromoo", "English"],
                "description": "Directs metropolitan secondary schools, early childhood centers, and digital student laptop distribution across all 11 sub-cities.",
                "keywords": ["addis ababa", "kirkos", "city", "bureau", "secondary", "school", "students"],
                "osm_url": "https://www.openstreetmap.org/#map=15/9.0180/38.7490",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7390,9.0080,38.7590,9.0280&layer=mapnik&marker=9.0180,38.7490"
            },
            {
                "id": "school_menelik_ii",
                "name": "Menelik II Senior Secondary School (ዳግማዊ ምኒልክ ትምህርት ቤት)",
                "lat": 9.0320,
                "lng": 38.7560,
                "elevation_m": 2380,
                "region": "Addis Ababa",
                "subcity": "Arada",
                "category": "Historic Senior Secondary & STEM Center",
                "languages": ["Amharic", "English"],
                "description": "Founded in 1908 by Emperor Menelik II as the first modern state school in Ethiopia; today operates as a premier high school and national examination cluster.",
                "keywords": ["menelik", "school", "1908", "history", "high school", "exam center", "arada"],
                "osm_url": "https://www.openstreetmap.org/#map=16/9.0320/38.7560",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7510,9.0270,38.7610,9.0370&layer=mapnik&marker=9.0320,38.7560"
            },
            {
                "id": "school_general_wingate",
                "name": "General Wingate Polytechnic & Secondary School",
                "lat": 9.0558,
                "lng": 38.7230,
                "elevation_m": 2420,
                "region": "Addis Ababa",
                "subcity": "Gullele",
                "category": "Senior Secondary & TVET Academy",
                "languages": ["English", "Amharic"],
                "description": "Historic elite secondary institution established in 1946; pioneering science, engineering, and national pre-university education in Ethiopia.",
                "keywords": ["wingate", "general wingate", "gullele", "high school", "polytechnic", "science"],
                "osm_url": "https://www.openstreetmap.org/#map=16/9.0558/38.7230",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7180,9.0508,38.7280,9.0608&layer=mapnik&marker=9.0558,38.7230"
            },
            {
                "id": "school_bole_secondary",
                "name": "Bole Senior Secondary School",
                "lat": 8.9950,
                "lng": 38.7890,
                "elevation_m": 2340,
                "region": "Addis Ababa",
                "subcity": "Bole",
                "category": "Public Secondary High School",
                "languages": ["English", "Amharic"],
                "description": "High-capacity secondary school and designated NEAEA national university entrance exam testing center serving Eastern Addis Ababa.",
                "keywords": ["bole", "high school", "secondary", "exam center", "students"],
                "osm_url": "https://www.openstreetmap.org/#map=16/8.9950/38.7890",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7840,8.9900,38.7940,9.0000&layer=mapnik&marker=8.9950,38.7890"
            },
            {
                "id": "univ_aau_sidist_kilo",
                "name": "Addis Ababa University (AAU Main Campus - Sidist Kilo)",
                "lat": 9.0483,
                "lng": 38.7617,
                "elevation_m": 2440,
                "region": "Addis Ababa",
                "subcity": "Yeka / Arada",
                "category": "Flagship Autonomous National University",
                "languages": ["English", "Amharic", "Afaan Oromoo"],
                "description": "Ethiopia's oldest and highest-ranked university (established 1950 as University College of Addis Ababa); national center for academic research, Institute of Ethiopian Studies, and graduate education.",
                "keywords": ["aau", "addis ababa university", "sidist kilo", "university", "higher education", "research"],
                "osm_url": "https://www.openstreetmap.org/#map=16/9.0483/38.7617",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7567,9.0433,38.7667,9.0533&layer=mapnik&marker=9.0483,38.7617"
            },
            {
                "id": "univ_jimma",
                "name": "Jimma University (Main Campus)",
                "lat": 7.6833,
                "lng": 36.8333,
                "elevation_m": 1780,
                "region": "Oromia",
                "city": "Jimma",
                "category": "Public Research University",
                "languages": ["Afaan Oromoo", "English", "Amharic"],
                "description": "Pioneering Community-Based Education (CBE) university recognized for medicine, public health, agriculture, and computational sciences.",
                "keywords": ["jimma", "jimma university", "ju", "oromia", "university", "cbe", "medicine"],
                "osm_url": "https://www.openstreetmap.org/#map=15/7.6833/36.8333",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=36.8233,7.6733,36.8433,7.6933&layer=mapnik&marker=7.6833,36.8333"
            },
            {
                "id": "univ_hawassa",
                "name": "Hawassa University (Main Campus)",
                "lat": 7.0500,
                "lng": 38.4833,
                "elevation_m": 1708,
                "region": "Sidama",
                "city": "Hawassa",
                "category": "Public Research University",
                "languages": ["Sidaamu Afoo", "English", "Amharic"],
                "description": "Comprehensive regional university near Lake Hawassa specializing in natural sciences, pedagogy, forestry, and health sciences.",
                "keywords": ["hawassa", "hawassa university", "hu", "sidama", "lake hawassa", "university"],
                "osm_url": "https://www.openstreetmap.org/#map=15/7.0500/38.4833",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.4733,7.0400,38.4933,7.0600&layer=mapnik&marker=7.0500,38.4833"
            },
            {
                "id": "univ_bahir_dar",
                "name": "Bahir Dar University (Polytechnic Campus)",
                "lat": 11.5980,
                "lng": 37.3850,
                "elevation_m": 1820,
                "region": "Amhara",
                "city": "Bahir Dar",
                "category": "Public Technology & Maritime University",
                "languages": ["Amharic", "English"],
                "description": "Prominent regional university on Lake Tana featuring the Ethiopian Maritime Academy, engineering institutes, and teacher education.",
                "keywords": ["bahir dar", "bdu", "tana", "blue nile", "polytechnic", "university"],
                "osm_url": "https://www.openstreetmap.org/#map=15/11.5980/37.3850",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=37.3750,11.5880,37.3950,11.6080&layer=mapnik&marker=11.5980,37.3850"
            },
            {
                "id": "univ_astu",
                "name": "Adama Science and Technology University (ASTU)",
                "lat": 8.5583,
                "lng": 39.2889,
                "elevation_m": 1640,
                "region": "Oromia",
                "city": "Adama",
                "category": "Center of Excellence in Applied Engineering",
                "languages": ["English", "Afaan Oromoo", "Amharic"],
                "description": "Specialized national science and technology university training students in mechanical, electrical, and computer engineering.",
                "keywords": ["astu", "adama", "science", "technology", "engineering", "stem", "oromia"],
                "osm_url": "https://www.openstreetmap.org/#map=15/8.5583/39.2889",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=39.2789,8.5483,39.2989,8.5683&layer=mapnik&marker=8.5583,39.2889"
            },
            {
                "id": "univ_gondar",
                "name": "University of Gondar (College of Medicine and Health Sciences)",
                "lat": 12.6075,
                "lng": 37.4589,
                "elevation_m": 2133,
                "region": "Amhara",
                "city": "Gondar",
                "category": "Historic Medical & Research University",
                "languages": ["Amharic", "English"],
                "description": "Founded in 1954 as the Public Health College and Training Center; renowned medical research faculty and university hospital.",
                "keywords": ["gondar", "university of gondar", "uog", "fasiledes", "medicine", "health"],
                "osm_url": "https://www.openstreetmap.org/#map=15/12.6075/37.4589",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=37.4489,12.5975,37.4689,12.6175&layer=mapnik&marker=12.6075,37.4589"
            },
            {
                "id": "univ_mekelle",
                "name": "Mekelle University (Arid Campus)",
                "lat": 13.4833,
                "lng": 39.4667,
                "elevation_m": 2084,
                "region": "Tigray",
                "city": "Mekelle",
                "category": "Public Research University",
                "languages": ["Tigrinya", "English", "Amharic"],
                "description": "Top research university known for dryland agriculture, biotechnology, geology, and Ayder Referral Hospital.",
                "keywords": ["mekelle", "mekelle university", "mu", "tigray", "agriculture", "arid"],
                "osm_url": "https://www.openstreetmap.org/#map=15/13.4833/39.4667",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=39.4567,13.4733,39.4767,13.4933&layer=mapnik&marker=13.4833,39.4667"
            },
            {
                "id": "neaea_exam_center",
                "name": "National Educational Assessment and Examinations Agency (NEAEA)",
                "lat": 9.0270,
                "lng": 38.7450,
                "elevation_m": 2360,
                "region": "Addis Ababa",
                "subcity": "Lideta",
                "category": "National Exam Administration Center",
                "languages": ["Amharic", "English", "Afaan Oromoo"],
                "description": "National agency responsible for administering Grade 12 Ethiopian Secondary School Leaving Certificate Examination (ESSLCE) and university placements.",
                "keywords": ["neaea", "exam", "esslce", "grade 12", "assessment", "lideta", "national examination"],
                "osm_url": "https://www.openstreetmap.org/#map=16/9.0270/38.7450",
                "embed_url": "https://www.openstreetmap.org/export/embed.html?bbox=38.7400,9.0220,38.7500,9.0320&layer=mapnik&marker=9.0270,38.7450"
            }
        ]

    def search_by_keyword(
        self,
        keyword: str,
        region: Optional[str] = None,
        category: Optional[str] = None,
        user_id: Optional[str] = "student_moe"
    ) -> Dict[str, Any]:
        """
        Filters educational and administrative locations by keyword, region, and category.
        Returns matching locations with coordinates, bounding boxes, and OpenStreetMap embeds.
        """
        clean_kw = keyword.strip().lower()
        tokens = [t for t in re.split(r"[\s,;]+", clean_kw) if len(t) > 1]

        results = []
        for loc in self.locations:
            score = 0
            haystack = (
                loc["name"].lower() + " " +
                loc["region"].lower() + " " +
                loc.get("city", "").lower() + " " +
                loc.get("subcity", "").lower() + " " +
                loc["category"].lower() + " " +
                loc["description"].lower() + " " +
                " ".join(loc["keywords"])
            )

            if not tokens:
                score = 1
            else:
                for token in tokens:
                    if token in haystack:
                        score += 2
                    for kw in loc["keywords"]:
                        if token in kw or kw in token:
                            score += 3

            # Apply region filter if specified
            if region and region.lower() not in loc["region"].lower():
                score = 0

            # Apply category filter if specified
            if category and category.lower() not in loc["category"].lower():
                score = 0

            if score > 0:
                results.append((score, loc))

        # Sort by relevance score
        results.sort(key=lambda x: x[0], reverse=True)
        matched_locs = [item[1] for item in results]

        # Convert to GeoJSON FeatureCollection
        geojson_features = []
        for loc in matched_locs:
            geojson_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [loc["lng"], loc["lat"]]
                },
                "properties": {
                    "id": loc["id"],
                    "name": loc["name"],
                    "region": loc["region"],
                    "category": loc["category"],
                    "elevation_m": loc.get("elevation_m"),
                    "languages": loc.get("languages", []),
                    "description": loc["description"],
                    "embed_url": loc.get("embed_url"),
                    "osm_url": loc.get("osm_url")
                }
            })

        summary = f"Found {len(matched_locs)} educational site(s) matching keyword '{keyword}'."

        # Audit query in visible log database
        log_database.record_event(
            event_type="MAP_KEYWORD_SEARCH",
            stage="MAP_SEARCHER",
            status="SUCCESS",
            user_id=user_id,
            payload={
                "keyword": keyword,
                "region_filter": region,
                "category_filter": category,
                "matches_count": len(matched_locs),
                "matched_locations": [l["name"] for l in matched_locs[:5]]
            }
        )

        return {
            "status": "success",
            "query": keyword,
            "region_filter": region,
            "category_filter": category,
            "count": len(matched_locs),
            "locations": matched_locs,
            "geojson": {
                "type": "FeatureCollection",
                "features": geojson_features
            },
            "summary": summary
        }

    def get_all_locations(self) -> List[Dict[str, Any]]:
        return self.locations

map_searcher = EducationalMapSearcher()
