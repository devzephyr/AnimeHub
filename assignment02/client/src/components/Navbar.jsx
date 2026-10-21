import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'motion/react';
import { Clapperboard, Compass, List, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <Clapperboard size={22} />
          AnimeHub
        </Link>

        <button
          className="hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <m.div
          className={`navbar-links ${mobileOpen ? 'open' : ''}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Link to="/browse" className="nav-link" onClick={closeMenu}>
            <Compass size={16} />
            Browse
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/watchlist" className="nav-link" onClick={closeMenu}>
                <List size={16} />
                My Watchlist
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                <User size={16} />
                Profile
              </Link>
              <div className="user-menu">
                <span className="username">{user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn-register" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </m.div>

        <AnimatePresence>
          {mobileOpen && (
            <m.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
