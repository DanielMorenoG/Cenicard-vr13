# CeniCard – Guía de configuración

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar Supabase

Abre el archivo `src/lib/supabase.ts` y reemplaza:

```ts
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

Estos valores los encuentras en:
**Supabase Dashboard → Settings → API**

## 3. Crear la base de datos

En el **SQL Editor** de Supabase, ejecuta el contenido del archivo `cenicard_supabase.sql` (generado anteriormente).

## 4. Configurar Storage Buckets

En Supabase Dashboard → Storage, verifica que existan los buckets:
- `fotos-perfil` (privado)
- `noticias-imgs` (público)
- `equipos-imgs` (público)

Si no se crearon con el SQL, créalos manualmente.

## 5. Habilitar Realtime

En Supabase Dashboard → Database → Replication, activa Realtime para las tablas:
- `noticias`
- `notificaciones`

## 6. Configurar autenticación

En Supabase Dashboard → Authentication → Settings:
- **Site URL:** `cenicard://`
- **Redirect URLs:** `cenicard://reset-password`

## 7. Correr la app

```bash
npx expo start
```

---

## Credenciales de prueba (para desarrollo)

Después de crear una ficha en Supabase con código `3066747`, puedes registrar un aprendiz normalmente.

Para crear un funcionario: usa la palabra clave **SoySena** en el campo de palabra clave del registro.

---

## Estructura del proyecto

```
src/
├── lib/
│   └── supabase.ts          ← Cliente Supabase + tipos TypeScript
├── context/
│   └── AuthContext.tsx      ← Sesión global + perfil del usuario
├── Componentes/
│   ├── Login.tsx            ← Login por número de CC
│   ├── Registro.tsx         ← Registro con validación de ficha + foto
│   ├── RecuperarPassword.tsx← Recuperación por correo
│   ├── Inicio.tsx           ← Noticias en tiempo real
│   ├── Servicios.tsx        ← Préstamos de equipos
│   ├── Carnet.tsx           ← Carné digital con flip animation
│   ├── Notificaciones.tsx   ← Notificaciones en tiempo real
│   ├── Barrasup.tsx         ← Header con badge de notificaciones
│   └── Barranav.tsx         ← Navegación inferior (sin cambios)
├── pages/                   ← Wrappers de pantallas
├── Navigation/
│   └── Navegacion.tsx       ← Rutas con auth-guard automático
└── css/                     ← Estilos (sin cambios)
```

---

## Lógica de negocio implementada

| Funcionalidad | Implementación |
|---|---|
| Login por CC | Busca correo → `signInWithPassword` |
| Registro aprendiz | Valida ficha + cupo ≤35 → `signUp` |
| Registro funcionario | Detecta palabra clave `SoySena` → rol funcionario |
| Foto de perfil | `expo-image-picker` → Supabase Storage |
| Recuperar contraseña | Verifica correo existe → `resetPasswordForEmail` |
| Noticias | Carga desde BD + **Realtime** (auto-actualiza) |
| Equipos | Carga por categoría dinámica desde BD |
| Solicitar préstamo | Inserta en `prestamos` → trigger bloquea carné automáticamente al aceptar |
| Carné digital | Datos reales del usuario + flip animation |
| Carné trasero | Primera vuelta → formulario → guarda en BD |
| Estado carné | Refleja `activo/bloqueado/prestamo` desde BD |
| Notificaciones | Carga desde BD + **Realtime** + marcar leídas |
| Badge notificaciones | Contador en header en tiempo real |
| Auth guard | `Navegacion.tsx` detecta sesión y redirige automáticamente |
