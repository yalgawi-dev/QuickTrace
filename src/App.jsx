import { useState, useEffect } from 'react'
import './index.css'
import Dashboard from './components/Dashboard'
import EquipmentList from './components/EquipmentList'
import UsersList from './components/UsersList'
import HistoryLog from './components/HistoryLog'
import Warehouse from './components/Warehouse'
import Login from './components/Login'
import Settings from './components/Settings'
import Onboarding from './components/Onboarding'
import { AppProvider, useAppContext } from './context/AppContext'

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('quickTrace_activeTab') || 'dashboard'
  })
  const [warehouseKey, setWarehouseKey] = useState(0)
  
  const { appRole, authUser, authLoading, logout, loggedUserDoc } = useAppContext()

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('quickTrace_activeTab', activeTab)
    }
  }, [activeTab])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>טוען מערכת...</h2>
      </div>
    )
  }

  if (!authUser) {
    return <Login />
  }

  if (loggedUserDoc && !loggedUserDoc.onboarded) {
    return <Onboarding />
  }

  const allowedPages = loggedUserDoc?.allowedPages || ['dashboard']
  const hasPage = (page) => appRole === 'admin' || allowedPages.includes(page)

  return (
    <div dir="rtl">
      <header className="flex-header">
        <div className="logo-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <h1>QuickTrace</h1>
          <p style={{ color: 'var(--text-muted)' }}>מערכת ניהול ציוד ומלאי חכמה</p>
        </div>
        
        <div className="header-actions">
          <div className="user-profile-badge">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              מחובר כ: <strong>{authUser.email}</strong> ({appRole === 'admin' ? 'מנהל' : appRole === 'editor' ? 'עורך' : 'צופה'})
            </span>
            <button onClick={logout} className="btn" style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '4px 12px', fontSize: '0.8rem' }}>
              התנתק
            </button>
          </div>

          <nav className="main-nav">
            {hasPage('dashboard') && <button className={`btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>דשבורד תמונת מצב</button>}
            
            {hasPage('warehouse') && <button className={`btn ${activeTab === 'warehouse' ? 'active' : ''}`} onClick={() => { setActiveTab('warehouse'); setWarehouseKey(prev => prev + 1); }}>דשבורד מחסן ומלאי</button>}
            
            {hasPage('users') && <button className={`btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>דשבורד עובדים</button>}
            
            {hasPage('history') && <button className={`btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>דשבורד היסטוריה</button>}

            {hasPage('settings') && (
              <button className={`btn ${activeTab === 'settings' ? 'active' : ''}`} style={{ border: '1px solid var(--warning)', color: activeTab === 'settings' ? 'black' : 'var(--warning)', background: activeTab === 'settings' ? 'var(--warning)' : 'transparent' }} onClick={() => setActiveTab('settings')}>
                ⚙️ הגדרות
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && hasPage('dashboard') && <Dashboard />}
        {activeTab === 'warehouse' && hasPage('warehouse') && <Warehouse key={warehouseKey} />}
        {activeTab === 'users' && hasPage('users') && <UsersList />}
        {activeTab === 'history' && hasPage('history') && <HistoryLog />}
        {activeTab === 'settings' && hasPage('settings') && <Settings setActiveTab={setActiveTab} />}
      </main>

      <footer style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '30px', paddingBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 'bold' }}>
        POWERED BY YEHUDA ALGAWI
      </footer>
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
