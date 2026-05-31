import { useState } from 'react';
import { Palette } from 'lucide-react';
import ToolHeader from '@/components/shared/ToolHeader';
import ClaySlider from '@/components/shared/ClaySlider';
import ClayToggle from '@/components/shared/ClayToggle';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { cn } from '@/lib/utils';
import { generateCssGradient, type GradientStop } from './utils';

interface ColorStop {
  color: string;
  position: number;
}

export default function CssGradientTool() {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#74c69d', position: 0 },
    { color: '#a2d2ff', position: 100 },
  ]);
  const [repeating, setRepeating] = useState(false);
  const [cssOutput, setCssOutput] = useState('');

  const handleAddStop = () => {
    const lastPos = stops[stops.length - 1]?.position ?? 0;
    setStops((prev) => [...prev, { color: '#ff6a88', position: Math.min(lastPos + 20, 100) }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, field: keyof ColorStop, value: string | number) => {
    setStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop))
    );
  };

  const handleGenerate = () => {
    setCssOutput(generateCssGradient(type, angle, stops as GradientStop[], repeating));
  };

  const gradientFn = repeating
    ? (type === 'linear' ? 'repeating-linear-gradient' : 'repeating-radial-gradient')
    : (type === 'linear' ? 'linear-gradient' : 'radial-gradient');

  const gradientPreview = `background: ${gradientFn}(${type === 'linear' ? `${angle}deg` : 'circle'}, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')});`;

  return (
    <div className="pt-20 pb-12 px-container-padding min-h-screen flex flex-col gap-gutter">
      <ToolHeader
        icon={<Palette className="w-10 h-10" />}
        title="CSS 渐变生成器"
        description="可视化生成 CSS 线性/径向渐变代码"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <aside className="lg:col-span-1 space-y-gutter">
          <div className="p-container-padding bg-surface rounded-[2rem] shadow-clay border border-white/30">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">渐变类型</label>
                <div className="flex p-1 bg-surface-container dark:bg-inverse-surface rounded-2xl shadow-clay-inset">
                  <button
                    onClick={() => setType('linear')}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-bold clay-spring',
                      type === 'linear'
                        ? 'bg-surface-container-lowest dark:bg-surface text-primary shadow-clay'
                        : 'text-on-surface-variant'
                    )}
                  >
                    线性渐变
                  </button>
                  <button
                    onClick={() => setType('radial')}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-bold clay-spring',
                      type === 'radial'
                        ? 'bg-surface-container-lowest dark:bg-surface text-primary shadow-clay'
                        : 'text-on-surface-variant'
                    )}
                  >
                    径向渐变
                  </button>
                </div>
              </div>

              {type === 'linear' && (
                <ClaySlider label="角度" value={angle} min={0} max={360} unit="°" onChange={setAngle} />
              )}

              <ClayToggle
                label="重复渐变"
                description="使用 repeating-gradient"
                checked={repeating}
                onChange={setRepeating}
              />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="font-label text-xs font-semibold text-on-surface-variant">颜色节点</label>
                  <button
                    onClick={handleAddStop}
                    className="px-3 py-1 rounded-full text-xs bg-primary text-on-primary font-bold shadow-clay hover:shadow-clay-hover clay-button"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => handleStopChange(index, 'color', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => handleStopChange(index, 'position', Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-mono text-outline w-10 text-right">{stop.position}%</span>
                      <button
                        onClick={() => handleRemoveStop(index)}
                        className="text-outline hover:text-error transition-colors text-sm"
                        disabled={stops.length <= 2}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <CodeEditor value={cssOutput} language="css" readOnly placeholder="点击生成按钮..." />
                  </div>
                  <CopyButton text={cssOutput} />
                </div>
                <button
                  onClick={handleGenerate}
                  className="w-full px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-clay hover:shadow-clay-hover clay-button"
                >
                  生成代码
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div
            className="w-full h-full min-h-[500px] rounded-[2rem] shadow-clay"
            style={{ background: gradientPreview.replace('background: ', '').replace(';', '') }}
          />
        </div>
      </div>
    </div>
  );
}
