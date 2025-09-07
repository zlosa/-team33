import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import VoiceCapture from "@/components/voice-capture";
import VideoCapture from "@/components/video-capture";
import AnalysisDashboard from "@/components/analysis-dashboard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session } from "@shared/schema";

export default function SessionPage() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();
  const [sessionDuration, setSessionDuration] = useState(0);

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}/end`);
      return response.json() as Promise<Session>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
      window.location.href = "/";
    },
  });

  // Session timer
  useEffect(() => {
    if (!session || session.status !== "active") return;

    const startTime = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session?")) {
      endSessionMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="pulse-gentle mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg mx-auto flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Loading Session</h3>
          <p className="text-muted-foreground">Preparing your care session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Session Not Found</h1>
            <p className="text-muted-foreground mb-4">The session you're looking for doesn't exist.</p>
            <Button onClick={() => window.location.href = "/"} data-testid="button-go-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Session Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-foreground">HEUMN Detection Session</h2>
            <Badge variant={session?.status === "active" ? "default" : "secondary"}>
              {session?.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Duration: <span className="font-mono" data-testid="text-session-duration">{formatTime(sessionDuration)}</span>
            </div>
          </div>
          <Button 
            variant="destructive"
            onClick={handleEndSession}
            disabled={endSessionMutation.isPending}
            data-testid="button-end-session"
          >
            {endSessionMutation.isPending ? "Ending..." : "End Session"}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Voice Input Section */}
          <VoiceCapture sessionId={sessionId!} />

          {/* Video Input Section */}
          <VideoCapture sessionId={sessionId!} />
        </div>

        {/* Analysis Dashboard */}
        <AnalysisDashboard sessionId={sessionId!} />
      </div>
    </div>
  );
}
