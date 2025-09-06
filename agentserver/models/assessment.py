from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime


class AssessmentMetadata(BaseModel):
    timestamp: datetime
    video_duration_seconds: int
    audio_quality_score: float
    video_quality_score: float
    face_detection_confidence: float
    analysis_version: str


class ScoreWithConfidence(BaseModel):
    frequency_score: float = None
    duration_consistency: float = None
    appropriateness_timing: float = None
    variability_score: float = None
    appropriateness_to_context: float = None
    intensity_modulation: float = None
    gesture_frequency: float = None
    gesture_coordination_with_speech: float = None
    body_language_appropriateness: float = None
    turn_taking_patterns: float = None
    response_timing: float = None
    initiation_behaviors: float = None
    intonation_variability: float = None
    rhythm_consistency: float = None
    stress_pattern_appropriateness: float = None
    volume_modulation: float = None
    pitch_range_utilization: float = None
    voice_quality_consistency: float = None
    echolalia_indicators: float = None
    repetitive_phrases: float = None
    literal_interpretation_markers: float = None
    conversational_flow: float = None
    topic_maintenance: float = None
    contextual_appropriateness: float = None
    motor_stereotypies: float = None
    vocal_stereotypies: float = None
    object_manipulation_patterns: float = None
    hyper_responsivity_indicators: float = None
    hypo_responsivity_indicators: float = None
    sensory_seeking_behaviors: float = None
    sustained_attention_duration: float = None
    attention_shifting_difficulty: float = None
    selective_attention_intensity: float = None
    emotional_regulation_indicators: float = None
    behavioral_flexibility: float = None
    stress_response_patterns: float = None
    social_skills_for_age: float = None
    communication_complexity: float = None
    behavioral_maturity: float = None
    confidence: float


class EyeContact(BaseModel):
    frequency_score: float
    duration_consistency: float
    appropriateness_timing: float
    confidence: float


class FacialExpressions(BaseModel):
    variability_score: float
    appropriateness_to_context: float
    intensity_modulation: float
    confidence: float


class NonverbalCommunication(BaseModel):
    gesture_frequency: float
    gesture_coordination_with_speech: float
    body_language_appropriateness: float
    confidence: float


class SocialReciprocity(BaseModel):
    turn_taking_patterns: float
    response_timing: float
    initiation_behaviors: float
    confidence: float


class SocialCommunicationMarkers(BaseModel):
    eye_contact: EyeContact
    facial_expressions: FacialExpressions
    nonverbal_communication: NonverbalCommunication
    social_reciprocity: SocialReciprocity


class Prosody(BaseModel):
    intonation_variability: float
    rhythm_consistency: float
    stress_pattern_appropriateness: float
    confidence: float


class VocalCharacteristics(BaseModel):
    volume_modulation: float
    pitch_range_utilization: float
    voice_quality_consistency: float
    confidence: float


class LanguagePatterns(BaseModel):
    echolalia_indicators: float
    repetitive_phrases: float
    literal_interpretation_markers: float
    confidence: float


class PragmaticLanguage(BaseModel):
    conversational_flow: float
    topic_maintenance: float
    contextual_appropriateness: float
    confidence: float


class SpeechLanguageMarkers(BaseModel):
    prosody: Prosody
    vocal_characteristics: VocalCharacteristics
    language_patterns: LanguagePatterns
    pragmatic_language: PragmaticLanguage


class RepetitiveBehaviors(BaseModel):
    motor_stereotypies: float
    vocal_stereotypies: float
    object_manipulation_patterns: float
    confidence: float


class SensoryResponses(BaseModel):
    hyper_responsivity_indicators: float
    hypo_responsivity_indicators: float
    sensory_seeking_behaviors: float
    confidence: float


class AttentionPatterns(BaseModel):
    sustained_attention_duration: float
    attention_shifting_difficulty: float
    selective_attention_intensity: float
    confidence: float


class SelfRegulation(BaseModel):
    emotional_regulation_indicators: float
    behavioral_flexibility: float
    stress_response_patterns: float
    confidence: float


class BehavioralObservationMarkers(BaseModel):
    repetitive_behaviors: RepetitiveBehaviors
    sensory_responses: SensoryResponses
    attention_patterns: AttentionPatterns
    self_regulation: SelfRegulation


class DevelopmentalAppropriateness(BaseModel):
    social_skills_for_age: float
    communication_complexity: float
    behavioral_maturity: float
    confidence: float


class AgeSpecificMarkers(BaseModel):
    estimated_age_group: Literal["toddler", "child", "adolescent", "adult"]
    developmental_appropriateness: DevelopmentalAppropriateness


class MaskingCompensationIndicators(BaseModel):
    effortful_social_behavior: float
    learned_response_patterns: float
    fatigue_indicators: float
    authenticity_vs_performance: float
    confidence: float


class ContextualFactors(BaseModel):
    environmental_stressors: float
    interaction_partner_familiarity: float
    task_complexity: float
    setting_formality: float


class DSM5AlignedScores(BaseModel):
    social_communication_deficits: float
    restricted_repetitive_behaviors: float
    early_onset_indicators: float
    functional_impairment: float


class SeverityEstimates(BaseModel):
    level_1_likelihood: float
    level_2_likelihood: float
    level_3_likelihood: float


class AggregateScores(BaseModel):
    dsm5_aligned_scores: DSM5AlignedScores
    severity_estimates: SeverityEstimates
    overall_autism_likelihood: float


class ReliabilityFactors(BaseModel):
    video_quality_impact: float
    audio_clarity_impact: float
    duration_adequacy: float
    interaction_naturalness: float


class UncertaintyAnalysis(BaseModel):
    overall_confidence: float
    data_sufficiency: float
    model_uncertainty: float
    conflicting_indicators: float
    reliability_factors: ReliabilityFactors


class DifferentialConsiderations(BaseModel):
    adhd_overlap_likelihood: float
    anxiety_masking_potential: float
    language_disorder_indicators: float
    intellectual_disability_markers: float
    cultural_linguistic_factors: float


class Recommendations(BaseModel):
    professional_evaluation_priority: Literal["low", "moderate", "high", "urgent"]
    suggested_next_steps: List[str]
    monitoring_areas: List[str]


class LimitationsDisclaimers(BaseModel):
    single_session_limitation: bool
    cultural_bias_potential: bool
    age_specific_validity: str
    comorbidity_considerations: bool
    professional_interpretation_required: bool


class AutismAssessmentResponse(BaseModel):
    assessment_metadata: AssessmentMetadata
    social_communication_markers: SocialCommunicationMarkers
    speech_language_markers: SpeechLanguageMarkers
    behavioral_observation_markers: BehavioralObservationMarkers
    age_specific_markers: AgeSpecificMarkers
    masking_compensation_indicators: MaskingCompensationIndicators
    contextual_factors: ContextualFactors
    aggregate_scores: AggregateScores
    uncertainty_analysis: UncertaintyAnalysis
    differential_considerations: DifferentialConsiderations
    recommendations: Recommendations
    limitations_disclaimers: LimitationsDisclaimers
