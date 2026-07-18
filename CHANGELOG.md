# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- High-Quality PNG Export: Added a settings modal when exporting Mermaid diagrams to PNG to configure transparent backgrounds and custom padding. Fixed canvas `SecurityError` by serializing SVG to base64 Data URLs.
- Local Theme Preview: Added an independent dark/light mode toggle within the Mermaid preview component to visualize diagrams in both environments without changing the global app theme.
- Accessibility (WCAG 2.1 AA): Markdown collapsible headings now support full keyboard navigation via `tabindex="0"`, `role="button"`, and `aria-expanded` attributes. Headings can be toggled using `Enter` or `Space` keys.
- Unified error handling: Integrated `handleError` for local file read/write operations to provide consistent and user-friendly UI feedback on I/O failures.
- Collapsible editor panel: toggle button on the editor/preview divider allows collapsing the code editor to maximize preview area, with smooth CSS transitions and chevron icon indicator.
- Collapsible headings in Markdown preview: click any heading to collapse/expand its section content, with nested collapse state preserved across re-renders.
- Side Outline panel: floating table-of-contents in the top-right corner of Markdown preview, with heading hierarchy, color-coded level indicators, smooth scroll navigation, and click-outside-to-close.
- Docusaurus-style sticky outline: on large screens when the left code editor is collapsed, the outline automatically converts into a clean, transparent, borderless inline panel on the right side of the page, sticky at the top-right of the viewport.
- Workspace rules configuration: added `AGENTS.md` rules at the project root for unified agent guidance, replacing the obsolete `.github/antigravity-skill.md`.

### Changed

- Architectural Refactoring: Extracted the Markdown outline panel rendering logic into a standalone `<MarkdownOutline />` component, significantly decoupling layout complexity from the main `MarkdownPreview` component.
- Widen Markdown preview content area from `max-width: 48rem` to `max-width: 80rem` with full-width on smaller screens.
- Wrapped Mermaid source code downloads in markdown code blocks (```mermaid ... ```) for seamless rendering in markdown viewers, while automatically stripping the code fences when reading a file in Mermaid mode.

### Fixed

- Sidebar layout regression: fixed an issue where the sticky sidebar outline would render above the Markdown content on large screens instead of side-by-side, by splitting the `MarkdownOutline` component into `floating` and `sidebar` modes and rendering them in their correct structural containers.
- Clean Architecture: Resolved all outstanding ESLint warnings across the codebase by removing unused variables (`Theme`, `initializedRef`, etc.) and fixing unnecessary React Hook dependencies for optimized performance.
- Heading collapse event handler: refactored individual heading click listeners to use a single event delegation handler on the container, preventing listeners from getting lost during React state updates and Mermaid rendering.

## [0.3.0] - 2026-07-14

### Added

- Template selection tracking: display selected template name in toolbar with automatic reset on code change.

### Fixed

- Force dark theme and update Mermaid color palette for better contrast.

### Changed

- Standardize dark theme visual styles and Mermaid configurations across preview components.

## [0.2.0] - 2026-07-13

### Changed

- Remove Google Drive integration and update Mermaid theme rendering logic.

### Added

- Custom animations (fade-in, slide-up, scale-in, pulse-soft) and glassmorphism effects for enhanced UI aesthetics.
- Improved settings modal functionality.

### Changed

- Migrate to Tailwind CSS v4 and update project configuration and ESLint rules.

## [0.1.0] - 2026-07-12

### Added

- Initial project setup with Next.js App Router.
- Mermaid diagram editor with live preview.
- Markdown documentation editor with live preview.
- Unified landing page with mode selection.
- Code editor with syntax highlighting and line numbers.
- Toolbar with file operations (load/save local files).
- Auto-update preview with debounced rendering.
- Dark mode support.
