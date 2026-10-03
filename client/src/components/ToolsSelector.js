import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToolsSelector.css';

const ToolsSelector = ({ selectedToolIds = [], onToolsChange }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/tools');
      setTools(data);
    } catch (err) {
      console.error('Failed to load tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToolToggle = (toolId) => {
    const updatedIds = selectedToolIds.includes(toolId)
      ? selectedToolIds.filter(id => id !== toolId)
      : [...selectedToolIds, toolId];
    onToolsChange(updatedIds);
  };

  const getToolsByCategory = (category) => {
    return tools.filter(tool => tool.category === category);
  };

  const filteredCategories = categories.filter(category => {
    const categoryTools = getToolsByCategory(category);
    if (categoryTools.length === 0) return false;
    if (!searchQuery) return true;
    return categoryTools.some(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedTools = tools.filter(t => selectedToolIds.includes(t._id));

  if (loading) {
    return <div className="tools-selector-loading">Loading tools...</div>;
  }

  return (
    <div className="tools-selector">
      <div className="tools-selector-header">
        <h3>Select Technologies</h3>
        <input
          type="text"
          placeholder="Search technologies (e.g. React, Python, MongoDB)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="tools-search"
        />
      </div>

      <div className="selected-tools">
        {selectedTools.length > 0 && (
          <>
            <div className="selected-label">Selected ({selectedTools.length})</div>
            <div className="selected-tools-list">
              {selectedTools.map(tool => (
                <div key={tool._id} className="selected-tool-tag">
                  {tool.logo?.url && (
                    <img src={tool.logo.url} alt={tool.name} />
                  )}
                  <span>{tool.name}</span>
                  <button
                    type="button"
                    className="remove-tool"
                    onClick={() => handleToolToggle(tool._id)}
                    title="Remove technology"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="tools-categories">
        {filteredCategories.map(category => {
          const categoryTools = getToolsByCategory(category);

          return (
            <div key={category} className="category-group">
              <div className="category-header">
                <span className="category-name">{category}</span>
                <span className="category-count">{categoryTools.length}</span>
              </div>

              <div className="category-tools">
                {categoryTools.map(tool => (
                  <label key={tool._id} className="tool-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedToolIds.includes(tool._id)}
                      onChange={() => handleToolToggle(tool._id)}
                    />
                    <div className="tool-checkbox-content">
                      {tool.logo?.url && (
                        <img src={tool.logo.url} alt={tool.name} className="tool-mini-logo" />
                      )}
                      <div className="tool-checkbox-text">
                        <span className="tool-name">{tool.name}</span>
                        {tool.description && (
                          <span className="tool-description">{tool.description}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && searchQuery && (
        <div className="no-tools-found">
          <p>No technologies found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default ToolsSelector;
