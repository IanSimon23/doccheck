import { scanProject } from '../scanner/index.js';
import { generateClaudeMd } from '../generator/index.js';
import { existsSync, writeFileSync } from 'fs';

interface InitOptions {
  output: string;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const { output, force } = options;

  if (existsSync(output) && !force) {
    console.error(`Error: ${output} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  console.log('Scanning project...');
  const projectInfo = await scanProject(process.cwd());

  console.log('Generating CLAUDE.md...');
  const content = generateClaudeMd(projectInfo);

  writeFileSync(output, content);
  console.log(`Created ${output}`);
}
