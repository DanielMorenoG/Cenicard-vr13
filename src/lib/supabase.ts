import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// ─── Reemplaza estos valores con los de tu proyecto Supabase ───────────────────
// Los encuentras en: Supabase Dashboard → Settings → API
const SUPABASE_URL = "https://vgvayzqjeodjeumylqir.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yp0YxUDhgCOtAEccu4hhVw_kqRod-AD";
// ──────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          primer_nombre: string;
          segundo_nombre: string | null;
          primer_apellido: string;
          segundo_apellido: string | null;
          numero_cc: string;
          correo: string;
          celular: string | null;
          rol: "aprendiz" | "funcionario";
          ficha_id: number | null;
          centro_formacion: string | null;
          regional: string | null;
          rh: string | null;
          fecha_vencimiento_carne: string | null;
          foto_url: string | null;
          estado_carne: "activo" | "bloqueado" | "prestamo" | "vencido";
          eps: string | null;
          condicion_medica: string | null;
          contacto_emergencia_nombre: string | null;
          contacto_emergencia_telefono: string | null;
          perfil_profesional: string | null;
          carnet_trasero_completado: boolean;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      fichas: {
        Row: {
          id: number;
          codigo_ficha: string;
          nombre_programa: string;
          centro_formacion: string;
          regional: string;
          cupos_maximos: number;
          activa: boolean;
        };
      };
      noticias: {
        Row: {
          id: number;
          titulo: string;
          descripcion: string;
          imagen_url: string | null;
          publicado: boolean;
          created_at: string;
        };
      };
      equipos: {
        Row: {
          id: number;
          numero: number;
          categoria_id: number;
          marca: string | null;
          modelo: string | null;
          descripcion: string | null;
          estado: "disponible" | "no_disponible" | "ocupado";
          imagen_url: string | null;
        };
      };
      categorias_equipos: {
        Row: {
          id: number;
          nombre: string;
          icono: string | null;
          activa: boolean;
        };
      };
      prestamos: {
        Row: {
          id: number;
          usuario_id: string;
          equipo_id: number;
          estado: "pendiente" | "aceptado" | "rechazado" | "devuelto";
          fecha_solicitud: string;
          fecha_devolucion_esperada: string | null;
          motivo_rechazo: string | null;
          observaciones: string | null;
        };
      };
      notificaciones: {
        Row: {
          id: number;
          usuario_id: string;
          tipo: string;
          titulo: string;
          descripcion: string | null;
          leida: boolean;
          icono: string | null;
          created_at: string;
        };
      };
    };
  };
};
