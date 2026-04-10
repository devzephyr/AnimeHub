import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ProtectedRoute } from './components';
import {
  Home,
  Browse,
  TitleDetails,
  Login,
  Register,
  Watchlist,
  Profile
} from './pages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/titles/:id" element={<TitleDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 fallback */}
              <Route
                path="*"
                element={
                  <div className="not-found">
                    <h1>404</h1>
                    <p>Page not found</p>
                    <a href="/">Go Home</a>
                  </div>
                }
              />
            </Routes>
          </main>
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-brand">ANIMEHUB</div>
              <div className="footer-grid">
                <div className="footer-col">
                  <h4>Browse</h4>
                  <ul>
                    <li><a href="/browse">All Titles</a></li>
                    <li><a href="/browse?type=anime">Anime</a></li>
                    <li><a href="/browse?type=manga">Manga</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Account</h4>
                  <ul>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/watchlist">Watchlist</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Info</h4>
                  <ul>
                    <li><a href="https://github.com/devzephyr/animehub" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                &copy; {new Date().getFullYear()} AnimeHub. Built for educational purposes.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
