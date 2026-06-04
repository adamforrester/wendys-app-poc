/**
 * Vite plugin: serves /api/* serverless functions during `npm run dev`.
 *
 * Why: the Vercel-style functions in `api/` (claude.ts, tts.ts) only run when
 * deployed. For local "live" testing without deploying anywhere, this plugin
 * imports them, adapts Connect (req, res, next) → Vercel (req, res), and
 * mounts them at the matching paths.
 *
 * Endpoints registered:
 *   POST /api/claude  → api/claude.ts
 *   POST /api/tts     → api/tts.ts
 *
 * The plugin reads .env.local at boot so AWS_* and ELEVENLABS_API_KEY are
 * available to the handlers.
 *
 * Production: when deploying to Vercel, this plugin is a no-op (it only
 * activates `apply: 'serve'`). Vercel auto-discovers `api/*.ts` natively.
 */

import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

interface VercelRes {
  status: (n: number) => VercelRes;
  json: (b: unknown) => void;
  send: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: (b?: unknown) => void;
}

type VercelHandler = (
  req: { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> },
  res: VercelRes,
) => Promise<void> | void;

/** Wrap a Node ServerResponse in the minimal Vercel-style res shape. */
function adaptRes(res: ServerResponse): VercelRes {
  let statusCode = 200;
  return {
    status(n) {
      statusCode = n;
      res.statusCode = n;
      return this;
    },
    json(body) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = statusCode;
      res.end(JSON.stringify(body));
    },
    send(body) {
      res.statusCode = statusCode;
      if (Buffer.isBuffer(body)) {
        res.end(body);
      } else if (typeof body === 'string') {
        res.end(body);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      }
    },
    setHeader(k, v) {
      res.setHeader(k, v);
    },
    end(body) {
      res.end(body);
    },
  };
}

/** Read raw body from a Connect/Node request and JSON-parse if possible. */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolveBody({});
      try {
        resolveBody(JSON.parse(raw));
      } catch {
        // Non-JSON body — pass through as a string.
        resolveBody(raw);
      }
    });
    req.on('error', reject);
  });
}

/** Lightweight .env.local loader — avoids adding `dotenv` as a dep. */
function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

interface RouteConfig {
  path: string;
  importPath: string;
}

const ROUTES: RouteConfig[] = [
  { path: '/api/claude', importPath: '/api/claude.ts' },
  { path: '/api/tts', importPath: '/api/tts.ts' },
];

export function viteApiMiddleware(): Plugin {
  return {
    name: 'voice-ordering:dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // Load .env.local once at boot so handlers see the vars.
      const root = server.config.root;
      loadEnvFile(resolve(root, '.env.local'));
      loadEnvFile(resolve(root, '.env'));

      for (const route of ROUTES) {
        server.middlewares.use(route.path, async (req, res, next) => {
          // Only intercept the exact match, not e.g. /api/claude/foo.
          // Connect strips the matched prefix; the remaining url should be '/' or empty.
          if (req.url && req.url !== '/' && !req.url.startsWith('/?')) {
            return next();
          }
          if (req.method !== 'POST') {
            // Surface a clearer 405 than the default html.
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
            return;
          }
          try {
            const body = await readJsonBody(req);
            const mod = await server.ssrLoadModule(route.importPath);
            const handler = mod.default as VercelHandler | undefined;
            if (typeof handler !== 'function') {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({ error: `${route.importPath} has no default export handler.` }),
              );
              return;
            }
            await handler(
              { method: req.method, body, headers: req.headers as Record<string, string> },
              adaptRes(res as ServerResponse),
            );
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown server error';
            console.error(`[voice-ordering:dev-api] ${route.path} error:`, err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: message }));
            }
          }
        });
      }
    },
  };
}
