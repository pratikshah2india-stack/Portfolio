import React from 'react';

const icons = ['🚀', '⚡', '🔥', '💡', '🛠️', '🌐', '📦', '🎯'];

const ProjectCard = ({ project, index = 0 }) => {
  const icon = icons[index % icons.length];

  return (
    <div className="card project-card animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="project-card-header">
        <h3 className="project-title">{project.title}</h3>
        <span className="project-icon">{icon}</span>
      </div>

      <p className="project-desc">{project.description}</p>

      {project.techStack && project.techStack.length > 0 && (
        <div className="tech-stack">
          {project.techStack.map((tech, i) => (
            <span key={i} className="tech-badge">{tech}</span>
          ))}
        </div>
      )}

      <div className="project-links">
        {project.liveLink && (
          <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="project-link">
            🌐 Live Demo
          </a>
        )}
        {project.githubLink && (
          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
            ⚙️ GitHub
          </a>
        )}
        {!project.liveLink && !project.githubLink && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No links provided</span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
