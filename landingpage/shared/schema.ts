import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const surveys = pgTable("surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantType: text("participant_type").notNull(),
  sessionGoal: text("session_goal").notNull(),
  concerns: text("concerns"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").references(() => surveys.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  status: text("status").notNull().default("active"),
});

export const voiceAnalysis = pgTable("voice_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  emotionalState: text("emotional_state"),
  speechPatterns: text("speech_patterns"),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  rawData: jsonb("raw_data"),
});

export const facialAnalysis = pgTable("facial_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  expression: text("expression"),
  engagement: text("engagement"),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  rawData: jsonb("raw_data"),
});

export const sessionInsights = pgTable("session_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  communicationScore: integer("communication_score"),
  comfortLevel: text("comfort_level"),
  recommendations: jsonb("recommendations"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert Schemas
export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startedAt: true,
});

export const insertVoiceAnalysisSchema = createInsertSchema(voiceAnalysis).omit({
  id: true,
  timestamp: true,
});

export const insertFacialAnalysisSchema = createInsertSchema(facialAnalysis).omit({
  id: true,
  timestamp: true,
});

export const insertSessionInsightsSchema = createInsertSchema(sessionInsights).omit({
  id: true,
  timestamp: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertVoiceAnalysis = z.infer<typeof insertVoiceAnalysisSchema>;
export type VoiceAnalysis = typeof voiceAnalysis.$inferSelect;

export type InsertFacialAnalysis = z.infer<typeof insertFacialAnalysisSchema>;
export type FacialAnalysis = typeof facialAnalysis.$inferSelect;

export type InsertSessionInsights = z.infer<typeof insertSessionInsightsSchema>;
export type SessionInsights = typeof sessionInsights.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
