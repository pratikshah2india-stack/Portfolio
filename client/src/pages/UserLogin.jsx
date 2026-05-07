import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { userRegister, userVerifyOTP, userResendOTP, userLogin, userForgotPassword, userResetPassword } from '../api/userAuth';

const UserLogin = () => {
  const { userLogin: loginCtx, isUserLoggedIn } = useUserAuth();
  const navigate = useNavigate();

  // tab: 'login' | 'register' | 'verify' | 'forgot' | 'reset'
  const [tab, setTab] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ password: '', confirm: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => { if (isUserLoggedIn) navigate('/', { replace: true }); }, [isUserLoggedIn, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const clearMsg = () => setMsg({ type: '', text: '' });

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

  // ── REGISTER ──
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

  // ── VERIFY OTP ──
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

  // ── RESEND OTP ──
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

  // ── LOGIN ──
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

  // ── FORGOT PASSWORD ──
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMsg();
    setLoading(true);
    try {
      await userForgotPassword({ email: forgotEmail });
      setPendingEmail(forgotEmail);
      setOtp(['', '', '', '', '', '']);
      setTab('reset');
      setCountdown(60);
      setMsg({ type: 'success', text: 'If that email is registered, a reset OTP has been sent.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send reset OTP.' });
    } finally { setLoading(false); }
  };

  // ── RESET PASSWORD ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMsg();
    if (resetForm.password !== resetForm.confirm) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    const code = otp.join('');
    if (code.length < 6) return setMsg({ type: 'error', text: 'Please enter the full 6-digit OTP.' });
    setLoading(true);
    try {
      const res = await userResetPassword({ email: pendingEmail, otp: code, password: resetForm.password });
      setMsg({ type: 'success', text: res.data.message });
      setTimeout(() => { setTab('login'); clearMsg(); setOtp(['', '', '', '', '', '']); }, 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Reset failed.' });
    } finally { setLoading(false); }
  };

  const otpBoxes = (
    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }} onPaste={handleOtpPaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => otpRefs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digit}
          onChange={e => handleOtpChange(i, e.target.value)}
          onKeyDown={e => handleOtpKey(i, e)}
          className="otp-box"
          style={{ borderColor: digit ? 'var(--accent)' : 'var(--border)' }}
        />
      ))}
    </div>
  );

  const resendBlock = (
    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      Didn't receive it?{' '}
      <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
        style={{ background: 'none', border: 'none', cursor: countdown > 0 ? 'default' : 'pointer', color: countdown > 0 ? 'var(--text-muted)' : 'var(--accent-light)', fontWeight: 600, fontSize: '0.85rem' }}>
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
      </button>
    </div>
  );

  return (
    <div className="login-page" style={{ background: 'var(--bg-primary)' }}>
      <Link to="/" className="back-to-home">← Back to Portfolio</Link>

      <div className="login-box animate-fadeInUp" style={{ maxWidth: 440 }}>
        <div className="login-logo"><span>K.</span></div>

        {/* ── VERIFY EMAIL VIEW ── */}
        {tab === 'verify' && (
          <>
            <h1 className="login-title">Verify Your Email</h1>
            <p className="login-sub">We sent a 6-digit code to <strong style={{ color: 'var(--accent-light)' }}>{pendingEmail}</strong></p>
            {msg.text && <div className={`form-message ${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {otpBoxes}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>
              {resendBlock}
              <button type="button" onClick={() => { setTab('register'); clearMsg(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                ← Change email / Go back
              </button>
            </form>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {tab === 'forgot' && (
          <>
            <h1 className="login-title">Forgot Password?</h1>
            <p className="login-sub">Enter your email and we'll send you a reset OTP.</p>
            {msg.text && <div className={`form-message ${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoComplete="email" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Sending OTP...' : 'Send Reset OTP →'}
              </button>
              <button type="button" onClick={() => { setTab('login'); clearMsg(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center' }}>
                ← Back to Sign In
              </button>
            </form>
          </>
        )}

        {/* ── RESET PASSWORD VIEW ── */}
        {tab === 'reset' && (
          <>
            <h1 className="login-title">Reset Password</h1>
            <p className="login-sub">Enter the OTP sent to <strong style={{ color: 'var(--accent-light)' }}>{pendingEmail}</strong> and your new password.</p>
            {msg.text && <div className={`form-message ${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {otpBoxes}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-field">
                  <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={resetForm.password} onChange={e => setResetForm(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)} title="Toggle visibility">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Repeat new password"
                  value={resetForm.confirm} onChange={e => setResetForm(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Resetting...' : 'Reset Password →'}
              </button>
              {resendBlock}
              <button type="button" onClick={() => { setTab('forgot'); clearMsg(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                ← Change email
              </button>
            </form>
          </>
        )}

        {/* ── LOGIN / REGISTER TABS ── */}
        {(tab === 'login' || tab === 'register') && (
          <>
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
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Password</span>
                    <button type="button" id="forgot-password-link"
                      onClick={() => { setForgotEmail(loginForm.email); setTab('forgot'); clearMsg(); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}>
                      Forgot password?
                    </button>
                  </label>
                  <div className="password-field">
                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required autoComplete="current-password" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)} title="Toggle visibility">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" id="user-login-submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
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
                  <div className="password-field">
                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={regForm.password}
                      onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)} title="Toggle visibility">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={regForm.confirm}
                    onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <button type="submit" id="user-register-submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
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
