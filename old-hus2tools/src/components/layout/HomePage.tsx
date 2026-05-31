import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, Wrench, Star, Sparkles, Sun, Moon } from 'lucide-react';
import { getGroupedTools, searchTools } from '@/lib/tool-registry';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/tool';
import type { ToolDefinition, ExternalTool, ToolCategory } from '@/types/tool';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const CLAY_CARD_STYLES = [
  'bg-gradient-to-br from-clay-green-light to-clay-green shadow-clay-green',
  'bg-gradient-to-br from-clay-blue-light to-clay-blue shadow-clay-blue',
  'bg-gradient-to-br from-clay-pink-light to-clay-pink shadow-clay-pink',
  'bg-gradient-to-br from-clay-yellow-light to-clay-yellow shadow-clay-yellow',
  'bg-gradient-to-br from-clay-purple-light to-clay-purple shadow-clay-purple',
];

const CLAY_ICON_BG = [
  'bg-clay-white/60 text-clay-green-dark',
  'bg-clay-white/60 text-clay-blue-dark',
  'bg-clay-white/60 text-clay-pink-deep',
  'bg-clay-white/60 text-clay-yellow-dark',
  'bg-clay-white/60 text-clay-purple-dark',
];

function getClayCardStyle(index: number) {
  return CLAY_CARD_STYLES[index % CLAY_CARD_STYLES.length];
}

function getClayIconBg(index: number) {
  return CLAY_ICON_BG[index % CLAY_ICON_BG.length];
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [favRefresh, setFavRefresh] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();
  const { getFavorites, toggleFavorite, isFavorite } = useFavorites();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setSpinning(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setSpinning(false), 350);
  };

  const filteredGrouped = useMemo(() => {
    if (!query.trim()) return getGroupedTools();
    const results = searchTools(query);
    const grouped = {} as Record<ToolCategory, ToolDefinition[]>;
    for (const cat of CATEGORY_ORDER) grouped[cat] = [];
    for (const tool of results) {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push(tool);
    }
    return grouped;
  }, [query]);

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

  const hasResults = Object.values(filteredGrouped).some(tools => tools.length > 0);
  let globalIndex = 0;

  return (
    <div className="min-h-full relative overflow-hidden home-gradient animate-gradient">
      <button
        onClick={toggleTheme}
        className={cn(
          'fixed top-4 right-4 z-50 p-3 rounded-clay shadow-clay',
          'bg-clay-yellow-light/60 hover:shadow-clay-hover',
          'transition-all ease-spring',
          spinning && 'animate-spin-once'
        )}
        aria-label="切换主题"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-clay-yellow-dark" />
        ) : (
          <Moon className="w-5 h-5 text-clay-purple-dark" />
        )}
      </button>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-clay-blue-light/50 blur-[80px] rounded-full animate-float-1" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-clay-purple-light/40 blur-[70px] rounded-full animate-float-2" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-clay-green-light/40 blur-[60px] rounded-full animate-float-1" style={{ animationDelay: '-3s' }} />

        <div className="absolute top-[8%] right-[6%] w-5 h-5 bg-clay-pink-main/25 rounded-full animate-float-1" />
        <div className="absolute top-[18%] left-[8%] w-4 h-4 bg-clay-blue-main/25 rotate-45 animate-float-2" />
        <div className="absolute top-[40%] right-[4%] w-6 h-6 bg-clay-yellow-medium/25 animate-wiggle" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute bottom-[25%] left-[6%] w-3 h-3 bg-clay-green-main/25 rounded-full animate-float-1" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-[15%] right-[12%] w-5 h-5 bg-clay-purple-main/20 rotate-12 animate-float-2" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[60%] left-[3%] w-4 h-4 bg-clay-pink-medium/20 animate-wiggle" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '-1s' }} />
        <div className="absolute top-[30%] right-[18%] w-3 h-3 bg-clay-green-main/20 rotate-45 animate-float-1" style={{ animationDelay: '-5s' }} />
        <div className="absolute bottom-[35%] left-[15%] w-4 h-4 bg-clay-blue-main/15 rounded-full animate-float-2" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-16 h-16 rounded-clay-lg bg-clay-green-light shadow-clay-green flex items-center justify-center animate-wiggle">
              <Wrench className="w-8 h-8 text-clay-green-dark" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clay-purple-light/20 text-clay-purple-dark text-xs font-medium mb-4 shadow-clay">
            <Sparkles className="w-3 h-3" />
            <span>测试工程师工具箱</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            <span className="text-text-primary">Test</span>
            <span className="bg-gradient-to-r from-clay-green-dark via-clay-blue-dark to-clay-purple-dark bg-clip-text text-transparent animate-shimmer ml-1">Kit</span>
          </h1>
          <p className="text-text-secondary text-base mb-8">
            一站式在线工具集合，涵盖编码转换、文本处理、图片操作等
          </p>

          <div className="max-w-lg mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors duration-200 group-focus-within:text-clay-green-dark" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具... ⌘K"
              className="w-full bg-bg-secondary border-none rounded-clay pl-11 pr-4 py-3.5 text-sm text-text-primary outline-none placeholder:text-text-muted shadow-clay-inset focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.6),0_0_0_3px_rgba(116,198,157,0.3)] transition-all duration-300"
            />
          </div>
        </div>

        {!hasResults && query.trim() && (
          <div className="text-center py-16 text-text-secondary animate-fade-in text-sm">
            未找到匹配 &quot;{query}&quot; 的工具
          </div>
        )}

        {favoriteTools.length > 0 && !query.trim() && (
          <div className="mb-10 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-clay-yellow-dark fill-clay-yellow-dark" />
              <h2 className="text-sm font-semibold text-text-primary">收藏工具</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {favoriteTools.map((tool, idx) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  colorIndex={idx}
                  isFav={true}
                  onClick={() => handleToolClick(tool)}
                  onToggleFav={(e) => handleToggleFav(e, tool.id)}
                  delay={0}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-10">
          {CATEGORY_ORDER.map((cat) => {
            const tools = filteredGrouped[cat];
            if (!tools || tools.length === 0) return null;
            const startIdx = globalIndex;
            globalIndex += tools.length;

            return (
              <div key={cat} className="animate-slide-up" style={{ animationDelay: `${Math.min(startIdx * 15, 300)}ms` }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 bg-gradient-to-r from-clay-green-dark to-clay-blue-dark rounded-full" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs text-text-muted ml-0.5">{tools.length}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {tools.map((tool, idx) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      colorIndex={startIdx + idx}
                      isFav={isFavorite(tool.id)}
                      onClick={() => handleToolClick(tool)}
                      onToggleFav={(e) => handleToggleFav(e, tool.id)}
                      delay={Math.min((startIdx + idx) * 15, 500)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-20 pt-6 text-center text-xs text-text-muted/50">
          TestKit · {Object.values(filteredGrouped).flat().length} tools
        </footer>
      </div>
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
}: {
  tool: ToolDefinition;
  colorIndex: number;
  isFav: boolean;
  onClick: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
  delay: number;
}) {
  const isExternal = tool.type === 'external';
  const extTool = isExternal ? (tool as ExternalTool) : null;
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={cn(
        'relative bg-bg-secondary/90 backdrop-blur-sm rounded-clay-lg p-4 text-left group cursor-pointer overflow-hidden',
        'transition-all duration-300 ease-spring',
        isPressed
          ? 'shadow-clay-active scale-[0.97]'
          : isHovered
            ? 'shadow-clay-hover -translate-y-1.5'
            : 'shadow-clay',
        'animate-slide-up',
        isExternal && 'border-2 border-dashed border-clay-gray-medium/40'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {isHovered && !isPressed && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-clay-lg"
          style={{
            background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(116,198,157,0.1), transparent 60%)`,
          }}
        />
      )}

      <button
        onClick={onToggleFav}
        className={cn(
          'absolute top-2.5 right-2.5 p-1.5 rounded-clay-sm transition-all duration-200 z-10',
          isFav
            ? 'text-clay-yellow-dark opacity-100 shadow-clay-yellow'
            : 'text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-clay-yellow-dark'
        )}
      >
        <Star className={cn('w-3.5 h-3.5', isFav && 'fill-clay-yellow-dark')} />
      </button>

      <div className="relative flex items-start gap-3">
        <span className={cn(
          'w-10 h-10 rounded-clay flex items-center justify-center shrink-0 shadow-clay transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-3',
          isExternal ? 'bg-clay-gray-medium/50 text-text-secondary' : getClayIconBg(colorIndex)
        )}>
          {tool.icon}
        </span>
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate transition-colors duration-200 group-hover:text-clay-green-dark">
              {tool.name}
            </span>
            {isExternal && (
              <ExternalLink className="w-3 h-3 text-text-muted/50 shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay-blue-dark" />
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {extTool?.alternatives && extTool.alternatives.length > 0 && (
        <div className="relative mt-3 pt-2.5 border-t border-clay-gray-medium/30 flex flex-wrap gap-1.5">
          {extTool.alternatives.map((alt, aIdx) => (
            <a
              key={alt.url}
              href={alt.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-clay-sm transition-all duration-200',
                getClayCardStyle(aIdx).split(' ').slice(0, 1).join(' '),
                'text-text-secondary hover:text-text-primary hover:shadow-clay'
              )}
            >
              {alt.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
