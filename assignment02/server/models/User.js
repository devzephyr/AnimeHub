const bcrypt = require('bcrypt');
const { pool, addId } = require('../config/db');

const User = {
  async findById(id, excludePassword = false) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    if (!rows[0]) return null;
    const user = addId(rows[0]);
    if (excludePassword) delete user.password_hash;
    return user;
  },

  async findOne(conditions) {
    if (conditions.email && conditions.username) {
      // $or equivalent: find by email OR username
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [conditions.email, conditions.username]
      );
      return rows[0] ? addId(rows[0]) : null;
    }
    if (conditions.email) {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [conditions.email]
      );
      return rows[0] ? addId(rows[0]) : null;
    }
    if (conditions.username) {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [conditions.username]
      );
      return rows[0] ? addId(rows[0]) : null;
    }
    return null;
  },

  async create({ email, passwordHash, username, role = 'user' }) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(passwordHash, salt);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, username, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email.toLowerCase().trim(), hashed, username.trim(), role]
    );
    return addId(rows[0]);
  },

  async findByIdAndUpdate(id, updates) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.username !== undefined) {
      setClauses.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }
    if (updates.avatar !== undefined) {
      setClauses.push(`avatar = $${paramIndex++}`);
      values.push(updates.avatar);
    }
    if (updates.password_hash !== undefined) {
      setClauses.push(`password_hash = $${paramIndex++}`);
      values.push(updates.password_hash);
    }

    setClauses.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0] ? addId(rows[0]) : null;
  },

  async comparePassword(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password_hash);
  },

  toJSON(user) {
    if (!user) return user;
    const obj = { ...user };
    delete obj.password_hash;
    return obj;
  },

  async deleteMany() {
    await pool.query('DELETE FROM users');
  }
};

module.exports = User;
