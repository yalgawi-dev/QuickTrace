import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const EquipmentList = () => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'available', 'checkedOut'
  const { equipment, users, appRole, addEquipment } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEq, setNewEq] = useState({ type: 'אולטראסאונד (easi-scan)', customType: '', device_sn: '', status: 'תקין', notes: '', purchaseDate: '', warrantyExpiry: '', nextCalibration: '', currentUser: null })
  
  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'במחסן / זמין'
  }

  const filteredEq = equipment.filter(eq => {
    const matchesSearch = eq.device_sn.toLowerCase().includes(search.toLowerCase()) ||
                          getUserName(eq.currentUser).toLowerCase().includes(search.toLowerCase()) ||
                          eq.type.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'available') return matchesSearch && !eq.currentUser;
    if (filterStatus === 'checkedOut') return matchesSearch && eq.currentUser;
    return matchesSearch;
  })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    const finalType = newEq.type === 'other' ? newEq.customType : newEq.type
    addEquipment({ ...newEq, type: finalType })
    setShowAddModal(false)
    setNewEq({ type: 'אולטראסאונד (easi-scan)', customType: '', device_sn: '', status: 'תקין', notes: '', purchaseDate: '', warrantyExpiry: '', nextCalibration: '', currentUser: null })
  }

  return (
    <div className="glass-panel" style={{ border: 'none', background: 'transparent', padding: '0' }}>
      <div className="flex-header">
        <h2>ספירה וניהול רשומות מלאי</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="חיפוש לפי סוג, מק״ט או משתמש..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {appRole === 'admin' && (
            <button className="btn" onClick={() => setShowAddModal(true)}>+ רשום ציוד חדש</button>
          )}
        </div>
      </div>
      
      {/* Quick Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className="btn" 
          style={{ background: filterStatus === 'all' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--primary-color)' }}
          onClick={() => setFilterStatus('all')}
        >
          הכל ({equipment.length})
        </button>
        <button 
          className="btn" 
          style={{ background: filterStatus === 'available' ? 'var(--success)' : 'transparent', border: '1px solid var(--success)' }}
          onClick={() => setFilterStatus('available')}
        >
          זמין במחסן ({equipment.filter(e => !e.currentUser).length})
        </button>
        <button 
          className="btn" 
          style={{ background: filterStatus === 'checkedOut' ? 'var(--warning)' : 'transparent', border: '1px solid var(--warning)', color: filterStatus === 'checkedOut' ? 'black' : 'var(--warning)' }}
          onClick={() => setFilterStatus('checkedOut')}
        >
          מושאל בשטח ({equipment.filter(e => e.currentUser).length})
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>סוג הציוד</th>
              <th>מק"ט (S/N)</th>
              <th>מיקום נוכחי</th>
              <th>סטטוס טכני</th>
              <th>הערות</th>
              <th>ת. כיול הבא</th>
            </tr>
          </thead>
          <tbody>
            {filteredEq.map(eq => (
              <tr key={eq.id}>
                <td style={{ fontWeight: 'bold' }}>{eq.type}</td>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{eq.device_sn}</td>
                <td style={{ color: eq.currentUser ? 'white' : 'var(--success)', fontWeight: eq.currentUser ? 'normal' : 'bold' }}>{getUserName(eq.currentUser)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(eq.status)}`}>
                    {eq.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'normal', maxWidth: '200px' }}>{eq.notes || '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>{eq.nextCalibration || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>הוספת רשומת ציוד חדשה</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <select className="input-field" value={newEq.type} onChange={e => setNewEq({...newEq, type: e.target.value})}>
                <option value="אולטראסאונד (easi-scan)">אולטראסאונד (easi-scan)</option>
                <option value="אולטראסאונד (easi-scan go)">אולטראסאונד (easi-scan go)</option>
                <option value="אולטראסאונד (IMV חוטי)">אולטראסאונד (IMV חוטי)</option>
                <option value="משקף">משקף</option>
                <option value="other">אחר (הזן ידנית)...</option>
              </select>
              
              {newEq.type === 'other' && (
                <input required placeholder='הזן סוג מוצר חדש...' className="input-field" value={newEq.customType} onChange={e => setNewEq({...newEq, customType: e.target.value})} />
              )}
              
              <input required placeholder='מק"ט מכשיר (S/N)' className="input-field" value={newEq.device_sn} onChange={e => setNewEq({...newEq, device_sn: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך רכישה</label>
                  <input type="date" className="input-field" value={newEq.purchaseDate} onChange={e => setNewEq({...newEq, purchaseDate: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תוקף אחריות</label>
                  <input type="date" className="input-field" value={newEq.warrantyExpiry} onChange={e => setNewEq({...newEq, warrantyExpiry: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך טיפול / כיול הבא</label>
                <input type="date" className="input-field" value={newEq.nextCalibration} onChange={e => setNewEq({...newEq, nextCalibration: e.target.value})} />
              </div>
              
              <textarea 
                placeholder="הערות התחלתיות למכשיר (אופציונלי)" 
                className="input-field" 
                rows="2"
                value={newEq.notes} 
                onChange={e => setNewEq({...newEq, notes: e.target.value})} 
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור ציוד למלאי</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowAddModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EquipmentList
