# Overview

This is a real-time chat application built with a modern full-stack architecture. The application features a React frontend with TypeScript, an Express.js backend, and integrates with Supabase for real-time messaging capabilities. It includes user authentication, chat management, message reactions, file sharing, and responsive design optimized for both desktop and mobile devices.

# User Preferences

Preferred communication style: Simple, everyday language.
Theme requirements: Both dark and light theme support with system preference detection.
Mobile responsiveness: Fully mobile-friendly single page application similar to WhatsApp.

# System Architecture

## Frontend Architecture

The client is built using React 18 with TypeScript and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for consistent, accessible UI components
- **Styling**: Tailwind CSS with CSS variables for theming support and dark mode capability
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The server uses Express.js with TypeScript in a modular structure:

- **API Layer**: Express routes with middleware for logging, error handling, and JSON parsing
- **Storage Interface**: Abstracted storage layer with a memory-based implementation (IStorage interface)
- **Development Setup**: Vite middleware integration for hot module replacement during development
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Database & Schema Design

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Users Table**: Stores user profiles with authentication data, online status, and avatar information
- **Chats Table**: Manages chat rooms with support for both direct messages and group chats
- **Chat Members Table**: Junction table for many-to-many relationship between users and chats
- **Messages Table**: Stores all messages with support for different message types (text, image, file, voice)
- **Message Reactions Table**: Handles emoji reactions on messages with user tracking

The schema supports advanced features like message replies, read receipts, delivery status, and file attachments.

## Authentication System

Authentication is handled through Supabase Auth:

- **User Registration**: Email/password signup with email verification
- **User Login**: Secure authentication with session management
- **Profile Management**: User profile creation and updates integrated with the database schema
- **Session Handling**: Automatic session refresh and logout functionality

## Real-time Features

Real-time functionality is implemented using Supabase's real-time subscriptions:

- **Live Messaging**: Instant message delivery using PostgreSQL change streams
- **Online Presence**: Real-time user online/offline status updates
- **Typing Indicators**: Live typing status for enhanced user experience
- **Message Reactions**: Real-time emoji reactions and counters

## File Handling

The application supports file sharing capabilities:

- **Upload System**: File upload functionality integrated with Supabase Storage
- **Multiple File Types**: Support for images, documents, and voice messages
- **File Metadata**: Storage of file names, sizes, and URLs in the database
- **Download Features**: Secure file download and preview capabilities

## Responsive Design

The UI is designed to work seamlessly across devices:

- **Mobile-First**: Responsive design with mobile-optimized layouts
- **Adaptive Sidebar**: Collapsible sidebar that adapts to screen size
- **Touch-Friendly**: Mobile-optimized interactions and touch targets
- **Progressive Enhancement**: Graceful degradation for different device capabilities

# External Dependencies

## Core Services

- **Supabase**: Primary backend service providing PostgreSQL database, real-time subscriptions, authentication, and file storage
- **Neon Database**: PostgreSQL database service for production deployments (configured via DATABASE_URL)

## Frontend Libraries

- **React Ecosystem**: React 18, React DOM, React Hook Form for form management
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **State Management**: TanStack React Query for server state and caching
- **Validation**: Zod for runtime type validation and schema definition
- **Utilities**: clsx and class-variance-authority for conditional styling
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography

## Backend Libraries

- **Express.js**: Web framework for API routes and middleware
- **Database**: Drizzle ORM with PostgreSQL adapter for type-safe database operations
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## Development Tools

- **Build Tools**: Vite for frontend building, esbuild for backend bundling
- **TypeScript**: Full TypeScript support across frontend and backend
- **Linting & Formatting**: TypeScript compiler for type checking
- **Replit Integration**: Specialized plugins for Replit development environment

## Database Migration

- **Drizzle Kit**: Database schema migrations and management
- **PostgreSQL**: Production-ready relational database with JSON support for complex data structures