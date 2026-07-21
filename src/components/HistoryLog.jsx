import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const HistoryLog = () => {
  const [search, setSearch] = useState('')
  const { history } = useAppContext()

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
          className="input-field"
          style={{ width: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>תאריך ושעה</th>
            <th>מק"ט ציוד</th>
            <th>עובד</th>
            <th>אירוע</th>
            <th>פירוט והערות</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map(h => (
            <tr key={h.id}>
              <td style={{ direction: 'ltr', textAlign: 'right' }}>{h.date} {h.time && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>{h.time}</span>}</td>
              <td style={{ fontWeight: 'bold' }}>{h.device_sn}</td>
              <td>{h.employee}</td>
              <td>
                <span className={`status-badge ${h.event.includes('קליט') || h.event.includes('תקין') ? 'status-ok' : 'status-warning'}`}>
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
