require('dotenv').config();
const { pool, initDb } = require('./config/db');

const verify = async () => {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
        await initDb();
        console.log('Connected.');

        const users = await pool.query('SELECT COUNT(*) FROM users');
        console.log('Users:', users.rows[0].count);

        const titles = await pool.query('SELECT COUNT(*) FROM titles');
        console.log('Titles:', titles.rows[0].count);

        const reviews = await pool.query('SELECT COUNT(*) FROM reviews');
        console.log('Reviews:', reviews.rows[0].count);

        const watchlist = await pool.query('SELECT COUNT(*) FROM watchlist_items');
        console.log('Watchlist items:', watchlist.rows[0].count);

        const tables = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        console.log('Tables in DB:', tables.rows.map(t => t.table_name));

        process.exit(0);
    } catch (error) {
        console.error('Verification error:', error);
        process.exit(1);
    }
};

verify();
