import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserAuth } from '../context/UserAuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { isUserLoggedIn, currentUser, userLogout } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio_theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const handleAdminLogout = () => { logout(); navigate('/'); };
  const handleUserLogout  = () => { userLogout(); navigate('/'); };
  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  const activeHash = location.hash || '';
  const linkClassName = (hash) => `nav-link${activeHash === hash ? ' active' : ''}`;

  const NavLinks = ({ onClick }) => (
    <>
      <a href="/#projects" className={linkClassName('#projects')} onClick={onClick}>Projects</a>
      <a href="/#skills" className={linkClassName('#skills')} onClick={onClick}>Skills</a>
      <a href="/#about" className={linkClassName('#about')} onClick={onClick}>About</a>
      <a href="/#contact" className={linkClassName('#contact')} onClick={onClick}>Contact</a>

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

        <button className="btn-nav btn-nav-outline theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

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

