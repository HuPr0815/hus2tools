import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Plus, Minus, RotateCcw } from 'lucide-react';

type GradientType = 'linear' | 'radial';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientPreset {
  name: string;
  type: GradientType;
  stops: { color: string; position: number }[];
  angle?: number;
  direction?: string;
  shape?: 'circle' | 'ellipse';
  positionRadial?: string;
}

const DIRECTION_PRESETS = [
  { label: '↑', value: 'to top', angle: 0 },
  { label: '↗', value: 'to top right', angle: 45 },
  { label: '→', value: 'to right', angle: 90 },
  { label: '↘', value: 'to bottom right', angle: 135 },
  { label: '↓', value: 'to bottom', angle: 180 },
  { label: '↙', value: 'to bottom left', angle: 225 },
  { label: '←', value: 'to left', angle: 270 },
  { label: '↖', value: 'to top left', angle: 315 },
];

const RADIAL_POSITIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
];

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Sunset',
    type: 'linear',
    stops: [
      { color: '#ff6b35', position: 0 },
      { color: '#f7c59f', position: 50 },
      { color: '#efefd0', position: 100 },
    ],
    angle: 180,
  },
  {
    name: 'Ocean',
    type: 'linear',
    stops: [
      { color: '#0077b6', position: 0 },
      { color: '#00b4d8', position: 50 },
      { color: '#90e0ef', position: 100 },
    ],
    angle: 135,
  },
  {
    name: 'Forest',
    type: 'linear',
    stops: [
      { color: '#1b4332', position: 0 },
      { color: '#2d6a4f', position: 40 },
      { color: '#52b788', position: 100 },
    ],
    angle: 160,
  },
  {
    name: 'Aurora',
    type: 'linear',
    stops: [
      { color: '#0d1b2a', position: 0 },
      { color: '#1b3a4b', position: 25 },
      { color: '#006466', position: 50 },
      { color: '#0cb899', position: 75 },
      { color: '#90e0ef', position: 100 },
    ],
    angle: 135,
  },
  {
    name: 'Candy',
    type: 'linear',
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#ee82ee', position: 50 },
      { color: '#dda0dd', position: 100 },
    ],
    angle: 90,
  },
  {
    name: 'Neon',
    type: 'linear',
    stops: [
      { color: '#ff00ff', position: 0 },
      { color: '#00ffff', position: 50 },
      { color: '#39ff14', position: 100 },
    ],
    angle: 45,
  },
  {
    name: 'Peach',
    type: 'linear',
    stops: [
      { color: '#ffecd2', position: 0 },
      { color: '#fcb69f', position: 100 },
    ],
    angle: 135,
  },
  {
    name: 'Midnight',
    type: 'linear',
    stops: [
      { color: '#0f0c29', position: 0 },
      { color: '#302b63', position: 50 },
      { color: '#24243e', position: 100 },
    ],
    angle: 180,
  },
  {
    name: 'Ember',
    type: 'linear',
    stops: [
      { color: '#f12711', position: 0 },
      { color: '#f5af19', position: 100 },
    ],
    angle: 90,
  },
  {
    name: 'Lavender',
    type: 'linear',
    stops: [
      { color: '#e4c1f9', position: 0 },
      { color: '#d4a5f3', position: 33 },
      { color: '#a2d2ff', position: 66 },
      { color: '#cae9ff', position: 100 },
    ],
    angle: 135,
  },
  {
    name: 'Radial Glow',
    type: 'radial',
    stops: [
      { color: '#ff6a88', position: 0 },
      { color: '#ff99ac', position: 40 },
      { color: '#ffc8dd', position: 70 },
      { color: '#ffecd2', position: 100 },
    ],
    shape: 'circle',
    positionRadial: 'center',
  },
  {
    name: 'Ellipse Mist',
    type: 'radial',
    stops: [
      { color: '#74c69d', position: 0 },
      { color: '#b7e4c7', position: 50 },
      { color: '#d8f3dc', position: 100 },
    ],
    shape: 'ellipse',
    positionRadial: 'center',
  },
];

let nextId = 1;
function createId(): string {
  return `stop-${nextId++}`;
}

function createDefaultStops(): ColorStop[] {
  return [
    { id: createId(), color: '#ff6b6b', position: 0 },
    { id: createId(), color: '#4ecdc4', position: 100 },
  ];
}

export default function CssGradient() {
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [stops, setStops] = useState<ColorStop[]>(createDefaultStops);
  const [angle, setAngle] = useState(135);
  const [direction, setDirection] = useState('');
  const [shape, setShape] = useState<'circle' | 'ellipse'>('circle');
  const [radialPosition, setRadialPosition] = useState('center');
  const [copied, setCopied] = useState(false);

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  const gradientCSS = useMemo(() => {
    const colorStops = sortedStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      const dir = direction || `${angle}deg`;
      return `linear-gradient(${dir}, ${colorStops})`;
    }
    return `radial-gradient(${shape} at ${radialPosition}, ${colorStops})`;
  }, [gradientType, sortedStops, angle, direction, shape, radialPosition]);

  const fullCSS = useMemo(() => `background: ${gradientCSS};`, [gradientCSS]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullCSS;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fullCSS]);

  const handleStopColorChange = useCallback((id: string, color: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }, []);

  const handleStopPositionChange = useCallback((id: string, position: number) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, position } : s)));
  }, []);

  const handleAddStop = useCallback(() => {
    if (stops.length >= 8) return;
    const lastStop = stops[stops.length - 1];
    const secondLast = stops[stops.length - 2];
    const newPos = lastStop && secondLast
      ? Math.round((lastStop.position + secondLast.position) / 2)
      : 50;
    setStops((prev) => [...prev, { id: createId(), color: '#ffffff', position: newPos }]);
  }, [stops]);

  const handleRemoveStop = useCallback((id: string) => {
    setStops((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const handleDirectionPreset = useCallback((dir: string, dirAngle: number) => {
    setDirection(dir);
    setAngle(dirAngle);
  }, []);

  const handleAngleChange = useCallback((newAngle: number) => {
    setAngle(newAngle);
    setDirection('');
  }, []);

  const handlePreset = useCallback((preset: GradientPreset) => {
    setGradientType(preset.type);
    setStops(preset.stops.map((s) => ({ id: createId(), color: s.color, position: s.position })));
    if (preset.type === 'linear') {
      setAngle(preset.angle ?? 135);
      setDirection(preset.direction ?? '');
    } else {
      setShape(preset.shape ?? 'circle');
      setRadialPosition(preset.positionRadial ?? 'center');
    }
  }, []);

  const handleReset = useCallback(() => {
    setGradientType('linear');
    setStops(createDefaultStops());
    setAngle(135);
    setDirection('');
    setShape('circle');
    setRadialPosition('center');
  }, []);

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-clay-sm flex items-center justify-center"
          style={{ background: gradientCSS }}
        />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">CSS 渐变生成器</h2>
          <p className="text-sm text-on-surface-variant">可视化生成 linear-gradient 与 radial-gradient</p>
        </div>
      </div>

      <div
        className="w-full h-48 rounded-clay-lg shadow-clay border border-outline-variant/30 transition-all ease-spring duration-300"
        style={{ background: gradientCSS }}
      />

      <div className="flex gap-2">
        <button
          onClick={() => setGradientType('linear')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-clay-sm transition-all ease-spring duration-200 ${
            gradientType === 'linear'
              ? 'bg-surface-container shadow-clay-inset text-on-surface'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => setGradientType('radial')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-clay-sm transition-all ease-spring duration-200 ${
            gradientType === 'radial'
              ? 'bg-surface-container shadow-clay-inset text-on-surface'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Radial
        </button>
      </div>

      {gradientType === 'linear' && (
        <div className="flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant/30 rounded-clay-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">角度</span>
            <span className="text-sm font-mono text-on-surface">{angle}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => handleAngleChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex flex-wrap gap-1.5">
            {DIRECTION_PRESETS.map((d) => (
              <button
                key={d.value}
                onClick={() => handleDirectionPreset(d.value, d.angle)}
                className={`w-9 h-9 flex items-center justify-center text-sm rounded-clay-sm transition-all ease-spring duration-200 ${
                  direction === d.value
                    ? 'bg-surface-container shadow-clay-inset text-on-surface'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                }`}
                title={d.value}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {gradientType === 'radial' && (
        <div className="flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant/30 rounded-clay-sm p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShape('circle')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-clay-sm transition-all ease-spring duration-200 ${
                shape === 'circle'
                  ? 'bg-surface-container shadow-clay-inset text-on-surface'
                  : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => setShape('ellipse')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-clay-sm transition-all ease-spring duration-200 ${
                shape === 'ellipse'
                  ? 'bg-surface-container shadow-clay-inset text-on-surface'
                  : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Ellipse
            </button>
          </div>
          <div>
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">位置</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {RADIAL_POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setRadialPosition(pos)}
                  className={`px-3 py-1.5 text-xs rounded-clay-sm transition-all ease-spring duration-200 ${
                    radialPosition === pos
                      ? 'bg-surface-container shadow-clay-inset text-on-surface'
                      : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant/30 rounded-clay-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">色标</span>
          <button
            onClick={handleAddStop}
            disabled={stops.length >= 8}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-clay-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-clay-inset transition-all ease-spring duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
                className="w-9 h-9 rounded-clay-sm cursor-pointer border border-outline-variant/30 bg-transparent shrink-0"
              />
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => handleStopPositionChange(stop.id, Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <span className="text-xs font-mono text-on-surface-variant w-10 text-right">{stop.position}%</span>
              <button
                onClick={() => handleRemoveStop(stop.id)}
                disabled={stops.length <= 2}
                className="inline-flex items-center justify-center w-7 h-7 rounded-clay-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-clay-inset transition-all ease-spring duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">预设</span>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePreset(preset)}
              className="group flex flex-col items-center gap-1.5 transition-all ease-spring duration-200"
            >
              <div
                className="w-14 h-14 rounded-clay-sm shadow-clay border border-outline-variant/30 transition-transform ease-spring duration-200 group-hover:scale-105"
                style={{
                  background:
                    preset.type === 'linear'
                      ? `linear-gradient(${preset.angle ?? 135}deg, ${preset.stops
                          .map((s) => `${s.color} ${s.position}%`)
                          .join(', ')})`
                      : `radial-gradient(${preset.shape ?? 'circle'} at ${preset.positionRadial ?? 'center'}, ${preset.stops
                          .map((s) => `${s.color} ${s.position}%`)
                          .join(', ')})`,
                }}
              />
              <span className="text-[10px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-clay-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">CSS 代码</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-clay-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-clay-inset transition-all ease-spring duration-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制
              </>
            )}
          </button>
        </div>
        <code className="text-sm font-mono text-on-surface break-all leading-relaxed">
          {fullCSS}
        </code>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-clay-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-clay-inset transition-all ease-spring duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>
    </div>
  );
}
