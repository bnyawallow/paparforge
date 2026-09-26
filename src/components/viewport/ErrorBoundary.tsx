import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode | ((error: Error | undefined, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Handled model/component render error in ErrorBoundary:', error?.message || error);
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.error('Error in ErrorBoundary onError callback:', e);
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i]);
      if (hasChanged) {
        this.reset();
      }
    }
  }

  public reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

