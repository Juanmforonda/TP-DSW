export function LoadingState({ message = 'Cargando...' }) {
  return (
    <div className="text-center p-4">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
}
