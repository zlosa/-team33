from pydantic import BaseModel, Field
from typing import Literal


class SimplifiedAutismAssessment(BaseModel):
    """Simplified autism assessment response that works with Gemini's schema constraints"""

    # Core assessment scores (0.0 to 1.0)
    overall_autism_likelihood: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall likelihood of autism spectrum disorder",
    )
    assessment_confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence in this assessment"
    )

    # Key domain scores
    social_communication_score: float = Field(
        ..., ge=0.0, le=1.0, description="Social communication difficulties"
    )
    repetitive_behaviors_score: float = Field(
        ..., ge=0.0, le=1.0, description="Restricted and repetitive behaviors"
    )
    sensory_processing_score: float = Field(
        ..., ge=0.0, le=1.0, description="Sensory processing differences"
    )

    # Support level estimate
    support_level: Literal["minimal", "substantial", "very_substantial"] = Field(
        ..., description="Estimated support needs level"
    )

    # Professional recommendation
    evaluation_priority: Literal["low", "moderate", "high", "urgent"] = Field(
        ..., description="Priority for professional evaluation"
    )

    # Key observations (text summaries)
    primary_concerns: str = Field(..., description="Main areas of concern identified")
    strengths_noted: str = Field(
        ..., description="Strengths and positive behaviors observed"
    )
    recommendations: str = Field(..., description="Next steps and recommendations")

    # Assessment limitations
    data_quality: Literal["poor", "fair", "good", "excellent"] = Field(
        ..., description="Quality of input data"
    )
    limitations: str = Field(..., description="Key limitations of this assessment")
