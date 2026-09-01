import { useState, useEffect } from 'react';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Disable scrolling on body while preloader is active
    document.body.style.overflow = 'hidden';

    let isLoaderRemoved = false;
    let transitionTimer: any = null;
    let fadeTimer: any = null;

    const removeLoader = () => {
      if (isLoaderRemoved) return;
      isLoaderRemoved = true;

      // Wait 300ms after load complete
      transitionTimer = setTimeout(() => {
        setIsFading(true);

        // Hide and remove the loader after fadeout completes (500ms duration)
        fadeTimer = setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = '';
        }, 500);
      }, 300);
    };

    if (document.readyState === 'complete') {
      removeLoader();
    } else {
      window.addEventListener('load', removeLoader);
    }

    // Fail-safe fallback timer (2 seconds max)
    const fallbackTimer = setTimeout(() => {
      removeLoader();
    }, 2000);

    return () => {
      window.removeEventListener('load', removeLoader);
      clearTimeout(transitionTimer);
      clearTimeout(fadeTimer);
      clearTimeout(fallbackTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`preloader-overlay ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="loader">
        <div className="loader__balls">
          <div className="loader__balls__group">
            <div className="ball item1"></div>
            <div className="ball item1"></div>
            <div className="ball item1"></div>
          </div>
          <div className="loader__balls__group">
            <div className="ball item2"></div>
            <div className="ball item2"></div>
            <div className="ball item2"></div>
          </div>
          <div className="loader__balls__group">
            <div className="ball item3"></div>
            <div className="ball item3"></div>
            <div className="ball item3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
