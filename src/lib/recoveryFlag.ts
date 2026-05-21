/**
 * Flag global para el flujo de recuperación de contraseña.
 * Archivo separado para evitar dependencia circular entre
 * AuthContext (context/) y Navegacion (Navigation/).
 */
let _esRecuperacion = false;

export const setEsRecuperacion = (v: boolean) => { _esRecuperacion = v; };
export const getEsRecuperacion = () => _esRecuperacion;