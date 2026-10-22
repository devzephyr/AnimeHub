import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { titlesAPI } from '../services/api';
import { TitleCard, Loading, Pagination } from '../components';
import { plural } from '../lib/format';
import './Browse.css';

const DEFAULT_FILTERS = { search: '', type: '', genre: '', year: '', sort: '-createdAt' };
const TYPES = ['anime', 'movie', 'series', 'ova', 'special'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-rating.average', label: 'Highest Rated' },
  { value: 'name', label: 'A-Z' },
  { value: '-name', label: 'Z-A' },
  { value: '-year', label: 'Year (Newest)' }
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1960 + 2 }, (_, i) => CURRENT_YEAR + 1 - i);

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [titles, setTitles] = useState([]);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [animateIntro, setAnimateIntro] = useState(false);
  const hasLoaded = useRef(false);

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    sort: searchParams.get('sort') || DEFAULT_FILTERS.sort
  }), [searchParams]);
  const [searchInput, setSearchInput] = useState(filters.search);

  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    titlesAPI.getGenres()
      .then((response) => setGenres(response.data.data))
      .catch((err) => console.error('Failed to fetch genres:', err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchTitles = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 20,
          ...(filters.search && { search: filters.search }),
          ...(filters.type && { type: filters.type }),
          ...(filters.genre && { genre: filters.genre }),
          ...(filters.year && { year: filters.year }),
          ...(filters.sort && { sort: filters.sort })
        };

        const response = await titlesAPI.getAll(params);
        if (cancelled) return;
        // Cards animate on the first load only; later refetches swap content in place.
        setAnimateIntro(!hasLoaded.current);
        hasLoaded.current = true;
        setTitles(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError('Failed to load titles');
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    };

    fetchTitles();
    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  const applyFilters = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => applyFilters({ ...filters, [key]: value });

  useEffect(() => {
    if (searchInput === filters.search) return;
    const timer = setTimeout(() => applyFilters({ ...filters, search: searchInput }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const refreshing = loading && loaded;

  return (
    <div className="browse">
      <div className="browse-header">
        <h1 className="page-title">Browse Titles</h1>
        <p>{loaded ? `${plural(pagination.total, 'title', 'titles')} found` : ' '}</p>
      </div>

      <div className="filters">
        <div className="filter-row">
          <input
            type="search"
            placeholder="Search titles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="field search-input"
            aria-label="Search titles"
            enterKeyHint="search"
          />

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="field filter-select"
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="field filter-select"
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="field filter-select"
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="field filter-select"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="btn btn-secondary btn-clear">
            Clear
          </button>
        </div>
      </div>

      {!loaded ? (
        <Loading message="Loading titles..." />
      ) : error ? (
        <div className="browse-error">{error}</div>
      ) : titles.length === 0 ? (
        <div className="empty-state">
          <p>No titles found matching your criteria.</p>
          <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className={`browse-results ${refreshing ? 'is-refreshing' : ''}`} aria-busy={refreshing}>
          <div className="title-grid">
            {titles.map((title, i) => (
              <div
                key={title._id}
                className={animateIntro ? 'enter' : undefined}
                style={animateIntro ? { '--i': Math.min(i, 8) } : undefined}
              >
                <TitleCard title={title} />
              </div>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Browse;
