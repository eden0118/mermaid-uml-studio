# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Collapsible editor panel: toggle button on the editor/preview divider allows collapsing the code editor to maximize preview area, with smooth CSS transitions and chevron icon indicator.
- Collapsible headings in Markdown preview: click any heading to collapse/expand its section content, with nested collapse state preserved across re-renders.
- Side Outline panel: floating table-of-contents in the top-right corner of Markdown preview, with heading hierarchy, color-coded level indicators, smooth scroll navigation, and click-outside-to-close.

### Changed

- Widen Markdown preview content area from `max-width: 48rem` to `max-width: 80rem` with full-width on smaller screens.

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
