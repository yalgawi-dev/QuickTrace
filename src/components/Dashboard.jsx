import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const Dashboard = () => {
  const { equipment, history, users } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')

  const activeFaults = equipment.filter(e => e.status !== 'תקין')
  const okEquipment = equipment.filter(e => e.status === 'תקין')

  // Search logic for specific device or user
  const searchedEquipment = searchQuery ? equipment.find(e => 
    e.device_sn.toLowerCase() === searchQuery.toLowerCase() || 
    e.goggles_sn.toLowerCase() === searchQuery.toLowerCase()
  ) : null;

  const searchedUser = searchQuery && !searchedEquipment ? users.find(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone === searchQuery
  ) : null;

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'במחסן'
  }

  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>מבט כללי (דשבורד)</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>בדיקת סטטוס מהירה:</label>
          <input 
            type="text" 
            placeholder='הקלד מק"ט, משקף או שם עובד...' 
            className="input-field"
            style={{ width: '300px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Search Results Area */}
      {searchQuery && (
        <div className="glass-panel" style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>תוצאת חיפוש:</h3>
          
          {searchedEquipment ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong>מכשיר:</strong> {searchedEquipment.type} | <strong>מק"ט:</strong> {searchedEquipment.device_sn}
              </div>
              <div>
                <strong>משתמש נוכחי:</strong> {getUserName(searchedEquipment.currentUser)}
              </div>
              <div>
                <strong>סטטוס:</strong> <span className={`status-badge ${getStatusClass(searchedEquipment.status)}`}>{searchedEquipment.status}</span>
              </div>
              <div>
                <strong>הערות:</strong> {searchedEquipment.notes || 'אין הערות'}
              </div>
            </div>
          ) : searchedUser ? (
            <div>
              <p><strong>עובד:</strong> {searchedUser.name} ({searchedUser.role}) | <strong>טלפון:</strong> {searchedUser.phone}</p>
              <h4 style={{ marginTop: '10px', color: 'var(--text-muted)' }}>ציוד שברשותו כעת:</h4>
              <ul style={{ listStyle: 'none', marginTop: '5px' }}>
                {equipment.filter(e => e.currentUser === searchedUser.id).map(eq => (
                  <li key={eq.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '4px', marginBottom: '5px' }}>
                    {eq.type} ({eq.device_sn}) - <span className={`status-badge ${getStatusClass(eq.status)}`}>{eq.status}</span>
                  </li>
                ))}
                {equipment.filter(e => e.currentUser === searchedUser.id).length === 0 && <li>אין ציוד משויך.</li>}
              </ul>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>לא נמצאו תוצאות מדויקות למק"ט או משתמש זה.</p>
          )}
        </div>
      )}

      {!searchQuery && (
        <div className="grid-cards" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <h3>סה"כ ציוד פעיל</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{equipment.length}</p>
          </div>
          <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <h3>ציוד תקין במחסן</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{equipment.filter(e => e.status === 'תקין' && !e.currentUser).length}</p>
          </div>
          <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <h3>תקלות / דורש מעקב</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{activeFaults.length}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>פעילויות אחרונות (היסטוריה)</h3>
      </div>
      
      <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '10px' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>תאריך ושעה</th>
              <th>מזהה (מק"ט)</th>
              <th>עובד</th>
              <th>סוג אירוע</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 20).map(h => (
              <tr key={h.id}>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{h.date} {h.time && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>- {h.time}</span>}</td>
                <td style={{ fontWeight: 'bold' }}>{h.device_sn}</td>
                <td>{h.employee}</td>
                <td>
                  <span className={`status-badge ${h.event.includes('קליט') ? 'status-ok' : (h.event.includes('תקין') ? 'status-ok' : 'status-warning')}`}>
                    {h.event}
                  </span>
                </td>
                <td style={{ fontSize: '0.85em', maxWidth: '200px', whiteSpace: 'normal' }}>{h.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
