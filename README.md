# QuietLocations

Find quiet, comfortable places for studying and working. This is a React + TypeScript app (Vite) with a Leaflet map and a lightweight Express backend for persistence.

## Features

- Interactive map with location markers (Leaflet)
- Add, update, and delete locations (Express JSON storage)
- Geolocation centering and a clearly styled user marker (red arrow)
- Distance display with unit selection (km/mi) via a Settings modal
- Tag-based filtering (overlay panel and in the Settings modal)
- Mobile-first UI with bottom navigation (MUI)

## Tech stack

- Frontend: React 19, TypeScript, Vite, MUI, React-Leaflet
- Backend: Express 5, CORS, JSON file storage
- Map: Leaflet 1.9

## Getting started

Prerequisites
- Node.js 18+ (recommended)
- npm 9+

Install dependencies
```bash
npm install
```

Start the backend API (port 4000 by default)
```bash
npm run start:server
```

Start the frontend dev server (Vite)
```bash
npm run dev
```

Start both together (concurrent dev)
```bash
npm run dev:all
```

Open http://localhost:5173 in your browser.

Optional: configure the API base URL for the frontend using Vite env:
- Create a `.env` file at the repo root
- Add `VITE_API_BASE_URL=http://localhost:4000`

## Usage tips

- Click the gear icon to open Settings and choose distance units and filters; click Save to apply.
- Use the tag overlay panel (top-left) for quick filter toggles.
- Allow location access to center the map and show the red arrow user marker.
- Use the bottom navigation to switch between Map, Add Location, and Update/Delete screens.

## Data model

Location
```ts
type Location = {
  id: string;       // unique id
  name: string;     // human-readable name
  lat: number;      // latitude
  lng: number;      // longitude
  tags: string[];   // standardized tags
  // rating?: number // optional if present in your data
}
```

Locations are stored in `server/data/locations.json` and served by the backend.

## API

Base URL: `http://localhost:4000/api`

- GET `/locations` → `Location[]`
- POST `/locations` → create a location
  - Body: `Location`
- PUT `/locations/:id` → update fields (e.g., tags)
  - Body: Partial `Location`
- DELETE `/locations/:id` → remove a location

Errors return `{ error: string }` with an appropriate status code.

## Project structure

```
src/
  components/
    Map.tsx                # map, markers, settings modal & filters
    FilterPanel.tsx        # quick filter overlay
    SettingsDialog.tsx     # settings modal (units + filters)
    AddLocationForm.tsx    # add new location (with geocoding)
    UpdateLocationForm.tsx # update tags and delete
  contexts/
    settings/              # settings context (provider, hooks, types)
  data/
    tags.ts                # standardized tags
  utils/
    distance.ts            # distance + formatting
    defaultIcon.tsx        # default Leaflet icon
    userIcon.ts            # user marker (red arrow SVG)
server/
  index.js                 # Express API
  data/locations.json      # persistent storage
```

## Geolocation & HTTPS

Most browsers require HTTPS for geolocation. Localhost is treated as a secure context, but if geolocation fails, the app falls back to a default center (Iowa State) and shows a warning.

## Development notes

- The Settings modal writes unit changes via `setDistanceUnit()` and applies tag filters back to the Map.
- Distances are calculated with the Haversine formula and displayed as meters/km or feet/miles depending on the unit.
- Nominatim is used for address/geocoding (in the Add Location flow); be mindful of rate limits when testing.

## Roadmap ideas

- Persist settings and filters to localStorage
- Add list view with sorting by distance/name
- “Find nearest” action to focus the closest location
- Server-side validation and duplicate detection

---

Made with React, MUI, and Leaflet.

## Deploying to Vercel (MVP-friendly)

Option A: UI on Vercel, backend on a host with persistent storage (recommended for quick MVP)
- Deploy the frontend (this repo) to Vercel.
- Deploy the Express server (server/index.js) to a persistent Node host (e.g., Render, Railway, Fly.io, your VM). Ensure it exposes `https://<your-backend>/api`.
- In Vercel, set an Environment Variable `BACKEND_URL` to your backend base URL (e.g., `https://quiet-locations-api.onrender.com`).
- The provided `vercel.json` will rewrite `/api/*` calls from the frontend to `${BACKEND_URL}/api/*` on Vercel.
- Also set `VITE_API_BASE_URL` to `/` in Vercel if you want the app to call relative `/api/*` during runtime.

Option B: Serverless functions on Vercel (requires changes)
- Move endpoints from `server/index.js` into `api/` serverless functions.
- Replace file-based persistence with a Vercel storage option (KV, Postgres, Blob) because serverless file systems are ephemeral.
- After migrating, you can remove `BACKEND_URL` and call `/api/*` directly.

Local preview with both servers
- Use `npm run dev:all` to run Vite and the Express server concurrently.
- Alternatively, if you convert to Vercel serverless, use `vercel dev` (requires Vercel CLI) to emulate functions locally.