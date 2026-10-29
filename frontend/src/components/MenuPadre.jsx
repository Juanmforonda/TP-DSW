import { CCard, CCardBody, CCardHeader } from '@coreui/react';

export function MenuPadre({ label, children }) {
  return (
    <CCard className="w-50 mx-auto mt-5">
          <CCardHeader className="text-center">
            {label}
          </CCardHeader>
          <CCardBody>
            {children}
          </CCardBody>
    </CCard>
  );
}
