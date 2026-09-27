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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
  });
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);
  const [draggedToolId, setDraggedToolId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingTools, setEditingTools] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Frontend',
    'Backend',
    'Database',
    'Storage/Cloud',
    'Authentication',
    'DevOps/Deployment',
    'Tools/Build',
    'Testing',
    'Machine Learning',
    'API/Services',
    'Languages',
    'Frameworks',
    'Other',
  ];

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/tools');
      setTools(data);
      setEditingTools(data);
    } catch (err) {
      setErrorMessage('Failed to load tools');
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
      setErrorMessage('Tool name is required');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
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
      } else {
        response = await axios.post('/api/tools', data, config);
        setTools([...tools, response.data]);
      }

      setSuccessMessage(editingToolId ? 'Tool updated successfully' : 'Tool created successfully');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save tool';
      setErrorMessage(message);
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: 'Other' });
    setLogo(null);
    setEditingToolId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditTool = (tool) => {
    setFormData({
      name: tool.name,
      description: tool.description,
      category: tool.category,
    });
    setEditingToolId(tool._id);
    setShowForm(true);
    setLogo(null);
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
      };
      await axios.delete(`/api/tools/${toolId}`, config);
      setTools(tools.filter(t => t._id !== toolId));
      setSuccessMessage('Tool deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to delete tool');
      console.error(err);
    }
  };

  const handleRemoveFromList = (toolId) => {
    setEditingTools(prev => prev.filter(t => t._id !== toolId));
  };

  const handleReorderStart = (toolId) => {
    setDraggedToolId(toolId);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleReorderDrop = (targetIndex) => {
    if (!draggedToolId) return;

    const currentIndex = editingTools.findIndex(t => t._id === draggedToolId);
    if (currentIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }

    const newTools = [...editingTools];
    const [draggedTool] = newTools.splice(currentIndex, 1);
    newTools.splice(targetIndex, 0, draggedTool);
    setEditingTools(newTools);
    setDragOverIndex(null);
  };

  if (!isAdmin) {
    return (
      <div className="tools-manager">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be logged in as an admin to manage tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tools-manager">
      <div className="tools-container">
        <div className="tools-header">
          <h1>Universal Tools Manager</h1>
          <button 
            className="add-tool-btn"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Tool'}
          </button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {showForm && (
          <div className="tool-form-container">
            <form onSubmit={handleSubmit} className="tool-form">
              <div className="form-group">
                <label htmlFor="name">Tool Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Node.js"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the tool"
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

              <div className="form-group">
                <label htmlFor="logo">Logo Image</label>
                <div className="logo-upload">
                  {editingToolId && tools.find(t => t._id === editingToolId)?.logo?.url && !logo && (
                    <div className="current-logo">
                      <img 
                        src={tools.find(t => t._id === editingToolId).logo.url} 
                        alt="Current logo"
                      />
                      <p>Current logo</p>
                    </div>
                  )}
                  {logo && (
                    <div className="logo-preview">
                      <img 
                        src={URL.createObjectURL(logo)} 
                        alt="Logo preview"
                      />
                      <p>New logo preview</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo" className="file-input-label">
                    Choose Image
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingToolId ? 'Update Tool' : 'Create Tool'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="tools-list">
          {loading ? (
            <div className="loading-container">
              <TerminalSpinner label="loading tools..." />
            </div>
          ) : tools.length === 0 ? (
            <div className="empty-state">
              <p>No tools yet. Create your first tool to get started!</p>
            </div>
          ) : (
            <>
              <h2>Available Tools</h2>
              <div className="tools-grid">
                {tools.map((tool, index) => (
                  <div key={tool._id} className="tool-card">
                    <div className="tool-logo-wrapper">
                      {tool.logo?.url ? (
                        <img src={tool.logo.url} alt={tool.name} className="tool-logo" />
                      ) : (
                        <div className="tool-logo-placeholder">No Logo</div>
                      )}
                    </div>
                    <div className="tool-info">
                      <h3>{tool.name}</h3>
                      {tool.description && <p>{tool.description}</p>}
                      <span className="tool-category">{tool.category}</span>
                    </div>
                    <div className="tool-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditTool(tool)}
                        title="Edit tool"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteTool(tool._id)}
                        title="Delete tool"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsManager;
