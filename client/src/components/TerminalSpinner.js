import React, { useState, useEffect } from 'react';
import './TerminalSpinner.css';

const FRAMES = ['\\', '—', '/', '|'];

const TerminalSpinner = ({ label = '' }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length);
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="terminal-spinner" aria-label="Loading">
      <span className="terminal-spinner-char">{FRAMES[frame]}</span>
      {label && <span className="terminal-spinner-label">{label}</span>}
    </span>
  );
};

export default TerminalSpinner;
