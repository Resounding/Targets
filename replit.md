# Business Planner - Weekly Task & Time Management System

## Overview

Business Planner is a comprehensive weekly task and time management system designed to help businesses track work across multiple customers, set weekly targets, and monitor progress. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for data validation
- **API Design**: RESTful API with structured error handling

### Database Schema
The system uses four main entities:
1. **Customers**: Client information with billing rates
2. **Weekly Schedules**: Week-specific overall goals and planning
3. **Targets**: Customer-specific weekly hour targets and objectives
4. **Tasks**: Individual work items with time tracking and billing status

## Key Components

### Data Models
- **Customer**: Stores client information, billing rates, and contact details
- **Weekly Schedule**: Represents planning for a specific week with overall goals
- **Target**: Links customers to weekly schedules with specific hour targets
- **Task**: Individual work items with date, duration, notes, and billing status

### API Layer
- RESTful endpoints for all CRUD operations
- Structured error handling with proper HTTP status codes
- Input validation using Zod schemas
- Relationship-aware queries with joins for complex data retrieval

### UI Components
- **Dashboard**: Weekly view with task columns for each day (Monday-Saturday)
- **Sidebar Navigation**: Clean navigation between different sections
- **Form Components**: Reusable forms for creating/editing entities
- **Task Management**: Drag-and-drop interface for task organization

## Data Flow

1. **Weekly Planning**: Users create weekly schedules with overall goals
2. **Target Setting**: Define customer-specific targets with hour allocations
3. **Task Creation**: Create individual tasks linked to customers and targets
4. **Progress Tracking**: Monitor actual hours vs. targets with visual indicators
5. **Revenue Calculation**: Automatic calculation of billable hours and estimated revenue

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- File-based routing with middleware
- Environment-based configuration
- Replit-specific integrations for cloud development

### Production Build
- Vite builds optimized client bundle
- ESBuild bundles server code for Node.js
- Static assets served from Express
- Environment variable configuration for database connections

### Database Management
- Drizzle Kit for schema migrations
- PostgreSQL dialect with Neon serverless
- Connection pooling for efficient resource usage
- Migration files stored in `/migrations` directory

## Changelog

- July 05, 2025. Initial setup
- July 05, 2025. Updated database schema to separate estimated and actual hours tracking
  - Replaced single `hours` field with `estimatedHours` and `actualHours` fields
  - Updated all storage methods and API endpoints to use new schema
  - Enhanced UI to display both estimated (blue) and actual (green) hours
  - Added separate totals for estimated and actual hours/revenue in daily columns and weekly header

## User Preferences

Preferred communication style: Simple, everyday language.