import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const EquipmentList = () => {
  const [search, setSearch] = useState('')
  const { equipment, users, appRole, addEquipment, checkoutEquipment, returnEquipment } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEq, setNewEq] = useState({ type: 'easi-scan', device_sn: '', goggles_sn: '', batteries: 2, status: 'תקין', notes: '', purchaseDate: '', warrantyExpiry: '', nextCalibration: '', currentUser: null })
  
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('checkout') // checkout or return
  const [selectedEqId, setSelectedEqId] = useState(null)
  const [actionData, setActionData] = useState({ userId: '', notes: '', status: 'תקין' })

  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'במחסן / זמין'
  }

  const filteredEq = equipment.filter(eq => 
    eq.device_sn.toLowerCase().includes(search.toLowerCase()) ||
    (eq.goggles_sn && eq.goggles_sn.toLowerCase().includes(search.toLowerCase())) ||
    getUserName(eq.currentUser).toLowerCase().includes(search.toLowerCase())
  )

  const handleAddSubmit = (e) => {
    e.preventDefault()
    addEquipment(newEq)
    setShowAddModal(false)
    setNewEq({ type: 'easi-scan', device_sn: '', goggles_sn: '', batteries: 2, status: 'תקין', notes: '', purchaseDate: '', warrantyExpiry: '', nextCalibration: '', currentUser: null })
  }

  const handleActionSubmit = (e) => {
    e.preventDefault()
    if (actionType === 'checkout') {
      checkoutEquipment(selectedEqId, actionData.userId, actionData.notes)
    } else {
      returnEquipment(selectedEqId, actionData.status, actionData.notes)
    }
    setShowActionModal(false)
    setActionData({ userId: '', notes: '', status: 'תקין' })
  }

  const openAction = (type, eqId) => {
    setActionType(type)
    setSelectedEqId(eqId)
    setShowActionModal(true)
  }

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>ניהול ציוד ומלאי</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="חיפוש מק״ט או משתמש..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {appRole === 'admin' && (
            <button className="btn" onClick={() => setShowAddModal(true)}>+ הוסף ציוד חדש</button>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>מק"ט מכשיר</th>
            <th>סוג</th>
            <th>סוללות</th>
            <th>משתמש נוכחי</th>
            <th>סטטוס</th>
            <th>ת. טיפול הבא</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredEq.map(eq => (
            <tr key={eq.id}>
              <td style={{ fontWeight: 'bold' }}>{eq.device_sn} <br/><small style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>משקף: {eq.goggles_sn}</small></td>
              <td>{eq.type}</td>
              <td>{eq.batteries}</td>
              <td style={{ color: eq.currentUser ? 'white' : 'var(--success)' }}>{getUserName(eq.currentUser)}</td>
              <td>
                <span className={`status-badge ${getStatusClass(eq.status)}`}>
                  {eq.status}
                </span>
                {eq.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{eq.notes}</div>}
              </td>
              <td style={{ fontSize: '0.85rem' }}>{eq.nextCalibration}</td>
              <td>
                {appRole === 'admin' ? (
                  eq.currentUser ? (
                    <button onClick={() => openAction('return', eq.id)} style={{ background: 'var(--warning)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>החזרה ממקבל</button>
                  ) : (
                    <button onClick={() => openAction('checkout', eq.id)} style={{ background: 'var(--success)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>שיוך לעובד</button>
                  )
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ללא הרשאה</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>הוספת ציוד חדש למלאי</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <select className="input-field" value={newEq.type} onChange={e => setNewEq({...newEq, type: e.target.value})}>
                <option value="easi-scan">easi-scan</option>
                <option value="easi-scan go">easi-scan go</option>
                <option value="IMV חוטי">IMV חוטי</option>
              </select>
              <input required placeholder='מק"ט מכשיר (S/N)' className="input-field" value={newEq.device_sn} onChange={e => setNewEq({...newEq, device_sn: e.target.value})} />
              <input placeholder='מק"ט משקף (אופציונלי)' className="input-field" value={newEq.goggles_sn} onChange={e => setNewEq({...newEq, goggles_sn: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>מספר סוללות</label>
                  <input type="number" className="input-field" style={{ width: '100%' }} value={newEq.batteries} onChange={e => setNewEq({...newEq, batteries: parseInt(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תוקף אחריות</label>
                  <input type="date" className="input-field" style={{ width: '100%' }} value={newEq.warrantyExpiry} onChange={e => setNewEq({...newEq, warrantyExpiry: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך טיפול / כיול הבא</label>
                <input type="date" className="input-field" style={{ width: '100%' }} value={newEq.nextCalibration} onChange={e => setNewEq({...newEq, nextCalibration: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור ציוד</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowAddModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout / Return Modal */}
      {showActionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', background: 'var(--background-dark)' }}>
            <h3>{actionType === 'checkout' ? 'שיוך ציוד לעובד (לקיחה)' : 'החזרת ציוד למחסן'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
              תאריך ושעת הפעולה יתועדו אוטומטית בהיסטוריה.
            </p>
            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {actionType === 'checkout' && (
                <select required className="input-field" value={actionData.userId} onChange={e => setActionData({...actionData, userId: e.target.value})}>
                  <option value="" disabled>-- בחר עובד מקבל --</option>
                  {users.filter(u => u.isActive).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              )}

              {actionType === 'return' && (
                <select className="input-field" value={actionData.status} onChange={e => setActionData({...actionData, status: e.target.value})}>
                  <option value="תקין">תקין</option>
                  <option value="מעקב">מעקב (דורש בדיקה)</option>
                  <option value="תקלה">תקלה (דורש תיקון)</option>
                </select>
              )}

              <textarea 
                placeholder="הערות אירוע (תקלות מיוחדות, חוסרים...)" 
                className="input-field" 
                rows="3"
                value={actionData.notes} 
                onChange={e => setActionData({...actionData, notes: e.target.value})} 
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1, background: actionType === 'checkout' ? 'var(--success)' : 'var(--warning)' }}>
                  {actionType === 'checkout' ? 'בצע שיוך' : 'אשר החזרה'}
                </button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowActionModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default EquipmentList
