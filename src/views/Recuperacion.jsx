import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { URL } from '../../url';

export default function Recuperacion({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleEnviar = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingresa un correo electrónico.');
      return;
    }
    if (!validarCorreo(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    // Mostrar el input para el codigo
    setShowCodeInput(true);
    // Enviar correo electronico de recuperacion de la cuenta
    axios.post(`${URL}/user/change-pass-mail`, { email })
    .then(response => {
      Alert.alert('Éxito', 'Se ha enviado un código de recuperación al correo ingresado correo.');
      console.log(response.data);
      return response.data;
    })
    .then(data => {
      setRecoveryToken(data.token);
      setShowCodeInput(true);
    })
    .catch(error => Alert.alert('Error', 'No se ha podido mandar el codigo de recuperación.'));
  };

  function handleVerificarCode() {
    if (!code) {
      Alert.alert('Error', 'Por favor, ingresa el código de recuperación.');
      return;
    }
    // Lanzar la peticion al servidor para verificar el codigo
    axios.post(`
      ${URL}/user/validate-code`,
      { code },
      {
        headers: {
          'Authorization': `Bearer ${recoveryToken}`
        }
      }
    )
    .then(response => {
      setShowPasswordInput(true);
      setShowCodeInput(false);
    })
    .catch(err => Alert.alert('Error al verificar el codigo', 'Codigo incorrecto'))
  }

  function changePassword() {
    if(!password) {
      Alert.alert('Escribe la contraseña nueva y asegurate de que tenga al menos 6 caracteres');
      return;
    }

    // Realizar la peticion al servidor para cambiar la contraseña
    axios.post(
      `${URL}/user/change-pass`,
      { password },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recoveryToken}`
        }
      }
    )
    .then(response => {
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      navigation.navigate('Inicio');
    })
    .catch(err => Alert.alert('Error al cambiar la contraseña', 'No se ha podido cambiar la contraseña'))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>

      {
        !showCodeInput && !showPasswordInput &&
          <>
            {/* Input para el correo */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#777"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {/* Boton para enviar el correo */}
            <TouchableOpacity style={styles.sendButton} onPress={handleEnviar}>
              <Text style={styles.sendButtonText}>Enviar correo</Text>
            </TouchableOpacity>
          </>
      }

      {
        showCodeInput &&
        <>
            {/* Input para el codigo */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="code" size={20} color="#777" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Código de recuperación"
                placeholderTextColor="#777"
                value={code}
                onChangeText={setCode}
              />
              </View>
              {/* Boton para verificar el codigo */}
              <TouchableOpacity style={styles.sendButton} onPress={handleVerificarCode}>
                <Text style={styles.sendButtonText}>Verificar</Text>
              </TouchableOpacity>
          </>
      }

      {/* Input para cambiar la contraseña */}
      {
        showPasswordInput &&
        <>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor="#777"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#777"
              />
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendButton} onPress={changePassword}>
                <Text style={styles.sendButtonText}>Cambiar contraseña</Text>
              </TouchableOpacity>
        </>
      }

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => navigation && navigation.goBack()}
      >
        <Text style={styles.backText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  sendButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#222",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  backLink: {
    marginTop: 10,
  },
  backText: {
    color: "#555",
    fontSize: 14,
  }
});
