import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { titlesAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';
import './TitleDetails.css';

const TitleDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [title, setTitle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [titleRes, reviewsRes] = await Promise.all([
          titlesAPI.getOne(id),
          reviewsAPI.getAll({ titleId: id, limit: 10 })
        ]);

        setTitle(titleRes.data.data);
        setReviews(reviewsRes.data.data);

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
          } catch (err) {
            console.error('Failed to fetch user data:', err);
          }
        }
      } catch (err) {
        setError('Failed to load title');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleAddToWatchlist = async (status) => {
    try {
      await watchlistAPI.add({ titleId: id, status });
      setWatchlistStatus({ inWatchlist: true, item: { status } });
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      await watchlistAPI.remove(id);
      setWatchlistStatus({ inWatchlist: false, item: null });
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (myReview) {
        // Update existing review
        const response = await reviewsAPI.update(myReview._id, reviewForm);
        setMyReview(response.data.data);
      } else {
        // Create new review
        const response = await reviewsAPI.create({
          titleId: id,
          ...reviewForm
        });
        setMyReview(response.data.data);
        setReviews([response.data.data, ...reviews]);
      }
      setShowReviewForm(false);

      // Refresh title to get updated rating
      const titleRes = await titlesAPI.getOne(id);
      setTitle(titleRes.data.data);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !window.confirm('Delete your review?')) return;

    try {
      await reviewsAPI.delete(myReview._id);
      setMyReview(null);
      setReviews(reviews.filter((r) => r._id !== myReview._id));
      setReviewForm({ rating: 5, text: '' });

      // Refresh title rating
      const titleRes = await titlesAPI.getOne(id);
      setTitle(titleRes.data.data);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  if (loading) return <Loading message="Loading title..." />;
  if (error) return <div className="error-page">{error}</div>;
  if (!title) return <div className="error-page">Title not found</div>;

  const defaultPoster = 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="title-details">
      <div className="title-hero">
        <div className="title-poster-large">
          <img
            src={title.poster || defaultPoster}
            alt={title.name}
            onError={(e) => { e.target.src = defaultPoster; }}
          />
        </div>

        <div className="title-info-large">
          <div className="title-type-badge">{title.type}</div>
          <h1>{title.name}</h1>

          <div className="title-meta-row">
            {title.year && <span>{title.year}</span>}
            {title.episodes && <span>{title.episodes} episodes</span>}
            {title.status && <span className="status-badge">{title.status}</span>}
          </div>

          {title.studio && <p className="studio">Studio: {title.studio}</p>}

          {title.rating?.average > 0 && (
            <div className="rating-large">
              <span className="star">★</span>
              <span className="rating-value">{title.rating.average.toFixed(1)}</span>
              <span className="rating-count">({title.rating.count} reviews)</span>
            </div>
          )}

          {title.genres?.length > 0 && (
            <div className="genres-list">
              {title.genres.map((genre, index) => (
                <Link
                  key={index}
                  to={`/browse?genre=${genre}`}
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
              <p>{title.synopsis}</p>
            </div>
          )}

          {isAuthenticated && (
            <div className="user-actions">
              <button
                onClick={watchlistStatus?.inWatchlist ? handleRemoveFromWatchlist : () => handleAddToWatchlist('plan_to_watch')}
                className="btn-add"
              >
                {watchlistStatus?.inWatchlist ? 'Remove from Watchlist' : '+ Add to Watchlist'}
              </button>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-review"
              >
                {myReview ? 'Edit Review' : 'Write Review'}
              </button>

              {watchlistStatus?.inWatchlist && (
                <span className="in-watchlist">
                  ✓ In Watchlist ({watchlistStatus.item.status.replace(/_/g, ' ')})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showReviewForm && isAuthenticated && (
        <div className="review-form-container">
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>{myReview ? 'Edit Your Review' : 'Write a Review'}</h3>

            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rating-star ${i < reviewForm.rating ? 'active' : ''}`}
                    onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-display">{reviewForm.rating}/10</span>
              </div>
            </div>

            <div className="form-group">
              <label>Review (optional)</label>
              <textarea
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                placeholder="Share your thoughts..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting} className="btn-submit">
                {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="btn-delete"
                >
                  Delete Review
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`review-card ${review.userId?._id === user?._id ? 'my-review' : ''}`}
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TitleDetails;
