import { Ionicons } from '@expo/vector-icons';
import { SkeletonNotifCard } from './SkeletonBox';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, PanResponder, RefreshControl,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from '../css/Notificaciones';

type Notificacion = {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  leida: boolean;
  icono: string | null;
  created_at: string;
};

const tiempoRelativo = (fecha: string) => {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora';
  if (mins < 60) return `${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  return `${dias}d`;
};

const iconoDefault = (tipo: string): any => {
  const map: Record<string, string> = {
    prestamo_aceptado:   'checkmark-circle-outline',
    prestamo_rechazado:  'close-circle-outline',
    prestamo_devolucion: 'return-down-back-outline',
    carne_bloqueado:     'warning-outline',
    carne_activado:      'shield-checkmark-outline',
    perfil_actualizado:  'person-circle-outline',
    mensaje_nuevo:       'chatbubble-outline',
    registro_exitoso:    'person-add-outline',
    carne_por_vencer:    'time-outline',
  };
  return (map[tipo] ?? 'notifications-outline') as any;
};

const colorPorTipo = (tipo: string): string => {
  if (tipo.includes('rechazado') || tipo.includes('bloqueado')) return '#E53935';
  if (tipo.includes('vencer'))                                   return '#F57F17';
  return '#2E7D32';
};

// ── Tarjeta con swipe para eliminar ─────────────────────────────────────────
const NotifCard = ({
  n,
  expandida,
  onToggle,
  onMarcarLeida,
  onEliminar,
}: {
  n: Notificacion;
  expandida: boolean;
  onToggle: (id: number) => void;
  onMarcarLeida: (id: number) => void;
  onEliminar: (id: number) => void;
}) => {
  const anim        = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const translateX  = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const color       = colorPorTipo(n.tipo);
  const swipeRef    = useRef(false); // true si está en modo swipe

  // ── Sync expand animation ──
  useEffect(() => {
    Animated.spring(anim, {
      toValue: expandida ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [expandida]);

  // ── PanResponder para swipe izquierda ──
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => { swipeRef.current = true; },
      onPanResponderMove: (_, g) => {
        const x = Math.min(0, g.dx); // solo izquierda
        translateX.setValue(x);
        // mostrar fondo rojo proporcionalmente
        const progress = Math.min(1, Math.abs(x) / 80);
        deleteOpacity.setValue(progress);
      },
      onPanResponderRelease: (_, g) => {
        swipeRef.current = false;
        if (g.dx < -80) {
          // Confirmar eliminación
          Alert.alert(
            'Eliminar notificación',
            '¿Deseas eliminar esta notificación?',
            [
              {
                text: 'Cancelar',
                onPress: () => {
                  Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                  Animated.timing(deleteOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
                },
              },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => onEliminar(n.id),
              },
            ]
          );
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          Animated.timing(deleteOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const toggleExpand = () => {
    if (swipeRef.current) return;
    if (expandida && !n.leida) onMarcarLeida(n.id);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(n.id);
  };

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
  const opacity   = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ marginBottom: 10, position: 'relative' }}>
      {/* Fondo rojo (eliminar) */}
      <Animated.View style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: 80, borderRadius: 16,
        backgroundColor: '#E53935',
        justifyContent: 'center', alignItems: 'center',
        opacity: deleteOpacity,
      }}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 }}>Eliminar</Text>
      </Animated.View>

      {/* Tarjeta deslizable */}
      <Animated.View
        style={{ transform: [{ translateX }, { scale: scaleAnim }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.card,
            { marginBottom: 0 },
            !n.leida && { borderLeftWidth: 3, borderLeftColor: color },
            expandida && { shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
          ]}
          onPress={toggleExpand}
          activeOpacity={0.9}
        >
          {/* Icono */}
          <View style={[styles.iconWrapper, { backgroundColor: color + '18' }]}>
            <Ionicons name={n.icono as any ?? iconoDefault(n.tipo)} size={22} color={color} />
          </View>

          {/* Cuerpo */}
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text
                style={[styles.cardTitulo, !n.leida && { fontWeight: '800', color: '#111' }]}
                numberOfLines={expandida ? undefined : 1}
              >
                {n.titulo}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {!n.leida && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
                )}
                <Text style={styles.cardHora}>{tiempoRelativo(n.created_at)}</Text>
              </View>
            </View>

            {/* Descripción animada */}
            {n.descripcion ? (
              <Animated.View style={{ maxHeight, opacity, overflow: 'hidden' }}>
                <View style={{
                  marginTop: 8, padding: 10,
                  backgroundColor: color + '0D',
                  borderRadius: 10,
                  borderLeftWidth: 2, borderLeftColor: color + '66',
                }}>
                  <Text style={[styles.cardDesc, { color: '#333' }]}>{n.descripcion}</Text>
                </View>
              </Animated.View>
            ) : null}

            {/* Hint */}
            {n.descripcion && !expandida && (
              <Text style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>
                Toca para ver más ↓
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ── Pantalla principal ────────────────────────────────────────────────────────
const Notificaciones = () => {
  const { usuario } = useAuth();
  const [notifs,     setNotifs]     = useState<Notificacion[]>([]);
  const [cargando,   setCargando]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (id: number) =>
    setExpandedId(prev => prev === id ? null : id);

  const onRefresh = () => { setRefreshing(true); cargarNotifs(); };

  const cargarNotifs = async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs(data ?? []);
    setCargando(false);
    setRefreshing(false);
  };

  const marcarLeida = async (id: number) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const marcarTodasLeidas = async () => {
    if (!usuario) return;
    await supabase.from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', usuario.id)
      .eq('leida', false);
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  };

  // ── Eliminar una notificación (solo si tiene más de 1 día) ──
  const eliminarNotif = async (id: number) => {
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      const horas = (Date.now() - new Date(notif.created_at).getTime()) / 3600000;
      if (horas < 24) {
        Alert.alert('No disponible', 'Solo puedes eliminar notificaciones con más de 24 horas de antigüedad.');
        return;
      }
    }
    const { error } = await supabase.from('notificaciones').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'No se pudo eliminar: ' + error.message);
      return;
    }
    setNotifs(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // ── Eliminar todas (solo las de más de 1 día) ──
  const eliminarTodas = () => {
    if (!usuario) return;
    const eliminables = notifs.filter(n => {
      const horas = (Date.now() - new Date(n.created_at).getTime()) / 3600000;
      return horas >= 24;
    });
    if (eliminables.length === 0) {
      Alert.alert('Sin notificaciones', 'No hay notificaciones con más de 24 horas para eliminar.');
      return;
    }
    Alert.alert(
      'Eliminar anteriores',
      `¿Deseas eliminar ${eliminables.length} notificación${eliminables.length > 1 ? 'es' : ''} con más de 24 horas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const ids = eliminables.map(n => n.id);
            await supabase.from('notificaciones')
              .delete()
              .in('id', ids);
            setNotifs(prev => prev.filter(n => !ids.includes(n.id)));
            setExpandedId(null);
          },
        },
      ]
    );
  };

  useEffect(() => {
    cargarNotifs();
    if (!usuario) return;
    const uid = usuario.id;
    const channel = supabase
      .channel('notifs-page-' + uid + '-' + Date.now())
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'notificaciones' },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.usuario_id !== uid) return;
          if (payload.eventType === 'INSERT') {
            setNotifs(prev => [payload.new as Notificacion, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            // Remover del estado local sin recargar desde BD
            setNotifs(prev => prev.filter(n => n.id !== payload.old?.id));
          } else if (payload.eventType === 'UPDATE') {
            setNotifs(prev => prev.map(n =>
              n.id === payload.new?.id ? { ...n, ...payload.new } : n
            ));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [usuario?.id]);

  const noLeidas = notifs.filter(n => !n.leida);
  const leidas   = notifs.filter(n =>  n.leida);

  if (cargando) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.seccionLabel}>NUEVAS</Text>
        <SkeletonNotifCard />
        <SkeletonNotifCard />
        <SkeletonNotifCard />
        <Text style={[styles.seccionLabel, { marginTop: 16 }]}>ANTERIORES</Text>
        <SkeletonNotifCard />
        <SkeletonNotifCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} tintColor="#2E7D32" />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.pageTitle}>Notificaciones</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {noLeidas.length > 0 && (
            <TouchableOpacity onPress={marcarTodasLeidas} style={{
              backgroundColor: '#E8F5E9',
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            }}>
              <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: '700' }}>✓ Leídas</Text>
            </TouchableOpacity>
          )}
          {notifs.length > 0 && (
            <TouchableOpacity onPress={eliminarTodas} style={{
              backgroundColor: '#FFEBEE',
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            }}>
              <Text style={{ color: '#E53935', fontSize: 12, fontWeight: '700' }}>🗑 Borrar todo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hint swipe */}
      {notifs.length > 0 && (
        <Text style={{ fontSize: 11, color: '#bbb', marginBottom: 12, marginLeft: 2 }}>
          ← Desliza para eliminar notificaciones de más de 24h
        </Text>
      )}

      {/* Vacío */}
      {notifs.length === 0 && (
        <View style={styles.emptyRow}>
          <Ionicons name="notifications-off-outline" size={40} color="#CCC" />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
        </View>
      )}

      {/* No leídas */}
      {noLeidas.length > 0 && (
        <>
          <Text style={styles.seccionLabel}>NUEVAS ({noLeidas.length})</Text>
          {noLeidas.map(n => (
            <NotifCard
              key={n.id} n={n}
              expandida={expandedId === n.id}
              onToggle={handleToggle}
              onMarcarLeida={marcarLeida}
              onEliminar={eliminarNotif}
            />
          ))}
        </>
      )}

      {/* Leídas */}
      {leidas.length > 0 && (
        <>
          <Text style={[styles.seccionLabel, { marginTop: 16 }]}>ANTERIORES</Text>
          {leidas.map(n => (
            <NotifCard
              key={n.id} n={n}
              expandida={expandedId === n.id}
              onToggle={handleToggle}
              onMarcarLeida={marcarLeida}
              onEliminar={eliminarNotif}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default Notificaciones;