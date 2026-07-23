import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  
  // Auth & Roles
  const [authUser, setAuthUser] = useState(null);
  const [appRole, setAppRole] = useState(null); // 'admin', 'editor', 'viewer'
  const [authLoading, setAuthLoading] = useState(true);
  const [loggedUserDoc, setLoggedUserDoc] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setAppRole(null);
        setLoggedUserDoc(null);
        setAuthLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
      if (authUser) {
        const foundUser = usersData.find(u => u.email === authUser.email);
        if (foundUser) {
          setAppRole(foundUser.appRole || 'viewer');
          setLoggedUserDoc(foundUser);
        } else {
          // First time this user logs in
          const hasAdmin = usersData.some(u => u.appRole === 'admin');
          const initialRole = !hasAdmin ? 'admin' : 'viewer';
          const isSuperAdmin = !hasAdmin; // The very first admin gets superAdmin powers
          
          const newUserId = `u${Date.now()}`;
          const newUserDoc = {
            name: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown',
            email: authUser.email || '',
            phone: authUser.phoneNumber || '',
            role: 'משתמש אפליקציה',
            appRole: initialRole,
            isSuperAdmin: isSuperAdmin,
            allowedPages: initialRole === 'admin' ? ['dashboard', 'warehouse', 'users', 'history', 'settings'] : ['dashboard'],
            department: '',
            isActive: true,
            activeBatteries: 0,
            onboarded: false // Force them to fill phone/role on first login
          };
          setDoc(doc(db, 'users', newUserId), newUserDoc);
          setAppRole(initialRole);
          setLoggedUserDoc({ id: newUserId, ...newUserDoc });
        }
        setAuthLoading(false);
      }
    });

    const unsubEq = onSnapshot(collection(db, 'equipment'), (snapshot) => {
      setEquipment(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubHist = onSnapshot(collection(db, 'history'), (snapshot) => {
      const histData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      histData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(histData);
      setIsDbLoading(false);
    });

    return () => {
      unsubUsers();
      unsubEq();
      unsubHist();
    };
  }, [authUser]);

  const logout = () => {
    signOut(auth);
  };

  const addUser = async (user) => {
    const newId = `u${Date.now()}`;
    await setDoc(doc(db, 'users', newId), { 
      ...user, 
      activeBatteries: 0, 
      appRole: user.appRole || 'viewer',
      allowedPages: user.appRole === 'admin' ? ['dashboard', 'warehouse', 'users', 'history', 'settings'] : ['dashboard']
    });
  };

  const updateUser = async (updatedUser) => {
    const { id, ...data } = updatedUser;
    await updateDoc(doc(db, 'users', id), data);
  };

  const addEquipment = async (eq) => {
    const newEqId = `e${Date.now()}`;
    await setDoc(doc(db, 'equipment', newEqId), { ...eq });
    
    const now = new Date();
    await addHistoryEvent({
      date: now.toLocaleDateString('he-IL'),
      time: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      device_sn: eq.device_sn,
      employee: 'מנהל מערכת',
      event: `קליטת ציוד חדש למלאי - ${eq.type}`,
      details: `נרשם במערכת בסטטוס: ${eq.status}. ${eq.notes ? 'הערות: ' + eq.notes : ''}`
    });
  };

  const updateEquipment = async (updatedEq) => {
    const { id, ...data } = updatedEq;
    await updateDoc(doc(db, 'equipment', id), data);
  };

  const addHistoryEvent = async (event) => {
    const newId = `h${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, 'history', newId), { 
      ...event, 
      timestamp: Date.now() 
    });
  };

  const checkoutEquipment = async (deviceId, userId, notes, batteriesTaken = 0, manualDate = null, manualTime = null, checkoutStatus = 'תקין', issuer = 'לא צוין') => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === userId);
    const now = new Date();
    
    let dateStr = manualDate || now.toLocaleDateString('he-IL');
    if (manualDate && manualDate.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const timeStr = manualTime || now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    await updateDoc(doc(db, 'equipment', deviceId), {
      currentUser: userId,
      status: checkoutStatus,
      notes: notes || eq.notes || ''
    });
    
    if (batteriesTaken > 0 && user) {
      await updateDoc(doc(db, 'users', userId), {
        activeBatteries: (user.activeBatteries || 0) + batteriesTaken
      });
    }
    
    await addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user ? user.name : 'לא ידוע',
      event: `משיכת ציוד - ${eq.type}`,
      details: `נלקח (סטטוס: ${checkoutStatus}). ${notes ? 'הערות: ' + notes : ''} ${batteriesTaken > 0 ? `(כולל ${batteriesTaken} סוללות)` : ''}. אושר ע"י: ${issuer}`
    });
  };

  const returnEquipment = async (deviceId, status, notes, batteriesReturned = 0, manualDate = null, manualTime = null, issuer = 'לא צוין') => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === eq.currentUser);
    const now = new Date();
    
    let dateStr = manualDate || now.toLocaleDateString('he-IL');
    if (manualDate && manualDate.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const timeStr = manualTime || now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    await updateDoc(doc(db, 'equipment', deviceId), {
      currentUser: null,
      status: status || eq.status,
      notes: notes || eq.notes || ''
    });
    
    if (user && batteriesReturned > 0) {
      await updateDoc(doc(db, 'users', user.id), {
        activeBatteries: Math.max(0, (user.activeBatteries || 0) - batteriesReturned)
      });
    }
    
    await addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user ? user.name : 'לא ידוע',
      event: `החזרת ${eq.type} - ${status}`,
      details: `${notes || ''} ${batteriesReturned > 0 ? `(הוחזרו ${batteriesReturned} סוללות)` : ''}. נמסר ל: ${issuer}`
    });
  };

  const seedDatabase = async () => {};

  return (
    <AppContext.Provider value={{
      users, equipment, history, isDbLoading,
      authUser, appRole, authLoading, logout, loggedUserDoc,
      addUser, updateUser, addEquipment, updateEquipment, checkoutEquipment, returnEquipment, seedDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
