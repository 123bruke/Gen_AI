import urllib.request
import json

def test_queries():
    queries = [
        "Explain Newton's third law of motion with action-reaction force pairs",
        "How does photosynthesis produce glucose inside plant cells?"
    ]
    
    for q in queries:
        print(f"\n==========================================")
        print(f"QUERY: {q}")
        print(f"==========================================")
        chat_payload = {
            "query": q,
            "settings": {"geminiApiKey": ""}
        }
        chat_req = urllib.request.Request(
            "http://localhost:8000/api/chat",
            data=json.dumps(chat_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        chat_res = urllib.request.urlopen(chat_req, timeout=30)
        data = json.loads(chat_res.read().decode("utf-8"))

        answer = data.get("text", "")
        print(f"\nAnswer Excerpt:\n{answer[:350]}...\n")
        
        has_history = any(term in answer.lower() for term in ["d'mt", "st. yared", "saint yared", "lucy / dinkinesh", "3.2 million years"])
        print(f"Unprompted History: {has_history}")

        mm = data.get("multimodal", {})
        images = mm.get("images", [])
        print(f"Images ({len(images)}):")
        for img in images[:3]:
            print(f"  * {img.get('title')} -> {img.get('url')}")

        videos = mm.get("videos", [])
        print(f"Videos ({len(videos)}):")
        for vid in videos[:3]:
            print(f"  * {vid.get('title')} -> {vid.get('embedUrl')}")

if __name__ == "__main__":
    test_queries()
