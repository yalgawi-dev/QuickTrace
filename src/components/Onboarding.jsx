import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Onboarding = () => {
  const { loggedUserDoc, updateUser } = useAppContext();
  
  const [phone, setPhone] = useState(loggedUserDoc?.phone || '');
  const [role, setRole] = useState(loggedUserDoc?.role === 'משתמש אפליקציה' ? '' : (loggedUserDoc?.role || ''));
  const [department, setDepartment] = useState(loggedUserDoc?.department || '');
  
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('נא להזין מספר טלפון.');
      return;
    }
    if (!role.trim()) {
      setError('נא להזין תפקיד בחברה.');
      return;
    }
    
    try {
      await updateUser({
        ...loggedUserDoc,
        phone,
        role,
        department,
        onboarded: true
      });
    } catch (err) {
      setError('שגיאה בשמירת הנתונים. נסה שוב.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      direction: 'rtl'
    }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>ברוכים הבאים ל-QuickTrace! 👋</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
          זיהינו שזו הפעם הראשונה שאתה מתחבר למערכת. 
          אנא השלם את הפרטים הבאים כדי שנוכל לקלוט אותך כראוי.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: 'bold' }}>
              מספר טלפון נייד (חובה)
            </label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="לדוגמה: 050-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: 'bold' }}>
              תפקיד בחברה (חובה)
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="לדוגמה: מתקין שטח, מנהל פרויקט..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              מחלקה / צוות (רשות)
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="לדוגמה: צוות התקנות צפון"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '10px', width: '100%' }}>
            שמור נתונים והיכנס למערכת 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
