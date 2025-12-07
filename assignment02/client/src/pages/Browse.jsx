import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { titlesAPI } from '../services/api';
import { TitleCard, Loading, Pagination } from '../components';
import './Browse.css';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [titles, setTitles] = useState([]);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    sort: searchParams.get('sort') || '-createdAt'
  });

  const page = parseInt(searchParams.get('page')) || 1;

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await titlesAPI.getGenres();
        setGenres(response.data.data);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch titles when filters or page changes
  useEffect(() => {
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
        setTitles(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        setError('Failed to load titles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      genre: '',
      year: '',
      sort: '-createdAt'
    });
    setSearchParams({});
  };

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const types = ['anime', 'movie', 'series', 'ova', 'special'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-rating.average', label: 'Highest Rated' },
    { value: 'name', label: 'A-Z' },
    { value: '-name', label: 'Z-A' },
    { value: '-year', label: 'Year (Newest)' }
  ];

  return (
    <div className="browse">
      <div className="browse-header">
        <h1>Browse Titles</h1>
        <p>{pagination.total} titles found</p>
      </div>

      <div className="filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search titles..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="filter-select"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="filter-select"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="btn-clear">
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading titles..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : titles.length === 0 ? (
        <div className="empty-state">
          <p>No titles found matching your criteria.</p>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="title-grid">
            {titles.map((title) => (
              <TitleCard key={title._id} title={title} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Browse;
