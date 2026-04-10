const User = require('../models/User');
const Title = require('../models/Title');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');

const users = [
  {
    email: 'admin@animehub.com',
    passwordHash: 'password123',
    username: 'admin',
    role: 'admin'
  },
  {
    email: 'user@animehub.com',
    passwordHash: 'password123',
    username: 'otaku_fan',
    role: 'user'
  },
  {
    email: 'reviewer@animehub.com',
    passwordHash: 'password123',
    username: 'anime_critic',
    role: 'user'
  }
];

const titles = [
  {
    name: 'Attack on Titan',
    type: 'anime',
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    year: 2013,
    synopsis: 'In a world where humanity lives within enormous walled cities to protect themselves from Titans, gigantic humanoid creatures, a young boy named Eren Yeager vows to exterminate them after a Titan destroys his hometown and kills his mother.',
    episodes: 87,
    status: 'completed',
    studio: 'Wit Studio / MAPPA',
    poster: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg'
  },
  {
    name: 'Death Note',
    type: 'anime',
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    year: 2006,
    synopsis: 'A high school student discovers a supernatural notebook that allows him to kill anyone by writing the victim\'s name while picturing their face.',
    episodes: 37,
    status: 'completed',
    studio: 'Madhouse',
    poster: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg'
  },
  {
    name: 'Fullmetal Alchemist: Brotherhood',
    type: 'anime',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    year: 2009,
    synopsis: 'Two brothers search for a Philosopher\'s Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms.',
    episodes: 64,
    status: 'completed',
    studio: 'Bones',
    poster: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg'
  },
  {
    name: 'Steins;Gate',
    type: 'anime',
    genres: ['Drama', 'Sci-Fi', 'Thriller'],
    year: 2011,
    synopsis: 'A self-proclaimed mad scientist discovers that his makeshift laboratory gadget can send messages to the past, altering the flow of history.',
    episodes: 24,
    status: 'completed',
    studio: 'White Fox',
    poster: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg'
  },
  {
    name: 'My Hero Academia',
    type: 'anime',
    genres: ['Action', 'Comedy', 'Superhero'],
    year: 2016,
    synopsis: 'In a world where people with superpowers are the norm, a boy without powers dreams of becoming a superhero and is eventually recruited by the greatest hero of all.',
    episodes: 138,
    status: 'airing',
    studio: 'Bones',
    poster: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg'
  },
  {
    name: 'Spirited Away',
    type: 'movie',
    genres: ['Adventure', 'Fantasy', 'Supernatural'],
    year: 2001,
    synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    episodes: 1,
    status: 'completed',
    studio: 'Studio Ghibli',
    poster: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg'
  },
  {
    name: 'Your Name',
    type: 'movie',
    genres: ['Drama', 'Fantasy', 'Romance'],
    year: 2016,
    synopsis: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
    episodes: 1,
    status: 'completed',
    studio: 'CoMix Wave Films',
    poster: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg'
  },
  {
    name: 'Demon Slayer',
    type: 'anime',
    genres: ['Action', 'Fantasy', 'Historical'],
    year: 2019,
    synopsis: 'A boy becomes a demon slayer to avenge his family and cure his sister, who has been turned into a demon.',
    episodes: 55,
    status: 'airing',
    studio: 'Ufotable',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'
  },
  {
    name: 'One Punch Man',
    type: 'anime',
    genres: ['Action', 'Comedy', 'Parody', 'Superhero'],
    year: 2015,
    synopsis: 'The story of Saitama, a hero who can defeat any opponent with a single punch but seeks to find a worthy opponent.',
    episodes: 24,
    status: 'completed',
    studio: 'Madhouse',
    poster: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg'
  },
  {
    name: 'Cowboy Bebop',
    type: 'anime',
    genres: ['Action', 'Drama', 'Sci-Fi'],
    year: 1998,
    synopsis: 'The futuristic misadventures and tragedies of an pointedly cool, easygoing bounty hunter and his ragtag crew of exiles.',
    episodes: 26,
    status: 'completed',
    studio: 'Sunrise',
    poster: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg'
  }
];

async function runSeed() {
  // Clear existing data (order matters for foreign keys)
  await Watchlist.deleteMany();
  await Review.deleteMany();
  await Title.deleteMany();
  await User.deleteMany();

  // Create users
  const createdUsers = [];
  for (const u of users) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  // Create titles
  const titlesWithCreator = titles.map(title => ({
    ...title,
    createdBy: createdUsers[0]._id
  }));
  const createdTitles = await Title.createMany(titlesWithCreator);

  // Create reviews
  const reviews = [
    {
      userId: createdUsers[1]._id,
      titleId: createdTitles[0]._id,
      rating: 10,
      text: 'An absolute masterpiece! The story keeps you on the edge of your seat.'
    },
    {
      userId: createdUsers[2]._id,
      titleId: createdTitles[0]._id,
      rating: 9,
      text: 'Incredible animation and storytelling. A must-watch for any anime fan.'
    },
    {
      userId: createdUsers[1]._id,
      titleId: createdTitles[1]._id,
      rating: 10,
      text: 'The psychological battle between Light and L is unmatched.'
    },
    {
      userId: createdUsers[2]._id,
      titleId: createdTitles[2]._id,
      rating: 10,
      text: 'The perfect anime. Amazing characters, story, and animation.'
    },
    {
      userId: createdUsers[1]._id,
      titleId: createdTitles[5]._id,
      rating: 10,
      text: 'A timeless Ghibli classic that everyone should watch.'
    }
  ];
  for (const r of reviews) {
    await Review.create(r);
  }

  // Create watchlist items
  await Watchlist.createForUser(createdUsers[1]._id, [
    { titleId: createdTitles[3]._id, status: 'plan_to_watch' },
    { titleId: createdTitles[4]._id, status: 'watching', progress: 50 },
    { titleId: createdTitles[0]._id, status: 'completed' }
  ]);
  await Watchlist.createForUser(createdUsers[2]._id, [
    { titleId: createdTitles[7]._id, status: 'watching', progress: 20 },
    { titleId: createdTitles[8]._id, status: 'completed' }
  ]);

  return {
    users: createdUsers.length,
    titles: createdTitles.length,
    reviews: reviews.length,
    watchlistItems: 5
  };
}

module.exports = runSeed;
