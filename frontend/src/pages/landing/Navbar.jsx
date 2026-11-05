import React, { useState } from 'react';
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LoginIcon from '@mui/icons-material/Login';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  const menuOptions = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    {
      text: 'Testimonials',
      icon: <CommentRoundedIcon />,
      path: '/testimonials',
    },
    { text: 'Contact', icon: <PhoneRoundedIcon />, path: '/contact' },
    { text: 'Iniciar sesión', icon: <LoginIcon />, path: '/login' },
  ];

  return (
    <nav>
      {/* Logo que lleva al Home */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Club Náutico" className="logo-image" />
      </Link>

      <div className="navbar-links-container">
        {/* Enlaces con Link */}
        <Link to="/">Home</Link>
        <Link to="/about">About us</Link>
        <Link to="/testimonials">Testimonials</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login">
          <button className="logbtn">Log in</button>
        </Link>
      </div>

      <button
        type="button"
        className="navbar-menu-container"
        aria-label={openMenu ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={openMenu}
        aria-controls="public-mobile-menu"
        onClick={() => setOpenMenu((isOpen) => !isOpen)}
      >
        {openMenu ? <HiOutlineXMark /> : <HiOutlineBars3 />}
      </button>

      {/* Menú móvil */}
      {openMenu && (
        <div className="mobile-menu" id="public-mobile-menu">
          <button
            type="button"
            className="mobile-menu-close"
            onClick={() => setOpenMenu(false)}
          >
            Cerrar
          </button>

          {/* Enlaces móviles con Link */}
          {menuOptions.map((item) => (
            <Link
              key={item.text}
              to={item.path}
              className="mobile-menu-link"
              onClick={() => setOpenMenu(false)}
            >
              <span className="mobile-menu-icon">{item.icon}</span>
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Drawer comentado (lo mantienes por si lo quieres usar después) */}
      {/* <Drawer anchor="right" open={openMenu} onClose={() => setOpenMenu(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenMenu(false)}
        >
          {menuOptions.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </Box>
      </Drawer> */}
    </nav>
  );
};

export default Navbar;
