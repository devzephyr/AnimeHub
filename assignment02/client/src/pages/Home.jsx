import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to AnimeHub</h1>
          <p>Discover, track, and review your favorite anime and movies</p>
          <div className="hero-actions">
            <Link to="/browse" className="btn-primary">Browse All</Link>
            <Link to="/register" className="btn-secondary">Join Now</Link>
          </div>
        </div>
      </section>

      {topRated.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Top Rated</h2>
            <Link to="/browse?sort=-rating.average" className="view-all">
              View All &rarr;
            </Link>
          </div>
          <div className="title-grid">
            {topRated.map((title) => (
              <TitleCard key={title._id} title={title} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/browse" className="view-all">
              View All &rarr;
            </Link>
          </div>
          <div className="title-grid">
            {recent.map((title) => (
              <TitleCard key={title._id} title={title} />
            ))}
          </div>
        </section>
      )}

      <section className="features">
        <h2>Why AnimeHub?</h2>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">📚</span>
            <h3>Track Your Watchlist</h3>
            <p>Keep track of what you're watching and plan what to watch next.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⭐</span>
            <h3>Rate & Review</h3>
            <p>Share your thoughts and help others discover great anime.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <h3>Discover New Titles</h3>
            <p>Browse by genre, year, or rating to find your next favorite.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
