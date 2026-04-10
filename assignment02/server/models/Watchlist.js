const { pool, addId } = require('../config/db');

// Format watchlist items to match old Mongoose embedded array shape
function formatWatchlistItem(row) {
  if (!row) return row;
  const item = { ...row };
  item.titleId = item.title_id;
  item.addedAt = item.added_at;

  // If joined title data exists, nest it under titleId
  if (item.title_name !== undefined) {
    item.titleId = {
      _id: item.title_id,
      id: item.title_id,
      name: item.title_name,
      type: item.title_type,
      poster: item.title_poster,
      year: item.title_year,
      genres: item.title_genres,
      episodes: item.title_episodes,
      status: item.title_status,
      rating: {
        average: parseFloat(item.title_rating_average) || 0,
        count: item.title_rating_count || 0
      }
    };
    delete item.title_name;
    delete item.title_type;
    delete item.title_poster;
    delete item.title_year;
    delete item.title_genres;
    delete item.title_episodes;
    delete item.title_status;
    delete item.title_rating_average;
    delete item.title_rating_count;
  }

  delete item.title_id;
  delete item.added_at;
  return item;
}

const TITLE_JOIN_SELECT = `
  wi.*,
  t.name AS title_name, t.type AS title_type, t.poster AS title_poster,
  t.year AS title_year, t.genres AS title_genres, t.episodes AS title_episodes,
  t.status AS title_status, t.rating_average AS title_rating_average,
  t.rating_count AS title_rating_count
`;

const Watchlist = {
  // Get all watchlist items for a user (returns { userId, items, _id })
  async findByUserId(userId, { populate = false } = {}) {
    let query, params;
    if (populate) {
      query = `SELECT ${TITLE_JOIN_SELECT}
               FROM watchlist_items wi
               LEFT JOIN titles t ON wi.title_id = t.id
               WHERE wi.user_id = $1
               ORDER BY wi.added_at DESC`;
      params = [userId];
    } else {
      query = 'SELECT * FROM watchlist_items WHERE user_id = $1 ORDER BY added_at DESC';
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    const items = rows.map(formatWatchlistItem);

    return {
      _id: userId,
      id: userId,
      userId,
      items
    };
  },

  async addItem(userId, titleId, status = 'plan_to_watch') {
    // Upsert: insert or update on conflict
    await pool.query(
      `INSERT INTO watchlist_items (user_id, title_id, status, added_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, title_id)
       DO UPDATE SET status = $3, added_at = NOW()`,
      [userId, titleId, status]
    );
  },

  async updateItem(userId, titleId, { status, progress }) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (status) { setClauses.push(`status = $${paramIndex++}`); values.push(status); }
    if (progress !== undefined) { setClauses.push(`progress = $${paramIndex++}`); values.push(progress); }

    if (setClauses.length === 0) return null;

    values.push(userId, titleId);
    const { rowCount } = await pool.query(
      `UPDATE watchlist_items SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex++} AND title_id = $${paramIndex}`,
      values
    );
    return rowCount > 0;
  },

  async removeItem(userId, titleId) {
    const { rowCount } = await pool.query(
      'DELETE FROM watchlist_items WHERE user_id = $1 AND title_id = $2',
      [userId, titleId]
    );
    return rowCount > 0;
  },

  async checkItem(userId, titleId) {
    const { rows } = await pool.query(
      'SELECT * FROM watchlist_items WHERE user_id = $1 AND title_id = $2',
      [userId, titleId]
    );
    if (!rows[0]) return null;
    return formatWatchlistItem(rows[0]);
  },

  async getStats(userId) {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*) AS count FROM watchlist_items WHERE user_id = $1 GROUP BY status`,
      [userId]
    );

    const byStatus = {};
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = parseInt(row.count);
      total += parseInt(row.count);
    }

    return { total, byStatus };
  },

  // For seeding: create a watchlist entry (backwards compat with old Watchlist.create)
  async createForUser(userId, items = []) {
    for (const item of items) {
      await pool.query(
        `INSERT INTO watchlist_items (user_id, title_id, status, progress, added_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, title_id) DO NOTHING`,
        [userId, item.titleId, item.status || 'plan_to_watch', item.progress || 0]
      );
    }
  },

  async deleteMany() {
    await pool.query('DELETE FROM watchlist_items');
  }
};

module.exports = Watchlist;
