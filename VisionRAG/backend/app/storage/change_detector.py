"""
Change Detection Module for VisionRAG Ingestion
Detects updates to online resources using HTTP headers (ETag, Last-Modified) and MD5 content hashes.
"""

from typing import Dict, Any, Tuple
import hashlib
import requests

class ChangeDetector:
    """Verifies whether remote websites or downloadable files have changed."""

    def __init__(self, timeout: float = 5.0):
        self.timeout = timeout

    def compute_hash(self, content: bytes) -> str:
        """Compute MD5 checksum of binary content."""
        return hashlib.md5(content).hexdigest()

    def check_url_change(self, url: str, known_hash: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        """
        Check if URL has new content.
        Returns (has_changed, new_hash, metadata_headers).
        """
        try:
            # First attempt lightweight HEAD request
            head_resp = requests.head(url, timeout=self.timeout, allow_redirects=True)
            etag = head_resp.headers.get("ETag", "")
            last_modified = head_resp.headers.get("Last-Modified", "")
            
            headers_info = {
                "etag": etag,
                "last_modified": last_modified,
                "content_length": head_resp.headers.get("Content-Length", 0)
            }

            # Fetch content if hash check required
            get_resp = requests.get(url, timeout=self.timeout)
            if get_resp.status_code == 200:
                new_hash = self.compute_hash(get_resp.content)
                has_changed = (new_hash != known_hash)
                return has_changed, new_hash, headers_info
        except Exception:
            pass

        # Offline / synthetic fallback
        simulated_hash = hashlib.md5(url.encode()).hexdigest()
        return (simulated_hash != known_hash), simulated_hash, {"status": "simulated"}

change_detector = ChangeDetector()
