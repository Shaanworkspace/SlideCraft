# PowerPoint-Style Presentation Editor

## Overview

This is a full-stack web application that replicates the core functionality of a PowerPoint-style presentation editor. The application allows users to create, manage, and edit presentations with multiple slides and interactive elements including text boxes, images, and basic shapes. Users can save their presentations to their local machine as JSON files and reload them for future editing. The application features a clean, intuitive interface with slide thumbnails, a central canvas area powered by Fabric.js, and a comprehensive toolbar for element manipulation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript in strict mode using Vite as the build tool
- **Canvas Library**: Fabric.js for canvas manipulation and element rendering
- **State Management**: Redux Toolkit for centralized state management with proper serialization handling for Fabric.js objects
- **Styling**: Tailwind CSS with custom CSS variables and shadcn/ui component library for consistent UI design
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in custom components for accessibility and consistency

### Backend Architecture
- **Server**: Express.js with TypeScript running in ESM mode
- **Development**: Hot module replacement (HMR) via Vite integration for development workflow
- **Storage Interface**: Abstracted storage layer with in-memory implementation as default, designed to be easily swapped for database persistence
- **API Structure**: RESTful API endpoints with proper error handling and request logging middleware

### State Management Design
- **Presentation State**: Redux slice managing presentations, slides, and elements with proper typing
- **UI State**: Separate state management for UI concerns like selected tools, zoom levels, and element selection
- **History Management**: Undo/redo functionality with proper state snapshots
- **Canvas Integration**: Custom hooks for Fabric.js integration with Redux state synchronization

### Data Schema and Validation
- **Zod Schemas**: Comprehensive type-safe schemas for all data structures including presentations, slides, and different element types (text, shapes, images)
- **Element Types**: Strongly typed union types for different canvas elements with specific properties for each type
- **Serialization**: JSON-based persistence with proper handling of Fabric.js canvas state

### File Operations and Persistence
- **Local File System**: Browser-based file operations using File System Access API where supported, falling back to traditional download/upload methods
- **Export Functionality**: Canvas export to PNG images with proper data URL handling
- **JSON Format**: Human-readable JSON format for presentation files with complete state preservation

### Canvas Management
- **Fabric.js Integration**: Custom React hooks for canvas lifecycle management and event handling
- **Element Manipulation**: Add, edit, move, resize, and delete functionality for all element types
- **Selection Management**: Multi-element selection with property editing capabilities
- **Zoom and Pan**: Canvas viewport management with zoom controls and proper coordinate transformation

### Component Architecture
- **Modular Design**: Separated concerns with dedicated components for toolbar, canvas area, side panel, properties panel, and status bar
- **Custom Hooks**: Reusable logic extracted into custom hooks for canvas management, file operations, and state management
- **Event Handling**: Proper event delegation and cleanup for canvas interactions and keyboard shortcuts

## External Dependencies

### Core Libraries
- **React**: Frontend framework with TypeScript support
- **Redux Toolkit**: State management with built-in best practices
- **Fabric.js**: Canvas manipulation and graphics rendering
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Zod**: Runtime type validation and schema definition

### UI Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives including dialogs, tooltips, dropdowns, and form controls
- **Lucide React**: Consistent icon library for UI elements
- **Class Variance Authority**: Type-safe CSS class composition
- **shadcn/ui**: Pre-built component library built on Radix UI

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking with strict mode enabled
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Database and Storage
- **Drizzle ORM**: TypeScript-first ORM configured for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **Drizzle Kit**: Database migration and introspection tools

### Utility Libraries
- **nanoid**: Unique ID generation for elements and presentations
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight React router
- **@tanstack/react-query**: Server state management and data fetching

### Hosting and Deployment
- **Vercel/Netlify**: Production hosting platforms with automatic deployments
- **Node.js**: Server runtime environment for production builds