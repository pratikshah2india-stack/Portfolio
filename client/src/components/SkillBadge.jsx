import React from 'react';

const SkillBadge = ({ name, icon, delay = 0 }) => (
  <div className="skill-badge animate-fadeInUp" style={{ animationDelay: `${delay}s` }}>
    <span className="skill-icon">{icon}</span>
    <span className="skill-name">{name}</span>
  </div>
);

export default SkillBadge;
