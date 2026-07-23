import React, { useState } from 'react';

const PermissionRequestModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '15px' }}>בקשת הרשאות מנהל 🔒</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
          אם אתה זקוק לגישה למסכים נוספים (כמו ניהול מחסן או היסטוריה), אנא כתוב למנהל המערכת למה אתה צריך את ההרשאה.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>
              סיבת הבקשה:
            </label>
            <textarea
              className="input-field"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="לדוגמה: אני מנהל פרויקט וצריך גישה לעריכת מלאי המחסן..."
              required
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 1 }} disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? 'שולח...' : 'שלח בקשה 🚀'}
            </button>
            <button type="button" className="btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionRequestModal;
