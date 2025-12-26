# Mermaid UML Studio

All-in-one editor for Mermaid diagrams and Markdown documentation with Google Drive integration.

## Features

- 📊 Mermaid Diagram Editor - Flowcharts, sequence diagrams, class diagrams
- 📝 Markdown Editor - Documentation with live preview
- 🎨 Dark Mode Support - Auto-switch based on system preferences
- 💾 Google Drive Integration - Save/load files (optional)
- 🔄 Auto-Update Preview - Real-time preview
- 📋 Templates - Quick start templates
- ⚙️ Customizable - Font size, line height, custom CSS
- 🔍 Zoom & Pan - Interactive diagram viewing

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3700
```

## Tech Stack

Next.js 15, TypeScript, Tailwind CSS v3, Mermaid.js, Marked

## Project Structure

```
mermaid-uml-studio/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page (/)
│   ├── mermaid/        # Mermaid editor route
│   │   └── page.tsx    # /mermaid
│   └── markdown/       # Markdown editor route
│       └── page.tsx    # /markdown
├── components/         # React components
│   ├── LandingPage.tsx
│   ├── MermaidPreview.tsx
│   ├── MarkdownPreview.tsx
│   ├── Toolbar.tsx
│   └── SettingsModal.tsx
├── hooks/              # Custom React hooks
│   └── useGoogleDrive.ts
├── lib/                # Utilities and constants
│   └── constants.ts
├── types/              # TypeScript type definitions
│   └── types.ts
├── styles/             # Global styles
│   └── globals.css
├── public/             # Static assets
└── .env.local          # Environment variables (optional)
```

## Environment (Optional)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GOOGLE_API_KEY=...
```
