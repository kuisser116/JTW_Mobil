import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { USER_ROLES } from '../utils/USER_ROLES';
const BottomNavBar = ({ role }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screen) => route.name === screen;

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Feather 
          name="user" 
          size={24} 
          color={isActive('Perfil') ? "#007bff" : "#666"} 
        />
        {isActive('Perfil') && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate(role === USER_ROLES.PARTICIPANT ? 'Eventos' : 'Checador')}
      >
        <Feather 
          name="calendar" 
          size={24} 
          color={
            (role === USER_ROLES.PARTICIPANT && isActive('Eventos'&& 'Talleres')) || 
            (role === USER_ROLES.SUPERVISOR && isActive('Checador'&&'TalleresChecador')) 
            ? "#007bff" : "#666"} 
        />
        {((role === USER_ROLES.PARTICIPANT && isActive('Eventos')) || 
          (role === USER_ROLES.SUPERVISOR && isActive('Checador'))) && 
          <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate(role === USER_ROLES.PARTICIPANT ? 'EventosTotales' : 'EscanerQR')}
      >
        <Feather 
          name={role === USER_ROLES.PARTICIPANT ? "briefcase" : "camera"}
          size={24} 
          color={isActive(role === USER_ROLES.PARTICIPANT ? 'EventosTotales' : 'EscanerQR') ? "#007bff" : "#666"} 
        />
        {isActive(role === USER_ROLES.PARTICIPANT ? 'EventosTotales' : 'EscanerQR') && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Configuracion')}
      >
        <Feather 
          name="settings" 
          size={24} 
          color={isActive('Configuracion') ? "#007bff" : "#666"} 
        />
        {isActive('Configuracion') && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007bff',
    marginTop: 4,
  },
};

export default BottomNavBar;