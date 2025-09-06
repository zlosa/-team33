import sys
import pathlib
import types
import asyncio
import pytest

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
from models.assessment import AutismAssessmentResponse


def test_create_mock_response_structure():
    response = analyzer._create_mock_response()
    assert isinstance(response, AutismAssessmentResponse)
    eye = response.social_communication_markers.eye_contact
    assert 0 <= eye.frequency_score <= 1
    assert 0 <= response.aggregate_scores.overall_autism_likelihood <= 1


def test_analyze_fallback_called(monkeypatch):
    async def failing_run(prompt):
        raise RuntimeError("boom")

    sentinel = analyzer._create_mock_response()

    monkeypatch.setattr(analyzer.autism_agent, "run", failing_run)
    monkeypatch.setattr(analyzer, "_create_mock_response", lambda: sentinel)

    result = asyncio.run(analyzer.analyze({}, {}))
    assert result is sentinel
