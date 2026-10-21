import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { m } from 'motion/react';
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
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'inherit',
          },
        }}
      />
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
                  <m.div
                    className="not-found"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <m.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      404
                    </m.h1>
                    <m.p
                      className="not-found-subtitle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                    >
                      This page got isekai'd to another world
                    </m.p>
                    <m.p
                      className="not-found-desc"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      The page you're looking for doesn't exist or has been moved.
                    </m.p>
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.55 }}
                    >
                      <Link to="/" className="not-found-btn">Go Home</Link>
                    </m.div>
                  </m.div>
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
