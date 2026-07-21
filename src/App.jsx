import { useState } from 'react'
import './index.css'
import Dashboard from './components/Dashboard'
import EquipmentList from './components/EquipmentList'
import UsersList from './components/UsersList'
import HistoryLog from './components/HistoryLog'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div dir="rtl">
      <header className="flex-header">
        <div>
          <h1>QuickTrace</h1>
          <p style={{ color: 'var(--text-muted)' }}>מערכת ניהול ציוד ומלאי חכמה</p>
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => setActiveTab('dashboard')}>דשבורד</button>
          <button className="btn" onClick={() => setActiveTab('equipment')}>ציוד</button>
          <button className="btn" onClick={() => setActiveTab('users')}>משתמשים</button>
          <button className="btn" onClick={() => setActiveTab('history')}>היסטוריה</button>
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'equipment' && <EquipmentList />}
        {activeTab === 'users' && <UsersList />}
        {activeTab === 'history' && <HistoryLog />}
      </main>
    </div>
  )
}

export default App
