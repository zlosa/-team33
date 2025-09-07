import sys
import pathlib
import types
from fastapi.testclient import TestClient

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

pydantic_ai_stub = types.ModuleType("pydantic_ai")


class DummyAgent:
    def __init__(self, *args, **kwargs):
        pass

    async def run(self, prompt):
        raise NotImplementedError


pydantic_ai_stub.Agent = DummyAgent
sys.modules.setdefault("pydantic_ai", pydantic_ai_stub)

dotenv_stub = types.ModuleType("dotenv")
dotenv_stub.load_dotenv = lambda: None
sys.modules.setdefault("dotenv", dotenv_stub)

import main
from agents import analyzer


client = TestClient(main.app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_analyze_endpoint(monkeypatch):
    sample = analyzer._create_mock_response()

    async def fake_analyze(conversation_data, hume_data):
        return sample

    monkeypatch.setattr(main, "analyze", fake_analyze)

    payload = {"conversation_data": {}, "hume_data": {}}
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_autism_likelihood"] == sample.overall_autism_likelihood
