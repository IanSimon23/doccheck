import { existsSync, readFileSync } from 'fs';
import { scanProject } from '../scanner/index.js';
import { validateClaudeMd } from '../validator/index.js';

interface CheckOptions {
  file: string;
  json?: boolean;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
  const { file, json } = options;

  if (!existsSync(file)) {
    console.error(`Error: ${file} not found. Run 'claudemd init' first.`);
    process.exit(1);
  }

  const claudeMdContent = readFileSync(file, 'utf-8');
  const projectInfo = await scanProject(process.cwd());
  const results = validateClaudeMd(claudeMdContent, projectInfo);

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printResults(results);
  }

  const hasErrors = results.some(r => r.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

interface ValidationResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

function printResults(results: ValidationResult[]): void {
  if (results.length === 0) {
    console.log('✓ All checks passed');
    return;
  }

  for (const result of results) {
    const icon = result.severity === 'error' ? '✗' : result.severity === 'warning' ? '⚠' : '💡';
    console.log(`${icon} [${result.rule}] ${result.message}`);
    if (result.suggestion) {
      console.log(`  → ${result.suggestion}`);
    }
  }
}
