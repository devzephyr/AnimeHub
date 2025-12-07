import './Pagination.css';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else if (pages > 1) {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        &laquo; Prev
      </button>

      <div className="page-numbers">
        {getPageNumbers().map((pageNum, index) =>
          pageNum === '...' ? (
            <span key={`dots-${index}`} className="page-dots">...</span>
          ) : (
            <button
              key={pageNum}
              className={`page-num ${page === pageNum ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          )
        )}
      </div>

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;
