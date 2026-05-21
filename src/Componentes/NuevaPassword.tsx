import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions,
  Image, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import styles from '../css/RecuperarPassword';

const { width } = Dimensions.get('window');

const NuevaPassword = ({ navigation }: any) => {
  const [nuevaPass,   setNuevaPass]   = useState('');
  const [confirmar,   setConfirmar]   = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleCambiar = async () => {
    if (!nuevaPass.trim() || !confirmar.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa y confirma tu nueva contraseña.');
      return;
    }
    if (nuevaPass.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    if (nuevaPass !== confirmar) {
      Alert.alert('No coinciden', 'Las contraseñas no son iguales.');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPass });

      if (error) {
        Alert.alert('Error', error.message ?? 'No se pudo cambiar la contraseña.');
        return;
      }

      Alert.alert(
        '¡Contraseña actualizada! ✓',
        'Ya puedes iniciar sesión con tu nueva contraseña.',
        [{
          text: 'Ir al login',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.navigate('Login');
          },
        }]
      );
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
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
        <Text style={styles.title}>Nueva{'\n'}contraseña</Text>

        <Text style={styles.subtitle}>
          Elige una contraseña segura{'\n'}de al menos 6 caracteres.
        </Text>

        <Text style={styles.inputLabel}>Nueva contraseña</Text>
        <View style={{ position: 'relative', marginBottom: 16 }}>
          <TextInput
            style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#8B9F8F"
            secureTextEntry={!mostrarPass}
            value={nuevaPass}
            onChangeText={setNuevaPass}
            editable={!cargando}
          />
          <TouchableOpacity
            onPress={() => setMostrarPass(!mostrarPass)}
            style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18 }}>{mostrarPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Repite tu nueva contraseña"
          placeholderTextColor="#8B9F8F"
          secureTextEntry={!mostrarPass}
          value={confirmar}
          onChangeText={setConfirmar}
          editable={!cargando}
        />

        {nuevaPass.length > 0 && (
          <View style={{ marginBottom: 16, marginTop: -8 }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  backgroundColor: nuevaPass.length >= i * 3
                    ? (nuevaPass.length >= 10 ? '#2E7D32' : nuevaPass.length >= 6 ? '#F57F17' : '#C62828')
                    : '#E0E0E0',
                }} />
              ))}
            </View>
            <Text style={{ fontSize: width * 0.028, color: '#888', textAlign: 'right' }}>
              {nuevaPass.length < 6 ? 'Muy corta' : nuevaPass.length < 10 ? 'Aceptable' : 'Segura ✓'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, cargando && { opacity: 0.7 }]}
          onPress={handleCambiar}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>GUARDAR CONTRASEÑA</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ textAlign: 'center', color: '#888', fontSize: width * 0.034 }}>
            Cancelar — volver al login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NuevaPassword;