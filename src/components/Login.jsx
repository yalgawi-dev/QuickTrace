import React, { useState } from 'react'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
      setError('שגיאה בהתחברות עם גוגל. נסה שנית.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('נא להזין אימייל וסיסמה')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('פרטי ההתחברות שגויים.')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('המייל הזה כבר רשום במערכת. נסה להתחבר.')
      } else {
        setError('שגיאה בהתחברות: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ marginBottom: '10px' }}>QuickTrace</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>ברוכים הבאים למערכת ניהול הציוד</p>

        {error && (
          <div style={{ background: 'rgba(255,50,50,0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          <input 
            type="email" 
            placeholder="כתובת אימייל" 
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="סיסמה" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="btn" disabled={loading} style={{ background: 'var(--primary-color)', marginTop: '10px' }}>
            {loading ? 'טוען...' : (isRegistering ? 'צור חשבון חדש' : 'היכנס למערכת')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '25px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span>או</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          className="btn" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ width: '100%', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '20px' }} />
          המשך עם Google
        </button>

        <div style={{ marginTop: '30px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isRegistering ? 'כבר יש לך חשבון? ' : 'אין לך חשבון? '}
          <span 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'התחבר כאן' : 'הירשם כאן'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login
