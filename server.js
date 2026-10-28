import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Clean up any legacy source maps so internal paths are never exposed
for (const mapFile of ['bundle.js.map', 'bundle.css.map']) {
  const mapPath = path.join(PUBLIC_DIR, mapFile);
  if (fs.existsSync(mapPath)) {
    try {
      fs.unlinkSync(mapPath);
    } catch (_) {}
  }
}

async function buildBundle() {
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.js')],
    bundle: true,
    outfile: path.join(PUBLIC_DIR, 'bundle.js'),
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.svg': 'dataurl',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    minify: true,
    sourcemap: false,
    logLevel: 'info',
  });
}

await buildBundle();

if (process.argv.includes('--build')) {
  console.log('Secure production build complete: public/bundle.js and public/bundle.css');
  process.exit(0);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (rawPath.includes('\0')) {
      res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      return;
    }

    const relativeTarget = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
    let resolvedPath = path.resolve(PUBLIC_DIR, relativeTarget);

    // Strictly block any path traversal outside PUBLIC_DIR or access to .map files
    if (!resolvedPath.startsWith(PUBLIC_DIR + path.sep) || resolvedPath.endsWith('.map')) {
      res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
      resolvedPath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(resolvedPath);

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': 'no-store, max-age=0',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (_) {
    res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`  TRACCR by DMG Official is LIVE (Secured)`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
