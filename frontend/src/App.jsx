import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminPanel } from './pages/adminPanel.jsx';
import Login from "./pages/Login";
import { SocioPanel } from './pages/socioPanel.jsx';
import Home from './pages/landing/Home';
import About from './pages/landing/About';
import Testimonials from './pages/landing/Testimonials';
import Contact from './pages/landing/Contact';
import { PagoResultado } from './pages/PagoResultado.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/socio" element={<SocioPanel />} />
        <Route path="/pago/exito" element={<PagoResultado tipo="exito" />} />
        <Route path="/pago/pendiente" element={<PagoResultado tipo="pendiente" />} />
        <Route path="/pago/error" element={<PagoResultado tipo="error" />} />
      </Routes>
    </BrowserRouter>
  )
}
