import { MenuAdminEntidad } from '../../components/MenuAdminEntidad.jsx';

export function MenuAdminAmarras() {
  return (
    <MenuAdminEntidad
      titulo="Menú de administración de Amarras"
      textoAdministrar="Administrar Amarras"
      textoListar="Listar Amarras"
      rutaAdministrar="/admin/amarras/administrar"
      rutaListar="/admin/amarras/listar"
    />
  );
}