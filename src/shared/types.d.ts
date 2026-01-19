/**
 * Shared type definitions for DocCheck CLI and Web App
 */
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
export interface ValidationResult {
    rule: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
}
export interface Profile {
    name: string;
    description?: string;
    defaults: {
        purpose?: string;
        goals?: string;
        practices?: string;
        architecture?: string;
        domain?: string;
        gotchas?: string;
        quality?: string;
    };
    techStack?: {
        language?: string;
        framework?: string;
        styling?: string;
        testing?: string;
        other?: string[];
    };
}
export interface DocCheckConfig {
    activeProfile?: string;
    globalDefaults: {
        practices?: string;
        architecture?: string;
        quality?: string;
        gotchas?: string;
    };
    profiles: Profile[];
}
//# sourceMappingURL=types.d.ts.map