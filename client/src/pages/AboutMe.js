
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './AboutMe.css';

const AboutMe = () => {
  const { isAdmin } = useAuth();
  const titleVisible = useScrollTitle();
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    // TODO: Implement upload to server and get URL
    // For now, just preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target.result);
      setUploading(false);
      setUploadMsg('Preview only (not saved)');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="about-page">
      <h1 className="about-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>ABOUT IBRAHEEM</h1>
      <div className="about-profile-row">
        <div className="about-profile-pic-col">
          <div className="profile-image-container" style={{ cursor: isAdmin ? 'pointer' : 'default', outline: isAdmin ? '2px dashed #90ee90' : 'none' }} onClick={() => isAdmin && fileInputRef.current.click()}>
            {profileImg
              ? <img src={profileImg} alt="Profile" />
              : <div className="profile-placeholder"><span>Profile</span></div>}
            {isAdmin && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {uploading && <div className="profile-upload-msg">Uploading…</div>}
                {uploadMsg && <div className="profile-upload-msg">{uploadMsg}</div>}
                <div className="profile-upload-overlay">Click to upload</div>
              </>
            )}
          </div>
        </div>
        <div className="about-profile-greeting">
          <span className="about-greeting-text">Hi, this is ibraheem!</span>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
