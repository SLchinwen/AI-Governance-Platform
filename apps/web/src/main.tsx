import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ProjectContextProvider } from './platform/store/projectContextStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectContextProvider>
      <App />
    </ProjectContextProvider>
  </StrictMode>,
);
