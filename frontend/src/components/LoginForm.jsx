import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { LoadingState } from './LoadingState.jsx';
import { clearSession } from '../utils/storage';
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
import { login } from '../api/auth.js';

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
      const res = await login(email, password);

      const data = res.data;

      if (data.tipo !== 'socio' && data.tipo !== 'admin') {
        throw new Error('Tipo de usuario no válido');
      }

      // Limpiar datos antiguos de localStorage,
      clearSession();

      if (data.tipo === 'socio') {
        navigate('/socio');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ?? err.message ?? 'Error al iniciar sesión',
      );
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
