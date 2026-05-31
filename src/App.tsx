import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './components/layout/HomePage';
import { ToolErrorBoundary } from './components/shared/ToolErrorBoundary';
import { registerAllTools } from './tools';
import { getTool } from './lib/tool-registry';

registerAllTools();

function ToolRouter() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? getTool(toolId) : undefined;

  if (!tool || tool.type === 'external') {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant animate-fade-in">
        <div className="text-center">
          <p className="text-lg mb-2">工具未找到</p>
          <p className="text-sm text-outline">请从首页选择一个工具</p>
        </div>
      </div>
    );
  }

  const Component = tool.component;
  return (
    <ToolErrorBoundary>
      <div className="animate-slide-up">
        <Component />
      </div>
    </ToolErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path=":toolId" element={<ToolRouter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
