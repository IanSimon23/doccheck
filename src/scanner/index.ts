import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface ProjectInfo {
  name: string;
  path: string;
  packageManager: PackageManagerInfo | null;
  structure: DirectoryStructure;
  hasTests: boolean;
  testPatterns: string[];
  cicd: CiCdInfo | null;
  readme: string | null;
  readmeClaims: ReadmeClaims | null;
}

export interface ReadmeClaims {
  techStack: string[];
  structure: string[];
  commands: string[];
}

export interface PackageManagerInfo {
  type: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'cargo' | 'go';
  configFile: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface DirectoryStructure {
  directories: string[];
  hasSource: boolean;
  sourceDir: string | null;
}

export interface CiCdInfo {
  platform: 'github' | 'gitlab' | 'other';
  files: string[];
}

export async function scanProject(rootPath: string): Promise<ProjectInfo> {
  const name = getProjectName(rootPath);
  const packageManager = detectPackageManager(rootPath);
  const structure = analyzeStructure(rootPath);
  const { hasTests, testPatterns } = detectTestSetup(rootPath, packageManager);
  const cicd = detectCiCd(rootPath);
  const readme = readReadme(rootPath);
  const readmeClaims = readme ? parseReadmeClaims(readme) : null;

  return {
    name,
    path: rootPath,
    packageManager,
    structure,
    hasTests,
    testPatterns,
    cicd,
    readme,
    readmeClaims,
  };
}

function getProjectName(rootPath: string): string {
  const packageJsonPath = join(rootPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return pkg.name || rootPath.split('/').pop() || 'unknown';
  }
  return rootPath.split('/').pop() || 'unknown';
}

function detectPackageManager(rootPath: string): PackageManagerInfo | null {
  const packageJsonPath = join(rootPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return {
      type: 'npm',
      configFile: 'package.json',
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      scripts: pkg.scripts || {},
    };
  }

  if (existsSync(join(rootPath, 'requirements.txt'))) {
    return {
      type: 'pip',
      configFile: 'requirements.txt',
      dependencies: {},
      devDependencies: {},
      scripts: {},
    };
  }

  if (existsSync(join(rootPath, 'Cargo.toml'))) {
    return {
      type: 'cargo',
      configFile: 'Cargo.toml',
      dependencies: {},
      devDependencies: {},
      scripts: {},
    };
  }

  return null;
}

function analyzeStructure(rootPath: string): DirectoryStructure {
  const entries = readdirSync(rootPath, { withFileTypes: true });
  const directories = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
    .map(e => e.name);

  const sourceDir = directories.find(d => ['src', 'lib', 'source'].includes(d)) || null;

  return {
    directories,
    hasSource: sourceDir !== null,
    sourceDir,
  };
}

function detectTestSetup(rootPath: string, packageManager: PackageManagerInfo | null): { hasTests: boolean; testPatterns: string[] } {
  const testPatterns: string[] = [];
  let hasTests = false;

  const testDirs = ['tests', 'test', '__tests__', 'spec'];
  for (const dir of testDirs) {
    if (existsSync(join(rootPath, dir))) {
      hasTests = true;
      testPatterns.push(`${dir}/**/*`);
    }
  }

  if (packageManager?.type === 'npm') {
    const hasVitest = 'vitest' in (packageManager.devDependencies || {});
    const hasJest = 'jest' in (packageManager.devDependencies || {});
    const hasMocha = 'mocha' in (packageManager.devDependencies || {});

    if (hasVitest) testPatterns.push('*.test.ts', '*.spec.ts');
    if (hasJest) testPatterns.push('*.test.js', '*.test.ts');
    if (hasMocha) testPatterns.push('*.spec.js');
  }

  return { hasTests, testPatterns };
}

function detectCiCd(rootPath: string): CiCdInfo | null {
  const githubWorkflows = join(rootPath, '.github', 'workflows');
  if (existsSync(githubWorkflows)) {
    const files = readdirSync(githubWorkflows).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    return { platform: 'github', files };
  }

  if (existsSync(join(rootPath, '.gitlab-ci.yml'))) {
    return { platform: 'gitlab', files: ['.gitlab-ci.yml'] };
  }

  return null;
}

function readReadme(rootPath: string): string | null {
  const readmePath = join(rootPath, 'README.md');
  if (existsSync(readmePath)) {
    return readFileSync(readmePath, 'utf-8');
  }
  return null;
}

function parseReadmeClaims(readme: string): ReadmeClaims {
  return {
    techStack: extractTechStackClaims(readme),
    structure: [], // TODO: future iteration
    commands: [],  // TODO: future iteration
  };
}

function extractTechStackClaims(readme: string): string[] {
  const claims: string[] = [];
  const lines = readme.split('\n');

  // Find tech stack section (various common headings)
  const techHeadings = ['tech stack', 'built with', 'technologies', 'stack'];
  let inTechSection = false;
  let sectionDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    // Check if entering a tech stack section
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      const headingText = headingMatch[2].toLowerCase();

      if (techHeadings.some(h => headingText.includes(h))) {
        inTechSection = true;
        sectionDepth = depth;
        continue;
      }

      // Exit section if we hit another heading at same or higher level
      if (inTechSection && depth <= sectionDepth) {
        inTechSection = false;
      }
    }

    if (inTechSection) {
      // Extract from list items: "- **Frontend**: React 18, Vite, Tailwind CSS"
      const listMatch = line.match(/^[-*]\s+\*?\*?([^:*]+)\*?\*?:\s*(.+)/);
      if (listMatch) {
        // Split on comma only, preserve multi-word tech names
        const techs = listMatch[2].split(/,/).map(t => t.trim()).filter(Boolean);
        claims.push(...techs);
        continue;
      }

      // Extract from simple list items: "- React"
      const simpleListMatch = line.match(/^[-*]\s+(.+)/);
      if (simpleListMatch) {
        claims.push(simpleListMatch[1].trim());
      }
    }
  }

  // Normalize: remove version numbers, parens, clean up
  return claims
    .map(c => c.replace(/\([^)]*\)/g, '').trim())           // remove parentheticals
    .map(c => c.replace(/\*\*/g, '').trim())                // remove bold markers
    .map(c => c.replace(/\s+\d+(\.\d+)*\s*$/, '').trim())   // remove trailing version numbers (e.g., "React 18" -> "React")
    .map(c => c.replace(/\s+v?\d+(\.\d+)*\s*$/, '').trim()) // remove "v1.2.3" style versions
    .filter(c => c.length > 1)                              // filter tiny strings
    .filter((c, i, arr) => arr.indexOf(c) === i);           // dedupe
}
