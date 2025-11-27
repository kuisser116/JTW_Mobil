import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../ui-components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { URL } from '../../url';
import axios from 'axios';
import { Input } from '@rneui/base';

// Datos de ejemplo para los talleres del evento
const talleresData = [
  {
    id: '1',
    nombreTaller: 'Desarrollo de Videojuegos',
    descripcion: 'Aprende a crear videojuegos desde cero',
    fecha: '15 de Abril, 2025',
    hora: '10:00 AM',
    cupo: 30,
    cupoActual: 15
  },
  {
    id: '2',
    nombreTaller: 'Técnicas de Natación Avanzada',
    descripcion: 'Mejora tu técnica de natación con expertos',
    fecha: '22 de Abril, 2025',
    hora: '14:00 PM',
    cupo: 25,
    cupoActual: 20
  },
  {
    id: '3',
    nombreTaller: 'Innovación Espacial',
    descripcion: 'Descubre las últimas tendencias en exploración espacial',
    fecha: '30 de Abril, 2025',
    hora: '16:00 PM',
    cupo: 40,
    cupoActual: 10
  },
];

export default function TalleresChecador({ route, navigation }) {
  const { eventoId, eventoNombre } = route.params;
  const [busqueda, setBusqueda] = useState('');
  const [talleresFiltrados, setTalleresFiltrados] = useState([]);
  const [registroModalVisible, setRegistroModalVisible] = useState(false);
  const [correoParticipante, setCorreoParticipante] = useState('');
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);
  const [userNotRegistered, setUserNotRegistered] = useState(true);
  const [showModalRegisterAsisstance, setShowModalRegisterAsisstance] = useState(false);
  const [folioTaller, setFolioTaller] = useState('');
  const [workshopId, setWorkshopId] = useState(null);
  const [participant, setParticipant] = useState({
    name: '',
    lastname: '',
    gender: '',
    birthday: '',
    email: '',
    eventAwarness: '',
    livingState: '',
    profession: '',
    workPlace: ''
  });

  const { userRole, token } = useAuth();

  const role = userRole;
  console.log("Role in TalleresChecador: ", role);

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
    }
    return true;
  };

  // Alerta de genero
  const mostrarSelectorGenero = () => {
    Alert.alert(
      'Seleccionar Género',
      'Elige tu género',
      [
        {
          text: 'Masculino',
          onPress: () => {
            if (validateField('genero', 'Masculino')) {
              setParticipant(prev => ({ ...prev, gender: 'Hombre' }));
            }
          }
        },
        {
          text: 'Femenino',
          onPress: () => {
            if (validateField('genero', 'Femenino')) {
              setParticipant(prev => ({ ...prev, gender: 'Mujer' }));
            }
          }
        }
      ]
    );
  };

  async function searchParticipant(text) {
    setCorreoParticipante(text);
    const response = await axios.get(`${URL}/participant/by-email?email=${correoParticipante}`);
    const participantData = response.data.data;
    console.log("Participant in TalleresChecador: ", participantData);
    if(participantData) {
      setParticipant(participantData);
    } else {
      setParticipant({
        name: '',
        lastname: '',
        gender: '',
        birthday: '',
        email: '',
        eventAwarness: '',
        livingState: '',
        profession: '',
        workPlace: ''
      });
    }
  }


  useEffect(() => {
    (async () => {
      console.log("Evento ID in TalleresChecador: ", eventoId);
      const response = await axios.get(`${URL}/workshop/by-supervisor/${eventoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data.data;
      console.log("Data in TalleresChecador: ", data);
      setTalleresFiltrados(data || []);
    })();
  }, []);

  // Función para filtrar talleres
  const filtrarTalleres = (texto) => {
    setBusqueda(texto);
    if (texto) {
      const filtrados = talleresData.filter(
        (taller) =>
          taller.nombreTaller.toLowerCase().includes(texto.toLowerCase()) ||
          taller.descripcion.toLowerCase().includes(texto.toLowerCase())
      );
      setTalleresFiltrados(filtrados);
    } else {
      setTalleresFiltrados(talleresData);
    }
  };

  // Función para abrir modal de registro
  // const abrirRegistroModal = (taller) => {
  //   setTallerSeleccionado(taller);
  //   setRegistroModalVisible(true);
  // };

  // Función para abrir modal de registro de asistencia
  const abrirModalRegisterAsisstance = (workshopId) => {
    setShowModalRegisterAsisstance(true);
    setWorkshopId(workshopId);
  };

  // Función para registrar participante
  const registrarParticipante = async () => {
    console.log("Correo in TalleresChecador: ", correoParticipante);
    
    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoParticipante)) {
      Alert.alert(
        'Correo Inválido',
        'Por favor, ingrese un correo electrónico válido.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Hacer la peticion para saber si hay un participante con ese correo
    console.log("Correo in TalleresChecador: ", correoParticipante);
    let participantData = null;
    try {
      const response = await axios.get(`${URL}/participant/by-email?email=${correoParticipante}`);
      participantData = response.data.data;
      console.log("Participant in TalleresChecador: ", participantData);
    } catch (error) {
      console.log("Error in TalleresChecador: ", error.response.data);
    }
    //setParticipant(participantData);
    // console.log("Participant in TalleresChecador: ", participantData);

    // Si exsiste el participante, registrar en el evento al participante
    // if(participantData) {
      try {
        // Se hace el registro del participante en el evento
        console.log("Participant in TalleresChecador: ", participant);
        
        const eventInscriptionResponse = await axios.post(
          `${URL}/event/inscription/${eventoId}`,
          {
            name: participant.name || participantData.name,
            lastname: participant.lastname || participantData.lastname,
            gender: participant.gender || participantData.gender,
            birthday: participant.birthday || participantData.birthday,
            email: correoParticipante || participantData.email,
            eventAwarness: participant.eventAwarness || participantData.eventAwarness,
            livingState: participant.livingState || participantData.livingState,
            profession: participant?.profession || participantData?.profession,
            workPlace: participant?.workPlace || participantData?.workPlace
          }
        );
        console.log("Event Inscription Response in TalleresChecador: ", eventInscriptionResponse);
        console.log("Event Inscription Response Data in TalleresChecador: ", eventInscriptionResponse.data);

        // Buscar el participante recien creado
        const participantCreated = await axios.get(`${URL}/participant/by-email?email=${correoParticipante}`);
        console.log("Participant Created in TalleresChecador: ", participantCreated.data);

        // Se registra el participante en el taller
        console.log(tallerSeleccionado);
        console.log(`${URL}/workshop/add-participant/${tallerSeleccionado._id}`);
        console.log("Realizando operacion para agregar el participante al taller");
        const workshopInscriptionResponse = await axios.put(
          `${URL}/workshop/add-participant/${tallerSeleccionado._id}`,
          {
            userId: participantCreated.data.data._id
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log("Workshop Inscription Response in TalleresChecador: ", workshopInscriptionResponse);
        console.log("Workshop Inscription Response Data in TalleresChecador: ", workshopInscriptionResponse.data);


        Alert.alert(
          "Registro Exitoso",
          "Participante registrado en el evento",
          [{ text: 'OK' }]
        );

      } catch (error) {
        console.log(error);
        console.log("Error in TalleresChecador: ", error.response.config.data);
        console.log("Error in TalleresChecador: ", error.response.data.data);
        Alert.alert(
          "Error",
          error.response.data.data,
          [{ text: 'OK' }]
        );
      }
    // } else {
    //   setParticipant({
    //     name: '',
    //     lastname: '',
    //     gender: '',
    //     birthday: '',
    //     email: '',
    //   })
    // }
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

      {/* Lista de talleres */}
      <ScrollView style={styles.talleresContainer}>
        {talleresFiltrados.map((taller) => (
          <View key={taller._id} style={styles.tallerCard}>
            <View style={styles.tallerInfo}>
                <TouchableOpacity
                  style={{...styles.registrarButton, marginBottom: 10}}
                  onPress={() => abrirModalRegisterAsisstance(taller._id)}
                >
                  <Text style={{...styles.registrarButtonText, textAlign: 'center'}}>Registrar Asistencia</Text>
                </TouchableOpacity>
                <Text style={styles.tallerNombre}>{taller.name}</Text>
                <Text style={styles.tallerDescripcion}>{taller.description}</Text>
                <View style={styles.tallerDetalles}>
                <Text style={styles.tallerFecha}>
                  <Feather name="calendar" size={14} color="#666" /> {taller.startDate.split('T')[0]}
                </Text>
                <Text style={styles.tallerHora}>
                  <Feather name="clock" size={14} color="#666" /> {taller.startDate.split('T')[1]}
                </Text>
              </View>
              <View style={styles.cupoContainer}>
                <Text style={styles.cupoTexto}>
                  Cupo: {taller.participants.length} / {taller.limitQuota}
                </Text>
                <TouchableOpacity
                  style={styles.registrarButton}
                  onPress={() => {
                    setRegistroModalVisible(true);
                    setTallerSeleccionado(taller);
                  }}
                >
                  <Text style={styles.registrarButtonText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de registro de asistencia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModalRegisterAsisstance}
        onRequestClose={() => setShowModalRegisterAsisstance(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registro</Text>
            <Input
              placeholder="folio"
              value={folioTaller}
              onChangeText={setFolioTaller}
              keyboardType="text"
              autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.confirmarButton}
            onPress={async () => {
              // Hacer la peticion para registrar la asistencia en el taller
              // Teniendo el id del taller y el folio
              try {
                const response = await axios.post(`${URL}/workshop/participant?folio=${folioTaller}`, {}, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                console.log("Response in TalleresChecador: ", response);
                const data = response.data.data;
                console.log(data);
                Alert.alert(
                  "Asistencia Registrada",
                  "Asistencia registrada correctamente",
                  [{ text: 'OK' }]
                );
              } catch (error) {
                Alert.alert(
                  "Error",
                  error.response.data.data,
                  [{ text: 'OK' }]
                );
                console.log("Error in TalleresChecador: ", error.response.data);
                console.log("Error in TalleresChecador: ", error.response.config.data);
              }
            }}
          >
            <Text style={styles.confirmarButtonText}>Confirmar</Text>
          </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Registro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={registroModalVisible}
        onRequestClose={() => setRegistroModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registro</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="Correo electrónico"
              value={correoParticipante}
              onChangeText={(text) => {
                searchParticipant(text);
                setCorreoParticipante(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {
              userNotRegistered && (
              <>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Nombre"
                  value={participant.name}
                  onChangeText={(text) => setParticipant({...participant, name: text })}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Apellido"
                  value={participant.lastname}
                  onChangeText={(text) => setParticipant({...participant, lastname: text })}
                />
                <View>
                  <TouchableOpacity style={styles.emailInput} onPress={mostrarSelectorGenero}>
                    <Text>{participant.gender || "Seleccione género"}</Text>
                  </TouchableOpacity>
                </View>
                {/* <TouchableOpacity
                  style={styles.emailInput}
                  onPress={() => setOpen(true)}
                > */}
                  {/* ! Cambiar por un INPUT DE TIPO FECHA */}
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Fecha de Nacimiento"
                    value={participant.birthday}
                    onChangeText={(text) => setParticipant({...participant, birthday: text})}
                  />
                {/* </TouchableOpacity> */}
                <TextInput
                  style={styles.emailInput}
                  placeholder="¿Cómo te enteraste del evento?"
                  value={participant.eventAwarness}
                  onChangeText={(text) => setParticipant({...participant, eventAwarness: text})}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Estado de Residencia"
                  value={participant.livingState}
                  onChangeText={(text) => setParticipant({...participant, livingState: text})}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Profesión"
                  value={participant.profession}
                  onChangeText={(text) => setParticipant({...participant, profession: text})}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Lugar de Trabajo"
                  value={participant.workPlace}
                  onChangeText={(text) => setParticipant({...participant, workPlace: text})}
                />
              </>
              )
            }
            <TouchableOpacity
              style={styles.confirmarButton}
              onPress={registrarParticipante}
            >
              <Text style={styles.confirmarButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={() => setRegistroModalVisible(false)}
            >
              <Text style={styles.cancelarButtonText}>Cancelar</Text>
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
  },
  registrarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  emailInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  confirmarButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  confirmarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelarButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007bff',
    width: '100%',
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});