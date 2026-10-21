import { Link } from 'react-router-dom';
import { m } from 'motion/react';
import { Home } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <m.div
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <m.h1
          className="not-found-code"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          404
        </m.h1>
        <m.p
          className="not-found-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          This page got isekai'd to another world
        </m.p>
        <m.p
          className="not-found-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </m.p>
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Link to="/" className="not-found-btn">
            <Home size={18} />
            Go Home
          </Link>
        </m.div>
      </m.div>
    </div>
  );
};

export default NotFound;
