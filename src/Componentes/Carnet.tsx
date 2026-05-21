import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions,
  Image, Modal, ScrollView, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from '../css/Carnet';

const { width, height } = Dimensions.get('window');
const FOTO_W = Math.round(width * 0.42);
const FOTO_H = Math.round(FOTO_W * 1.35);

const labelRol: Record<string, string> = {
  aprendiz:    'APRENDIZ',
  instructor:  'INSTRUCTOR',
  funcionario: 'FUNCIONARIO',
  contratista: 'CONTRATISTA',
  admin:       'ADMINISTRADOR',
};

const formatFecha = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

const fechaHoy = (): string => {
  const hoy = new Date();
  const d = String(hoy.getDate()).padStart(2, '0');
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const y = hoy.getFullYear();
  return `${d}-${m}-${y}`;
};

const CODIGO_BLOQUEAR    = '1234';
const CODIGO_DESBLOQUEAR = '4321';

const COLORES_FECHA = ['#2E7D32', '#1565C0', '#6A1B9A', '#C62828', '#E65100', '#00838F'];

// ── Hook: fecha que se actualiza a medianoche ─────────────────────────────────
const useFechaHoy = () => {
  const [fecha, setFecha] = useState(fechaHoy());
  useEffect(() => {
    const ahora  = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    const msHastaMedianoche = manana.getTime() - ahora.getTime();
    const timer = setTimeout(() => {
      setFecha(fechaHoy());
    }, msHastaMedianoche);
    return () => clearTimeout(timer);
  }, [fecha]);
  return fecha;
};

// ── Componente: fecha que rebota y cambia de color ────────────────────────────
const FechaAnimada = ({ texto }: { texto: string }) => {
  const posX     = useRef(new Animated.Value(0)).current;
  const posY     = useRef(new Animated.Value(0)).current;
  const [color, setColor] = useState(COLORES_FECHA[0]);
  const colorIdx = useRef(0);
  const dirX     = useRef(1);
  const dirY     = useRef(1);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const BADGE_W = width * 0.28;
  const BADGE_H = 28;

  const [area, setArea] = useState({ w: 0, h: 0 });

  const STEP  = 3;
  const DELAY = 30;

  useEffect(() => {
    if (area.w === 0 || area.h === 0) return;
    let active = true;

    const MAX_X = area.w - BADGE_W;
    const MAX_Y = area.h - BADGE_H;

    const mover = () => {
      if (!active) return;

      currentX.current += STEP * dirX.current;
      currentY.current += STEP * dirY.current;

      if (currentX.current >= MAX_X || currentX.current <= 0) {
        dirX.current *= -1;
        currentX.current = Math.max(0, Math.min(currentX.current, MAX_X));
        colorIdx.current = (colorIdx.current + 1) % COLORES_FECHA.length;
        setColor(COLORES_FECHA[colorIdx.current]);
      }
      if (currentY.current >= MAX_Y || currentY.current <= 0) {
        dirY.current *= -1;
        currentY.current = Math.max(0, Math.min(currentY.current, MAX_Y));
      }

      posX.setValue(currentX.current);
      posY.setValue(currentY.current);

      setTimeout(mover, DELAY);
    };

    setTimeout(mover, DELAY);
    return () => { active = false; };
  }, [area]);

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      onLayout={e => {
        const { width: w, height: h } = e.nativeEvent.layout;
        setArea({ w, h });
      }}
      pointerEvents="none"
    >
      <Animated.View style={{
        position:  'absolute',
        top:       0,
        left:      0,
        transform: [{ translateX: posX }, { translateY: posY }],
        zIndex:    10,
      }}>
        <View style={{
          backgroundColor:   color,
          borderRadius:      8,
          paddingHorizontal: 10,
          paddingVertical:   4,
          shadowColor:       color,
          shadowOffset:      { width: 0, height: 2 },
          shadowOpacity:     0.5,
          shadowRadius:      4,
          elevation:         4,
        }}>
          <Text style={{
            color:         '#fff',
            fontSize:      width * 0.030,
            fontWeight:    '800',
            letterSpacing: 0.5,
          }}>
            {texto}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Carnet = () => {
  const { usuario, recargarUsuario, offline } = useAuth();
  const hoy = useFechaHoy();

  const [volteado,         setVolteado]         = useState(false);
  const [modalTrasero,     setModalTrasero]     = useState(false);
  const [guardandoTrasero, setGuardandoTrasero] = useState(false);
  const [formTrasero, setFormTrasero] = useState({
    eps: '', condicion_medica: '',
    contacto_nombre: '', contacto_telefono: '',
    perfil_profesional: '',
  });
  const [modalEstado,     setModalEstado]     = useState(false);
  const [codigoEstado,    setCodigoEstado]    = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  if (!usuario) return null;

  const estadoBloqueado =
    usuario.estado_carne === 'bloqueado' ||
    usuario.estado_carne === 'prestamo'  ||
    usuario.estado_carne === 'vencido';

  const voltear = () => {
    if (estadoBloqueado) return;
    if (!volteado && !usuario.carnet_trasero_completado) {
      setFormTrasero({
        eps:                usuario.eps ?? '',
        condicion_medica:   usuario.condicion_medica ?? '',
        contacto_nombre:    usuario.contacto_emergencia_nombre ?? '',
        contacto_telefono:  usuario.contacto_emergencia_telefono ?? '',
        perfil_profesional: usuario.perfil_profesional ?? '',
      });
      setModalTrasero(true);
      return;
    }
    Animated.spring(flipAnim, { toValue: volteado ? 0 : 1, useNativeDriver: true }).start();
    setVolteado(!volteado);
  };

  const guardarTrasero = async () => {
    setGuardandoTrasero(true);
    const { error } = await supabase.from('usuarios').update({
      eps:                          formTrasero.eps.trim() || null,
      condicion_medica:             formTrasero.condicion_medica.trim() || null,
      contacto_emergencia_nombre:   formTrasero.contacto_nombre.trim() || null,
      contacto_emergencia_telefono: formTrasero.contacto_telefono.trim() || null,
      perfil_profesional:           formTrasero.perfil_profesional.trim() || null,
      carnet_trasero_completado:    true,
    }).eq('id', usuario.id);
    setGuardandoTrasero(false);
    if (error) { Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.'); return; }
    await recargarUsuario();
    setModalTrasero(false);
    Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true }).start();
    setVolteado(true);
  };

  const handleConfirmarEstado = async () => {
    const codigo = codigoEstado.trim();
    if (codigo !== CODIGO_BLOQUEAR && codigo !== CODIGO_DESBLOQUEAR) {
      Alert.alert('Código incorrecto',
        `• Código para bloquear: ${CODIGO_BLOQUEAR}\n• Código para desbloquear: ${CODIGO_DESBLOQUEAR}`);
      return;
    }
    if (codigo === CODIGO_BLOQUEAR   && usuario.estado_carne === 'bloqueado') {
      Alert.alert('Ya bloqueado', 'Tu carné ya está bloqueado.'); return;
    }
    if (codigo === CODIGO_DESBLOQUEAR && usuario.estado_carne === 'activo') {
      Alert.alert('Ya activo', 'Tu carné ya está activo.'); return;
    }
    if (usuario.estado_carne === 'vencido') {
      Alert.alert('Carné vencido', 'No puedes cambiar el estado de un carné vencido.'); return;
    }
    const nuevoEstado = codigo === CODIGO_BLOQUEAR ? 'bloqueado' : 'activo';
    setCambiandoEstado(true);
    const { error } = await supabase.from('usuarios')
      .update({ estado_carne: nuevoEstado }).eq('id', usuario.id);
    setCambiandoEstado(false);
    if (error) { Alert.alert('Error', 'No se pudo cambiar el estado.'); return; }
    await recargarUsuario();
    if (nuevoEstado === 'bloqueado' && volteado) {
      Animated.spring(flipAnim, { toValue: 0, useNativeDriver: true }).start();
      setVolteado(false);
    }
    setModalEstado(false);
    setCodigoEstado('');
    Alert.alert(
      nuevoEstado === 'bloqueado' ? 'Carné bloqueado 🔒' : 'Carné activado ✓',
      nuevoEstado === 'bloqueado'
        ? 'Tu carné ha sido bloqueado exitosamente.'
        : 'Tu carné ha sido activado exitosamente.'
    );
  };

  const rotFrente = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotAtras  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const nombreCompleto = [
    usuario.primer_nombre, usuario.segundo_nombre,
    usuario.primer_apellido, usuario.segundo_apellido,
  ].filter(Boolean).join(' ');

  const fichaData       = (usuario as any).fichas;
  const codigoFicha     = fichaData?.codigo_ficha ?? '—';
  const centroMostrar   = usuario.centro_formacion ?? fichaData?.centro_formacion ?? '—';
  const regionalMostrar = usuario.regional ?? fichaData?.regional ?? '—';

  // ── FRENTE bloqueado ───────────────────────────────────────────────────────
  const renderBloqueado = () => {
    const esVencido  = usuario.estado_carne === 'vencido';
    const esPrestamo = usuario.estado_carne === 'prestamo';
    return (
      <View style={styles.bloqueadoWrapper}>
        <View style={styles.fotoRow}>
          <Image source={require('../Img/logo_verde.png')} style={styles.logoCarnet} />
          <View style={[styles.fotoPlaceholder, { width: FOTO_W, height: FOTO_H }]}>
            {usuario.foto_url
              ? <Image source={{ uri: usuario.foto_url }} style={{ width: FOTO_W, height: FOTO_H }} />
              : <Text style={styles.fotoText}>FOTOGRAFÍA</Text>}
          </View>
        </View>
        <View style={styles.alertaBox}>
          <View style={styles.alertaIconWrapper}>
            <Ionicons name="warning" size={36} color="#E53935" />
          </View>
          <Text style={styles.alertaTitulo}>
            Tu Carné se{'\n'}encuentra{'\n'}{esVencido ? 'vencido' : 'bloqueado'}
          </Text>
          <View style={esVencido ? styles.estadoBadgeVencido : styles.estadoBadgePrestamo}>
            <Text style={styles.estadoBadgeText}>
              {esVencido ? 'Carné vencido' : esPrestamo ? 'En préstamo' : 'Bloqueado'}
            </Text>
          </View>
          <Text style={styles.alertaDesc}>
            {esVencido
              ? 'Tu carné ha expirado. Comunícate con el área administrativa.'
              : esPrestamo
                ? 'Tienes un préstamo activo. Se activará al devolver el equipo.'
                : 'Si es un error, comunícate con el departamento administrativo.'}
          </Text>
        </View>
      </View>
    );
  };

  // ── FRENTE activo ─────────────────────────────────────────────────────────
  const renderFrente = () => (
    <View style={{ flex: 1 }}>
      {/* Área de rebote — cubre toda la tarjeta */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}
            pointerEvents="none">
        <FechaAnimada texto={hoy} />
      </View>

      <View style={styles.fotoRow}>
        <Image source={require('../Img/logo_verde.png')} style={styles.logoCarnet} />
        <View style={[styles.fotoPlaceholder, { width: FOTO_W, height: FOTO_H }]}>
          {usuario.foto_url
            ? <Image source={{ uri: usuario.foto_url }}
                style={{ width: FOTO_W, height: FOTO_H }} resizeMode="cover" />
            : <Text style={styles.fotoText}>FOTOGRAFÍA</Text>}
        </View>
      </View>

      <Text style={styles.rolLabel}>{labelRol[usuario.rol] ?? usuario.rol.toUpperCase()}</Text>
      <View style={styles.separador} />
      <Text style={styles.nombreCompleto}>{nombreCompleto}</Text>
      <Text style={styles.campo}>CC {usuario.numero_cc}</Text>
      <Text style={styles.campo}>RH:  {usuario.rh ?? '—'}</Text>
      <View style={styles.fechaRow}>
        <Text style={styles.campo}>Fecha de{'\n'}vencimiento</Text>
        <View style={styles.fechaBadge}>
          <Text style={styles.fechaBadgeText}>
            {formatFecha(usuario.fecha_vencimiento_carne)}
          </Text>
        </View>
      </View>
      <View style={styles.separadorDelgado} />
      <Text style={styles.regional}>{regionalMostrar}</Text>
      <Text style={styles.centro}>{centroMostrar}</Text>
    </View>
  );

  // ── REVERSO ────────────────────────────────────────────────────────────────
  const renderReverso = () => (
    <View style={{ flex: 1 }}>
      <Text style={styles.infoTitle}>Información del{'\n'}usuario</Text>
      {[
        { icon: 'people-outline',         label: 'FICHA',                  valor: codigoFicha },
        { icon: 'add-circle-outline',     label: 'EPS',                    valor: usuario.eps ?? '—' },
        { icon: 'phone-portrait-outline', label: 'CELULAR',                valor: usuario.celular ?? '—' },
        { icon: 'heart-outline',          label: 'CONDICIÓN MÉDICA',       valor: usuario.condicion_medica ?? '—' },
        { icon: 'people-circle-outline',  label: 'CONTACTO DE EMERGENCIA',
          valor: usuario.contacto_emergencia_nombre
            ? `${usuario.contacto_emergencia_nombre}\n${usuario.contacto_emergencia_telefono ?? ''}`
            : '—' },
        { icon: 'settings-outline',       label: 'PERFIL PROFESIONAL',     valor: usuario.perfil_profesional ?? '—' },
      ].map(item => (
        <View key={item.label} style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name={item.icon as any} size={20} color="#2E7D32" />
          </View>
          <View style={styles.infoTextos}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValor}>{item.valor}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.fondoinicial}>
      {/* Banner offline */}
      {offline && (
        <View style={{
          backgroundColor: '#E65100', paddingVertical: 6,
          paddingHorizontal: 16, flexDirection: 'row',
          alignItems: 'center', gap: 8,
        }}>
          <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: width * 0.028, fontWeight: '600', flex: 1 }}>
            Sin conexión — mostrando datos guardados
          </Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={voltear}
          activeOpacity={estadoBloqueado ? 1 : 0.95}
          style={styles.flipWrapper}>

          {/* FRENTE */}
          <Animated.View style={[
            styles.carnetCard,
            { transform: [{ rotateY: rotFrente }], backfaceVisibility: 'hidden' },
            estadoBloqueado && styles.carnetBloqueado,
          ]}>
            {estadoBloqueado ? renderBloqueado() : renderFrente()}
          </Animated.View>

          {/* REVERSO */}
          <Animated.View style={[
            styles.carnetCard, styles.carnetAtras,
            { transform: [{ rotateY: rotAtras }], backfaceVisibility: 'hidden' },
          ]}>
            {renderReverso()}
          </Animated.View>
        </TouchableOpacity>

        {!estadoBloqueado && (
          <Text style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 10 }}>
            {volteado ? 'Toca para ver el frente' : 'Toca el carné para ver el reverso'}
          </Text>
        )}
      </ScrollView>

      {/* Botón estado */}
      {usuario.estado_carne !== 'vencido' && usuario.estado_carne !== 'prestamo' && !offline && (
        <TouchableOpacity
          style={[styles.btnEstado, {
            backgroundColor: usuario.estado_carne === 'bloqueado' ? '#2E7D32' : '#fff',
            borderColor:     usuario.estado_carne === 'bloqueado' ? '#2E7D32' : '#C62828',
          }]}
          onPress={() => { setCodigoEstado(''); setModalEstado(true); }}
        >
          <Ionicons
            name={usuario.estado_carne === 'bloqueado' ? 'lock-open-outline' : 'lock-closed-outline'}
            size={16}
            color={usuario.estado_carne === 'bloqueado' ? '#fff' : '#C62828'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.btnEstadoText, {
            color: usuario.estado_carne === 'bloqueado' ? '#fff' : '#C62828',
          }]}>
            {usuario.estado_carne === 'bloqueado' ? 'Desbloquear carné' : 'Bloquear carné'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal: cambiar estado */}
      <Modal visible={modalEstado} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {usuario.estado_carne === 'bloqueado' ? '🔓 Desbloquear carné' : '🔒 Bloquear carné'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {usuario.estado_carne === 'bloqueado'
                ? `Ingresa el código ${CODIGO_DESBLOQUEAR} para activar tu carné.`
                : `Ingresa el código ${CODIGO_BLOQUEAR} para bloquear tu carné.`}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingresa el código"
              placeholderTextColor="#8B9F8F"
              value={codigoEstado}
              onChangeText={setCodigoEstado}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalBtn, cambiandoEstado && { opacity: 0.7 }]}
              onPress={handleConfirmarEstado} disabled={cambiandoEstado}>
              {cambiandoEstado
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.modalBtnText}>CONFIRMAR</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModalEstado(false); setCodigoEstado(''); }}>
              <Text style={styles.modalCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: datos reverso (primera vez) */}
      <Modal visible={modalTrasero} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Reverso del carné</Text>
              <Text style={styles.modalSubtitle}>
                Es tu primera vez volteando el carné. Completa esta información.
              </Text>
              {[
                { label: 'EPS',                   campo: 'eps',                placeholder: 'Ej: Compensar EPS' },
                { label: 'Condición médica',       campo: 'condicion_medica',   placeholder: 'Ej: Ninguna' },
                { label: 'Contacto de emergencia', campo: 'contacto_nombre',    placeholder: 'Nombre y parentesco' },
                { label: 'Teléfono emergencia',    campo: 'contacto_telefono',  placeholder: '+57 300 000 0000' },
                { label: 'Perfil profesional',     campo: 'perfil_profesional', placeholder: 'Breve descripción' },
              ].map(f => (
                <View key={f.campo} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>{f.label}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={f.placeholder}
                    placeholderTextColor="#8B9F8F"
                    value={(formTrasero as any)[f.campo]}
                    onChangeText={v => setFormTrasero(prev => ({ ...prev, [f.campo]: v }))}
                    multiline={f.campo === 'perfil_profesional'}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.modalBtn, guardandoTrasero && { opacity: 0.7 }]}
                onPress={guardarTrasero} disabled={guardandoTrasero}>
                {guardandoTrasero
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalBtnText}>GUARDAR Y VER REVERSO</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalTrasero(false)}>
                <Text style={styles.modalCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Carnet;