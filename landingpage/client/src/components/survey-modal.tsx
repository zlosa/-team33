import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Survey } from "@shared/schema";

interface SurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (surveyId: string) => void;
}

export default function SurveyModal({ open, onOpenChange, onComplete }: SurveyModalProps) {
  const [participantType, setParticipantType] = useState("");
  const [sessionGoal, setSessionGoal] = useState("");
  const [concerns, setConcerns] = useState("");

  const createSurveyMutation = useMutation({
    mutationFn: async (data: { participantType: string; sessionGoal: string; concerns?: string }) => {
      const response = await apiRequest("POST", "/api/surveys", data);
      return response.json() as Promise<Survey>;
    },
    onSuccess: (survey) => {
      onComplete(survey.id);
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setParticipantType("");
    setSessionGoal("");
    setConcerns("");
  };

  const handleSubmit = () => {
    if (!participantType || !sessionGoal) {
      return;
    }

    createSurveyMutation.mutate({
      participantType,
      sessionGoal,
      concerns: concerns.trim() || undefined,
    });
  };

  const handleSkip = () => {
    onComplete("");
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick 5-Min Assessment</DialogTitle>
          <DialogDescription>
            Help us understand your needs for the most accurate screening
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Question 1 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">1. Who will be participating in this session?</h3>
            <RadioGroup value={participantType} onValueChange={setParticipantType} data-testid="radio-participant-type">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer">Individual with autism</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="caregiver" id="caregiver" />
                <Label htmlFor="caregiver" className="cursor-pointer">Caregiver</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">Both together</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">2. What is the primary goal for today's session?</h3>
            <RadioGroup value={sessionGoal} onValueChange={setSessionGoal} data-testid="radio-session-goal">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="communication" id="communication" />
                <Label htmlFor="communication" className="cursor-pointer">Improve communication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emotional" id="emotional" />
                <Label htmlFor="emotional" className="cursor-pointer">Understand emotional state</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="assessment" id="assessment" />
                <Label htmlFor="assessment" className="cursor-pointer">General assessment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monitoring" id="monitoring" />
                <Label htmlFor="monitoring" className="cursor-pointer">Progress monitoring</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question 3 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">3. Any specific concerns or focus areas?</h3>
            <Textarea 
              placeholder="Optional: Share any specific concerns or areas you'd like to focus on during this session..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-concerns"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="ghost"
              onClick={handleSkip}
              data-testid="button-skip-survey"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!participantType || !sessionGoal || createSurveyMutation.isPending}
              data-testid="button-submit-survey"
            >
              {createSurveyMutation.isPending ? "Starting..." : "Start Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
