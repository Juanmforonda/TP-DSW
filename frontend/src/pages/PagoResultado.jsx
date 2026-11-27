import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CAlert, CButton, CCard, CCardBody, CSpinner } from '@coreui/react';
import { cilCheckAlt, cilWarning, cilTransfer } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { consultarEstadoPagoMP } from '../api/cuotas.js';
import '../components/PaymentResult.css';

const CONFIG_POR_ESTADO = {
  approved: {
    icono: cilCheckAlt,
    color: '#198754',
    titulo: 'Pago aprobado',
    mensaje:
      'Tu pago se procesó correctamente. La cuota va a figurar como pagada en unos instantes.',
  },
  pending: {
    icono: cilTransfer,
    color: '#b8860b',
    titulo: 'Pago pendiente',
    mensaje:
      'Tu pago está siendo procesado. Podés verificar el estado desde tus cuotas en unos minutos.',
  },
  rejected: {
    icono: cilWarning,
    color: '#dc3545',
    titulo: 'Pago no aprobado',
    mensaje:
      'Mercado Pago no aprobó el pago. Podés revisar el estado desde tus cuotas antes de volver a intentarlo.',
  },
};

const ESTADOS_VALIDOS = new Set(Object.keys(CONFIG_POR_ESTADO));

export function PagoResultado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId =
    searchParams.get('payment_id') ?? searchParams.get('collection_id');
  const [resultado, setResultado] = useState({
    loading: true,
    estado: null,
    error: false,
  });
  const [segundos, setSegundos] = useState(6);

  useEffect(() => {
    let vigente = true;
    setResultado({ loading: true, estado: null, error: false });
    setSegundos(6);

    if (!paymentId) {
      setResultado({ loading: false, estado: null, error: true });
      return () => {
        vigente = false;
      };
    }

    consultarEstadoPagoMP(paymentId)
      .then((response) => {
        const estado = response.data?.data?.estado;
        if (!ESTADOS_VALIDOS.has(estado)) {
          throw new Error('El backend devolvió un estado de pago inválido');
        }
        if (vigente) {
          setResultado({ loading: false, estado, error: false });
        }
      })
      .catch((error) => {
        console.error('Error al consultar el estado del pago:', error);
        if (vigente) {
          setResultado({ loading: false, estado: null, error: true });
        }
      });

    return () => {
      vigente = false;
    };
  }, [paymentId]);

  useEffect(() => {
    if (resultado.loading) return;
    if (segundos <= 0) {
      navigate('/socio/cuotas');
      return;
    }
    const timer = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resultado.loading, segundos, navigate]);

  const config =
    resultado.error || !resultado.estado
      ? {
          icono: cilWarning,
          color: '#dc3545',
          titulo: 'No pudimos verificar el pago',
          mensaje:
            'No fue posible confirmar el estado con el backend. Revisá tus cuotas antes de volver a pagar.',
        }
      : CONFIG_POR_ESTADO[resultado.estado];

  return (
    <div className="payment-result-page d-flex justify-content-center align-items-center">
      <CCard className="payment-result-card shadow-sm text-center">
        <CCardBody className="p-4">
          {resultado.loading ? (
            <>
              <CSpinner color="primary" />
              <p className="mt-3 mb-0">Consultando el estado del pago...</p>
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
              {resultado.error && (
                <CAlert color="warning">
                  Si el pago se realizó, el estado puede tardar unos minutos en actualizarse.
                </CAlert>
              )}
              <CButton color="primary" onClick={() => navigate('/socio/cuotas')}>
                Ver mis cuotas
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
