import { useNavigate } from 'react-router-dom';
import { MenuButton } from './MenuButton.jsx';
import { MenuPadre } from './MenuPadre.jsx';

export function MenuAdminEntidad({
  titulo,
  rutaAdministrar,
  rutaListar,
  textoAdministrar,
  textoListar,
}) {
  const navigate = useNavigate();

  return (
    <MenuPadre label={titulo}>
      <MenuButton
        label={textoAdministrar}
        onClick={() => navigate(rutaAdministrar)}
      />

      <MenuButton
        label={textoListar}
        onClick={() => navigate(rutaListar)}
      />
    </MenuPadre>
  );
}