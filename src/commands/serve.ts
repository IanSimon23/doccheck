import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { scanProject } from '../scanner/index.js';
import { validateDoc, type ValidationResult } from '../validator/index.js';
import { loadConfig, saveConfig, type DocCheckConfig } from '../config/index.js';

interface ServeOptions {
  port: number;
}

export async function serveCommand(options: ServeOptions): Promise<void> {
  const { port } = options;
  const projectPath = process.cwd();

  console.log(`Starting DocCheck server for: ${projectPath}`);

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url || '/';

    try {
      if (url === '/api/project' && req.method === 'GET') {
        await handleGetProject(req, res, projectPath);
      } else if (url === '/api/save' && req.method === 'POST') {
        await handleSave(req, res, projectPath);
      } else if (url === '/api/check' && req.method === 'GET') {
        await handleCheck(req, res, projectPath);
      } else if (url === '/api/config' && req.method === 'GET') {
        await handleGetConfig(req, res);
      } else if (url === '/api/config' && req.method === 'POST') {
        await handleSaveConfig(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  server.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
    console.log(`\nOpen your browser and run the web app with:`);
    console.log(`  cd web && npm run dev`);
    console.log(`\nOr in production, the web app will be served directly.`);
    console.log(`\nPress Ctrl+C to stop.`);
  });
}

async function handleGetProject(
  _req: IncomingMessage,
  res: ServerResponse,
  projectPath: string
): Promise<void> {
  const projectInfo = await scanProject(projectPath);

  // Read existing CLAUDE.md if present
  const claudeMdPath = join(projectPath, 'CLAUDE.md');
  let claudeMd: string | null = null;
  if (existsSync(claudeMdPath)) {
    claudeMd = readFileSync(claudeMdPath, 'utf-8');
  }

  // Run validation
  let validationResults: ValidationResult[] = [];
  if (claudeMd) {
    validationResults = validateDoc(claudeMd, projectInfo);
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    projectInfo: {
      name: projectInfo.name,
      path: projectInfo.path,
      packageManager: projectInfo.packageManager,
      structure: projectInfo.structure,
      hasTests: projectInfo.hasTests,
    },
    claudeMd,
    validationResults,
  }));
}

async function handleSave(
  req: IncomingMessage,
  res: ServerResponse,
  projectPath: string
): Promise<void> {
  const body = await readBody(req);

  let content: string;
  try {
    const parsed = JSON.parse(body);
    content = parsed.content;
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
    return;
  }

  const claudeMdPath = join(projectPath, 'CLAUDE.md');
  writeFileSync(claudeMdPath, content);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
}

async function handleCheck(
  _req: IncomingMessage,
  res: ServerResponse,
  projectPath: string
): Promise<void> {
  const projectInfo = await scanProject(projectPath);

  const claudeMdPath = join(projectPath, 'CLAUDE.md');
  let results: ValidationResult[] = [];

  if (existsSync(claudeMdPath)) {
    const claudeMd = readFileSync(claudeMdPath, 'utf-8');
    results = validateDoc(claudeMd, projectInfo);
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ results }));
}

async function handleGetConfig(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const config = loadConfig();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(config));
}

async function handleSaveConfig(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const body = await readBody(req);

  let config: DocCheckConfig;
  try {
    config = JSON.parse(body) as DocCheckConfig;
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
    return;
  }

  saveConfig(config);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
