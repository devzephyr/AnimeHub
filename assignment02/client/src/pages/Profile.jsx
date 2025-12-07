import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { Loading } from '../components';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, avatar: user.avatar || '' });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsAPI.getAll({ userId: user._id, limit: 5 }),
        watchlistAPI.getStats()
      ]);
      setReviews(reviewsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await authAPI.updateMe(formData);
      updateUser(response.data.data);
      setEditMode(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Loading message="Loading profile..." />;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">
            {user.role === 'admin' ? '👑 Admin' : '👤 Member'}
          </p>
          <p className="profile-joined">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {(error || success) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
          {error || success}
        </div>
      )}

      <div className="profile-sections">
        <section className="profile-section">
          <div className="section-header">
            <h2>Profile Settings</h2>
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)} 
                className="btn-edit"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar">Avatar URL</label>
                <input
                  type="url"
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving} className="btn-save">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ username: user.username, avatar: user.avatar || '' });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{user.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h2>Security</h2>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    currentPassword: e.target.value 
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    newPassword: e.target.value 
                  })}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    confirmPassword: e.target.value 
                  })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving} className="btn-save">
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-password"
            >
              Change Password
            </button>
          )}
        </section>

        {stats && (
          <section className="profile-section">
            <h2>Watchlist Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Titles</span>
              </div>
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <div key={status} className="stat-card">
                  <span className="stat-number">{count}</span>
                  <span className="stat-label">
                    {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="profile-section">
            <h2>Recent Reviews</h2>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-title">
                    {review.titleId?.name || 'Unknown Title'}
                  </div>
                  <div className="review-rating">★ {review.rating}/10</div>
                  {review.text && (
                    <p className="review-text">{review.text}</p>
                  )}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
