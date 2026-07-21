import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const EquipmentList = () => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { equipment, users, appRole, addEquipment, updateEquipment } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const initialEqState = { 
    type: 'אולטראסאונד (easi-scan)', customType: '', 
    device_sn: '', status: 'תקין', customStatus: '', 
    notes: '', purchaseDate: '', warrantyExpiry: '', 
    nextCalibration: '', currentUser: null,
    linkedType: ''
  }
  const [newEq, setNewEq] = useState(initialEqState)
  const [editingEq, setEditingEq] = useState(null)
  
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
    const matchesSearch = (eq.device_sn && eq.device_sn.toLowerCase().includes(search.toLowerCase())) ||
                          getUserName(eq.currentUser).toLowerCase().includes(search.toLowerCase()) ||
                          eq.type.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'available') return matchesSearch && !eq.currentUser;
    if (filterStatus === 'checkedOut') return matchesSearch && eq.currentUser;
    return matchesSearch;
  })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    const finalType = newEq.type === 'other' ? newEq.customType : newEq.type
    const finalStatus = newEq.status === 'other' ? newEq.customStatus : newEq.status
    addEquipment({ ...newEq, type: finalType, status: finalStatus })
    setShowAddModal(false)
    setNewEq(initialEqState)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    const finalType = editingEq.type === 'other' ? editingEq.customType : editingEq.type
    const finalStatus = editingEq.status === 'other' ? editingEq.customStatus : editingEq.status
    updateEquipment({ ...editingEq, type: finalType, status: finalStatus })
    setShowEditModal(false)
    setEditingEq(null)
  }

  const openEditModal = (eq) => {
    // If it's a standard type/status, use it, else set to 'other' and populate custom fields
    const standardTypes = ['אולטראסאונד (easi-scan)', 'אולטראסאונד (easi-scan go)', 'אולטראסאונד (IMV חוטי)', 'משקף']
    const standardStatuses = ['תקין', 'חדש', 'ישן', 'מעקב', 'תקלה', 'בתיקון']
    
    const isStandardType = standardTypes.includes(eq.type)
    const isStandardStatus = standardStatuses.includes(eq.status)

    setEditingEq({
      ...eq,
      type: isStandardType ? eq.type : 'other',
      customType: !isStandardType ? eq.type : '',
      status: isStandardStatus ? eq.status : 'other',
      customStatus: !isStandardStatus ? eq.status : '',
      linkedType: eq.linkedType || ''
    })
    setShowEditModal(true)
  }

  const FormFields = ({ formData, setFormData }) => (
    <>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>סוג הציוד</label>
        <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="אולטראסאונד (easi-scan)">אולטראסאונד (easi-scan)</option>
          <option value="אולטראסאונד (easi-scan go)">אולטראסאונד (easi-scan go)</option>
          <option value="אולטראסאונד (IMV חוטי)">אולטראסאונד (IMV חוטי)</option>
          <option value="משקף">משקף</option>
          <option value="other">אחר (הזן ידנית)...</option>
        </select>
        {formData.type === 'other' && (
          <input required placeholder='הזן סוג מוצר חדש...' className="input-field" style={{ marginTop: '5px' }} value={formData.customType} onChange={e => setFormData({...formData, customType: e.target.value})} />
        )}
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ציוד נלווה / משוייך (אופציונלי)</label>
        <select className="input-field" value={formData.linkedType} onChange={e => setFormData({...formData, linkedType: e.target.value})}>
          <option value="">ללא ציוד נלווה</option>
          <option value="משקף">משקף</option>
        </select>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>* יקפיץ את בחירת הציוד הנלווה בעת משיכת ציוד זה</div>
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>סטטוס המכשיר</label>
        <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
          <option value="תקין">תקין</option>
          <option value="חדש">חדש מהניילון</option>
          <option value="ישן">ישן / שחוק</option>
          <option value="מעקב">במעקב טכני</option>
          <option value="תקלה">תקול / מקולקל</option>
          <option value="בתיקון">נשלח לתיקון</option>
          <option value="other">סטטוס אחר (הזן ידנית)...</option>
        </select>
        {formData.status === 'other' && (
          <input required placeholder='הזן סטטוס חדש...' className="input-field" style={{ marginTop: '5px' }} value={formData.customStatus} onChange={e => setFormData({...formData, customStatus: e.target.value})} />
        )}
      </div>
      
      <input required placeholder='מק"ט מכשיר (S/N)' className="input-field" value={formData.device_sn} onChange={e => setFormData({...formData, device_sn: e.target.value})} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך רכישה</label>
          <input type="date" className="input-field" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תוקף אחריות</label>
          <input type="date" className="input-field" value={formData.warrantyExpiry} onChange={e => setFormData({...formData, warrantyExpiry: e.target.value})} />
        </div>
      </div>
      
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך טיפול / כיול הבא</label>
        <input type="date" className="input-field" value={formData.nextCalibration} onChange={e => setFormData({...formData, nextCalibration: e.target.value})} />
      </div>
      
      <textarea 
        placeholder="הערות התחלתיות למכשיר (אופציונלי)" 
        className="input-field" 
        rows="2"
        value={formData.notes} 
        onChange={e => setFormData({...formData, notes: e.target.value})} 
      />
    </>
  )

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
            {filteredEq.map(eq => (
              <tr key={eq.id}>
                <td style={{ fontWeight: 'bold' }}>{eq.type}</td>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{eq.device_sn}</td>
                <td style={{ color: 'var(--text-muted)' }}>{eq.linkedType || '-'}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>הוספת רשומת ציוד חדשה</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <FormFields formData={newEq} setFormData={setNewEq} />
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
          <div className="glass-panel" style={{ width: '450px', background: 'var(--background-dark)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>עריכת רשומת ציוד</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <FormFields formData={editingEq} setFormData={setEditingEq} />
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
