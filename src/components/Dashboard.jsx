import React, { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'

const Dashboard = () => {
  const { equipment, history, users } = useAppContext()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const activeFaults = equipment.filter(e => e.status !== 'תקין')

  // Build searchable items list (Users + Equipment)
  const searchableItems = useMemo(() => {
    const items = []
    users.forEach(u => items.push({ type: 'user', id: u.id, label: `עובד: ${u.name} (${u.role})`, data: u }))
    equipment.forEach(e => items.push({ type: 'equipment', id: e.id, label: `ציוד: ${e.type} - מזהה/מק"ט: ${e.device_sn}`, data: e }))
    return items
  }, [users, equipment])

  // Filter based on query
  const filteredItems = searchQuery 
    ? searchableItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const [selectedResult, setSelectedResult] = useState(null)

  const handleSelectResult = (item) => {
    setSearchQuery(item.label)
    setSelectedResult(item)
    setShowDropdown(false)
  }

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

  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'במחסן'
  }

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>מבט כללי - תמונת מצב</h2>
        
        {/* Smart Search (Autocomplete) */}
        <div style={{ position: 'relative', width: '350px' }}>
          <input 
            type="text" 
            placeholder='חיפוש עובד או מק"ט (הקלד לסינון)...' 
            className="input-field"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
              if (e.target.value === '') setSelectedResult(null)
            }}
            onFocus={() => setShowDropdown(true)}
          />
          
          {showDropdown && searchQuery && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--background-card-dark)', border: '1px solid var(--primary-color)', borderRadius: '4px', marginTop: '5px', zIndex: 50, maxHeight: '250px', overflowY: 'auto' }}>
              {filteredItems.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredItems.map(item => (
                    <li 
                      key={`${item.type}-${item.id}`} 
                      onClick={() => handleSelectResult(item)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: item.type === 'user' ? '#fde047' : '#93c5fd' }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: '10px', color: 'var(--text-muted)' }}>לא נמצאו תוצאות</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Search Results Highlight Area */}
      {selectedResult && (
        <div className="glass-panel" style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>תוצאת חיפוש ממוקדת:</h3>
            <button onClick={() => { setSelectedResult(null); setSearchQuery('') }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✖ סגור</button>
          </div>
          
          {selectedResult.type === 'equipment' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <strong>סוג:</strong> {selectedResult.data.type} | <strong>מק"ט:</strong> {selectedResult.data.device_sn}
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--primary-color)' }}>
                <strong>משתמש נוכחי:</strong> {getUserName(selectedResult.data.currentUser)}
              </div>
              <div>
                <strong>סטטוס:</strong> <span className={`status-badge ${getStatusClass(selectedResult.data.status)}`}>{selectedResult.data.status}</span>
              </div>
              <div>
                <strong>הערות:</strong> {selectedResult.data.notes || 'אין הערות'}
              </div>
            </div>
          ) : (
            <div>
              <p><strong>עובד:</strong> {selectedResult.data.name} | <strong>טלפון:</strong> {selectedResult.data.phone}</p>
              <h4 style={{ marginTop: '10px', color: 'var(--text-muted)' }}>ציוד שברשותו כעת:</h4>
              <ul style={{ listStyle: 'none', marginTop: '5px' }}>
                {equipment.filter(e => e.currentUser === selectedResult.data.id).map(eq => (
                  <li key={eq.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                    <strong>{eq.type}</strong> (מק"ט: {eq.device_sn})
                    <span style={{ margin: '0 10px', color: 'var(--text-muted)' }}>|</span>
                    <span className={`status-badge ${getStatusClass(eq.status)}`}>{eq.status}</span>
                  </li>
                ))}
                {(selectedResult.data.activeBatteries > 0) && (
                  <li style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                    <strong>סוללות:</strong> {selectedResult.data.activeBatteries} יח'
                  </li>
                )}
                {equipment.filter(e => e.currentUser === selectedResult.data.id).length === 0 && (selectedResult.data.activeBatteries || 0) === 0 && <li>אין ציוד משויך.</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Main Users Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>ריכוז ציוד נוכחי (לפי עובד)</h3>
      </div>
      
      <div className="table-container" style={{ marginTop: '10px', marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>עובד</th>
              <th>טלפון</th>
              <th>אולטראסאונד (מק"ט)</th>
              <th>משקפים (מק"ט)</th>
              <th>ציוד נוסף</th>
              <th>סוללות</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length > 0 ? activeUsers.map(user => {
              const { ultrasounds, goggles, others } = getUserEquipment(user.id)
              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: 'bold' }}>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>
                    {ultrasounds.length > 0 ? ultrasounds.map(u => (
                      <div key={u.id} style={{ marginBottom: '4px' }}>
                        {u.type.replace('אולטראסאונד', '').trim() || 'אולטראסאונד'} <strong style={{ color: 'var(--primary-color)' }}>({u.device_sn})</strong>
                        <br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.notes}</span>
                      </div>
                    )) : '-'}
                  </td>
                  <td>
                    {goggles.length > 0 ? goggles.map(g => (
                      <div key={g.id} style={{ marginBottom: '4px' }}>
                        משקף <strong style={{ color: 'var(--secondary-color)' }}>({g.device_sn})</strong>
                        <br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.notes}</span>
                      </div>
                    )) : '-'}
                  </td>
                  <td>
                    {others.length > 0 ? others.map(o => (
                      <div key={o.id} style={{ fontSize: '0.85rem' }}>{o.type} ({o.device_sn})</div>
                    )) : '-'}
                  </td>
                  <td style={{ fontWeight: 'bold', color: user.activeBatteries > 0 ? 'var(--warning)' : 'inherit' }}>
                    {user.activeBatteries > 0 ? user.activeBatteries : '-'}
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>אין כרגע ציוד מחוץ למחסן. כל הציוד פנוי.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>פעילויות אחרונות (היסטוריה)</h3>
      </div>
      
      <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '10px' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--background-card-dark)' }}>
            <tr>
              <th>תאריך ושעה</th>
              <th>מזהה (מק"ט)</th>
              <th>עובד</th>
              <th>סוג אירוע</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 30).map(h => (
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
