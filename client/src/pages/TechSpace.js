import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import TerminalSpinner from '../components/TerminalSpinner';
import ToolsSelector from '../components/ToolsSelector';
import ToolsManager from './ToolsManager';
import './TechSpace.css';

// Helper to format URLs safely (preventing relative URL issues and handling domain links)
const formatUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const siteMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?ibraheemibnanwar\.me(\/.*)?$/i);
  if (siteMatch) {
    return siteMatch[1] || '/';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const TechSpace = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [adding, setAdding]         = useState(false);
  const [editingId, setEditingId]   = useState('');
  const [formTitle, setFormTitle]   = useState('');
  const [formIntroduction, setFormIntroduction] = useState('');
  const [formBackground, setFormBackground] = useState('');
  const [formDatasetTitle, setFormDatasetTitle] = useState('');
  const [formDatasetUrl, setFormDatasetUrl] = useState('');
  const [formMyRole, setFormMyRole] = useState('');
  const [formUrl, setFormUrl]       = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formFile, setFormFile]     = useState(null);
  const [formTools, setFormTools]   = useState([]);
  const [editTitle, setEditTitle]   = useState('');
  const [editIntroduction, setEditIntroduction] = useState('');
  const [editBackground, setEditBackground] = useState('');
  const [editDatasetTitle, setEditDatasetTitle] = useState('');
  const [editDatasetUrl, setEditDatasetUrl] = useState('');
  const [editMyRole, setEditMyRole] = useState('');
  const [editUrl, setEditUrl]       = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editFile, setEditFile]     = useState(null);
  const [editTools, setEditTools]   = useState([]);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const imgRef                      = useRef(null);
  const editImgRef                  = useRef(null);
  const projectRefs                 = useRef({});
  const { isAdmin, token }          = useAuth();
  const titleVisible                = useScrollTitle();

  useEffect(() => {
    axios.get('/api/projects')
      .then(({ data }) => { 
        if (data.length) {
          setProjects(data);
          // If slug provided, expand and scroll to that project
          if (slug) {
            const found = data.find(p => p.slug === slug);
            if (found) {
              setExpandedId(found._id);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, [slug]);

  // Auto-scroll to project when expandedId changes from slug navigation
  useEffect(() => {
    if (expandedId && projectRefs.current[expandedId]) {
      setTimeout(() => {
        projectRefs.current[expandedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [expandedId, projects]);

  const resetForm = () => {
    setAdding(false);
    setFormTitle(''); setFormIntroduction(''); setFormBackground(''); setFormDatasetTitle(''); setFormDatasetUrl(''); setFormMyRole('');
    setFormUrl(''); setFormGithub('');
    setFormFile(null); setFormTools([]);
    setSaveMsg('');
  };

  const handleAdd = async () => {
    if (!formTitle.trim()) { setSaveMsg('Enter a project title.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const form = new FormData();
      form.append('title', formTitle.trim());
      form.append('introduction', formIntroduction.trim());
      form.append('background', formBackground.trim());
      form.append('datasetTitle', formDatasetTitle.trim());
      form.append('datasetUrl', formDatasetUrl.trim());
      form.append('tools', JSON.stringify(formTools));
      form.append('myRole', formMyRole.trim());
      form.append('url', formUrl.trim());
      form.append('githubUrl', formGithub.trim());
      if (formFile) form.append('image', formFile);
      const { data } = await axios.post('/api/projects', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProjects(prev => [...prev, data]);
      resetForm();
      setSaveMsg('Added!');
    } catch { setSaveMsg('Failed to add.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setSaving(true); setSaveMsg('');
    try {
      await axios.delete(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(prev => prev.filter(p => p._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { setSaveMsg('Failed to remove.'); }
    finally { setSaving(false); }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditTitle(project.title || '');
    setEditIntroduction(project.introduction || '');
    setEditBackground(project.background || '');
    setEditDatasetTitle(project.datasetTitle || '');
    setEditDatasetUrl(project.datasetUrl || '');
    setEditTools(project.tools?.map(t => t._id || t) || []);
    setEditMyRole(project.myRole || '');
    setEditUrl(project.url || '');
    setEditGithub(project.githubUrl || '');
    setEditFile(null);
    setSaveMsg('');
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditTitle('');
    setEditIntroduction('');
    setEditBackground('');
    setEditDatasetTitle('');
    setEditDatasetUrl('');
    setEditTools([]);
    setEditMyRole('');
    setEditUrl('');
    setEditGithub('');
    setEditFile(null);
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) { setSaveMsg('Enter a project title.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const form = new FormData();
      form.append('title', editTitle.trim());
      form.append('introduction', editIntroduction.trim());
      form.append('background', editBackground.trim());
      form.append('datasetTitle', editDatasetTitle.trim());
      form.append('datasetUrl', editDatasetUrl.trim());
      form.append('tools', JSON.stringify(editTools));
      form.append('myRole', editMyRole.trim());
      form.append('url', editUrl.trim());
      form.append('githubUrl', editGithub.trim());
      if (editFile) form.append('image', editFile);
      const { data } = await axios.put(`/api/projects/${id}`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProjects(prev => prev.map(p => (p._id === id ? data : p)));
      setEditingId('');
      setEditFile(null);
      setSaveMsg('Updated!');
    } catch {
      setSaveMsg('Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (project) => {
    if (expandedId === project._id) {
      setExpandedId(null);
      navigate('/techspace', { replace: true });
    } else {
      setExpandedId(project._id);
      if (project.slug) {
        navigate(`/techspace/${project.slug}`, { replace: true });
      }
    }
  };

  const CATEGORY_ORDER = [
    'Languages',
    'Frontend',
    'Backend',
    'Frameworks',
    'Database',
    'Machine Learning',
    'Storage/Cloud',
    'DevOps/Deployment',
    'Authentication',
    'API/Services',
    'Tools/Build',
    'Testing',
    'Other',
  ];

  const renderCategorizedTechnologies = (toolsList) => {
    if (!toolsList || !toolsList.length) return null;
    const groups = {};
    toolsList.forEach((tool) => {
      const cat = tool.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });

    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;
      return posA - posB;
    });

    return (
      <div className="ts-tech-categorized-list">
        {sortedCategories.map((category) => (
          <div key={category} className="ts-tech-cat-row">
            <span className="ts-tech-cat-label">{category}:</span>
            <div className="ts-tech-pills-wrap">
              {groups[category].map((tool) => (
                <span key={tool._id} className="ts-tech-pill">
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="ts-page">
      <h1 className="ts-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>TECH SPACE</h1>

      <section className="ts-projects-outer">
        <div className="ts-projects-header">
          <h2 className="ts-projects-heading">MY PROJECTS</h2>
          {isAdmin && (
            <button 
              className={`ts-add-btn ${adding ? 'is-active' : ''}`}
              onClick={() => setAdding(!adding)} 
              title={adding ? 'Cancel adding project' : 'Add new project'}
            >
              {adding ? '✕ CANCEL' : '+ ADD NEW PROJECT'}
            </button>
          )}
        </div>

        {/* Admin Add Form */}
        {isAdmin && adding && (
          <div className="ts-admin-add-form-section">
            <div className="ts-add-form">
              <h3 className="ts-form-section-title">Add New Project</h3>
              <div className="ts-form-group">
                <label className="ts-form-label">Project Title *</label>
                <input className="ts-form-input" placeholder="e.g. Project Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </div>

              <div className="ts-form-group">
                <label className="ts-form-label">Introduction (Overview)</label>
                <textarea className="ts-form-input ts-form-textarea ts-form-textarea--large" placeholder="Comprehensive overview and summary of what the project does..." value={formIntroduction} onChange={e => setFormIntroduction(e.target.value)} rows={5} />
              </div>

              <div className="ts-form-group">
                <label className="ts-form-label">Background</label>
                <textarea className="ts-form-input ts-form-textarea ts-form-textarea--large" placeholder="Detailed background story, motivation, problems faced, and why you built it..." value={formBackground} onChange={e => setFormBackground(e.target.value)} rows={6} />
              </div>

              <div className="ts-form-row">
                <div className="ts-form-group">
                  <label className="ts-form-label">Dataset Title</label>
                  <input className="ts-form-input" placeholder="e.g. Kaggle Dataset Name" value={formDatasetTitle} onChange={e => setFormDatasetTitle(e.target.value)} />
                </div>
                <div className="ts-form-group">
                  <label className="ts-form-label">Dataset URL</label>
                  <input className="ts-form-input" placeholder="https://..." value={formDatasetUrl} onChange={e => setFormDatasetUrl(e.target.value)} />
                </div>
              </div>

              <div className="ts-form-group">
                <label className="ts-form-label">Technologies</label>
                <ToolsSelector selectedToolIds={formTools} onToolsChange={setFormTools} />
              </div>

              <div className="ts-form-group">
                <label className="ts-form-label">My Role (comma-separated tasks or roles)</label>
                <textarea className="ts-form-input ts-form-textarea" placeholder="API development, UI design, Database modeling, Performance tuning" value={formMyRole} onChange={e => setFormMyRole(e.target.value)} rows={3} />
              </div>

              <div className="ts-form-row">
                <div className="ts-form-group">
                  <label className="ts-form-label">Live / Project URL</label>
                  <input className="ts-form-input" placeholder="https://..." value={formUrl} onChange={e => setFormUrl(e.target.value)} />
                </div>
                <div className="ts-form-group">
                  <label className="ts-form-label">GitHub Repository URL</label>
                  <input className="ts-form-input" placeholder="https://github.com/..." value={formGithub} onChange={e => setFormGithub(e.target.value)} />
                </div>
              </div>

              <div className="ts-edit-actions">
                <button type="button" className={`ts-btn-change-image ${formFile ? 'is-selected' : ''}`} onClick={() => imgRef.current.click()}>
                  {formFile ? '✓ Image selected' : 'Choose Image'}
                </button>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFormFile(e.target.files[0])} />
                <button type="button" className="ts-btn-save" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'SAVE PROJECT'}</button>
                <button type="button" className="ts-btn-cancel" onClick={resetForm}>CANCEL</button>
              </div>
            </div>
            {saveMsg && <span className="admin-save-msg">{saveMsg}</span>}
          </div>
        )}

        {/* Vertical Project List */}
        <div className="ts-vl-list">
          {projectsLoading && (
            <p className="ts-empty"><TerminalSpinner label="loading..." /></p>
          )}
          {!projectsLoading && projects.length === 0 && !isAdmin && (
            <p className="ts-empty">No projects yet.</p>
          )}
          {projects.map((project) => {
            const isExpanded = expandedId === project._id;
            const isEditing = editingId === project._id;
            return (
              <div 
                key={project._id} 
                className={`ts-vl-card ${isExpanded ? 'ts-vl-card--expanded' : ''}`}
                ref={el => projectRefs.current[project._id] = el}
              >
                {/* Collapsed Row — always visible */}
                <div className="ts-vl-card-header" onClick={() => toggleExpand(project)}>
                  <div className="ts-vl-card-top">
                    <div className="ts-vl-card-thumb">
                      {project.image?.url
                        ? <img src={project.image.url} alt={project.title} className="ts-vl-thumb-img" />
                        : <div className="ts-vl-thumb-placeholder" />}
                    </div>
                    <div className="ts-vl-card-headline">
                      <h3 className="ts-vl-card-title">{project.title}</h3>
                    </div>
                    <div className="ts-vl-card-links">
                      {project.url && project.url.trim() !== '' && (
                        <a href={formatUrl(project.url)} target="_blank" rel="noopener noreferrer" className="ts-vl-link-btn" onClick={e => e.stopPropagation()}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ts-vl-btn-icon">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          URL
                        </a>
                      )}
                      {project.githubUrl && project.githubUrl.trim() !== '' && (
                        <a href={formatUrl(project.githubUrl)} target="_blank" rel="noopener noreferrer" className="ts-vl-link-btn" onClick={e => e.stopPropagation()}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="ts-vl-gh-icon"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                          GitHub
                        </a>
                      )}
                    </div>
                    <button className={`ts-vl-expand-btn ${isExpanded ? 'ts-vl-expand-btn--open' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  {project.introduction && (
                    <div className="ts-vl-card-overview">
                      <span className="ts-desc-label">Overview:</span>
                      <p className="ts-vl-card-intro">{project.introduction}</p>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="ts-vl-card-body">
                    {isEditing ? (
                      <div className="ts-edit-form">
                        <div className="ts-form-group">
                          <label className="ts-form-label">Project Title *</label>
                          <input className="ts-form-input ts-edit-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="e.g. Project Title" />
                        </div>

                        <div className="ts-form-group">
                          <label className="ts-form-label">Introduction (Overview)</label>
                          <textarea className="ts-form-input ts-form-textarea ts-form-textarea--large" value={editIntroduction} onChange={e => setEditIntroduction(e.target.value)} placeholder="Comprehensive overview and summary of what the project does..." rows={5} />
                        </div>

                        <div className="ts-form-group">
                          <label className="ts-form-label">Background</label>
                          <textarea className="ts-form-input ts-form-textarea ts-form-textarea--large" value={editBackground} onChange={e => setEditBackground(e.target.value)} placeholder="Detailed background story, motivation, problems faced, and why you built it..." rows={6} />
                        </div>

                        <div className="ts-form-row">
                          <div className="ts-form-group">
                            <label className="ts-form-label">Dataset Title</label>
                            <input className="ts-form-input" value={editDatasetTitle} onChange={e => setEditDatasetTitle(e.target.value)} placeholder="e.g. Kaggle Dataset Name" />
                          </div>
                          <div className="ts-form-group">
                            <label className="ts-form-label">Dataset URL</label>
                            <input className="ts-form-input" value={editDatasetUrl} onChange={e => setEditDatasetUrl(e.target.value)} placeholder="https://..." />
                          </div>
                        </div>

                        <div className="ts-form-group">
                          <label className="ts-form-label">Technologies</label>
                          <ToolsSelector selectedToolIds={editTools} onToolsChange={setEditTools} />
                        </div>

                        <div className="ts-form-group">
                          <label className="ts-form-label">My Role (comma-separated tasks or roles)</label>
                          <textarea className="ts-form-input ts-form-textarea" value={editMyRole} onChange={e => setEditMyRole(e.target.value)} placeholder="API development, UI design, Database modeling, Performance tuning" rows={3} />
                        </div>

                        <div className="ts-form-row">
                          <div className="ts-form-group">
                            <label className="ts-form-label">Live / Project URL</label>
                            <input className="ts-form-input" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://..." />
                          </div>
                          <div className="ts-form-group">
                            <label className="ts-form-label">GitHub Repository URL</label>
                            <input className="ts-form-input" value={editGithub} onChange={e => setEditGithub(e.target.value)} placeholder="https://github.com/..." />
                          </div>
                        </div>

                        <div className="ts-edit-actions">
                          <button type="button" className={`ts-btn-change-image ${editFile ? 'is-selected' : ''}`} onClick={() => editImgRef.current.click()}>
                            {editFile ? '✓ Image selected' : 'Change Image'}
                          </button>
                          <input ref={editImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setEditFile(e.target.files[0])} />
                          <button type="button" className="ts-btn-save" onClick={() => handleUpdate(project._id)} disabled={saving}>
                            {saving ? 'Saving…' : 'SAVE CHANGES'}
                          </button>
                          <button type="button" className="ts-btn-cancel" onClick={cancelEdit}>CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="ts-vl-detail-content">
                          {project.background && (
                            <div className="ts-vl-desc-block">
                              <span className="ts-desc-label">Background:</span>
                              <p className="ts-vl-desc">{project.background}</p>
                            </div>
                          )}
                            {(project.datasetTitle || project.datasetUrl) && (
                              <div className="ts-vl-desc-block">
                                <span className="ts-desc-label">Dataset:</span>
                                {project.datasetTitle && <p className="ts-vl-desc"><strong>Title:</strong> {project.datasetTitle}</p>}
                                {project.datasetUrl && (
                                  <p className="ts-vl-desc">
                                    <strong>URL:</strong>{' '}
                                    <a href={formatUrl(project.datasetUrl)} target="_blank" rel="noopener noreferrer" className="ts-project-link">{project.datasetUrl}</a>
                                  </p>
                                )}
                              </div>
                            )}
                            {project.tools && project.tools.length > 0 && (
                              <div className="ts-vl-desc-block">
                                <span className="ts-desc-label">Technologies:</span>
                                {renderCategorizedTechnologies(project.tools)}
                              </div>
                            )}
                            {project.myRole && (
                              <div className="ts-vl-desc-block">
                                <span className="ts-desc-label">My Role:</span>
                                <ul className="ts-role-list">
                                  {project.myRole.split(',').map((item, idx) => (
                                    <li key={idx}>{item.trim()}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                        {isAdmin && (
                          <div className="ts-vl-admin-actions">
                            <button className="ts-btn-edit" onClick={() => startEdit(project)} disabled={saving} title="Edit project">EDIT</button>
                            <button className="ts-btn-delete" onClick={() => handleDelete(project._id)} disabled={saving} title="Remove project">DELETE</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Admin Tools Manager - Below Projects */}
      {isAdmin && <ToolsManager />}
    </div>
  );
};

export default TechSpace;
