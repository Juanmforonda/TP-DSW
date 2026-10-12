import { useNavigate } from 'react-router-dom';
import { MenuButton } from './menuButton';
import { MenuPadre } from './menuPadre.jsx';

export function MenuAdminBox(){
  const navigate = useNavigate();

  return (
    <MenuPadre label = 'Menú de administración de Boxes'>
      <MenuButton label = 'Administrar Boxes' onClick={() => navigate('/admin/boxes/administrar')} />
      <MenuButton label = 'Listar Boxes' onClick={() => navigate('/admin/boxes/listar')} />
    </MenuPadre>
  );
}