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

  return {
    name,
    path: rootPath,
    packageManager,
    structure,
    hasTests,
    testPatterns,
    cicd,
    readme,
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
