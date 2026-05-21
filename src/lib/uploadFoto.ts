import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

const FOTO_WIDTH  = 600;
const FOTO_HEIGHT = 800;

export const uploadFoto = async (
  uri: string,
  userId: string,
): Promise<string | null> => {
  try {
    // 1. Procesar imagen → base64
    const procesada = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: FOTO_WIDTH, height: FOTO_HEIGHT } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );

    if (!procesada.base64) return null;

    // 2. Verificar sesión activa
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return null;

    // 3. Borrar fotos anteriores del usuario
    const { data: archivosViejos } = await supabase.storage
      .from('fotos-perfil')
      .list(userId);
    if (archivosViejos && archivosViejos.length > 0) {
      const paths = archivosViejos.map(f => `${userId}/${f.name}`);
      await supabase.storage.from('fotos-perfil').remove(paths);
    }

    // 4. Definir nuevo path con timestamp
    const path = `${userId}/perfil_${Date.now()}.jpg`;

    // 5. Convertir base64 → Uint8Array
    const binaryStr = atob(procesada.base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // 6. Subir foto nueva
    const { error } = await supabase.storage
      .from('fotos-perfil')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });

    if (error) return null;

    // 7. Retornar URL pública
    const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path);
    return data.publicUrl ?? null;

  } catch {
    return null;
  }
};