import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from '../css/Barrasup';

const Barrasup = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigation = useNavigation<any>();
  const [notifCount, setNotifCount] = useState(0);
  const channelRef = useRef<any>(null);

  const fetchCount = async (uid: string) => {
    const { count } = await supabase
      .from('notificaciones')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', uid)
      .eq('leida', false);
    setNotifCount(count ?? 0);
  };

  useEffect(() => {
    if (!usuario?.id) return;

    fetchCount(usuario.id);

    // Canal sin filter en la query — filtramos manualmente en el callback
    // Esto evita el error "cannot add postgres_changes callbacks after subscribe()"
    channelRef.current = supabase
      .channel(`notifs-bar-${usuario.id}-${Date.now()}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'notificaciones',
        },
        (payload: any) => {
          // Filtrar solo las del usuario actual
          const uid = usuario.id;
          const row = payload.new ?? payload.old;
          if (row?.usuario_id !== uid) return;
          // Recontar desde la BD para precisión
          fetchCount(uid);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          // Recontar al conectar por si hubo cambios mientras no había conexión
          fetchCount(usuario.id);
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [usuario?.id]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>

        {/* Izquierda: avatar + nombre */}
        <TouchableOpacity
          style={styles.left}
          onPress={() => navigation.navigate('EditarPerfil')}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="person-outline" size={22} color="#fff" />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {usuario
                ? `${usuario.primer_nombre} ${usuario.primer_apellido}`
                : 'Cenicard'}
            </Text>
            <Text style={styles.subtitle}>
              {usuario?.rol?.toUpperCase() ?? ''} · Editar perfil
            </Text>
          </View>
        </TouchableOpacity>

        {/* Derecha: badge + logo + salir */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

          {/* Badge notificaciones — toca para ir a Notificaciones */}
          {notifCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notificaciones')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                backgroundColor: '#E53935',
                borderRadius: 12,
                minWidth: 22,
                height: 22,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                {notifCount > 99 ? '99+' : notifCount}
              </Text>
            </TouchableOpacity>
          )}

          {/* Logo SENA */}
          <Image
            source={require('../Img/logo_sena.png')}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />

          {/* Cerrar sesión */}
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
};

export default Barrasup;