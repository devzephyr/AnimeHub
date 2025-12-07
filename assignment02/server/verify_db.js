require('dotenv').config();
const mongoose = require('mongoose');
const { User, Title, Review, Watchlist } = require('./models');

const verify = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const userCount = await User.countDocuments();
        console.log('Users:', userCount);

        const titleCount = await Title.countDocuments();
        console.log('Titles:', titleCount);

        const reviewCount = await Review.countDocuments();
        console.log('Reviews:', reviewCount);

        const watchlistCount = await Watchlist.countDocuments();
        console.log('Watchlists:', watchlistCount);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));

        process.exit(0);
    } catch (error) {
        console.error('Verification error:', error);
        process.exit(1);
    }
};

verify();
