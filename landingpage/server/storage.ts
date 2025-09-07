import { 
  type User, 
  type InsertUser, 
  type Survey, 
  type InsertSurvey,
  type Session,
  type InsertSession,
  type VoiceAnalysis,
  type InsertVoiceAnalysis,
  type FacialAnalysis,
  type InsertFacialAnalysis,
  type SessionInsights,
  type InsertSessionInsights
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: string): Promise<Survey | undefined>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  endSession(id: string): Promise<Session | undefined>;
  getActiveSessions(): Promise<Session[]>;
  
  createVoiceAnalysis(analysis: InsertVoiceAnalysis): Promise<VoiceAnalysis>;
  getVoiceAnalysisBySession(sessionId: string): Promise<VoiceAnalysis[]>;
  
  createFacialAnalysis(analysis: InsertFacialAnalysis): Promise<FacialAnalysis>;
  getFacialAnalysisBySession(sessionId: string): Promise<FacialAnalysis[]>;
  
  createSessionInsights(insights: InsertSessionInsights): Promise<SessionInsights>;
  getSessionInsights(sessionId: string): Promise<SessionInsights[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;
  private sessions: Map<string, Session>;
  private voiceAnalysis: Map<string, VoiceAnalysis>;
  private facialAnalysis: Map<string, FacialAnalysis>;
  private sessionInsights: Map<string, SessionInsights>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.sessions = new Map();
    this.voiceAnalysis = new Map();
    this.facialAnalysis = new Map();
    this.sessionInsights = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = randomUUID();
    const survey: Survey = { 
      ...insertSurvey, 
      id, 
      createdAt: new Date() 
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async getSurvey(id: string): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { 
      ...insertSession, 
      id, 
      startedAt: new Date(),
      endedAt: null,
      status: "active"
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async endSession(id: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (session) {
      const updatedSession = { 
        ...session, 
        endedAt: new Date(), 
        status: "completed" as const 
      };
      this.sessions.set(id, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.status === "active"
    );
  }

  async createVoiceAnalysis(insertAnalysis: InsertVoiceAnalysis): Promise<VoiceAnalysis> {
    const id = randomUUID();
    const analysis: VoiceAnalysis = {
      ...insertAnalysis,
      id,
      timestamp: new Date()
    };
    this.voiceAnalysis.set(id, analysis);
    return analysis;
  }

  async getVoiceAnalysisBySession(sessionId: string): Promise<VoiceAnalysis[]> {
    return Array.from(this.voiceAnalysis.values()).filter(
      analysis => analysis.sessionId === sessionId
    );
  }

  async createFacialAnalysis(insertAnalysis: InsertFacialAnalysis): Promise<FacialAnalysis> {
    const id = randomUUID();
    const analysis: FacialAnalysis = {
      ...insertAnalysis,
      id,
      timestamp: new Date()
    };
    this.facialAnalysis.set(id, analysis);
    return analysis;
  }

  async getFacialAnalysisBySession(sessionId: string): Promise<FacialAnalysis[]> {
    return Array.from(this.facialAnalysis.values()).filter(
      analysis => analysis.sessionId === sessionId
    );
  }

  async createSessionInsights(insertInsights: InsertSessionInsights): Promise<SessionInsights> {
    const id = randomUUID();
    const insights: SessionInsights = {
      ...insertInsights,
      id,
      timestamp: new Date()
    };
    this.sessionInsights.set(id, insights);
    return insights;
  }

  async getSessionInsights(sessionId: string): Promise<SessionInsights[]> {
    return Array.from(this.sessionInsights.values()).filter(
      insights => insights.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();
