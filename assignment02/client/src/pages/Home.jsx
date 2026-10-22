import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Search } from 'lucide-react';
import { titlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TitleCard, Loading } from '../components';
import './Home.css';

const FEATURES = [
  { icon: BookOpen, title: 'Track Your Watchlist', desc: 'Keep track of what you\'re watching and plan what to watch next.' },
  { icon: Star, title: 'Rate & Review', desc: 'Share your thoughts and help others discover great anime.' },
  { icon: Search, title: 'Discover New Titles', desc: 'Browse by genre, year, or rating to find your next favorite.' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
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
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const sections = [
    { key: 'top', title: 'Top Rated', to: '/browse?sort=-rating.average', items: topRated },
    { key: 'recent', title: 'Recently Added', to: '/browse', items: recent },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="home">
      <section className="hero enter">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span className="hero-accent">AnimeHub</span></h1>
          <p>Discover, track, and review your favorite anime and movies</p>
          <div className="hero-actions">
            <Link to="/browse" className="btn btn-primary">Browse All</Link>
            {!isAuthenticated && <Link to="/register" className="btn btn-secondary">Join Now</Link>}
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.key} className="home-section">
          <div className="home-section-header">
            <h2 className="section-title">{section.title}</h2>
            <Link to={section.to} className="view-all">
              View All &rarr;
            </Link>
          </div>
          <div className="title-grid">
            {section.items.map((title, i) => (
              <div key={title._id} className="enter" style={{ '--i': i, '--enter-delay': '60ms' }}>
                <TitleCard title={title} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="features">
        <h2 className="section-title">Why AnimeHub?</h2>
        <div className="features-grid">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="feature">
              <feat.icon className="feature-icon" size={28} strokeWidth={1.5} aria-hidden="true" />
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
