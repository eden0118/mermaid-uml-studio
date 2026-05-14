# Mermaid UML Studio

A high-performance, all-in-one editor for Mermaid diagrams and Markdown documentation with seamless Google Drive integration.

## Key Features

- Mermaid Diagram Studio: Comprehensive support for flowcharts, sequence diagrams, class diagrams, and more.
- Markdown Documentation: Professional editor for documentation with live, high-fidelity preview.
- Intelligent Dark Mode: Automatic theme switching based on system preferences with manual toggle.
- Google Drive Connectivity: Securely save and load files directly from your Google Drive.
- Real-time Sync: Low-latency preview updates with optional manual update mode.
- Industry Templates: One-click access to standard UML and diagram templates.
- Advanced Customization: Fine-grained control over font size, line height, and custom CSS overrides.
- Interactive Canvas: Responsive zoom and pan functionality for complex diagram inspection.

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:3700`.

## Technical Architecture

The project is built on a modern, robust stack optimized for performance and maintainability:

- Core Framework: Next.js 16.2 (App Router) & React 19
- Language: TypeScript 5.8 (Strict Type Safety)
- Styling: Tailwind CSS v4
- Diagram Rendering: Mermaid.js 11
- Markdown Parsing: Marked.js 11
- Icons: Lucide React
- Error Management: Unified Error Handling System (lib/utils.ts)

## Project Structure

```
mermaid-uml-studio/
├── app/                # Next.js App Router (Pages and Layouts)
│   ├── layout.tsx      # Root application layout
│   ├── page.tsx        # Unified landing page
│   ├── mermaid/        # Mermaid studio route
│   └── markdown/       # Markdown documentation route
├── components/         # Reusable UI components
│   ├── EditorPage.tsx  # Core editor layout engine
│   ├── CodeEditor.tsx  # High-performance text editor
│   ├── MermaidPreview.tsx
│   ├── MarkdownPreview.tsx
│   └── Toolbar.tsx     # Global action bar
├── hooks/              # Custom React hooks (Google Drive, etc.)
├── lib/                # Core logic, constants, and utilities
├── types/              # Centralized TypeScript definitions
└── styles/             # Global CSS and Tailwind configuration
```

## Configuration (Optional)

To enable Google Drive integration, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
```

## Development Guidelines

- Architecture First: Maintain scalability through modular components and custom hooks.
- Type Safety: Ensure all new features are strictly typed.
- SSR Safety: Use dynamic imports for browser-only libraries (e.g., Mermaid.js).
- Performance: Optimize rendering through strategic use of memoization.
