import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant">
          <AlertTriangle className="w-12 h-12 text-warning" />
          <div className="text-center">
            <p className="text-lg font-medium text-on-surface mb-1">工具加载出错</p>
            <p className="text-sm text-outline">{this.state.error?.message}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-sm rounded-md bg-primary hover:bg-on-primary-container text-white transition-colors"
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
