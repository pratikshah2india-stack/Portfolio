import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box animate-fadeInUp">
        <div className="login-logo">
          <span>K.</span>
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-sub">Sign in to manage your portfolio</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email" name="email" type="email"
              className="form-input" placeholder="admin@example.com"
              value={form.email} onChange={handleChange}
              autoComplete="email" required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password" name="password" type="password"
              className="form-input" placeholder="••••••••"
              value={form.password} onChange={handleChange}
              autoComplete="current-password" required
            />
          </div>

          {error && (
            <div className="form-message error">{error}</div>
          )}

          <button
            type="submit" id="login-submit"
            className="btn btn-primary" disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          No account yet?{' '}
          <a href="#" style={{ color: 'var(--accent-light)' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
          >
            Create admin account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
