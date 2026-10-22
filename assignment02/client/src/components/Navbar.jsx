import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'motion/react';
import { Clapperboard, Compass, List, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EASE_OUT } from '../lib/motion';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }

  const closeMenu = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const links = (
    <>
      <NavLink to="/browse" className="nav-link" onClick={closeMenu}>
        <Compass size={16} />
        Browse
      </NavLink>

      {isAuthenticated ? (
        <>
          <NavLink to="/watchlist" className="nav-link" onClick={closeMenu}>
            <List size={16} />
            My Watchlist
          </NavLink>
          <NavLink to="/profile" className="nav-link" onClick={closeMenu}>
            <User size={16} />
            Profile
          </NavLink>
          <div className="user-menu">
            <span className="username" title={user?.username}>{user?.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="auth-links">
          <NavLink to="/login" className="nav-link" onClick={closeMenu}>Login</NavLink>
          <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register</Link>
        </div>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <Clapperboard size={22} />
          AnimeHub
        </Link>

        <button
          className="hamburger"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="navbar-links">{links}</div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <m.div
                key="backdrop"
                className="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                onClick={closeMenu}
              />
              <m.div
                key="panel"
                id="mobile-menu"
                className="mobile-menu"
                style={{ transformOrigin: 'top right' }}
                initial={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{
                  opacity: 0,
                  transform: 'translateY(-8px) scale(0.98)',
                  transition: { duration: 0.15, ease: EASE_OUT },
                }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {links}
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
