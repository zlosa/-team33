# CareAI - Healthcare Communication Analysis Platform

## Overview

CareAI is a comprehensive healthcare communication platform that uses real-time voice and facial analysis to improve patient-caregiver interactions. The application captures multimodal data during healthcare sessions, analyzes communication patterns, emotional states, and engagement levels, and provides actionable insights to enhance care quality. Built as a full-stack web application with modern React frontend and Express.js backend, it features real-time analysis capabilities and a comprehensive dashboard for session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI System**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with structured error handling and request/response logging middleware
- **Development Server**: Custom Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Shared schema definitions between frontend and backend using Zod validation
- **Fallback Storage**: In-memory storage implementation for development/testing scenarios

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session storage using connect-pg-simple
- **User Management**: Basic username/password authentication system with hashed passwords
- **Security**: CORS configuration and secure session handling

### Data Models and Analysis
The application manages several key entities:
- **Users**: Basic user accounts for system access
- **Surveys**: Pre-session questionnaires capturing participant type, goals, and concerns
- **Sessions**: Core interaction records with start/end times and status tracking
- **Voice Analysis**: Real-time voice pattern recognition including emotional state, speech patterns, and confidence metrics
- **Facial Analysis**: Computer vision-based facial expression analysis with engagement scoring
- **Session Insights**: AI-generated recommendations and communication scores based on multimodal analysis

### Real-time Media Capture
- **Voice Capture**: Browser MediaRecorder API with audio processing for speech pattern analysis
- **Video Capture**: WebRTC camera access with face detection capabilities
- **Media Processing**: Client-side media stream handling with error management for device access permissions

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for consistent styling and responsive design
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Class Variance Authority**: Type-safe CSS class composition for component variants

### Data and State Management
- **Drizzle ORM**: Modern TypeScript ORM with compile-time safety and excellent PostgreSQL support
- **TanStack Query**: Powerful data synchronization library for API state management, caching, and background updates
- **Zod**: Runtime type validation and schema definition for data integrity across the stack

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL platform providing scalable database hosting with connection pooling
- **PostgreSQL**: Primary database for persistent data storage with ACID compliance

### Development and Build Tools
- **Vite**: Fast development server and optimized production builds with TypeScript support
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **TypeScript**: Type safety across the entire application stack

### Media and Real-time Features
- **WebRTC APIs**: Browser native media capture capabilities for voice and video analysis
- **MediaRecorder API**: Audio recording functionality for voice pattern analysis
- **getUserMedia API**: Camera and microphone access with permission handling

### Validation and Type Safety
- **React Hook Form**: Performant form library with built-in validation support
- **Hookform Resolvers**: Integration between React Hook Form and Zod for schema validation
- **Drizzle Zod**: Automatic Zod schema generation from Drizzle database schemas