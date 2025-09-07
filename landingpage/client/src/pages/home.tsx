import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SurveyModal from "@/components/survey-modal";
import { Zap, Mic, Eye, BarChart3 } from "lucide-react";
import logoUrl from "@assets/Gemini_Generated_Image_e1wekae1wekae1we_1757201542571.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session } from "@shared/schema";

export default function Home() {
  const [showSurvey, setShowSurvey] = useState(false);

  const createSessionMutation = useMutation({
    mutationFn: async (surveyId?: string) => {
      const response = await apiRequest("POST", "/api/sessions", {
        surveyId,
        status: "active",
      });
      return response.json() as Promise<Session>;
    },
    onSuccess: (session) => {
      window.location.href = `/session/${session.id}`;
    },
  });

  const handleStartSession = (surveyId?: string) => {
    createSessionMutation.mutate(surveyId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-lg p-2">
                <img src={logoUrl} alt="HEUMN Logo" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-foreground">HEUMN</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Early Autism Detection,{" "}
            <span className="text-white">
              Powered by AI
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced machine learning technology helps identify autism characteristics early, giving families the insights they need for timely intervention and support.
          </p>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="secondary"
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-white/90 transition-all duration-200 transform hover:scale-105"
              onClick={() => setShowSurvey(true)}
              data-testid="button-take-survey"
            >
              🔍 Quick 5-Min Assessment
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-primary transition-all duration-200"
              onClick={() => handleStartSession()}
              disabled={createSessionMutation.isPending}
              data-testid="button-start-session"
            >
              {createSessionMutation.isPending ? "Starting..." : "⚡ Full AI Detection Session"}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose HEUMN?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with evidence-based assessment methods to provide accurate, accessible autism screening.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Voice Analysis Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-lg p-3 w-12 h-12 mb-6 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Voice Pattern Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced speech processing to identify communication patterns, emotional states, and individual preferences.
                </p>
              </CardContent>
            </Card>

            {/* Facial Expression Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-secondary/10 rounded-lg p-3 w-12 h-12 mb-6 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Facial Expression Detection</h3>
                <p className="text-muted-foreground">
                  Non-intrusive facial analysis to understand emotions, comfort levels, and communication needs.
                </p>
              </CardContent>
            </Card>

            {/* Insights Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-accent/10 rounded-lg p-3 w-12 h-12 mb-6 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Actionable Insights</h3>
                <p className="text-muted-foreground">
                  Clear, easy-to-understand reports and recommendations for caregivers and healthcare professionals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground mb-8">Trusted by families and professionals worldwide</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">ASSESSMENTS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">94%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">ACCURACY</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">COUNTRIES</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">CLINICIANS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Survey Modal */}
      <SurveyModal 
        open={showSurvey} 
        onOpenChange={setShowSurvey}
        onComplete={handleStartSession}
      />
    </div>
  );
}
