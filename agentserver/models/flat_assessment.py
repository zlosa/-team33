from pydantic import BaseModel
from typing import Literal


class FlatAutismAssessment(BaseModel):
    """Flattened autism assessment response with minimal nesting for Gemini compatibility"""

    # Basic metadata
    session_id: str
    timestamp: str
    analysis_version: str = "1.0"

    # Core scores (all 0.0 to 1.0)
    overall_autism_likelihood: float
    assessment_confidence: float

    # Main domain scores
    social_communication_score: float
    repetitive_behaviors_score: float
    sensory_processing_score: float

    # Key behavioral indicators
    eye_contact_score: float
    facial_expression_score: float
    prosody_score: float
    vocal_characteristics_score: float

    # DSM-5 aligned scores
    social_communication_deficits: float
    restricted_repetitive_behaviors: float
    functional_impairment: float

    # Support level and recommendations
    support_level: Literal["level_1", "level_2", "level_3"]
    evaluation_priority: Literal["low", "moderate", "high", "urgent"]

    # Text summaries
    primary_concerns: str
    observed_strengths: str
    key_recommendations: str
    assessment_limitations: str
