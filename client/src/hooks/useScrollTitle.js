import { useState, useEffect } from 'react';

const useScrollTitle = (threshold = 80) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return visible;
};

export default useScrollTitle;
