import { MenuButton } from './menuButton';
import { MenuPadre } from './menuPadre.jsx';

export function MenuAdminEmbarcaciones({ onSeleccion }) {
  return (
    <MenuPadre label="Menú de administración de Embarcaciones">
      <MenuButton
        label="Listado de embarcaciones"
        onClick={() => onSeleccion('listadoEmbarcaciones')}
      />
      <MenuButton
        label="Ingresar embarcaciones"
        onClick={() => onSeleccion('ingresarEmbarcaciones')}
      />
      <MenuButton
        label="Tipos de Embarcación"
        onClick={() => onSeleccion('tiposEmbarcacion')}
      />
    </MenuPadre>
  );
}