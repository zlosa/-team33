import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSurveySchema, 
  insertSessionSchema,
  insertVoiceAnalysisSchema,
  insertFacialAnalysisSchema,
  insertSessionInsightsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Survey routes
  app.post("/api/surveys", async (req, res) => {
    try {
      const surveyData = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(surveyData);
      res.json(survey);
    } catch (error) {
      res.status(400).json({ message: "Invalid survey data" });
    }
  });

  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const survey = await storage.getSurvey(req.params.id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.endSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Voice analysis routes
  app.post("/api/voice-analysis", async (req, res) => {
    try {
      const analysisData = insertVoiceAnalysisSchema.parse(req.body);
      const analysis = await storage.createVoiceAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: "Invalid voice analysis data" });
    }
  });

  app.get("/api/voice-analysis/session/:sessionId", async (req, res) => {
    try {
      const analysis = await storage.getVoiceAnalysisBySession(req.params.sessionId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Facial analysis routes
  app.post("/api/facial-analysis", async (req, res) => {
    try {
      const analysisData = insertFacialAnalysisSchema.parse(req.body);
      const analysis = await storage.createFacialAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: "Invalid facial analysis data" });
    }
  });

  app.get("/api/facial-analysis/session/:sessionId", async (req, res) => {
    try {
      const analysis = await storage.getFacialAnalysisBySession(req.params.sessionId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Session insights routes
  app.post("/api/session-insights", async (req, res) => {
    try {
      const insightsData = insertSessionInsightsSchema.parse(req.body);
      const insights = await storage.createSessionInsights(insightsData);
      res.json(insights);
    } catch (error) {
      res.status(400).json({ message: "Invalid session insights data" });
    }
  });

  app.get("/api/session-insights/:sessionId", async (req, res) => {
    try {
      const insights = await storage.getSessionInsights(req.params.sessionId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
