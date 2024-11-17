import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthPage from './components/auth/AuthPage';
import { getUserDB, mainDB } from './lib/db';

interface User {
  id: number;
  email: string;
  name: string;
  dbName: string;
  role: 'admin' | 'user';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userDB, setUserDB] = useState<ReturnType<typeof getUserDB> | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setUserDB(getUserDB(parsedUser.dbName));
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    setUserDB(getUserDB(user.dbName));
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    setUserDB(null);
    localStorage.removeItem('user');
  };

  if (!user || !userDB) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return user.role === 'admin' ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <Dashboard user={user} userDB={userDB} onLogout={handleLogout} />
  );
}

export default App;