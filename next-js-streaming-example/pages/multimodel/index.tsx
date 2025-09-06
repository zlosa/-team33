import { useState, useRef } from "react";
import { FaceWidgets } from "../../components/widgets/FaceWidgets";
import { ProsodyWidgets } from "../../components/widgets/ProsodyWidgets";
import { BurstWidgets } from "../../components/widgets/BurstWidgets";
import { Emotion } from "../../lib/data/emotion";
import { AudioPrediction } from "../../lib/data/audioPrediction";

// Data accumulation types
type AccumulatedData = {
  sessionId: string;
  startTime: number;
  faceEmotions: Array<{ timestamp: number; emotions: Emotion[]; confidence: number }>;
  prosodyTimeline: AudioPrediction[];
  burstTimeline: AudioPrediction[];
};

type AnalysisResult = {
  overall_autism_likelihood: number;
  assessment_confidence: number;
  evaluation_priority: string;
  primary_concerns: string;
  observed_strengths: string;
  key_recommendations: string;
  [key: string]: any;
};

export default function MultiModelPage() {
  const [accumulatedData, setAccumulatedData] = useState<AccumulatedData>({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: Date.now(),
    faceEmotions: [],
    prosodyTimeline: [],
    burstTimeline: [],
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);

  // Callback for face emotion updates
  const handleFaceEmotions = (emotions: Emotion[], confidence: number = 0.8) => {
    if (!sessionActive) return;
    const timestamp = Date.now() - accumulatedData.startTime;
    setAccumulatedData(prev => ({
      ...prev,
      faceEmotions: [...prev.faceEmotions, { timestamp, emotions, confidence }]
    }));
  };

  // Callback for prosody data updates
  const handleProsodyData = (predictions: AudioPrediction[]) => {
    if (!sessionActive) return;
    setAccumulatedData(prev => ({
      ...prev,
      prosodyTimeline: [...prev.prosodyTimeline, ...predictions]
    }));
  };

  // Callback for burst data updates
  const handleBurstData = (predictions: AudioPrediction[]) => {
    if (!sessionActive) return;
    setAccumulatedData(prev => ({
      ...prev,
      burstTimeline: [...prev.burstTimeline, ...predictions]
    }));
  };

  // Send data to agent server for analysis
  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setSessionActive(false);

    try {
      const payload = {
        conversation_data: {
          session_id: accumulatedData.sessionId,
          duration: (Date.now() - accumulatedData.startTime) / 1000,
          start_time: new Date(accumulatedData.startTime).toISOString(),
          end_time: new Date().toISOString(),
          metadata: {
            total_datapoints: accumulatedData.faceEmotions.length + accumulatedData.prosodyTimeline.length + accumulatedData.burstTimeline.length,
            session_type: "multimodal_assessment"
          }
        },
        hume_data: {
          session_id: accumulatedData.sessionId,
          emotion_timeline: {
            face_emotions: accumulatedData.faceEmotions,
            prosody_emotions: accumulatedData.prosodyTimeline,
            burst_analysis: accumulatedData.burstTimeline
          }
        }
      };

      console.log('Sending payload to agent server:', payload);
      
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      console.log('Analysis result:', result);

    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please check console and ensure agent server is running on localhost:8000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="px-6 pt-10 pb-20 sm:px-10 md:px-14">
      <div className="pb-6 text-2xl font-medium text-neutral-800">Multi-Model Real-time Analysis</div>
      <div className="pb-6 text-neutral-600">
        Real-time analysis combining facial expressions, speech prosody, and vocal bursts using separate WebSocket connections.
      </div>

      {/* Session Status - Backend Data Collection */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">Session: {accumulatedData.sessionId}</span>
            <div className="text-xs text-gray-500 mt-1">
              Collecting data for analysis in background...
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${sessionActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {sessionActive ? 'Collecting Data' : 'Ready for Analysis'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Facial Expression Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Facial Expression Analysis</h2>
          <FaceWidgets onEmotionUpdate={handleFaceEmotions} />
        </div>

        {/* Speech Prosody Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Speech Prosody Analysis</h2>
          <ProsodyWidgets onTimelineUpdate={handleProsodyData} />
        </div>

        {/* Vocal Burst Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Vocal Burst Analysis</h2>
          <BurstWidgets onTimeline={handleBurstData} />
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="mt-8 text-center">
        <button
          onClick={handleAnalysis}
          disabled={isAnalyzing || !sessionActive || (accumulatedData.faceEmotions.length === 0 && accumulatedData.prosodyTimeline.length === 0 && accumulatedData.burstTimeline.length === 0)}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isAnalyzing 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : sessionActive
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Analyzing...
            </>
          ) : sessionActive ? (
            'Complete Analysis'
          ) : (
            'Analysis Complete'
          )}
        </button>
        {sessionActive && (
          <div className="mt-2 text-sm text-gray-600">
            Collect some data from the widgets above, then click to analyze
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Autism Assessment Results</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Autism Likelihood</div>
              <div className="text-2xl font-bold text-blue-800">
                {(analysisResult.overall_autism_likelihood * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Assessment Confidence</div>
              <div className="text-2xl font-bold text-green-800">
                {(analysisResult.assessment_confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Evaluation Priority</div>
              <div className="text-lg font-bold text-orange-800 capitalize">
                {analysisResult.evaluation_priority}
              </div>
            </div>
          </div>

          {/* Full Results (Expandable) */}
          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              View Full Assessment Details
            </summary>
            <pre className="mt-4 text-xs text-gray-600 overflow-auto max-h-96 bg-white p-3 rounded border">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
