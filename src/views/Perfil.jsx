import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { URL } from '../../url';

export default function Perfil({ navigation }) {
  const { userRole } = useAuth();
  const role = userRole;
  const { token, logout } = useAuth();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    cellphoneNumber: '',
    gender: '',
    birthday: '',
    livingState: '',
    profession: '',
    workPlace: ''
  });
  console.log("Role in Perfil: ", role);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Mostrar confirmación antes de cerrar sesión
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            // Aquí puedes agregar lógica adicional de cierre de sesión
            // Como limpiar tokens, estado de autenticación, etc.
            logout();
            // Navegar a la pantalla de Inicio
            Alert.alert(
              'Sesión Cerrada',
              'Has cerrado sesión exitosamente',
              [{
                text: 'OK',
                onPress: () => navigation.navigate('Inicio')
              }]
            );
          }
        }
      ]
    );
  };

  // Funcion para obtener los datos del usuario
  useEffect(() => {
    axios.get(`${URL}/user/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      console.log(response.data);
      setUserData(response.data.data);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Información del perfil */}
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Text style={styles.username}>{userData.name} {userData.lastname}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Secciones del perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          {/* Teléfono */}
          {
            userData.cellphoneNumber && <View style={styles.infoItem}>
              <Feather name="phone" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{userData.cellphoneNumber}</Text>
              </View>
            </View>
          }

          {/* Género */}
          {
            userData.gender && <View style={styles.infoItem}>
              <Feather name="users" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Género</Text>
                <Text style={styles.infoValue}>{userData.gender}</Text>
              </View>
            </View>
          }

          {/* Cumpleaños */}
          {
            userData.birthday && <View style={styles.infoItem}>
              <Feather name="calendar" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Cumpleaños</Text>
                <Text style={styles.infoValue}>{userData.birthday}</Text>
              </View>
            </View>
          }

          {/* Estado de residencia */}
          {
            userData.livingState && <View style={styles.infoItem}>
              <Feather name="map-pin" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Estado de residencia</Text>
                <Text style={styles.infoValue}>{userData.livingState}</Text>
              </View>
            </View>
          }

          {/* Profesión */}
          {
            userData.profession && <View style={styles.infoItem}>
              <Feather name="briefcase" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Profesión</Text>
                <Text style={styles.infoValue}>{userData.profession}</Text>
              </View>
            </View>
          }

          {/* Lugar de trabajo */}
          {
            userData.workPlace && <View style={styles.infoItem}>
              <Feather name="briefcase" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Lugar de trabajo</Text>
                <Text style={styles.infoValue}>{userData.workPlace}</Text>
              </View>
            </View>
          }

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <Text style={styles.editProfileText}>Editar información</Text>
            <Feather name="edit-2" size={16} color="#007bff" />
          </TouchableOpacity>

          {/* Nuevo botón de Cerrar Sesión */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="#dc3545" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNavBar role={role} navigation={navigation} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 15,
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
    width: 25,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  eventCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 5,
  },
  activeNavItem: {
    alignItems: 'center',
  },
  activeIndicator: {
    height: 3,
    width: 20,
    backgroundColor: '#007bff',
    borderRadius: 1.5,
    marginTop: 5,
  },
});