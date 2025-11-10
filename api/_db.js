import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadSeed() {
  try {
    // From /api to repo root then server/data/locations.json
    const filePath = path.join(__dirname, '..', 'server', 'data', 'locations.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

// In-memory DB per function instance
export const db = loadSeed();
