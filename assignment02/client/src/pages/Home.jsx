import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'motion/react';
import { BookOpen, Star, Search } from 'lucide-react';
import { titlesAPI } from '../services/api';
import { TitleCard, Loading } from '../components';
import './Home.css';

const Home = () => {
  const [topRated, setTopRated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topRatedRes, recentRes] = await Promise.all([
          titlesAPI.getTopRated({ limit: 6 }),
          titlesAPI.getAll({ limit: 6, sort: '-createdAt' })
        ]);

        setTopRated(topRatedRes.data.data);
        setRecent(recentRes.data.data);
      } catch (err) {
        setError('Failed to load content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading message="Loading anime hub..." />;

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <m.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <m.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span className="gradient-text">AnimeHub</span></h1>
          <p>Discover, track, and review your favorite anime and movies</p>
          <div className="hero-actions">
            <Link to="/browse" className="btn-primary">Browse All</Link>
            <Link to="/register" className="btn-secondary">Join Now</Link>
          </div>
        </div>
      </m.section>

      {topRated.length > 0 && (
        <m.section
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <m.div
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <h2>Top Rated</h2>
            <Link to="/browse?sort=-rating.average" className="view-all">
              View All &rarr;
            </Link>
          </m.div>
          <div className="title-grid">
            {topRated.map((title, i) => (
              <m.div
                key={title._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              >
                <TitleCard title={title} />
              </m.div>
            ))}
          </div>
        </m.section>
      )}

      {recent.length > 0 && (
        <m.section
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <m.div
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            <h2>Recently Added</h2>
            <Link to="/browse" className="view-all">
              View All &rarr;
            </Link>
          </m.div>
          <div className="title-grid">
            {recent.map((title, i) => (
              <m.div
                key={title._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
              >
                <TitleCard title={title} />
              </m.div>
            ))}
          </div>
        </m.section>
      )}

      <m.section
        className="features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <h2>Why AnimeHub?</h2>
        <div className="features-grid">
          {[
            { icon: BookOpen, title: 'Track Your Watchlist', desc: 'Keep track of what you\'re watching and plan what to watch next.' },
            { icon: Star, title: 'Rate & Review', desc: 'Share your thoughts and help others discover great anime.' },
            { icon: Search, title: 'Discover New Titles', desc: 'Browse by genre, year, or rating to find your next favorite.' },
          ].map((feat, i) => (
            <m.div
              key={feat.title}
              className="feature"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.85 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="feature-icon">
                <feat.icon size={28} strokeWidth={1.5} />
              </span>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </m.div>
          ))}
        </div>
      </m.section>
    </m.div>
  );
};

export default Home;
