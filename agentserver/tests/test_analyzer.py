import sys
import pathlib
import types
import asyncio

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

pydantic_ai_stub = types.ModuleType("pydantic_ai")


class DummyAgent:
    def __init__(self, *args, **kwargs):
        pass

    async def run(self, prompt):
        raise NotImplementedError


pydantic_ai_stub.Agent = DummyAgent
sys.modules.setdefault("pydantic_ai", pydantic_ai_stub)

from agents import analyzer
from models.flat_assessment import FlatAutismAssessment


def test_create_mock_response_structure():
    response = analyzer._create_mock_response()
    assert isinstance(response, FlatAutismAssessment)
    assert 0 <= response.eye_contact_score <= 1
    assert 0 <= response.overall_autism_likelihood <= 1


def test_analyze_fallback_called(monkeypatch):
    async def failing_run(prompt):
        raise RuntimeError("boom")

    sentinel = analyzer._create_mock_response()

    dummy_agent = types.SimpleNamespace(run=failing_run)
    monkeypatch.setattr(analyzer, "autism_agent", dummy_agent)
    monkeypatch.setattr(analyzer, "_create_mock_response", lambda: sentinel)

    result = asyncio.run(analyzer.analyze({}, {}))
    assert result is sentinel


def test_analyze_success(monkeypatch):
    sample = analyzer._create_mock_response()

    class DummyAgent:
        async def run(self, prompt):
            return types.SimpleNamespace(data=sample)

    monkeypatch.setattr(analyzer, "autism_agent", DummyAgent())

    result = asyncio.run(analyzer.analyze({}, {}))
    assert result is sample
