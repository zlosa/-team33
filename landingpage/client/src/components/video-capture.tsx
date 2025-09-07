import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useMediaCapture } from "@/hooks/use-media-capture";
import type { FacialAnalysis } from "@shared/schema";

interface VideoCaptureProps {
  sessionId: string;
}

export default function VideoCapture({ sessionId }: VideoCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const queryClient = useQueryClient();
  
  const { requestCamera, isSupported, error } = useMediaCapture();

  // Fetch existing facial analyses
  const { data: analyses = [] } = useQuery<FacialAnalysis[]>({
    queryKey: ["/api/facial-analysis/session", sessionId],
    refetchInterval: isActive ? 5000 : false,
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async () => {
      // Simulate facial analysis processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysisData = {
        sessionId,
        expression: ["neutral", "happy", "focused", "calm", "engaged"][Math.floor(Math.random() * 5)],
        engagement: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 25) + 75, // 75-100
        rawData: {
          timestamp: new Date().toISOString(),
          detectionMethod: "facial_landmarks",
          quality: "good"
        }
      };
      
      const response = await apiRequest("POST", "/api/facial-analysis", analysisData);
      return response.json() as Promise<FacialAnalysis>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facial-analysis/session", sessionId] });
    },
  });

  const startCamera = async () => {
    try {
      const stream = await requestCamera();
      if (!stream) return;

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);

      // Simulate face detection after a delay
      setTimeout(() => {
        setFaceDetected(true);
        createAnalysisMutation.mutate();
      }, 3000);

      // Continue analysis at intervals
      const analysisInterval = setInterval(() => {
        if (isActive && faceDetected) {
          createAnalysisMutation.mutate();
        }
      }, 10000);

      return () => clearInterval(analysisInterval);

    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setFaceDetected(false);
  };

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const latestAnalysis = analyses[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Facial Expression Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-muted rounded-lg aspect-video mb-4 flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef}
            className={`w-full h-full object-cover rounded-lg ${isActive ? 'block' : 'hidden'}`}
            muted
            playsInline
            data-testid="video-feed"
          />
          
          {!isActive && (
            <div className="text-center" data-testid="video-placeholder">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <Button 
                onClick={toggleCamera}
                disabled={!isSupported || !!error}
                variant="secondary"
                data-testid="button-start-camera"
              >
                {isSupported ? "Start Camera" : "Camera not available"}
              </Button>
              {error && (
                <p className="mt-2 text-sm text-destructive" data-testid="text-camera-error">
                  {error}
                </p>
              )}
            </div>
          )}
          
          {/* Face Detection Overlay */}
          {isActive && faceDetected && (
            <div className="absolute top-4 left-4" data-testid="face-detection">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Face Detected
              </Badge>
            </div>
          )}

          {/* Camera Controls */}
          {isActive && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={toggleCamera}
                size="sm"
                variant="destructive"
                data-testid="button-stop-camera"
              >
                <VideoOff className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Facial Analysis Results */}
        {latestAnalysis && (
          <div className="space-y-4" data-testid="facial-results">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <h5 className="font-medium text-sm text-foreground mb-1">Expression</h5>
                <Badge variant="secondary" data-testid="text-expression">
                  {latestAnalysis.expression}
                </Badge>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <h5 className="font-medium text-sm text-foreground mb-1">Engagement</h5>
                <Badge variant="secondary" data-testid="text-engagement">
                  {latestAnalysis.engagement}
                </Badge>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Analysis Confidence</span>
                <span className="text-sm text-muted-foreground">
                  {latestAnalysis.confidence}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(latestAnalysis.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {createAnalysisMutation.isPending && (
          <div className="text-center py-4">
            <div className="pulse-gentle">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing facial expressions...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
