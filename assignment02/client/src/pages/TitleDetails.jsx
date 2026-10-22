import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { titlesAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';
import { FALLBACK_POSTER, onPosterError } from '../lib/poster';
import { formatNumber, formatStatus, plural } from '../lib/format';
import { enter, pop } from '../lib/motion';
import './TitleDetails.css';

const REVIEWS_PER_PAGE = 10;
const LONG_SYNOPSIS = 600;
const EMPTY_FORM = { rating: 5, text: '' };

const TitleDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [title, setTitle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsMeta, setReviewsMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSynopsisExpanded(false);
        const [titleRes, reviewsRes] = await Promise.all([
          titlesAPI.getOne(id),
          reviewsAPI.getAll({ titleId: id, limit: REVIEWS_PER_PAGE })
        ]);

        setTitle(titleRes.data.data);
        setReviews(reviewsRes.data.data);
        setReviewsMeta(reviewsRes.data.pagination || { page: 1, pages: 1, total: reviewsRes.data.data.length });

        if (isAuthenticated) {
          try {
            const [myReviewRes, watchlistRes] = await Promise.all([
              reviewsAPI.getMyReview(id),
              watchlistAPI.check(id)
            ]);
            setMyReview(myReviewRes.data.data);
            setWatchlistStatus(watchlistRes.data.data);

            if (myReviewRes.data.data) {
              setReviewForm({
                rating: myReviewRes.data.data.rating,
                text: myReviewRes.data.data.text || ''
              });
            }
          } catch {
            // user-specific data is optional
          }
        }
      } catch {
        setError('Failed to load title');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const refreshTitle = async () => {
    const titleRes = await titlesAPI.getOne(id);
    setTitle(titleRes.data.data);
  };

  const runWatchlistAction = (request, messages) => {
    setWatchlistBusy(true);
    const promise = request().finally(() => setWatchlistBusy(false));
    toast.promise(promise, messages);
  };

  const handleAddToWatchlist = (status) =>
    runWatchlistAction(
      () => watchlistAPI.add({ titleId: id, status }).then(() => {
        setWatchlistStatus({ inWatchlist: true, item: { status } });
      }),
      { loading: 'Adding to watchlist…', success: 'Added to watchlist', error: 'Failed to add to watchlist' }
    );

  const handleRemoveFromWatchlist = () =>
    runWatchlistAction(
      () => watchlistAPI.remove(id).then(() => {
        setWatchlistStatus({ inWatchlist: false, item: null });
      }),
      { loading: 'Removing from watchlist…', success: 'Removed from watchlist', error: 'Failed to remove from watchlist' }
    );

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isUpdate = Boolean(myReview);

    try {
      if (isUpdate) {
        const response = await reviewsAPI.update(myReview._id, reviewForm);
        const updated = response.data.data;
        setMyReview(updated);
        setReviews((list) => list.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)));
      } else {
        const response = await reviewsAPI.create({ titleId: id, ...reviewForm });
        setMyReview(response.data.data);
        setReviews((list) => [response.data.data, ...list]);
        setReviewsMeta((meta) => ({ ...meta, total: meta.total + 1 }));
      }
      setShowReviewForm(false);
      toast.success(isUpdate ? 'Review updated' : 'Review submitted');
      await refreshTitle();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = () => {
    if (!myReview) return;

    const deleted = myReview;
    const previousForm = reviewForm;
    let settled = false;

    const restore = () => {
      setMyReview(deleted);
      setReviews((list) => [deleted, ...list.filter((r) => r._id !== deleted._id)]);
      setReviewsMeta((meta) => ({ ...meta, total: meta.total + 1 }));
      setReviewForm(previousForm);
    };

    const commit = async () => {
      if (settled) return;
      settled = true;
      try {
        await reviewsAPI.delete(deleted._id);
        await refreshTitle();
      } catch {
        toast.error('Failed to delete review');
        restore();
      }
    };

    setMyReview(null);
    setReviews((list) => list.filter((r) => r._id !== deleted._id));
    setReviewsMeta((meta) => ({ ...meta, total: Math.max(0, meta.total - 1) }));
    setReviewForm(EMPTY_FORM);
    setShowReviewForm(false);

    toast('Review deleted', {
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

  const handleLoadMoreReviews = async () => {
    setLoadingMore(true);
    try {
      const nextPage = reviewsMeta.page + 1;
      const res = await reviewsAPI.getAll({ titleId: id, limit: REVIEWS_PER_PAGE, page: nextPage });
      setReviews((list) => {
        const seen = new Set(list.map((r) => r._id));
        return [...list, ...res.data.data.filter((r) => !seen.has(r._id))];
      });
      setReviewsMeta(res.data.pagination);
    } catch {
      toast.error('Failed to load more reviews');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <Loading message="Loading title..." />;
  if (error) return <div className="error-page">{error}</div>;
  if (!title) return <div className="error-page">Title not found</div>;

  const synopsisIsLong = title.synopsis?.length > LONG_SYNOPSIS;
  const hasMoreReviews = reviewsMeta.page < reviewsMeta.pages;

  return (
    <div className="title-details">
      <div className="title-hero enter">
        <div className="title-poster-large">
          <img
            src={title.poster || FALLBACK_POSTER}
            alt={title.name}
            onError={onPosterError}
          />
        </div>

        <div className="title-info-large">
          {title.type && <div className="title-type-badge">{title.type}</div>}
          <h1 className="page-title">{title.name}</h1>

          <div className="title-meta-row">
            {title.year > 0 && <span>{title.year}</span>}
            {title.episodes > 0 && <span>{plural(title.episodes, 'episode', 'episodes')}</span>}
            {title.status && <span className="status-badge">{title.status}</span>}
          </div>

          {title.studio && <p className="studio">Studio: {title.studio}</p>}

          {title.rating?.average > 0 && (
            <div className="rating-large">
              <span className="star" aria-hidden="true">★</span>
              <span className="rating-value">{title.rating.average.toFixed(1)}</span>
              <span className="rating-count">({plural(title.rating.count, 'review', 'reviews')})</span>
            </div>
          )}

          {title.genres?.length > 0 && (
            <div className="genres-list">
              {title.genres.map((genre) => (
                <Link
                  key={genre}
                  to={`/browse?genre=${encodeURIComponent(genre)}`}
                  className="genre-link"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {title.synopsis && (
            <div className="synopsis">
              <h3>Synopsis</h3>
              <p className={synopsisIsLong && !synopsisExpanded ? 'is-clamped' : undefined}>
                {title.synopsis}
              </p>
              {synopsisIsLong && (
                <button
                  type="button"
                  className="synopsis-toggle"
                  onClick={() => setSynopsisExpanded((v) => !v)}
                  aria-expanded={synopsisExpanded}
                >
                  {synopsisExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="user-actions">
              <button
                onClick={watchlistStatus?.inWatchlist ? handleRemoveFromWatchlist : () => handleAddToWatchlist('plan_to_watch')}
                className={`btn ${watchlistStatus?.inWatchlist ? 'btn-secondary' : 'btn-primary'}`}
                disabled={watchlistBusy}
              >
                {watchlistStatus?.inWatchlist ? 'Remove from Watchlist' : '+ Add to Watchlist'}
              </button>

              <button
                onClick={() => setShowReviewForm((v) => !v)}
                className="btn btn-secondary"
                aria-expanded={showReviewForm}
                aria-controls="review-form"
              >
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>

              <AnimatePresence>
                {watchlistStatus?.inWatchlist && (
                  <m.span key="in-watchlist" className="in-watchlist" {...pop}>
                    <Check size={16} aria-hidden="true" />
                    In Watchlist ({formatStatus(watchlistStatus.item.status)})
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReviewForm && isAuthenticated && (
          <m.div key="review-form" id="review-form" className="review-form-container" {...enter}>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h3>{myReview ? 'Edit Your Review' : 'Write a Review'}</h3>

              <div className="form-group">
                <span className="form-label" id="rating-label">Rating</span>
                <div className="rating-input" role="group" aria-labelledby="rating-label">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`rating-star ${i < reviewForm.rating ? 'active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                      aria-label={`Rate ${i + 1} out of 10`}
                      aria-pressed={reviewForm.rating === i + 1}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-display">{reviewForm.rating}/10</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="review-text">Review (optional)</label>
                <textarea
                  id="review-text"
                  className="field"
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <div className="review-form-actions">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
                {myReview && (
                  <button type="button" onClick={handleDeleteReview} className="btn btn-danger">
                    Delete Review
                  </button>
                )}
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </m.div>
        )}
      </AnimatePresence>

      <section className="reviews-section">
        <h2 className="section-title">Reviews ({formatNumber(reviewsMeta.total)})</h2>

        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            <AnimatePresence initial={false}>
              {reviews.map((review) => (
                <m.div
                  key={review._id}
                  className={`review-card ${review.userId?._id === user?._id ? 'my-review' : ''}`}
                  {...enter}
                >
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.userId?.username || 'Anonymous'}
                    </span>
                    <span className="review-rating">★ {review.rating}/10</span>
                  </div>
                  {review.text && <p className="review-text">{review.text}</p>}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {hasMoreReviews && (
          <button
            type="button"
            className="btn btn-secondary load-more"
            onClick={handleLoadMoreReviews}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more reviews'}
          </button>
        )}
      </section>
    </div>
  );
};

export default TitleDetails;
