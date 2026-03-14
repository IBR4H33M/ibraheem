import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './TechSpace.css';

const TechSpace = () => {
  const [projects, setProjects]     = useState([]);
  const [adding, setAdding]         = useState(false);
  const [editingId, setEditingId]   = useState('');
  const [formTitle, setFormTitle]   = useState('');
  const [formDesc, setFormDesc]     = useState('');
  const [formUrl, setFormUrl]       = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formFile, setFormFile]     = useState(null);
  const [editTitle, setEditTitle]   = useState('');
  const [editDesc, setEditDesc]     = useState('');
  const [editUrl, setEditUrl]       = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editFile, setEditFile]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const imgRef                      = useRef(null);
  const editImgRef                  = useRef(null);
  const { isAdmin, token }          = useAuth();
  const titleVisible                = useScrollTitle();

  useEffect(() => {
    axios.get('/api/projects')
      .then(({ data }) => { if (data.length) setProjects(data); })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setAdding(false);
    setFormTitle(''); setFormDesc(''); setFormUrl(''); setFormGithub(''); setFormFile(null);
    setSaveMsg('');
  };

  const handleAdd = async () => {
    if (!formTitle.trim()) { setSaveMsg('Enter a project title.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const form = new FormData();
      form.append('title',       formTitle.trim());
      form.append('description', formDesc.trim());
      form.append('url',         formUrl.trim());
      form.append('githubUrl',   formGithub.trim());
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
    setSaving(true); setSaveMsg('');
    try {
      await axios.delete(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch { setSaveMsg('Failed to remove.'); }
    finally { setSaving(false); }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditTitle(project.title || '');
    setEditDesc(project.description || '');
    setEditUrl(project.url || '');
    setEditGithub(project.githubUrl || '');
    setEditFile(null);
    setSaveMsg('');
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditTitle('');
    setEditDesc('');
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
      form.append('description', editDesc.trim());
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

  const renderProjectDescription = (text = '') => {
    const lines = String(text)
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return <p className="ts-project-desc">No description provided.</p>;
    }

    return lines.map((line, i) => {
      const match = line.match(/^([^:]{2,40}):\s*(.*)$/);
      if (!match) return <p key={i} className="ts-project-desc">{line}</p>;

      const label = match[1].trim();
      const value = match[2].trim();
      return (
        <p key={i} className="ts-project-desc">
          <span className="ts-desc-label">{label}:</span>{value ? ` ${value}` : ''}
        </p>
      );
    });
  };

  return (
    <div className="ts-page">
      <h1 className="ts-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>TECH SPACE</h1>

      <section className="ts-projects-outer">
        <h2 className="ts-projects-heading">PROJECTS</h2>
        <div className="ts-projects-list">
          {projects.map(project => (
            <div key={project._id} className="ts-project-card">
              {isAdmin && (
                <div className="ts-card-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => startEdit(project)}
                    disabled={saving}
                    title="Edit project"
                  >EDIT</button>
                  <button
                    className="ts-delete-btn"
                    onClick={() => handleDelete(project._id)}
                    disabled={saving}
                    title="Remove project"
                  >✕</button>
                </div>
              )}
              <div className="ts-project-left">
                <div className="ts-project-img-wrap">
                  {project.image?.url
                    ? <img src={project.image.url} alt={project.title} className="ts-project-img" />
                    : <div className="ts-project-img-placeholder" />}
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="ts-project-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ts-link-icon">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span className="ts-link-text">{project.url}</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ts-project-link">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ts-link-icon">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="ts-link-text">{project.githubUrl}</span>
                  </a>
                )}
              </div>
              <div className="ts-project-right">
                {editingId === project._id ? (
                  <div className="ts-edit-form">
                    <input
                      className="ts-add-input ts-edit-title"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <textarea
                      className="ts-add-input ts-textarea"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Short description"
                      rows={3}
                    />
                    <input
                      className="ts-add-input"
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                      placeholder="Live URL"
                    />
                    <input
                      className="ts-add-input"
                      value={editGithub}
                      onChange={e => setEditGithub(e.target.value)}
                      placeholder="GitHub URL"
                    />
                    <div className="ts-edit-actions">
                      <button className="admin-edit-btn" onClick={() => editImgRef.current.click()}>
                        {editFile ? '✓ Image selected' : 'Change Image'}
                      </button>
                      <input
                        ref={editImgRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => setEditFile(e.target.files[0])}
                      />
                      <button className="admin-save-btn" onClick={() => handleUpdate(project._id)} disabled={saving}>
                        {saving ? 'Saving…' : 'SAVE'}
                      </button>
                      <button className="admin-cancel-btn" onClick={cancelEdit}>CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="ts-project-title">{project.title}</h3>
                    <div className="ts-project-desc-block">
                      {renderProjectDescription(project.description)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {projects.length === 0 && !isAdmin && (
            <p className="ts-empty">No projects yet.</p>
          )}
        </div>
      </section>

      {isAdmin && (
        <div className="ts-admin-bar">
          {!adding ? (
            <button className="admin-edit-btn" onClick={() => setAdding(true)}>+ ADD PROJECT</button>
          ) : (
            <div className="ts-add-form">
              <input className="ts-add-input" placeholder="Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              <input className="ts-add-input" placeholder="Live URL" value={formUrl} onChange={e => setFormUrl(e.target.value)} />
              <input className="ts-add-input" placeholder="GitHub URL" value={formGithub} onChange={e => setFormGithub(e.target.value)} />
              <textarea className="ts-add-input ts-textarea" placeholder="Short description (use lines like: Background: ..., Tech Stack: ...)" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} />
              <button className="admin-edit-btn" onClick={() => imgRef.current.click()}>
                {formFile ? '✓ Image selected' : 'Choose Image'}
              </button>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFormFile(e.target.files[0])} />
              <button className="admin-save-btn" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'SAVE'}</button>
              <button className="admin-cancel-btn" onClick={resetForm}>CANCEL</button>
            </div>
          )}
          {saveMsg && <span className="admin-save-msg">{saveMsg}</span>}
        </div>
      )}
    </div>
  );
};

export default TechSpace;
