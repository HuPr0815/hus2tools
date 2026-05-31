import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  ArrowRight,
  Wrench,
  LayoutGrid,
  List,
} from 'lucide-react';
import { getGroupedTools } from '@/lib/tool-registry';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/tool';
import type { ToolDefinition, ToolCategory } from '@/types/tool';
import { useFavorites } from '@/hooks/useFavorites';
import { useCategoryOrder } from '@/hooks/useCategoryOrder';
import { cn } from '@/lib/utils';

const CLAY_ICON_BG = [
  'bg-clay-green-light text-clay-green-deep',
  'bg-clay-pink-light text-clay-pink-deep',
  'bg-clay-purple-light text-clay-purple-deep',
  'bg-clay-yellow-light text-clay-yellow-deep',
  'bg-clay-blue-light text-clay-blue-deep',
];

function getClayIconBg(index: number) {
  return CLAY_ICON_BG[index % CLAY_ICON_BG.length];
}

export default function HomePage() {
  const [favRefresh, setFavRefresh] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const { getFavorites, toggleFavorite, isFavorite } = useFavorites();
  const { getOrder, setOrder } = useCategoryOrder();
  const displayOrder = getOrder(CATEGORY_ORDER) as ToolCategory[];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredGrouped = useMemo(() => getGroupedTools(), []);

  const favoriteTools = useMemo(() => {
    void favRefresh;
    const ids = getFavorites();
    const all = Object.values(getGroupedTools()).flat();
    return ids.map(id => all.find(t => t.id === id)).filter((t): t is ToolDefinition => !!t);
  }, [favRefresh, getFavorites]);

  const handleToolClick = (tool: ToolDefinition) => {
    if (tool.type === 'internal') navigate(`/${tool.id}`);
    else window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleFav = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    toggleFavorite(toolId);
    setFavRefresh(prev => prev + 1);
  };

  const categoryStartIndices = useMemo(() => {
    const map = new Map<ToolCategory, number>();
    let idx = 0;
    for (const cat of displayOrder) {
      map.set(cat, idx);
      idx += (filteredGrouped[cat]?.length ?? 0);
    }
    return map;
  }, [filteredGrouped, displayOrder]);

  return (
    <div className="min-h-screen relative bg-background text-on-surface overflow-x-hidden">
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none',
          background: `radial-gradient(circle 400px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(var(--primary-rgb), 0.08), transparent 80%)`,
          zIndex: 10
        }}
      />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-clay-purple-light/20 blur-[100px] animate-float" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-clay-green-light/30 blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-clay-yellow-light/20 blur-[80px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="pt-20 md:pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-4 md:p-12 bg-white dark:bg-surface-container shadow-clay flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 space-y-4">
              <span className="inline-block bg-clay-purple-light text-clay-purple-deep px-4 py-1.5 rounded-full font-bold text-[12px] tracking-wider">✨ 欢迎使用</span>
              <h2 className="font-display-hero text-display-hero leading-tight animate-gradient-text">TestKit 工具集</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md leading-relaxed">
                由 <span className="text-clay-green-deep dark:text-clay-green-main font-bold">husmall2un2</span>（狐思墨兔 · 胡小二）精心打造的在线工具箱，涵盖格式化、编解码、数据转换、图片处理等 50+ 实用工具，即开即用，高效便捷。
              </p>
              <div className="flex gap-4 pt-4">
                <button className="bg-primary text-on-primary px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-clay hover:scale-105 spring-transition ripple-effect">开始使用</button>
                <button className="bg-surface text-on-surface-variant px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-clay-inset hover:bg-surface-container-low spring-transition">了解更多</button>
              </div>
            </div>
            <div className="hidden md:flex w-full md:w-[400px] h-[300px] rounded-2xl overflow-hidden shadow-clay relative rotate-2 group hover:rotate-0 spring-transition bg-gradient-to-br from-clay-green-light via-clay-blue-light to-clay-purple-light items-center justify-center">
              <Wrench className="w-24 h-24 text-clay-green-deep/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-green-deep/40 to-transparent" />
            </div>
          </div>
        </section>

        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 rounded-xl', viewMode === 'grid' ? 'bg-surface shadow-clay text-primary' : 'bg-surface-container shadow-clay-inset text-on-surface-variant')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-xl', viewMode === 'list' ? 'bg-surface shadow-clay text-primary' : 'bg-surface-container shadow-clay-inset text-on-surface-variant')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {favoriteTools.length > 0 && (
          <section className="mb-10 content-visibility-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-clay-yellow-dark fill-clay-yellow-dark" />
                <h3 className="font-headline-md text-headline-md">我的收藏</h3>
              </div>
            </div>
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-3'
            )}>
              {favoriteTools.map((tool, idx) => (
                <ToolCard key={tool.id} tool={tool} colorIndex={idx} isFav={true} onClick={() => handleToolClick(tool)} onToggleFav={(e) => handleToggleFav(e, tool.id)} delay={0} viewMode={viewMode} />
              ))}
            </div>
          </section>
        )}

        {displayOrder.map((cat) => {
          const tools = filteredGrouped[cat];
          if (!tools || tools.length === 0) return null;
          const startIdx = categoryStartIndices.get(cat) ?? 0;

          return (
            <section
              key={cat}
              className="mb-10 content-visibility-auto"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', cat)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromCat = e.dataTransfer.getData('text/plain') as ToolCategory;
                const newOrder = [...displayOrder];
                const fromIdx = newOrder.indexOf(fromCat);
                const toIdx = newOrder.indexOf(cat);
                if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
                  [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
                  setOrder(newOrder);
                }
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-headline-md">{CATEGORY_LABELS[cat]}</h3>
              </div>
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-3'
              )}>
                {tools.map((tool, idx) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    colorIndex={startIdx + idx}
                    isFav={isFavorite(tool.id)}
                    onClick={() => handleToolClick(tool)}
                    onToggleFav={(e) => handleToggleFav(e, tool.id)}
                    delay={Math.min((startIdx + idx) * 60, 600)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="w-full py-8 md:py-12 border-t border-outline-variant mt-12 bg-surface-dim/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-gutter">
          <p className="font-body-sm text-body-sm text-on-surface-variant">&copy; 2024 TestKit by husmall2un2. 狐思墨兔 · 胡小二 出品</p>
          <div className="flex gap-6 md:gap-8">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary spring-transition" href="#">使用文档</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary spring-transition" href="#">技术支持</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary spring-transition" href="#">隐私政策</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary spring-transition" href="#">API 状态</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function ToolCard({
  tool,
  colorIndex,
  isFav,
  onClick,
  onToggleFav,
  delay,
  viewMode,
}: {
  tool: ToolDefinition;
  colorIndex: number;
  isFav: boolean;
  onClick: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
  delay: number;
  viewMode: 'grid' | 'list';
}) {
  const isExternal = tool.type === 'external';

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="pop-in bg-white dark:bg-surface-container rounded-2xl p-4 shadow-clay spring-transition group flex items-center gap-4 cursor-pointer relative"
        style={{ animationDelay: `${delay}ms` }}
      >
        <button
          onClick={onToggleFav}
          className={cn(
            'p-1 rounded-lg transition-all duration-200 z-10',
            isFav
              ? 'text-clay-yellow-dark'
              : 'text-on-surface-variant/20 opacity-0 group-hover:opacity-100 hover:text-clay-yellow-dark'
          )}
        >
          <Star className={cn('w-3.5 h-3.5', isFav && 'fill-clay-yellow-dark')} />
        </button>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-clay shrink-0', getClayIconBg(colorIndex))}>
          <span className="[&>svg]:w-5 [&>svg]:h-5">{tool.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm flex items-center gap-2">
            {tool.name}
            {isExternal && <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant/40" />}
          </h4>
          <p className="text-xs text-on-surface-variant truncate">{tool.description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 spring-transition shrink-0" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="pop-in tilt-3d bg-white dark:bg-surface-container rounded-3xl p-6 md:p-8 shadow-clay shadow-clay-hover spring-transition group flex flex-col gap-4 md:gap-6 cursor-pointer relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={onToggleFav}
        className={cn(
          'absolute top-4 right-4 p-1.5 rounded-xl transition-all duration-200 z-10',
          isFav
            ? 'text-clay-yellow-dark opacity-100'
            : 'text-on-surface-variant/20 opacity-0 group-hover:opacity-100 hover:text-clay-yellow-dark'
        )}
      >
        <Star className={cn('w-4 h-4', isFav && 'fill-clay-yellow-dark')} />
      </button>

      <div className={cn('w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-clay', getClayIconBg(colorIndex))}>
        <span className="[&>svg]:w-7 [&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8">{tool.icon}</span>
      </div>

      <div>
        <h4 className="font-headline-md text-headline-md mb-1 flex items-center gap-2">
          {tool.name}
          {isExternal && <ExternalLink className="w-4 h-4 text-on-surface-variant/40" />}
        </h4>
        <p className="text-sm text-on-surface-variant line-clamp-2">{tool.description}</p>
      </div>

      <div className="mt-auto pt-3 flex items-center">
        {isExternal && (
          <span className="bg-clay-purple-light/30 px-2 py-0.5 rounded-md text-[10px] font-bold text-clay-purple-deep">外部链接</span>
        )}
        <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 spring-transition ml-auto" />
      </div>
    </div>
  );
}
