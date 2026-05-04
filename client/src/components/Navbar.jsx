import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserAuth } from '../context/UserAuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { isUserLoggedIn, currentUser, userLogout } = useUserAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAdminLogout = () => { logout(); navigate('/'); };
  const handleUserLogout  = () => { userLogout(); navigate('/'); };

  const NavLinks = ({ onClick }) => (
    <>
      <a href="/#projects" onClick={onClick}>Projects</a>
      <a href="/#skills"   onClick={onClick}>Skills</a>
      <a href="/#about"    onClick={onClick}>About</a>
      <a href="/#contact"  onClick={onClick}>Contact</a>

      {/* Admin controls — only shown when logged in as admin */}
      {isAuthenticated && (
        <>
          <Link to="/dashboard" onClick={onClick}>
            <button className="btn-nav btn-nav-outline">Dashboard</button>
          </Link>
          <button className="btn-nav btn-nav-danger" onClick={handleAdminLogout}>Logout</button>
        </>
      )}

      {/* User Sign In / Out */}
      {!isAuthenticated && (
        isUserLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              👤 {currentUser?.name?.split(' ')[0]}
            </span>
            <button className="btn-nav btn-nav-danger" onClick={handleUserLogout}>Sign Out</button>
          </div>
        ) : (
          <Link to="/user-login" onClick={onClick}>
            <button className="btn-nav btn-nav-outline">Sign In</button>
          </Link>
        )
      )}
    </>
  );

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
          <NavLinks />
        </div>
      </div>

      {menuOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          <NavLinks onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;

