// Seed script to migrate existing locations.json data into PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from environment or use default local connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: false
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting seed...');
    
    // Read existing locations data
    const dataPath = path.join(__dirname, '..', 'server', 'data', 'locations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const locations = JSON.parse(rawData);
    
    console.log(`Found ${locations.length} locations to seed`);

    await client.query('BEGIN');

    for (const loc of locations) {
      // Insert location
      const insertLocation = `
        INSERT INTO Locations (name, latitude, longitude, address, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING location_id
      `;
      const result = await client.query(insertLocation, [
        loc.name,
        loc.lat,
        loc.lng,
        loc.address || null,
        loc.description || null
      ]);
      
      const locationId = result.rows[0].location_id;
      console.log(`  ✓ Inserted location: ${loc.name} (${locationId})`);

      // Insert tags if present
      if (Array.isArray(loc.tags) && loc.tags.length > 0) {
        for (const tagName of loc.tags) {
          // Upsert tag
          const tagResult = await client.query(
            `INSERT INTO Tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING tag_id`,
            [tagName]
          );
          const tagId = tagResult.rows[0].tag_id;

          // Link location to tag
          await client.query(
            `INSERT INTO LocationTags (location_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [locationId, tagId]
          );
        }
        console.log(`    - Added ${loc.tags.length} tags`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!');
    
    // Show summary
    const countResult = await client.query('SELECT COUNT(*) FROM Locations');
    const tagCountResult = await client.query('SELECT COUNT(*) FROM Tags');
    console.log(`\nDatabase now contains:`);
    console.log(`  - ${countResult.rows[0].count} locations`);
    console.log(`  - ${tagCountResult.rows[0].count} unique tags`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
