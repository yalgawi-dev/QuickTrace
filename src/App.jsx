import { useState, useEffect } from 'react'
import './index.css'
import Dashboard from './components/Dashboard'
import EquipmentList from './components/EquipmentList'
import UsersList from './components/UsersList'
import HistoryLog from './components/HistoryLog'
import Warehouse from './components/Warehouse'
import { AppProvider, useAppContext } from './context/AppContext'

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('quickTrace_activeTab') || 'dashboard'
  })
  const [warehouseKey, setWarehouseKey] = useState(0)
  const { appRole, setAppRole } = useAppContext()

  useEffect(() => {
    localStorage.setItem('quickTrace_activeTab', activeTab)
  }, [activeTab])

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
            <button className={`btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>דשבורד תמונת מצב</button>
            <button className={`btn ${activeTab === 'warehouse' ? 'active' : ''}`} onClick={() => { setActiveTab('warehouse'); setWarehouseKey(prev => prev + 1); }}>דשבורד מחסן ומלאי</button>
            <button className={`btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>דשבורד עובדים</button>
            <button className={`btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>דשבורד היסטוריה</button>
          </nav>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'warehouse' && <Warehouse key={warehouseKey} />}
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
