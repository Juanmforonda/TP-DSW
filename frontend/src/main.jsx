import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import { clearLegacyToken } from './utils/storage';

clearLegacyToken();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
