import urllib.request
import json

def test_endpoints():
    print("--- 1. Testing /health ---")
    req = urllib.request.urlopen("http://localhost:8000/health")
    print("Health Status:", req.status, req.read().decode())

    print("\n--- 2. Testing Static Images ---")
    img_names = [
        "mathematics_algebra_quadratic_function_parabola.png",
        "physics_newton_laws_force_vectors.png",
        "biology_cell_organelles_and_photosynthesis.png"
    ]
    for name in img_names:
        url = f"http://localhost:8000/images/{name}"
        r = urllib.request.urlopen(url)
        print(f"Image {name}: status={r.status}, size={len(r.read())} bytes")

    print("\n--- 3. Testing POST /api/chat (Math Quadratic Equation) ---")
    chat_payload = {
        "query": "Solve the quadratic equation 2x^2 + 5x - 3 = 0 using the quadratic formula",
        "settings": {"geminiApiKey": ""}
    }
    chat_req = urllib.request.Request(
        "http://localhost:8000/api/chat",
        data=json.dumps(chat_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    chat_res = urllib.request.urlopen(chat_req, timeout=30)
    data = json.loads(chat_res.read().decode("utf-8"))
    
    answer = data.get("response", "")
    print(f"\nResponse excerpt:\n{answer[:400]}...")
    
    has_unprompted_history = any(term in answer.lower() for term in ["d'mt", "st. yared", "saint yared", "lucy / dinkinesh", "3.2 million years"])
    print(f"\nUnprompted Ancient History present? {has_unprompted_history}")

    images = data.get("images", [])
    print(f"\nImages returned ({len(images)}):")
    for img in images[:3]:
        print(f"  - Title: {img.get('title')}, URL: {img.get('url')}")

    videos = data.get("youtube_videos", [])
    print(f"\nYouTube Videos returned ({len(videos)}):")
    for vid in videos[:3]:
        print(f"  - Title: {vid.get('title')}, URL: {vid.get('url')}, Embed: {vid.get('embedUrl')}")

if __name__ == "__main__":
    test_endpoints()
