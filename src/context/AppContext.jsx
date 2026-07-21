import React, { createContext, useState, useContext } from 'react';
import mockData from '../mockData.json';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Add new fields to mock data if they don't exist
  const initialUsers = mockData.users.map(u => ({
    ...u,
    email: u.email || `${u.id}@quicktrace.local`,
    role: u.role || (u.id === 'u1' ? 'אדמין' : 'וטרינר'),
    isActive: u.isActive !== undefined ? u.isActive : true,
    department: u.department || 'כללי'
  }));

  const initialEq = mockData.equipment.map(e => ({
    ...e,
    purchaseDate: e.purchaseDate || '2023-01-01',
    warrantyExpiry: e.warrantyExpiry || '2025-01-01',
    nextCalibration: e.nextCalibration || '2026-12-01'
  }));

  const [users, setUsers] = useState(initialUsers);
  const [equipment, setEquipment] = useState(initialEq);
  const [history, setHistory] = useState(mockData.history);
  
  // App Role (Admin or User)
  const [appRole, setAppRole] = useState('admin'); 

  const addUser = (user) => {
    setUsers([...users, { ...user, id: `u${Date.now()}` }]);
  };

  const addEquipment = (eq) => {
    setEquipment([...equipment, { ...eq, id: `e${Date.now()}` }]);
  };

  const addHistoryEvent = (event) => {
    setHistory([{ ...event, id: `h${Date.now()}` }, ...history]);
  };

  const checkoutEquipment = (deviceId, userId, notes) => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === userId);
    const now = new Date();
    const dateStr = now.toLocaleDateString('he-IL');
    const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Update equipment
    setEquipment(equipment.map(e => e.id === deviceId ? { ...e, currentUser: userId, status: 'תקין', notes } : e));
    
    // Add history
    addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user.name,
      event: 'קליטת ציוד (לקיחה)',
      details: notes || 'נלקח לשימוש'
    });
  };

  const returnEquipment = (deviceId, status, notes) => {
    const eq = equipment.find(e => e.id === deviceId);
    const user = users.find(u => u.id === eq.currentUser);
    const now = new Date();
    const dateStr = now.toLocaleDateString('he-IL');
    const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Update equipment
    setEquipment(equipment.map(e => e.id === deviceId ? { ...e, currentUser: null, status, notes } : e));
    
    // Add history
    addHistoryEvent({
      date: dateStr,
      time: timeStr,
      device_sn: eq.device_sn,
      employee: user ? user.name : 'לא ידוע',
      event: `החזרת ציוד - ${status}`,
      details: notes
    });
  };

  return (
    <AppContext.Provider value={{
      users, equipment, history, appRole, setAppRole,
      addUser, addEquipment, addHistoryEvent, checkoutEquipment, returnEquipment
    }}>
      {children}
    </AppContext.Provider>
  );
};
