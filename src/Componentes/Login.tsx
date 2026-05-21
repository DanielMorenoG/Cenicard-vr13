import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import styles from '../css/Login';

const Login = ({ navigation }: any) => {
  const [documento,  setDocumento]  = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando,   setCargando]   = useState(false);
  const [verPass,    setVerPass]    = useState(false);

  const handleLogin = async () => {
    if (!documento.trim() || !contrasena.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu documento y contraseña.');
      return;
    }
    setCargando(true);
    try {
      // 1. Buscar el correo asociado al número de CC
      const { data: usuarioData, error: buscarError } = await supabase
        .from('usuarios')
        .select('correo')
        .eq('numero_cc', documento.trim())
        .single();

      if (buscarError || !usuarioData) {
        Alert.alert('Usuario no encontrado', 'El número de documento ingresado no está registrado.');
        return;
      }

      // 2. Iniciar sesión — el AuthContext detecta el cambio y el split navigator
      //    cambia automáticamente a AppNavigator sin necesidad de navegar manualmente.
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    usuarioData.correo,
        password: contrasena,
      });

      if (loginError) {
        Alert.alert('Contraseña incorrecta', 'Verifica tu contraseña e intenta de nuevo.');
      }
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.fondoinicial}>
      <View style={styles.containerfondo}>
        <Image style={styles.chicaimg} source={require('../Img/chica_logins.png')} />
        <Image style={styles.logoimg}  source={require('../Img/logo_sena.png')} />
      </View>

      <View style={styles.LoginContainer}>
        <Text style={styles.title}>Iniciar{'\n'}sesión</Text>
        <Text style={styles.subtitle}>
          ¡Bienvenido a <Text style={styles.subtitleBold}>CENICARD</Text>!
        </Text>

        <Text style={styles.inputLabel}>Documento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu número de CC"
          placeholderTextColor="#8B9F8F"
          keyboardType="numeric"
          value={documento}
          onChangeText={setDocumento}
          editable={!cargando}
        />

        <Text style={styles.inputLabel}>Contraseña</Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#c8e6c99a',
          borderRadius: 30,
          paddingLeft: 18,
          paddingRight: 10,
          marginBottom: 0,
        }}>
          <TextInput
            style={[styles.input, {
              flex: 1,
              backgroundColor: 'transparent',
              paddingHorizontal: 0,
              marginBottom: 0,
            }]}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#8B9F8F"
            secureTextEntry={!verPass}
            value={contrasena}
            onChangeText={setContrasena}
            editable={!cargando}
          />
          <TouchableOpacity onPress={() => setVerPass(!verPass)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20 }}>{verPass ? '👁️‍🗨️' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, cargando && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>INGRESAR</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('RecuperarPassword')}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes una cuenta aún?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.registerLink}> Regístrate ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;