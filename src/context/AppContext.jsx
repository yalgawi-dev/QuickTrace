import React, { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../data/mockData.json';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [history, setHistory] = useState([]);
  const [appRole, setAppRole] = useState('admin');

  // Load initial mock data, but structure it for the new architecture
  useEffect(() => {
    setUsers(mockData.users.map(u => ({ ...u, activeBatteries: 0 })));
    
    // Convert old mock equipment to new format (independent goggles)
    const newEqList = [];
    mockData.equipment.forEach(eq => {
      newEqList.push({
        id: eq.id,
        type: eq.type,
        device_sn: eq.device_sn,
        status: eq.status,
        notes: eq.notes,
        purchaseDate: eq.purchaseDate || '',
        warrantyExpiry: eq.warrantyExpiry || '',
        nextCalibration: eq.nextCalibration || '',
        currentUser: eq.currentUser
      });
      // If the old mock had a goggle attached, split it into a separate item
      if (eq.goggles_sn) {
        newEqList.push({
          id: `g_${eq.id}`,
          type: 'משקף',
          device_sn: eq.goggles_sn,
          status: 'תקין',
          notes: '',
          purchaseDate: '',
          warrantyExpiry: '',
          nextCalibration: '',
          currentUser: eq.currentUser
        });
      }
    });

    setEquipment(newEqList);
    setHistory(mockData.history);
  }, []);

  const toggleRole = () => {
    setAppRole(prev => prev === 'admin' ? 'user' : 'admin');
  };

  const addUser = (user) => {
    setUsers([...users, { ...user, id: `u${Date.now()}`, activeBatteries: 0 }]);
  };

  const addEquipment = (eq) => {
    setEquipment([...equipment, { ...eq, id: `e${Date.now()}` }]);
  };

  const updateEquipment = (updatedEq) => {
    setEquipment(equipment.map(e => e.id === updatedEq.id ? updatedEq : e));
  };

  const addHistoryEvent = (event) => {
    setHistory([{ ...event, id: `h${Date.now()}` }, ...history]);
  };

  // Updates checkout to take batteries amount and add it to the user
  const checkoutEquipment = (deviceId, userId, notes, batteriesTaken = 0, manualDate = null, manualTime = null) => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === userId);
    const now = new Date();
    
    let dateStr = manualDate || now.toLocaleDateString('he-IL');
    if (manualDate && manualDate.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const timeStr = manualTime || now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Update equipment
    setEquipment(equipment.map(e => e.id === deviceId ? { ...e, currentUser: userId, status: 'תקין', notes } : e));
    
    // Update user batteries
    if (batteriesTaken > 0) {
      setUsers(users.map(u => u.id === userId ? { ...u, activeBatteries: (u.activeBatteries || 0) + batteriesTaken } : u));
    }
    
    // Add history
    addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user.name,
      event: `קליטת ציוד - ${eq.type}`,
      details: `${notes || 'נלקח לשימוש'}${batteriesTaken > 0 ? ` (כולל ${batteriesTaken} סוללות)` : ''}`
    });
  };

  const returnEquipment = (deviceId, status, notes, batteriesReturned = 0, manualDate = null, manualTime = null) => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === eq.currentUser);
    const now = new Date();
    
    let dateStr = manualDate || now.toLocaleDateString('he-IL');
    if (manualDate && manualDate.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const timeStr = manualTime || now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Update equipment
    setEquipment(equipment.map(e => e.id === deviceId ? { ...e, currentUser: null, status, notes } : e));
    
    // Update user batteries
    if (user && batteriesReturned > 0) {
      setUsers(users.map(u => u.id === user.id ? { ...u, activeBatteries: Math.max(0, (u.activeBatteries || 0) - batteriesReturned) } : u));
    }
    
    // Add history
    addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user ? user.name : 'לא ידוע',
      event: `החזרת ${eq.type} - ${status}`,
      details: `${notes}${batteriesReturned > 0 ? ` (הוחזרו ${batteriesReturned} סוללות)` : ''}`
    });
  };

  return (
    <AppContext.Provider value={{
      users, equipment, history, appRole,
      toggleRole, addUser, addEquipment, updateEquipment, checkoutEquipment, returnEquipment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
