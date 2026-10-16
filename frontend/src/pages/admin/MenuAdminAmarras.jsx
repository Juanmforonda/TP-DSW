import { useNavigate } from 'react-router-dom';
import { MenuButton } from '../../components/MenuButton.jsx';
import { MenuPadre } from '../../components/MenuPadre.jsx';

export function MenuAdminAmarras(){
  const navigate = useNavigate();

  return (
    <MenuPadre label = 'Menú de administración de Amarras'>
      <MenuButton label = 'Administrar Amarras' onClick={() => navigate('/admin/amarras/administrar')} />
      <MenuButton label = 'Listar Amarras' onClick={() => navigate('/admin/amarras/listar')} />
    </MenuPadre>
  );
}