import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ToolErrorBoundaryProps {
  children: ReactNode;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ToolErrorBoundary extends Component<
  ToolErrorBoundaryProps,
  ToolErrorBoundaryState
> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 bg-bg-primary p-8">
          <AlertTriangle className="w-12 h-12 text-warning" />
          <h2 className="text-lg font-semibold text-text-primary">工具加载失败</h2>
          <p className="text-sm text-error max-w-md text-center">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
