import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // hoặc ./pages/NumberGame.jsx
import './styles/index.css'; // Đảm bảo file tồn tại

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
