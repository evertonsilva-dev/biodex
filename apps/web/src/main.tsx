import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { CollectionsProvider } from './collections/CollectionsProvider';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppErrorBoundary>
          <CollectionsProvider>
            <App />
          </CollectionsProvider>
        </AppErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
