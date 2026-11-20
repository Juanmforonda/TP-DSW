import { MenuAdminEntidad } from '../../components/MenuAdminEntidad.jsx';

export function MenuAdminBox() {
  return (
    <MenuAdminEntidad
      titulo="Menú de administración de Boxes"
      textoAdministrar="Administrar Boxes"
      textoListar="Listar Boxes"
      rutaAdministrar="/admin/boxes/administrar"
      rutaListar="/admin/boxes/listar"
    />
  );
}