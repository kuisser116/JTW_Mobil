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
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { URL } from '../../url';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function EventosTotales({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { userRole, token } = useAuth();
  const role = userRole;
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
  
  console.log("Role in EventosTotales: ", role);

  useEffect(() => {
    obtenerEventos();
  }, []);

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

  const obtenerEventos = async () => {
    try {
      const response = await fetch(`${URL}/event/all-events`);
      if (!response.ok) {
        throw new Error('Error al obtener los eventos');
      }
      const data = await response.json();
      console.log('=== DETALLES DEL EVENTO ===');
      if (data && data.data && Array.isArray(data.data)) {
        data.data.forEach((evento, index) => {
          console.log(`\nEvento ${index + 1}:`);
          console.log('ID:', evento._id);
          console.log('Nombre:', evento.name);
          console.log('Descripción:', evento.description);
          console.log('Fecha de inicio:', new Date(evento.startDate).toLocaleString());
          console.log('Fecha de fin:', new Date(evento.endDate).toLocaleString());
          console.log('Imagen principal:', evento.mainImg);
          console.log('Imágenes del banner:', evento.bannerImgs);
          console.log('Participantes:', evento.participants);
          console.log('------------------------');
        });

        setEventos(data.data);
        setEventosFiltrados(data.data);
      } else {
        console.log('No se encontraron eventos o el formato es incorrecto');
        setEventos([]);
        setEventosFiltrados([]);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const filtrarEventos = (texto) => {
    setBusqueda(texto);
    if (texto) {
      const filtrados = eventos.filter(evento => 
        evento?.name?.toLowerCase().includes(texto.toLowerCase())       );
      setEventosFiltrados(filtrados);
    } else {
      setEventosFiltrados(eventos);
    }
  };

  const irAPerfil = () => {
    navigation.navigate('Perfil');
  };

  // Función corregida para pasar el parámetro como eventId en lugar de eventoId
  const irATalleres = (eventoId, eventoNombre) => {
    navigation.navigate('Talleres', { 
      eventId: eventoId,  // Cambiado de eventoId a eventId
      eventoNombre: eventoNombre 
    });
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      <Text style={styles.title}>Eventos Totales</Text>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos"
          value={busqueda}
          onChangeText={filtrarEventos}
          placeholderTextColor="#888"
        />
      </View>
      
      {/* Lista de eventos */}
      <ScrollView style={styles.eventosContainer}>
        {Array.isArray(eventosFiltrados) && eventosFiltrados.map(evento => (
          <View key={evento._id} style={styles.eventoCard}>
            {/* Título del evento en la parte superior de la imagen */}
            <View style={styles.eventoTituloContainer}>
              <Text style={styles.eventoTitulo}>{evento.name}</Text>
            </View>

            {/* Imagen del evento (clickeable para ir a talleres) */}
            <TouchableOpacity 
              onPress={() => irATalleres(evento._id, evento.name)}
            >
              <Image 
                source={{ uri: `${URL}/event/image?filename=${evento.mainImg}` || 'https://via.placeholder.com/300x150' }} 
                style={styles.eventoImagen} 
                resizeMode="cover"
              />
            </TouchableOpacity>
            
            {/* Información adicional del evento */}
            <View style={styles.eventoDetalles}>
              <Text style={styles.eventoFecha}>
                {new Date(evento.startDate).toLocaleDateString()} - {new Date(evento.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.eventoDescripcion}>{evento.description}</Text>
              <Text style={styles.participantesInfo}>
                Participantes: {evento.participants ? evento.participants.length : 0}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
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
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#333' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: 'red', 
    textAlign: 'center' 
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
  eventoDetalles: {
    padding: 15,
  },
  eventoFecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventoDescripcion: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  participantesInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});