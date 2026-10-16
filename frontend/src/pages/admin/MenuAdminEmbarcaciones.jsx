import { useNavigate } from 'react-router-dom';
import { MenuButton } from '../../components/MenuButton.jsx';
import { MenuPadre } from '../../components/MenuPadre.jsx';

export function MenuAdminEmbarcaciones() {
  const navigate = useNavigate();

  return (
    <MenuPadre label="Menú de administración de Embarcaciones">
      <MenuButton
        label="Listado de embarcaciones"
        onClick={() => navigate('/admin/embarcaciones/listado')}
      />
      <MenuButton
        label="Ingresar embarcaciones"
        onClick={() => navigate('/admin/embarcaciones/ingresar')}
      />
      <MenuButton
        label="Tipos de Embarcación"
        onClick={() => navigate('/admin/embarcaciones/tipos')}
      />
    </MenuPadre>
  );
}