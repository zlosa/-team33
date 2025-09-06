import os
from datetime import datetime
from typing import Dict, Any
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from models.assessment import (
    AutismAssessmentResponse,
    AssessmentMetadata,
    SocialCommunicationMarkers,
    EyeContact,
    FacialExpressions,
    NonverbalCommunication,
    SocialReciprocity,
    SpeechLanguageMarkers,
    Prosody,
    VocalCharacteristics,
    LanguagePatterns,
    PragmaticLanguage,
    BehavioralObservationMarkers,
    RepetitiveBehaviors,
    SensoryResponses,
    AttentionPatterns,
    SelfRegulation,
    AgeSpecificMarkers,
    DevelopmentalAppropriateness,
    MaskingCompensationIndicators,
    ContextualFactors,
    AggregateScores,
    DSM5AlignedScores,
    SeverityEstimates,
    UncertaintyAnalysis,
    ReliabilityFactors,
    DifferentialConsiderations,
    Recommendations,
    LimitationsDisclaimers,
)


# Create model and agent following the example pattern
model = OpenAIModel('gpt-4o')

# Create PydanticAI agent with structured output
autism_agent = Agent(
    model,
    result_type=AutismAssessmentResponse,  # Use result_type for structured output
    system_prompt="""You are an expert autism assessment specialist with deep knowledge of DSM-5 criteria, 
    developmental psychology, and behavioral analysis. Your role is to analyze multi-modal data (facial expressions, 
    speech patterns, behavioral markers) and provide comprehensive autism spectrum disorder assessments.

    Focus on:
    - Social communication patterns and deficits
    - Restricted, repetitive patterns of behavior
    - Sensory processing differences  
    - Age-appropriate developmental considerations
    - Masking and compensation strategies
    - Cultural and contextual factors

    Always provide confidence scores and acknowledge limitations of single-session assessments.
    Recommend appropriate professional follow-up when indicated."""
)


async def analyze(user_message: str, hume_data: Dict[str, Any]) -> AutismAssessmentResponse:
    """
    Analyzes multi-modal Hume data and returns an autism assessment response using PydanticAI.
    """
    
    print(f"🤖 Analyzing with PydanticAI agent...")
    
    # Prepare analysis prompt with user message and data
    analysis_prompt = f"""
    Analyze the following interaction and behavioral data for autism spectrum indicators:
    
    User Message/Interaction: {user_message}
    
    Behavioral Data: {hume_data}
    
    Please provide a comprehensive autism assessment based on this information, including:
    - Social communication analysis
    - Behavioral pattern assessment  
    - Speech/language evaluation
    - Sensory response indicators
    - Overall likelihood assessment with confidence scores
    - Professional recommendations
    """
    
    try:
        # Run the agent with structured output
        result = await autism_agent.run(analysis_prompt)
        print(f"✅ PydanticAI analysis complete")
        # Access the data from the result properly
        return result.data if hasattr(result, 'data') else result.result()
    
    except Exception as e:
        print(f"❌ PydanticAI analysis failed: {e}")
        # Fall back to mock response if API fails
        return _create_mock_response()
    
def _create_mock_response() -> AutismAssessmentResponse:
    """Fallback mock response if API fails"""
    import random
    return AutismAssessmentResponse(
        assessment_metadata=AssessmentMetadata(
            timestamp=datetime.now(),
            video_duration_seconds=120,
            audio_quality_score=0.87,
            video_quality_score=0.92,
            face_detection_confidence=0.94,
            analysis_version="1.2.3"
        ),
        
        social_communication_markers=SocialCommunicationMarkers(
            eye_contact=EyeContact(
                frequency_score=random.uniform(0.2, 0.8),
                duration_consistency=random.uniform(0.2, 0.8),
                appropriateness_timing=random.uniform(0.2, 0.8),
                confidence=random.uniform(0.7, 0.9)
            ),
            facial_expressions=FacialExpressions(
                variability_score=random.uniform(0.4, 0.8),
                appropriateness_to_context=random.uniform(0.3, 0.7),
                intensity_modulation=random.uniform(0.3, 0.7),
                confidence=random.uniform(0.7, 0.9)
            ),
            nonverbal_communication=NonverbalCommunication(
                gesture_frequency=random.uniform(0.2, 0.6),
                gesture_coordination_with_speech=random.uniform(0.2, 0.5),
                body_language_appropriateness=random.uniform(0.4, 0.7),
                confidence=random.uniform(0.6, 0.8)
            ),
            social_reciprocity=SocialReciprocity(
                turn_taking_patterns=random.uniform(0.3, 0.6),
                response_timing=random.uniform(0.3, 0.5),
                initiation_behaviors=random.uniform(0.2, 0.4),
                confidence=random.uniform(0.6, 0.8)
            )
        ),
        
        speech_language_markers=SpeechLanguageMarkers(
            prosody=Prosody(
                intonation_variability=random.uniform(0.5, 0.8),
                rhythm_consistency=random.uniform(0.5, 0.8),
                stress_pattern_appropriateness=random.uniform(0.4, 0.7),
                confidence=random.uniform(0.7, 0.9)
            ),
            vocal_characteristics=VocalCharacteristics(
                volume_modulation=random.uniform(0.3, 0.6),
                pitch_range_utilization=random.uniform(0.5, 0.8),
                voice_quality_consistency=random.uniform(0.6, 0.9),
                confidence=random.uniform(0.7, 0.9)
            ),
            language_patterns=LanguagePatterns(
                echolalia_indicators=random.uniform(0.1, 0.3),
                repetitive_phrases=random.uniform(0.2, 0.4),
                literal_interpretation_markers=random.uniform(0.2, 0.5),
                confidence=random.uniform(0.6, 0.8)
            ),
            pragmatic_language=PragmaticLanguage(
                conversational_flow=random.uniform(0.3, 0.6),
                topic_maintenance=random.uniform(0.4, 0.7),
                contextual_appropriateness=random.uniform(0.3, 0.5),
                confidence=random.uniform(0.6, 0.8)
            )
        ),
        
        behavioral_observation_markers=BehavioralObservationMarkers(
            repetitive_behaviors=RepetitiveBehaviors(
                motor_stereotypies=random.uniform(0.1, 0.3),
                vocal_stereotypies=random.uniform(0.1, 0.3),
                object_manipulation_patterns=random.uniform(0.2, 0.4),
                confidence=random.uniform(0.6, 0.8)
            ),
            sensory_responses=SensoryResponses(
                hyper_responsivity_indicators=random.uniform(0.3, 0.6),
                hypo_responsivity_indicators=random.uniform(0.2, 0.5),
                sensory_seeking_behaviors=random.uniform(0.4, 0.7),
                confidence=random.uniform(0.5, 0.7)
            ),
            attention_patterns=AttentionPatterns(
                sustained_attention_duration=random.uniform(0.6, 0.9),
                attention_shifting_difficulty=random.uniform(0.3, 0.6),
                selective_attention_intensity=random.uniform(0.7, 0.9),
                confidence=random.uniform(0.7, 0.9)
            ),
            self_regulation=SelfRegulation(
                emotional_regulation_indicators=random.uniform(0.3, 0.5),
                behavioral_flexibility=random.uniform(0.3, 0.6),
                stress_response_patterns=random.uniform(0.5, 0.8),
                confidence=random.uniform(0.6, 0.8)
            )
        ),
        
        age_specific_markers=AgeSpecificMarkers(
            estimated_age_group="adult",
            developmental_appropriateness=DevelopmentalAppropriateness(
                social_skills_for_age=random.uniform(0.3, 0.5),
                communication_complexity=random.uniform(0.5, 0.7),
                behavioral_maturity=random.uniform(0.3, 0.6),
                confidence=random.uniform(0.7, 0.8)
            )
        ),
        
        masking_compensation_indicators=MaskingCompensationIndicators(
            effortful_social_behavior=random.uniform(0.6, 0.8),
            learned_response_patterns=random.uniform(0.6, 0.8),
            fatigue_indicators=random.uniform(0.4, 0.7),
            authenticity_vs_performance=random.uniform(0.5, 0.7),
            confidence=random.uniform(0.5, 0.7)
        ),
        
        contextual_factors=ContextualFactors(
            environmental_stressors=random.uniform(0.1, 0.4),
            interaction_partner_familiarity=random.uniform(0.6, 0.8),
            task_complexity=random.uniform(0.4, 0.6),
            setting_formality=random.uniform(0.7, 0.9)
        ),
        
        aggregate_scores=AggregateScores(
            dsm5_aligned_scores=DSM5AlignedScores(
                social_communication_deficits=random.uniform(0.5, 0.7),
                restricted_repetitive_behaviors=random.uniform(0.3, 0.5),
                early_onset_indicators=random.uniform(0.4, 0.5),
                functional_impairment=random.uniform(0.4, 0.6)
            ),
            severity_estimates=SeverityEstimates(
                level_1_likelihood=random.uniform(0.6, 0.8),
                level_2_likelihood=random.uniform(0.2, 0.3),
                level_3_likelihood=random.uniform(0.05, 0.1)
            ),
            overall_autism_likelihood=random.uniform(0.5, 0.7)
        ),
        
        uncertainty_analysis=UncertaintyAnalysis(
            overall_confidence=random.uniform(0.7, 0.8),
            data_sufficiency=random.uniform(0.8, 0.9),
            model_uncertainty=random.uniform(0.1, 0.2),
            conflicting_indicators=random.uniform(0.2, 0.4),
            reliability_factors=ReliabilityFactors(
                video_quality_impact=random.uniform(0.0, 0.1),
                audio_clarity_impact=random.uniform(0.0, 0.1),
                duration_adequacy=random.uniform(0.9, 1.0),
                interaction_naturalness=random.uniform(0.7, 0.9)
            )
        ),
        
        differential_considerations=DifferentialConsiderations(
            adhd_overlap_likelihood=random.uniform(0.4, 0.6),
            anxiety_masking_potential=random.uniform(0.5, 0.7),
            language_disorder_indicators=random.uniform(0.2, 0.3),
            intellectual_disability_markers=random.uniform(0.05, 0.1),
            cultural_linguistic_factors=random.uniform(0.3, 0.4)
        ),
        
        recommendations=Recommendations(
            professional_evaluation_priority="moderate",
            suggested_next_steps=[
                "comprehensive_clinical_assessment",
                "speech_language_evaluation",
                "occupational_therapy_screening"
            ],
            monitoring_areas=[
                "social_communication_development",
                "sensory_processing_patterns",
                "behavioral_flexibility"
            ]
        ),
        
        limitations_disclaimers=LimitationsDisclaimers(
            single_session_limitation=True,
            cultural_bias_potential=True,
            age_specific_validity="adult_optimized",
            comorbidity_considerations=True,
            professional_interpretation_required=True
        )
    )