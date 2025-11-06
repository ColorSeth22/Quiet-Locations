const { db } = require('../../_db');

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
  if (req.method === 'GET') {
    return sendJson(res, 200, db);
  }

  if (req.method === 'POST') {
    const loc = await readJsonBody(req);
    if (!loc || !loc.id || !loc.name) {
      return sendJson(res, 400, { error: 'Invalid location payload' });
    }
    if (db.find((d) => String(d.id) === String(loc.id))) {
      return sendJson(res, 409, { error: 'Location with this id already exists' });
    }
    db.push(loc);
    return sendJson(res, 201, loc);
  }

  res.setHeader('Allow', 'GET, POST');
  res.statusCode = 405;
  res.end('Method Not Allowed');
};
