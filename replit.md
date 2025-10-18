# School Attendance Management System

## Overview

A comprehensive school attendance tracking and management system built for educational institutions. The application provides student registration, attendance marking, leave management, and analytics dashboards with real-time insights into student attendance patterns.

The system is designed as a utility-focused, data-intensive application that prioritizes information clarity, efficient workflows, and professional aesthetics appropriate for educational institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens

**Design System**:
- Material Design 3-inspired approach with modern admin panel aesthetics
- Dark mode primary with light mode support via ThemeProvider
- Custom color palette using HSL color space for both themes
- Typography: Inter for UI elements, JetBrains Mono for technical data
- Responsive design with mobile-first approach

**Key UI Patterns**:
- Sidebar navigation for main application sections
- Card-based layouts for data presentation
- Modal dialogs for forms and confirmations
- Toast notifications for user feedback
- Real-time data visualization with Recharts

### Backend Architecture

**Server Framework**: Express.js (traditional long-lived server)
- Stateless architecture using JWT for authentication
- RESTful API design with `/api` prefix for all endpoints
- Cookie-based token storage with Bearer token header support
- Middleware-based request logging and error handling

**Authentication Flow**:
- JWT tokens for stateless authentication (Vercel-compatible)
- bcrypt for password hashing (10 rounds)
- No server-side sessions maintained
- Token expiration: 24 hours
- Auth middleware validates tokens on protected routes

**Data Layer**:
- Drizzle ORM for type-safe database operations
- Repository pattern via IStorage interface in storage.ts
- Separation of database logic from route handlers
- Type definitions shared between client and server via `/shared` directory

**API Structure**:
- Authentication: `/api/auth/*` (login, logout, check)
- Students: `/api/students/*` (CRUD operations, profiles)
- Attendance: `/api/attendance/*` (marking, querying by date/student)
- Leave Records: `/api/leaves/*` (creation, updates, queries)
- Dashboard: `/api/dashboard/stats` (aggregated analytics)

### Database Design

**Platform**: PostgreSQL via Neon with WebSocket pooling
- Neon configuration uses WebSocket constructor for Replit compatibility
- Connection pooling via `@neondatabase/serverless`
- Schema managed with Drizzle Kit migrations

**Core Tables**:

1. **admins**: Administrative users with hashed passwords
2. **students**: Student records with name, phone, profile image
3. **attendance**: Daily attendance records linked to students (present/absent/leave)
4. **leaveRecords**: Leave applications with dates, reasons, and status

**Schema Relationships**:
- Students have one-to-many relationships with attendance and leaveRecords
- Cascading deletes on student removal
- Timestamp tracking on all records

**Data Validation**:
- Drizzle-Zod schemas for runtime validation
- Type-safe insertions and queries
- Shared validation schemas between client and server

### Build and Deployment

**Development**:
- Vite for frontend development with HMR
- tsx for TypeScript execution in development
- Separate dev scripts for client and server

**Production Build**:
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.js`
- ESM module format throughout
- Static file serving via Express in production

**Deployment Target**: Replit (primary)
- Optimized for Replit's persistent server environment
- WebSocket pooling configuration for Neon database
- Includes Replit-specific Vite plugins in development

**Alternative Deployment** (Vercel):
- Would require architectural changes (see VERCEL_DEPLOYMENT.md)
- Need conversion from long-lived Express to serverless functions
- Need HTTP pooling instead of WebSocket pooling for Neon

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres database
  - WebSocket pooling for connection management
  - DATABASE_URL environment variable required
  - Drizzle ORM for queries and migrations

### UI Component Libraries
- **Shadcn/ui**: Component collection built on Radix UI
- **Radix UI**: Headless UI primitives for accessibility
- **Material UI Icons**: Icon set for navigation and actions
- **Recharts**: Charting library for analytics visualizations

### Authentication & Security
- **jsonwebtoken**: JWT creation and verification
- **bcrypt**: Password hashing and comparison
- **cookie-parser**: Cookie handling middleware

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Replit Plugins**: Development experience enhancements
  - Runtime error modal
  - Cartographer (code navigation)
  - Dev banner

### Validation & Type Safety
- **Zod**: Runtime schema validation
- **drizzle-zod**: Bridge between Drizzle schemas and Zod
- TypeScript for compile-time type checking

### Environment Variables
Required:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment designation (development/production)