import React, { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'

const Dashboard = () => {
  const { equipment, users, history } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')

  // Helper to find equipment for a user
  const getUserEquipment = (userId) => {
    const userEq = equipment.filter(e => e.currentUser === userId)
    const ultrasounds = userEq.filter(e => e.type.includes('אולטראסאונד') || e.type.includes('easi-scan'))
    const goggles = userEq.filter(e => e.type.includes('משקף'))
    const others = userEq.filter(e => !e.type.includes('אולטראסאונד') && !e.type.includes('easi-scan') && !e.type.includes('משקף'))
    return { ultrasounds, goggles, others }
  }

  // Active users (users who currently hold equipment or batteries)
  const activeUsers = users.filter(u => equipment.some(e => e.currentUser === u.id) || u.activeBatteries > 0)

  // Filter based on query
  const filteredUsers = activeUsers.filter(u => {
    const term = searchQuery.trim().toLowerCase();
    const userMatches = u.name.toLowerCase().includes(term) || u.phone.includes(term);
    const userEq = equipment.filter(e => e.currentUser === u.id);
    const eqMatches = userEq.some(e => 
      e.type.toLowerCase().includes(term) || 
      e.device_sn.toLowerCase().includes(term)
    );
    
    return userMatches || eqMatches;
  })

  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  return (
    <div className="glass-panel" style={{ minHeight: '80vh' }}>
      <div className="flex-header">
        <h2>מבט כללי - תמונת מצב חיה</h2>
        
        {/* Simple search for the table */}
        <div style={{ width: '350px' }}>
          <input 
            type="text" 
            placeholder='חיפוש עובד, טלפון או מק"ט...' 
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Top Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-panel" style={{ flex: 1, background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>סה"כ ציוד בחוץ</h3>
          <p style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>{equipment.filter(e => e.currentUser).length}</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>עובדים עם ציוד</h3>
          <p style={{ fontSize: '2rem', color: 'white' }}>{activeUsers.length}</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>ציוד בתקלה / מעקב</h3>
          <p style={{ fontSize: '2rem', color: 'var(--warning)' }}>{equipment.filter(e => e.status !== 'תקין').length}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px' }}>טבלת ריכוז נתונים (לפי עובד)</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '0.9rem' }}>
        טבלה זו מציגה בדיוק מי מחזיק מה כרגע בשטח, כולל פירוט מק"טים, משקפים וסוללות.
      </p>

      {/* Main Users Table - Exactly as requested in the screenshot */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>שם העובד</th>
              <th>טלפון שלו</th>
              <th>סוג מכשיר (אולטראסאונד)</th>
              <th>מק"ט / S/N של המכשיר</th>
              <th>איזה משקף/ים יש לו</th>
              <th>כמה סוללות</th>
              <th>הערות כלליות</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => {
              const { ultrasounds, goggles, others } = getUserEquipment(user.id)
              
              // Get all notes combined for the user's equipment
              const allNotes = equipment
                .filter(e => e.currentUser === user.id && e.notes)
                .map(e => `${e.type}: ${e.notes}`)
                .join(' | ')

              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: 'bold' }}>{user.name}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{user.phone}</td>
                  
                  {/* Ultrasound Names */}
                  <td>
                    {ultrasounds.length > 0 ? ultrasounds.map(u => (
                      <div key={u.id}>{u.type.replace('אולטראסאונד', '').trim() || 'אולטראסאונד'}</div>
                    )) : '-'}
                  </td>
                  
                  {/* Ultrasound S/Ns */}
                  <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    {ultrasounds.length > 0 ? ultrasounds.map(u => (
                      <div key={`sn-${u.id}`}>{u.device_sn}</div>
                    )) : '-'}
                  </td>

                  {/* Goggles S/Ns */}
                  <td style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                    {goggles.length > 0 ? goggles.map(g => (
                      <div key={g.id}>{g.device_sn}</div>
                    )) : '-'}
                  </td>

                  {/* Batteries */}
                  <td style={{ fontWeight: 'bold', color: user.activeBatteries > 0 ? 'var(--warning)' : 'inherit' }}>
                    {user.activeBatteries > 0 ? user.activeBatteries : '-'}
                  </td>

                  {/* Notes */}
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'normal', maxWidth: '250px' }}>
                    {allNotes || '-'}
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'לא נמצאו תוצאות לחיפוש זה' : 'אין כרגע ציוד מחוץ למחסן. כל הציוד פנוי.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
