# AnimeHub Client

React frontend for the Anime/Movie Recommendation Hub application.

## Tech Stack

- React 18 (via Vite)
- React Router v6
- Axios
- CSS (component-scoped)

## Prerequisites

- Node.js >= 18

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure API URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Features

- Browse anime and movies with filtering and search
- View detailed information for each title
- User registration and authentication
- Personal watchlist management
- Rating and reviewing titles
- User profile management
- Responsive design

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| / | Home | Landing page with top rated and recent titles |
| /browse | Browse | Searchable, filterable list of all titles |
| /titles/:id | TitleDetails | Full title info, reviews, watchlist actions |
| /login | Login | User login form |
| /register | Register | New user registration |
| /watchlist | Watchlist | User's personal watchlist (protected) |
| /profile | Profile | User settings and stats (protected) |

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── TitleCard.jsx
│   │   ├── Loading.jsx
│   │   ├── Pagination.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/        # React Context (Auth)
│   │   └── AuthContext.jsx
│   ├── pages/          # Route components
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── TitleDetails.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Watchlist.jsx
│   │   └── Profile.jsx
│   ├── services/       # API client
│   │   └── api.js
│   ├── App.jsx         # Root component with routing
│   ├── App.css         # Global styles
│   └── main.jsx        # Entry point
├── public/
├── package.json
└── .env.example
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:5000/api |

## Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Focus management
- Screen reader friendly
