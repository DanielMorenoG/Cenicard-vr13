import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth screens
import Login             from '../Componentes/Login';
import NuevaPassword     from '../Componentes/NuevaPassword';
import RecuperarPassword from '../Componentes/RecuperarPassword';
import PageRegistro      from '../pages/PageRegistro';

// App screens
import EditarPerfilComp   from '../Componentes/EditarPerfil';
import PageCarnet         from '../pages/PageCarnet';
import PageInicio         from '../pages/PageInicio';
import PageNotificaciones from '../pages/PageNotificaciones';
import PageServicios      from '../pages/PageServicios';

const AuthStack = createNativeStackNavigator();
const AppStack  = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        customAnimationOnGesture: true,
        gestureEnabled: true,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login"             component={Login} />
      <AuthStack.Screen name="Registro"          component={PageRegistro} />
      <AuthStack.Screen name="RecuperarPassword" component={RecuperarPassword} />
      <AuthStack.Screen name="NuevaPassword"     component={NuevaPassword} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 260,
        customAnimationOnGesture: true,
        gestureEnabled: true,
      }}
    >
      <AppStack.Screen name="PageInicio"     component={PageInicio} />
      <AppStack.Screen name="Servicios"      component={PageServicios} />
      <AppStack.Screen name="Carnet"         component={PageCarnet} />
      <AppStack.Screen name="Notificaciones" component={PageNotificaciones} />
      <AppStack.Screen name="EditarPerfil"   component={EditarPerfilComp} />
    </AppStack.Navigator>
  );
}

export default function Navegacion() {
  const { session, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007832' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}