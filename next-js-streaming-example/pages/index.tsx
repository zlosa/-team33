import { useState, useEffect, useCallback } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { BurstWidgets } from "../components/widgets/BurstWidgets";
import AssessmentDetails from "../components/AssessmentDetails";
import type { Emotion } from "../lib/data/emotion";
import type { AudioPrediction } from "../lib/data/audioPrediction";
import { CVIProvider, Conversation, createConversation, endConversation, useRequestPermissions } from "../components/avatar";
import type { IConversation } from "../components/avatar";
import type { TranscriptMessage } from "../components/avatar/components/transcript";

// Data accumulation types
type AccumulatedData = {
  sessionId: string;
  startTime: number;
  faceEmotions: Array<{ timestamp: number; emotions: Emotion[]; confidence: number }>;
  prosodyTimeline: AudioPrediction[];
  burstTimeline: AudioPrediction[];
  transcriptMessages: TranscriptMessage[];
};

type AnalysisResult = {
  overall_autism_likelihood: number;
  assessment_confidence: number;
  evaluation_priority: string;
  primary_concerns: string;
  observed_strengths: string;
  key_recommendations: string;
  [key: string]: unknown;
};

// AI Agent conversation management using exact original pattern
function AIAgentSection({ onConversationStart, onConversationEnd, onTranscriptUpdate, shouldStart }: { 
  onConversationStart: () => void; 
  onConversationEnd: () => void;
  onTranscriptUpdate?: (messages: TranscriptMessage[]) => void;
  shouldStart?: boolean;
}) {
  return (
    <div className="w-full bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <CVIProvider>
        <AIAgentSectionInner 
          onConversationStart={onConversationStart} 
          onConversationEnd={onConversationEnd}
          onTranscriptUpdate={onTranscriptUpdate}
          shouldStart={shouldStart}
        />
      </CVIProvider>
    </div>
  );
}

// Inner component that has access to Daily context
function AIAgentSectionInner({ onConversationStart, onConversationEnd, onTranscriptUpdate, shouldStart }: { 
  onConversationStart: () => void; 
  onConversationEnd: () => void;
  onTranscriptUpdate?: (messages: TranscriptMessage[]) => void;
  shouldStart?: boolean;
}) {
  const [apiKey] = useState<string | null>(process.env.NEXT_PUBLIC_TAVUS_API_KEY || null);
  const [screen, setScreen] = useState<'ready' | 'call'>('ready');
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = useRequestPermissions();

  const handleJoin = useCallback(async (token: string) => {
    try {
      setLoading(true);
      await requestPermissions();
      if (!token) {
        alert('Tavus API key not found in environment variables.');
        return;
      }
      console.log('Creating conversation with token:', token);
      const conversation = await createConversation(token);
      console.log('Conversation created successfully:', conversation);
      setConversation(conversation);
      setScreen('call');
      onConversationStart();
    } catch (error) {
      console.error('AI Agent conversation error:', error);
      
      // Handle specific Tavus API errors
      if (error instanceof Error && error.message.includes('maximum concurrent conversations')) {
        alert('⚠️ Maximum concurrent conversations reached.\n\nYour Tavus account has too many active conversations. Please:\n1. Wait a few minutes for previous conversations to end automatically\n2. Or check your Tavus dashboard to end active conversations\n3. Try starting the AI Agent again');
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
  }, [requestPermissions, onConversationStart]);

  const handleEnd = async () => {
    try {
      setScreen('ready');
      if (!conversation || !apiKey) return;
      await endConversation(conversation.conversation_id, apiKey);
      onConversationEnd();
    } catch (error) {
      console.error(error);
    } finally {
      setConversation(null);
    }
  };

  // Auto-start avatar when shouldStart is true
  useEffect(() => {
    if (shouldStart && !conversation && apiKey && screen === 'ready') {
      handleJoin(apiKey);
    }
  }, [shouldStart, conversation, apiKey, screen, handleJoin]);

  useEffect(() => {
    return () => {
      if (conversation && apiKey) {
        void endConversation(conversation.conversation_id, apiKey);
      }
    };
  }, [conversation, apiKey]);

  return (
    <>
      {screen === 'ready' && !conversation && (
        <div className="h-96 flex items-center justify-center bg-gradient-to-br from-purple-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-inner">
          <div className="text-center">
            {loading ? (
              <div className="text-center">
                <div className="text-lg mb-4 font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Starting AI Agent conversation...</div>
                <div className="relative">
                  <div className="animate-spin text-3xl">⏳</div>
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 blur-xl"></div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-semibold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🤖 AI Agent Ready</div>
                <div className="text-sm text-gray-600 px-4 py-2 bg-white/50 rounded-full border border-white/30">Will start automatically when recording begins</div>
              </div>
            )}
          </div>
        </div>
      )}
      {screen === 'call' && conversation && (
        <div className="h-96">
          <Conversation 
            conversationUrl={conversation.conversation_url} 
            onLeave={handleEnd}
            onTranscriptUpdate={onTranscriptUpdate}
          />
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const [accumulatedData, setAccumulatedData] = useState<AccumulatedData>({
    sessionId: "",
    startTime: 0,
    faceEmotions: [],
    prosodyTimeline: [],
    burstTimeline: [],
    transcriptMessages: [],
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [avatarActive, setAvatarActive] = useState(false);

  const hasData =
    accumulatedData.faceEmotions.length > 0 ||
    accumulatedData.prosodyTimeline.length > 0 ||
    accumulatedData.burstTimeline.length > 0 ||
    accumulatedData.transcriptMessages.length > 0;

  // Button styles - COOL AF styling
  const btnBase =
    "inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 backdrop-blur-sm";
  const btnPrimary = "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-purple-500/50 shadow-blue-500/25";
  const btnSuccess = "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white focus:ring-emerald-500/50 shadow-emerald-500/25";
  const btnWarn = "bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white focus:ring-orange-500/50 shadow-orange-500/25";
  const btnNeutral = "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 focus:ring-gray-400/50 shadow-gray-400/25";
  const btnDisabled = "opacity-50 cursor-not-allowed transform-none hover:scale-100 hover:shadow-lg";

  const startSession = () => {
    setAnalysisResult(null);
    setAccumulatedData({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      faceEmotions: [],
      prosodyTimeline: [],
      burstTimeline: [],
      transcriptMessages: [],
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

  // AI Agent conversation callbacks
  const handleAvatarStart = () => {
    setAvatarActive(true);
  };

  const handleAvatarEnd = () => {
    setAvatarActive(false);
  };

  // Callback for transcript data updates
  const handleTranscriptUpdate = (messages: TranscriptMessage[]) => {
    if (!sessionActive) return;
    setAccumulatedData(prev => ({
      ...prev,
      transcriptMessages: messages
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
            total_datapoints: accumulatedData.faceEmotions.length + accumulatedData.prosodyTimeline.length + accumulatedData.burstTimeline.length + accumulatedData.transcriptMessages.length,
            session_type: "multimodal_assessment"
          },
          transcript_messages: accumulatedData.transcriptMessages
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 pt-6 pb-16 sm:px-6 md:px-8">
      <div className="text-center mb-6">
        <div className="pb-2 text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 dark:from-indigo-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent animate-pulse">
          🧠 AI Agent-Based Multi-Modal Analysis
        </div>
        <div className="pb-4 text-base text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
          🚀 Interactive AI Agent conversation with real-time multimodal analysis. Combines AI Agent video chat with facial expressions, speech prosody, and vocal burst detection for comprehensive autism assessment.
        </div>
      </div>

      {/* Session Status - Backend Data Collection */}
      <div className="mb-4 p-4 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-md border border-white/30 dark:border-gray-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {accumulatedData.sessionId ? `Session: ${accumulatedData.sessionId}` : 'Session: (idle)'}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Face: {accumulatedData.faceEmotions.length} • 
              Prosody: {accumulatedData.prosodyTimeline.length} • 
              Burst: {accumulatedData.burstTimeline.length} • 
              Transcript: {accumulatedData.transcriptMessages.length} data points
              {avatarActive && ' • AI Agent: Active'}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all duration-300 ${
            sessionActive
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse'
              : hasData
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
          }`}>
            {sessionActive ? 'Collecting Data' : hasData ? 'Ready for Analysis' : 'Idle'}
          </div>
        </div>
      </div>
      
      {sessionActive && (
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 gap-4 mb-6">
        {/* Position 1: Facial Expression Section */}
        <div className="group bg-gradient-to-br from-pink-50/90 to-rose-100/90 dark:from-pink-900/40 dark:to-rose-800/40 backdrop-blur-sm border border-white/30 dark:border-pink-700/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text mb-3 flex items-center gap-2">
            😊 Facial Expression Analysis
          </h2>
          <FaceWidgets onEmotionUpdate={handleFaceEmotions} />
        </div>

        {/* Position 2: AI Agent Conversation Section */}
        <div className="group bg-gradient-to-br from-blue-50/90 to-indigo-100/90 dark:from-blue-900/40 dark:to-indigo-800/40 backdrop-blur-sm border border-white/30 dark:border-blue-700/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text mb-3 flex items-center gap-2">
            🤖 AI Agent Conversation
          </h2>
          <div className="h-64">
            <AIAgentSection 
              onConversationStart={handleAvatarStart}
              onConversationEnd={handleAvatarEnd}
              onTranscriptUpdate={handleTranscriptUpdate}
              shouldStart={sessionActive}
            />
          </div>
        </div>

        {/* Position 3: Speech Prosody Section */}
        <div className="group bg-gradient-to-br from-emerald-50/90 to-teal-100/90 dark:from-emerald-900/40 dark:to-teal-800/40 backdrop-blur-sm border border-white/30 dark:border-emerald-700/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text mb-3 flex items-center gap-2">
            🎵 Speech Prosody Analysis
          </h2>
          <ProsodyWidgets onTimelineUpdate={handleProsodyData} />
        </div>

        {/* Position 4: Vocal Burst Section */}
        <div className="group bg-gradient-to-br from-amber-50/90 to-yellow-100/90 dark:from-amber-900/40 dark:to-yellow-800/40 backdrop-blur-sm border border-white/30 dark:border-amber-700/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text mb-3 flex items-center gap-2">
            🎤 Vocal Burst Analysis
          </h2>
          <BurstWidgets onTimeline={handleBurstData} />
        </div>
      </div>
      )}

      {/* Analysis Controls */}
      <div className="mt-6 text-center">
        {!sessionActive && !hasData && (
          <>
            <button
              type="button"
              onClick={startSession}
              disabled={isAnalyzing}
              className={`${btnBase} ${btnSuccess} ${isAnalyzing ? btnDisabled : ''} relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <span className="text-2xl animate-bounce">📹</span>
              <span className="relative z-10">Start Recording</span>
            </button>
            <div className="mt-4 text-lg text-gray-700 dark:text-gray-300 font-medium">
              🚀 Click to begin recording from your camera and microphone
            </div>
          </>
        )}

        {sessionActive && (
          <>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleAnalysis}
                disabled={isAnalyzing || !hasData}
                className={`${btnBase} ${btnPrimary} ${isAnalyzing || !hasData ? btnDisabled : ''} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {isAnalyzing ? (
                  <>
                    <div className="relative">
                      <span className="inline-block animate-spin text-2xl">🔄</span>
                      <div className="absolute inset-0 animate-ping bg-purple-400 rounded-full opacity-20"></div>
                    </div>
                    <span className="relative z-10">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl animate-pulse">🧠</span>
                    <span className="relative z-10">Complete Analysis</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={stopRecording}
                disabled={isAnalyzing}
                className={`${btnBase} ${btnNeutral} ${isAnalyzing ? btnDisabled : ''} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <span className="text-2xl">⏹️</span>
                <span className="relative z-10">Stop Recording</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Collect some data from the widgets above, then click to analyze
            </div>
          </>
        )}

        {!sessionActive && hasData && (
          <>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <button
                type="button"
                onClick={handleAnalysis}
                className={`${btnBase} ${btnPrimary} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="text-2xl animate-pulse">🧠</span>
                <span className="relative z-10">Complete Analysis</span>
              </button>
              <button
                type="button"
                onClick={resumeRecording}
                className={`${btnBase} ${btnWarn} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="text-2xl animate-spin">🔄</span>
                <span className="relative z-10">Resume Recording</span>
              </button>
              <button
                type="button"
                onClick={startSession}
                className={`${btnBase} ${btnSuccess} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="text-2xl animate-bounce">✨</span>
                <span className="relative z-10">Start New Session</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Recording stopped. Resume to continue this session, complete analysis, or start a new one.
            </div>
          </>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-12 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-700/95 backdrop-blur-lg border border-white/30 dark:border-gray-600/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text mb-6 text-center flex items-center justify-center gap-3">
            📊 Autism Assessment Results
          </h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50/90 to-indigo-100/90 dark:from-blue-900/50 dark:to-indigo-800/50 backdrop-blur-sm border border-white/40 dark:border-blue-700/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-lg text-blue-700 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
                🎯 Autism Likelihood
              </div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text">
                {(analysisResult.overall_autism_likelihood * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50/90 to-green-100/90 dark:from-emerald-900/50 dark:to-green-800/50 backdrop-blur-sm border border-white/40 dark:border-emerald-700/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-lg text-emerald-700 dark:text-emerald-300 font-bold mb-2 flex items-center gap-2">
                📈 Assessment Confidence
              </div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text">
                {(analysisResult.assessment_confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50/90 to-amber-100/90 dark:from-orange-900/50 dark:to-amber-800/50 backdrop-blur-sm border border-white/40 dark:border-orange-700/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-lg text-orange-700 dark:text-orange-300 font-bold mb-2 flex items-center gap-2">
                ⚡ Evaluation Priority
              </div>
              <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text capitalize">
                {analysisResult.evaluation_priority}
              </div>
            </div>
          </div>

          {/* Full Results (Expandable) */}
          <details className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-700/80 dark:to-gray-600/80 backdrop-blur-sm border border-white/40 dark:border-gray-600/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <summary className="cursor-pointer text-lg font-bold text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-400 dark:hover:to-purple-400 transition-all duration-300 flex items-center gap-2">
              📋 View Full Assessment Details
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
