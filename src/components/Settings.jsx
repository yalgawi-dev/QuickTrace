import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const Settings = ({ setActiveTab }) => {
  const { users, appRole, updateUser, loggedUserDoc } = useAppContext()
  const [search, setSearch] = useState('')

  if (appRole !== 'admin') {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>אין הרשאות</h3>
        <p style={{ color: 'var(--text-muted)' }}>מסך ההגדרות זמין למנהלי מערכת בלבד.</p>
      </div>
    )
  }

  const isSuperAdmin = loggedUserDoc?.isSuperAdmin;
  const hasSuperAdmin = users.some(u => u.isSuperAdmin);
  const canClaimSuperAdmin = !hasSuperAdmin && appRole === 'admin';

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleRoleChange = (user, newRole) => {
    // Prevent removing the last admin or changing a Super Admin's role directly
    if (user.appRole === 'admin' && newRole !== 'admin') {
      const adminCount = users.filter(u => u.appRole === 'admin').length;
      if (adminCount <= 1) {
        alert("פעולה חסומה: חייב להיות לפחות מנהל מערכת (Admin) אחד פעיל במערכת!");
        return;
      }
      
      if (user.isSuperAdmin) {
        alert("פעולה חסומה: כדי להסיר הרשאת מנהל ממשתמש-על, יש להסיר קודם את הגדרתו כמשתמש-על.");
        return;
      }
    }
    
    // Prevent a regular admin from messing with a Super Admin at all
    if (user.isSuperAdmin && !isSuperAdmin) {
      alert("פעולה חסומה: רק משתמש-על יכול לשנות הרשאות של משתמש-על אחר.");
      return;
    }
    
    let newPages = user.allowedPages ? [...user.allowedPages] : ['dashboard'];
    if (newRole === 'admin') {
      newPages = ['dashboard', 'warehouse', 'users', 'history', 'settings'];
    } else if (newRole === 'editor') {
      if (!newPages.includes('warehouse')) newPages.push('warehouse');
    }

    updateUser({ ...user, appRole: newRole, allowedPages: newPages })
  }

  const handlePageToggle = (user, page) => {
    const currentPages = user.allowedPages || [];
    const newPages = currentPages.includes(page) 
      ? currentPages.filter(p => p !== page) 
      : [...currentPages, page];
    
    updateUser({ ...user, allowedPages: newPages });
  }

  const handleToggleSuperAdmin = (user) => {
    // Only a Super Admin can toggle other Super Admins
    if (!isSuperAdmin) return;
    
    // Prevent removing the last Super Admin
    if (user.isSuperAdmin) {
      const superAdminCount = users.filter(u => u.isSuperAdmin).length;
      if (superAdminCount <= 1) {
        alert("חייב להיות לפחות משתמש-על אחד במערכת!");
        return;
      }
    }
    
    updateUser({ ...user, isSuperAdmin: !user.isSuperAdmin, appRole: 'admin', allowedPages: ['dashboard', 'warehouse', 'users', 'history', 'settings'] });
  }

  const handleClaimSuperAdmin = () => {
    if (loggedUserDoc) {
      updateUser({ ...loggedUserDoc, isSuperAdmin: true });
      alert("הפכת למשתמש-על (Super Admin) הראשון במערכת!");
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'QuickTrace',
      text: 'היכנס למערכת ניהול הציוד שלנו:',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('הקישור הועתק ללוח! עכשיו תוכל להדביק אותו בוואטסאפ או במייל.');
      }).catch(err => {
        alert('שגיאה בהעתקת הקישור: ' + err);
      });
    }
  }

  const pageOptions = [
    { id: 'dashboard', label: 'תמונת מצב (Dashboard)' },
    { id: 'warehouse', label: 'מחסן ומלאי' },
    { id: 'users', label: 'ניהול עובדים' },
    { id: 'history', label: 'היסטוריית פעולות' }
  ];

  return (
    <div className="glass-panel" style={{ minHeight: '80vh' }}>
      <div className="flex-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {setActiveTab && (
              <button 
                className="btn" 
                onClick={() => setActiveTab('dashboard')} 
                style={{ background: 'var(--background-card-dark)', border: '1px solid var(--glass-border)', padding: '5px 15px', color: 'var(--text-light)', fontSize: '0.9rem' }}
              >
                ⬅ חזרה לדשבורד
              </button>
            )}
            <h2 style={{ margin: 0 }}>⚙️ הגדרות מערכת וניהול הרשאות מנהל</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '10px', marginTop: '10px' }}>
            כאן תוכל לקבוע מי מורשה להיכנס למערכת, ואיזה עמודים כל עובד רשאי לראות ולערוך.
          </p>
          
          {canClaimSuperAdmin && (
            <button onClick={handleClaimSuperAdmin} className="btn" style={{ background: 'var(--warning)', color: 'black', marginBottom: '15px' }}>
              👑 דרוש בעלות: הגדר אותי כמשתמש-על
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <button onClick={handleShare} className="btn" style={{ background: 'var(--primary-color)' }}>
            🔗 הפץ / שתף אפליקציה לעובדים
          </button>
          <input 
            type="text" 
            placeholder="חיפוש משתמש (לפי שם או אימייל)..." 
            className="input-field"
            style={{ width: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>אימייל / כתובת חשבון</th>
              <th>תפקיד בחברה</th>
              <th>רמת גישה כללית (Role)</th>
              <th>עמודים מורשים</th>
              {isSuperAdmin && <th style={{ color: 'var(--warning)' }}>👑 משתמש-על</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.5, borderLeft: user.isSuperAdmin ? '4px solid var(--warning)' : 'none' }}>
                <td style={{ fontWeight: 'bold', color: user.isSuperAdmin ? 'var(--warning)' : 'white' }}>
                  {user.isSuperAdmin && '👑 '}
                  {user.name}
                </td>
                <td style={{ direction: 'ltr', textAlign: 'right', color: 'var(--text-muted)' }}>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <select 
                    className="input-field" 
                    value={user.appRole || 'viewer'} 
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={user.isSuperAdmin && !isSuperAdmin}
                    style={{ 
                      background: user.appRole === 'admin' ? 'var(--warning)' : user.appRole === 'editor' ? 'var(--success)' : 'rgba(255,255,255,0.1)', 
                      color: user.appRole === 'admin' ? 'black' : 'white', 
                      fontWeight: 'bold', border: 'none', width: '100%',
                      opacity: (user.isSuperAdmin && !isSuperAdmin) ? 0.5 : 1
                    }}
                  >
                    <option value="admin">מנהל מערכת (Admin) - הכל</option>
                    <option value="editor">מחסנאי (Editor)</option>
                    <option value="viewer">צופה בלבד (Viewer)</option>
                  </select>
                </td>
                <td>
                  {user.appRole === 'admin' ? (
                    <span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>גישה חופשית לכל העמודים (אדמין)</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {pageOptions.map(page => (
                        <label key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '15px' }}>
                          <input 
                            type="checkbox" 
                            checked={(user.allowedPages || []).includes(page.id)}
                            onChange={() => handlePageToggle(user, page.id)}
                          />
                          {page.label}
                        </label>
                      ))}
                    </div>
                  )}
                </td>
                {isSuperAdmin && (
                  <td>
                    <button 
                      onClick={() => handleToggleSuperAdmin(user)}
                      style={{ 
                        background: user.isSuperAdmin ? 'var(--warning)' : 'transparent',
                        color: user.isSuperAdmin ? 'black' : 'var(--text-muted)',
                        border: '1px solid var(--warning)',
                        padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >
                      {user.isSuperAdmin ? 'כן' : 'הגדר'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Settings
