import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import BottomNavBar from '../ui-components/BottomNavBar';
import axios from 'axios';
import { URL } from '../../url';
import { useAuth } from '../context/AuthContext';
export default function EscanerQR({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { userRole, token } = useAuth();
  const role = userRole;
  console.log("Role in EscanerQR: ", role);

  if (!permission) return <View style={styles.container}><Text>Cargando permisos...</Text></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Sin permiso para usar la cámara</Text>
        <Text onPress={requestPermission} style={{ color: 'blue' }}>Dar permiso</Text>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);

    if (data) {
      const json = JSON.parse(data);
      // Registrar la asistencia en el taller
      const { userId, eventId } = json;

      if(!userId || !eventId) {
        Alert.alert(
          'Código QR Inválido',
          'El código QR escaneado no es un evento válido.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }

      // Registrar la asistencia en el evento
      const response = await axios.post(
        `${URL}/event/participant?participantId=${userId}&eventId=${eventId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.data) {
        // Evento al que se registro
        const event = await axios.get(`${URL}/event/${eventId}`);
        console.log(event.data.data);

        Alert.alert(
          'Código QR Escaneado',
          `Asistencia registrada correctamente en el evento ${event.data.data.name}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      } else {
        Alert.alert(
          'Código QR Inválido',
          'El código QR escaneado no es un evento válido.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={!scanned ? handleBarCodeScanned : undefined}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Escanea el código QR del evento</Text>
      </View>

      <BottomNavBar role={role} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  overlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#007bff' },
  instructionContainer: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center' },
  instructionText: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 10 },
});