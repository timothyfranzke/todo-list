# Full-Stack Todo Application

## Overview

This is a modern full-stack todo application built with React (frontend) and Express.js (backend). The application follows a monorepo structure with shared TypeScript schemas and uses shadcn/ui components for a polished user interface. The architecture supports both development and production environments with proper build and deployment configurations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: In-memory storage fallback for development/testing

### Build System
- **Development**: Vite dev server with HMR and Express backend
- **Production**: Static assets served by Express with esbuild bundling
- **TypeScript**: Shared configuration across client, server, and shared modules

## Key Components

### Database Schema (`shared/schema.ts`)
- **Todos Table**: Core todo functionality with title, completion status, and timestamps
- **Users Table**: User authentication with username/password
- **Validation Schemas**: Zod schemas for type-safe data validation and API contracts

### Storage Layer (`server/storage.ts`)
- **Interface-based Design**: `IStorage` interface allows switching between storage implementations
- **Memory Storage**: Development fallback with in-memory data structures
- **Database Integration**: Ready for PostgreSQL integration via Drizzle ORM

### API Layer (`server/routes.ts`)
- **RESTful Endpoints**: Full CRUD operations for todos
- **Input Validation**: Zod schema validation for all API inputs
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Type Safety**: Shared TypeScript types between frontend and backend

### Frontend Features
- **Modern UI**: Clean, responsive design with shadcn/ui components
- **Real-time Updates**: Optimistic updates with React Query
- **Form Validation**: Client-side validation matching backend schemas
- **Filter System**: View todos by status (all, active, completed)
- **Progress Tracking**: Visual progress indicators for todo completion
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests using fetch API with proper error handling
2. **API Validation**: Backend validates requests using shared Zod schemas
3. **Storage Operations**: Abstracted storage layer handles data persistence
4. **Response Handling**: Consistent JSON responses with error handling
5. **Client Updates**: React Query manages cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connectivity
- **ORM**: `drizzle-orm` and `drizzle-kit` for database operations and migrations
- **UI Components**: Extensive Radix UI component library for accessible UI primitives
- **Validation**: `zod` for runtime type validation and schema definition
- **HTTP Client**: `@tanstack/react-query` for server state management

### Development Tools
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Replit Integration**: Custom plugins for development environment
- **Code Quality**: ESLint and TypeScript for code quality and type safety

## Deployment Strategy

### Development Environment
- Single command setup with `npm run dev`
- Concurrent frontend and backend development servers
- Hot module replacement for rapid development
- In-memory storage for quick testing

### Production Build
- Static asset compilation with Vite
- Server bundling with esbuild for Node.js deployment
- Environment-based configuration for database connections
- Optimized assets with proper caching headers

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Ports**: Development on 5000, production on 80
- **Deployment**: Autoscale deployment target with proper build commands
- **Environment**: PostgreSQL database provisioning with environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 26, 2025. Initial setup