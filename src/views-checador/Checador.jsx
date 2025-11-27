import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import BottomNavBar from '../ui-components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { URL } from '../../url';



// Datos de ejemplo para los eventos
const eventosData = [
  {
    id: '1',
    titulo: 'Festival Gamer',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREr91RA_hKOdNf03k9rPGkv50_wGJ5e-QNqQ&s',
    fecha: '15 de Abril, 2025',
  },
  {
    id: '2',
    titulo: 'Competencia de Natación',
    imagen: 'https://cdn.shopify.com/s/files/1/0512/7641/5146/files/nadadores-competencia-lanzandose_1.jpg?v=1717258328',
    fecha: '22 de Abril, 2025',
  },
  {
    id: '3',
    titulo: 'Aventura Espacial',
    imagen: 'https://www.diako.com.mx/cdn/shop/files/ppnnuevsos-03.jpg?v=1692993709',
    fecha: '30 de Abril, 2025',
  },
];

export default function Checador({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const [eventosFiltrados, setEventosFiltrados] = useState(eventosData);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { userRole, token } = useAuth();
  const role = userRole;
  console.log("Role in Checador: ", role);

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


  // Solicitar permisos de cámara
  useEffect(() => {
    (async () => {
      const { status } = await CameraView.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Obtener los eventos del checador
    (async () => {
      console.log("Token: ", token);
      const response = await axios.get(`${URL}/event/supervisor/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Response: ", response);
      const data = response.data.data;
      console.log(data);
      setEventosFiltrados(data || []);
    })();
  }, []);

  // Función para manejar el escaneo de códigos QR
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setIsCameraModalVisible(false);

    // Ejemplo de procesamiento del código QR
    if (data.startsWith('evento-')) {
      const eventoId = data.split('-')[1];

      Alert.alert(
        'Código QR Escaneado',
        `ID de Evento: ${eventoId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Puedes agregar lógica adicional aquí, como registrar la asistencia
              setScanned(false);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Código QR Inválido',
        'El código QR escaneado no es un evento válido.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  // Función para filtrar eventos basados en la búsqueda
  const filtrarEventos = (texto) => {
    setBusqueda(texto);
    if (texto) {
      const filtrados = eventosData.filter(
        (evento) => evento.titulo.toLowerCase().includes(texto.toLowerCase())
      );
      setEventosFiltrados(filtrados);
    } else {
      setEventosFiltrados(eventosData);
    }
  };

  // Función para navegar al perfil de usuario
  const irAPerfil = () => {
    navigation.navigate('Perfil');
  };

  // Función para navegar a configuración
  const irAConfiguracion = () => {
    navigation.navigate('Configuracion');
  };

  // Función para abrir la cámara
  const abrirCamara = () => {
    setIsCameraModalVisible(true);
  };

  // Renderizar contenido de la cámara
  const renderCameraModal = () => {
    if (hasPermission === null) {
      return <Text>Solicitando permiso de cámara...</Text>;
    }
    if (hasPermission === false) {
      return <Text>Sin acceso a la cámara</Text>;
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={!scanned ? handleBarCodeScanned : undefined}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>

        <TouchableOpacity
          style={styles.closeCameraButton}
          onPress={() => setIsCameraModalVisible(false)}
        >
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>
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

      {/* Header con nombre de usuario */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userContainer}
          onPress={irAPerfil}
        >

          <Text style={styles.userName}>{userData.name}</Text>
        </TouchableOpacity>
      </View>

      {/* Título de la página */}
      <Text style={styles.title}>Eventos Disponibles</Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          value={busqueda}
          onChangeText={filtrarEventos}
          placeholderTextColor="#888"
        />
      </View>

      {/* Lista de eventos */}
      <ScrollView style={styles.eventosContainer}>
        {eventosFiltrados.map((evento, index) => (
          <View key={index} style={styles.eventoCard}>
            {/* Título del evento en la parte superior de la imagen */}
            <View style={styles.eventoTituloContainer}>
              <Text style={styles.eventoTitulo}>{evento.name}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('TalleresChecador', {
                eventoId: evento._id,
                eventoNombre: evento.name
              })}
            >
              <Image
                source={{ uri: `${URL}/event/image?filename=${evento.mainImg}` }}
                style={styles.eventoImagen}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal de la cámara */}
      <Modal
        visible={isCameraModalVisible}
        transparent={true}
        animationType="slide"
      >
        {renderCameraModal()}
      </Modal>



      <BottomNavBar role={role} navigation={navigation} />



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (previous styles remain the same)
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: 'transparent',
  },
  closeCameraButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  userName: {
    color: '#fff',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  eventosContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventoCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eventoTituloContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  eventoTitulo: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  eventoImagen: {
    width: '100%',
    height: 150,
  },
  qrIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    position: 'relative',
  },
  qrCodeFullSize: {
    width: 250,
    height: 250,
  },
  loadingQR: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
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