import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1 className="not-found-code enter">404</h1>
      <p className="not-found-subtitle enter" style={{ '--i': 1 }}>
        This page got isekai'd to another world
      </p>
      <p className="not-found-desc enter" style={{ '--i': 2 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="enter" style={{ '--i': 3 }}>
        <Link to="/" className="btn btn-primary">
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
