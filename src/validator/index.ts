import type { ProjectInfo } from '../scanner/index.js';

export interface ValidationResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export function validateClaudeMd(claudeMdContent: string, projectInfo: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  results.push(...validateTechStack(claudeMdContent, projectInfo));
  results.push(...validateTestingPractices(claudeMdContent, projectInfo));
  results.push(...validateStructure(claudeMdContent, projectInfo));

  return results;
}

function validateTechStack(content: string, info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (info.packageManager) {
    const mentionsPackageManager = content.toLowerCase().includes(info.packageManager.type);
    if (!mentionsPackageManager) {
      results.push({
        rule: 'tech-stack',
        severity: 'warning',
        message: `Project uses ${info.packageManager.type} but CLAUDE.md doesn't mention it`,
        suggestion: `Add ${info.packageManager.type} to the Tech Stack section`,
      });
    }
  }

  return results;
}

function validateTestingPractices(content: string, info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  const mentionsTdd = content.toLowerCase().includes('tdd') || content.toLowerCase().includes('test-driven');

  if (mentionsTdd && !info.hasTests) {
    results.push({
      rule: 'testing-practices',
      severity: 'error',
      message: 'CLAUDE.md mentions TDD but no test files found',
      suggestion: 'Either add tests or update documentation to reflect actual practices',
    });
  }

  if (!mentionsTdd && info.hasTests) {
    results.push({
      rule: 'testing-practices',
      severity: 'info',
      message: 'Project has tests but CLAUDE.md doesn\'t document testing approach',
      suggestion: 'Consider adding a Testing section to CLAUDE.md',
    });
  }

  return results;
}

function validateStructure(content: string, info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (info.structure.sourceDir) {
    const mentionsSourceDir = content.includes(info.structure.sourceDir);
    if (!mentionsSourceDir) {
      results.push({
        rule: 'structure',
        severity: 'info',
        message: `Project has '${info.structure.sourceDir}' directory but it's not documented`,
        suggestion: `Document the ${info.structure.sourceDir}/ directory structure`,
      });
    }
  }

  return results;
}
