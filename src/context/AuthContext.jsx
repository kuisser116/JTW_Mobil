import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = (newToken, role, id) => {
    setToken(newToken);
    setUserRole(role);
    setUserId(id);
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};