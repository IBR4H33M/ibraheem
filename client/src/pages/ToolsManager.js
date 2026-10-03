import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TerminalSpinner from '../components/TerminalSpinner';
import './ToolsManager.css';

const ToolsManager = () => {
  const { isAdmin, token } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingToolId, setEditingToolId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Frontend',
  });
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
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

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/tools');
      setTools(data);
    } catch (err) {
      setErrorMessage('Failed to load technologies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Technology name is required');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      if (logo) {
        data.append('logo', logo);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      let response;
      if (editingToolId) {
        response = await axios.put(`/api/tools/${editingToolId}`, data, config);
        setTools(tools.map(t => t._id === editingToolId ? response.data : t));
        setSuccessMessage('Technology updated successfully');
      } else {
        response = await axios.post('/api/tools', data, config);
        setTools([...tools, response.data]);
        setSuccessMessage('Technology created successfully');
      }

      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save technology';
      setErrorMessage(message);
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: 'Frontend' });
    setLogo(null);
    setEditingToolId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditTool = (tool) => {
    setFormData({
      name: tool.name,
      description: tool.description || '',
      category: tool.category || 'Other',
    });
    setEditingToolId(tool._id);
    setShowForm(true);
    setLogo(null);
    window.scrollTo({ top: document.querySelector('.tools-manager')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Delete this technology?')) return;

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
      };
      await axios.delete(`/api/tools/${toolId}`, config);
      setTools(tools.filter(t => t._id !== toolId));
      setSuccessMessage('Technology deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to delete technology');
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="tools-manager">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be an administrator to manage technologies.</p>
        </div>
      </div>
    );
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = !searchQuery || tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="tools-manager">
      <div className="tools-container">
        {/* Header */}
        <div className="tools-header">
          <div className="tools-header-text">
            <h1>Technologies</h1>
            <p className="tools-subtitle">Manage all frameworks, languages, databases, and tools used across your projects</p>
          </div>
          <button
            className={`add-tool-btn ${showForm ? 'is-active' : ''}`}
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            title={showForm ? 'Cancel' : 'Add new technology'}
          >
            {showForm ? '✕ CANCEL' : '+ ADD TECHNOLOGY'}
          </button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="tool-form-container">
            <h3 className="tool-form-title">{editingToolId ? 'Edit Technology' : 'Add New Technology'}</h3>
            <form onSubmit={handleSubmit} className="tool-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="name">Technology Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, PyTorch"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="description">Short Description (optional)</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend UI library"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="logo">Logo Image</label>
                  <div className="tm-logo-picker">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="tm-btn-choose-img"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {logo ? '✓ New Logo Selected' : 'Choose Logo'}
                    </button>
                    {logo && (
                      <div className="tm-mini-preview">
                        <img src={URL.createObjectURL(logo)} alt="Preview" />
                      </div>
                    )}
                    {editingToolId && !logo && tools.find(t => t._id === editingToolId)?.logo?.url && (
                      <div className="tm-mini-preview">
                        <img src={tools.find(t => t._id === editingToolId).logo.url} alt="Current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingToolId ? 'Update Technology' : 'Create Technology'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toolbar: Search and Filter */}
        <div className="tm-toolbar">
          <div className="tm-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tm-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="tm-search-input"
              placeholder="Search technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tm-cat-filter-wrap">
            <select
              className="tm-cat-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories ({tools.length})</option>
              {categories.map(cat => {
                const count = tools.filter(t => t.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Compact Technologies List */}
        <div className="tools-list">
          {loading ? (
            <div className="loading-container">
              <TerminalSpinner label="loading technologies..." />
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery || selectedCategory !== 'ALL' ? 'No technologies match your search or filter.' : 'No technologies yet. Click "+ ADD TECHNOLOGY" above to add one!'}</p>
            </div>
          ) : (
            <div className="tm-compact-grid">
              {filteredTools.map((tool) => (
                <div key={tool._id} className="tm-compact-card">
                  <div className="tm-card-thumb">
                    {tool.logo?.url ? (
                      <img src={tool.logo.url} alt={tool.name} className="tm-card-logo" />
                    ) : (
                      <div className="tm-card-initial">{tool.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="tm-card-info">
                    <span className="tm-card-name" title={tool.name}>{tool.name}</span>
                    <span className="tm-card-cat">{tool.category || 'Other'}</span>
                  </div>
                  <div className="tm-card-actions">
                    <button
                      type="button"
                      className="tm-action-btn tm-btn-edit"
                      onClick={() => handleEditTool(tool)}
                      title={`Edit ${tool.name}`}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="tm-action-btn tm-btn-delete"
                      onClick={() => handleDeleteTool(tool._id)}
                      title={`Delete ${tool.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsManager;
