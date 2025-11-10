# QuietLocations

Find quiet, comfortable places for studying and working. This is a React + TypeScript app (Vite) with a Leaflet map and a lightweight Express backend for persistence.

## Features

- Interactive map with location markers (Leaflet)
- Add, update, and delete locations
- Geolocation centering and a clearly styled user marker (red arrow)
- Distance display with unit selection (km/mi) via a Settings modal
- Tag-based filtering (overlay panel and in the Settings modal)
- Mobile-first UI with bottom navigation (MUI)
- PostgreSQL database with serverless API routes

## Tech stack

- Frontend: React 19, TypeScript, Vite, MUI, React-Leaflet
- Backend: Vercel Serverless Functions (Node.js), PostgreSQL
- Map: Leaflet 1.9
- Database: PostgreSQL with node-postgres (pg)

## Getting started

Prerequisites
- Node.js 18+ (recommended)
- npm 9+
- PostgreSQL 12+ (local or hosted)

Install dependencies
```bash
npm install
```

### Database Setup

1. **Create the database schema**
```bash
# Using psql (adjust path if needed)
psql -U postgres -d postgres -f db/schema.sql
```

2. **Set up environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
```

3. **Seed initial data** (optional, migrates from server/data/locations.json)
```bash
node db/seed.js
```

### Running the app

Start the frontend dev server (Vite)
```bash
npm run dev
```

The serverless API functions under `/api` will be called by the frontend. For local development, you can also use:

```bash
# Run the old Express server (if you still have it for testing)
npm run start:server
```

Open http://localhost:5173 in your browser.

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

Base URL (local dev): `/api` (serverless functions)  
Base URL (production): `https://<your-vercel-url>/api`

### Endpoints

- **GET** `/api/locations` → `Location[]`
  - Returns all locations with their tags aggregated
  
- **POST** `/api/locations` → create a location
  - Body: `{ name, lat, lng, address?, description?, tags?: string[] }`
  - Returns created location with UUID
  
- **PUT** `/api/locations/:id` → update fields
  - Body: Partial location (e.g., `{ name, tags, ... }`)
  - Tags are fully replaced if provided
  
- **DELETE** `/api/locations/:id` → remove a location
  - CASCADE automatically removes associated tags

Errors return `{ error: string }` with an appropriate status code.

### Database Schema

See `db/schema.sql` for the full PostgreSQL schema including:
- Users, Locations, Tags, LocationTags, Ratings, Favorites tables
- UUID primary keys
- Foreign key constraints with cascading deletes

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

## Deploying to Vercel

This app uses Vercel Serverless Functions under `/api` and requires a PostgreSQL database.

### Steps

1. **Set up a PostgreSQL database**
   - Option A: Use Vercel Postgres (built-in, easy setup)
   - Option B: Use an external provider (Supabase, Neon, Railway, etc.)

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure environment variables in Vercel**
   - Go to your project settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database`

4. **Run the schema on your production database**
   ```bash
   # Connect to your production database and run:
   psql <your-production-connection-string> -f db/schema.sql
   
   # Then seed if needed:
   DATABASE_URL=<your-production-url> node db/seed.js
   ```

5. **Redeploy** (if you added env vars after first deploy)
   ```bash
   vercel --prod
   ```

### Local testing with serverless functions

```bash
# Requires Vercel CLI
vercel dev
```

This emulates the serverless environment locally and respects your `.env` file.