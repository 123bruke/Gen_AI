"""
Pytest Configuration and Fixtures for VisionRAG
"""

import sys
import os
import pytest

# Ensure backend root is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Disable heavy network/hub lookups during automated tests
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["ENABLE_HEAVY_TRANSFORMERS"] = "false"

@pytest.fixture(scope="session")
def test_client():
    from app.main import app
    from fastapi.testclient import TestClient
    return TestClient(app)

@pytest.fixture
def sample_ethiopian_query():
    return "What is the fleet size and hub of Ethiopian Airlines?"

@pytest.fixture
def sample_math_query():
    return "Calculate 1500 * 1.15 for growth projection"
