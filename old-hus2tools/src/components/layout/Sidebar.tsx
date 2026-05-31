import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { getTool, getToolsByCategory } from '@/lib/tool-registry';
import { CATEGORY_LABELS } from '@/types/tool';
import type { ToolDefinition } from '@/types/tool';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentToolId = location.pathname.slice(1);
  const { getRecent } = useRecentTools();
  const { getFavorites, toggleFavorite, isFavorite } = useFavorites();

  const recentIds = getRecent().slice(0, 5);
  const recentTools = recentIds.map(id => getTool(id)).filter((t): t is ToolDefinition => !!t);

  const favIds = getFavorites().slice(0, 5);
  const favTools = favIds.map(id => getTool(id)).filter((t): t is ToolDefinition => !!t);

  const currentTool = currentToolId ? getTool(currentToolId) : undefined;
  const relatedTools = currentTool && currentTool.type === 'internal'
    ? getToolsByCategory(currentTool.category).filter(t => t.id !== currentToolId)
    : [];

  const handleToolClick = (tool: ToolDefinition) => {
    if (tool.type === 'internal') navigate(`/${tool.id}`);
    else window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-secondary/70 backdrop-blur-md border-r border-clay-gray-medium/20 transition-[width] duration-300 ease-spring',
        collapsed ? 'w-[48px]' : 'w-[200px]'
      )}
    >
      <div className="p-2">
        <button
          onClick={() => navigate('/')}
          className={cn(
            'flex items-center w-full rounded-clay transition-all duration-300 ease-spring',
            collapsed
              ? 'justify-center p-2 text-text-muted hover:text-clay-green-dark bg-clay-green-light shadow-clay-green'
              : 'gap-2 px-3 py-2.5 bg-clay-green-light text-clay-green-dark font-semibold shadow-clay-green hover:shadow-clay-hover hover:-translate-y-0.5'
          )}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className={cn(
            'text-sm overflow-hidden whitespace-nowrap transition-all duration-200 ease-spring',
            collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
          )}>
            返回首页
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {favTools.length > 0 && (
          <div className="mb-3">
            <SectionLabel
              collapsed={collapsed}
              icon={<div className="w-1.5 h-3 bg-gradient-to-b from-clay-yellow-dark to-clay-pink-dark rounded-full" />}
              label="收藏"
            />
            <div className="space-y-1 px-1.5">
              {favTools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  isActive={tool.id === currentToolId}
                  collapsed={collapsed}
                  isFav={true}
                  onClick={() => handleToolClick(tool)}
                  onToggleFav={() => toggleFavorite(tool.id)}
                />
              ))}
            </div>
          </div>
        )}

        {recentTools.length > 0 && (
          <div className="mb-3">
            <SectionLabel
              collapsed={collapsed}
              icon={<div className="w-1.5 h-3 bg-gradient-to-b from-clay-blue-dark to-clay-purple-dark rounded-full" />}
              label="最近使用"
            />
            <div className="space-y-1 px-1.5">
              {recentTools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  isActive={tool.id === currentToolId}
                  collapsed={collapsed}
                  isFav={isFavorite(tool.id)}
                  onClick={() => handleToolClick(tool)}
                  onToggleFav={() => toggleFavorite(tool.id)}
                />
              ))}
            </div>
          </div>
        )}

        {relatedTools.length > 0 && (
          <div className="mb-3">
            <SectionLabel
              collapsed={collapsed}
              icon={<div className="w-1.5 h-3 bg-gradient-to-b from-clay-green-dark to-clay-blue-dark rounded-full" />}
              label={currentTool ? CATEGORY_LABELS[currentTool.category] : '相关工具'}
            />
            <div className="space-y-1 px-1.5">
              {relatedTools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  isActive={false}
                  collapsed={collapsed}
                  isFav={isFavorite(tool.id)}
                  onClick={() => handleToolClick(tool)}
                  onToggleFav={() => toggleFavorite(tool.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-clay-gray-medium/20 p-1.5">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full py-2 rounded-clay text-text-muted hover:text-text-secondary bg-bg-tertiary shadow-clay hover:shadow-clay-hover transition-all duration-300 ease-spring"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ collapsed, icon, label }: { collapsed: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 overflow-hidden transition-all duration-200 ease-spring',
      collapsed ? 'opacity-0 h-0 py-0' : 'opacity-100 h-auto'
    )}>
      <span className="shrink-0">{icon}</span>
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">{label}</span>
    </div>
  );
}

function ToolItem({ tool, isActive, collapsed, isFav, onClick, onToggleFav }: {
  tool: ToolDefinition; isActive: boolean; collapsed: boolean; isFav: boolean; onClick: () => void; onToggleFav: () => void;
}) {
  const isExternal = tool.type === 'external';

  return (
    <div className="relative group/item">
      <button
        onClick={onClick}
        className={cn(
          'flex items-center w-full text-sm transition-all duration-300 ease-spring rounded-xl',
          isActive
            ? 'bg-clay-green-light text-clay-green-dark font-medium shadow-clay-inset'
            : 'text-text-secondary hover:text-text-primary hover:bg-clay-gray-light',
          collapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5'
        )}
        title={collapsed ? tool.name : undefined}
      >
        <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-70">{tool.icon}</span>
        <span className={cn(
          'ml-2 truncate text-xs overflow-hidden whitespace-nowrap transition-all duration-200 ease-spring',
          collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'
        )}>{tool.name}</span>
        {!collapsed && isExternal && <ExternalLink className="w-3 h-3 ml-auto shrink-0 text-text-muted/40" />}
      </button>
      {!collapsed && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-lg transition-all duration-150',
            isFav
              ? 'text-clay-yellow-dark opacity-100'
              : 'text-text-muted/30 opacity-0 group-hover/item:opacity-100 hover:text-clay-yellow-dark'
          )}
        >
          <Star className={cn('w-3 h-3', isFav && 'fill-clay-yellow-dark')} />
        </button>
      )}
    </div>
  );
}
