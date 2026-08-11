import { useEffect, useState } from 'react';
import { getAmarras } from '../api/amarras.js';
import { getBoxes } from '../api/boxes.js';
import './socioHome.css';

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

    Promise.all([getAmarras(), getBoxes()])
      .then(([resAmarras, resBoxes]) => {
        const todasAmarras = resAmarras.data?.data ?? [];
        const todosBoxes = resBoxes.data?.data ?? [];

        // Solo las amarras/boxes cuya embarcación asignada pertenece a este socio.
        setAmarras(todasAmarras.filter((a) => a.embarcacion?.socio?.id === idSocio));
        setBoxes(todosBoxes.filter((b) => b.embarcacion?.socio?.id === idSocio));
      })
      .catch((err) => {
        console.error('❌ Error al cargar amarras/boxes:', err);
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
      <p className="socio-subtitle">Amarras y boxes vinculados a tus embarcaciones</p>

      {loading && <p>Cargando alquileres...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && sinAlquileres && (
        <p>No tenés amarras ni boxes alquilados actualmente.</p>
      )}

      {!loading && !error && amarras.length > 0 && (
        <>
          <h5 className="mt-3">Amarras</h5>
          <div className="row">
            {amarras.map((amarra) => (
              <div key={`amarra-${amarra.id}`} className="col-md-6 mb-4">
                <div className="card socio-card shadow-sm p-3">
                  <h6 className="mb-2">Amarra #{amarra.id}</h6>
                  <p className="mb-1"><strong>Zona:</strong> {amarra.zona}</p>
                  <p className="mb-1"><strong>Nro Pilón:</strong> {amarra.nroPilon}</p>
                  <p className="mb-1"><strong>Precio Mensual:</strong> ${amarra.precioMensualBase}</p>
                  <p className="mb-0"><strong>Embarcación:</strong> {amarra.embarcacion?.nombre}</p>
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
                  <p className="mb-1"><strong>Precio Mensual:</strong> ${box.precioMensualBase}</p>
                  <p className="mb-0"><strong>Embarcación:</strong> {box.embarcacion?.nombre}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
