# My Virtual Boss - Real Estate Edition

## Overview

This is a full-stack real estate productivity application built with React, Express, and PostgreSQL. The application serves as a personal productivity coach for real estate professionals, providing daily task management, CRM functionality, income tracking, and goal setting based on proven industry strategies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 27, 2025 - Prequalification Calculator Enhanced with Payment Breakdown
- **Enhanced Calculator**: Added detailed monthly payment breakdown showing principal, interest, taxes, insurance, PMI, and HOA fees
- **Real-time Updates**: Implemented automatic recalculation when any parameter is modified in results view
- **ZIP Code Reference**: ZIP code field maintained for reference purposes only (no API calls)
- **Manual Rate Entry**: Users manually enter local property tax and insurance rates for accuracy
- **Professional Standards**: Removed API dependencies to ensure consistent calculator performance
- **Payment Transparency**: Clear breakdown helps clients understand all components of monthly housing costs

### January 27, 2025 - Professional CMA Tool with Authentic Data Integrity Completed
- **Major Achievement**: Successfully eliminated all synthetic/fake comparable sales data generation
- **Professional Behavior**: CMA tool now provides honest error reporting when authentic sales data unavailable
- **Address Handling**: Fixed ATTOM address parsing and implemented intelligent street type conversion handling
- **Multiple API Endpoints**: Implemented saleshistory, sale/snapshot, and radius-based sales search methods
- **Data Integrity**: System refuses to generate fake comparables, maintaining professional real estate standards
- **Honest Reporting**: Clear error messages explain data limitations instead of providing synthetic information
- **Real Estate Professional Grade**: Tool now meets industry standards for authentic data usage

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: Hot reload with Vite middleware integration

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle with migration support
- **Key Tables**:
  - Users (with onboarding data, SWOT analysis, financial goals)
  - Tasks (scheduled activities with progress tracking)
  - Contacts (CRM with lead scoring and follow-up dates)
  - Income (quarterly tracking with property details)
  - Goals (annual and quarterly targets)
  - Activities (audit log of user actions)
  - Sessions (authentication session storage)

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Protected routes with middleware-based auth checks
- **User Management**: Automatic user creation/update on login

### Task Management
- **Categories**: Lead generation, relationship building, marketing, administrative
- **Scheduling**: Date-based task scheduling with time slots
- **Progress Tracking**: Target vs. actual completion tracking
- **Priority System**: High, medium, low priority classification

### CRM System
- **Contact Categories**: Prospects, clients, referral sources, vendors
- **Lead Scoring**: Numerical scoring system for prioritization
- **Follow-up Management**: Automated follow-up date tracking
- **Contact Sources**: Marketing campaign attribution

### Income Tracking
- **Quarterly Goals**: Automatic quarterly income goal creation
- **Transaction Types**: Various real estate income types (listings, sales, referrals)
- **Progress Visualization**: Charts showing progress toward annual goals
- **Property Association**: Income linked to specific property addresses

### Tools System
- **Dashboard-Style Interface**: Card-based layout matching the main dashboard design
- **Available Tools Section**: Currently active tools with advanced badges and descriptions
- **Coming Soon Section**: Preview of future tools with visual placeholders
- **Tool Navigation**: Single-tool focus mode with breadcrumb navigation
- **Investment Analysis Calculator**: Comprehensive rental property analysis with unit-by-unit breakdown
- **Prequalification Calculator**: Mortgage pre-approval calculations for client assistance
- **Seller's Net Sheet Calculator**: Location-specific closing cost calculations for 11 major states
- **Quick CMA Tool**: Authentic comparable market analysis using ATTOM Data API integration
- **DSCR Analysis**: Debt service coverage ratio with color-coded risk assessment
- **Future Projections**: 3-year and 5-year investment projections with growth assumptions
- **Auto-calculation**: Real-time renovation cost summation from itemized inputs
- **Real Estate API Integration**: ATTOM Data API for authentic property data and comparable sales
- **Expandable Architecture**: Designed to accommodate additional tools (Portfolio Tracker, Contract Generator, Cost Estimator, etc.)

### Onboarding Flow
- **Multi-step Process**: Vision setting, SWOT analysis, goal setting
- **Data Collection**: 5-year vision, mission, values, motivation
- **Financial Planning**: Annual income targets and commission averages
- **Goal Creation**: Automatic quarterly goal generation based on annual targets

## Data Flow

1. **Authentication**: User authenticates via Replit Auth → session stored in PostgreSQL
2. **Onboarding**: New users complete multi-step onboarding → data stored in user profile
3. **Task Management**: Users view/create/update tasks → real-time updates via TanStack Query
4. **CRM Operations**: Contact management with automatic follow-up scheduling
5. **Income Tracking**: Transaction recording with automatic goal progress calculation
6. **Dashboard Updates**: Real-time aggregation of tasks, contacts, and income data

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit's OpenID Connect service
- **Session Storage**: PostgreSQL with connect-pg-simple

### Real Estate Data APIs
- **ATTOM Data API**: 158 million property records, comparable sales, market analysis (30-day free trial)
- **RentCast API**: Property data, rental estimates, market trends (50 free calls/month)
- **Multi-source Integration**: Flexible architecture supporting multiple real estate data providers

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Management**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript for type safety across the full stack
- **API Integration**: Axios for external real estate API calls

### UI/UX Libraries
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reload with Vite middleware integration
- **Environment**: NODE_ENV=development with debug logging

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild compilation to `dist/index.js`
- **Static Assets**: Served directly by Express in production
- **Process**: Node.js server with compiled TypeScript

### Environment Configuration
- **Database**: Requires DATABASE_URL environment variable
- **Authentication**: Requires REPL_ID and Replit-specific auth variables
- **Sessions**: Requires SESSION_SECRET for secure session management
- **Domain**: Configurable via REPLIT_DOMAINS for auth callbacks

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared TypeScript types between client/server
2. **Authentication Choice**: Replit Auth chosen for seamless integration with Replit environment
3. **Database ORM**: Drizzle selected for type-safe database operations and migration support
4. **State Management**: TanStack Query for server state with optimistic updates
5. **UI Framework**: shadcn/ui for consistent, accessible components with Tailwind styling
6. **Build Strategy**: Vite for frontend, esbuild for backend to optimize bundle sizes
7. **Session Strategy**: Database-backed sessions for scalability and persistence

The application follows a traditional three-tier architecture with clear separation between presentation (React), business logic (Express), and data persistence (PostgreSQL) layers.