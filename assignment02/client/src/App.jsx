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
            <p>&copy; {new Date().getFullYear()} AnimeHub. Built for educational purposes.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
