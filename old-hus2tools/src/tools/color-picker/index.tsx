import { useMemo, useCallback } from 'react';
import { Palette } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  generateShades,
} from './utils';

const DEFAULT_HEX = '#3b82f6';

export default function ColorPicker() {
  const [hexInput, setHexInput, clearHexInput] = usePersistInput('color-picker', DEFAULT_HEX);

  const currentHex = useMemo(() => {
    const h = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
    if (hexToRgb(h)) return h.toLowerCase();
    return DEFAULT_HEX;
  }, [hexInput]);

  const rgb = useMemo(() => hexToRgb(currentHex)!, [currentHex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const shades = useMemo(() => generateShades(currentHex), [currentHex]);

  const cssVar = `--color: ${currentHex};`;
  const cssRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
  const cssHsla = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`;

  const handleHexChange = useCallback((value: string) => {
    setHexInput(value.startsWith('#') ? value.toLowerCase() : '#' + value.toLowerCase());
  }, [setHexInput]);

  const handleNativePicker = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value.toLowerCase());
  }, [setHexInput]);

  const handleRgbChange = useCallback((r: number, g: number, b: number) => {
    setHexInput(rgbToHex(r, g, b).toLowerCase());
  }, [setHexInput]);

  const handleHslChange = useCallback((h: number, s: number, l: number) => {
    setHexInput(hslToHex(h, s, l).toLowerCase());
  }, [setHexInput]);

  const handleClear = useCallback(() => {
    clearHexInput();
  }, [clearHexInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Palette className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">颜色选择器</h2>
          <p className="text-sm text-on-surface-variant">HEX/RGB/HSL 互转与配色方案</p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-28 h-28 rounded-2xl border-4 border-outline-variant/30 shadow-lg"
            style={{ backgroundColor: currentHex }}
          />
          <input
            type="color"
            value={currentHex}
            onChange={handleNativePicker}
            className="w-12 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-on-surface-variant w-10">HEX</label>
            <input
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-container-low border-none text-on-surface font-mono shadow-clay-inset focus:ring-2 focus:ring-primary/20"
            />
            <CopyButton text={currentHex} />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-on-surface-variant w-10">RGB</label>
            <div className="flex-1 flex gap-1">
              {(['r', 'g', 'b'] as const).map((ch) => (
                <input
                  key={ch}
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={e => {
                    const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                    const next = { ...rgb, [ch]: val };
                    handleRgbChange(next.r, next.g, next.b);
                  }}
                  className="w-full px-2 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-center focus:outline-none focus:border-primary"
                />
              ))}
            </div>
            <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-on-surface-variant w-10">HSL</label>
            <div className="flex-1 flex gap-1">
              <input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={e => {
                  const val = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                  handleHslChange(val, hsl.s, hsl.l);
                }}
                className="w-full px-2 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-center focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={e => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  handleHslChange(hsl.h, val, hsl.l);
                }}
                className="w-full px-2 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-center focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={e => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  handleHslChange(hsl.h, hsl.s, val);
                }}
                className="w-full px-2 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-center focus:outline-none focus:border-primary"
              />
            </div>
            <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          重置
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">CSS 输出</div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: '变量', value: cssVar },
            { label: 'RGBA', value: cssRgba },
            { label: 'HSLA', value: cssHsla },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-xs font-medium text-on-surface-variant w-10">{item.label}</span>
              <span className="flex-1 text-sm font-mono text-on-surface">{item.value}</span>
              <CopyButton text={item.value} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">配色方案</div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="text-xs text-outline mb-1">浅色</div>
            <div className="flex gap-1">
              {shades.lighter.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setHexInput(color)}
                  className="flex-1 h-10 rounded-lg border border-outline-variant/30 transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-12 rounded-lg border-2 border-primary" style={{ backgroundColor: currentHex }} title={currentHex} />
          </div>
          <div>
            <div className="text-xs text-outline mb-1">深色</div>
            <div className="flex gap-1">
              {shades.darker.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setHexInput(color)}
                  className="flex-1 h-10 rounded-lg border border-outline-variant/30 transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
