import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuButton } from './menuButton';
import { MenuPadre } from './menuPadre.jsx';

export function MenuAdminSocios() {
  const navigate = useNavigate();

  return (
    <MenuPadre label="Menú de administración de Socios">
      <MenuButton
        label="Administrar Socios"
        onClick={() => navigate('/admin/socios/administrar')}
      />
      <MenuButton
        label="Afiliaciones"
        onClick={() => navigate('/admin/socios/afiliaciones')}
      />
      <MenuButton
        label="Cuotas y pagos"
        onClick={() => navigate('/admin/socios/cuotas')}
      />
    </MenuPadre>
  );
}