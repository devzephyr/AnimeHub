import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import { Loading, Pagination } from '../components';
import { FALLBACK_POSTER, onPosterError } from '../lib/poster';
import { formatNumber, formatStatus, plural } from '../lib/format';
import './Watchlist.css';

const PER_PAGE = 20;
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'plan_to_watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' }
];

const itemId = (item) => item.titleId?._id || item.titleId;

const Watchlist = () => {
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  const [listVersion, setListVersion] = useState(0);
  const [statsVersion, setStatsVersion] = useState(0);
  const fetchWatchlist = () => setListVersion((v) => v + 1);
  const fetchStats = () => setStatsVersion((v) => v + 1);

  useEffect(() => {
    let cancelled = false;
    const params = { page, limit: PER_PAGE, ...(filter && { status: filter }) };
    watchlistAPI.get(params)
      .then((response) => {
        if (cancelled) return;
        setItems(response.data.data.items || []);
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load watchlist');
      });
    return () => {
      cancelled = true;
    };
  }, [page, filter, listVersion]);

  useEffect(() => {
    let cancelled = false;
    watchlistAPI.getStats()
      .then((response) => {
        if (!cancelled) setStats(response.data.data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load stats');
      });
    return () => {
      cancelled = true;
    };
  }, [statsVersion]);

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const handleStatusChange = async (titleId, newStatus) => {
    const previous = items;
    setItems((list) => list.map((item) => (itemId(item) === titleId ? { ...item, status: newStatus } : item)));
    try {
      await watchlistAPI.update(titleId, { status: newStatus });
      fetchStats();
      if (filter) fetchWatchlist();
    } catch {
      setItems(previous);
      toast.error('Failed to update status');
    }
  };

  const handleRemove = (item) => {
    const titleId = itemId(item);
    const name = item.titleId?.name || 'Title';
    let settled = false;

    const restore = () => fetchWatchlist();

    const commit = async () => {
      if (settled) return;
      settled = true;
      try {
        await watchlistAPI.remove(titleId);
        fetchStats();
        fetchWatchlist();
      } catch {
        toast.error('Failed to remove from watchlist');
        restore();
      }
    };

    setItems((list) => list.filter((i) => itemId(i) !== titleId));

    toast(`Removed ${name}`, {
      action: {
        label: 'Undo',
        onClick: () => {
          if (settled) return;
          settled = true;
          restore();
        },
      },
      onAutoClose: commit,
      onDismiss: commit,
    });
  };

  if (!items && !error) return <Loading message="Loading watchlist..." />;

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1 className="page-title">My Watchlist</h1>
        {stats && (
          <div className="watchlist-stats">
            <span className="stat-total">{plural(stats.total, 'title', 'titles')}</span>
            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
              <span key={status} className="stat-item">
                {formatStatus(status)}: {formatNumber(count)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="watchlist-filters" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn ${filter === opt.value ? 'active' : ''}`}
            onClick={() => changeFilter(opt.value)}
            aria-pressed={filter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <div className="wl-error">{error}</div>}

      {items?.length === 0 ? (
        <div className="empty-watchlist">
          <p>
            {filter
              ? `No titles with status "${formatStatus(filter)}"`
              : 'Your watchlist is empty'}
          </p>
          <Link to="/browse" className="btn btn-primary">Browse Titles</Link>
        </div>
      ) : (
        <>
          <div className="watchlist-grid">
            {items?.map((item) => {
              const id = itemId(item);
              const title = item.titleId || {};
              return (
                <div key={id} className="watchlist-item">
                  <Link to={`/titles/${id}`} className="item-poster" tabIndex={-1} aria-hidden="true">
                    <img
                      src={title.poster || FALLBACK_POSTER}
                      alt=""
                      loading="lazy"
                      onError={onPosterError}
                    />
                  </Link>

                  <div className="item-details">
                    <Link to={`/titles/${id}`} className="item-title">
                      {title.name || 'Unknown Title'}
                    </Link>

                    <div className="item-meta">
                      {title.type && <span className="item-type">{title.type}</span>}
                      {title.year > 0 && <span>{title.year}</span>}
                      {title.rating?.average > 0 && (
                        <span className="item-rating">★ {title.rating.average.toFixed(1)}</span>
                      )}
                    </div>

                    <div className="item-controls">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        className="field status-select"
                        aria-label={`Status for ${title.name || 'title'}`}
                      >
                        {STATUS_OPTIONS.slice(1).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemove(item)}
                        className="wl-remove"
                        aria-label={`Remove ${title.name || 'title'} from watchlist`}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {title.episodes > 0 && item.status === 'watching' && (
                      <div className="progress-info">
                        Progress: {item.progress || 0} / {plural(title.episodes, 'ep', 'eps')}
                      </div>
                    )}

                    <div className="item-added">
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0 });
            }}
          />
        </>
      )}
    </div>
  );
};

export default Watchlist;
