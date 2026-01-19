# CLAUDE.md - DocCheck Project Context

## Project Overview

**DocCheck** is a CLI tool that generates and maintains living documentation (CLAUDE.md files) for software projects. It solves the problem of documentation drift by automatically detecting when documented practices diverge from actual project reality.

**Core Philosophy**: Documentation should reflect reality, not aspiration. This tool validates that what you say you do matches what you actually do.

## Current State

### What's Built
- **CLI** (`doccheck`): Node.js/TypeScript with Commander.js
  - `doccheck init` - Scans project and generates CLAUDE.md
  - `doccheck check` - Validates CLAUDE.md against project state
  - `doccheck serve` - Starts web interface for interactive editing
- **Web App**: React + Vite + Tailwind CSS
  - Interview wizard for guided CLAUDE.md creation
  - Brainstorm scratchpad for freeform ideation
  - Audit Review for viewing validation results
  - Editor for direct CLAUDE.md editing
  - Settings for managing profiles and defaults
- **Config System**: `~/.doccheck/config.json`
  - Multiple profiles for different project types
  - Global defaults that apply across profiles

### Validation Capabilities
- README claims extraction (tech stack, structure, commands)
- Drift detection comparing claims vs actual project state
- Tech stack validation against package.json dependencies
- Directory structure validation
- npm script validation

## Tech Stack

- **Language**: TypeScript (Node.js)
- **CLI Framework**: Commander.js
- **Web Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Package Manager**: npm

## Project Structure

```
src/
  commands/     # CLI command handlers (init, check, serve)
  scanner/      # Project analysis and README parsing
  validator/    # Drift detection logic
  generator/    # CLAUDE.md content generation
  config/       # Profile and settings management
web/
  src/
    components/ # React components (Interview, Brainstorm, etc.)
tests/          # Vitest tests
```

## Development Practices

- Use `bl commit` for git commits (BlogLog integration)
- Use `bl win` to log significant milestones
- Use `bl note` for observations and bugs
- Run `npm run build` after CLI changes
- Run `npm run build` in web/ after web changes

## Known Issues

- **Settings bug**: Profile name editing causes form to collapse after typing one character. Other fields work fine. Needs investigation.

## AI-Specific Guidance

- The tool is called "DocCheck" but generates CLAUDE.md files (that's the convention Claude Code uses)
- Config directory is `~/.doccheck/`
- Web app is served from `web/dist/` via the API server
- Default port for `doccheck serve` is 3001
