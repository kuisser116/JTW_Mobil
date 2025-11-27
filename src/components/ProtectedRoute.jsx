import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, userRole } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (!token) {
      // Si no hay token, redirigir al inicio
      navigation.replace('Inicio');
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      // Si el rol no está permitido, redirigir según el rol
      if (userRole === 'Checador') {
        navigation.replace('Checador');
      } else {
        navigation.replace('Eventos');
      }
    }
  }, [token, userRole, navigation, allowedRoles]);

  if (!token || !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default ProtectedRoute; 