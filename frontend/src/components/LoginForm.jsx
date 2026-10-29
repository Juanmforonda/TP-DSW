import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { LoadingState } from './LoadingState.jsx';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CButton,
} from '@coreui/react';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      localStorage.setItem('token', data.token);
      localStorage.setItem('tipo', data.tipo);

      if (data.tipo === 'socio' && data.socio) {
        localStorage.setItem('socio', JSON.stringify(data.socio));
        console.log('✅ Socio guardado:', data.socio);
        setTimeout(() => {
          navigate('/socio');
        }, 100);
      } else if (data.tipo === 'admin' && data.admin) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
        console.log('✅ Admin guardado:', data.admin);
        setTimeout(() => {
          navigate('/admin');
        }, 100);
      } else {
        throw new Error('No se recibió el objeto del usuario');
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CRow className="login-row d-flex justify-content-center">
      <CCol xs={12} sm={8} md={6} lg={4}>
        <CCard className="login-card mt-5">
          <CCardHeader>
            <h4>Iniciar Sesión</h4>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CFormInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-3"
              />
              <CFormInput
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mb-3"
              />
              <div className="d-grid gap-2">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Entrar'}
                </CButton>
              </div>
              {loading && <LoadingState message="Validando tus datos..." />}
              {error && (
                <p className="login-error mt-3" role="alert">
                  {error}
                </p>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
