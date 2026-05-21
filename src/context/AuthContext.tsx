import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Usuario = {
  id: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  numero_cc: string;
  correo: string;
  celular: string | null;
  rol: 'aprendiz' | 'instructor' | 'funcionario' | 'contratista' | 'admin';
  ficha_id: number | null;
  centro_formacion: string | null;
  regional: string | null;
  rh: string | null;
  fecha_vencimiento_carne: string | null;
  foto_url: string | null;
  estado_carne: 'activo' | 'bloqueado' | 'prestamo' | 'vencido';
  eps: string | null;
  condicion_medica: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  perfil_profesional: string | null;
  carnet_trasero_completado: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
  fichas?: {
    codigo_ficha: string;
    nombre_programa: string;
    centro_formacion: string;
    regional: string;
  } | null;
};

const CACHE_KEY      = 'cenicard_usuario_cache';
const CACHE_FOTO_KEY = 'cenicard_usuario_foto';

// Guarda datos del usuario en dos claves separadas:
// 1. Datos del perfil sin la foto (liviano, siempre disponible)
// 2. Foto por separado (puede ser base64 grande ~200KB)
const guardarCache = async (u: Usuario) => {
  try {
    const { foto_url, ...sinFoto } = u;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sinFoto));
    // Siempre actualizar el caché de foto (borrar si es null, guardar si hay valor)
    if (foto_url) {
      await AsyncStorage.setItem(CACHE_FOTO_KEY, foto_url);
    } else {
      await AsyncStorage.removeItem(CACHE_FOTO_KEY);
    }
  } catch {}
};

const leerCache = async (): Promise<Usuario | null> => {
  try {
    const r = await AsyncStorage.getItem(CACHE_KEY);
    if (!r) return null;
    const usuario = JSON.parse(r) as Usuario;
    // Reinyectar la foto guardada por separado
    try {
      const foto = await AsyncStorage.getItem(CACHE_FOTO_KEY);
      if (foto) usuario.foto_url = foto;
    } catch {}
    return usuario;
  } catch { return null; }
};

const limpiarCache = async () => {
  try {
    await AsyncStorage.multiRemove([CACHE_KEY, CACHE_FOTO_KEY]);
  } catch {}
};

type AuthContextType = {
  session: any;
  usuario: Usuario | null;
  cargando: boolean;
  offline: boolean;
  cerrarSesion: () => Promise<void>;
  recargarUsuario: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null, usuario: null, cargando: true,
  offline: false,
  cerrarSesion: async () => {}, recargarUsuario: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session,  setSession]  = useState<any>(null);
  const [usuario,  setUsuario]  = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [offline,  setOffline]  = useState(false);
  const realtimeChannelRef = useRef<any>(null);

  const cargarUsuario = async (uid: string, intentos = 3): Promise<void> => {
    for (let i = 0; i < intentos; i++) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*, fichas(codigo_ficha, nombre_programa, centro_formacion, regional)')
          .eq('id', uid)
          .maybeSingle();

        if (data) {
          const u = data as Usuario;
          if (u.fecha_vencimiento_carne && u.estado_carne === 'activo') {
            if (new Date(u.fecha_vencimiento_carne) < new Date()) {
              await supabase.from('usuarios').update({ estado_carne: 'vencido' }).eq('id', uid);
              u.estado_carne = 'vencido';
            }
          }
          setUsuario(u);
          setOffline(false);
          await guardarCache(u);
          return;
        }
        if (error) throw error;
      } catch (e: any) {
        const esErrorRed = e?.message?.includes('NetworkError') || e?.message?.includes('network') || e?.message?.includes('fetch');
        if (esErrorRed || i === intentos - 1) {
          const cached = await leerCache();
          if (cached) { setUsuario(cached); setOffline(true); return; }
        }
      }
      if (i < intentos - 1) await new Promise(r => setTimeout(r, 800));
    }
    const cached = await leerCache();
    if (cached) { setUsuario(cached); setOffline(true); }
    else setUsuario(null);
  };

  const suscribirRealtime = (uid: string) => {
    if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
    const channel = supabase
      .channel('usuario-perfil-' + uid)
      .on('postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'usuarios' },
        async (payload: any) => {
          if (payload.new?.id !== uid) return;
          // Recargar completo desde BD para asegurar foto_url y todos los campos
          await cargarUsuario(uid);
          setOffline(false);
        }
      )
      .subscribe();
    realtimeChannelRef.current = channel;
  };

  const recargarUsuario = async () => {
    if (session?.user?.id) await cargarUsuario(session.user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        cargarUsuario(session.user.id).finally(() => setCargando(false));
        suscribirRealtime(session.user.id);
      } else {
        leerCache().then(cached => {
          if (cached) setUsuario(cached);
          setCargando(false);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === 'TOKEN_REFRESHED' && !sess) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUsuario(null);
        limpiarCache();
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
        return;
      }

      setSession(sess);
      if (sess?.user?.id) {
        cargarUsuario(sess.user.id);
        suscribirRealtime(sess.user.id);
      } else {
        setUsuario(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
    };
  }, []);

  const cerrarSesion = async () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    await supabase.auth.signOut();
    await limpiarCache();
    setSession(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ session, usuario, cargando, offline, cerrarSesion, recargarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);