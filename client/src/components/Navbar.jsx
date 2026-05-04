import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">K.</Link>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className="navbar-links">
          <a href="/#projects">Projects</a>
          <a href="/#skills">Skills</a>
          <a href="/#contact">Contact</a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <button className="btn-nav btn-nav-outline">Dashboard</button>
              </Link>
              <button className="btn-nav btn-nav-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="btn-nav btn-nav-outline">Admin Login</button>
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          <a href="/#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="/#skills" onClick={() => setMenuOpen(false)}>Skills</a>
          <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button className="btn-nav btn-nav-danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Admin Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
