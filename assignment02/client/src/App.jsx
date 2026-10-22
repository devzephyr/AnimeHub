import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ProtectedRoute } from './components';
import {
  Home,
  Browse,
  TitleDetails,
  Login,
  Register,
  Watchlist,
  Profile,
  NotFound
} from './pages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          theme="dark"
          position="bottom-right"
          icons={{
            success: <CheckCircle2 size={16} color="var(--success)" />,
            error: <XCircle size={16} color="var(--error)" />,
          }}
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'inherit',
            },
          }}
        />
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/titles/:id" element={<TitleDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-brand">ANIMEHUB</div>
              <div className="footer-grid">
                <div className="footer-col">
                  <h4>Browse</h4>
                  <ul>
                    <li><Link to="/browse">All Titles</Link></li>
                    <li><Link to="/browse?type=anime">Anime</Link></li>
                    <li><Link to="/browse?type=movie">Movies</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Account</h4>
                  <ul>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/watchlist">Watchlist</Link></li>
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
