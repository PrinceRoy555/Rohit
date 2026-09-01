import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SiteConfigProvider } from './context/SiteConfigContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteConfigProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SiteConfigProvider>
  </StrictMode>,
);
