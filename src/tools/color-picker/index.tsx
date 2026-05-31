import { useState, useEffect, useCallback } from 'react';
import { Palette } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hslToHex } from './utils';

type UpdateSource = 'hex' | 'rgb' | 'hsl' | 'color-picker';

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#74c69d');
  const [rgb, setRgb] = useState({ r: 116, g: 198, b: 157 });
  const [hsl, setHsl] = useState({ h: 152, s: 42, l: 62 });
  const [updateSource, setUpdateSource] = useState<UpdateSource>('hex');

  const syncFromHex = useCallback((hexVal: string) => {
    const rgbVal = hexToRgb(hexVal);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    }
  }, []);

  const syncFromRgb = useCallback((rgbVal: { r: number; g: number; b: number }) => {
    const clamped = {
      r: Math.max(0, Math.min(255, rgbVal.r)),
      g: Math.max(0, Math.min(255, rgbVal.g)),
      b: Math.max(0, Math.min(255, rgbVal.b)),
    };
    setHex(rgbToHex(clamped.r, clamped.g, clamped.b));
    setHsl(rgbToHsl(clamped.r, clamped.g, clamped.b));
  }, []);

  const syncFromHsl = useCallback((hslVal: { h: number; s: number; l: number }) => {
    const clamped = {
      h: Math.max(0, Math.min(360, hslVal.h)),
      s: Math.max(0, Math.min(100, hslVal.s)),
      l: Math.max(0, Math.min(100, hslVal.l)),
    };
    const rgbVal = hslToRgb(clamped.h, clamped.s, clamped.l);
    setRgb(rgbVal);
    setHex(hslToHex(clamped.h, clamped.s, clamped.l));
  }, []);

  useEffect(() => {
    if (updateSource === 'hex' || updateSource === 'color-picker') {
      syncFromHex(hex);
    }
  }, [hex, updateSource, syncFromHex]);

  useEffect(() => {
    if (updateSource === 'rgb') {
      syncFromRgb(rgb);
    }
  }, [rgb, updateSource, syncFromRgb]);

  useEffect(() => {
    if (updateSource === 'hsl') {
      syncFromHsl(hsl);
    }
  }, [hsl, updateSource, syncFromHsl]);

  const complementaryColor = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
  const analogousColors = [
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
  ];

  return (
    <BasicToolLayout
      title="颜色选择器"
      description="HEX / RGB / HSL 颜色格式转换与调色"
      icon={<Palette className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="w-full aspect-square rounded-3xl shadow-clay"
          style={{ backgroundColor: hex }}
        />
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">HEX</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => { setHex(e.target.value); setUpdateSource('color-picker'); }}
                className="w-10 h-10 rounded-xl border-0 cursor-pointer shrink-0"
              />
              <ClayFieldInput
                value={hex}
                onChange={(e) => { setHex(e.target.value); setUpdateSource('hex'); }}
                placeholder="#000000"
                className="font-mono"
              />
              <CopyButton text={hex} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">RGB</label>
            <div className="flex items-center gap-2">
              {(['r', 'g', 'b'] as const).map((channel) => (
                <ClayFieldInput
                  key={channel}
                  label={channel.toUpperCase()}
                  type="number"
                  size="sm"
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(e) => {
                    setRgb((prev) => {
                      const next = { ...prev, [channel]: Number(e.target.value) };
                      setUpdateSource('rgb');
                      return next;
                    });
                  }}
                />
              ))}
              <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} className="mt-4" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">HSL</label>
            <div className="flex items-center gap-2">
              {(['h', 's', 'l'] as const).map((channel) => (
                <ClayFieldInput
                  key={channel}
                  label={channel.toUpperCase()}
                  type="number"
                  size="sm"
                  min={0}
                  max={channel === 'h' ? 360 : 100}
                  value={hsl[channel]}
                  onChange={(e) => {
                    setHsl((prev) => {
                      const next = { ...prev, [channel]: Number(e.target.value) };
                      setUpdateSource('hsl');
                      return next;
                    });
                  }}
                  suffix={channel === 'h' ? '°' : '%'}
                />
              ))}
              <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} className="mt-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <span className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main mb-3 block uppercase">互补色</span>
        <div className="flex gap-2">
          <div
            className="flex-1 h-10 rounded-xl shadow-clay-inset"
            style={{ backgroundColor: hex }}
          />
          <div
            className="flex-1 h-10 rounded-xl shadow-clay-inset"
            style={{ backgroundColor: complementaryColor }}
          />
        </div>
      </div>

      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <span className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main mb-3 block uppercase">类似色</span>
        <div className="flex gap-2">
          {analogousColors.map((color, i) => (
            <div
              key={i}
              className="flex-1 h-10 rounded-xl shadow-clay-inset"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </BasicToolLayout>
  );
}
