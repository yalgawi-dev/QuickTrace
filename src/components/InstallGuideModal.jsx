import React from 'react';

const InstallGuideModal = ({ onClose, isIOS }) => {
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(window.navigator.userAgent.toLowerCase());
  const isDesktop = !isMobile;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '450px', textAlign: 'center', background: 'var(--background-dark)' }}>
        <h2 style={{ marginBottom: '15px' }}>התקנת המערכת 📲</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-light)', lineHeight: '1.5', fontSize: '0.9rem' }}>
          הדפדפן דורש התקנה ידנית, אנא עקוב אחר ההוראות הפשוטות:
        </p>
        
        {isIOS && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>מכשיר אפל (אייפון/אייפד):</h4>
            <p style={{ margin: '0 0 10px 0' }}>1. לחץ על לחצן ה<strong>שיתוף</strong> (ריבוע עם חץ למעלה) בתחתית המסך.</p>
            <p style={{ margin: 0 }}>2. גלול למטה ובחר ב-<strong>"הוסף למסך הבית" (Add to Home Screen)</strong>.</p>
          </div>
        )}

        {!isIOS && isMobile && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'right' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', textAlign: 'center' }}>מכשיר אנדרואיד:</h4>
            <p style={{ margin: '0 0 10px 0' }}>1. לחץ על <strong>תפריט הדפדפן</strong> (שלוש נקודות למעלה <code>⋮</code>).</p>
            <p style={{ margin: 0 }}>2. בחר בתפריט ב-<strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.</p>
          </div>
        )}

        {isDesktop && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'right' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '15px', textAlign: 'center' }}>במחשב נייח / נייד:</h4>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>
              <strong>אפשרות 1 המהירה ביותר:</strong><br/>
              הסתכל על <strong>שורת הכתובת</strong> (איפה שכתוב הלינק למעלה). בצד שלה יופיע הסמל הבא:&nbsp;
              <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                  <path d="M480-320 280-520l56-56 104 104v-328h80v328l104-104 56 56-200 200ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/>
                </svg>
              </span>
              <br/>לחיצה עליו תתקין את המערכת מיד!
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              <strong>אפשרות 2 מהתפריט:</strong><br/>
              לחץ על 3 הנקודות בפינה העליונה של הדפדפן <code>⋮</code> <br/>
              ⬅️ בחר <strong>"שמור ושתף" (Save and share)</strong> <br/>
              ⬅️ לחץ <strong>"התקן את QuickTrace"</strong>.
            </p>
          </div>
        )}

        <button className="btn" onClick={onClose} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
          הבנתי, אני אתקין עכשיו 👍
        </button>
      </div>
    </div>
  );
};

export default InstallGuideModal;
