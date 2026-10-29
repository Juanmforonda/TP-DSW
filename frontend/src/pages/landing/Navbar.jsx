import React, { useState } from 'react';
import { HiOutlineBars3 } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
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

      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div>

      {/* Menú móvil */}
      {openMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '250px',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 9999,
            padding: '20px',
            boxShadow: '-5px 0px 15px rgba(0,0,0,0.2)',
          }}
        >
          <button
            onClick={() => setOpenMenu(false)}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
          >
            ✖ Cerrar
          </button>

          {/* Enlaces móviles con Link */}
          {menuOptions.map((item) => (
            <Link
              key={item.text}
              to={item.path}
              style={{
                display: 'block',
                padding: '15px 10px',
                borderBottom: '1px solid #eee',
                color: '#000',
                textDecoration: 'none',
                alignItems: 'center',
                gap: '10px',
              }}
              onClick={() => setOpenMenu(false)}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontWeight: '500' }}>{item.text}</span>
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
