import { existsSync } from 'fs';
import { join } from 'path';
import type { ProjectInfo } from '../scanner/index.js';

// Re-export ValidationResult from shared
export type { ValidationResult } from '../shared/types.js';
import type { ValidationResult } from '../shared/types.js';

export function validateDoc(claudeMdContent: string, projectInfo: ProjectInfo): ValidationResult[] {
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

  if (!info.readmeClaims) {
    return results;
  }

  // Validate structure claims
  results.push(...validateStructureClaims(info));

  // Validate command claims
  results.push(...validateCommandClaims(info));

  // Tech stack validation requires package manager
  if (!info.packageManager) {
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

function validateCommandClaims(info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!info.readmeClaims?.commands.length || !info.packageManager) {
    return results;
  }

  const scripts = Object.keys(info.packageManager.scripts || {});

  // Check each claimed command against actual scripts
  for (const claimed of info.readmeClaims.commands) {
    if (!scripts.includes(claimed)) {
      results.push({
        rule: 'readme-command-drift',
        severity: 'warning',
        message: `README documents "npm run ${claimed}" but script doesn't exist`,
        suggestion: `Remove command from README or add "${claimed}" to package.json scripts`,
      });
    }
  }

  // Check for scripts not mentioned in README
  const commonScripts = ['dev', 'build', 'start', 'test', 'lint'];
  for (const script of scripts) {
    if (commonScripts.includes(script)) {
      const documented = info.readmeClaims.commands.includes(script);
      if (!documented) {
        results.push({
          rule: 'readme-command-incomplete',
          severity: 'info',
          message: `Script "${script}" exists but not documented in README`,
          suggestion: `Consider documenting "npm run ${script}" in README`,
        });
      }
    }
  }

  return results;
}

function validateStructureClaims(info: ProjectInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!info.readmeClaims?.structure.length) {
    return results;
  }

  const projectRoot = info.path;
  const projectName = info.name;

  // Normalize claimed paths - strip project name prefix if present
  const normalizedClaims = info.readmeClaims.structure
    .map(s => {
      // Strip "projectname/" prefix
      const prefixPattern = new RegExp(`^${projectName}/`);
      return s.replace(prefixPattern, '');
    })
    .filter(s => s && s !== '/');  // filter empty and root-only

  for (const claimed of normalizedClaims) {
    // Normalize: remove trailing slash
    const dirPath = claimed.replace(/\/$/, '');

    if (!dirPath) continue;

    // Check if directory exists
    const fullPath = join(projectRoot, dirPath);
    if (!existsSync(fullPath)) {
      results.push({
        rule: 'readme-structure-drift',
        severity: 'warning',
        message: `README documents "${claimed}" but directory doesn't exist`,
        suggestion: `Remove "${claimed}" from README or create the directory`,
      });
    }
  }

  // Check for actual directories not in README claims
  const actualDirs = info.structure.directories;
  for (const dir of actualDirs) {
    const documented = normalizedClaims.some(s => {
      const normalized = s.replace(/\/$/, '');
      return normalized === dir ||
        normalized.startsWith(dir + '/') ||
        dir.startsWith(normalized + '/');
    });

    if (!documented) {
      results.push({
        rule: 'readme-structure-incomplete',
        severity: 'info',
        message: `Directory "${dir}/" exists but not documented in README`,
        suggestion: `Consider adding "${dir}/" to README project structure`,
      });
    }
  }

  return results;
}
