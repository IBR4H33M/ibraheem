import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './AboutMe.css';

// Social Media Icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
  </svg>
);

// Social Platforms Configuration
const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'twitter', label: 'X (Twitter)', Icon: XIcon },
  { key: 'discord', label: 'Discord', Icon: DiscordIcon },
];

const DEFAULT_SOCIAL_LINKS = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://x.com',
  discord: 'https://discord.com',
};

const AboutMe = () => {
  const { isAdmin, token } = useAuth();
  const titleVisible = useScrollTitle();
  const [profileImg, setProfileImg] = useState(null);
  const [aboutTitle, setAboutTitle] = useState('Hi, this is Ibraheem,');
  const [aboutDescription, setAboutDescription] = useState("a bounty hunter from Mandalore. When I'm not out hunting people, I dive deep into gaming, or just watch car videos on youtube.");
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);
  const [interests, setInterests] = useState([]);
  const [editingInterests, setEditingInterests] = useState(false);
  const [interestsDraft, setInterestsDraft] = useState('');
  const [interestsSaving, setInterestsSaving] = useState(false);
  const [interestsMsg, setInterestsMsg] = useState('');
  const [editingText, setEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState({ title: '', description: '' });
  const [textSaving, setTextSaving] = useState(false);
  const [textMsg, setTextMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    axios.get('/api/profile')
      .then(({ data }) => {
        if (data.imageUrl) setProfileImg(data.imageUrl);
        if (data.aboutTitle) setAboutTitle(data.aboutTitle);
        if (data.aboutDescription) setAboutDescription(data.aboutDescription);
        if (data.interests) setInterests(data.interests);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get('/api/contact-settings')
      .then(({ data }) => {
        if (data?.socialLinks) {
          setSocialLinks({
            facebook: data.socialLinks.facebook || DEFAULT_SOCIAL_LINKS.facebook,
            instagram: data.socialLinks.instagram || DEFAULT_SOCIAL_LINKS.instagram,
            twitter: data.socialLinks.twitter || DEFAULT_SOCIAL_LINKS.twitter,
            discord: data.socialLinks.discord || DEFAULT_SOCIAL_LINKS.discord,
          });
        }
      })
      .catch(() => {});
  }, []);

  const startTextEdit = () => {
    setTextDraft({ title: aboutTitle, description: aboutDescription });
    setTextMsg('');
    setEditingText(true);
  };

  const cancelTextEdit = () => {
    setEditingText(false);
    setTextDraft({ title: aboutTitle, description: aboutDescription });
    setTextMsg('');
  };

  const saveTextEdit = async () => {
    const nextTitle = textDraft.title.trim();
    const nextDescription = textDraft.description.trim();
    if (!nextTitle || !nextDescription) {
      setTextMsg('Both fields are required.');
      return;
    }

    setTextSaving(true);
    setTextMsg('');
    try {
      const { data } = await axios.put('/api/profile/text', {
        aboutTitle: nextTitle,
        aboutDescription: nextDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAboutTitle(data.aboutTitle);
      setAboutDescription(data.aboutDescription);
      setEditingText(false);
      setTextMsg('Saved!');
    } catch {
      setTextMsg('Failed to save.');
    } finally {
      setTextSaving(false);
    }
  };

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

  const startInterestsEdit = () => {
    setInterestsDraft(interests.join(', '));
    setInterestsMsg('');
    setEditingInterests(true);
  };

  const cancelInterestsEdit = () => {
    setEditingInterests(false);
    setInterestsDraft('');
    setInterestsMsg('');
  };

  const saveInterestsEdit = async () => {
    const parsed = interestsDraft.split(',').map(s => s.trim()).filter(Boolean);
    
    setInterestsSaving(true);
    setInterestsMsg('');
    try {
      const { data } = await axios.put('/api/profile/interests', {
        interests: parsed,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInterests(data.interests || []);
      setEditingInterests(false);
      setInterestsMsg('Saved!');
    } catch {
      setInterestsMsg('Failed to save.');
    } finally {
      setInterestsSaving(false);
    }
  };

  return (
    <div className="about-page" style={{ minHeight: '100vh' }}>
      <h1 className="about-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>ABOUT IBRAHEEM</h1>
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
          {editingText ? (
            <div className="about-text-edit-box">
              <label className="about-edit-label">Title</label>
              <input
                className="about-edit-input"
                value={textDraft.title}
                onChange={e => setTextDraft(prev => ({ ...prev, title: e.target.value }))}
              />
              <label className="about-edit-label">Description</label>
              <textarea
                className="about-edit-textarea"
                rows={4}
                value={textDraft.description}
                onChange={e => setTextDraft(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="about-text-edit-actions">
                <button className="profile-save-btn" onClick={saveTextEdit} disabled={textSaving}>
                  {textSaving ? 'Saving…' : 'SAVE'}
                </button>
                <button className="profile-cancel-btn" onClick={cancelTextEdit} disabled={textSaving}>CANCEL</button>
                {textMsg && <span className="about-text-edit-msg">{textMsg}</span>}
              </div>
            </div>
          ) : (
            <>
              <span className="about-greeting-text" style={{ color: '#b8e986' }}>{aboutTitle}</span>
              <div className="about-greeting-desc">{aboutDescription}</div>
              {isAdmin && (
                <div className="about-text-admin-row">
                  <button className="admin-edit-btn" onClick={startTextEdit}>Edit Text</button>
                  {textMsg && <span className="about-text-edit-msg">{textMsg}</span>}
                </div>
              )}
            </>
          )}
          
          {/* Interests Section */}
          <div className="about-interests-section">
            <h3 className="about-interests-title">My Interests</h3>
            {editingInterests ? (
              <div className="about-interests-edit-box">
                <input
                  className="about-edit-input"
                  placeholder="Enter interests separated by commas"
                  value={interestsDraft}
                  onChange={e => setInterestsDraft(e.target.value)}
                />
                <div className="about-text-edit-actions">
                  <button className="profile-save-btn" onClick={saveInterestsEdit} disabled={interestsSaving}>
                    {interestsSaving ? 'Saving…' : 'SAVE'}
                  </button>
                  <button className="profile-cancel-btn" onClick={cancelInterestsEdit} disabled={interestsSaving}>CANCEL</button>
                  {interestsMsg && <span className="about-text-edit-msg">{interestsMsg}</span>}
                </div>
              </div>
            ) : (
              <>
                <div className="about-interests-list">
                  {interests.length > 0 ? (
                    interests.map((interest, idx) => (
                      <span key={idx} className="interest-tag">{interest}</span>
                    ))
                  ) : (
                    <span className="interest-tag">No interests added yet</span>
                  )}
                </div>
                {isAdmin && (
                  <div className="about-text-admin-row">
                    <button className="admin-edit-btn" onClick={startInterestsEdit}>Edit Interests</button>
                    {interestsMsg && <span className="about-text-edit-msg">{interestsMsg}</span>}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="about-social-section">
            <h3 className="about-social-title">My Social Media Handles</h3>
            <div className="about-social-links">
              {SOCIAL_PLATFORMS.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={label}
                >
                  <Icon />
                  <span className="social-label">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
