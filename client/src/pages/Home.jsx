import React, { useState, useEffect } from 'react';
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

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ type: '', msg: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: '', msg: '' });
    try {
      await sendMessage(form);
      setFormStatus({ type: 'success', msg: '✅ Message sent! I\'ll get back to you soon.' });
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
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fadeInUp">
              <span></span> Available for Hire
            </div>
            <h1 className="animate-fadeInUp delay-1">
              Hi, I'm Kailash.<br />I Build for the Web.
            </h1>
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
        <div className="hero-scroll">scroll</div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="divider"></div>
          <p className="section-sub">A selection of things I've built. More on GitHub.</p>

          {loadingProjects ? (
            <div className="loading-wrap"><div className="spinner"></div></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <p>No projects yet. Check back soon!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="section">
        <div className="container">
          <h2 className="section-title">Skills & Technologies</h2>
          <div className="divider"></div>
          <p className="section-sub">Technologies I work with on a daily basis.</p>
          <div className="skills-grid">
            {SKILLS.map((skill, i) => (
              <SkillBadge key={skill.name} name={skill.name} icon={skill.icon} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="divider"></div>
          <p className="section-sub">Have a project in mind? Let's talk.</p>

          <div className="contact-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name" name="name" type="text"
                    className="form-input" placeholder="Your name"
                    value={form.name} onChange={handleFormChange} required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email" name="email" type="email"
                    className="form-input" placeholder="your@email.com"
                    value={form.email} onChange={handleFormChange} required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message" name="message"
                  className="form-textarea" placeholder="Tell me about your project..."
                  value={form.message} onChange={handleFormChange} required
                />
              </div>
              {formStatus.msg && (
                <div className={`form-message ${formStatus.type}`}>{formStatus.msg}</div>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>Built with ❤️ by <span>Kailash</span> · React + Node.js + MongoDB</p>
      </footer>
    </>
  );
};

export default Home;
