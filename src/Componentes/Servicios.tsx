import { Ionicons } from '@expo/vector-icons';
import { SkeletonEquipoCard } from './SkeletonBox';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, Modal,
  Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from '../css/Servicios';

const { width, height } = Dimensions.get('window');

type Categoria = { id: number; nombre: string; icono: string | null };
type Equipo = {
  id: number; numero: number; estado: string;
  categoria_id: number; imagen_url: string | null;
  marca: string | null; modelo: string | null;
  descripcion: string | null;
  caracteristicas: Record<string, any> | null;
};
type Prestamo = {
  id: number; estado: string; fecha_solicitud: string;
  equipos: { numero: number; categorias_equipos: { nombre: string } } | null;
};

const estadoColor: Record<string, string> = {
  disponible:    '#2E7D32',
  no_disponible: '#C62828',
  ocupado:       '#F57F17',
};
const estadoLabel: Record<string, string> = {
  disponible:    'Disponible',
  no_disponible: 'No disponible',
  ocupado:       'Ocupado',
};

// Roles que pueden ver salones y eventos
const ES_STAFF = (rol: string) => ['funcionario', 'contratista', 'admin'].includes(rol);

// Metro bundler requiere que todos los require() sean estáticos
// No se pueden usar en objetos dinámicos — usar switch en su lugar
const getImgCategoria = (nombreCat?: string, imgUrl?: string | null): any => {
  if (imgUrl) return { uri: imgUrl };
  switch (nombreCat) {
    case 'Tablets':        return require('../Img/tablet_dibujo.png');
    case 'Camaras':
    case 'Cámaras':        return require('../Img/camara.png');
    case 'Juegos de mesa': return require('../Img/juego-de-mesa.png');
    case 'Libros':         return require('../Img/libro-abierto.png');
    case 'Salones':        return require('../Img/calendario.png');
    default:               return require('../Img/computador.png');
  }
};

// ── Características del equipo ────────────────────────────────────────────────
const CaracteristicasDetalle = ({ data }: { data: Record<string, any> }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const iconMap: Record<string, string> = {
    procesador: 'hardware-chip-outline', ram: 'layers-outline',
    almacenamiento: 'server-outline', pantalla: 'tv-outline',
    sistema_operativo: 'logo-windows', bateria: 'battery-charging-outline',
    programas: 'apps-outline', apps: 'apps-outline',
    puertos: 'git-branch-outline', conectividad: 'wifi-outline',
    tipo: 'camera-outline', sensor: 'aperture-outline',
    lente_incluido: 'scan-circle-outline', video: 'videocam-outline',
    iso: 'sunny-outline', resolucion: 'videocam-outline',
    estabilizacion: 'move-outline', resistencia: 'water-outline',
    incluye: 'cube-outline',
  };
  const labelMap: Record<string, string> = {
    procesador: 'Procesador', ram: 'RAM', almacenamiento: 'Almacenamiento',
    pantalla: 'Pantalla', sistema_operativo: 'Sistema Operativo',
    bateria: 'Batería', programas: 'Programas instalados', apps: 'Aplicaciones',
    puertos: 'Puertos', conectividad: 'Conectividad', tipo: 'Tipo',
    sensor: 'Sensor', lente_incluido: 'Lente incluido', video: 'Video',
    iso: 'ISO', resolucion: 'Resolución', estabilizacion: 'Estabilización',
    resistencia: 'Resistencia', incluye: 'Incluye en el kit',
  };
  return (
    <View>
      {Object.entries(data).map(([key, value]) => {
        const esLista = Array.isArray(value);
        return (
          <View key={key} style={{
            flexDirection: 'row', alignItems: 'flex-start',
            backgroundColor: '#F8FAF8', borderRadius: 12,
            padding: 12, marginBottom: 8, gap: 10,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name={(iconMap[key] ?? 'information-circle-outline') as any} size={18} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: width * 0.026, color: '#888', fontWeight: '700',
                letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' }}>
                {labelMap[key] ?? key}
              </Text>
              {esLista ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                  {(value as string[]).map((item, i) => (
                    <View key={i} style={{ backgroundColor: '#E8F5E9', borderRadius: 6,
                      paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: width * 0.030, color: '#2E7D32', fontWeight: '600' }}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: width * 0.034, color: '#1A1A1A', fontWeight: '500' }}>
                  {String(value)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ── Sección Salones ───────────────────────────────────────────────────────────
const SeccionSalones = ({ userId }: { userId: string }) => {
  const [modal, setModal]       = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [verMias, setVerMias]   = useState(false);
  const [form, setForm] = useState({
    salon: '', fecha_uso: '', hora_inicio: '',
    hora_fin: '', motivo: '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const cargarMias = async () => {
    const { data } = await supabase.from('solicitudes_salones')
      .select('*').eq('usuario_id', userId)
      .order('created_at', { ascending: false });
    setMisSolicitudes(data ?? []);
  };

  const enviar = async () => {
    if (!form.salon || !form.fecha_uso || !form.hora_inicio || !form.hora_fin || !form.motivo) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.'); return;
    }
    setEnviando(true);
    const { error } = await supabase.from('solicitudes_salones').insert({
      usuario_id: userId, salon: form.salon.trim(),
      fecha_uso: form.fecha_uso, hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin, motivo: form.motivo.trim(),
    });
    setEnviando(false);
    if (error) { Alert.alert('Error', 'No se pudo enviar. Intenta de nuevo.'); return; }
    setModal(false);
    setForm({ salon: '', fecha_uso: '', hora_inicio: '', hora_fin: '', motivo: '' });
    Alert.alert('Solicitud enviada ✓', 'Recibirás una notificación cuando sea procesada.');
  };

  const estadoColor2: Record<string, string> = { pendiente: '#F57F17', aceptado: '#2E7D32', rechazado: '#C62828' };

  return (
    <View style={{ paddingHorizontal: width * 0.045 }}>
      {/* Header sección */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F5E9',
          justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="business-outline" size={24} color="#2E7D32" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: width * 0.048, fontWeight: '800', color: '#1A1A1A' }}>Salones</Text>
          <Text style={{ fontSize: width * 0.030, color: '#666' }}>Solicita un salón para tus actividades</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.modalBtn, { marginBottom: 10 }]} onPress={() => setModal(true)}>
        <Text style={styles.modalBtnText}>+ SOLICITAR SALÓN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPrestamos}
        onPress={() => { cargarMias(); setVerMias(true); }}>
        <Text style={styles.btnPrestamosText}>Ver mis solicitudes</Text>
      </TouchableOpacity>

      {/* Modal solicitar salón */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Solicitar salón</Text>
              <Text style={styles.modalSubtitle}>Completa la información de la solicitud</Text>

              {[
                { label: 'Salón (nombre o número)', campo: 'salon', placeholder: 'Ej: Sala 201-A', kb: 'default' },
                { label: 'Fecha de uso (AAAA-MM-DD)', campo: 'fecha_uso', placeholder: 'Ej: 2026-05-15', kb: 'numeric' },
                { label: 'Hora inicio (HH:MM)', campo: 'hora_inicio', placeholder: 'Ej: 08:00', kb: 'numeric' },
                { label: 'Hora fin (HH:MM)', campo: 'hora_fin', placeholder: 'Ej: 10:00', kb: 'numeric' },
              ].map(f => (
                <View key={f.campo} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: width * 0.032, color: '#333', marginBottom: 4, fontWeight: '600' }}>{f.label}</Text>
                  <TextInput style={styles.modalInput} placeholder={f.placeholder}
                    placeholderTextColor="#8B9F8F" keyboardType={f.kb as any}
                    value={(form as any)[f.campo]} onChangeText={v => set(f.campo, v)} />
                </View>
              ))}

              <Text style={{ fontSize: width * 0.032, color: '#333', marginBottom: 4, fontWeight: '600' }}>
                Motivo / Descripción del uso *
              </Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Describe detalladamente el propósito del salón..."
                placeholderTextColor="#8B9F8F" multiline
                value={form.motivo} onChangeText={v => set('motivo', v)} />

              <TouchableOpacity style={[styles.modalBtn, enviando && { opacity: 0.7 }]}
                onPress={enviar} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>ENVIAR SOLICITUD</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={styles.modalCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal mis solicitudes de salón */}
      <Modal visible={verMias} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: height * 0.7 }]}>
            <Text style={styles.modalTitle}>Mis solicitudes de salón</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misSolicitudes.length === 0 ? (
                <View style={styles.prestamosEmpty}>
                  <Text style={styles.prestamosEmptyText}>No tienes solicitudes registradas</Text>
                </View>
              ) : misSolicitudes.map(s => (
                <View key={s.id} style={{ backgroundColor: '#F5F5F5', borderRadius: 12,
                  padding: 12, marginBottom: 10 }}>
                  <Text style={{ fontWeight: '700', fontSize: width * 0.036, color: '#1A1A1A' }}>
                    Salón: {s.salon}
                  </Text>
                  <Text style={{ fontSize: width * 0.030, color: '#666', marginTop: 2 }}>
                    {s.fecha_uso} · {s.hora_inicio} – {s.hora_fin}
                  </Text>
                  <Text style={{ fontSize: width * 0.030, color: '#444', marginTop: 4 }} numberOfLines={2}>
                    {s.motivo}
                  </Text>
                  <View style={{ alignSelf: 'flex-start', marginTop: 6,
                    backgroundColor: estadoColor2[s.estado] ?? '#888',
                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ color: '#fff', fontSize: width * 0.026, fontWeight: '700' }}>
                      {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                    </Text>
                  </View>
                  {s.motivo_rechazo && (
                    <Text style={{ fontSize: width * 0.028, color: '#C62828', marginTop: 4 }}>
                      Motivo rechazo: {s.motivo_rechazo}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setVerMias(false)}>
              <Text style={styles.modalCancelar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Sección Eventos ───────────────────────────────────────────────────────────
const SeccionEventos = ({ userId }: { userId: string }) => {
  const [modal, setModal]       = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [verMias, setVerMias]   = useState(false);
  const [form, setForm] = useState({
    nombre_evento: '', lugar: '', fecha_evento: '',
    hora_inicio: '', hora_fin: '', numero_asistentes: '',
    descripcion: '', recursos_requeridos: '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const cargarMias = async () => {
    const { data } = await supabase.from('solicitudes_eventos')
      .select('*').eq('usuario_id', userId)
      .order('created_at', { ascending: false });
    setMisSolicitudes(data ?? []);
  };

  const enviar = async () => {
    if (!form.nombre_evento || !form.lugar || !form.fecha_evento ||
        !form.hora_inicio || !form.hora_fin || !form.descripcion) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.'); return;
    }
    setEnviando(true);
    const { error } = await supabase.from('solicitudes_eventos').insert({
      usuario_id:          userId,
      nombre_evento:       form.nombre_evento.trim(),
      lugar:               form.lugar.trim(),
      fecha_evento:        form.fecha_evento,
      hora_inicio:         form.hora_inicio,
      hora_fin:            form.hora_fin,
      numero_asistentes:   form.numero_asistentes ? parseInt(form.numero_asistentes) : null,
      descripcion:         form.descripcion.trim(),
      recursos_requeridos: form.recursos_requeridos.trim() || null,
    });
    setEnviando(false);
    if (error) { Alert.alert('Error', 'No se pudo enviar. Intenta de nuevo.'); return; }
    setModal(false);
    setForm({ nombre_evento: '', lugar: '', fecha_evento: '', hora_inicio: '',
              hora_fin: '', numero_asistentes: '', descripcion: '', recursos_requeridos: '' });
    Alert.alert('Solicitud enviada ✓', 'Recibirás una notificación cuando sea procesada.');
  };

  const estadoColor2: Record<string, string> = { pendiente: '#F57F17', aceptado: '#2E7D32', rechazado: '#C62828' };

  return (
    <View style={{ paddingHorizontal: width * 0.045, marginTop: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F5E9',
          justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: width * 0.048, fontWeight: '800', color: '#1A1A1A' }}>Eventos</Text>
          <Text style={{ fontSize: width * 0.030, color: '#666' }}>Solicita autorización para un evento</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.modalBtn, { marginBottom: 10 }]} onPress={() => setModal(true)}>
        <Text style={styles.modalBtnText}>+ SOLICITAR EVENTO</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPrestamos}
        onPress={() => { cargarMias(); setVerMias(true); }}>
        <Text style={styles.btnPrestamosText}>Ver mis solicitudes</Text>
      </TouchableOpacity>

      {/* Modal solicitar evento */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Solicitar evento</Text>
              <Text style={styles.modalSubtitle}>Completa la información del evento</Text>

              {[
                { label: 'Nombre del evento *', campo: 'nombre_evento', placeholder: 'Ej: Feria de Emprendimiento', kb: 'default' },
                { label: 'Lugar *', campo: 'lugar', placeholder: 'Ej: Auditorio principal', kb: 'default' },
                { label: 'Fecha del evento * (AAAA-MM-DD)', campo: 'fecha_evento', placeholder: 'Ej: 2026-06-20', kb: 'numeric' },
                { label: 'Hora inicio *', campo: 'hora_inicio', placeholder: 'Ej: 09:00', kb: 'numeric' },
                { label: 'Hora fin *', campo: 'hora_fin', placeholder: 'Ej: 12:00', kb: 'numeric' },
                { label: 'N° de asistentes esperados', campo: 'numero_asistentes', placeholder: 'Ej: 50', kb: 'numeric' },
              ].map(f => (
                <View key={f.campo} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: width * 0.032, color: '#333', marginBottom: 4, fontWeight: '600' }}>{f.label}</Text>
                  <TextInput style={styles.modalInput} placeholder={f.placeholder}
                    placeholderTextColor="#8B9F8F" keyboardType={f.kb as any}
                    value={(form as any)[f.campo]} onChangeText={v => set(f.campo, v)} />
                </View>
              ))}

              <Text style={{ fontSize: width * 0.032, color: '#333', marginBottom: 4, fontWeight: '600' }}>
                Descripción y propósito del evento *
              </Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Describe detalladamente el propósito y las actividades del evento..."
                placeholderTextColor="#8B9F8F" multiline
                value={form.descripcion} onChangeText={v => set('descripcion', v)} />

              <Text style={{ fontSize: width * 0.032, color: '#333', marginBottom: 4, fontWeight: '600' }}>
                Recursos requeridos
              </Text>
              <TextInput style={[styles.modalInput, { marginBottom: 16 }]}
                placeholder="Ej: Video beam, micrófonos, sillas adicionales..."
                placeholderTextColor="#8B9F8F"
                value={form.recursos_requeridos} onChangeText={v => set('recursos_requeridos', v)} />

              <TouchableOpacity style={[styles.modalBtn, enviando && { opacity: 0.7 }]}
                onPress={enviar} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>ENVIAR SOLICITUD</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={styles.modalCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal mis solicitudes de evento */}
      <Modal visible={verMias} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: height * 0.7 }]}>
            <Text style={styles.modalTitle}>Mis solicitudes de evento</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misSolicitudes.length === 0 ? (
                <View style={styles.prestamosEmpty}>
                  <Text style={styles.prestamosEmptyText}>No tienes solicitudes registradas</Text>
                </View>
              ) : misSolicitudes.map(s => (
                <View key={s.id} style={{ backgroundColor: '#F5F5F5', borderRadius: 12,
                  padding: 12, marginBottom: 10 }}>
                  <Text style={{ fontWeight: '700', fontSize: width * 0.036, color: '#1A1A1A' }}>
                    {s.nombre_evento}
                  </Text>
                  <Text style={{ fontSize: width * 0.030, color: '#666', marginTop: 2 }}>
                    {s.lugar} · {s.fecha_evento}
                  </Text>
                  <Text style={{ fontSize: width * 0.030, color: '#666' }}>
                    {s.hora_inicio} – {s.hora_fin}
                    {s.numero_asistentes ? ` · ${s.numero_asistentes} asistentes` : ''}
                  </Text>
                  <View style={{ alignSelf: 'flex-start', marginTop: 6,
                    backgroundColor: estadoColor2[s.estado] ?? '#888',
                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ color: '#fff', fontSize: width * 0.026, fontWeight: '700' }}>
                      {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                    </Text>
                  </View>
                  {s.motivo_rechazo && (
                    <Text style={{ fontSize: width * 0.028, color: '#C62828', marginTop: 4 }}>
                      Motivo rechazo: {s.motivo_rechazo}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setVerMias(false)}>
              <Text style={styles.modalCancelar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Pantalla principal Servicios ──────────────────────────────────────────────
const Servicios = () => {
  const { usuario } = useAuth();
  const esStaff = usuario ? ES_STAFF(usuario.rol) : false;

  const [categorias,     setCategorias]     = useState<Categoria[]>([]);
  const [catActiva,      setCatActiva]      = useState<number | null>(null);
  const [equipos,        setEquipos]        = useState<Equipo[]>([]);
  const [misPrestamos,   setMisPrestamos]   = useState<Prestamo[]>([]);
  const [cargandoEq,     setCargandoEq]     = useState(false);
  const [modalPrestamos, setModalPrestamos] = useState(false);
  const [modalSolicitar, setModalSolicitar] = useState<Equipo | null>(null);
  const [modalDetalle,   setModalDetalle]   = useState<Equipo | null>(null);
  const [observaciones,    setObservaciones]    = useState('');
  const [enviando,         setEnviando]         = useState(false);
  const [modalHistorial,   setModalHistorial]   = useState(false);
  const [historialData,    setHistorialData]    = useState<any[]>([]);
  const [cargandoHist,     setCargandoHist]     = useState(false);
  const [refreshingEq,     setRefreshingEq]     = useState(false);

  // Tabs: 'equipos' | 'salones' | 'eventos'
  const [tabActiva, setTabActiva] = useState<'equipos' | 'salones' | 'eventos'>('equipos');

  useEffect(() => {
    supabase.from('categorias_equipos').select('id, nombre, icono').eq('activa', true)
      .then(({ data }) => {
        const cats = (data ?? []).filter((c: Categoria) => {
          // Aprendices NO ven Salones ni Eventos — solo staff
          if (!esStaff && (c.nombre === 'Salones' || c.nombre === 'Eventos')) return false;
          return true;
        });
        setCategorias(cats);
        if (cats.length > 0) setCatActiva(cats[0].id);
      });
  }, [esStaff]);

  const cargarEquipos = useCallback(async (categoriaId: number) => {
    setCargandoEq(true);
    const { data } = await supabase.from('equipos')
      .select('id, numero, estado, categoria_id, imagen_url, marca, modelo, descripcion, caracteristicas')
      .eq('categoria_id', categoriaId).eq('activo', true).order('numero', { ascending: true });
    setEquipos(data ?? []);
    setCargandoEq(false);
  }, []);

  useEffect(() => {
    if (!catActiva) return;
    cargarEquipos(catActiva);
    const channel = supabase.channel('equipos-cat-' + catActiva + '-' + Date.now())
      .on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'equipos' },
        (payload: any) => setEquipos(prev => prev.map(eq =>
          eq.id === payload.new.id ? { ...eq, estado: payload.new.estado } : eq)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [catActiva, cargarEquipos]);

  const cargarMisPrestamos = async () => {
    if (!usuario) return;
    const { data } = await supabase.from('prestamos')
      .select('id, estado, fecha_solicitud, equipos(numero, categorias_equipos(nombre))')
      .eq('usuario_id', usuario.id).in('estado', ['pendiente', 'aceptado'])
      .order('fecha_solicitud', { ascending: false });
    setMisPrestamos((data as any) ?? []);
  };

  const cargarHistorial = async () => {
    if (!usuario) return;
    setCargandoHist(true);
    const { data } = await supabase.from('prestamos')
      .select('id, estado, fecha_solicitud, motivo_rechazo, equipos(numero, categorias_equipos(nombre))')
      .eq('usuario_id', usuario.id)
      .order('fecha_solicitud', { ascending: false });
    setHistorialData((data as any) ?? []);
    setCargandoHist(false);
  };

  const cancelarPrestamo = async (prestamoId: number) => {
    Alert.alert(
      'Cancelar solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('prestamos')
              .delete().eq('id', prestamoId);
            if (error) {
              Alert.alert('Error', 'No se pudo cancelar. Intenta de nuevo.');
              return;
            }
            setMisPrestamos(prev => prev.filter(p => p.id !== prestamoId));
          },
        },
      ]
    );
  };

  const onRefreshEquipos = async () => {
    if (!catActiva) return;
    setRefreshingEq(true);
    await cargarEquipos(catActiva);
    setRefreshingEq(false);
  };

  const handleSolicitar = async () => {
    if (!usuario || !modalSolicitar) return;
    const { count } = await supabase.from('prestamos')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', usuario.id).eq('equipo_id', modalSolicitar.id)
      .in('estado', ['pendiente', 'aceptado']);
    if ((count ?? 0) > 0) { Alert.alert('Solicitud duplicada', 'Ya tienes una solicitud activa de este equipo.'); return; }
    setEnviando(true);
    const { error } = await supabase.from('prestamos').insert({
      usuario_id: usuario.id, equipo_id: modalSolicitar.id,
      estado: 'pendiente', observaciones: observaciones.trim() || null,
    });
    setEnviando(false);
    if (error) { Alert.alert('Error', 'No se pudo enviar la solicitud.'); return; }
    setModalSolicitar(null); setObservaciones('');
    Alert.alert('Solicitud enviada ✓', 'Recibirás una notificación cuando sea procesada.');
  };

  const catActivaObj = categorias.find(c => c.id === catActiva);
  const esTablet     = catActivaObj?.nombre?.toLowerCase().includes('tablet');

  return (
    <View style={styles.fondoinicial}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 0 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshingEq} onRefresh={onRefreshEquipos} colors={['#2E7D32']} tintColor="#2E7D32" />
        }>

        {/* Header */}
        <View style={[styles.headerRow, { paddingHorizontal: width * 0.045 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Servicios</Text>
            <Text style={styles.pageSubtitle}>Gestión de recursos y préstamos institucionales</Text>
          </View>
        </View>

        {/* Tabs — solo staff ve salones y eventos */}
        {esStaff && (
          <View style={{ flexDirection: 'row', marginHorizontal: width * 0.045,
            marginBottom: 16, backgroundColor: '#E8F5E9', borderRadius: 14, padding: 4 }}>
            {([
              { key: 'equipos', label: 'Equipos',  icon: 'laptop-outline' },
              { key: 'salones', label: 'Salones',  icon: 'business-outline' },
              { key: 'eventos', label: 'Eventos',  icon: 'calendar-outline' },
            ] as const).map(tab => (
              <TouchableOpacity key={tab.key}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: tabActiva === tab.key ? '#2E7D32' : 'transparent' }}
                onPress={() => setTabActiva(tab.key)}>
                <Ionicons name={tab.icon} size={15}
                  color={tabActiva === tab.key ? '#fff' : '#2E7D32'} />
                <Text style={{ fontSize: width * 0.030, fontWeight: '700',
                  color: tabActiva === tab.key ? '#fff' : '#2E7D32' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Tab Equipos ──────────────────────────────────────────────── */}
        {tabActiva === 'equipos' && (
          <View style={{ paddingHorizontal: width * 0.045 }}>
            {/* Categorías */}
            <View style={styles.categoriasRow}>
              {categorias.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.categoriaItem} onPress={() => setCatActiva(cat.id)}>
                  <View style={[styles.categoriaImgWrapper, catActiva === cat.id && styles.categoriaImgWrapperActive]}>
                    <Ionicons name={(cat.icono as any) ?? 'cube-outline'} size={32}
                      color={catActiva === cat.id ? '#2E7D32' : '#888'} />
                  </View>
                  <Text style={[styles.categoriaLabel, catActiva === cat.id && styles.categoriaLabelActive]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#2E7D32', borderRadius: 14,
                  paddingVertical: 13, alignItems: 'center', elevation: 2,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.12, shadowRadius: 3 }}
                onPress={() => { cargarMisPrestamos(); setModalPrestamos(true); }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: width * 0.038 }}>
                  Mis préstamos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#1565C0', borderRadius: 14,
                  paddingVertical: 13, alignItems: 'center', elevation: 2,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.12, shadowRadius: 3 }}
                onPress={() => { cargarHistorial(); setModalHistorial(true); }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: width * 0.038 }}>
                  Historial
                </Text>
              </TouchableOpacity>
            </View>

            {cargandoEq ? (
              <View style={[styles.grid, { marginTop: 8 }]}>
                <SkeletonEquipoCard />
                <SkeletonEquipoCard />
                <SkeletonEquipoCard />
                <SkeletonEquipoCard />
              </View>
            ) : (
              <View style={styles.grid}>
                {equipos.length === 0 && (
                  <Text style={{ color: '#999', textAlign: 'center', width: '100%', marginTop: 20 }}>
                    No hay equipos en esta categoría.
                  </Text>
                )}
                {equipos.map(eq => (
                  <TouchableOpacity key={eq.id} style={styles.equipoCard}
                    activeOpacity={0.88} onPress={() => setModalDetalle(eq)}>
                    <View style={[styles.estadoBadge, { backgroundColor: estadoColor[eq.estado] ?? '#888' }]}>
                      <Text style={styles.estadoText}>{estadoLabel[eq.estado] ?? eq.estado}</Text>
                    </View>
                    <Image
                      source={getImgCategoria(catActivaObj?.nombre, eq.imagen_url)}
                      style={styles.equipoImgPlaceholder} resizeMode="contain" />
                    {(catActivaObj?.nombre === 'Juegos de mesa' || catActivaObj?.nombre === 'Libros')
                      ? <Text style={[styles.equipoNumero, { fontSize: width * 0.032, lineHeight: width * 0.042 }]} numberOfLines={2}>
                          {eq.descripcion ?? `#${eq.numero}`}
                        </Text>
                      : <Text style={styles.equipoNumero}>#{eq.numero}</Text>
                    }
                    {(eq.marca || eq.modelo) && catActivaObj?.nombre !== 'Juegos de mesa' && catActivaObj?.nombre !== 'Libros' && (
                      <Text style={{ fontSize: width * 0.026, color: '#888', marginBottom: 6, textAlign: 'center' }}>
                        {[eq.marca, eq.modelo].filter(Boolean).join(' ')}
                      </Text>
                    )}
                    {catActivaObj?.nombre === 'Libros' && eq.marca && (
                      <Text style={{ fontSize: width * 0.026, color: '#888', marginBottom: 6, textAlign: 'center' }} numberOfLines={1}>
                        {eq.marca}
                      </Text>
                    )}
                    <TouchableOpacity style={[styles.btnSolicitar, { marginBottom: 6 }]} onPress={() => setModalDetalle(eq)}>
                      <Text style={styles.btnSolicitarText}>Ver detalles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnSolicitar, { borderColor: eq.estado === 'disponible' ? '#2E7D32' : '#DDD' },
                        eq.estado !== 'disponible' && { opacity: 0.4 }]}
                      onPress={() => eq.estado === 'disponible' && setModalSolicitar(eq)}
                      disabled={eq.estado !== 'disponible'}>
                      <Text style={[styles.btnSolicitarText, { color: eq.estado === 'disponible' ? '#2E7D32' : '#999' }]}>
                        {eq.estado === 'disponible' ? 'Solicitar' : 'No disponible'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Tab Salones (solo staff) ──────────────────────────────────── */}
        {tabActiva === 'salones' && esStaff && usuario && (
          <SeccionSalones userId={usuario.id} />
        )}

        {/* ── Tab Eventos (solo staff) ──────────────────────────────────── */}
        {tabActiva === 'eventos' && esStaff && usuario && (
          <SeccionEventos userId={usuario.id} />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal detalle equipo */}
      <Modal visible={!!modalDetalle} transparent animationType="slide" onRequestClose={() => setModalDetalle(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: height * 0.88, overflow: 'hidden' }}>
            <View style={{ padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
              flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <Image source={getImgCategoria(catActivaObj?.nombre, modalDetalle?.imagen_url)}
                style={{ width: width * 0.22, height: width * 0.22, borderRadius: 12, backgroundColor: '#E8F5E9' }}
                resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <View style={{ alignSelf: 'flex-start',
                  backgroundColor: (estadoColor[modalDetalle?.estado ?? 'disponible'] ?? '#888') + '20',
                  borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 }}>
                  <Text style={{ fontSize: width * 0.026, fontWeight: '700',
                    color: estadoColor[modalDetalle?.estado ?? 'disponible'] ?? '#888' }}>
                    {estadoLabel[modalDetalle?.estado ?? 'disponible']}
                  </Text>
                </View>
                <Text style={{ fontSize: width * 0.045, fontWeight: '800', color: '#1A1A1A' }}>
                  {(catActivaObj?.nombre === 'Juegos de mesa' || catActivaObj?.nombre === 'Libros')
                    ? (modalDetalle?.descripcion ?? `${catActivaObj?.nombre} #${modalDetalle?.numero}`)
                    : `${catActivaObj?.nombre} #${modalDetalle?.numero}`}
                </Text>
                {(modalDetalle?.marca || modalDetalle?.modelo) && catActivaObj?.nombre !== 'Juegos de mesa' && (
                  <Text style={{ fontSize: width * 0.034, color: '#666', marginTop: 2 }}>
                    {[modalDetalle?.marca, modalDetalle?.modelo].filter(Boolean).join(' ')}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setModalDetalle(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
              {modalDetalle?.caracteristicas && Object.keys(modalDetalle.caracteristicas).length > 0 ? (
                <>
                  <Text style={{ fontSize: width * 0.038, fontWeight: '800', color: '#1A1A1A', marginBottom: 14 }}>
                    Características
                  </Text>
                  <CaracteristicasDetalle data={modalDetalle.caracteristicas} />
                </>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 30, gap: 10 }}>
                  <Ionicons name="information-circle-outline" size={40} color="#CCC" />
                  <Text style={{ color: '#CCC', fontSize: width * 0.034, textAlign: 'center' }}>
                    No hay características registradas para este equipo.
                  </Text>
                </View>
              )}
              {modalDetalle?.estado === 'disponible' ? (
                <TouchableOpacity style={[styles.modalBtn, { marginTop: 16 }]}
                  onPress={() => { setModalDetalle(null); setModalSolicitar(modalDetalle); }}>
                  <Text style={styles.modalBtnText}>SOLICITAR PRÉSTAMO</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, marginTop: 16,
                  flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="time-outline" size={18} color="#E65100" />
                  <Text style={{ fontSize: width * 0.032, color: '#E65100', flex: 1 }}>
                    Este equipo no está disponible para préstamo en este momento.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal solicitar préstamo */}
      <Modal visible={!!modalSolicitar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar préstamo</Text>
            <Text style={styles.modalSubtitle}>
              {catActivaObj?.nombre} N° {modalSolicitar?.numero}
              {modalSolicitar?.marca ? ` — ${modalSolicitar.marca}` : ''}
            </Text>
            <Text style={{ fontSize: width * 0.034, color: '#333', marginBottom: 6 }}>Observaciones (opcional)</Text>
            <TextInput style={styles.modalInput} placeholder="Ej: necesito para exposición del martes"
              placeholderTextColor="#8B9F8F" value={observaciones} onChangeText={setObservaciones} multiline />
            <TouchableOpacity style={[styles.modalBtn, enviando && { opacity: 0.7 }]}
              onPress={handleSolicitar} disabled={enviando}>
              {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>ENVIAR SOLICITUD</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModalSolicitar(null); setObservaciones(''); }}>
              <Text style={styles.modalCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal mis préstamos */}
      <Modal visible={modalPrestamos} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mis préstamos activos</Text>
            {misPrestamos.length === 0 ? (
              <View style={styles.prestamosEmpty}>
                <Ionicons name="checkmark-circle-outline" size={36} color="#C8E6C9" />
                <Text style={[styles.prestamosEmptyText, { marginTop: 8 }]}>No tienes préstamos activos</Text>
              </View>
            ) : (
              misPrestamos.map(p => (
                <View key={p.id} style={{ backgroundColor: '#F8F8F8', borderRadius: 14,
                  padding: 14, marginBottom: 10, borderLeftWidth: 3,
                  borderLeftColor: p.estado === 'aceptado' ? '#2E7D32' : '#F57F17' }}>
                  <Text style={{ fontWeight: '700', color: '#1A1A1A', fontSize: width * 0.038 }}>
                    Equipo N° {(p as any).equipos?.numero ?? '—'}
                    {'  '}<Text style={{ fontWeight: '400', color: '#666' }}>
                      {(p as any).equipos?.categorias_equipos?.nombre ?? ''}
                    </Text>
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{
                      backgroundColor: p.estado === 'aceptado' ? '#E8F5E9' : '#FFF3E0',
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: p.estado === 'aceptado' ? '#2E7D32' : '#E65100',
                        fontSize: width * 0.030, fontWeight: '700' }}>
                        {p.estado === 'aceptado' ? '✓ Aceptado' : '⏳ Pendiente'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity onPress={() => setModalPrestamos(false)}>
              <Text style={styles.modalCancelar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal historial completo de préstamos */}
      <Modal visible={modalHistorial} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: height * 0.82 }]}>
            <Text style={styles.modalTitle}>Historial de préstamos</Text>
            {cargandoHist ? (
              <ActivityIndicator color="#2E7D32" style={{ marginVertical: 20 }} />
            ) : historialData.length === 0 ? (
              <View style={styles.prestamosEmpty}>
                <Ionicons name="time-outline" size={36} color="#C8E6C9" />
                <Text style={[styles.prestamosEmptyText, { marginTop: 8 }]}>No tienes préstamos registrados</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {historialData.map(p => {
                  const colorEstado: Record<string, string> = {
                    aceptado: '#2E7D32', rechazado: '#C62828',
                    pendiente: '#F57F17', devuelto: '#1565C0',
                  };
                  const iconEstado: Record<string, string> = {
                    aceptado: 'checkmark-circle-outline', rechazado: 'close-circle-outline',
                    pendiente: 'time-outline', devuelto: 'return-down-back-outline',
                  };
                  const color = colorEstado[p.estado] ?? '#888';
                  return (
                    <View key={p.id} style={{ backgroundColor: '#F8F8F8', borderRadius: 12,
                      padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: color }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Ionicons name={iconEstado[p.estado] as any ?? 'ellipse-outline'} size={18} color={color} />
                        <Text style={{ fontWeight: '700', color: '#1A1A1A', fontSize: width * 0.036, flex: 1 }}>
                          Equipo N° {p.equipos?.numero ?? '—'}
                          {'  '}<Text style={{ fontWeight: '400', color: '#666' }}>
                            {p.equipos?.categorias_equipos?.nombre ?? ''}
                          </Text>
                        </Text>
                      </View>
                      <Text style={{ fontSize: width * 0.028, color: '#999', marginBottom: 6 }}>
                        {new Date(p.fecha_solicitud).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </Text>
                      <View style={{ alignSelf: 'flex-start', backgroundColor: color + '18',
                        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                        <Text style={{ color, fontSize: width * 0.028, fontWeight: '700' }}>
                          {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                        </Text>
                      </View>
                      {p.motivo_rechazo && (
                        <Text style={{ fontSize: width * 0.028, color: '#C62828', marginTop: 6 }}>
                          Motivo: {p.motivo_rechazo}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setModalHistorial(false)}>
              <Text style={styles.modalCancelar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Servicios;