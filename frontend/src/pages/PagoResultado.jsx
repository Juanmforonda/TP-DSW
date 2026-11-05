import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CCard, CCardBody, CButton, CSpinner } from '@coreui/react';
import { confirmarPagoMP } from '../api/cuotas';
import { cilCheckAlt, cilWarning, cilTransfer } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import '../components/PaymentResult.css';

const CONFIG_POR_TIPO = {
  exito: {
    icono: cilCheckAlt,
    color: '#198754',
    titulo: 'Pago aprobado',
    mensaje:
      'Tu pago se procesó correctamente. La cuota va a figurar como pagada en unos instantes.',
  },
  pendiente: {
    icono: cilTransfer,
    color: '#b8860b',
    titulo: 'Pago pendiente',
    mensaje:
      'Tu pago está siendo procesado. Podés verificar el estado desde tus cuotas en unos minutos.',
  },
  error: {
    icono: cilWarning,
    color: '#dc3545',
    titulo: 'Pago no procesado',
    mensaje:
      'No pudimos procesar el pago. Podés intentarlo de nuevo desde tus cuotas.',
  },
};

export function PagoResultado({ tipo }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [segundos, setSegundos] = useState(6);

  const config = CONFIG_POR_TIPO[tipo] ?? CONFIG_POR_TIPO.error;

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');

    const confirmar = async () => {
      if (paymentId) {
        try {
          await confirmarPagoMP(paymentId);
        } catch (err) {
          console.error('Error al confirmar el pago:', err);
        }
      }
      setVerificando(false);
    };

    confirmar();
  }, [searchParams]);

  // Redirección automática con cuenta regresiva, una vez confirmado
  useEffect(() => {
    if (verificando) return;
    if (segundos <= 0) {
      navigate('/socio/cuotas');
      return;
    }
    const timer = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [verificando, segundos, navigate]);

  return (
    <div
      className="payment-result-page d-flex justify-content-center align-items-center"
    >
      <CCard className="payment-result-card shadow-sm text-center">
        <CCardBody className="p-4">
          {verificando ? (
            <>
              <CSpinner color="primary" className="mb-3" />
              <p>Verificando el estado del pago...</p>
            </>
          ) : (
            <>
              <div className="mb-2">
                <CIcon
                  icon={config.icono}
                  size="3xl"
                  style={{ color: config.color }}
                />
              </div>
              <h4 className="mt-2" style={{ color: config.color }}>
                {config.titulo}
              </h4>
              <p className="text-muted">{config.mensaje}</p>
              <CButton color="primary" onClick={() => navigate('/socio')}>
                Volver
              </CButton>
              <p className="text-muted payment-result-countdown mt-2">
                Te vamos a redirigir automáticamente en {segundos}s...
              </p>
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}
