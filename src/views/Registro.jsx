import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function Registro({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      
      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#777"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#777"
          keyboardType="email-address"
        />
      </View>
      
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Registrarse</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => navigation && navigation.navigate('Inicio')}
      >
        <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
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
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  registerButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#222",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loginLink: {
    marginTop: 10,
  },
  loginText: {
    color: "#555",
    fontSize: 14,
  }
});