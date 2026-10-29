// src/components/MenuButton.jsx
import React from 'react';
import { CButton } from '@coreui/react';

export function MenuButton({ label, onClick, color = 'primary' }) {
  return (
    <CButton color={color} className="w-100 mb-2" onClick={onClick}>
      {label}
    </CButton>
  );
}
