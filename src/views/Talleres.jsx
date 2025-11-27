import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { URL } from '../../url';
import { useAuth } from '../context/AuthContext';
import formattDates from '../utils/formattDates';


export default function Talleres({ navigation, route }) {
  const [busqueda, setBusqueda] = useState('');
  const [talleres, setTalleres] = useState([]);
  const [talleresFiltrados, setTalleresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const { userRole, token, userId } = useAuth();
  const role = userRole;

  // Obtener el nombre del evento y eventId desde la navegación (si está disponible)
  const eventoNombre = route.params?.eventoNombre || 'Talleres';
  const eventId = route.params?.eventId || '';

  // Función para verificar si el usuario está inscrito en un taller
  const verificarInscripcion = async (talleres) => {
    try {
      console.log('Verificando inscripciones...');
      console.log('Token:', token);
      
      const response = await fetch(`${URL}/workshop/participant`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        throw new Error('Error al verificar inscripciones');
      }

      const responseData = await response.json();
      console.log('Respuesta completa de verificación:', responseData);

      // Verificar si data existe y es un array
      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('La respuesta no tiene la estructura esperada:', responseData);
        return talleres;
      }

      // Obtener los IDs de los talleres en los que el usuario está inscrito
      const talleresInscritos = responseData.data.map(t => t._id);
      console.log('Talleres inscritos:', talleresInscritos);

      // Actualizar el estado de inscripción para cada taller
      const talleresActualizados = talleres.map(taller => {
        const estaInscrito = talleresInscritos.includes(taller.id);
        const participantes = Array.isArray(taller.participants) ? taller.participants : [];
        console.log(`Taller ${taller.id} - Inscrito: ${estaInscrito} - Participantes: ${participantes.length}`);
        
        return {
          ...taller,
          inscrito: estaInscrito,
          cupoActual: participantes.length,
          participants: participantes
        };
      });

      return talleresActualizados;
    } catch (err) {
      console.error('Error al verificar inscripciones:', err);
      return talleres;
    }
  };

  // Cargar talleres y participante desde la API
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setLoading(false);
        setError('No se proporcionó ID del evento');
        return;
      }

      setLoading(true);
      setError(null);
      
      let participantData = null;

      try {
        // 1. Fetch Participant Data First
        console.log('Fetching participant data...');
        const participantResponse = await fetch(`${URL}/user/me`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          } 
        });
        if (!participantResponse.ok) {
          const errorText = await participantResponse.text();
          console.error('Error fetching participant:', participantResponse.status, errorText);
          throw new Error('No se pudieron cargar los datos del participante');
        }
        const participantResult = await participantResponse.json();
        participantData = participantResult.data;
        console.log("Participant fetched:", participantData);

        // 2. Fetch Workshop Data
        console.log('Fetching workshops for event ID:', eventId);
        const talleresResponse = await fetch(`${URL}/workshop/event/${eventId}`);
        
        if (!talleresResponse.ok) {
          throw new Error('No se pudieron cargar los talleres');
        }
        
        const talleresResult = await talleresResponse.json();
        console.log('Workshop data received:', talleresResult);
        
        // 3. Process Workshops (Format and Find Folio)
        if (!talleresResult.data || !Array.isArray(talleresResult.data)) {
          console.error('La respuesta de talleres no tiene la estructura esperada:', talleresResult);
          throw new Error('Formato de datos de talleres inesperado.');
        }

        const talleresFormateados = talleresResult.data.map(taller => {
          const participantes = Array.isArray(taller.participants) ? taller.participants : [];
          let folio = null;

          // Find folio using participantData (now guaranteed to be available)
          if (participantData?.QRs && Array.isArray(participantData.QRs)) {
            participantData.QRs.forEach((qr) => {
              if (qr.workshops && Array.isArray(qr.workshops)) {
                qr.workshops.forEach((workshop) => {
                  console.log("Comparing workshop:", workshop.workshopId, "with taller:", taller._id);
                  if(workshop.workshopId === taller._id){
                    console.log("Folio found for taller", taller._id, ":", workshop.folio);
                    folio = workshop.folio;
                  }
                });
              }
            });
          } else {
            console.log("Participant data or QRs not available for folio lookup");
          }

          console.log("Taller fecha-------------------------------------", taller.startDate);
          

          return {
            id: taller._id,
            nombreTaller: taller.name,
            descripcion: taller.description,
            fecha: taller.startDate,
            hora: formatearHora(taller.startDate),
            cupo: taller.limitQuota,
            cupoActual: participantes.length,
            inscrito: false, // Initial state, will be updated by verificarInscripcion
            instructor: taller.instructor,
            img: taller.img,
            participants: participantes,
            folio: folio
          };
        });
        
        // 4. Verify Enrollment Status
        const talleresConInscripcion = await verificarInscripcion(talleresFormateados);
        
        // 5. Update State
        setTalleres(talleresConInscripcion);
        setTalleresFiltrados(talleresConInscripcion);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [eventId, token]); // Keep dependencies: fetch when eventId or token changes

  // Función para formatear fecha de ISO a formato legible
  const formatearFecha = (fechaISO) => {
    try {
      const fecha = new Date(fechaISO);
      return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    } catch (err) {
      return 'Fecha no disponible';
    }
  };

  // Función para formatear hora de ISO a formato legible
  const formatearHora = (fechaISO) => {
    try {
      const fecha = new Date(fechaISO);
      let horas = fecha.getHours();
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      const periodo = horas >= 12 ? 'PM' : 'AM';
      horas = horas % 12;
      horas = horas ? horas : 12; // si es 0, mostrar como 12
      return `${horas}:${minutos} ${periodo}`;
    } catch (err) {
      return 'Hora no disponible';
    }
  };

  // Función para filtrar talleres basados en la búsqueda
  const filtrarTalleres = (texto) => {
    setBusqueda(texto);
    if (texto) {
      const filtrados = talleres.filter(
        (taller) => 
          taller.nombreTaller.toLowerCase().includes(texto.toLowerCase()) ||
          taller.descripcion.toLowerCase().includes(texto.toLowerCase())
      );
      setTalleresFiltrados(filtrados);
    } else {
      setTalleresFiltrados(talleres);
    }
  };

  // Función para inscribirse en un taller
  const inscribirseEnTaller = async (tallerId) => {
    setProcessingAction(true);
    try {
      const response = await fetch(`${URL}/workshop/add-participant/${tallerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.data || 'Error al registrarse en el taller');
      }

      // Re-fetch participant data to get the updated QRs/folio
      console.log('Re-fetching participant data after registration...');
      const participantResponse = await fetch(`${URL}/user/me`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        } 
      });
      if (!participantResponse.ok) {
        console.error('Error re-fetching participant after registration');
        // Continue with local update, but folio might be stale
      }
      const participantResult = await participantResponse.json();
      const updatedParticipantData = participantResult.data;
      console.log("Updated participant data:", updatedParticipantData);

      // Find the new folio for this workshop
      let newFolio = null;
      if (updatedParticipantData?.QRs && Array.isArray(updatedParticipantData.QRs)) {
        updatedParticipantData.QRs.forEach((qr) => {
          if (qr.workshops && Array.isArray(qr.workshops)) {
            qr.workshops.forEach((workshop) => {
              if(workshop.workshopId === tallerId){
                newFolio = workshop.folio;
              }
            })
          }
        })
      }
      console.log(`New folio for workshop ${tallerId}: ${newFolio}`);

      // Actualizar el estado local
      const talleresActualizados = talleres.map(taller => {
        if (taller.id === tallerId) {
          const nuevoCupo = (taller.cupoActual || 0) + 1;
          console.log(`Actualizando estado del taller ${tallerId}: Inscrito=true, Cupo=${nuevoCupo}, Folio=${newFolio}`);
          return {
            ...taller,
            inscrito: true,
            cupoActual: nuevoCupo,
            folio: newFolio // Update the folio here
          };
        }
        return taller;
      });
      
      setTalleres(talleresActualizados);
      setTalleresFiltrados(
        busqueda
          ? talleresActualizados.filter(t =>
              t.nombreTaller.toLowerCase().includes(busqueda.toLowerCase()) ||
              t.descripcion.toLowerCase().includes(busqueda.toLowerCase())
            )
          : talleresActualizados
      );
      
      Alert.alert(
        'Registro Exitoso',
        'Te has registrado correctamente en el taller.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error al inscribirse:', err);
      Alert.alert(
        'Error',
        err.message || 'No se pudo completar el registro. Intenta de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAction(false);
    }
  };

  // Función para cancelar la inscripción a un taller
  const cancelarInscripcion = async (tallerId) => {
    setProcessingAction(true);
    try {
      const response = await fetch(`${URL}/workshop/cancel-registration/${tallerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la inscripción');
      }

      // Re-fetch participant data to confirm QR/folio removal
      // Although we expect the folio to be null, fetching confirms the backend state
      console.log('Re-fetching participant data after cancellation...');
      const participantResponse = await fetch(`${URL}/user/me`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        } 
      });
      if (!participantResponse.ok) {
        console.error('Error re-fetching participant after cancellation');
        // Continue with local update, but folio might be stale if backend failed silently
      }
      // We don't strictly need the updated data here unless we wanted to verify 
      // the folio is truly gone from the backend QRs. For UI update, null is sufficient.

      // Actualizar el estado local
      const talleresActualizados = talleres.map(taller => {
        if (taller.id === tallerId) {
          const nuevoCupo = Math.max(0, (taller.cupoActual || 1) - 1);
          console.log(`Actualizando estado del taller ${tallerId}: Inscrito=false, Cupo=${nuevoCupo}, Folio=null`);
          return {
            ...taller,
            inscrito: false,
            cupoActual: nuevoCupo,
            folio: null // Set folio to null upon cancellation
          };
        }
        return taller;
      });
      
      setTalleres(talleresActualizados);
      setTalleresFiltrados(
        busqueda
          ? talleresActualizados.filter(t =>
              t.nombreTaller.toLowerCase().includes(busqueda.toLowerCase()) ||
              t.descripcion.toLowerCase().includes(busqueda.toLowerCase())
            )
          : talleresActualizados
      );
      
      Alert.alert(
        'Cancelación Exitosa',
        'Tu inscripción ha sido cancelada correctamente.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error al cancelar inscripción:', err);
      Alert.alert(
        'Error',
        err.message || 'No se pudo cancelar la inscripción. Intenta de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAction(false);
    }
  };

  // Función para gestionar la inscripción o cancelación de un taller
  const gestionarInscripcion = (taller) => {
    if (processingAction) {
      Alert.alert('Procesando', 'Espera a que se complete la acción anterior');
      return;
    }
    
    Alert.alert(
      taller.inscrito ? 'Cancelar inscripción' : 'Registrarse en el taller',
      taller.inscrito 
        ? '¿Estás seguro de que deseas cancelar tu inscripción?'
        : '¿Quieres registrarte en este taller?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            if (taller.inscrito) {
              cancelarInscripcion(taller.id);
            } else {
              if (taller.cupoActual >= taller.cupo) {
                Alert.alert(
                  'Cupo Completo',
                  'Lo siento, este taller ya ha alcanzado su cupo máximo.',
                  [{ text: 'OK' }]
                );
                return;
              }
              inscribirseEnTaller(taller.id);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{eventoNombre}</Text>
      </View>
      
      {/* Título de la página */}
      <Text style={styles.title}>Talleres del Evento</Text>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar talleres"
          value={busqueda}
          onChangeText={filtrarTalleres}
          placeholderTextColor="#888"
        />
      </View>
      
      {/* Estado de carga o error */}
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando talleres...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : talleresFiltrados.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.noResultsText}>No se encontraron talleres</Text>
        </View>
      ) : (
        /* Lista de talleres */
        <ScrollView style={styles.talleresContainer}>
          {talleresFiltrados.map((taller, index) => (
            <View key={index} style={styles.tallerCard}>
              {
                console.log("Taller folio-------------------------------------", taller?.folio)
              }
              <View style={styles.tallerInfo}>
                <Text style={styles.tallerNombre}>{taller.nombreTaller}</Text>
                {
                  taller?.folio && (
                    <Text style={styles.tallerDescripcion}>Folio de asistencia: <Text style={{fontWeight: "bold"}}>{taller.folio}</Text></Text>
                  )
                }
                <Text style={styles.tallerDescripcion}>{taller.descripcion}</Text>
                <Text style={styles.instructorText}>Instructor: {taller.instructor}</Text>
                <View style={styles.tallerDetalles}>
                  <Text style={styles.tallerFecha}>
                    <Feather name="calendar" size={14} color="#666" /> {taller.fecha.slice(0, taller.fecha.indexOf("T"))}
                  </Text>
                  <Text style={styles.tallerHora}>
                    <Feather name="clock" size={14} color="#666" /> {taller.hora}
                  </Text>
                </View>
                <View style={styles.cupoContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.registrarButton,
                      taller.inscrito ? styles.cancelarButton : null,
                      processingAction ? styles.disabledButton : null
                    ]}
                    onPress={() => gestionarInscripcion(taller)}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <ActivityIndicator size="small" color={taller.inscrito ? "#ff4d4f" : "#fff"} />
                    ) : (
                      <Text style={[
                        styles.registrarButtonText,
                        taller.inscrito ? styles.cancelarButtonText : null
                      ]}>
                        {taller.inscrito ? 'Cancelar' : 'Registrarse'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  talleresContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tallerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tallerInfo: {
    flex: 1,
  },
  tallerNombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  tallerDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  instructorText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 8,
  },
  tallerDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tallerFecha: {
    fontSize: 12,
    color: '#666',
  },
  tallerHora: {
    fontSize: 12,
    color: '#666',
  },
  cupoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cupoTexto: {
    fontSize: 14,
    color: '#333',
  },
  registrarButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  registrarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelarButton: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  cancelarButtonText: {
    color: '#ff4d4f',
  },
  disabledButton: {
    opacity: 0.7,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
});