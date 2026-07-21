import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const UsersList = () => {
  const { users, addUser, appRole } = useAppContext()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', phone: '', email: '', role: 'וטרינר', department: 'כללי', isActive: true })

  const handleSubmit = (e) => {
    e.preventDefault()
    addUser(newUser)
    setShowAddModal(false)
    setNewUser({ name: '', phone: '', email: '', role: 'וטרינר', department: 'כללי', isActive: true })
  }

  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      <div className="flex-header">
        <h2>אנשי קשר ומשתמשים</h2>
        {appRole === 'admin' && (
          <button className="btn" onClick={() => setShowAddModal(true)}>+ הוסף איש קשר</button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>שם העובד</th>
            <th>תפקיד</th>
            <th>מחלקה</th>
            <th>אימייל</th>
            <th>טלפון</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.5 }}>
              <td style={{ fontWeight: '500' }}>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.department}</td>
              <td>{user.email}</td>
              <td style={{ direction: 'ltr', textAlign: 'right' }}>{user.phone}</td>
              <td>
                <span className={`status-badge ${user.isActive ? 'status-ok' : 'status-warning'}`}>
                  {user.isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              </td>
              <td>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>צפה בכרטיס</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', background: 'var(--background-dark)' }}>
            <h3>הוספת איש קשר חדש</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input required placeholder="שם מלא" className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input required type="email" placeholder="אימייל" className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <input required placeholder="טלפון" className="input-field" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="וטרינר">וטרינר</option>
                <option value="עובד מעבדה">עובד מעבדה</option>
                <option value="מנהל">מנהל</option>
                <option value="אדמין">אדמין (ניהול מערכת)</option>
              </select>
              <input placeholder="מחלקה / אזור" className="input-field" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
