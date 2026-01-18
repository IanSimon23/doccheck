import { describe, it, expect } from 'vitest';
import { scanProject } from '../src/scanner/index.js';
import { join } from 'path';

describe('scanProject', () => {
  it('detects package.json in current project', async () => {
    const info = await scanProject(process.cwd());

    expect(info.name).toBe('claudemd');
    expect(info.packageManager).not.toBeNull();
    expect(info.packageManager?.type).toBe('npm');
  });

  it('detects source directory', async () => {
    const info = await scanProject(process.cwd());

    expect(info.structure.hasSource).toBe(true);
    expect(info.structure.sourceDir).toBe('src');
  });

  it('detects test setup', async () => {
    const info = await scanProject(process.cwd());

    expect(info.hasTests).toBe(true);
    expect(info.testPatterns.length).toBeGreaterThan(0);
  });
});
