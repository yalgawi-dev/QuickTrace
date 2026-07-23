import React from 'react';

const InstallGuideModal = ({ onClose, isIOS }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', textAlign: 'center', background: 'var(--background-dark)' }}>
        <h2 style={{ marginBottom: '15px' }}>התקנת האפליקציה 📲</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-light)', lineHeight: '1.5' }}>
          הדפדפן שלך חוסם כרגע התקנה אוטומטית (כנראה כי חלון ההתקנה כבר הוצג בעבר).<br/><br/>
          אבל זה קלי קלות להתקין ידנית:
        </p>
        
        {isIOS ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px 0' }}>1. לחץ על לחצן ה<strong>שיתוף</strong> (ריבוע עם חץ למעלה) בתחתית המסך.</p>
            <p style={{ margin: 0 }}>2. גלול למטה ובחר ב-<strong>"הוסף למסך הבית" (Add to Home Screen)</strong>.</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'right' }}>
            <p style={{ margin: '0 0 10px 0' }}>1. לחץ על <strong>תפריט הדפדפן</strong> (שלוש נקודות למעלה `⋮`).</p>
            <p style={{ margin: 0 }}>2. בחר ב-<strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.</p>
          </div>
        )}

        <button className="btn" onClick={onClose} style={{ width: '100%' }}>
          הבנתי, תודה! 👍
        </button>
      </div>
    </div>
  );
};

export default InstallGuideModal;
