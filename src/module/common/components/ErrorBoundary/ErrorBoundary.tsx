import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  // When any of these values change, the boundary clears its error and re-renders children
  resetKeys?: unknown[];
}

interface IErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo.componentStack);
  }

  componentDidUpdate(prevProps: IErrorBoundaryProps) {
    const { resetKeys = [] } = this.props;
    const prevResetKeys = prevProps.resetKeys ?? [];
    if (
      this.state.error &&
      (resetKeys.length !== prevResetKeys.length ||
        resetKeys.some((key, index) => !Object.is(key, prevResetKeys[index])))
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <Result
        status="error"
        title="Something went wrong"
        subTitle={error.message}
        extra={[
          <Button key="retry" onClick={this.reset}>
            Try again
          </Button>,
          <Button
            key="reload"
            type="primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>,
        ]}
      />
    );
  }
}

export default ErrorBoundary;
