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
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { URL } from '../../url';
import axios from 'axios';

export default function Eventos({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole, token } = useAuth();
  const role = userRole;
  console.log("Role in Eventos: ", role);

  // Función para obtener los eventos desde la API
  const obtenerEventos = async () => {
    try {
      const response = await fetch(`${URL}/participant/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await response.json();
      console.log(json);
      // Transformar los datos al formato necesario
      const eventosFormateados = json.data.map(item => ({
        id: item.eventId,
        titulo: item.eventName,
        qrCode: item.qrRepresentation,
        folio: item.folio,
        workshops: item.workshops,
        img: item.eventImg
      }));
      
      setEventos(eventosFormateados);
      setEventosFiltrados(eventosFormateados);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar eventos cuando el componente se monta
  useEffect(() => {
    obtenerEventos();
  }, []);

  // Función para filtrar eventos basados en la búsqueda
  const filtrarEventos = (texto) => {
    setBusqueda(texto);
    if (texto) {
      const filtrados = eventos.filter(
        (evento) => evento.titulo.toLowerCase().includes(texto.toLowerCase())
      );
      setEventosFiltrados(filtrados);
    } else {
      setEventosFiltrados(eventos);
    }
  };

  // Función para mostrar QR
  const mostrarQR = (eventoId) => {
    setSelectedEventId(eventoId);
    setQrModalVisible(true);
  };

  // Función para navegar al perfil de usuario
  const irAPerfil = () => {
    navigation.navigate('Perfil');
  };

  // Función para navegar a la pantalla de talleres
  const irATalleres = (eventoId, eventoNombre) => {
    navigation.navigate('Talleres', {
      eventId: eventoId,
      eventoNombre: eventoNombre
    });
  };

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
      <Text style={styles.title}>Eventos</Text>
      
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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView style={styles.eventosContainer}>
          {eventosFiltrados.map((evento) => (
            <View key={evento.id} style={styles.eventoCard}>
              {/* Título del evento en la parte superior de la imagen */}
              <View style={styles.eventoTituloContainer}>
                <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
              </View>

              {/* Imagen del evento (clickeable para ir a talleres) */}
              <TouchableOpacity 
                onPress={() => irATalleres(evento.id, evento.titulo)}
              >
                <Image 
                  source={{ uri: `${URL}/event/image?filename=${evento.img}` }} 
                  style={styles.eventoImagen} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
              
              {/* Icono QR con folio */}
              <View style={styles.qrAndFolioContainer}>
                <Text style={styles.folioText}>Folio: {evento.folio}</Text>
                <TouchableOpacity 
                  style={styles.qrIconContainer}
                  onPress={() => mostrarQR(evento.id)}
                >
                  <Feather name="grid" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      
      {/* Modal para mostrar QR Code */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEventId && (
              <Image 
                source={{ uri: eventos.find(e => e.id === selectedEventId)?.qrCode }} 
                style={styles.qrCodeFullSize} 
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <BottomNavBar role={role} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  qrAndFolioContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  folioText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
    marginRight: 5,
  },
  qrIconContainer: {
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
});