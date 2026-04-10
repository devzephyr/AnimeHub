const { pool, addId, addIds } = require('../config/db');

// Map sort strings like '-createdAt' to SQL ORDER BY
function parseSortString(sort) {
  const sortMap = {
    'createdAt': 'created_at ASC',
    '-createdAt': 'created_at DESC',
    'name': 'name ASC',
    '-name': 'name DESC',
    'year': 'year ASC',
    '-year': 'year DESC',
    'rating.average': 'rating_average ASC',
    '-rating.average': 'rating_average DESC',
    'rating_average': 'rating_average ASC',
    '-rating_average': 'rating_average DESC'
  };
  return sortMap[sort] || 'created_at DESC';
}

// Format a title row to match the old Mongoose response shape
function formatTitle(row) {
  if (!row) return row;
  const title = addId(row);
  // Nest rating fields like Mongoose did
  title.rating = {
    average: parseFloat(title.rating_average) || 0,
    count: title.rating_count || 0
  };
  delete title.rating_average;
  delete title.rating_count;
  // Map snake_case to camelCase for key fields
  title.createdBy = title.created_by;
  title.createdAt = title.created_at;
  title.updatedAt = title.updated_at;
  return title;
}

const formatTitles = (rows) => rows.map(formatTitle);

const Title = {
  async find(query = {}, { sort = '-createdAt', skip = 0, limit = 20 } = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (query.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(query.type);
    }
    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }
    if (query.year) {
      conditions.push(`year = $${paramIndex++}`);
      values.push(query.year);
    }
    if (query.genre) {
      const genres = Array.isArray(query.genre) ? query.genre : [query.genre];
      conditions.push(`genres && $${paramIndex++}`);
      values.push(genres);
    }
    if (query.minRating) {
      conditions.push(`rating_average >= $${paramIndex++}`);
      values.push(parseFloat(query.minRating));
    }
    if (query.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR synopsis ILIKE $${paramIndex})`);
      values.push(`%${query.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = parseSortString(sort);

    const { rows } = await pool.query(
      `SELECT * FROM titles ${where} ORDER BY ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, skip]
    );
    return formatTitles(rows);
  },

  async countDocuments(query = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (query.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(query.type);
    }
    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }
    if (query.year) {
      conditions.push(`year = $${paramIndex++}`);
      values.push(query.year);
    }
    if (query.genre) {
      const genres = Array.isArray(query.genre) ? query.genre : [query.genre];
      conditions.push(`genres && $${paramIndex++}`);
      values.push(genres);
    }
    if (query.minRating) {
      conditions.push(`rating_average >= $${paramIndex++}`);
      values.push(parseFloat(query.minRating));
    }
    if (query.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR synopsis ILIKE $${paramIndex})`);
      values.push(`%${query.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) FROM titles ${where}`, values);
    return parseInt(rows[0].count);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM titles WHERE id = $1', [id]);
    return rows[0] ? formatTitle(rows[0]) : null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO titles (name, type, genres, year, synopsis, poster, episodes, status, studio, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name, data.type, data.genres || [],
        data.year || null, data.synopsis || '', data.poster || '',
        data.episodes ?? null, data.status || 'completed',
        data.studio || '', data.createdBy || null
      ]
    );
    return formatTitle(rows[0]);
  },

  async createMany(dataArray) {
    const results = [];
    for (const data of dataArray) {
      results.push(await Title.create(data));
    }
    return results;
  },

  async findByIdAndUpdate(id, updates) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(updates.name); }
    if (updates.type !== undefined) { setClauses.push(`type = $${paramIndex++}`); values.push(updates.type); }
    if (updates.genres !== undefined) { setClauses.push(`genres = $${paramIndex++}`); values.push(updates.genres); }
    if (updates.year !== undefined) { setClauses.push(`year = $${paramIndex++}`); values.push(updates.year); }
    if (updates.synopsis !== undefined) { setClauses.push(`synopsis = $${paramIndex++}`); values.push(updates.synopsis); }
    if (updates.poster !== undefined) { setClauses.push(`poster = $${paramIndex++}`); values.push(updates.poster); }
    if (updates.episodes !== undefined) { setClauses.push(`episodes = $${paramIndex++}`); values.push(updates.episodes); }
    if (updates.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(updates.status); }
    if (updates.studio !== undefined) { setClauses.push(`studio = $${paramIndex++}`); values.push(updates.studio); }
    if (updates.rating_average !== undefined) { setClauses.push(`rating_average = $${paramIndex++}`); values.push(updates.rating_average); }
    if (updates.rating_count !== undefined) { setClauses.push(`rating_count = $${paramIndex++}`); values.push(updates.rating_count); }

    if (setClauses.length === 0) return Title.findById(id);

    setClauses.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE titles SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0] ? formatTitle(rows[0]) : null;
  },

  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM titles WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatTitle(rows[0]) : null;
  },

  async distinct(field) {
    if (field === 'genres') {
      const { rows } = await pool.query('SELECT DISTINCT unnest(genres) AS genre FROM titles ORDER BY genre');
      return rows.map(r => r.genre);
    }
    return [];
  },

  async deleteMany() {
    await pool.query('DELETE FROM titles');
  }
};

module.exports = Title;
