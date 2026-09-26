import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import _tokens from './styles/_theme_tokens.json';
import { ConfigProvider } from 'antd';
import { loadRuntimeConfig } from './config/runtime-config';

// 👇 BroadcastChannel setup
const channel = new BroadcastChannel('pwa-window-control');
let allowRender = true;

channel.onmessage = (event) => {
  if (event.data === 'app-opened') {
    allowRender = false;
    alert(
      'Another instance of the app is already open. This one will now close.',
    );
    window.close(); // Or use `window.location.href = 'about:blank'`
  }
};

// Notify others that this window is opening
channel.postMessage('app-opened');

/**
 * Nothing that reads configuration may be imported statically here.
 *
 * constants.ts calls getRuntimeConfig() at module scope, and App and the
 * store import it transitively - so a static import would run that read while
 * /config.json was still in flight and throw before the first render. The
 * dynamic imports below happen only after the fetch has resolved.
 */
async function bootstrap() {
  await loadRuntimeConfig();

  const [
    { default: App },
    { default: store },
    { default: ErrorBoundary },
    { Provider },
  ] = await Promise.all([
    import('./App'),
    import('./store/store'),
    import('./module/common/components/ErrorBoundary/ErrorBoundary'),
    import('react-redux'),
  ]);

  // Render app only if this is the first window
  if (!allowRender) return;

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );
  root.render(
    <ConfigProvider theme={{ token: _tokens }}>
      <ErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
    </ConfigProvider>,
  );

  // Optionally clean up on unload
  window.addEventListener('unload', () => {
    channel.close();
  });
}

bootstrap().catch((err) => {
  console.error(err);
  const root = document.getElementById('root');
  if (root) {
    root.textContent = `Failed to load configuration: ${err.message}`;
  }
});

reportWebVitals();
