import { useEffect, useState } from 'react';
import { getReservasInfraestructura } from '../../api/reservasInfraestructura.js';
import '../../components/SocioHome.css';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';

export function SocioAlquileres({ idSocio }) {
  const [amarras, setAmarras] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idSocio) {
      setError('No se pudo obtener el ID del socio');
      setLoading(false);
      return;
    }

    getReservasInfraestructura()
      .then((res) => {
        const reservas = res.data?.data ?? [];
        const reservasActivas = reservas.filter((reserva) => {
          const socioId = Number(reserva.socio?.id ?? reserva.socio);
          return socioId === Number(idSocio) && reserva.estado === 'ACTIVA';
        });

        const amarrasDelSocio = reservasActivas
          .filter((reserva) => reserva.amarra)
          .map((reserva) => ({
            ...reserva.amarra,
            embarcacion: reserva.embarcacion,
            socio: reserva.socio,
          }));

        const boxesDelSocio = reservasActivas
          .filter((reserva) => reserva.box)
          .map((reserva) => ({
            ...reserva.box,
            embarcacion: reserva.embarcacion,
            socio: reserva.socio,
          }));

        setAmarras(amarrasDelSocio);
        setBoxes(boxesDelSocio);
      })
      .catch((err) => {
        console.error('Error al cargar amarras/boxes:', err);
        setError('Error al cargar tus alquileres');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idSocio]);

  const sinAlquileres = amarras.length === 0 && boxes.length === 0;

  return (
    <div className="socio-container">
      <h2 className="socio-title">Mis alquileres</h2>
      <p className="socio-subtitle">
        Amarras y boxes vinculados a tus embarcaciones
      </p>
      <p className="text-muted small mt-2 mb-3">
        Acercate a la secretaria para solicitar cambios de amarra/box.
      </p>

      {loading && <LoadingState message="Cargando alquileres..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && sinAlquileres && (
        <EmptyState message="No tenés amarras ni boxes alquilados actualmente." />
      )}

      {!loading && !error && amarras.length > 0 && (
        <>
          <h5 className="mt-3">Amarras</h5>
          <div className="row">
            {amarras.map((amarra) => (
              <div key={`amarra-${amarra.id}`} className="col-md-6 mb-4">
                <div className="card socio-card shadow-sm p-3">
                  <h6 className="mb-2">Amarra #{amarra.id}</h6>
                  <p className="mb-1">
                    <strong>Zona:</strong> {amarra.zona}
                  </p>
                  <p className="mb-1">
                    <strong>Nro Pilón:</strong> {amarra.nroPilon}
                  </p>
                  <p className="mb-1">
                    <strong>Precio Mensual:</strong> ${amarra.precioMensualBase}
                  </p>
                  <p className="mb-0">
                    <strong>Embarcación:</strong> {amarra.embarcacion?.nombre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && boxes.length > 0 && (
        <>
          <h5 className="mt-3">Boxes</h5>
          <div className="row">
            {boxes.map((box) => (
              <div key={`box-${box.id}`} className="col-md-6 mb-4">
                <div className="card socio-card shadow-sm p-3">
                  <h6 className="mb-2">Box {box.nroBox}</h6>
                  <p className="mb-1">
                    <strong>Precio Mensual:</strong> ${box.precioMensualBase}
                  </p>
                  <p className="mb-0">
                    <strong>Embarcación:</strong> {box.embarcacion?.nombre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
