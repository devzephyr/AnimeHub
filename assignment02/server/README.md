# AnimeHub API Server

RESTful API backend for the Anime/Movie Recommendation Hub application.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/animehub
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/auth/me | Get current user | Yes |
| PUT | /api/auth/me | Update profile | Yes |
| PUT | /api/auth/password | Change password | Yes |

### Titles
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/titles | Get all titles (paginated) | No |
| GET | /api/titles/:id | Get single title | No |
| POST | /api/titles | Create title | Yes |
| PUT | /api/titles/:id | Update title | Yes |
| DELETE | /api/titles/:id | Delete title | Yes |
| GET | /api/titles/genres | Get all genres | No |
| GET | /api/titles/top-rated | Get top rated | No |

### Reviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/reviews | Get reviews | No |
| GET | /api/reviews/:id | Get single review | No |
| POST | /api/reviews | Create review | Yes |
| PUT | /api/reviews/:id | Update review | Yes |
| DELETE | /api/reviews/:id | Delete review | Yes |
| GET | /api/reviews/my/:titleId | Get user's review | Yes |

### Watchlist
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/watchlist | Get user's watchlist | Yes |
| POST | /api/watchlist | Add to watchlist | Yes |
| PUT | /api/watchlist/:titleId | Update status | Yes |
| DELETE | /api/watchlist/:titleId | Remove from list | Yes |
| GET | /api/watchlist/check/:titleId | Check if in list | Yes |
| GET | /api/watchlist/stats | Get stats | Yes |

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Filtering (Titles)
- `type` - Filter by type (anime, movie, series, ova, special)
- `genre` - Filter by genre
- `year` - Filter by year
- `status` - Filter by status
- `search` - Text search
- `minRating` - Minimum rating
- `sort` - Sort field (prefix with `-` for descending)

## Test Accounts

After seeding:
- Admin: admin@animehub.com / password123
- User: user@animehub.com / password123

## Project Structure

```
server/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── seed/            # Database seeder
├── app.js           # Express app entry
├── package.json
└── .env.example
```

## Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Start production
- `npm run seed` - Seed database
