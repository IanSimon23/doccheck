# CLAUDE.md - claudemd Project Context

## Project Overview

**claudemd** is a CLI tool that generates and maintains living documentation (CLAUDE.md files) for software projects. It solves the problem of documentation drift by automatically detecting when documented practices diverge from actual project reality.

**Core Philosophy**: Documentation should reflect reality, not aspiration. This tool validates that what you say you do matches what you actually do.

## Project Goals

### Immediate Goals
- Build CLI tool that can bootstrap CLAUDE.md files from existing project architecture
- Implement validation logic to detect drift between documentation and reality
- Dogfood the tool on itself and across Ian's project portfolio

### Future Goals
- Web-based interview tool for initial CLAUDE.md generation (claudemd-init)
- CI/CD integration for automated validation
- Template system for different project types
- Potential expansion beyond Claude-specific use cases

## Tech Stack

**Primary Language**: Node.js (to be determined - could be Python)
**Target Environment**: CLI tool, cross-platform (Windows/WSL, macOS, Linux)
**Key Capabilities Needed**:
- File system scanning and analysis
- Markdown parsing and generation
- Git integration (optional - for commit pattern analysis)
- Package manager detection (npm, pip, etc.)

## Architecture Approach

**Keep It Simple**: Single-purpose CLI tool, avoid framework complexity
- Follow Ian's established pattern: practical deployment over complex solutions
- No unnecessary abstractions until proven needed
- Start with basic functionality, iterate based on real usage

## Development Practices

### Test-Driven Development
- Write tests first (Ian follows TDD)
- Use appropriate test runner for chosen language
- Aim for high coverage on validation logic (this is the core value)

### Git Workflow
- Clear commit messages
- Feature branches for new capabilities
- Regular commits as features develop

### Quality Standards
- Code should be self-documenting where possible
- Error messages must be helpful (this is a developer tool)
- CLI output should be clean and actionable

## Core Features to Build

### Phase 1: Bootstrap (init command)
**What it does**: Scans existing project and generates initial CLAUDE.md

**Detection capabilities**:
- File structure analysis (src, tests, docs directories)
- Package manager files (package.json, requirements.txt, Cargo.toml, etc.)
- README.md extraction (purpose, setup instructions)
- Testing patterns (file naming, location, framework)
- CI/CD presence (.github/workflows, .gitlab-ci.yml, etc.)
- Code patterns (import styles, component structure)

**Output**: CLAUDE.md template with:
- Auto-detected sections (tech stack, structure, commands)
- [NEEDS REVIEW] placeholders for domain knowledge
- Validation rules based on detected patterns

### Phase 2: Validation (check command)
**What it does**: Compares CLAUDE.md against current project state

**Validation types**:
- Tech stack versions match package files
- Documented file structure exists
- Testing practices are followed (files have tests, naming conventions)
- Configuration matches documentation (strict mode, linting rules)
- Scripts/commands documented are available

**Output**: Drift report with:
- ✓ Validated practices
- ⚠️ Discrepancies found
- 💡 Suggested updates
- Exit code for CI/CD integration

### Phase 3: Maintenance (update/suggest commands)
**What it does**: Helps keep CLAUDE.md current

**Capabilities**:
- Suggest additions when new patterns detected
- Flag outdated sections
- Optionally auto-update certain sections (tech versions)

## CLAUDE.md Structure Standard

Based on best practices discussion, a good CLAUDE.md includes:

1. **Project Overview**: Purpose, goals, current status
2. **Tech Stack**: Languages, frameworks, versions, key dependencies
3. **Architecture**: Decisions, patterns, folder structure
4. **Development Practices**: TDD approach, git workflow, code style
5. **Domain Knowledge**: Business rules, terminology, edge cases
6. **AI-Specific Guidance**: Common tasks, anti-patterns, gotchas
7. **Quality Gates**: Definition of Done, security, performance, accessibility

## Critical Decisions to Make

1. **Language choice**: Node.js (familiar, json parsing) vs Python (rich stdlib, file ops) vs Rust (fast, single binary)
2. **Configuration**: How does user specify what to validate? Inline in CLAUDE.md? Separate config file?
3. **Extensibility**: Plugin system? Or keep it simple initially?
4. **Update strategy**: Interactive prompts vs automated suggestions?

## Success Metrics

**Immediate validation**: Tool works on itself (bootstraps its own CLAUDE.md and validates it)
**Portfolio validation**: Successfully generates and validates CLAUDE.md for Ian's existing projects:
- BlogLog
- Knowledge Builder / Curiouscoach.tools components
- Jironaut
- Worthsmith
- Other portfolio pieces

**Value delivered**: Reduces time spent context-switching between projects by providing accurate, current documentation

## Known Constraints

- Ian works in Windows 11/WSL environment
- Must integrate with existing development workflow
- Should be quick to run (not slow CI/CD builds)
- Output must be useful for both humans and AI assistants

## Anti-Patterns to Avoid

- Creating "documentation for documentation's sake"
- Generic templates that add noise rather than signal
- Over-engineering before proving the concept
- Making it too opinionated about project structure
- Requiring extensive configuration to get value

## Next Steps

1. Choose implementation language
2. Scaffold basic CLI structure with Claude Code
3. Implement simple project scanner
4. Create CLAUDE.md template generator
5. Test on this project (bootstrap itself)
6. Test on BlogLog (first real validation)
7. Iterate based on findings

---

**Meta Note**: This CLAUDE.md was created through conversation analysis rather than project scanning - it represents the "ideal" that the tool should be able to generate automatically from examining project structure.
