import { describe, it, expect } from 'vitest'

const BASE = process.env.API_URL ?? 'http://localhost:3000/api'
const TOKEN = process.env.TEST_TOKEN

// Ajustá los prefijos a los de tu app.ts
const RUTAS = [
  '/socios',
  '/administradores',
  '/embarcaciones',
  '/afiliaciones',
  '/reservasInfraestructura',
]

const CLAVES_PROHIBIDAS = ['password', 'passwordHash']
const PATRON_BCRYPT = /^\$2[aby]\$\d{2}\$/

function buscarFiltraciones(valor: unknown, ruta = '$'): string[] {
  const hallazgos: string[] = []

  if (Array.isArray(valor)) {
    valor.forEach((item, i) => hallazgos.push(...buscarFiltraciones(item, `${ruta}[${i}]`)))
  } else if (valor && typeof valor === 'object') {
    for (const [clave, v] of Object.entries(valor)) {
      if (CLAVES_PROHIBIDAS.includes(clave)) hallazgos.push(`${ruta}.${clave}`)
      hallazgos.push(...buscarFiltraciones(v, `${ruta}.${clave}`))
    }
  } else if (typeof valor === 'string' && PATRON_BCRYPT.test(valor)) {
    hallazgos.push(`${ruta} (valor con formato bcrypt)`)
  }

  return hallazgos
}

// Verifica que el detector funciona, para que el test principal no sea vacío
describe('detector de filtraciones', () => {
  it('encuentra password anidado y hashes bcrypt', () => {
    const muestra = { data: [{ socio: { password: 'x' } }, { h: '$2b$10$abcdefghijklmnopqrstuv' }] }
    expect(buscarFiltraciones(muestra)).toHaveLength(2)
  })

  it('no marca datos limpios', () => {
    expect(buscarFiltraciones({ data: [{ nombre: 'Ana', socio: { id: 1 } }] })).toEqual([])
  })
})

// Requiere el backend corriendo y la variable TEST_TOKEN; si no está, se saltea
describe.skipIf(!TOKEN)('las respuestas no exponen contraseñas', () => {
  it.each(RUTAS)('%s', async (ruta) => {
    const res = await fetch(`${BASE}${ruta}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    expect(res.status).toBe(200)
    expect(buscarFiltraciones(await res.json())).toEqual([])
  })
})