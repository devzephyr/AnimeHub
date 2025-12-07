import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { watchlistAPI } from '../services/api';
import { Loading } from '../components';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' }
  ];

  useEffect(() => {
    fetchWatchlist();
    fetchStats();
  }, [filter]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await watchlistAPI.get(params);
      setWatchlist(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await watchlistAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleStatusChange = async (titleId, newStatus) => {
    try {
      await watchlistAPI.update(titleId, { status: newStatus });
      fetchWatchlist();
      fetchStats();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleRemove = async (titleId) => {
    if (!window.confirm('Remove from watchlist?')) return;

    try {
      await watchlistAPI.remove(titleId);
      fetchWatchlist();
      fetchStats();
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && !watchlist) return <Loading message="Loading watchlist..." />;

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1>My Watchlist</h1>
        {stats && (
          <div className="watchlist-stats">
            <span className="stat-total">{stats.total} titles</span>
            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
              <span key={status} className="stat-item">
                {formatStatus(status)}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="watchlist-filters">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn ${filter === opt.value ? 'active' : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!loading && watchlist?.items?.length === 0 ? (
        <div className="empty-watchlist">
          <p>
            {filter 
              ? `No titles with status "${formatStatus(filter)}"`
              : 'Your watchlist is empty'}
          </p>
          <Link to="/browse" className="btn-browse">Browse Titles</Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist?.items?.map((item) => (
            <div key={item.titleId?._id || item.titleId} className="watchlist-item">
              <Link 
                to={`/titles/${item.titleId?._id || item.titleId}`} 
                className="item-poster"
              >
                <img
                  src={item.titleId?.poster || 'https://via.placeholder.com/150x225?text=No+Poster'}
                  alt={item.titleId?.name || 'Unknown'}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x225?text=No+Poster';
                  }}
                />
              </Link>

              <div className="item-details">
                <Link 
                  to={`/titles/${item.titleId?._id || item.titleId}`}
                  className="item-title"
                >
                  {item.titleId?.name || 'Unknown Title'}
                </Link>

                <div className="item-meta">
                  <span className="item-type">{item.titleId?.type}</span>
                  {item.titleId?.year && <span>{item.titleId.year}</span>}
                  {item.titleId?.rating?.average > 0 && (
                    <span className="item-rating">
                      ★ {item.titleId.rating.average.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="item-controls">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(
                      item.titleId?._id || item.titleId, 
                      e.target.value
                    )}
                    className="status-select"
                  >
                    {statusOptions.slice(1).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRemove(item.titleId?._id || item.titleId)}
                    className="btn-remove"
                    aria-label="Remove from watchlist"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {item.titleId?.episodes && item.status === 'watching' && (
                  <div className="progress-info">
                    Progress: {item.progress || 0} / {item.titleId.episodes} eps
                  </div>
                )}

                <div className="item-added">
                  Added: {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
