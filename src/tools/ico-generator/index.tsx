import { useState } from 'react';
import { AppWindow } from 'lucide-react';
import ToolHeader from '@/components/shared/ToolHeader';
import Dropzone from '@/components/shared/Dropzone';
import ClayToggle from '@/components/shared/ClayToggle';
import { resizeImage, generateIcoPreview } from './utils';

const ICO_SIZES = [16, 32, 48, 64, 128, 256];

export default function IcoGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);
  const [include256, setInclude256] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [previews, setPreviews] = useState<{ size: number; dataUrl: string }[]>([]);

  const handleFilesDrop = (files: FileList) => {
    const dropped = files[0];
    if (dropped?.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setResultUrl('');
    }
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleGenerate = async () => {
    const sizes = include256 && !selectedSizes.includes(256)
      ? [...selectedSizes, 256]
      : selectedSizes;
    if (!file || sizes.length === 0) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => { img.onload = resolve; });
    const icoPreviews = generateIcoPreview(img, sizes);
    setPreviews(icoPreviews);
    setResultUrl(resizeImage(img, sizes[0]));
    URL.revokeObjectURL(img.src);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'favicon.ico';
    a.click();
  };

  return (
    <div className="pt-20 pb-12 px-container-padding min-h-screen flex flex-col gap-gutter">
      <ToolHeader
        icon={<AppWindow className="w-10 h-10" />}
        title="ICO 图标生成"
        description="上传图片生成多尺寸 ICO/PNG 图标文件"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <aside className="lg:col-span-1 space-y-gutter">
          <div className="p-container-padding bg-surface rounded-[2rem] shadow-clay border border-white/30">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">图标尺寸</label>
                <div className="flex flex-col gap-2">
                  {ICO_SIZES.filter((s) => s !== 256).map((size) => (
                    <label key={size} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-on-surface">{size}×{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <ClayToggle
                label="包含 256×256"
                description="添加超大尺寸图标"
                checked={include256}
                onChange={setInclude256}
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!file || selectedSizes.length === 0}
                  className="flex-1 px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-clay hover:shadow-clay-hover clay-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  生成 ICO
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
            <div className="h-full min-h-[500px] bg-surface-container-lowest dark:bg-black/5 rounded-[2.5rem] shadow-clay overflow-hidden flex flex-col items-center justify-center p-container-padding gap-6">
              <img src={preview} alt="preview" className="max-h-[300px] max-w-full object-contain rounded-xl" />
              {previews.length > 0 && (
                <div className="flex items-end gap-4">
                  {previews.map((p) => (
                    <div key={p.size} className="flex flex-col items-center gap-1">
                      <img src={p.dataUrl} alt={`${p.size}x${p.size}`} width={Math.min(p.size, 64)} height={Math.min(p.size, 64)} className="rounded" />
                      <span className="text-xs text-outline">{p.size}px</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Dropzone onFilesDrop={handleFilesDrop} accept="image/*" />
          )}
        </div>
      </div>
    </div>
  );
}
