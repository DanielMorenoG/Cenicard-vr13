import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import styles from '../css/RecuperarPassword';

const { width } = Dimensions.get('window');

// Calcula el tamaño de cada caja OTP dinámicamente
// 8 cajas + 7 gaps de 6px + padding horizontal del contenedor
const OTP_DIGITS = 8;
const OTP_CONTAINER_PADDING = width * 0.07 * 2; // igual al paddingHorizontal del LoginContainer
const OTP_GAP = 6;
const OTP_BOX_SIZE = Math.floor(
  (width - OTP_CONTAINER_PADDING - OTP_GAP * (OTP_DIGITS - 1)) / OTP_DIGITS
);

const RecuperarPassword = ({ navigation }: any) => {
  const [paso,     setPaso]    = useState<'correo' | 'codigo'>('correo');
  const [correo,   setCorreo]  = useState('');
  const [cargando, setCargando]= useState(false);
  const [digitos,  setDigitos] = useState(Array(OTP_DIGITS).fill(''));

  const refs = Array.from({ length: OTP_DIGITS }, () => useRef<TextInput>(null));

  // ── PASO 1: enviar OTP ────────────────────────────────────────
  const handleEnviarCodigo = async () => {
    if (!correo.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu correo electrónico.');
      return;
    }
    setCargando(true);
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('correo')
        .eq('correo', correo.trim().toLowerCase())
        .maybeSingle();

      if (!data) {
        Alert.alert('Correo no encontrado', 'No existe una cuenta con ese correo.');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: correo.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });

      if (error) {
        Alert.alert('Error', 'No se pudo enviar el código. Intenta de nuevo.');
        return;
      }

      setPaso('codigo');
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    } finally {
      setCargando(false);
    }
  };

  // ── PASO 2: verificar OTP ────────────────────────────────────
  const handleVerificarCodigo = async () => {
    const codigo = digitos.join('');
    if (codigo.length < OTP_DIGITS) {
      Alert.alert('Código incompleto', `Ingresa los ${OTP_DIGITS} dígitos del código.`);
      return;
    }
    setCargando(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: correo.trim().toLowerCase(),
        token: codigo,
        type: 'email',
      });

      if (error) {
        Alert.alert(
          'Código inválido',
          'El código es incorrecto o ya expiró.\nSolicita uno nuevo.',
          [
            {
              text: 'Reenviar',
              onPress: () => { setDigitos(Array(OTP_DIGITS).fill('')); setPaso('correo'); },
            },
            { text: 'Cerrar', style: 'cancel' },
          ]
        );
        return;
      }

      navigation.navigate('NuevaPassword');
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    } finally {
      setCargando(false);
    }
  };

  const handleDigito = (valor: string, idx: number) => {
    const d = [...digitos];
    d[idx] = valor.replace(/[^0-9]/g, '').slice(-1);
    setDigitos(d);
    if (valor && idx < OTP_DIGITS - 1) refs[idx + 1].current?.focus();
  };

  const handleBorrar = (idx: number) => {
    if (!digitos[idx] && idx > 0) {
      const d = [...digitos];
      d[idx - 1] = '';
      setDigitos(d);
      refs[idx - 1].current?.focus();
    }
  };

  return (
    <View style={styles.fondoinicial}>
      <View style={styles.containerfondo}>
        <Image style={styles.chicaimg} source={require('../Img/chica_logins.png')} />
        <Image style={styles.logoimg}  source={require('../Img/logo_sena.png')} />
      </View>

      <View style={styles.LoginContainer}>
        {paso === 'correo' ? (
          <>
            <Text style={styles.title}>Recuperar{'\n'}contraseña</Text>
            <Text style={styles.subtitle}>
              No te preocupes,{'\n'}¡eso le pasa hasta a los mejores!
            </Text>
            <Text style={styles.subtitle2}>
              Te enviaremos un código de 8 dígitos{'\n'}a tu correo electrónico.
            </Text>

            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor="#8B9F8F"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
              editable={!cargando}
            />

            <TouchableOpacity
              style={[styles.button, cargando && { opacity: 0.7 }]}
              onPress={handleEnviarCodigo}
              disabled={cargando}
            >
              {cargando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Login')}>
              <Text style={{ textAlign: 'center', color: '#888', fontSize: width * 0.034 }}>
                Volver al login
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Código{'\n'}enviado</Text>
            <Text style={styles.subtitle}>Revisa tu bandeja de entrada</Text>
            <Text style={styles.subtitle2}>
              Ingresa el código de 8 dígitos{'\n'}que enviamos a{'\n'}
              <Text style={{ color: '#007832', fontWeight: 'bold' }}>{correo}</Text>
            </Text>

            {/* ── Cajas OTP responsivas ── */}
            <View style={styles.otpContainer}>
              {digitos.map((d, i) => (
                <TextInput
                  key={i}
                  ref={refs[i]}
                  value={d}
                  onChangeText={v => handleDigito(v, i)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') handleBorrar(i);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    {
                      width:  OTP_BOX_SIZE,
                      height: OTP_BOX_SIZE * 1.15,
                      fontSize: OTP_BOX_SIZE * 0.48,
                      borderColor: d ? '#007832' : '#ccc',
                      borderWidth: d ? 2 : 1,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Aviso si llega como link */}
            <View style={styles.aviso}>
              <Text style={styles.avisoText}>
                💡 Si recibiste un enlace en vez de un código, abre el enlace y usa
                los últimos 6 dígitos después de "token=" en la URL.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, cargando && { opacity: 0.7 }]}
              onPress={handleVerificarCodigo}
              disabled={cargando}
            >
              {cargando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>VERIFICAR</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 14 }}
              onPress={() => { setDigitos(Array(OTP_DIGITS).fill('')); setPaso('correo'); }}
            >
              <Text style={{ textAlign: 'center', color: '#888', fontSize: width * 0.034 }}>
                ¿No recibiste nada? Reenviar
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default RecuperarPassword;