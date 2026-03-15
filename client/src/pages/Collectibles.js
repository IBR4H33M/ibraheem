
import React, { useRef } from 'react';
import useScrollTitle from '../hooks/useScrollTitle';
import './Collectibles.css';

const Collectibles = () => {
  const titleVisible = useScrollTitle();
  return (
    <div className="collectibles-page">
      <h1 className="collectibles-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>COLLECTIBLES</h1>
    </div>
  );
};

export default Collectibles;
