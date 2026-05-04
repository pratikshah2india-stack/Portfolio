import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { userRegister, userVerifyOTP, userResendOTP, userLogin } from '../api/userAuth';

const UserLogin = () => {
  const { userLogin: loginCtx, isUserLoggedIn } = useUserAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'verify'
  const [pendingEmail, setPendingEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // OTP inputs (6 boxes)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  useEffect(() => { if (isUserLoggedIn) navigate('/', { replace: true }); }, [isUserLoggedIn, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const clearMsg = () => setMsg({ type: '', text: '' });

  // ── OTP BOX HANDLERS ──────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── REGISTER ──────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMsg();
    if (regForm.password !== regForm.confirm) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    setLoading(true);
    try {
      await userRegister({ name: regForm.name, email: regForm.email, password: regForm.password });
      setPendingEmail(regForm.email);
      setTab('verify');
      setCountdown(60);
      setMsg({ type: 'success', text: `OTP sent to ${regForm.email}. Check your inbox!` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    } finally { setLoading(false); }
  };

  // ── VERIFY OTP ────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    clearMsg();
    const code = otp.join('');
    if (code.length < 6) return setMsg({ type: 'error', text: 'Please enter the full 6-digit OTP.' });
    setLoading(true);
    try {
      const res = await userVerifyOTP({ email: pendingEmail, otp: code });
      loginCtx(res.data.token, res.data.user);
      setMsg({ type: 'success', text: '✅ Email verified! Redirecting...' });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid OTP.' });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  // ── RESEND OTP ────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    clearMsg();
    try {
      await userResendOTP({ email: pendingEmail });
      setCountdown(60);
      setMsg({ type: 'success', text: 'New OTP sent! Check your inbox.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to resend OTP.' });
    } finally { setLoading(false); }
  };

  // ── LOGIN ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMsg();
    setLoading(true);
    try {
      const res = await userLogin(loginForm);
      loginCtx(res.data.token, res.data.user);
      setMsg({ type: 'success', text: `Welcome back, ${res.data.user.name}!` });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      const d = err.response?.data;
      if (d?.needsVerification) {
        setPendingEmail(d.email);
        setTab('verify');
        setMsg({ type: 'error', text: 'Email not verified. Please enter your OTP.' });
      } else {
        setMsg({ type: 'error', text: d?.message || 'Login failed.' });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page" style={{ background: 'var(--bg-primary)' }}>
      {/* Back to Home */}
      <Link to="/" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        ← Back to Portfolio
      </Link>

      <div className="login-box animate-fadeInUp" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="login-logo">
          <span>K.</span>
        </div>

        {/* ── VERIFY OTP VIEW ── */}
        {tab === 'verify' ? (
          <>
            <h1 className="login-title">Verify Your Email</h1>
            <p className="login-sub">
              We sent a 6-digit code to <strong style={{ color: 'var(--accent-light)' }}>{pendingEmail}</strong>
            </p>
            {msg.text && <div className={`form-message ${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* OTP Boxes */}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    style={{
                      width: '48px', height: '56px', textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: 800,
                      background: 'var(--bg-secondary)', border: `2px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '10px', color: 'var(--text-primary)', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Didn't receive it?{' '}
                <button type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  style={{ background: 'none', border: 'none', cursor: countdown > 0 ? 'default' : 'pointer', color: countdown > 0 ? 'var(--text-muted)' : 'var(--accent-light)', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <button type="button" onClick={() => { setTab('register'); clearMsg(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                ← Change email / Go back
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Tabs */}
            <div className="dashboard-tabs" style={{ marginBottom: '1.75rem' }}>
              <button className={`dash-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); clearMsg(); }}>Sign In</button>
              <button className={`dash-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); clearMsg(); }}>Create Account</button>
            </div>

            {msg.text && <div className={`form-message ${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={loginForm.email}
                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required autoComplete="current-password" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No account?{' '}
                  <button type="button" onClick={() => { setTab('register'); clearMsg(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Your full name" value={regForm.name}
                    onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={regForm.email}
                    onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min. 6 characters" value={regForm.password}
                    onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Repeat password" value={regForm.confirm}
                    onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
                  {loading ? 'Sending OTP...' : 'Create Account & Send OTP →'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
