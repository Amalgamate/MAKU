import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PublicRouter } from './PublicRouter';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <PublicRouter />
    </BrowserRouter>
  </React.StrictMode>,
);
