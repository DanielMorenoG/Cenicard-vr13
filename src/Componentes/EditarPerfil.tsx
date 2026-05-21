import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import styles from "../css/Registro";
import { supabase } from "../lib/supabase";
import { uploadFoto } from "../lib/uploadFoto";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SelectorRH = ({ valor, onSelect }: { valor: string; onSelect: (v: string) => void }) => {
  const [abierto, setAbierto] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        onPress={() => setAbierto(!abierto)}
        style={[styles.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }]}
      >
        <Text style={{ color: valor ? "#1A1A1A" : "#8B9F8F", fontSize: 14 }}>{valor || "Selecciona RH"}</Text>
        <Text style={{ color: "#2E7D32" }}>{abierto ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {abierto && (
        <View style={{ borderRadius: 12, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#2E7D32", overflow: "hidden", marginTop: -8, elevation: 4 }}>
          {TIPOS_SANGRE.map(op => (
            <TouchableOpacity key={op} onPress={() => { onSelect(op); setAbierto(false); }}
              style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: valor === op ? "#e8f5e9" : "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}>
              <Text style={{ color: valor === op ? "#2E7D32" : "#1A1A1A", fontWeight: valor === op ? "700" : "400" }}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const EditarPerfil = ({ navigation }: any) => {
  const { usuario, recargarUsuario } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [fotoUri,  setFotoUri]  = useState<string | null>(null);

  const [form, setForm] = useState({
    primerNombre:      "",
    segundoNombre:     "",
    primerApellido:    "",
    segundoApellido:   "",
    celular:           "",
    rh:                "",
    eps:               "",
    condicion_medica:  "",
    contacto_nombre:   "",
    contacto_telefono: "",
    perfil_profesional:"",
  });

  useEffect(() => {
    if (!usuario) return;
    setForm({
      primerNombre:      usuario.primer_nombre ?? "",
      segundoNombre:     usuario.segundo_nombre ?? "",
      primerApellido:    usuario.primer_apellido ?? "",
      segundoApellido:   usuario.segundo_apellido ?? "",
      celular:           usuario.celular ?? "",
      rh:                usuario.rh ?? "",
      eps:               usuario.eps ?? "",
      condicion_medica:  usuario.condicion_medica ?? "",
      contacto_nombre:   usuario.contacto_emergencia_nombre ?? "",
      contacto_telefono: usuario.contacto_emergencia_telefono ?? "",
      perfil_profesional:usuario.perfil_profesional ?? "",
    });
  }, [usuario]);

  const set = (campo: string, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  // ── Selección de foto ─────────────────────────────────────────────────────
  const seleccionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para cambiar la foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;
      setFotoUri(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert("Error", "No se pudo acceder a la galería: " + (e?.message ?? ""));
    }
  };

  // ── Guardar cambios ───────────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!usuario) return;
    if (!form.primerNombre.trim() || !form.primerApellido.trim()) {
      Alert.alert("Campos requeridos", "El nombre y apellido son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      // Subir foto a Supabase Storage si se seleccionó una nueva
      let nuevaFotoUrl: string | null = null;
      if (fotoUri) {
        nuevaFotoUrl = await uploadFoto(fotoUri, usuario.id);
        if (!nuevaFotoUrl) {
          Alert.alert("Error al subir foto", "No se pudo guardar la foto. Intenta de nuevo.");
          setCargando(false);
          return;
        }
      }

      const actualizacion: Record<string, any> = {
        primer_nombre:               form.primerNombre.trim(),
        segundo_nombre:              form.segundoNombre.trim() || null,
        primer_apellido:             form.primerApellido.trim(),
        segundo_apellido:            form.segundoApellido.trim() || null,
        celular:                     form.celular.trim() || null,
        rh:                          form.rh.trim().toUpperCase() || null,
        eps:                         form.eps.trim() || null,
        condicion_medica:            form.condicion_medica.trim() || null,
        contacto_emergencia_nombre:  form.contacto_nombre.trim() || null,
        contacto_emergencia_telefono:form.contacto_telefono.trim() || null,
        perfil_profesional:          form.perfil_profesional.trim() || null,
        carnet_trasero_completado:   true,
        updated_at:                  new Date().toISOString(),
      };

      if (nuevaFotoUrl) actualizacion.foto_url = nuevaFotoUrl;

      const { error } = await supabase
        .from("usuarios")
        .update(actualizacion)
        .eq("id", usuario.id);

      if (error) {
        Alert.alert("Error", "No se pudo guardar los cambios: " + error.message);
        return;
      }

      // Limpiar caché de foto para forzar recarga desde BD
      if (nuevaFotoUrl) {
        await AsyncStorage.removeItem('cenicard_usuario_foto');
      }

      await supabase.from("notificaciones").insert({
        usuario_id:  usuario.id,
        tipo:        "perfil_actualizado",
        titulo:      "Perfil actualizado",
        descripcion: nuevaFotoUrl
          ? "Tu perfil y foto han sido actualizados correctamente."
          : "Tu información de perfil ha sido actualizada.",
        icono:       "person-circle-outline",
        leida:       false,
      });

      await recargarUsuario();

      Alert.alert("¡Guardado! ✓", "Tu perfil fue actualizado correctamente.", [
        { text: "Volver", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error inesperado", e?.message ?? "Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const fotoMostrar = fotoUri ?? usuario?.foto_url ?? null;

  return (
    <View style={styles.fondoinicial}>
      <View style={[styles.containerfondo, { height: 140, justifyContent: "center", alignItems: "flex-start", paddingHorizontal: 24 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", lineHeight: 30 }}>
          Editar{"\n"}perfil
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Foto */}
        <TouchableOpacity
          onPress={seleccionarFoto}
          style={{
            alignSelf: "center", marginBottom: 6,
            width: 100, height: 133, borderRadius: 10,
            backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
            overflow: "hidden", borderWidth: 2,
            borderColor: fotoUri ? "#2E7D32" : "#007832",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
          }}
        >
          {fotoMostrar ? (
            <Image source={{ uri: fotoMostrar }} style={{ width: 100, height: 133 }} resizeMode="cover" />
          ) : (
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 28 }}>📷</Text>
              <Text style={{ color: "#2E7D32", fontSize: 11, fontWeight: "700", textAlign: "center" }}>Agregar{"\n"}foto</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ textAlign: "center", fontSize: 11, color: fotoUri ? "#2E7D32" : "#888", marginBottom: 20 }}>
          {fotoUri ? "✓ Nueva foto lista · Toca para cambiar" : "Toca para cambiar tu foto de perfil"}
        </Text>

        {/* Datos personales */}
        <Text style={{ fontSize: 13, fontWeight: "800", color: "#2E7D32", marginBottom: 12, letterSpacing: 1 }}>
          DATOS PERSONALES
        </Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Primer nombre *</Text>
            <TextInput style={styles.input} placeholderTextColor="#8B9F8F" value={form.primerNombre} onChangeText={v => set("primerNombre", v)} />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Segundo nombre</Text>
            <TextInput style={styles.input} placeholder="OPCIONAL" placeholderTextColor="#8B9F8F" value={form.segundoNombre} onChangeText={v => set("segundoNombre", v)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Primer apellido *</Text>
            <TextInput style={styles.input} placeholderTextColor="#8B9F8F" value={form.primerApellido} onChangeText={v => set("primerApellido", v)} />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Segundo apellido</Text>
            <TextInput style={styles.input} placeholderTextColor="#8B9F8F" value={form.segundoApellido} onChangeText={v => set("segundoApellido", v)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>Celular</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" placeholder="+57 300 000 0000" placeholderTextColor="#8B9F8F" value={form.celular} onChangeText={v => set("celular", v)} />
          </View>
          <View style={styles.colNarrow}>
            <Text style={styles.inputLabel}>RH</Text>
            <SelectorRH valor={form.rh} onSelect={v => set("rh", v)} />
          </View>
        </View>

        {/* Información del carné */}
        <Text style={{ fontSize: 13, fontWeight: "800", color: "#2E7D32", marginTop: 16, marginBottom: 12, letterSpacing: 1 }}>
          INFORMACIÓN DEL CARNÉ
        </Text>

        <Text style={styles.inputLabel}>EPS</Text>
        <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="Ej: Compensar EPS" placeholderTextColor="#8B9F8F" value={form.eps} onChangeText={v => set("eps", v)} />

        <Text style={styles.inputLabel}>Condición médica</Text>
        <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="Ej: Ninguna" placeholderTextColor="#8B9F8F" value={form.condicion_medica} onChangeText={v => set("condicion_medica", v)} />

        <Text style={styles.inputLabel}>Contacto de emergencia</Text>
        <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="Nombre y parentesco" placeholderTextColor="#8B9F8F" value={form.contacto_nombre} onChangeText={v => set("contacto_nombre", v)} />

        <Text style={styles.inputLabel}>Teléfono de emergencia</Text>
        <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="+57 300 000 0000" placeholderTextColor="#8B9F8F" keyboardType="phone-pad" value={form.contacto_telefono} onChangeText={v => set("contacto_telefono", v)} />

        <Text style={styles.inputLabel}>Perfil profesional</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: "top", paddingTop: 12, marginBottom: 24 }]}
          placeholder="Breve descripción de tus habilidades y gustos"
          placeholderTextColor="#8B9F8F"
          multiline
          value={form.perfil_profesional}
          onChangeText={v => set("perfil_profesional", v)}
        />

        <TouchableOpacity
          style={[styles.button, cargando && { opacity: 0.7 }]}
          onPress={handleGuardar}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditarPerfil;