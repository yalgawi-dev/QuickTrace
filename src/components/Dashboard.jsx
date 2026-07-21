import React from 'react'
import { useAppContext } from '../context/AppContext'

const Dashboard = () => {
  const { equipment, history } = useAppContext()

  const activeFaults = equipment.filter(e => e.status !== 'תקין')
  const okEquipment = equipment.filter(e => e.status === 'תקין')

  return (
    <div className="glass-panel">
      <h2>מבט כללי (דשבורד)</h2>
      
      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
          <h3>סה"כ ציוד פעיל</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{equipment.length}</p>
        </div>
        <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <h3>ציוד תקין</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{okEquipment.length}</p>
        </div>
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <h3>תקלות פתוחות / מעקב</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{activeFaults.length}</p>
        </div>
      </div>

      <h3>פעילויות אחרונות</h3>
      <table>
        <thead>
          <tr>
            <th>תאריך ושעה</th>
            <th>מזהה (מק"ט)</th>
            <th>עובד</th>
            <th>סוג אירוע</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(0, 5).map(h => (
            <tr key={h.id}>
              <td style={{ direction: 'ltr', textAlign: 'right' }}>{h.date} {h.time && `- ${h.time}`}</td>
              <td>{h.device_sn}</td>
              <td>{h.employee}</td>
              <td>
                <span className={`status-badge ${h.event.includes('קליט') ? 'status-ok' : (h.event.includes('תקין') ? 'status-ok' : 'status-warning')}`}>
                  {h.event}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
