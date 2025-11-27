import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// Import screen components
import Recuperacion from './src/views/Recuperacion';
import Registro from './src/views/Registro';
import Inicio from './src/views/Inicio';
import Eventos from './src/views/Eventos';
import Talleres from './src/views/Talleres';
import Perfil from './src/views/Perfil';
import Configuracion from './src/views/Configuracion';
import EscanerQR from './src/views-checador/EscanerQR';
import Checador from './src/views-checador/Checador';
import EventosTotales from './src/views/EventosTotales';
import TalleresChecador from './src/views-checador/TalleresChecador';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen name="Recuperacion" component={Recuperacion} />
          {/* Eventos de participante */}
          <Stack.Screen name="Eventos" component={Eventos}/>
          {/* Talleres de eventos */}
          <Stack.Screen name="Talleres" component={Talleres}/>
          <Stack.Screen name="Perfil" component={Perfil}/>
          <Stack.Screen name="Configuracion" component={Configuracion}/>
          <Stack.Screen name="EscanerQR" component={EscanerQR}/>
          {/* Eventos del checador */}
          <Stack.Screen name="Checador" component={Checador}/>
          {/* Todos los eventos */}
          <Stack.Screen name="EventosTotales" component={EventosTotales}/>
          {/* Talleres del checador dependiendo del evento */}
          <Stack.Screen name="TalleresChecador" component={TalleresChecador}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}