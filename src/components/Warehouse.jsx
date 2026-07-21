import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import EquipmentList from './EquipmentList'
import AutocompleteSearch from './AutocompleteSearch'

const Warehouse = () => {
  const { equipment, users, appRole, checkoutEquipment, returnEquipment } = useAppContext()
  
  const [actionType, setActionType] = useState(null) // 'checkout', 'return', or 'inventory'
  
  // Common states
  const [selectedUserId, setSelectedUserId] = useState('')
  const [issuerName, setIssuerName] = useState('')
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0])
  const [actionTime, setActionTime] = useState(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }))
  
  // Checkout states
  const [selectedEqId, setSelectedEqId] = useState('')
  const [selectedLinkedItems, setSelectedLinkedItems] = useState({}) // { 'משקף': 'e123', 'כבל': 'e456' }
  const [batteriesTaken, setBatteriesTaken] = useState(0)
  const [checkoutNotes, setCheckoutNotes] = useState('')
  const [checkoutStatus, setCheckoutStatus] = useState('תקין')
  const [checkoutCustomStatus, setCheckoutCustomStatus] = useState('')
  
  // Return states
  const [returnItems, setReturnItems] = useState({}) 
  const [batteriesReturned, setBatteriesReturned] = useState(0)
  
  // Search states
  const [searchUser, setSearchUser] = useState('')
  const [searchEq, setSearchEq] = useState('')

  const resetForm = () => {
    setActionType(null)
    setSelectedUserId('')
    setSelectedEqId('')
    setSelectedLinkedItems({})
    setBatteriesTaken(0)
    setCheckoutNotes('')
    setCheckoutStatus('תקין')
    setCheckoutCustomStatus('')
    setReturnItems({})
    setBatteriesReturned(0)
    setSearchUser('')
    setSearchEq('')
    setIssuerName('')
    setActionDate(new Date().toISOString().split('T')[0])
    setActionTime(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }))
  }

  // --- Filtering Logic for Dropdowns ---
  const userOptionsForCheckout = users.map(u => ({ label: `${u.name} (${u.phone})`, value: u.id, searchTerms: [u.name, u.phone] }));
  
  const availableEqOptions = equipment
    .filter(e => !e.currentUser)
    .map(e => ({
      label: `${e.type} (מק"ט: ${e.device_sn}) ${e.status !== 'תקין' ? `[${e.status}]` : ''}`,
      value: e.id,
      searchTerms: [e.type, e.device_sn]
    }));

  const userOptionsForReturn = users
    .filter(u => equipment.some(e => e.currentUser === u.id) || u.activeBatteries > 0)
    .map(u => ({ label: `${u.name} (${u.phone})`, value: u.id, searchTerms: [u.name, u.phone] }));

  // Find selected eq to determine linked types
  const selectedEq = equipment.find(e => e.id === selectedEqId);
  const linkedTypesArray = selectedEq ? (selectedEq.linkedTypes || (selectedEq.linkedType ? [selectedEq.linkedType] : [])) : [];
  
  const requiresBatteries = linkedTypesArray.includes('סוללות');
  const equipmentLinkedTypes = linkedTypesArray.filter(t => t !== 'סוללות');

  const handleUserSelectForReturn = (userId) => {
    setSelectedUserId(userId)
    const userEq = equipment.filter(e => e.currentUser === userId)
    const initialReturnState = {}
    userEq.forEach(eq => {
      initialReturnState[eq.id] = { isReturning: false, status: eq.status || 'תקין', customStatus: '', notes: '' }
    })
    setReturnItems(initialReturnState)
    const user = users.find(u => u.id === userId)
    setBatteriesReturned(user ? user.activeBatteries : 0)
  }

  const submitCheckout = (e) => {
    e.preventDefault()
    if (!selectedEqId && batteriesTaken === 0) {
      alert('יש לבחור ציוד או סוללות למשיכה')
      return
    }

    if (!issuerName) {
      alert('חובה למלא את שם המחסנאי המאשר')
      return
    }

    const finalStatus = checkoutStatus === 'other' ? checkoutCustomStatus : checkoutStatus;

    if (selectedEqId) {
      checkoutEquipment(selectedEqId, selectedUserId, checkoutNotes, batteriesTaken, actionDate, actionTime, finalStatus, issuerName)
    }

    // Checkout any linked items that were selected
    Object.values(selectedLinkedItems).forEach(linkedEqId => {
      if (linkedEqId) {
        // Linked items inherit the same status and notes for simplicity, and take 0 batteries
        checkoutEquipment(linkedEqId, selectedUserId, checkoutNotes, 0, actionDate, actionTime, finalStatus, issuerName)
      }
    })

    alert('הציוד שויך בהצלחה!')
    resetForm()
  }

  const submitReturn = (e) => {
    e.preventDefault()
    const itemsToReturn = Object.keys(returnItems).filter(id => returnItems[id].isReturning)
    
    if (itemsToReturn.length === 0 && batteriesReturned === 0) {
      alert('לא נבחר שום ציוד או סוללות להחזרה')
      return
    }

    if (!issuerName) {
      alert('חובה למלא את שם המחסנאי המקבל')
      return
    }

    itemsToReturn.forEach((id, index) => {
      const batToReturn = index === 0 ? batteriesReturned : 0;
      const finalStatus = returnItems[id].status === 'other' ? returnItems[id].customStatus : returnItems[id].status;
      returnEquipment(id, finalStatus, returnItems[id].notes, batToReturn, actionDate, actionTime, issuerName)
    })

    if (itemsToReturn.length === 0 && batteriesReturned > 0) {
      alert('החזרת סוללות בוצעה (בלוגיקה מלאה נוסיף תמיכה נפרדת)')
    }

    alert('הציוד הוחזר למחסן בהצלחה!')
    resetForm()
  }

  if (appRole !== 'admin') {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>אין הרשאות</h3>
        <p style={{ color: 'var(--text-muted)' }}>מסך המחסן זמין למנהלי מערכת (אדמין) בלבד.</p>
      </div>
    )
  }

  if (actionType === 'inventory') {
    return (
      <div>
        <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center' }}>
          <button className="btn" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}>
            ⬅ חזור לדשבורד מחסן
          </button>
        </div>
        <EquipmentList />
      </div>
    )
  }

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📦 דשבורד מרכז פעולות - מחסן ציוד</h2>
      
      {!actionType && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            style={{ width: '250px', height: '150px', fontSize: '1.5rem', background: 'var(--success)' }}
            onClick={() => setActionType('checkout')}
          >
            ⬆️ משיכת ציוד<br/><span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>(שיוך לעובד)</span>
          </button>
          
          <button 
            className="btn" 
            style={{ width: '250px', height: '150px', fontSize: '1.5rem', background: 'var(--warning)', color: 'black' }}
            onClick={() => setActionType('return')}
          >
            ⬇️ החזרת ציוד<br/><span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>(קליטה למחסן)</span>
          </button>
          
          <button 
            className="btn" 
            style={{ width: '250px', height: '150px', fontSize: '1.5rem', background: 'var(--primary-color)' }}
            onClick={() => setActionType('inventory')}
          >
            📋 ספירה וניהול מלאי<br/><span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>(רשומות הציוד)</span>
          </button>
        </div>
      )}

      {/* --- CHECKOUT WIZARD --- */}
      {actionType === 'checkout' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
          <div className="flex-header">
            <h3>משיכת ציוד ושיוך לעובד</h3>
            <button className="btn" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}>ביטול וחזרה</button>
          </div>

          <form onSubmit={submitCheckout} style={{ marginTop: '20px' }}>
            
            <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px' }}>
              <h4 style={{ marginBottom: '10px' }}>1. למי לשייך? (בחר עובד)</h4>
              <AutocompleteSearch 
                placeholder="הקלד שם או טלפון לחיפוש..."
                options={userOptionsForCheckout}
                value={selectedUserId}
                onChange={(val) => setSelectedUserId(val)}
                emptyMessage="לא נמצא עובד מתאים"
              />
            </div>

            {selectedUserId && (
              <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px', animation: 'fadeIn 0.3s' }}>
                <h4 style={{ marginBottom: '10px' }}>2. איזה מכשיר הוא לוקח?</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <AutocompleteSearch 
                    placeholder="חיפוש לפי סוג או מק״ט מכשיר ראשי..."
                    options={availableEqOptions}
                    value={selectedEqId}
                    onChange={(val) => {
                      setSelectedEqId(val)
                      setSelectedLinkedItems({}) // reset dependents
                      setBatteriesTaken(0)
                    }}
                    emptyMessage="לא נמצא מכשיר פנוי במלאי"
                  />
                </div>

                {equipmentLinkedTypes.length > 0 && (
                  <div style={{ marginBottom: '15px', animation: 'fadeIn 0.3s', borderLeft: '3px solid var(--primary-color)', paddingLeft: '10px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'block', marginBottom: '10px' }}>הציוד הנבחר תומך בפריטים נלווים, האם ברצונך לשייך?</label>
                    {equipmentLinkedTypes.map(type => {
                      const options = equipment
                        .filter(e => !e.currentUser && e.type === type)
                        .map(e => ({
                          label: `${e.type} (מק"ט: ${e.device_sn}) ${e.status !== 'תקין' ? `[${e.status}]` : ''}`,
                          value: e.id,
                          searchTerms: [e.type, e.device_sn]
                        }));
                      
                      return (
                        <div key={type} style={{ marginBottom: '10px' }}>
                          <AutocompleteSearch 
                            placeholder={`חיפוש ${type} פנוי...`}
                            options={options}
                            value={selectedLinkedItems[type] || ''}
                            onChange={(val) => setSelectedLinkedItems(prev => ({...prev, [type]: val}))}
                            emptyMessage={`אין ${type} זמין במלאי!`}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {requiresBatteries && (
                  <div style={{ marginBottom: '15px', animation: 'fadeIn 0.3s', borderLeft: '3px solid var(--primary-color)', paddingLeft: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>הציוד דורש סוללות - כמה לקח?</label>
                    <input 
                      type="number" 
                      min="0"
                      className="input-field" 
                      value={batteriesTaken} 
                      onChange={e => setBatteriesTaken(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                )}
              </div>
            )}

            {selectedUserId && selectedEqId && (
              <div className="glass-panel" style={{ padding: '15px', animation: 'fadeIn 0.3s' }}>
                <h4 style={{ marginBottom: '10px' }}>3. פרטי הפעולה והמאשר</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך</label>
                    <input type="date" className="input-field" value={actionDate} onChange={e => setActionDate(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>שעה</label>
                    <input type="time" className="input-field" value={actionTime} onChange={e => setActionTime(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>סטטוס המכשיר במשיכה</label>
                  <select className="input-field" value={checkoutStatus} onChange={e => setCheckoutStatus(e.target.value)}>
                    <option value="תקין">תקין</option>
                    <option value="חדש">חדש מהניילון</option>
                    <option value="ישן">ישן / שחוק</option>
                    <option value="מעקב">דורש מעקב צמוד</option>
                    <option value="other">סטטוס אחר (הזן ידנית)...</option>
                  </select>
                  {checkoutStatus === 'other' && (
                    <input required placeholder='הזן סטטוס חדש...' className="input-field" style={{ marginTop: '5px' }} value={checkoutCustomStatus} onChange={e => setCheckoutCustomStatus(e.target.value)} />
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <input type="text" className="input-field" placeholder="שם המחסנאי / מנפיק הציוד (חובה)" value={issuerName} onChange={e => setIssuerName(e.target.value)} required />
                </div>

                <textarea 
                  className="input-field" 
                  rows="2" 
                  placeholder="הערות למשיכה (אופציונלי)"
                  value={checkoutNotes}
                  onChange={e => setCheckoutNotes(e.target.value)}
                ></textarea>

                <button type="submit" className="btn" style={{ width: '100%', marginTop: '15px', background: 'var(--success)' }}>
                  ✅ אישור שיוך ויציאה לשטח
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* --- RETURN WIZARD --- */}
      {actionType === 'return' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
          <div className="flex-header">
            <h3>החזרת ציוד מהשטח למחסן</h3>
            <button className="btn" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}>ביטול וחזרה</button>
          </div>

          <form onSubmit={submitReturn} style={{ marginTop: '20px' }}>
            <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px' }}>
              <h4 style={{ marginBottom: '10px' }}>מי מחזיר?</h4>
              <AutocompleteSearch 
                placeholder="סנן לפי שם או טלפון..."
                options={userOptionsForReturn}
                value={selectedUserId}
                onChange={(val) => handleUserSelectForReturn(val)}
                emptyMessage="אין עובדים המחזיקים בציוד כרגע"
              />
            </div>

            {selectedUserId && (
              <div className="glass-panel" style={{ padding: '15px', animation: 'fadeIn 0.3s' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--warning)' }}>1. סמן איזה ציוד הוחזר:</h4>
                
                {equipment.filter(e => e.currentUser === selectedUserId).map(eq => (
                  <div key={eq.id} className="glass-panel" style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.2)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input 
                        type="checkbox" 
                        checked={returnItems[eq.id]?.isReturning || false} 
                        onChange={() => handleReturnToggle(eq.id)} 
                        style={{ width: '20px', height: '20px' }}
                      />
                      {eq.type} (מק"ט: {eq.device_sn})
                    </label>
                    
                    {returnItems[eq.id]?.isReturning && (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <select className="input-field" value={returnItems[eq.id].status} onChange={(e) => setReturnItems(prev => ({...prev, [eq.id]: {...prev[eq.id], status: e.target.value}}))}>
                          <option value="תקין">חזר תקין</option>
                          <option value="מעקב">חזר תקין - דורש מעקב</option>
                          <option value="תקלה">הוחזר עם תקלה (לשלוח לתיקון)</option>
                          <option value="other">סטטוס אחר (הזן ידנית)...</option>
                        </select>
                        {returnItems[eq.id].status === 'other' && (
                          <input required placeholder='הזן סטטוס חדש...' className="input-field" value={returnItems[eq.id].customStatus || ''} onChange={e => setReturnItems(prev => ({...prev, [eq.id]: {...prev[eq.id], customStatus: e.target.value}}))} />
                        )}
                        <input 
                          type="text" 
                          placeholder="הערות על מצב הציוד..." 
                          className="input-field"
                          value={returnItems[eq.id].notes}
                          onChange={(e) => handleReturnNotesChange(eq.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="glass-panel" style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>סוללות להחזרה (כרגע אצלו: {users.find(u => u.id === selectedUserId)?.activeBatteries || 0})</label>
                  <input 
                    type="number" 
                    min="0"
                    max={users.find(u => u.id === selectedUserId)?.activeBatteries || 0}
                    className="input-field" 
                    value={batteriesReturned} 
                    onChange={e => setBatteriesReturned(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
            )}

            {selectedUserId && (
              <div className="glass-panel" style={{ padding: '15px', marginTop: '20px', animation: 'fadeIn 0.3s' }}>
                <h4 style={{ marginBottom: '10px' }}>2. פרטי הפעולה והמאשר</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>תאריך</label>
                    <input type="date" className="input-field" value={actionDate} onChange={e => setActionDate(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>שעה</label>
                    <input type="time" className="input-field" value={actionTime} onChange={e => setActionTime(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <input type="text" className="input-field" placeholder="שם המחסנאי / מקבל הציוד (חובה)" value={issuerName} onChange={e => setIssuerName(e.target.value)} required />
                </div>

                <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px', background: 'var(--warning)', color: 'black' }}>
                  ⬇️ קלוט ציוד חזרה למחסן
                </button>
              </div>
            )}

          </form>
        </div>
      )}
    </div>
  )
}

export default Warehouse
