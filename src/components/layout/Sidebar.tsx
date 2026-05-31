import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench, Home, Grid3X3, Star, Settings, MoreHorizontal,
  ChevronLeft, ChevronRight, ChevronDown, X, Moon, Sun, GitBranch, Globe,
} from 'lucide-react';
import { getTool, getToolsByCategory } from '@/lib/tool-registry';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/tool';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: '主页', icon: Home },
  { id: 'categories', label: '分类', icon: Grid3X3 },
  { id: 'favorites', label: '收藏', icon: Star },
  { id: 'settings', label: '设置', icon: Settings },
  { id: 'other', label: '其他', icon: MoreHorizontal },
];

export default function Sidebar({ collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentToolId = location.pathname.slice(1);
  const isHomePage = location.pathname === '/';
  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({ categories: true });
  const { getFavorites } = useFavorites();
  const { resolvedTheme, setTheme } = useTheme();

  const currentTool = currentToolId ? getTool(currentToolId) : undefined;
  const favoriteIds = getFavorites();

  const activeNavId = (() => {
    if (isHomePage) return 'home';
    if (currentTool) return 'categories';
    return '';
  })();

  const toggleNavExpand = (navId: string) => {
    setExpandedNav(prev => ({ ...prev, [navId]: !prev[navId] }));
  };

  const handleNavClick = (navId: string) => {
    if (navId === 'home') {
      navigate('/');
      onNavigate?.();
      return;
    }
    if (navId === 'categories' || navId === 'favorites' || navId === 'settings' || navId === 'other') {
      toggleNavExpand(navId);
      return;
    }
    onNavigate?.();
  };

  const renderExpandedContent = (navId: string) => {
    if (!expandedNav[navId]) return null;

    if (navId === 'categories') {
      return (
        <div className="space-y-0.5 ml-4">
          {CATEGORY_ORDER.map((cat) => {
            const tools = getToolsByCategory(cat);
            if (tools.length === 0) return null;
            const isActive = currentTool?.category === cat;
            return (
              <button
                key={cat}
                onClick={() => { navigate('/'); onNavigate?.(); }}
                className={cn(
                  'flex items-center w-full text-xs rounded-xl px-3 py-2 spring-transition',
                  isActive
                    ? 'bg-clay-green-light dark:bg-clay-green-deep text-clay-green-deep dark:text-clay-green-light font-bold shadow-inner'
                    : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface hover:translate-x-1'
                )}
              >
                <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                <span className="ml-auto text-[10px] opacity-50">{tools.length}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (navId === 'favorites') {
      if (favoriteIds.length === 0) {
        return <p className="text-[10px] text-on-surface-variant/50 ml-4 px-3 py-1">暂无收藏</p>;
      }
      return (
        <div className="space-y-0.5 ml-4">
          {favoriteIds.slice(0, 8).map((id) => {
            const tool = getTool(id);
            if (!tool) return null;
            const isActive = currentToolId === id;
            return (
              <button
                key={id}
                onClick={() => { navigate(`/${id}`); onNavigate?.(); }}
                className={cn(
                  'flex items-center w-full text-xs rounded-xl px-3 py-2 spring-transition gap-2',
                  isActive
                    ? 'bg-clay-green-light dark:bg-clay-green-deep text-clay-green-deep dark:text-clay-green-light font-bold shadow-inner'
                    : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface hover:translate-x-1'
                )}
              >
                <span className="truncate">{tool.name}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (navId === 'settings') {
      return (
        <div className="ml-4 px-3 py-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">深色模式</span>
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg bg-surface-container-high hover:bg-inverse-surface/10 spring-transition"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      );
    }

    if (navId === 'other') {
      return (
        <div className="space-y-0.5 ml-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full text-xs rounded-xl px-3 py-2 spring-transition gap-2 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface hover:translate-x-1"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="#"
            className="flex items-center w-full text-xs rounded-xl px-3 py-2 spring-transition gap-2 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface hover:translate-x-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>使用文档</span>
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <aside
      className={cn(
        'h-screen bg-surface dark:bg-surface-container flex flex-col z-50 transition-[width] duration-300 overflow-hidden',
        'w-64',
        collapsed ? 'md:w-[56px]' : 'md:w-64'
      )}
    >
      <div className={cn(
        'flex items-center shrink-0 border-b border-outline-variant/20',
        collapsed ? 'md:justify-center md:px-0 md:py-3' : 'gap-3 px-4 py-4'
      )}>
        <div className="w-9 h-9 rounded-full bg-clay-green-deep shadow-clay flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <div className={cn('min-w-0', collapsed && 'md:hidden')}>
          <h1 className="font-bold text-clay-green-deep dark:text-clay-green-main text-sm leading-tight">TestKit</h1>
          <p className="text-[10px] text-on-surface-variant opacity-70 leading-tight">工具集</p>
        </div>
        <button
          onClick={onNavigate}
          className="md:hidden ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavId === item.id;
          const isExpanded = expandedNav[item.id] ?? false;
          const hasChildren = ['categories', 'favorites', 'settings', 'other'].includes(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center w-full rounded-xl spring-transition relative group/nav',
                  collapsed ? 'md:justify-center md:px-0 md:py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-clay-green-light dark:bg-clay-green-deep text-clay-green-deep dark:text-clay-green-light shadow-inner font-bold'
                    : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface hover:translate-x-1'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className={cn('text-xs font-medium flex-1 text-left', collapsed && 'md:hidden')}>{item.label}</span>
                {hasChildren && !collapsed && (
                  <ChevronDown
                    className={cn('w-3.5 h-3.5 shrink-0 transition-transform duration-200', isExpanded ? '' : '-rotate-90')}
                  />
                )}
                {collapsed && (
                  <span className="hidden md:group-hover/nav:block absolute left-full ml-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </span>
                )}
              </button>
              {!collapsed && renderExpandedContent(item.id)}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-outline-variant/20 px-2 py-2">
        <div className={cn('flex items-center gap-2 px-2 py-1.5 overflow-hidden', collapsed && 'md:hidden')}>
          <div className="w-8 h-8 rounded-full shadow-md bg-clay-purple-light p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-clay-purple-main to-clay-blue-main" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold truncate">狐思墨兔</p>
            <p className="text-[10px] opacity-60 truncate">Free Tier</p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-full py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high spring-transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
