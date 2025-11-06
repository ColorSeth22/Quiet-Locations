// Vercel serverless function handling:
// - GET /api/locations
// - POST /api/locations
// - PUT /api/locations/:id
// - DELETE /api/locations/:id
// Note: Uses in-memory data seeded from server/data/locations.json. This is not persistent
// across cold starts. Suitable for demos/MVP on Vercel. Migrate to a persistent store later.

// Types are deliberately 'any' to avoid adding build-time deps for Vercel types
import fs from 'fs';

// Load seed data from the repository file at runtime (read-only in serverless bundle)
function loadSeed(): Location[] {
  try {
    // Resolve relative to this file location
    const url = new URL('../../../server/data/locations.json', import.meta.url);
    const raw = fs.readFileSync(url, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data as Location[] : [];
  } catch {
    return [];
  }
}

type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tags: string[];
  rating?: number;
};

const db: Location[] = loadSeed();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const slugParam = req.query.slug;
  const parts = Array.isArray(slugParam) ? slugParam : (slugParam ? [slugParam] : []);

  // Collection endpoints
  if (parts.length === 0) {
    if (req.method === 'GET') {
      return res.status(200).json(db);
    }
    if (req.method === 'POST') {
      const loc = req.body as Location;
      if (!loc || !loc.id || !loc.name) {
        return res.status(400).json({ error: 'Invalid location payload' });
      }
      if (db.find((d) => d.id === loc.id)) {
        return res.status(409).json({ error: 'Location with this id already exists' });
      }
      db.push(loc);
      return res.status(201).json(loc);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method Not Allowed');
  }

  // Item endpoints (/api/locations/:id)
  const id = parts[0];
  const idx = db.findIndex((d) => d.id === id);

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const update = req.body as Partial<Location>;
    db[idx] = { ...db[idx], ...update };
    return res.status(200).json(db[idx]);
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.splice(idx, 1);
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).send('Method Not Allowed');
}
