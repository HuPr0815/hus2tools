import { useState } from 'react';
import { Droplets } from 'lucide-react';
import ToolHeader from '@/components/shared/ToolHeader';
import Dropzone from '@/components/shared/Dropzone';
import ClaySlider from '@/components/shared/ClaySlider';
import ClayToggle from '@/components/shared/ClayToggle';
import { cn } from '@/lib/utils';
import { applyWatermark } from './utils';
import type { WatermarkOptions } from './utils';

const POSITIONS: WatermarkOptions['position'][] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('Watermark');
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState<WatermarkOptions['position']>('center');
  const [tile, setTile] = useState(false);
  const [resultUrl, setResultUrl] = useState('');

  const handleFilesDrop = (files: FileList) => {
    const dropped = files[0];
    if (dropped?.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setResultUrl('');
    }
  };

  const handleAddWatermark = async () => {
    if (!file) return;
    const img = new Image();
    img.src = preview;
    await new Promise(resolve => { img.onload = resolve; });
    const pos = tile ? 'tile' : position;
    const dataUrl = applyWatermark(img, { text, fontSize, opacity: opacity / 100, color: `rgba(0,0,0,${opacity / 100})`, position: pos, rotation: -30 });
    setResultUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'watermarked-image.png';
    a.click();
  };

  return (
    <div className="pt-20 pb-12 px-container-padding min-h-screen flex flex-col gap-gutter">
      <ToolHeader
        icon={<Droplets className="w-10 h-10" />}
        title="图片水印"
        description="为图片添加文字或图片水印，支持平铺和9宫格定位"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <aside className="lg:col-span-1 space-y-gutter">
          <div className="p-container-padding bg-surface rounded-[2rem] shadow-clay border border-white/30">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">水印文字</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-surface-container-low dark:bg-inverse-surface shadow-clay-inset text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <ClaySlider label="字体大小" value={fontSize} min={8} max={120} unit="px" onChange={setFontSize} />

              <ClaySlider label="透明度" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />

              <ClayToggle
                label="平铺模式"
                description="水印将平铺覆盖整张图片"
                checked={tile}
                onChange={setTile}
              />

              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">位置</label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={cn(
                        'px-2 py-1.5 rounded-xl text-xs clay-spring',
                        position === pos
                          ? 'bg-surface-container-lowest dark:bg-surface text-primary shadow-clay font-bold'
                          : 'bg-surface-container dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
                      )}
                    >
                      {pos.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddWatermark}
                  disabled={!file}
                  className="flex-1 px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-clay hover:shadow-clay-hover clay-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加水印
                </button>
                {resultUrl && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-full bg-surface text-on-surface-variant font-bold shadow-clay-inset border border-outline-variant/30 clay-button"
                  >
                    下载
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          {preview ? (
            <div className="h-full min-h-[500px] bg-surface-container-lowest dark:bg-black/5 rounded-[2.5rem] shadow-clay overflow-hidden flex items-center justify-center p-container-padding">
              <div className="relative">
                <img src={preview} alt="preview" className="max-h-[460px] max-w-full object-contain rounded-xl" />
                {resultUrl && (
                  <img src={resultUrl} alt="watermarked" className="absolute inset-0 max-h-[460px] max-w-full object-contain rounded-xl" />
                )}
              </div>
            </div>
          ) : (
            <Dropzone onFilesDrop={handleFilesDrop} accept="image/*" />
          )}
        </div>
      </div>
    </div>
  );
}
