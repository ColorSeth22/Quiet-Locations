const { db } = require('../_db');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    try {
      if (req.body && typeof req.body === 'object') return resolve(req.body);
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => {
        if (!data) return resolve({});
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({});
        }
      });
      req.on('error', reject);
    } catch (e) {
      resolve({});
    }
  });
}

module.exports = async function handler(req, res) {
  let { id } = (req.query || {});
  // Fallback: extract id from URL if not provided (framework differences)
  if (!id && req.url) {
    try {
      const u = new URL(req.url, 'http://localhost');
      const parts = u.pathname.split('/').filter(Boolean);
      id = parts[parts.length - 1];
    } catch {}
  }
  const method = req.method;

  const idx = db.findIndex((d) => String(d.id) === String(id));

  if (method === 'PUT') {
    if (idx === -1) return sendJson(res, 404, { error: 'Not found' });
    const updates = await readJsonBody(req);
    db[idx] = { ...db[idx], ...updates };
    return sendJson(res, 200, db[idx]);
  }

  if (method === 'DELETE') {
    if (idx === -1) return sendJson(res, 404, { error: 'Not found' });
    const removed = db.splice(idx, 1)[0];
    return sendJson(res, 200, removed);
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.statusCode = 405;
  res.end('Method Not Allowed');
};
