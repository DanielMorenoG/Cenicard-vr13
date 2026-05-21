import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../css/Registro";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

// ── Constantes ───────────────────────────────────────────────────────────────
const CLAVES_ROL: Record<string, string> = {
  Soy_SenaF:  "funcionario",
  Soy_SenaI:  "instructor",
  Soy_SenaC:  "contratista",
  Soy_SenaAD: "admin",
};

const LABEL_ROL: Record<string, string> = {
  funcionario: "Funcionario SENA",
  instructor:  "Instructor SENA",
  contratista: "Contratista SENA",
  admin:       "Administrador SENA",
};

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const CENTROS = ["CENIGRAF"];

// ── Componente selector de lista ─────────────────────────────────────────────
const Selector = ({
  label,
  opciones,
  valor,
  onSelect,
  placeholder,
}: {
  label: string;
  opciones: string[];
  valor: string;
  onSelect: (v: string) => void;
  placeholder?: string;
}) => {
  const [abierto, setAbierto] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setAbierto(!abierto)}
        style={[
          styles.input,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
          },
        ]}
      >
        <Text style={{ color: valor ? "#1A1A1A" : "#8B9F8F", fontSize: width * 0.036 }}>
          {valor || placeholder || "Selecciona..."}
        </Text>
        <Text style={{ color: "#2E7D32", fontSize: 14 }}>{abierto ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {abierto && (
        <View
          style={{
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1.5,
            borderColor: "#2E7D32",
            overflow: "hidden",
            marginTop: -8,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {opciones.map((op) => (
            <TouchableOpacity
              key={op}
              onPress={() => { onSelect(op); setAbierto(false); }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: valor === op ? "#e8f5e9" : "#fff",
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Text
                style={{
                  color: valor === op ? "#2E7D32" : "#1A1A1A",
                  fontWeight: valor === op ? "700" : "400",
                  fontSize: width * 0.038,
                }}
              >
                {op}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const Registro = ({ navigation }: any) => {
  const [form, setForm] = useState({
    primerNombre:        "",
    segundoNombre:       "",
    primerApellido:      "",
    segundoApellido:     "",
    cc:                  "",
    celular:             "",
    correo:              "",
    contrasena:          "",
    confirmarContrasena: "",
    codigoFicha:         "",
    centroFormacion:     "",
    rh:                  "",
    palabraClave:        "",
  });
  const [fotoUri,   setFotoUri]   = useState<string | null>(null);
  const [fotoB64,   setFotoB64]   = useState<string | null>(null);
  const [cargando,  setCargando]  = useState(false);
  const [verPass,   setVerPass]   = useState(false);

  const set = (campo: string, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  // Rol detectado en tiempo real según la palabra clave
  const rolDetectado = CLAVES_ROL[form.palabraClave.trim()] ?? null;

  const seleccionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para agregar tu foto.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const uri = result.assets[0].uri;
      setFotoUri(uri);

      // Procesar a base64 para guardar directo en el registro
      // (durante el signup aún no hay sesión activa para subir a Storage)
      const procesada = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600, height: 800 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      if (procesada.base64) {
        setFotoB64(`data:image/jpeg;base64,${procesada.base64}`);
      }
    } catch (e: any) {
      Alert.alert("Error", "No se pudo acceder a la galería: " + (e?.message ?? ""));
    }
  };

  const subirFoto = async (_userId: string): Promise<string | null> => {
    // En el registro usamos base64 directo porque aún no hay sesión activa.
    // El usuario puede actualizar la foto desde Editar Perfil (usa Storage).
    return fotoB64 ?? null;
  };

  const handleRegistro = async () => {
    const {
      primerNombre, primerApellido, segundoApellido,
      cc, correo, contrasena, confirmarContrasena,
      codigoFicha, centroFormacion, rh, palabraClave,
    } = form;

    // Validaciones
    if (!primerNombre || !primerApellido || !segundoApellido || !cc || !correo || !contrasena || !centroFormacion || !rh) {
      Alert.alert("Campos requeridos", "Completa todos los campos marcados con *.");
      return;
    }
    if (!fotoUri) {
      Alert.alert("Foto requerida", "Debes agregar una foto de perfil para continuar.");
      return;
    }
    if (contrasena !== confirmarContrasena) {
      Alert.alert("Contraseñas no coinciden", "Verifica que ambas contraseñas sean iguales.");
      return;
    }
    if (contrasena.length < 6) {
      Alert.alert("Contraseña débil", "La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    const esPersonalSena = rolDetectado !== null;
    const rol = esPersonalSena ? rolDetectado : "aprendiz";

    if (!esPersonalSena && !codigoFicha.trim()) {
      Alert.alert("Código de ficha requerido", "Los aprendices deben ingresar su número de ficha.");
      return;
    }

    setCargando(true);
    try {
      let fichaId: number | null = null;
      let fechaVencimiento: string | null = null;

      if (!esPersonalSena) {
        const { data: fichaData, error: fichaErr } = await supabase
          .from("fichas")
          .select("id, cupos_maximos, fecha_inicio")
          .eq("codigo_ficha", codigoFicha.trim())
          .eq("activa", true)
          .single();

        if (fichaErr || !fichaData) {
          Alert.alert("Ficha no encontrada", "El código de ficha no existe o no está activo.\nVerifica con tu instructor.");
          return;
        }

        const { count } = await supabase
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("ficha_id", fichaData.id)
          .eq("rol", "aprendiz")
          .eq("activo", true);

        if ((count ?? 0) >= fichaData.cupos_maximos) {
          Alert.alert("Ficha llena", `Esta ficha ya tiene ${fichaData.cupos_maximos} aprendices registrados.\nComunícate con tu instructor.`);
          return;
        }

        fichaId = fichaData.id;
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() + 2);
        fechaVencimiento = hoy.toISOString().split("T")[0];
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo.trim().toLowerCase(),
        password: contrasena,
        options: { data: { primer_nombre: primerNombre.trim() } },
      });

      if (authError || !authData.user) {
        Alert.alert(
          "Error al registrar",
          authError?.message?.includes("already registered")
            ? "Este correo ya tiene una cuenta. Intenta iniciar sesión."
            : (authError?.message ?? "Intenta de nuevo."),
        );
        return;
      }

      const userId = authData.user.id;

      const perfilData = {
        id:                      userId,
        primer_nombre:           primerNombre.trim(),
        segundo_nombre:          form.segundoNombre.trim() || null,
        primer_apellido:         primerApellido.trim(),
        segundo_apellido:        segundoApellido.trim(),
        numero_cc:               cc.trim(),
        correo:                  correo.trim().toLowerCase(),
        celular:                 form.celular.trim() || null,
        rol,
        ficha_id:                fichaId,
        centro_formacion:        centroFormacion.trim(),
        regional:                "Regional Distrito Capital",
        rh:                      rh.trim().toUpperCase(),
        fecha_vencimiento_carne: fechaVencimiento,
        estado_carne:            "activo",
        carnet_trasero_completado: false,
        activo:                  true,
      };

      const { error: insertError } = await supabase
        .from("usuarios")
        .upsert(perfilData, { onConflict: "id", ignoreDuplicates: false });

      if (insertError) {
        await supabase
          .from("usuarios")
          .update({
            primer_nombre:           perfilData.primer_nombre,
            segundo_nombre:          perfilData.segundo_nombre,
            primer_apellido:         perfilData.primer_apellido,
            segundo_apellido:        perfilData.segundo_apellido,
            numero_cc:               perfilData.numero_cc,
            celular:                 perfilData.celular,
            rol:                     perfilData.rol,
            ficha_id:                perfilData.ficha_id,
            centro_formacion:        perfilData.centro_formacion,
            regional:                perfilData.regional,
            rh:                      perfilData.rh,
            fecha_vencimiento_carne: perfilData.fecha_vencimiento_carne,
            estado_carne:            "activo",
          })
          .eq("id", userId);
      }

      const fotoUrl = await subirFoto(userId);
      if (fotoUrl) {
        await supabase.from("usuarios").update({ foto_url: fotoUrl }).eq("id", userId);
      }

      await supabase.from("notificaciones").insert({
        usuario_id:  userId,
        tipo:        "registro_exitoso",
        titulo:      "¡Bienvenido a CeniCard!",
        descripcion: "Tu cuenta ha sido creada exitosamente.",
        icono:       "checkmark-circle-outline",
      });

      const mensajes: Record<string, string> = {
        aprendiz:    "Bienvenido aprendiz, tu carné digital está listo.",
        instructor:  "Bienvenido instructor SENA.",
        funcionario: "Bienvenido funcionario SENA.",
        contratista: "Bienvenido contratista SENA.",
        admin:       "Cuenta de administrador creada.",
      };
      Alert.alert("¡Registro exitoso! ✓", mensajes[rol] ?? "Bienvenido a CeniCard.");
    } catch (e: any) {
      Alert.alert("Error inesperado", e?.message ?? "Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const fotoDim    = Math.round(width * 0.28);
  const fotoHeight = Math.round(fotoDim * 1.33);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.fondoinicial}>
        <View style={styles.containerfondo}>
          <Image style={styles.chicaimg} source={require("../Img/chica_logins.png")} />
          <Image style={styles.logoimg}  source={require("../Img/logo_sena.png")} />
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 36 }}
          contentContainerStyle={{
            paddingHorizontal: width * 0.06,
            paddingTop: 28,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Formulario de{"\n"}registro</Text>

          {/* ── Foto de perfil (obligatoria) ─────────────────────────────── */}
          <TouchableOpacity
            onPress={seleccionarFoto}
            style={{
              alignSelf: "center",
              marginBottom: 4,
              width: fotoDim,
              height: fotoHeight,
              borderRadius: 10,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              borderWidth: 2,
              borderColor: fotoUri ? "#2E7D32" : "#e53935",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {fotoUri ? (
              <Image
                source={{ uri: fotoUri }}
                style={{ width: fotoDim, height: fotoHeight }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 26 }}>📷</Text>
                <Text style={{ color: "#e53935", fontSize: 11, fontWeight: "700", textAlign: "center" }}>
                  Foto{"\n"}requerida *
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 16 }}>
            {fotoUri ? "✓ Foto seleccionada · Toca para cambiar" : "Toca para seleccionar tu foto de perfil"}
          </Text>

          {/* ── Nombres ─────────────────────────────────────────────────── */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Primer nombre *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#8B9F8F"
                value={form.primerNombre}
                onChangeText={(v) => set("primerNombre", v)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Segundo nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="OPCIONAL"
                placeholderTextColor="#8B9F8F"
                value={form.segundoNombre}
                onChangeText={(v) => set("segundoNombre", v)}
              />
            </View>
          </View>

          {/* ── Apellidos (ambos obligatorios) ──────────────────────────── */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Primer apellido *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#8B9F8F"
                value={form.primerApellido}
                onChangeText={(v) => set("primerApellido", v)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Segundo apellido *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#8B9F8F"
                value={form.segundoApellido}
                onChangeText={(v) => set("segundoApellido", v)}
              />
            </View>
          </View>

          {/* ── CC ──────────────────────────────────────────────────────── */}
          <Text style={styles.inputLabel}>N° identificación *</Text>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            keyboardType="numeric"
            placeholderTextColor="#8B9F8F"
            value={form.cc}
            onChangeText={(v) => set("cc", v)}
          />

          {/* ── RH (selector) ───────────────────────────────────────────── */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Selector
                label="Tipo de sangre (RH) *"
                opciones={TIPOS_SANGRE}
                valor={form.rh}
                onSelect={(v) => set("rh", v)}
                placeholder="Selecciona tu RH"
              />
            </View>
          </View>

          {/* ── Celular ─────────────────────────────────────────────────── */}
          <Text style={styles.inputLabel}>Celular</Text>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="+57 300 000 0000"
            placeholderTextColor="#8B9F8F"
            keyboardType="phone-pad"
            value={form.celular}
            onChangeText={(v) => set("celular", v)}
          />

          {/* ── Correo ──────────────────────────────────────────────────── */}
          <Text style={styles.inputLabel}>Correo electrónico *</Text>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="tu@correo.com"
            placeholderTextColor="#8B9F8F"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.correo}
            onChangeText={(v) => set("correo", v)}
          />

          {/* ── Contraseñas ─────────────────────────────────────────────── */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Contraseña *</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#c8e6c99a',
                borderRadius: 30,
                paddingLeft: 14,
                paddingRight: 6,
              }}>
                <TextInput
                  style={[styles.input, {
                    flex: 1,
                    backgroundColor: 'transparent',
                    paddingHorizontal: 0,
                    marginBottom: 0,
                  }]}
                  secureTextEntry={!verPass}
                  placeholder="Mín. 6 car."
                  placeholderTextColor="#8B9F8F"
                  value={form.contrasena}
                  onChangeText={(v) => set("contrasena", v)}
                />
                <TouchableOpacity onPress={() => setVerPass(!verPass)} style={{ padding: 6 }}>
                  <Text style={{ fontSize: 16 }}>{verPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Confirmar *</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#c8e6c99a',
                borderRadius: 30,
                paddingLeft: 14,
                paddingRight: 6,
              }}>
                <TextInput
                  style={[styles.input, {
                    flex: 1,
                    backgroundColor: 'transparent',
                    paddingHorizontal: 0,
                    marginBottom: 0,
                  }]}
                  secureTextEntry={!verPass}
                  placeholderTextColor="#8B9F8F"
                  placeholder="Repetir"
                  value={form.confirmarContrasena}
                  onChangeText={(v) => set("confirmarContrasena", v)}
                />
              </View>
            </View>
          </View>

          {/* ── Centro de formación (selector) + Ficha ──────────────────── */}
          <View style={styles.row}>
            <View style={{ flex: 2, marginRight: 8 }}>
              <Selector
                label="Centro de formación *"
                opciones={CENTROS}
                valor={form.centroFormacion}
                onSelect={(v) => set("centroFormacion", v)}
                placeholder="Selecciona centro"
              />
            </View>
            <View style={styles.colNarrow}>
              <Text style={styles.inputLabel}>Ficha</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="N°"
                placeholderTextColor="#8B9F8F"
                value={form.codigoFicha}
                onChangeText={(v) => set("codigoFicha", v)}
              />
            </View>
          </View>

          {/* ── Palabra clave con badge de reconocimiento ────────────────── */}
          <Text style={styles.inputLabel}>Palabra clave</Text>
          <TextInput
            style={[styles.input, { marginBottom: 6 }]}
            placeholder="Solo para personal SENA"
            placeholderTextColor="#8B9F8F"
            value={form.palabraClave}
            onChangeText={(v) => set("palabraClave", v)}
          />

          {/* Badge dinámico */}
          {form.palabraClave.trim().length > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: rolDetectado ? "#e8f5e9" : "#fce4ec",
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {rolDetectado ? "✅" : "❌"}
              </Text>
              <Text
                style={{
                  fontSize: width * 0.035,
                  fontWeight: "700",
                  color: rolDetectado ? "#2E7D32" : "#c62828",
                }}
              >
                {rolDetectado
                  ? `Reconocido como: ${LABEL_ROL[rolDetectado]}`
                  : "Palabra clave no reconocida"}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 11, color: "#888", marginBottom: 24, marginLeft: 4 }}>
            {rolDetectado
              ? "Tu cuenta será creada con este rol."
              : "Aprendices: deja este campo vacío e ingresa tu ficha."}
          </Text>

          <TouchableOpacity
            style={[styles.button, cargando && { opacity: 0.7 }]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>REGISTRARME</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Registro;