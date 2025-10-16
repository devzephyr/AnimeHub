const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'fellowship.json');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/', true);
  const pathname = parsedUrl.pathname || '/';
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      return servePublicPath('/index.html', res);
    }

    if (pathname === '/about') {
      const aboutPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>About the Fellowship</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="content-page">
    <h1>About the Fellowship</h1>
    <p>The Fellowship Registry chronicles courageous heroes who answered the call to protect Middle-earth.</p>
    <p>Each recruit completes our training trials, pledges allegiance to the Free Peoples, and ventures forth to defend the realms.</p>
    <p><a href="/">Return to the registry</a></p>
  </main>
  <script src="/script.js" defer></script>
</body>
</html>`;
      return sendHtml(res, 200, aboutPage);
    }

    if (pathname === '/contact') {
      const contactPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Contact the Fellowship</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="content-page">
    <h1>Contact the Fellowship</h1>
    <p>Dispatch your ravens or send word through the Palantír to reach the Fellowship stewards.</p>
    <ul>
      <li>Email: fellowship@middleearth.gov</li>
      <li>Signal Fires: White Mountains Beacon Network</li>
      <li>Messenger: Address to Gandalf the White, Minas Tirith</li>
    </ul>
    <p><a href="/">Return to the registry</a></p>
  </main>
  <script src="/script.js" defer></script>
</body>
</html>`;
      return sendHtml(res, 200, contactPage);
    }

    return servePublicPath(pathname, res);
  }

  if (method === 'POST' && pathname === '/api/join') {
    return handleJoin(req, res);
  }

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  sendHtml(res, 404, `<h1>404 Not Found</h1><p>The requested resource could not be located.</p>`);
});

function servePublicPath(requestPath, res) {
  try {
    const decoded = decodeURIComponent(requestPath);
    let relativePath = decoded;

    if (relativePath.endsWith('/')) {
      relativePath += 'index.html';
    }

    relativePath = relativePath.replace(/^\/+/, '');
    if (relativePath === '') {
      relativePath = 'index.html';
    }

    const normalized = path.normalize(relativePath);
    
    // Security: prevent directory traversal attacks (e.g., ../../../etc/passwd)
    if (normalized.startsWith('..')) {
      return sendHtml(res, 403, `<h1>403 Forbidden</h1><p>Access denied.</p>`);
    }

    const absolutePath = path.join(PUBLIC_DIR, normalized);

    // Security: ensure resolved path stays within PUBLIC_DIR
    if (!absolutePath.startsWith(PUBLIC_DIR)) {
      return sendHtml(res, 403, `<h1>403 Forbidden</h1><p>Access denied.</p>`);
    }

    fs.stat(absolutePath, (statErr, stats) => {
      if (statErr) {
        if (statErr.code === 'ENOENT') {
          return sendHtml(res, 404, `<h1>404 Not Found</h1><p>The resource you requested was not found.</p>`);
        }
        console.error('Error accessing file %s: %s', absolutePath, statErr.message);
        return sendHtml(res, 500, `<h1>500 Server Error</h1><p>Unable to access the requested file.</p>`);
      }

      if (stats.isDirectory()) {
        return sendHtml(res, 403, `<h1>403 Forbidden</h1><p>Directory access is not permitted.</p>`);
      }

      fs.readFile(absolutePath, (readErr, data) => {
        if (readErr) {
          console.error('Error reading file %s: %s', absolutePath, readErr.message);
          return sendHtml(res, 500, `<h1>500 Server Error</h1><p>Unable to read the requested file.</p>`);
        }

        const contentType = getContentType(absolutePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        });
        res.end(data);
      });
    });
  } catch (err) {
    console.error('Unexpected error serving %s: %s', requestPath, err.message);
    sendHtml(res, 500, `<h1>500 Server Error</h1><p>Unexpected error while processing the request.</p>`);
  }
}

function handleJoin(req, res) {
  const chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('error', (err) => {
    console.error('Error receiving request body: %s', err.message);
    sendJson(res, 500, { ok: false, error: 'Server error' });
  });

  req.on('end', () => {
    const rawBody = Buffer.concat(chunks).toString('utf8');
    const contentType = (req.headers['content-type'] || '').toLowerCase();

    let payload;
    try {
      if (contentType.includes('application/json')) {
        payload = JSON.parse(rawBody || '{}');
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        payload = querystring.parse(rawBody);
      } else {
        return sendJson(res, 415, { ok: false, error: 'Unsupported content type' });
      }
    } catch (parseErr) {
      console.error('Failed to parse request body: %s', parseErr.message);
      return sendJson(res, 400, { ok: false, error: 'Invalid JSON payload' });
    }

    const submission = normalizeSubmission(payload);
    const validationError = validateSubmission(submission);
    if (validationError) {
      return sendJson(res, 400, { ok: false, error: validationError });
    }

    persistSubmission(submission, (persistErr) => {
      if (persistErr) {
        console.error('Failed to persist submission: %s', persistErr.message);
        return sendJson(res, 500, { ok: false, error: 'Server error' });
      }
      sendJson(res, 200, { ok: true, message: `Welcome to the Fellowship, ${submission.name}!` });
    });
  });
}

function normalizeSubmission(payload) {
  const rawName = payload.name || payload.fullName || '';
  const rawEmail = payload.email || '';
  const rawAge = payload.age || payload.memberAge;
  const rawClass = payload.class || payload.characterClass || payload.role || '';

  return {
    name: String(rawName || '').trim(),
    email: String(rawEmail || '').trim().toLowerCase(),
    age: Number.parseInt(rawAge, 10),
    class: String(rawClass || '').trim(),
    date: new Date().toISOString(),
  };
}

function validateSubmission(entry) {
  if (!entry.name || entry.name.length < 2) {
    return 'Name is required and must be at least 2 characters long.';
  }

  if (!entry.email || !entry.email.includes('@')) {
    return 'Provide a valid email address.';
  }

  if (!Number.isFinite(entry.age) || entry.age < 1) {
    return 'Age must be a valid number greater than or equal to 1.';
  }

  if (!entry.class) {
    return 'Select a character class.';
  }

  return null;
}

function persistSubmission(entry, callback) {
  fs.mkdir(DATA_DIR, { recursive: true }, (dirErr) => {
    if (dirErr) {
      return callback(dirErr);
    }

    fs.readFile(DATA_FILE, 'utf8', (readErr, contents) => {
      let current = [];

      if (readErr) {
        if (readErr.code !== 'ENOENT') {
          return callback(readErr);
        }
      } else if (contents.trim()) {
        try {
          current = JSON.parse(contents);
          if (!Array.isArray(current)) {
            current = [];
          }
        } catch (parseErr) {
          console.error('Failed to parse existing fellowship records: %s', parseErr.message);
          current = [];
        }
      }

      current.push(entry);
      const serialized = JSON.stringify(current, null, 2);

      fs.writeFile(DATA_FILE, serialized, 'utf8', (writeErr) => {
        if (writeErr) {
          return callback(writeErr);
        }
        callback(null);
      });
    });
  });
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(html);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});