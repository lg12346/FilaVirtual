import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicDisplay from './pages/PublicDisplay';
import { AuthContext } from './context/AuthContext';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sessão ao carregar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/public" element={<PublicDisplay />} />
          <Route
            path="/user"
            element={user && user.role === 'user' ? <UserDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/user" />) : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
