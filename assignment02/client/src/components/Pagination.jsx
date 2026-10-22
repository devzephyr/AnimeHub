import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const getPageNumbers = (page, pages) => {
  const delta = 2;
  const range = [];
  for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
    range.push(i);
  }

  const items = [1];
  if (page - delta > 2) items.push('start-dots');
  items.push(...range);
  if (page + delta < pages - 1) items.push('end-dots');
  if (pages > 1) items.push(pages);
  return items;
};

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="btn btn-secondary page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="page-btn-label">Prev</span>
      </button>

      <div className="page-numbers">
        {getPageNumbers(page, pages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="page-dots" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              className={`page-num ${page === item ? 'active' : ''}`}
              onClick={() => onPageChange(item)}
              aria-current={page === item ? 'page' : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <span className="page-compact" aria-live="polite">
        {page} / {pages}
      </span>

      <button
        className="btn btn-secondary page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
      >
        <span className="page-btn-label">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
