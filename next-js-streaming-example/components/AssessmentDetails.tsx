import React from "react";

interface AssessmentData {
  [key: string]: any;
}

const LABELS: Record<string, string> = {
  overall_autism_likelihood: "Overall Autism Likelihood",
  assessment_confidence: "Assessment Confidence",
  social_communication_score: "Social Communication Score",
  repetitive_behaviors_score: "Repetitive Behaviors Score",
  sensory_processing_score: "Sensory Processing Score",
  eye_contact_score: "Eye Contact Score",
  facial_expression_score: "Facial Expression Score",
  prosody_score: "Prosody Score",
  vocal_characteristics_score: "Vocal Characteristics Score",
  social_communication_deficits: "Social Communication Deficits",
  restricted_repetitive_behaviors: "Restricted Repetitive Behaviors",
  functional_impairment: "Functional Impairment",
  support_level: "Support Level",
  evaluation_priority: "Evaluation Priority",
  primary_concerns: "Primary Concerns",
  observed_strengths: "Observed Strengths",
  key_recommendations: "Key Recommendations",
  assessment_limitations: "Assessment Limitations",
};

const formatValue = (value: any) => {
  if (typeof value === "number") {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (typeof value === "string") {
    return value.replace(/_/g, " ");
  }
  return String(value);
};

export default function AssessmentDetails({ data }: { data: AssessmentData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(LABELS).map(([key, label]) => {
        const value = data[key];
        if (value === undefined) return null;
        return (
          <div key={key} className="bg-white p-4 rounded border">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="mt-1 font-medium text-gray-800">{formatValue(value)}</div>
          </div>
        );
      })}
    </div>
  );
}
