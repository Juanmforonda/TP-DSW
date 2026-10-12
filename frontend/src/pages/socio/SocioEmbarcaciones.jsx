import { useEffect, useState } from 'react';
import { getEmbarcacionesActivasPorSocio } from '../../api/embarcaciones';
import '../../components/SocioHome.css'; 
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';

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

    getEmbarcacionesActivasPorSocio(idSocio)
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

      {loading && <LoadingState message="Cargando embarcaciones..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && embarcs.length === 0 && (
        <EmptyState message="No tenés embarcaciones registradas." />
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
