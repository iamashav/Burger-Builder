import '@fontsource/anton/400.css';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { store } from './store';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
