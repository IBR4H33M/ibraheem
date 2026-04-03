import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './Contact.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const SOCIAL_PLATFORMS = [
  { key: 'facebook',  label: 'Facebook',  Icon: FacebookIcon  },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'twitter',   label: 'X (Twitter)', Icon: XIcon       },
  { key: 'discord',   label: 'Discord',   Icon: DiscordIcon   },
];

const DEFAULT_SETTINGS = {
  contactEmail: 'contact@ibraheemibnanwar.me',
  socialLinks: {
    facebook:  'https://facebook.com/ibraheemibnanwar',
    instagram: 'https://instagram.com/ibraheemibnanwar',
    twitter:   'https://x.com/ibraheemibnanwar',
    discord:   'https://discord.com/users/ibraheemibnanwar',
  },
};

const Contact = () => {
  const [settings, setSettings]   = useState(DEFAULT_SETTINGS);
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [messageForm, setMessageForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageMsg, setMessageMsg] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);
  const [loadingAdminMessages, setLoadingAdminMessages] = useState(false);
  const { isAdmin, token }        = useAuth();
  const titleVisible              = useScrollTitle();

  useEffect(() => {
    axios.get('/api/contact-settings')
      .then(({ data }) => setSettings(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAdmin || !token) {
      setAdminMessages([]);
      return;
    }

    let active = true;
    const loadMessages = async () => {
      setLoadingAdminMessages(true);
      try {
        const { data } = await axios.get('/api/contact-messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setAdminMessages(data || []);
      } catch {
        if (active) setAdminMessages([]);
      } finally {
        if (active) setLoadingAdminMessages(false);
      }
    };

    loadMessages();
    return () => { active = false; };
  }, [isAdmin, token]);

  const startEdit = () => {
    setDraft({
      contactEmail: settings.contactEmail,
      socialLinks: { ...settings.socialLinks },
    });
    setSaveMsg('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const { data } = await axios.put('/api/contact-settings', draft, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(data);
      setEditing(false);
      setSaveMsg('Saved!');
    } catch {
      setSaveMsg('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: messageForm.name.trim(),
      email: messageForm.email.trim(),
      topic: messageForm.topic.trim(),
      message: messageForm.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.topic || !payload.message) {
      setMessageMsg('Please fill in all fields.');
      return;
    }

    setMessageSaving(true);
    setMessageMsg('');
    try {
      const { data } = await axios.post('/api/contact-messages', payload);
      setMessageForm({ name: '', email: '', topic: '', message: '' });
      setMessageMsg('Message sent successfully.');
      if (isAdmin && data) {
        setAdminMessages(prev => [data, ...prev]);
      }
    } catch (err) {
      setMessageMsg(err?.response?.data?.message || 'Could not send message.');
    } finally {
      setMessageSaving(false);
    }
  };

  return (
    <div className="contact-page">
      <h1 className="contact-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>CONTACT IBRAHEEM</h1>

      <div className="contact-outer">
        <div className="contact-wrapper">

          {/* Email Section */}
          <div className="contact-section-label">Email</div>
          <div className="contact-section-box">
            {editing ? (
              <div className="contact-edit-row">
                <label className="contact-edit-label">Email address</label>
                <input
                  className="contact-edit-input"
                  value={draft.contactEmail}
                  onChange={e => setDraft({ ...draft, contactEmail: e.target.value })}
                />
              </div>
            ) : (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="contact-mail-btn"
              >
                Send an email to Ibraheem
              </a>
            )}
          </div>

          {/* Leave a Message Section */}
          <div className="contact-section-label" style={{ marginTop: '2.5rem' }}>Leave a Message</div>
          <div className="contact-section-box contact-message-box">
            <form className="contact-message-form" onSubmit={handleMessageSubmit}>
              <input
                className="contact-message-input"
                placeholder="Name"
                value={messageForm.name}
                onChange={e => setMessageForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="contact-message-input"
                placeholder="Email"
                type="email"
                value={messageForm.email}
                onChange={e => setMessageForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="contact-message-input"
                placeholder="Subject"
                value={messageForm.topic}
                onChange={e => setMessageForm(prev => ({ ...prev, topic: e.target.value }))}
              />
              <textarea
                className="contact-message-textarea"
                placeholder="Message"
                rows={5}
                value={messageForm.message}
                onChange={e => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
              />
              <button className="contact-message-submit" type="submit" disabled={messageSaving}>
                {messageSaving ? 'Sending…' : 'Send Message'}
              </button>
            </form>
            {messageMsg && <div className="contact-message-status">{messageMsg}</div>}

            {isAdmin && (
              <div className="contact-admin-messages">
                <div className="contact-admin-title">Received Messages</div>
                {loadingAdminMessages ? (
                  <div className="contact-admin-empty">Loading messages…</div>
                ) : adminMessages.length === 0 ? (
                  <div className="contact-admin-empty">No messages yet.</div>
                ) : (
                  <div className="contact-admin-list">
                    {adminMessages.map(msg => (
                      <div key={msg._id} className="contact-admin-item">
                        <div className="contact-admin-head">
                          <span className="contact-admin-name">{msg.name}</span>
                          <span className="contact-admin-topic">Subject: {msg.topic}</span>
                        </div>
                        <div className="contact-admin-email">{msg.email}</div>
                        <div className="contact-admin-body">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Section */}
          <div className="contact-section-label" style={{ marginTop: '2.5rem' }}>Connect on Social Media</div>
          <div className="contact-section-box contact-social-box">
            {SOCIAL_PLATFORMS.map(({ key, label, Icon }) => (
              <div key={key} className="social-item">
                {editing ? (
                  <div className="contact-edit-row">
                    <label className="contact-edit-label">{label}</label>
                    <input
                      className="contact-edit-input"
                      value={draft.socialLinks[key] || ''}
                      onChange={e => setDraft({
                        ...draft,
                        socialLinks: { ...draft.socialLinks, [key]: e.target.value }
                      })}
                    />
                  </div>
                ) : (
                  <a
                    href={settings.socialLinks?.[key] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={label}
                  >
                    <Icon />
                    <span className="social-label">{label}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <div className="admin-slide-controls" style={{ marginTop: '1.5rem' }}>
              {editing ? (
                <>
                  <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button className="admin-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="admin-edit-btn" onClick={startEdit}>Edit Contact Info</button>
              )}
              {saveMsg && <span className="admin-save-msg">{saveMsg}</span>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Contact;
