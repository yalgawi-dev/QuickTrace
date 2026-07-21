import React, { useState } from 'react'
import mockData from '../mockData.json'

const EquipmentList = () => {
  const [search, setSearch] = useState('')
  const { equipment, users } = mockData

  const getStatusClass = (status) => {
    if (status === 'תקין') return 'status-ok'
    if (status === 'מעקב') return 'status-warning'
    return 'status-error'
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'לא ידוע'
  }

  const filteredEq = equipment.filter(eq => 
    eq.device_sn.toLowerCase().includes(search.toLowerCase()) ||
    eq.goggles_sn.toLowerCase().includes(search.toLowerCase()) ||
    getUserName(eq.currentUser).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>ניהול ציוד ומלאי</h2>
        <input 
          type="text" 
          placeholder="חיפוש לפי מק״ט או משתמש..." 
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', width: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn">הוסף ציוד חדש</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>סוג</th>
            <th>מק"ט מכשיר</th>
            <th>מק"ט משקף</th>
            <th>סוללות</th>
            <th>משתמש נוכחי</th>
            <th>סטטוס</th>
            <th>הערות</th>
          </tr>
        </thead>
        <tbody>
          {filteredEq.map(eq => (
            <tr key={eq.id}>
              <td>{eq.type}</td>
              <td style={{ fontWeight: 'bold' }}>{eq.device_sn}</td>
              <td>{eq.goggles_sn}</td>
              <td>{eq.batteries}</td>
              <td>{getUserName(eq.currentUser)}</td>
              <td>
                <span className={`status-badge ${getStatusClass(eq.status)}`}>
                  {eq.status}
                </span>
              </td>
              <td>{eq.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EquipmentList
