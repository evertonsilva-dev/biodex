import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from './ErrorPage';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unexpected Biodex application error.', error, errorInfo);
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const params = new URLSearchParams({
      type: 'unexpected',
      returnTo,
    });
    window.history.replaceState({}, '', `/error?${params}`);
  }

  render() {
    return this.state.hasError ? <ErrorPage type="unexpected" /> : this.props.children;
  }
}
