const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper to add _id alias for MongoDB backwards compatibility with client
const addId = (row) => {
  if (!row) return row;
  return { ...row, _id: row.id };
};

const addIds = (rows) => rows.map(addId);

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(30) UNIQUE NOT NULL,
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS titles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('anime', 'movie', 'series', 'ova', 'special')),
        genres TEXT[] DEFAULT '{}',
        year INTEGER CHECK (year >= 1900 AND year <= 2100),
        synopsis TEXT DEFAULT '',
        poster TEXT DEFAULT '',
        episodes INTEGER DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('airing', 'completed', 'upcoming', 'cancelled')),
        studio VARCHAR(255) DEFAULT '',
        rating_average NUMERIC(3,1) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
        text TEXT DEFAULT '',
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, title_id)
      );

      CREATE TABLE IF NOT EXISTS watchlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'plan_to_watch' CHECK (status IN ('plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped')),
        progress INTEGER DEFAULT 0,
        added_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, title_id)
      );
    `);

    // Create indexes (IF NOT EXISTS for idempotency)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_titles_type ON titles(type);
      CREATE INDEX IF NOT EXISTS idx_titles_year ON titles(year DESC);
      CREATE INDEX IF NOT EXISTS idx_titles_rating ON titles(rating_average DESC);
      CREATE INDEX IF NOT EXISTS idx_titles_created ON titles(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_titles_genres ON titles USING GIN(genres);
      CREATE INDEX IF NOT EXISTS idx_reviews_title ON reviews(title_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_watchlist_title ON watchlist_items(title_id);
    `);

    console.log('PostgreSQL connected and schema initialized');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDb, addId, addIds };
