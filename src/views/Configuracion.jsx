import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { URL } from '../../url';

export default function Configuracion({ navigation, route }) {
  const { userRole, token } = useAuth();
  const role = userRole;
  const PASSWORD_REPRESENTATION = '********';

  // Datos iniciales del usuario
  const [userData, setUserData] = useState({
    nombre: 'Kuki Ramirez',
    usuario: 'Kuki',
    email: 'kuki@example.com',
    telefono: '+123 456 7890',
    genero: 'No especificado',
    password: PASSWORD_REPRESENTATION,
    livingState: '',
    profession: '',
    workPlace: ''
  });

  // Obtener datos del usuario actual
  const getUserData = async () => {
    try {
      const response = await axios.get(`${URL}/user/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const data = response.data.data;
        setUserData({
          nombre: `${data.name} ${data.lastname}`,
          email: data.email,
          telefono: data.cellphoneNumber,
          genero: data.gender,
          password: PASSWORD_REPRESENTATION,
          livingState: data.livingState,
          profession: data.profession,
          workPlace: data.workPlace
        });
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos del usuario'
      );
    }
  };

  // Llamar a getUserData cuando el componente se monta
  React.useEffect(() => {
    getUserData();
  }, []);

  // Estado para campos editables
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Validaciones
  const validateField = (field, value) => {
    switch (field) {
      case 'nombre':
        // Nombre: solo letras, espacios, longitud entre 2 y 50 caracteres
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(value)) {
          Alert.alert(
            'Nombre Inválido',
            'El nombre debe tener entre 2 y 50 caracteres y contener solo letras.'
          );
          return false;
        }
        break;

      case 'usuario':
        // Usuario: alfanumérico, sin espacios, entre 3 y 20 caracteres
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
          Alert.alert(
            'Nombre de Usuario Inválido',
            'El nombre de usuario debe tener entre 3 y 20 caracteres, sin espacios.'
          );
          return false;
        }
        break;

      case 'email':
        // Email: formato de correo electrónico válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          Alert.alert(
            'Correo Electrónico Inválido',
            'Por favor, ingrese un correo electrónico válido.'
          );
          return false;
        }
        break;

      case 'telefono':
        // Teléfono: formato internacional, solo números y símbolos permitidos
        const phoneRegex = /^[+\d\s()-]{10,20}$/;
        if (!phoneRegex.test(value)) {
          Alert.alert(
            'Teléfono Inválido',
            'Por favor, ingrese un número de teléfono válido.'
          );
          return false;
        }
        break;

      case 'genero':
        // Género: lista predefinida de opciones
        const generosValidos = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'];
        if (!generosValidos.includes(value)) {
          Alert.alert(
            'Género Inválido',
            'Por favor, seleccione un género válido.'
          );
          return false;
        }
        break;

      case 'password':
        // Contraseña: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(value)) {
          Alert.alert(
            'Contraseña Inválida',
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
          );
          return false;
        }
        break;
    }
    return true;
  };

  // Función para iniciar la edición de un campo
  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Función para guardar cambios
  const saveChanges = (field) => {
    // Validar el campo antes de guardar
    if (validateField(field, tempValue)) {
      setUserData(prev => ({
        ...prev,
        [field]: tempValue
      }));
      setEditingField(null);
    }
  };

  // Función para cancelar edición
  const cancelEditing = () => {
    setEditingField(null);
  };

  // Función para renderizar un campo editable
  const renderEditableField = (label, field, value, icon, isPassword = false, isGenero = false) => {
    return (
      <View style={styles.infoItem}>
        <Feather name={icon} size={20} color="#666" style={styles.infoIcon} />
        <View style={styles.fieldContainer}>
          <Text style={styles.infoLabel}>{label}</Text>

          {editingField === field ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={tempValue}
                onChangeText={setTempValue}
                secureTextEntry={isPassword}
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => saveChanges(field)} style={styles.actionButton}>
                  <Feather name="check" size={18} color="#28a745" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelEditing} style={styles.actionButton}>
                  <Feather name="x" size={18} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.infoValue}>
                {isPassword ? '••••••••' : value}
              </Text>
              <TouchableOpacity
                onPress={isGenero ? mostrarSelectorGenero : () => startEditing(field, value)}
                style={styles.editButton}
              >
                <Feather name="edit-2" size={16} color="#007bff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Función para guardar todos los cambios
  const guardarTodosLosCambios = () => {
    Alert.alert(
      'Guardar Cambios',
      '¿Estás seguro de que deseas guardar todos los cambios?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Guardar',
          onPress: async () => {
            // LLamado a la API para guardar los cambios
            try {
              const response = await axios.put(`${URL}/user/me`, {
                name: `${userData.nombre.split(' ')[0] || ''} ${userData.nombre.split(' ')[1] || ''}`,
                lastname: `${userData.nombre.split(' ')[2] || ''} ${userData.nombre.split(' ')[3] || ''}`,
                email: userData.email,
                cellphoneNumber: userData.telefono,
                gender: userData.genero,
                password: userData.password === PASSWORD_REPRESENTATION ? undefined : userData.password,
                livingState: userData.livingState,
                profession: userData.profession,
                workPlace: userData.workPlace
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
              }

              // Actualizar datos locales
              getUserData();
            } catch (error) {
              console.error('Error al actualizar datos:', error);
              Alert.alert(
                'Error',
                'No se pudieron actualizar los datos. Por favor intenta nuevamente.'
              );
              return;
            }
            Alert.alert(
              'Cambios Guardados',
              'La información de tu perfil ha sido actualizada exitosamente.'
            );
          }
        }
      ]
    );
  };

  // Función para mostrar selector de género
  const mostrarSelectorGenero = () => {
    Alert.alert(
      'Seleccionar Género',
      'Elige tu género',
      [
        {
          text: 'Masculino',
          onPress: () => {
            if (validateField('genero', 'Masculino')) {
              setUserData(prev => ({ ...prev, genero: 'Hombre' }));
            }
          }
        },
        {
          text: 'Femenino',
          onPress: () => {
            if (validateField('genero', 'Femenino')) {
              setUserData(prev => ({ ...prev, genero: 'Mujer' }));
            }
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenido */}
      <ScrollView style={styles.content}>
        {/* Sección de información personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          {renderEditableField('Nombre completo', 'nombre', userData.nombre, 'user')}
          {renderEditableField('Correo electrónico', 'email', userData.email, 'mail')}
          {userData.telefono && renderEditableField('Teléfono', 'telefono', userData.telefono, 'phone')}
          {userData.genero && renderEditableField('Género', 'genero', userData.genero, 'users', false, true)}
          {userData.livingState && renderEditableField('Estado de residencia', 'livingState', userData.livingState, 'map-pin')}
          {userData.profession && renderEditableField('Profesión', 'profession', userData.profession, 'briefcase')}
          {userData.workPlace && renderEditableField('Lugar de trabajo', 'workPlace', userData.workPlace, 'briefcase')}
        </View>

        {/* Sección de seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>

          {renderEditableField('Contraseña', 'password', userData.password, 'lock', true)}
        </View>

        {/* Botón para guardar cambios */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={guardarTodosLosCambios}
        >
          <Text style={styles.saveButtonText}>Guardar todos los cambios</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar role={role} navigation={navigation} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
    width: 25,
    marginTop: 5,
  },
  fieldContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
  },
  editContainer: {
    marginTop: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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