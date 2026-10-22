import { useState, useEffect } from 'react';
import { m } from 'motion/react';
import { toast } from 'sonner';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { Loading } from '../components';
import { firstGrapheme, formatNumber, formatStatus } from '../lib/format';
import { enter } from '../lib/motion';
import './Profile.css';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState(EMPTY_PASSWORDS);

  const userId = user?._id;

  useEffect(() => {
    if (user) setFormData({ username: user.username, avatar: user.avatar || '' });
    setAvatarFailed(false);
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [reviewsRes, statsRes] = await Promise.all([
          reviewsAPI.getAll({ userId, limit: 5 }),
          watchlistAPI.getStats()
        ]);
        setReviews(reviewsRes.data.data);
        setStats(statsRes.data.data);
      } catch {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    const username = formData.username.trim();
    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setSaving(true);
    try {
      const response = await authAPI.updateMe({ ...formData, username });
      updateUser(response.data.data);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);

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
      setPasswordData(EMPTY_PASSWORDS);
      toast.success('Password changed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setError(null);
    setFormData({ username: user.username, avatar: user.avatar || '' });
  };

  const cancelPassword = () => {
    setShowPasswordForm(false);
    setError(null);
    setPasswordData(EMPTY_PASSWORDS);
  };

  if (!user || loading) return <Loading message="Loading profile..." />;

  const initial = firstGrapheme(user.username);

  return (
    <div className="profile-page">
      <div className="profile-header enter">
        <div className="profile-avatar">
          {user.avatar && !avatarFailed ? (
            <img src={user.avatar} alt={user.username} onError={() => setAvatarFailed(true)} />
          ) : (
            <span className="avatar-placeholder" aria-hidden="true">
              {initial || <UserIcon size={40} />}
            </span>
          )}
        </div>
        <div className="profile-info">
          <h1 className="page-title">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">
            {user.role === 'admin' ? '👑 Admin' : '👤 Member'}
          </p>
          <p className="profile-joined">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error appear" role="alert">
          {error}
        </div>
      )}

      <div className="profile-sections">
        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Profile Settings</h2>
            {!editMode && (
              <button onClick={() => { setError(null); setEditMode(true); }} className="btn btn-ghost btn-sm">
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <m.form key="profile-form" onSubmit={handleProfileUpdate} className="profile-form" {...enter}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="field"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar">Avatar URL</label>
                <input
                  type="url"
                  id="avatar"
                  className="field"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="profile-form-actions">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </m.form>
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
          <div className="profile-section-header">
            <h2>Security</h2>
          </div>

          {showPasswordForm ? (
            <m.form key="password-form" onSubmit={handlePasswordChange} className="profile-form" {...enter}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="field"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="field"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="field"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="profile-form-actions">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button type="button" onClick={cancelPassword} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </m.form>
          ) : (
            <button onClick={() => { setError(null); setShowPasswordForm(true); }} className="btn btn-secondary btn-sm">
              Change Password
            </button>
          )}
        </section>

        {stats && (
          <section className="profile-section">
            <h2 className="profile-section-title">Watchlist Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{formatNumber(stats.total)}</span>
                <span className="stat-label">Total Titles</span>
              </div>
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <div key={status} className="stat-card">
                  <span className="stat-number">{formatNumber(count)}</span>
                  <span className="stat-label">{formatStatus(status)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section-title">Recent Reviews</h2>
            <div className="profile-reviews">
              {reviews.map((review) => (
                <div key={review._id} className="profile-review">
                  <div className="profile-review-title">
                    {review.titleId?.name || 'Unknown Title'}
                  </div>
                  <div className="profile-review-rating">★ {review.rating}/10</div>
                  {review.text && (
                    <p className="profile-review-text">{review.text}</p>
                  )}
                  <span className="profile-review-date">
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
