"""
Comprehensive Verification Test Suite for Specialized Agents & Knowledge Archive:
1. Ethiopian Education History & Biology Data Seeding
2. YouTube Searcher & Transcriber Agent
3. Map Searcher & Spatial Understanding Agent
4. Google Search Engine & Web Content Processor Agent
5. Image Processor & Visual Web Crawler Agent
6. Link Data Reader & Continuous Online Book Ingestion Agent
"""

import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== STARTING SPECIALIZED AGENTS & ETHIOPIAN KNOWLEDGE SUITE ===")

    # 1. Seed Ethiopian Knowledge into PostgreSQL & ChromaDB
    print("\n[1] Seeding Ethiopian Education & Biological Knowledge...")
    req = urllib.request.Request(f"{BASE_URL}/api/agents/knowledge/seed", data=b"{}", headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Seeding Result: Success={res.get('success')}, Education={res.get('education_records')}, Biology={res.get('biology_records')}, Storage={res.get('storage')}")
    assert res.get("success") is True

    # 2. Verify Knowledge Stats Endpoint
    print("\n[2] Verifying Knowledge Statistics...")
    req = urllib.request.Request(f"{BASE_URL}/api/agents/knowledge/stats")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Stats: Total={res.get('total_records')}, Education={res.get('education_dossiers')}, Biology={res.get('biology_dossiers')}")
    assert res.get("total_records") >= 20

    # 3. Test YouTube Searcher Agent
    print("\n[3] Testing YouTube Searcher Agent (Query: 'Ethiopian education history Saint Yared')...")
    payload = json.dumps({"query": "Ethiopian education history Saint Yared", "max_results": 3}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/youtube/search", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> YouTube Search: Count={res.get('count')}, First Title='{res.get('videos', [{}])[0].get('title')}'")
    assert res.get("count") > 0

    # 4. Test YouTube Transcriber Agent
    print("\n[4] Testing YouTube Transcriber Agent...")
    payload = json.dumps({"url_or_id": "e_XU2gPqN3w", "title": "History of Education in Ethiopia"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/youtube/transcribe", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> YouTube Transcribe: Segments={len(res.get('segments', []))}, StoredInPostgres={res.get('storedInPostgres')}")
    assert res.get("storedInPostgres") is True

    # 5. Test Map Searcher Agent (Geospatial grounding for Lalibela & Simien)
    print("\n[5] Testing Map Searcher Agent (Lalibela & Simien Mountains)...")
    payload = json.dumps({"query": "Rock-Hewn Churches of Lalibela"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/maps/search", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Map Result: Name='{res.get('locationName')}', Coords={res.get('coordinates')}, Category={res.get('category')}")
    assert "12.0319" in res.get("coordinates") or res.get("success") is True

    # 6. Test Google Search Engine Agent
    print("\n[6] Testing Google Search Engine & Web Content Processor...")
    payload = json.dumps({"query": "Walia ibex endangered endemic species Ethiopia", "max_results": 2}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/google/search", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Google Search: Extracted Sites Count={res.get('results_count')}")
    assert res.get("results_count") > 0

    # 7. Test Image Processor Agent
    print("\n[7] Testing Image Processor & Visual Web Crawler Agent...")
    payload = json.dumps({"context_query": "Simien Mountains Walia Ibex"}).encode()
    # Test via form data / url
    from urllib.parse import urlencode
    post_data = urlencode({"context_query": "Walia Ibex Capra walie", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Walia_ibex_%28Capra_walie%29_male.jpg/640px-Walia_ibex_%28Capra_walie%29_male.jpg"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/image/process", data=post_data, headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Image Processor: Visual Summary='{res.get('visualSummary')}', Sources Found={len(res.get('sourceWebsites', []))}")
    assert res.get("success") is True

    # 8. Test Link Data Reader Agent (Continuous Online Ingestion)
    print("\n[8] Testing Link Data Reader & Online Book Ingestion...")
    payload = json.dumps({
        "url": "https://en.wikipedia.org/wiki/Education_in_Ethiopia",
        "title": "Wikipedia: Education in Ethiopia History"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/agents/links/read", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f" -> Link Ingestion: TaskID={res.get('taskId')}, Words={res.get('wordCount')}, Chunks={res.get('chunksCount')}, StoredInPostgres={res.get('storedInPostgres')}")
    assert res.get("storedInPostgres") is True

    print("\n>>> ALL SPECIALIZED AGENTS & KNOWLEDGE ARCHIVE TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_tests()
