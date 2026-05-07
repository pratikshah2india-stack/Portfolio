import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import SkillBadge from '../components/SkillBadge';
import { getProjects } from '../api/projects';
import { sendMessage } from '../api/messages';

const SKILLS = [
  { name: 'JavaScript', icon: '🟨' },
  { name: 'React', icon: '⚛️' },
  { name: 'Node.js', icon: '🟩' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Express', icon: '🚂' },
  { name: 'Python', icon: '🐍' },
  { name: 'TypeScript', icon: '🔷' },
  { name: 'Git', icon: '🔀' },
  { name: 'REST APIs', icon: '🔌' },
  { name: 'Docker', icon: '🐳' },
  { name: 'CSS/Sass', icon: '🎨' },
  { name: 'SQL', icon: '🗄️' },
];

const TYPED_WORDS = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'Open Source Fan'];

// ── Typed Text Hook ──────────────────────────────────────────────────────────
function useTyped(words, speed = 80, deleteSpeed = 40, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = words[wordIndex];
    let timer;
    if (typing) {
      if (charIndex < current.length) {
        timer = setTimeout(() => setCharIndex(i => i + 1), speed);
      } else {
        timer = setTimeout(() => setTyping(false), pause);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => setCharIndex(i => i - 1), deleteSpeed);
      } else {
        setWordIndex(i => (i + 1) % words.length);
        setTyping(true);
      }
    }
    setDisplay(current.slice(0, charIndex));
    return () => clearTimeout(timer);
  }, [charIndex, typing, wordIndex, words, speed, deleteSpeed, pause]);

  return display;
}

// ── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

// ── Counter Hook ─────────────────────────────────────────────────────────────
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Stats Component ───────────────────────────────────────────────────────────
const StatCounter = ({ target, label, suffix = '+' }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const count = useCounter(target, 1800, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-item reveal">
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// ── Splash Loader ─────────────────────────────────────────────────────────────
const SplashLoader = ({ onDone }) => {
  const [fade, setFade] = useState(false);
  const phrases = [
    'Crafting Experiences...',
    'Building the Web...',
    'Loading Portfolio...',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setPhraseIdx(i => (i + 1) % phrases.length), 600);
    const t2 = setTimeout(() => { setFade(true); setTimeout(onDone, 600); }, 2200);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`splash-loader ${fade ? 'splash-fade' : ''}`}>
      <div className="splash-inner">
        <div className="splash-logo">K.</div>
        <div className="splash-bar-wrap"><div className="splash-bar" /></div>
        <p className="splash-text">{phrases[phraseIdx]}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ type: '', msg: '' });
  const [submitting, setSubmitting] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const typedText = useTyped(TYPED_WORDS);
  useScrollReveal();

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: '', msg: '' });
    try {
      await sendMessage(form);
      setFormStatus({ type: 'success', msg: "✅ Message sent! I'll get back to you soon." });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong.';
      setFormStatus({ type: 'error', msg: `❌ ${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!splashDone && <SplashLoader onDone={() => setSplashDone(true)} />}

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        {/* Floating particles */}
        <div className="hero-particles" aria-hidden="true">
          {[...Array(18)].map((_, i) => (
            <span key={i} className="particle" style={{ '--i': i }} />
          ))}
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fadeInUp">
              <span /> Available for Hire
            </div>
            <h1 className="hero-title animate-fadeInUp delay-1">
              Hi, I'm Kailash Prasad Shah.
            </h1>
            {/* Typed text */}
            <div className="hero-typed animate-fadeInUp delay-2">
              <span className="typed-text">{typedText}</span>
              <span className="typed-cursor">|</span>
            </div>
            <p className="hero-tagline animate-fadeInUp delay-2">
              Full-Stack Developer crafting fast, scalable, and beautiful web applications.
              From idea to deployment — I make it happen.
            </p>
            <div className="hero-actions animate-fadeInUp delay-3">
              <a href="#projects" className="btn btn-primary">View My Work 🚀</a>
              <a href="#contact" className="btn btn-secondary">Get In Touch</a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <StatCounter target={15} label="Projects Built" />
            <StatCounter target={3} label="Years Experience" suffix="+" />
            <StatCounter target={10} label="Technologies" suffix="+" />
            <StatCounter target={100} label="Commits This Year" suffix="+" />
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────── */}
      <section id="projects" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title reveal">Featured Projects</h2>
          <div className="divider reveal" />
          <p className="section-sub reveal">A selection of things I've built. More on GitHub.</p>

          {loadingProjects ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : projects.length === 0 ? (
            <div className="empty-state reveal">
              <div className="empty-state-icon">📂</div>
              <p>No projects yet. Check back soon!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project, i) => (
                <div key={project._id} className="reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProjectCard project={project} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────── */}
      <section id="skills" className="section">
        <div className="container">
          <h2 className="section-title reveal">Skills &amp; Technologies</h2>
          <div className="divider reveal" />
          <p className="section-sub reveal">Technologies I work with on a daily basis.</p>
          <div className="skills-grid">
            {SKILLS.map((skill, i) => (
              <div key={skill.name} className="reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <SkillBadge name={skill.name} icon={skill.icon} delay={i * 0.05} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title reveal">Get In Touch</h2>
          <div className="divider reveal" />
          <p className="section-sub reveal">Have a project in mind? Let's talk.</p>

          <div className="contact-wrapper reveal">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Name</label>
                  <input id="contact-name" name="name" type="text"
                    className="form-input" placeholder="Your name"
                    value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email</label>
                  <input id="contact-email" name="email" type="email"
                    className="form-input" placeholder="your@email.com"
                    value={form.email} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message"
                  className="form-textarea" placeholder="Tell me about your project..."
                  value={form.message} onChange={handleFormChange} required />
              </div>
              {formStatus.msg && (
                <div className={`form-message ${formStatus.type}`}>{formStatus.msg}</div>
              )}
              <button type="submit" id="contact-submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title reveal">About Me</h2>
          <div className="divider reveal" />
          <div className="about-card reveal">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💻</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Kailash Prasad Shah</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 1.75rem' }}>
              A passionate Full-Stack Developer who loves building fast, scalable, and beautiful
              web applications. From crafting elegant UIs to designing robust backend systems —
              I bring ideas to life.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>📞</span>
                <a href="tel:9703440607" style={{ color: 'var(--accent-light)' }}>9703440607</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>✉️</span>
                <a href="mailto:pratikshah2056@gmail.com" style={{ color: 'var(--accent-light)' }}>pratikshah2056@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                GitHub
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter / X
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {['GitHub', 'LinkedIn', 'Twitter', 'Instagram'].map(name => (
            <a key={name} href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }} aria-label={name}>
              {name}
            </a>
          ))}
        </div>
        <p style={{ marginBottom: '0.4rem' }}>About <span>Kailash Prasad Shah</span></p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📞 <a href="tel:9703440607" style={{ color: 'inherit' }}>9703440607</a>
          &nbsp;·&nbsp;
          ✉️ <a href="mailto:pratikshah2056@gmail.com" style={{ color: 'inherit' }}>pratikshah2056@gmail.com</a>
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          © {new Date().getFullYear()} Kailash Prasad Shah. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default Home;
