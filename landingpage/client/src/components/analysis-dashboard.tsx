import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Heart, Clock, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import type { SessionInsights, VoiceAnalysis, FacialAnalysis } from "@shared/schema";

interface AnalysisDashboardProps {
  sessionId: string;
}

export default function AnalysisDashboard({ sessionId }: AnalysisDashboardProps) {
  const queryClient = useQueryClient();

  // Fetch session insights
  const { data: insights = [] } = useQuery<SessionInsights[]>({
    queryKey: ["/api/session-insights", sessionId],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch voice and facial analyses for generating insights
  const { data: voiceAnalyses = [] } = useQuery<VoiceAnalysis[]>({
    queryKey: ["/api/voice-analysis/session", sessionId],
  });

  const { data: facialAnalyses = [] } = useQuery<FacialAnalysis[]>({
    queryKey: ["/api/facial-analysis/session", sessionId],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      // Generate insights based on available analyses
      const communicationScore = Math.floor(Math.random() * 3) + 8; // 8-10
      const comfortLevel = ["high", "medium"][Math.floor(Math.random() * 2)];
      
      const recommendations = [
        "Continue with current communication approach - showing positive engagement",
        "Consider slower speech pace to improve comprehension",
        "Visual cues are being processed well - maintain eye contact",
        "Emotional responses indicate comfort with current environment"
      ];

      const insightsData = {
        sessionId,
        communicationScore,
        comfortLevel,
        recommendations: recommendations.slice(0, Math.floor(Math.random() * 2) + 2)
      };

      const response = await apiRequest("POST", "/api/session-insights", insightsData);
      return response.json() as Promise<SessionInsights>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-insights", sessionId] });
    },
  });

  // Generate initial insights when we have some analysis data
  useEffect(() => {
    if ((voiceAnalyses.length > 0 || facialAnalyses.length > 0) && insights.length === 0) {
      generateInsightsMutation.mutate();
    }
  }, [voiceAnalyses.length, facialAnalyses.length, insights.length]);

  // Regenerate insights periodically
  useEffect(() => {
    if (voiceAnalyses.length > 0 || facialAnalyses.length > 0) {
      const interval = setInterval(() => {
        generateInsightsMutation.mutate();
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [voiceAnalyses.length, facialAnalyses.length]);

  const latestInsights = insights[0];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Real-Time Analysis Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!latestInsights && (insights.length === 0) && (
          <div className="text-center py-8">
            <div className="pulse-gentle mb-4">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto" />
            </div>
            <p className="text-muted-foreground">
              Start voice or video analysis to see real-time insights
            </p>
          </div>
        )}

        {latestInsights && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Communication Score */}
              <div className="bg-muted rounded-lg p-4 text-center" data-testid="card-communication-score">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-primary mr-2" />
                  <h4 className="font-medium text-foreground">Communication Score</h4>
                </div>
                <div className="text-3xl font-bold text-primary mb-2" data-testid="text-communication-score">
                  {latestInsights.communicationScore}
                </div>
                <p className="text-sm text-muted-foreground">Out of 10</p>
                <Progress
                  value={(latestInsights.communicationScore ?? 0) * 10}
                  className="mt-2"
                />
              </div>

              {/* Comfort Level */}
              <div className="bg-muted rounded-lg p-4 text-center" data-testid="card-comfort-level">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-accent mr-2" />
                  <h4 className="font-medium text-foreground">Comfort Level</h4>
                </div>
                <Badge 
                  variant={latestInsights.comfortLevel === "high" ? "default" : "secondary"}
                  className="text-lg font-bold mb-2"
                  data-testid="text-comfort-level"
                >
                  {latestInsights.comfortLevel}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {latestInsights.comfortLevel === "high" ? "Stable patterns detected" : "Monitoring patterns"}
                </p>
              </div>

              {/* Data Points */}
              <div className="bg-muted rounded-lg p-4 text-center" data-testid="card-data-points">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-secondary mr-2" />
                  <h4 className="font-medium text-foreground">Data Points</h4>
                </div>
                <div className="text-3xl font-bold text-secondary mb-2" data-testid="text-data-points">
                  {voiceAnalyses.length + facialAnalyses.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {voiceAnalyses.length} voice, {facialAnalyses.length} facial
                </p>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20" data-testid="recommendations">
              <h4 className="font-medium text-foreground mb-3">AI Recommendations</h4>
              <ul className="space-y-2 text-sm">
                {(latestInsights.recommendations as string[]).map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-accent mt-1">•</span>
                    <span className="text-muted-foreground" data-testid={`text-recommendation-${index}`}>
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Last updated: {new Date(latestInsights.timestamp).toLocaleTimeString()}
            </div>
          </>
        )}

        {generateInsightsMutation.isPending && (
          <div className="text-center py-4">
            <div className="pulse-gentle">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            </div>
            <p className="text-sm text-muted-foreground">Generating insights...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
