import React, { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = evt => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA && !isIOS) {
    return null; // Not installable or already installed
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
      padding: '10px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '15px',
      marginBottom: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/pwa-192x192.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <div>
          <h4 style={{ margin: 0, color: 'white' }}>התקן את המערכת</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
            {isIOS ? 'לחץ על כפתור השיתוף (מרובע עם חץ) בתחתית המסך ובחר "הוסף למסך הבית"' : 'גישה מהירה וישירה ממסך הבית!'}
          </p>
        </div>
      </div>
      
      {!isIOS && (
        <button 
          onClick={onClick}
          style={{
            background: 'white',
            color: 'var(--primary-color)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          התקן עכשיו
        </button>
      )}
    </div>
  );
};

export default InstallPWA;
