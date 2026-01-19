# DocCheck

A CLI tool that generates and validates living CLAUDE.md documentation for software projects.

## Overview

DocCheck solves the problem of documentation drift by automatically detecting when documented practices diverge from actual project reality. It generates and maintains CLAUDE.md files - the convention Claude Code uses for project context.

**Core Philosophy**: Documentation should reflect reality, not aspiration.

## Features

- **Project scanning** - Analyzes your codebase to extract tech stack, structure, and practices
- **Drift detection** - Validates that documented claims match actual project state
- **Interactive web UI** - Guided interview wizard, brainstorm scratchpad, and direct editing
- **Profile system** - Multiple configuration profiles for different project types

## Installation

```bash
npm install -g doccheck
```

Requires Node.js >= 20.0.0

## Usage

### Generate documentation

Scan a project and generate a CLAUDE.md file:

```bash
doccheck init
```

### Validate documentation

Check if your CLAUDE.md matches the actual project state:

```bash
doccheck check
```

### Interactive mode

Start the web interface for guided editing:

```bash
doccheck serve
```

Opens at http://localhost:3001 by default.

## Validation Capabilities

- README claims extraction (tech stack, structure, commands)
- Tech stack validation against package.json dependencies
- Directory structure validation
- npm script validation

## Development

### Setup

```bash
npm install
cd web && npm install
```

### Build

```bash
npm run build        # Build CLI
cd web && npm run build  # Build web app
```

### Test

```bash
npm test
```

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

## Tech Stack

- **CLI**: TypeScript, Commander.js
- **Web**: React 18, Vite 5, Tailwind CSS
- **Testing**: Vitest

## Configuration

DocCheck stores configuration in `~/.doccheck/config.json`, supporting multiple profiles and global defaults.

## License

MIT
