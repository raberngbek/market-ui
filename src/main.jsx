import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import App from './App';
import './styles/global.css';

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted';

function isChunkLoadError(error) {
  const msg = error?.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('loading CSS chunk')
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return null;
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error.message, '\nStack:', error.stack, '\nInfo:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Unknown error';
      const isChunk = isChunkLoadError(this.state.error);
      return (
        <div style={{ padding: '2rem', maxWidth: 600, margin: '4rem auto', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1>{isChunk ? 'New version available' : 'Something went wrong'}</h1>
          <p>{isChunk ? 'The app has been updated. Please reload to continue.' : message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
