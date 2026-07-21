import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const UsersList = () => {
  const [search, setSearch] = useState('')
  const { users, appRole, addUser } = useAppContext()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', role: 'וטרינר', customRole: '', email: '', phone: '', department: '', isActive: true })

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.phone.includes(search) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddSubmit = (e) => {
    e.preventDefault()
    const finalRole = newUser.role === 'other' ? newUser.customRole : newUser.role
    addUser({ ...newUser, role: finalRole })
    setShowAddModal(false)
    setNewUser({ name: '', role: 'וטרינר', customRole: '', email: '', phone: '', department: '', isActive: true })
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', background: 'var(--background-dark)' }}>
            <h3>הוספת איש קשר חדש</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input required placeholder="שם מלא" className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              
              <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="וטרינר">וטרינר</option>
                <option value="עובד מעבדה">עובד מעבדה</option>
                <option value="מנהל אזור">מנהל אזור</option>
                <option value="other">תפקיד אחר...</option>
              </select>
              
              {newUser.role === 'other' && (
                <input required placeholder='הזן תפקיד חדש...' className="input-field" value={newUser.customRole} onChange={e => setNewUser({...newUser, customRole: e.target.value})} />
              )}
              
              <input placeholder="מחלקה או אזור פעילות" className="input-field" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} />
              <input type="email" placeholder="כתובת אימייל" className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <input type="tel" required placeholder="טלפון נייד" className="input-field" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input type="checkbox" checked={newUser.isActive} onChange={e => setNewUser({...newUser, isActive: e.target.checked})} style={{ transform: 'scale(1.5)' }} />
                משתמש פעיל במערכת
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>שמור משתמש</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowAddModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersList
