import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './AboutMe.css';

const AboutMe = () => {
  const { isAdmin, token } = useAuth();
  const titleVisible = useScrollTitle();
  const [profileImg, setProfileImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    axios.get('/api/profile')
      .then(({ data }) => { if (data.imageUrl) setProfileImg(data.imageUrl); })
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const form = new FormData();
      form.append('image', selectedFile);
      const { data } = await axios.post('/api/profile', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProfileImg(data.imageUrl);
      setSelectedFile(null);
      setUploadMsg('Saved!');
    } catch {
      setUploadMsg('Failed to save.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    axios.get('/api/profile')
      .then(({ data }) => { if (data.imageUrl) setProfileImg(data.imageUrl); })
      .catch(() => { setProfileImg(null); });
  };

  return (
    <div className="about-page">
      <div className="about-profile-row">
        <div className="about-profile-pic-col">
          <div className="profile-image-container" style={{ cursor: isAdmin ? 'pointer' : 'default', outline: isAdmin && selectedFile ? '2px solid #90ee90' : isAdmin ? '2px dashed #90ee90' : 'none' }} onClick={() => isAdmin && fileInputRef.current.click()}>
            {profileImg
              ? <img src={profileImg} alt="Profile" />
              : <div className="profile-placeholder"><span>Profile</span></div>}
            {isAdmin && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {uploading && <div className="profile-upload-msg">Uploading…</div>}
                {uploadMsg && <div className="profile-upload-msg">{uploadMsg}</div>}
                {!selectedFile && <div className="profile-upload-overlay">Click to upload</div>}
              </>
            )}
          </div>
          {isAdmin && selectedFile && (
            <div className="profile-action-buttons">
              <button className="profile-save-btn" onClick={handleSave} disabled={uploading}>
                {uploading ? 'Saving…' : 'SAVE'}
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={uploading}>
                CANCEL
              </button>
            </div>
          )}
        </div>
        <div className="about-profile-info-col">
          <h1 className="about-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>ABOUT IBRAHEEM</h1>
          <span className="about-greeting-text" style={{ color: '#ffe066' }}>Hi, this is Ibraheem,</span>
          <div className="about-greeting-desc">
            a bounty hunter from Mandalore. When I'm not out hunting people, I dive deep into gaming, or just watch car videos on youtube.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
