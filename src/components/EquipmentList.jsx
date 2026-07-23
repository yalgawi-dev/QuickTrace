import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

// Component pulled outside to prevent re-mounting and losing input focus on every keystroke
const FormFields = ({ formData, setFormData, availableTypes }) => (
  <div style={{ display: 'grid', gap: '15px' }}>
    <div style={{ display: 'flex', gap: '15px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>סוג הציוד</label>
        <input 
          list="equipment-types" 
          className="input-field" 
          value={formData.type} 
          onChange={e => setFormData({...formData, type: e.target.value})}
          placeholder="בחר או הקלד סוג חדש..."
          required
        />
        <datalist id="equipment-types">
          {availableTypes.map(type => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>סטטוס המכשיר</label>
        <select 
          className="input-field" 
          value={['תקין', 'חדש מהניילון', 'ישן / שחוק', 'במעקב טכני', 'תקול / מקולקל', 'נשלח לתיקון'].includes(formData.status) ? formData.status : 'other'} 
          onChange={e => {
            if (e.target.value !== 'other') {
              setFormData({...formData, status: e.target.value});
            } else {
              setFormData({...formData, status: 'other'}); // Temporary state until they type
            }
          }}
          required
        >
          <option value="תקין">תקין</option>
          <option value="חדש מהניילון">חדש מהניילון</option>
          <option value="ישן / שחוק">ישן / שחוק</option>
          <option value="במעקב טכני">במעקב טכני</option>
          <option value="תקול / מקולקל">תקול / מקולקל</option>
          <option value="נשלח לתיקון">נשלח לתיקון</option>
          <option value="other">סטטוס אחר (הזן ידנית)...</option>
        </select>
        {(!['תקין', 'חדש מהניילון', 'ישן / שחוק', 'במעקב טכני', 'תקול / מקולקל', 'נשלח לתיקון'].includes(formData.status) || formData.status === 'other') && (
          <input 
            required 
            placeholder='הזן סטטוס חדש...' 
            className="input-field" 
            style={{ marginTop: '5px' }} 
            value={formData.status === 'other' ? '' : formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})} 
          />
        )}
      </div>
    </div>

    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
      <label style={{ fontSize: '0.9rem', color: 'var(--primary-color)', display: 'block', marginBottom: '8px' }}>
        🔗 ציוד נלווה / משוייך (אופציונלי)
      </label>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
        סמן אילו פריטים תמיד מוצעים יחד עם מכשיר זה בעת משיכה:
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '100px', overflowY: 'auto', paddingRight: '5px' }}>
        {availableTypes.filter(t => t !== formData.type).map(type => (
          <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={(formData.linkedTypes || []).includes(type)}
              onChange={() => {
                const current = formData.linkedTypes || []
                if (current.includes(type)) {
                  setFormData({ ...formData, linkedTypes: current.filter(t => t !== type) })
                } else {
                  setFormData({ ...formData, linkedTypes: [...current, type] })
                }
              }}
            />
            {type}
          </label>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', gap: '15px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>מק"ט מכשיר (S/N)</label>
        <input required placeholder='מק"ט מכשיר (S/N)' className="input-field" value={formData.device_sn} onChange={e => setFormData({...formData, device_sn: e.target.value})} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך טיפול / כיול הבא</label>
        <input type="date" className="input-field" value={formData.nextCalibration} onChange={e => setFormData({...formData, nextCalibration: e.target.value})} />
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: '15px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך רכישה</label>
        <input type="date" className="input-field" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תוקף אחריות</label>
        <input type="date" className="input-field" value={formData.warrantyExpiry} onChange={e => setFormData({...formData, warrantyExpiry: e.target.value})} />
      </div>
    </div>
    
    <textarea 
      placeholder="הערות התחלתיות למכשיר (אופציונלי)" 
      className="input-field" 
      rows="2"
      value={formData.notes} 
      onChange={e => setFormData({...formData, notes: e.target.value})} 
    />
  </div>
)

const EquipmentList = ({ onBack }) => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { equipment, users, appRole, addEquipment, updateEquipment } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const initialEqState = { 
    type: '', 
    device_sn: '', status: 'תקין', 
    notes: '', purchaseDate: '', warrantyExpiry: '', 
    nextCalibration: '', currentUser: null,
    linkedTypes: []
  }
  const [newEq, setNewEq] = useState(initialEqState)
  const [editingEq, setEditingEq] = useState(null)
  
  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status?.includes('מעקב')) return 'status-warning'
    return 'status-error'
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'במחסן / זמין'
  }

  const filteredEq = equipment.filter(eq => {
    const matchesSearch = (eq.device_sn && eq.device_sn.toLowerCase().includes(search.toLowerCase())) ||
                          getUserName(eq.currentUser).toLowerCase().includes(search.toLowerCase()) ||
                          eq.type.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'available') return matchesSearch && !eq.currentUser;
    if (filterStatus === 'checkedOut') return matchesSearch && eq.currentUser;
    return matchesSearch;
  })

  // Get base categories (e.g., extract "אולטראסאונד" from "אולטראסאונד (easi-scan)")
  const availableTypes = Array.from(new Set(equipment.map(e => {
    const match = e.type.match(/^([^\(]+)/);
    return match ? match[1].trim() : e.type;
  }))).filter(t => t);
  if (!availableTypes.includes('סוללות')) availableTypes.push('סוללות');
  if (!availableTypes.includes('משקף')) availableTypes.push('משקף'); 
  if (!availableTypes.includes('אולטראסאונד')) availableTypes.push('אולטראסאונד');

  const handleAddSubmit = (e) => {
    e.preventDefault()
    addEquipment(newEq)
    setShowAddModal(false)
    setNewEq(initialEqState)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateEquipment(editingEq)
    setShowEditModal(false)
    setEditingEq(null)
  }

  const openEditModal = (eq) => {
    let linked = eq.linkedTypes || []
    if (eq.linkedType && linked.length === 0) {
      linked = [eq.linkedType]
    }
    setEditingEq({
      ...eq,
      linkedTypes: linked
    })
    setShowEditModal(true)
  }

  return (
    <div className="glass-panel" style={{ border: 'none', background: 'transparent', padding: '0' }}>
      <div className="flex-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2>ספירה וניהול רשומות מלאי</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
          {onBack && (
            <button className="btn" onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}>
              ⬅ חזור לדשבורד מחסן
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn" style={{ background: filterStatus === 'all' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--primary-color)' }} onClick={() => setFilterStatus('all')}>הכל ({equipment.length})</button>
        <button className="btn" style={{ background: filterStatus === 'available' ? 'var(--success)' : 'transparent', border: '1px solid var(--success)' }} onClick={() => setFilterStatus('available')}>זמין במחסן ({equipment.filter(e => !e.currentUser).length})</button>
        <button className="btn" style={{ background: filterStatus === 'checkedOut' ? 'var(--warning)' : 'transparent', border: '1px solid var(--warning)', color: filterStatus === 'checkedOut' ? 'black' : 'var(--warning)' }} onClick={() => setFilterStatus('checkedOut')}>מושאל בשטח ({equipment.filter(e => e.currentUser).length})</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>סוג הציוד</th>
              <th>מק"ט (S/N)</th>
              <th>ציוד נלווה מוגדר</th>
              <th>מיקום נוכחי</th>
              <th>סטטוס טכני</th>
              <th>הערות</th>
              {appRole === 'admin' && <th>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {filteredEq.map(eq => {
              const linked = eq.linkedTypes || (eq.linkedType ? [eq.linkedType] : [])
              return (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 'bold' }}>{eq.type}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{eq.device_sn}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {linked.length > 0 ? linked.join(', ') : '-'}
                  </td>
                  <td style={{ color: eq.currentUser ? 'white' : 'var(--success)', fontWeight: eq.currentUser ? 'normal' : 'bold' }}>{getUserName(eq.currentUser)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(eq.status)}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'normal', maxWidth: '200px' }}>{eq.notes || '-'}</td>
                  {appRole === 'admin' && (
                    <td>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => openEditModal(eq)}>ערוך</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowAddModal(false)} 
              style={{ position: 'absolute', left: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0 }}>הוספת רשומת ציוד חדשה</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <FormFields formData={newEq} setFormData={setNewEq} availableTypes={availableTypes} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור ציוד למלאי</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowAddModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingEq && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowEditModal(false)} 
              style={{ position: 'absolute', left: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0 }}>עריכת רשומת ציוד</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <FormFields formData={editingEq} setFormData={setEditingEq} availableTypes={availableTypes} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור שינויים</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowEditModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EquipmentList
