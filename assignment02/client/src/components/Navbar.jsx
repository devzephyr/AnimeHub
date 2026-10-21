import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clapperboard, Compass, List, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Clapperboard size={22} />
          AnimeHub
        </Link>

        <motion.div
          className="navbar-links"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Link to="/browse" className="nav-link">
            <Compass size={16} />
            Browse
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/watchlist" className="nav-link">
                <List size={16} />
                My Watchlist
              </Link>
              <Link to="/profile" className="nav-link">
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
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
