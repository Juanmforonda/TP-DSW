
const API_URL = import.meta.env.VITE_API_URL ?? '';

export async function loginUser(email, password) {
  return fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}
