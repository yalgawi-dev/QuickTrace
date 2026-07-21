import React, { useState } from 'react'
import mockData from '../mockData.json'

const HistoryLog = () => {
  const [search, setSearch] = useState('')
  const { history } = mockData

  const filteredHistory = history.filter(h => 
    h.device_sn.toLowerCase().includes(search.toLowerCase()) ||
    h.employee.toLowerCase().includes(search.toLowerCase()) ||
    h.event.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="glass-panel">
      <div className="flex-header">
        <h2>היסטוריית תנועות וציוד</h2>
        <input 
          type="text" 
          placeholder="חיפוש לפי מק״ט, עובד או אירוע..." 
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', width: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>תאריך</th>
            <th>מק"ט ציוד</th>
            <th>עובד</th>
            <th>אירוע</th>
            <th>פירוט והערות</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map(h => (
            <tr key={h.id}>
              <td>{h.date}</td>
              <td style={{ fontWeight: 'bold' }}>{h.device_sn}</td>
              <td>{h.employee}</td>
              <td>
                <span className={`status-badge ${h.event === 'קליטת ציוד' ? 'status-ok' : 'status-warning'}`}>
                  {h.event}
                </span>
              </td>
              <td>{h.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HistoryLog
