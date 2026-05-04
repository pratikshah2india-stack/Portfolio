import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import { getMessages, deleteMessage } from '../api/messages';

const EMPTY_FORM = { title: '', description: '', techStack: '', liveLink: '', githubLink: '' };

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch { setProjects([]); }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await getMessages();
      setMessages(res.data);
    } catch { setMessages([]); }
  }, []);

  useEffect(() => {
    Promise.all([fetchProjects(), fetchMessages()]).finally(() => setLoading(false));
  }, [fetchProjects, fetchMessages]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    setFormSuccess('');
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateProject(editingId, payload);
        setFormSuccess('✅ Project updated successfully!');
      } else {
        await createProject(payload);
        setFormSuccess('✅ Project added successfully!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description,
      techStack: (project.techStack || []).join(', '),
      liveLink: project.liveLink || '',
      githubLink: project.githubLink || '',
    });
    setFormSuccess('');
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete project.'); }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch { alert('Failed to delete message.'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setFormSuccess(''); };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <div className="dashboard-title">⚡ Admin Dashboard</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Logged in as <span style={{ color: 'var(--accent-light)' }}>{user?.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="dashboard-tabs">
              <button className={`dash-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                📁 Projects
              </button>
              <button className={`dash-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                💬 Messages {messages.length > 0 && <span style={{ marginLeft: '4px', background: 'var(--accent)', borderRadius: '999px', padding: '1px 7px', fontSize: '0.7rem' }}>{messages.length}</span>}
              </button>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Stats */}
        <div className="stat-chips">
          <div className="stat-chip">
            <div className="stat-chip-val">{projects.length}</div>
            <div className="stat-chip-label">Projects</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-val">{messages.length}</div>
            <div className="stat-chip-label">Messages</div>
          </div>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <>
            {/* Form */}
            <div className="dash-card">
              <div className="dash-card-title">
                {editingId ? '✏️ Edit Project' : '➕ Add New Project'}
                {editingId && (
                  <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSave} className="project-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-title">Title *</label>
                  <input id="proj-title" name="title" className="form-input" placeholder="Project title" value={form.title} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-tech">Tech Stack</label>
                  <input id="proj-tech" name="techStack" className="form-input" placeholder="React, Node.js, MongoDB" value={form.techStack} onChange={handleFormChange} />
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="proj-desc">Description *</label>
                  <textarea id="proj-desc" name="description" className="form-textarea" style={{ minHeight: '90px' }} placeholder="Short description of the project..." value={form.description} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-live">Live Link</label>
                  <input id="proj-live" name="liveLink" type="url" className="form-input" placeholder="https://..." value={form.liveLink} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-github">GitHub Link</label>
                  <input id="proj-github" name="githubLink" type="url" className="form-input" placeholder="https://github.com/..." value={form.githubLink} onChange={handleFormChange} />
                </div>
                {formError && <div className="form-message error full">{formError}</div>}
                {formSuccess && <div className="form-message success full">{formSuccess}</div>}
                <div className="full">
                  <button type="submit" id="save-project-btn" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </form>
            </div>

            {/* Projects Table */}
            <div className="dash-card">
              <div className="dash-card-title">📋 All Projects ({projects.length})</div>
              {projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <p>No projects yet. Add your first one above!</p>
                </div>
              ) : (
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tech Stack</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => (
                      <tr key={project._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{project.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                            {project.description.substring(0, 60)}{project.description.length > 60 ? '...' : ''}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {(project.techStack || []).slice(0, 3).map((t, i) => (
                              <span key={i} className="tech-badge">{t}</span>
                            ))}
                            {(project.techStack || []).length > 3 && (
                              <span className="tech-badge">+{project.techStack.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(project.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(project)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="dash-card">
            <div className="dash-card-title">💬 Contact Messages ({messages.length})</div>
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No messages yet. Share your portfolio link!</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map(msg => (
                  <div key={msg._id} className="message-card">
                    <div className="message-meta">
                      <div>
                        <span className="message-sender">{msg.name}</span>
                        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>·</span>
                        <span className="message-email">{msg.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span className="message-date">{formatDate(msg.createdAt)}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMessage(msg._id)}>🗑️</button>
                      </div>
                    </div>
                    <p className="message-body">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
