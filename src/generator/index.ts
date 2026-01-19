import type { ProjectInfo } from '../scanner/index.js';

export function generateDoc(info: ProjectInfo): string {
  const sections: string[] = [];

  sections.push(generateHeader(info));
  sections.push(generateTechStack(info));
  sections.push(generateStructure(info));
  sections.push(generateDevelopmentPractices(info));
  sections.push(generatePlaceholderSections());

  return sections.join('\n\n');
}

function generateHeader(info: ProjectInfo): string {
  let header = `# CLAUDE.md - ${info.name} Project Context\n\n`;
  header += `## Project Overview\n\n`;

  if (info.readme) {
    const firstParagraph = extractFirstParagraph(info.readme);
    if (firstParagraph) {
      header += `${firstParagraph}\n`;
    } else {
      header += `[NEEDS REVIEW] Describe the purpose and goals of this project.\n`;
    }
  } else {
    header += `[NEEDS REVIEW] Describe the purpose and goals of this project.\n`;
  }

  return header;
}

function generateTechStack(info: ProjectInfo): string {
  let section = `## Tech Stack\n\n`;

  if (info.packageManager) {
    const pm = info.packageManager;
    section += `**Package Manager**: ${pm.type}\n`;

    const deps = Object.keys(pm.dependencies);
    const devDeps = Object.keys(pm.devDependencies);

    if (deps.length > 0) {
      section += `\n**Key Dependencies**:\n`;
      for (const dep of deps.slice(0, 10)) {
        section += `- ${dep}: ${pm.dependencies[dep]}\n`;
      }
    }

    if (devDeps.length > 0) {
      section += `\n**Dev Dependencies**:\n`;
      for (const dep of devDeps.slice(0, 10)) {
        section += `- ${dep}: ${pm.devDependencies[dep]}\n`;
      }
    }
  } else {
    section += `[NEEDS REVIEW] Document the languages, frameworks, and key dependencies.\n`;
  }

  return section;
}

function generateStructure(info: ProjectInfo): string {
  let section = `## Project Structure\n\n`;

  if (info.structure.directories.length > 0) {
    section += `\`\`\`\n`;
    for (const dir of info.structure.directories) {
      section += `${dir}/\n`;
    }
    section += `\`\`\`\n`;
    section += `\n[NEEDS REVIEW] Add descriptions for each directory.\n`;
  } else {
    section += `[NEEDS REVIEW] Document the project directory structure.\n`;
  }

  return section;
}

function generateDevelopmentPractices(info: ProjectInfo): string {
  let section = `## Development Practices\n\n`;

  if (info.hasTests) {
    section += `### Testing\n\n`;
    section += `Test files found. Patterns: ${info.testPatterns.join(', ')}\n`;
    section += `\n[NEEDS REVIEW] Document testing approach and conventions.\n`;
  }

  if (info.packageManager?.scripts && Object.keys(info.packageManager.scripts).length > 0) {
    section += `\n### Available Scripts\n\n`;
    for (const [name, command] of Object.entries(info.packageManager.scripts)) {
      section += `- \`npm run ${name}\`: ${command}\n`;
    }
  }

  if (info.cicd) {
    section += `\n### CI/CD\n\n`;
    section += `Platform: ${info.cicd.platform}\n`;
    section += `Workflow files: ${info.cicd.files.join(', ')}\n`;
  }

  return section;
}

function generatePlaceholderSections(): string {
  return `## Domain Knowledge

[NEEDS REVIEW] Document business rules, terminology, and domain-specific concepts.

## AI-Specific Guidance

[NEEDS REVIEW] Add common tasks, anti-patterns, and gotchas for AI assistants.

## Quality Gates

[NEEDS REVIEW] Define what "done" looks like - tests, linting, review requirements.`;
}

function extractFirstParagraph(readme: string): string | null {
  const lines = readme.split('\n');
  let inParagraph = false;
  let paragraph = '';

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headings, images, badges, and horizontal rules
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('[![')) continue;
    if (trimmed === '---') continue;
    if (trimmed === '') {
      if (inParagraph && paragraph.trim()) {
        return paragraph.trim();
      }
      continue;
    }
    inParagraph = true;
    paragraph += line + ' ';
  }

  return paragraph.trim() || null;
}
