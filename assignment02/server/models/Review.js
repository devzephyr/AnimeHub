const { pool, addId } = require('../config/db');

function formatReview(row) {
  if (!row) return row;
  const review = addId(row);

  // Map snake_case to camelCase
  review.userId = review.user_id;
  review.titleId = review.title_id;
  review.createdAt = review.created_at;
  review.updatedAt = review.updated_at;

  // If joined user data exists, nest it under userId as an object (like Mongoose populate)
  if (review.user_username !== undefined) {
    review.userId = {
      _id: review.user_id,
      id: review.user_id,
      username: review.user_username,
      avatar: review.user_avatar
    };
    delete review.user_username;
    delete review.user_avatar;
  }

  // If joined title data exists, nest it under titleId as an object
  if (review.title_name !== undefined) {
    review.titleId = {
      _id: review.title_id,
      id: review.title_id,
      name: review.title_name,
      poster: review.title_poster,
      type: review.title_type
    };
    delete review.title_name;
    delete review.title_poster;
    delete review.title_type;
  }

  return review;
}

const POPULATED_SELECT = `
  r.*,
  u.username AS user_username, u.avatar AS user_avatar,
  t.name AS title_name, t.poster AS title_poster, t.type AS title_type
`;

const POPULATED_JOIN = `
  FROM reviews r
  LEFT JOIN users u ON r.user_id = u.id
  LEFT JOIN titles t ON r.title_id = t.id
`;

const Review = {
  async find(query = {}, { sort = '-createdAt', skip = 0, limit = 20 } = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (query.titleId) {
      conditions.push(`r.title_id = $${paramIndex++}`);
      values.push(query.titleId);
    }
    if (query.userId) {
      conditions.push(`r.user_id = $${paramIndex++}`);
      values.push(query.userId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = sort === '-createdAt' ? 'r.created_at DESC' : 'r.created_at ASC';

    const { rows } = await pool.query(
      `SELECT ${POPULATED_SELECT} ${POPULATED_JOIN} ${where} ORDER BY ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, skip]
    );
    return rows.map(formatReview);
  },

  async countDocuments(query = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (query.titleId) {
      conditions.push(`title_id = $${paramIndex++}`);
      values.push(query.titleId);
    }
    if (query.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(query.userId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) FROM reviews ${where}`, values);
    return parseInt(rows[0].count);
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${POPULATED_SELECT} ${POPULATED_JOIN} WHERE r.id = $1`,
      [id]
    );
    return rows[0] ? formatReview(rows[0]) : null;
  },

  async findOne(conditions) {
    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    if (conditions.userId) {
      whereClauses.push(`r.user_id = $${paramIndex++}`);
      values.push(conditions.userId);
    }
    if (conditions.titleId) {
      whereClauses.push(`r.title_id = $${paramIndex++}`);
      values.push(conditions.titleId);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT ${POPULATED_SELECT} ${POPULATED_JOIN} ${where} LIMIT 1`,
      values
    );
    return rows[0] ? formatReview(rows[0]) : null;
  },

  async create({ userId, titleId, rating, text = '' }) {
    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, title_id, rating, text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, titleId, rating, text]
    );

    // Recalculate title rating
    await Review.calculateAverageRating(titleId);

    // Return populated review
    return Review.findById(rows[0].id);
  },

  async findByIdAndUpdate(id, updates) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.rating !== undefined) { setClauses.push(`rating = $${paramIndex++}`); values.push(updates.rating); }
    if (updates.text !== undefined) { setClauses.push(`text = $${paramIndex++}`); values.push(updates.text); }

    if (setClauses.length === 0) return Review.findById(id);

    setClauses.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE reviews SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows[0]) {
      await Review.calculateAverageRating(rows[0].title_id);
      return Review.findById(id);
    }
    return null;
  },

  async findByIdAndDelete(id) {
    // Get review first to know the titleId
    const { rows: existing } = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (!existing[0]) return null;

    const titleId = existing[0].title_id;
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    // Recalculate title rating
    await Review.calculateAverageRating(titleId);
    return formatReview(existing[0]);
  },

  async calculateAverageRating(titleId) {
    const { rows } = await pool.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS count FROM reviews WHERE title_id = $1`,
      [titleId]
    );

    const avg = rows[0].avg_rating ? Math.round(parseFloat(rows[0].avg_rating) * 10) / 10 : 0;
    const count = parseInt(rows[0].count);

    await pool.query(
      `UPDATE titles SET rating_average = $1, rating_count = $2 WHERE id = $3`,
      [avg, count, titleId]
    );
  },

  async deleteMany() {
    await pool.query('DELETE FROM reviews');
  }
};

module.exports = Review;
