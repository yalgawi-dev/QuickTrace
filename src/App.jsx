import { useState } from 'react'
import './index.css'
import Dashboard from './components/Dashboard'
import EquipmentList from './components/EquipmentList'
import UsersList from './components/UsersList'
import HistoryLog from './components/HistoryLog'
import { AppProvider, useAppContext } from './context/AppContext'

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { appRole, setAppRole } = useAppContext()

  return (
    <div dir="rtl">
      <header className="flex-header">
        <div>
          <h1>QuickTrace</h1>
          <p style={{ color: 'var(--text-muted)' }}>מערכת ניהול ציוד ומלאי חכמה</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '10px' }}>תצוגה כ:</label>
            <select 
              value={appRole} 
              onChange={e => setAppRole(e.target.value)}
              style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', fontWeight: 'bold' }}
            >
              <option value="admin">מנהל (Admin)</option>
              <option value="user">משתמש רגיל (Read-Only)</option>
            </select>
          </div>

          <nav style={{ display: 'flex', gap: '10px' }}>
            <button className={`btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>דשבורד</button>
            <button className={`btn ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>ציוד</button>
            <button className={`btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>משתמשים</button>
            <button className={`btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>היסטוריה</button>
          </nav>
        </div>
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

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
