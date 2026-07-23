import React, { useEffect, useState } from 'react';
import InstallGuideModal from './InstallGuideModal';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    return localStorage.getItem('quicktrace_isInstalled') === 'true';
  });
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      localStorage.setItem('quicktrace_isInstalled', 'true');
    }
    
    if (isIosDevice) {
      setIsIOS(true);
    }

    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('quicktrace_isInstalled', 'true');
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onClick = async evt => {
    evt.preventDefault();
    if (promptInstall) {
      promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('quicktrace_isInstalled', 'true');
      }
      setPromptInstall(null);
    } else {
      // If the browser blocks the prompt, show the manual guide modal
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
        padding: '10px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px',
        marginBottom: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/pwa-192x192.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          <div>
            <h4 style={{ margin: 0, color: 'white' }}>התקן את המערכת</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
              גישה מהירה וישירה ממסך הבית!
            </p>
          </div>
        </div>
        
        <button 
          onClick={onClick}
          style={{
            background: 'white',
            color: 'var(--primary-color)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          התקן עכשיו
        </button>
      </div>

      {showGuideModal && (
        <InstallGuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />
      )}
    </>
  );
};

export default InstallPWA;
