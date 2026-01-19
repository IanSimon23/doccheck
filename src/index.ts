#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { checkCommand } from './commands/check.js';
import { serveCommand } from './commands/serve.js';

const program = new Command();

program
  .name('doccheck')
  .description('Generate and validate living CLAUDE.md documentation')
  .version('0.1.0');

program
  .command('init')
  .description('Scan project and generate initial CLAUDE.md')
  .option('-o, --output <path>', 'Output path for CLAUDE.md', './CLAUDE.md')
  .option('--force', 'Overwrite existing CLAUDE.md')
  .action(initCommand);

program
  .command('check')
  .description('Validate CLAUDE.md against current project state')
  .option('-f, --file <path>', 'Path to CLAUDE.md', './CLAUDE.md')
  .option('--json', 'Output results as JSON')
  .action(checkCommand);

program
  .command('serve')
  .description('Start web interface for interactive CLAUDE.md editing')
  .option('-p, --port <number>', 'API server port', '3001')
  .action((options) => serveCommand({ port: parseInt(options.port, 10) }));

program.parse();
