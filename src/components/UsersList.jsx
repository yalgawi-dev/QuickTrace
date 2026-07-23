import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const UserFormFields = ({ formData, setFormData }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
    <input required placeholder="שם מלא" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
    
    <select className="input-field" value={['וטרינר', 'עובד מעבדה', 'מנהל אזור'].includes(formData.role) ? formData.role : 'other'} onChange={e => {
      if (e.target.value !== 'other') {
        setFormData({...formData, role: e.target.value});
      } else {
        setFormData({...formData, role: 'other'});
      }
    }}>
      <option value="וטרינר">וטרינר</option>
      <option value="עובד מעבדה">עובד מעבדה</option>
      <option value="מנהל אזור">מנהל אזור</option>
      <option value="other">תפקיד אחר...</option>
    </select>
    
    {(!['וטרינר', 'עובד מעבדה', 'מנהל אזור'].includes(formData.role) || formData.role === 'other') && (
      <input required placeholder='הזן תפקיד חדש...' className="input-field" value={formData.role === 'other' ? '' : formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
    )}
    
    <input placeholder="מחלקה או אזור פעילות" className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
    <input type="email" placeholder="כתובת אימייל" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
    <input type="tel" required placeholder="טלפון נייד" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
    
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ transform: 'scale(1.5)' }} />
      משתמש פעיל במערכת
    </label>
  </div>
)

const UsersList = () => {
  const [search, setSearch] = useState('')
  const { users, appRole, addUser, updateUser, requests, deletePermissionRequest } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const initialUserState = { name: '', role: 'וטרינר', email: '', phone: '', department: '', isActive: true }
  const [newUser, setNewUser] = useState(initialUserState)
  const [editingUser, setEditingUser] = useState(null)

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.phone.includes(search) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddSubmit = (e) => {
    e.preventDefault()
    addUser(newUser)
    setShowAddModal(false)
    setNewUser(initialUserState)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateUser(editingUser)
    setShowEditModal(false)
    setEditingUser(null)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>ניהול אנשי קשר (עובדים)</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="חיפוש עובד, טלפון או תפקיד..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {appRole === 'admin' && (
            <button className="btn" onClick={() => setShowAddModal(true)}>+ הוסף איש קשר</button>
          )}
        </div>
      </div>

      {appRole === 'admin' && requests.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--warning)', marginBottom: '10px' }}>בקשות הרשאה ממתינות ({requests.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <strong>{req.userName}</strong> ({req.userEmail}) ביקש/ה הרשאה ב-{new Date(req.timestamp).toLocaleDateString('he-IL')}:
                  <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>"{req.reason}"</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => {
                    const userObj = users.find(u => u.id === req.userId);
                    if (userObj) {
                      openEditModal(userObj);
                    } else {
                      alert('משתמש לא נמצא');
                    }
                  }}>טפל (ערוך משתמש)</button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)' }} onClick={() => deletePermissionRequest(req.id)}>דחה / סגור</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>שם העובד</th>
              <th>תפקיד</th>
              <th>מחלקה/אזור</th>
              <th>אימייל</th>
              <th>טלפון</th>
              <th>סטטוס</th>
              {appRole === 'admin' && <th>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.5 }}>
                <td style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td>{user.email}</td>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{user.phone}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'status-ok' : 'status-error'}`}>
                    {user.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </td>
                {appRole === 'admin' && (
                  <td>
                    <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => openEditModal(user)}>ערוך</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', background: 'var(--background-dark)' }}>
            <h3>הוספת איש קשר חדש</h3>
            <form onSubmit={handleAddSubmit}>
              <UserFormFields formData={newUser} setFormData={setNewUser} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור משתמש</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowAddModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', background: 'var(--background-dark)' }}>
            <h3>עריכת איש קשר</h3>
            <form onSubmit={handleEditSubmit}>
              <UserFormFields formData={editingUser} setFormData={setEditingUser} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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

export default UsersList

