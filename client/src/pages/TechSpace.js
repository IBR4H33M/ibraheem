import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import TerminalSpinner from '../components/TerminalSpinner';
import ToolsSelector from '../components/ToolsSelector';
import ToolsManager from './ToolsManager';
import './TechSpace.css';

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
  const [formTechStack, setFormTechStack] = useState('');
  const [formMyRole, setFormMyRole] = useState('');
  const [formUrl, setFormUrl]       = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formCustomBtnText, setFormCustomBtnText] = useState('');
  const [formCustomBtnUrl, setFormCustomBtnUrl] = useState('');
  const [formFile, setFormFile]     = useState(null);
  const [formTools, setFormTools]   = useState([]);
  const [editTitle, setEditTitle]   = useState('');
  const [editIntroduction, setEditIntroduction] = useState('');
  const [editBackground, setEditBackground] = useState('');
  const [editDatasetTitle, setEditDatasetTitle] = useState('');
  const [editDatasetUrl, setEditDatasetUrl] = useState('');
  const [editTechStack, setEditTechStack] = useState('');
  const [editMyRole, setEditMyRole] = useState('');
  const [editUrl, setEditUrl]       = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editCustomBtnText, setEditCustomBtnText] = useState('');
  const [editCustomBtnUrl, setEditCustomBtnUrl] = useState('');
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
    setFormTitle(''); setFormIntroduction(''); setFormBackground(''); setFormDatasetTitle(''); setFormDatasetUrl(''); setFormTechStack(''); setFormMyRole('');
    setFormUrl(''); setFormGithub('');
    setFormCustomBtnText(''); setFormCustomBtnUrl(''); setFormFile(null); setFormTools([]);
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
      form.append('techStack', formTechStack.trim());
      form.append('tools', JSON.stringify(formTools));
      form.append('myRole', formMyRole.trim());
      form.append('url', formUrl.trim());
      form.append('githubUrl', formGithub.trim());
      form.append('customButtonText', formCustomBtnText.trim());
      form.append('customButtonUrl', formCustomBtnUrl.trim());
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
    setEditTechStack(project.techStack || '');
    setEditTools(project.tools?.map(t => t._id || t) || []);
    setEditMyRole(project.myRole || '');
    setEditUrl(project.url || '');
    setEditGithub(project.githubUrl || '');
    setEditCustomBtnText(project.customButtonText || '');
    setEditCustomBtnUrl(project.customButtonUrl || '');
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
    setEditTechStack('');
    setEditTools([]);
    setEditMyRole('');
    setEditUrl('');
    setEditGithub('');
    setEditCustomBtnText('');
    setEditCustomBtnUrl('');
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
      form.append('techStack', editTechStack.trim());
      form.append('tools', JSON.stringify(editTools));
      form.append('myRole', editMyRole.trim());
      form.append('url', editUrl.trim());
      form.append('githubUrl', editGithub.trim());
      form.append('customButtonText', editCustomBtnText.trim());
      form.append('customButtonUrl', editCustomBtnUrl.trim());
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

  const renderTechStackParsed = (raw) => {
    if (!raw) return null;
    const text = String(raw).trim();
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) {
        const keywords = m[2].split(',').map(k => k.trim()).filter(Boolean);
        return (
          <div key={idx} className="ts-vl-tech-row">
            <span className="ts-vl-tech-cat">{m[1]}:</span>
            <div className="ts-vl-tech-tags">
              {keywords.map((kw, kwIdx) => (
                <span className="ts-vl-tech-tag" key={kwIdx}>{kw}</span>
              ))}
            </div>
          </div>
        );
      }
      return <p key={idx} className="ts-vl-tech-line">{line}</p>;
    });
  };

  return (
    <div className="ts-page">
      <h1 className="ts-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>TECH SPACE</h1>

      <section className="ts-projects-outer">
        <div className="ts-projects-header">
          <h2 className="ts-projects-heading">ALL PROJECTS</h2>
          {isAdmin && (
            <button 
              className="admin-edit-btn ts-add-btn" 
              onClick={() => setAdding(!adding)} 
              title="Add new project"
            >
              + ADD NEW PROJECT
            </button>
          )}
        </div>

        {/* Admin Add Form */}
        {isAdmin && adding && (
          <div className="ts-admin-add-form-section">
            <div className="ts-add-form">
              <input className="ts-add-input" placeholder="Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              <textarea className="ts-add-input ts-textarea" placeholder="Introduction" value={formIntroduction} onChange={e => setFormIntroduction(e.target.value)} rows={2} />
              <textarea className="ts-add-input ts-textarea" placeholder="Background" value={formBackground} onChange={e => setFormBackground(e.target.value)} rows={2} />
              <input className="ts-add-input" placeholder="Dataset Title" value={formDatasetTitle} onChange={e => setFormDatasetTitle(e.target.value)} />
              <input className="ts-add-input" placeholder="Dataset URL" value={formDatasetUrl} onChange={e => setFormDatasetUrl(e.target.value)} />
              <textarea className="ts-add-input ts-textarea" placeholder="Tech Stack (one category per line, e.g. Language: Python)" value={formTechStack} onChange={e => setFormTechStack(e.target.value)} rows={3} />
              <ToolsSelector selectedToolIds={formTools} onToolsChange={setFormTools} />
              <textarea className="ts-add-input ts-textarea" placeholder="My Role" value={formMyRole} onChange={e => setFormMyRole(e.target.value)} rows={2} />
              <input className="ts-add-input" placeholder="Live URL" value={formUrl} onChange={e => setFormUrl(e.target.value)} />
              <input className="ts-add-input" placeholder="GitHub URL" value={formGithub} onChange={e => setFormGithub(e.target.value)} />
              <input className="ts-add-input" placeholder="Custom Button Text" value={formCustomBtnText} onChange={e => setFormCustomBtnText(e.target.value)} />
              <input className="ts-add-input" placeholder="Custom Button URL" value={formCustomBtnUrl} onChange={e => setFormCustomBtnUrl(e.target.value)} />
              <button className="admin-edit-btn" onClick={() => imgRef.current.click()}>
                {formFile ? '✓ Image selected' : 'Choose Image'}
              </button>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFormFile(e.target.files[0])} />
              <button className="admin-save-btn" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'SAVE'}</button>
              <button className="admin-cancel-btn" onClick={resetForm}>CANCEL</button>
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
                  <div className="ts-vl-card-thumb">
                    {project.image?.url
                      ? <img src={project.image.url} alt={project.title} className="ts-vl-thumb-img" />
                      : <div className="ts-vl-thumb-placeholder" />}
                  </div>
                  <div className="ts-vl-card-info">
                    <h3 className="ts-vl-card-title">{project.title}</h3>
                    {project.introduction && !isExpanded && (
                      <p className="ts-vl-card-intro">{project.introduction.length > 120 ? project.introduction.substring(0, 120) + '…' : project.introduction}</p>
                    )}
                  </div>
                  <div className="ts-vl-card-links">
                    {project.url && project.url.trim() !== '' && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="ts-vl-link-btn" onClick={e => e.stopPropagation()}>
                        Try it out
                      </a>
                    )}
                    {project.githubUrl && project.githubUrl.trim() !== '' && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ts-vl-link-btn" onClick={e => e.stopPropagation()}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="ts-vl-gh-icon"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        GitHub
                      </a>
                    )}
                    {project.customButtonText && project.customButtonUrl && project.customButtonUrl.trim() !== '' && 
                     !(project.url && (project.url.trim() === project.customButtonUrl.trim() || project.url.includes(project.customButtonUrl.trim()) || project.customButtonUrl.includes(project.url.trim()))) && (
                      <a href={project.customButtonUrl} target="_blank" rel="noopener noreferrer" className="ts-vl-link-btn" onClick={e => e.stopPropagation()}>
                        {project.customButtonText}
                      </a>
                    )}
                  </div>
                  <button className={`ts-vl-expand-btn ${isExpanded ? 'ts-vl-expand-btn--open' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="ts-vl-card-body">
                    {isEditing ? (
                      <div className="ts-edit-form">
                        <input className="ts-add-input ts-edit-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
                        <textarea className="ts-add-input ts-textarea" value={editIntroduction} onChange={e => setEditIntroduction(e.target.value)} placeholder="Introduction" rows={2} />
                        <textarea className="ts-add-input ts-textarea" value={editBackground} onChange={e => setEditBackground(e.target.value)} placeholder="Background" rows={2} />
                        <input className="ts-add-input" value={editDatasetTitle} onChange={e => setEditDatasetTitle(e.target.value)} placeholder="Dataset Title" />
                        <input className="ts-add-input" value={editDatasetUrl} onChange={e => setEditDatasetUrl(e.target.value)} placeholder="Dataset URL" />
                        <textarea className="ts-add-input ts-textarea" value={editTechStack} onChange={e => setEditTechStack(e.target.value)} placeholder="Tech Stack" rows={3} />
                        <ToolsSelector selectedToolIds={editTools} onToolsChange={setEditTools} />
                        <textarea className="ts-add-input ts-textarea" value={editMyRole} onChange={e => setEditMyRole(e.target.value)} placeholder="My Role" rows={2} />
                        <input className="ts-add-input" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="Live URL" />
                        <input className="ts-add-input" value={editGithub} onChange={e => setEditGithub(e.target.value)} placeholder="GitHub URL" />
                        <input className="ts-add-input" value={editCustomBtnText} onChange={e => setEditCustomBtnText(e.target.value)} placeholder="Custom Button Text" />
                        <input className="ts-add-input" value={editCustomBtnUrl} onChange={e => setEditCustomBtnUrl(e.target.value)} placeholder="Custom Button URL" />
                        <div className="ts-edit-actions">
                          <button className="admin-edit-btn" onClick={() => editImgRef.current.click()}>
                            {editFile ? '✓ Image selected' : 'Change Image'}
                          </button>
                          <input ref={editImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setEditFile(e.target.files[0])} />
                          <button className="admin-save-btn" onClick={() => handleUpdate(project._id)} disabled={saving}>
                            {saving ? 'Saving…' : 'SAVE'}
                          </button>
                          <button className="admin-cancel-btn" onClick={cancelEdit}>CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="ts-vl-detail-content">
                          <div className="ts-vl-detail-left">
                            <div className="ts-vl-detail-img-wrap">
                              {project.image?.url
                                ? <img src={project.image.url} alt={project.title} className="ts-vl-detail-img" />
                                : <div className="ts-vl-detail-img-placeholder" />}
                            </div>
                            <div className="ts-vl-detail-links">
                              {project.url && project.url.trim() !== '' && (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="ts-vl-detail-link">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ts-link-icon">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                  <span>{project.url}</span>
                                </a>
                              )}
                              {project.githubUrl && project.githubUrl.trim() !== '' && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ts-vl-detail-link">
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="ts-link-icon"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                                  <span>{project.githubUrl}</span>
                                </a>
                              )}
                              {project.customButtonText && project.customButtonUrl && 
                               !(project.url && (project.url.trim() === project.customButtonUrl.trim() || project.url.includes(project.customButtonUrl.trim()) || project.customButtonUrl.includes(project.url.trim()))) && (
                                <a href={project.customButtonUrl} target="_blank" rel="noopener noreferrer" className="ts-vl-detail-link ts-custom-btn">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ts-link-icon">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                  <span>{project.customButtonText}</span>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="ts-vl-detail-right">
                            {project.introduction && (
                              <p className="ts-vl-desc">{project.introduction}</p>
                            )}
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
                                    <a href={project.datasetUrl} target="_blank" rel="noopener noreferrer" className="ts-project-link">{project.datasetUrl}</a>
                                  </p>
                                )}
                              </div>
                            )}
                            {project.techStack && (
                              <div className="ts-vl-desc-block">
                                <span className="ts-desc-label">Tech Stack:</span>
                                <div className="ts-vl-tech-stack">
                                  {renderTechStackParsed(project.techStack)}
                                </div>
                              </div>
                            )}
                            {project.tools && project.tools.length > 0 && (
                              <div className="ts-vl-desc-block">
                                <span className="ts-desc-label">Tools & Services:</span>
                                <div className="ts-tools-grid">
                                  {project.tools.map((tool) => (
                                    <div key={tool._id} className="ts-tool-card">
                                      <div className="ts-tool-logo-canvas">
                                        {tool.logo?.url ? (
                                          <img src={tool.logo.url} alt={tool.name} className="ts-tool-logo" title={tool.name} />
                                        ) : (
                                          <div className="ts-tool-logo-placeholder" title={tool.name}>{tool.name.charAt(0)}</div>
                                        )}
                                      </div>
                                      <span className="ts-tool-name">{tool.name}</span>
                                    </div>
                                  ))}
                                </div>
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
                        </div>
                        {isAdmin && (
                          <div className="ts-vl-admin-actions">
                            <button className="admin-edit-btn" onClick={() => startEdit(project)} disabled={saving} title="Edit project">EDIT</button>
                            <button className="ts-delete-btn" onClick={() => handleDelete(project._id)} disabled={saving} title="Remove project">DELETE</button>
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
