import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useMediaCapture } from "@/hooks/use-media-capture";
import type { VoiceAnalysis } from "@shared/schema";

interface VoiceCaptureProps {
  sessionId: string;
}

export default function VoiceCapture({ sessionId }: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const queryClient = useQueryClient();
  
  const { requestMicrophone, isSupported, error } = useMediaCapture();

  // Fetch existing voice analyses
  const { data: analyses = [] } = useQuery<VoiceAnalysis[]>({
    queryKey: ["/api/voice-analysis/session", sessionId],
    refetchInterval: isRecording ? 5000 : false,
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (audioData: Blob) => {
      // Simulate voice analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisData = {
        sessionId,
        emotionalState: ["calm", "excited", "neutral", "focused"][Math.floor(Math.random() * 4)],
        speechPatterns: ["regular pace", "rapid speech", "slow speech", "clear articulation"][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        rawData: {
          audioSize: audioData.size,
          duration: "30s",
          sampleRate: "44.1kHz"
        }
      };
      
      const response = await apiRequest("POST", "/api/voice-analysis", analysisData);
      return response.json() as Promise<VoiceAnalysis>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-analysis/session", sessionId] });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await requestMicrophone();
      if (!stream) return;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        createAnalysisMutation.mutate(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Simulate audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const latestAnalysis = analyses[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <Button
            onClick={toggleRecording}
            disabled={!isSupported || !!error || createAnalysisMutation.isPending}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className={`w-20 h-20 rounded-full text-2xl ${isRecording ? 'recording-pulse' : ''}`}
            data-testid="button-voice-toggle"
          >
            {isRecording ? <MicOff /> : <Mic />}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRecording ? "Recording... Click to stop" : "Click to start voice recording"}
          </p>
          {error && (
            <p className="mt-2 text-sm text-destructive" data-testid="text-voice-error">
              {error}
            </p>
          )}
        </div>

        {/* Audio Visualization */}
        {isRecording && (
          <div className="mb-6">
            <div className="flex justify-center items-center mb-4">
              <div className="wave-animation">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="wave-bar"
                    style={{ 
                      height: `${Math.max(4, (audioLevel / 255) * 20 + Math.random() * 5)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Listening and analyzing...
            </p>
            <Progress value={(audioLevel / 255) * 100} className="mt-2" />
          </div>
        )}

        {/* Voice Analysis Results */}
        {latestAnalysis && (
          <div className="space-y-4" data-testid="voice-results">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Emotional State</h4>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" data-testid="text-emotional-state">
                  {latestAnalysis.emotionalState}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {latestAnalysis.confidence}% confidence
                </span>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Speech Patterns</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-speech-patterns">
                {latestAnalysis.speechPatterns}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(latestAnalysis.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {createAnalysisMutation.isPending && (
          <div className="text-center py-4">
            <div className="pulse-gentle">
              <Mic className="w-8 h-8 text-primary mx-auto mb-2" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing voice data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
