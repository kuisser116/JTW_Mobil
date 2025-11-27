import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { URL } from '../../url';
export default function Inicio({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();

  // Función para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar contraseña
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Función de inicio de sesión
  const handleLogin = async () => {
    // Reiniciar errores
    setEmailError('');
    setPasswordError('');

    // Validar email
    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Ingrese un correo electrónico válido');
      return;
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError('La contraseña es obligatoria');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Si todas las validaciones pasan, proceder con la petición
    try {
      console.log('Intentando conectar a:', `${URL}/auth/login`);
      console.log('Datos enviados:', { email, password });

      const response = await fetch(`${URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Status de la respuesta:', response.status);
      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        console.log('Error en la respuesta:', data);
        Alert.alert(
          'Error de Autenticación',
          data.message || 'Credenciales inválidas',
          [{ text: 'OK' }]
        );
        return;
      }

      // Si la respuesta es exitosa y contiene un token
      if (data.token) {
        console.log('Token recibido:', data.token);
        console.log('Rol del usuario:', data.role);

        // Guardar el token en el contexto
        login(data.token, data.role);

        // Determinar la vista según el rol y navegar directamente
        if (data.role === 'Checador') {
          navigation.navigate('Checador');
        } else {
          navigation.navigate('Eventos');
        }
      } else {
        console.log('No se recibió token en la respuesta');
        Alert.alert(
          'Error',
          'No se recibió el token de autenticación',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error en la petición:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
        <MaterialIcons name="email" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#777"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
        <Feather name="lock" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      <TouchableOpacity onPress={() => navigation.navigate('Recuperacion')}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
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
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  forgotPassword: {
    color: "#555",
    fontSize: 13,
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  loginButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#222",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  registerLink: {
    marginTop: 10,
  },
  registerText: {
    color: "#555",
    fontSize: 14,
  }
});