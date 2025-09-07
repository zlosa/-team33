import { useState, useEffect } from "react";
import { FaceWidgets } from "../../components/widgets/FaceWidgets";
import { ProsodyWidgets } from "../../components/widgets/ProsodyWidgets";
import { BurstWidgets } from "../../components/widgets/BurstWidgets";
import AssessmentDetails from "../../components/AssessmentDetails";
import type { Emotion } from "../../lib/data/emotion";
import type { AudioPrediction } from "../../lib/data/audioPrediction";
import { CVIProvider, Conversation, createConversation, endConversation, useRequestPermissions, WelcomeScreen } from "../../components/avatar";
import type { IConversation } from "../../components/avatar";

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

// Avatar conversation management using exact original pattern
function AvatarSection({ onConversationStart, onConversationEnd }: { 
  onConversationStart: () => void; 
  onConversationEnd: () => void; 
}) {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <CVIProvider>
        <AvatarSectionInner 
          onConversationStart={onConversationStart} 
          onConversationEnd={onConversationEnd} 
        />
      </CVIProvider>
    </div>
  );
}

// Inner component that has access to Daily context
function AvatarSectionInner({ onConversationStart, onConversationEnd }: { 
  onConversationStart: () => void; 
  onConversationEnd: () => void; 
}) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [screen, setScreen] = useState<'welcome' | 'call'>('welcome');
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = useRequestPermissions();

  useEffect(() => {
    return () => {
      if (conversation && apiKey) {
        void endConversation(conversation.conversation_id, apiKey);
      }
    };
  }, [conversation, apiKey]);

  const handleEnd = async () => {
    try {
      setScreen('welcome');
      if (!conversation || !apiKey) return;
      await endConversation(conversation.conversation_id, apiKey);
      onConversationEnd();
    } catch (error) {
      console.error(error);
    } finally {
      setConversation(null);
    }
  };

  const handleJoin = async (token: string) => {
    try {
      setApiKey(token);
      localStorage.setItem('token', token);
      setLoading(true);
      await requestPermissions();
      if (!token) {
        alert('API key not found. Please set your API key.');
        return;
      }
      console.log('Creating conversation with token:', token);
      const conversation = await createConversation(token);
      console.log('Conversation created successfully:', conversation);
      setConversation(conversation);
      setScreen('call');
      onConversationStart();
    } catch (error) {
      console.error('Avatar conversation error:', error);
      
      // Handle specific Tavus API errors
      if (error instanceof Error && error.message.includes('maximum concurrent conversations')) {
        alert('⚠️ Maximum concurrent conversations reached.\n\nYour Tavus account has too many active conversations. Please:\n1. Wait a few minutes for previous conversations to end automatically\n2. Or check your Tavus dashboard to end active conversations\n3. Try starting the avatar again');
      } else if (error instanceof Error && error.message.includes('Tavus API error (401)')) {
        alert('🔑 Invalid API Key\n\nPlease check that your Tavus API key is correct and has proper permissions.');
      } else if (error instanceof Error && error.message.includes('Tavus API error (403)')) {
        alert('🚫 Access Forbidden\n\nYour Tavus API key does not have permission to create conversations.');
      } else {
        alert(`Uh oh! Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {screen === 'welcome' && (
        <div className="h-96">
          <WelcomeScreen onStart={handleJoin} loading={loading} />
        </div>
      )}
      {screen === 'call' && conversation && (
        <div className="h-96">
          <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />
        </div>
      )}
    </>
  );
}

export default function MultiModelPage() {
  const [accumulatedData, setAccumulatedData] = useState<AccumulatedData>({
    sessionId: "",
    startTime: 0,
    faceEmotions: [],
    prosodyTimeline: [],
    burstTimeline: [],
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [avatarActive, setAvatarActive] = useState(false);

  const hasData =
    accumulatedData.faceEmotions.length > 0 ||
    accumulatedData.prosodyTimeline.length > 0 ||
    accumulatedData.burstTimeline.length > 0;

  // Button styles
  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const btnPrimary = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
  const btnSuccess = "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500";
  const btnWarn = "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500";
  const btnNeutral = "bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400";
  const btnDisabled = "opacity-60 cursor-not-allowed";

  const startSession = () => {
    setAnalysisResult(null);
    setAccumulatedData({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      faceEmotions: [],
      prosodyTimeline: [],
      burstTimeline: [],
    });
    setSessionActive(true);
  };

  const stopRecording = () => {
    setSessionActive(false);
  };

  const resumeRecording = () => {
    if (accumulatedData.sessionId) {
      setSessionActive(true);
    } else {
      startSession();
    }
  };

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

  // Avatar conversation callbacks
  const handleAvatarStart = () => {
    setAvatarActive(true);
  };

  const handleAvatarEnd = () => {
    setAvatarActive(false);
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
      <div className="pb-6 text-2xl font-medium text-neutral-800">Avatar-Based Multi-Modal Analysis</div>
      <div className="pb-6 text-neutral-600">
        Interactive AI avatar conversation with real-time multimodal analysis. Combines avatar video chat with facial expressions, speech prosody, and vocal burst detection for comprehensive autism assessment.
      </div>

      {/* Session Status - Backend Data Collection */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">
              {accumulatedData.sessionId ? `Session: ${accumulatedData.sessionId}` : 'Session: (idle)'}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              Face: {accumulatedData.faceEmotions.length} • 
              Prosody: {accumulatedData.prosodyTimeline.length} • 
              Burst: {accumulatedData.burstTimeline.length} data points
              {avatarActive && ' • Avatar: Active'}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            sessionActive
              ? 'bg-green-100 text-green-800'
              : hasData
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {sessionActive ? 'Collecting Data' : hasData ? 'Ready for Analysis' : 'Idle'}
          </div>
        </div>
      </div>
      
      {sessionActive && (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {/* Position 1: Facial Expression Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Facial Expression Analysis</h2>
          <FaceWidgets onEmotionUpdate={handleFaceEmotions} />
        </div>

        {/* Position 2: Avatar Conversation Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Avatar Conversation</h2>
          <div className="h-96">
            <AvatarSection 
              onConversationStart={handleAvatarStart}
              onConversationEnd={handleAvatarEnd}
            />
          </div>
        </div>

        {/* Position 3: Speech Prosody Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Speech Prosody Analysis</h2>
          <ProsodyWidgets onTimelineUpdate={handleProsodyData} />
        </div>

        {/* Position 4: Vocal Burst Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Vocal Burst Analysis</h2>
          <BurstWidgets onTimeline={handleBurstData} />
        </div>
      </div>
      )}

      {/* Analysis Controls */}
      <div className="mt-8 text-center">
        {!sessionActive && !hasData && (
          <>
            <button
              onClick={startSession}
              disabled={isAnalyzing}
              className={`${btnBase} ${btnSuccess} ${isAnalyzing ? btnDisabled : ''}`}
            >
              <span className="text-lg">▶️</span>
              <span>Start Recording</span>
            </button>
            <div className="mt-2 text-sm text-gray-600">
              Click to begin recording from your camera and microphone
            </div>
          </>
        )}

        {sessionActive && (
          <>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleAnalysis}
                disabled={isAnalyzing || !hasData}
                className={`${btnBase} ${btnPrimary} ${isAnalyzing || !hasData ? btnDisabled : ''}`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✅</span>
                    <span>Complete Analysis</span>
                  </>
                )}
              </button>
              <button
                onClick={stopRecording}
                disabled={isAnalyzing}
                className={`${btnBase} ${btnNeutral} ${isAnalyzing ? btnDisabled : ''}`}
              >
                <span className="text-lg">⏸️</span>
                <span>Stop Recording</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Collect some data from the widgets above, then click to analyze
            </div>
          </>
        )}

        {!sessionActive && hasData && (
          <>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={handleAnalysis}
                className={`${btnBase} ${btnPrimary}`}
              >
                <span className="text-lg">✅</span>
                <span>Complete Analysis</span>
              </button>
              <button
                onClick={resumeRecording}
                className={`${btnBase} ${btnWarn}`}
              >
                <span className="text-lg">🔁</span>
                <span>Resume Recording</span>
              </button>
              <button
                onClick={startSession}
                className={`${btnBase} ${btnSuccess}`}
              >
                <span className="text-lg">▶️</span>
                <span>Start New Session</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Recording stopped. Resume to continue this session, complete analysis, or start a new one.
            </div>
          </>
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
            <div className="mt-4">
              <AssessmentDetails data={analysisResult} />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
