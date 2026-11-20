// Acceso centralizado a localStorage: separa sesión de contenido público,
// valida el JSON y versiona el formato.

// Claves de SESIÓN (se borran al cerrar sesión).
export const SESSION_KEYS = ['token', 'socio', 'tipo','admin'];

// Claves de CONTENIDO PÚBLICO (nunca se borran en el logout).
export const CONTENT_KEYS = {
  testimonials: 'userTestimonials',
};

const FORMAT_VERSION = 1;

function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage no disponible (modo privado, bloqueado, etc.)
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false; // cuota llena o storage no disponible
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* sin acción */
  }
}

// Lee y parsea un JSON; si falta o está corrupto devuelve el valor por defecto.
export function readJSON(key, fallback) {
  const raw = getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  return setItem(key, JSON.stringify(value));
}

// Cierre de sesión: elimina SOLO las claves de sesión.
export function clearSession() {
  SESSION_KEYS.forEach(removeItem);
}

// --- Testimonios del visitante ---------------------------------------------
// Formato guardado: { v: 1, data: [ ...testimonios ] }
// También acepta el formato anterior (un array directo).

function esTestimonioValido(t) {
  return t !== null && typeof t === 'object' && !Array.isArray(t);
}

export function getUserTestimonials() {
  const parsed = readJSON(CONTENT_KEYS.testimonials, null);

  let lista = null;
  if (Array.isArray(parsed)) {
    lista = parsed; // formato anterior sin versión
  } else if (parsed && parsed.v === FORMAT_VERSION && Array.isArray(parsed.data)) {
    lista = parsed.data;
  }

  return lista ? lista.filter(esTestimonioValido) : [];
}

export function saveUserTestimonials(lista) {
  return writeJSON(CONTENT_KEYS.testimonials, { v: FORMAT_VERSION, data: lista });
}