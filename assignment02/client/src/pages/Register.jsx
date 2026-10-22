import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const FIELDS = [
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email', autoComplete: 'email' },
  { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', autoComplete: 'username' },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password', autoComplete: 'new-password' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register, error: authError, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await register(formData.email, formData.password, formData.username);
      if (result.success) {
        toast.success('Account created!');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container enter">
        <h1 className="page-title">Create Account</h1>
        <p className="auth-subtitle">Join AnimeHub today</p>

        {authError && <div className="auth-error appear" role="alert">{authError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {FIELDS.map((field) => {
            const errorId = `${field.name}-error`;
            return (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  className="field"
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? errorId : undefined}
                />
                {errors[field.name] && (
                  <span id={errorId} className="field-error appear">{errors[field.name]}</span>
                )}
              </div>
            );
          })}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-auth">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
