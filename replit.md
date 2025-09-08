# replit.md

## Overview

This is a mobile-first Point of Sale (POS) and financial recording application for small and medium enterprises (UMKM), designed to replicate the core functionality of BukuWarung. The application enables small business owners to record transactions, manage inventory, track customer debts, and generate financial reports. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS for styling with shadcn/ui component library for consistent, accessible UI components
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation and touch-friendly interfaces
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation and type safety

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API endpoints following conventional patterns
- **Middleware**: Express middleware for request logging, JSON parsing, and error handling
- **Development Tools**: tsx for TypeScript execution in development, esbuild for production builds

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection Pooling**: Neon serverless connection pooling for efficient database connections
- **Offline Support**: Local storage-based queue system for offline transaction handling

### Authentication and Authorization
- **User Roles**: Multi-role system supporting owner, admin, and cashier roles
- **Store Management**: Multi-store support with user permissions per store
- **Session Management**: Planned JWT-based authentication (not yet implemented)

### External Service Integrations
- **WhatsApp Integration**: Planned WhatsApp Business API integration for automated customer debt reminders
- **Payment Methods**: Support for multiple payment methods including cash, transfer, e-wallet, and QRIS
- **File Storage**: Planned integration with cloud storage for receipt and document management

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema validation

### UI and Styling Dependencies
- **tailwindcss**: Utility-first CSS framework
- **@radix-ui/***: Headless UI components for accessibility
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Icon library
- **clsx**: Conditional className utility

### Database and Backend Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Zod integration for Drizzle schemas
- **connect-pg-simple**: PostgreSQL session store

### Development and Build Dependencies
- **vite**: Frontend build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: JavaScript bundler for backend builds
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tools

### Utility Dependencies
- **date-fns**: Date manipulation library
- **ws**: WebSocket client for database connections
- **nanoid**: Unique ID generation