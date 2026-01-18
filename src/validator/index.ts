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
  results.push(...validateReadmeClaims(projectInfo));

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

function validateReadmeClaims(info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!info.readmeClaims || !info.packageManager) {
    return results;
  }

  const claims = info.readmeClaims.techStack;
  const allDeps = {
    ...info.packageManager.dependencies,
    ...info.packageManager.devDependencies,
  };
  const depNames = Object.keys(allDeps).map(d => d.toLowerCase());

  // Check each README claim against actual dependencies
  for (const claim of claims) {
    const claimLower = claim.toLowerCase();
    const claimNormalized = normalizeTechName(claimLower);

    // Direct match or partial match (e.g., "React" matches "react")
    const found = depNames.some(dep => {
      const depNormalized = normalizeTechName(dep);
      return dep === claimLower ||
        dep.includes(claimLower) ||
        claimLower.includes(dep) ||
        depNormalized === claimNormalized ||
        depNormalized.includes(claimNormalized) ||
        claimNormalized.includes(depNormalized);
    });

    if (!found) {
      // Check if it's a known non-package tech (hosting, services, runtimes, etc.)
      const nonPackageTech = [
        // Hosting/deployment
        'vercel', 'netlify', 'github', 'gitlab', 'docker', 'aws', 'heroku', 'railway',
        // Runtimes
        'node.js', 'nodejs', 'node', 'deno', 'bun',
        // AI services (not npm packages)
        'claude', 'claude sonnet', 'openai', 'gpt', 'anthropic', 'gemini',
        // Serverless concepts
        'serverless', 'serverless functions', 'lambda', 'edge functions',
        // Other services
        'supabase', 'firebase', 'planetscale', 'neon',
      ];
      if (nonPackageTech.some(t => claimLower.includes(t) || t.includes(claimLower))) {
        continue;
      }

      results.push({
        rule: 'readme-drift',
        severity: 'warning',
        message: `README claims "${claim}" in tech stack but not found in dependencies`,
        suggestion: `Verify if "${claim}" is still used, or update README`,
      });
    }
  }

  // Check for major deps not mentioned in README
  const majorDeps = Object.keys(info.packageManager.dependencies);
  for (const dep of majorDeps) {
    const depLower = dep.toLowerCase();
    const mentioned = claims.some(c =>
      c.toLowerCase() === depLower ||
      c.toLowerCase().includes(depLower) ||
      depLower.includes(c.toLowerCase())
    );

    if (!mentioned && !isUtilityPackage(dep)) {
      results.push({
        rule: 'readme-incomplete',
        severity: 'info',
        message: `Dependency "${dep}" not mentioned in README tech stack`,
        suggestion: `Consider documenting "${dep}" in README if it's a key technology`,
      });
    }
  }

  return results;
}

function isUtilityPackage(name: string): boolean {
  // Common utility packages that don't need documentation
  const utilities = [
    'lodash', 'underscore', 'ramda',
    'axios', 'node-fetch', 'got',
    'dotenv', 'cross-env',
    'uuid', 'nanoid',
    'dayjs', 'moment', 'date-fns',
    'chalk', 'colors', 'picocolors',
    'debug', 'winston', 'pino',
  ];
  return utilities.includes(name.toLowerCase());
}

function normalizeTechName(name: string): string {
  // Remove spaces, dashes, underscores for comparison
  // "Tailwind CSS" -> "tailwindcss", "Node.js" -> "nodejs"
  return name
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '')
    .replace(/\.js$/, 'js');
}
