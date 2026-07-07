import { useEffect, useState } from 'react';
import { getEmbarcacionesPorSocio } from '../api/embarcaciones';
import './socioHome.css'; 

export function SocioEmbarcaciones({ idSocio }) {
  const [embarcs, setEmbarcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idSocio) {
      setError('No se pudo obtener el ID del socio');
      setLoading(false);
      return;
    }

    getEmbarcacionesPorSocio(idSocio)
      .then(res => {
        const embarcaciones = res.data?.data;
        if (!Array.isArray(embarcaciones)) throw new Error('Formato inesperado');
        setEmbarcs(embarcaciones);
      })
      .catch(err => {
        console.error('❌ Error al cargar embarcaciones:', err);
        setError('Error al cargar embarcaciones');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idSocio]);

  return (
    <div className="socio-container">
      <h2 className="socio-title">Mis embarcaciones</h2>
      <p className="socio-subtitle">Listado de embarcaciones registradas</p>

      {loading && <p>Cargando embarcaciones...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && embarcs.length === 0 && (
        <p>No tenés embarcaciones registradas.</p>
      )}

      <div className="row">
        {embarcs.map((embarcacion) => (
          <div key={embarcacion.id} className="col-md-6 mb-4">
            <div className="card socio-card shadow-sm p-3">
              <h5 className="mb-2">{embarcacion.nombre}</h5>
              <p className="mb-1"><strong>Matrícula:</strong> {embarcacion.matricula}</p>
              <p className="mb-1"><strong>Eslora:</strong> {embarcacion.eslora} m</p>
              <p className="mb-0"><strong>Tipo:</strong> {embarcacion.tipoEmbarcacion.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
