import React from 'react'
import mockData from '../mockData.json'

const UsersList = () => {
  const { users } = mockData

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>אנשי קשר ומשתמשים</h2>
        <button className="btn">הוסף איש קשר</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>שם העובד</th>
            <th>טלפון</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ fontWeight: '500' }}>{user.name}</td>
              <td style={{ direction: 'ltr', textAlign: 'right' }}>{user.phone}</td>
              <td>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>צפה בכרטיס</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersList
