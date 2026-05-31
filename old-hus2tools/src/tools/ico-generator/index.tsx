import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Check, FileOutput } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICO_SIZES = [16, 32, 48, 64, 128, 256] as const;
type IcoSize = (typeof ICO_SIZES)[number];

interface SizePreview {
  size: IcoSize;
  dataUrl: string;
  blob: Blob;
}

function resizeToPng(img: HTMLImageElement, size: number): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas not supported')); return; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Blob creation failed')); return; }
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ blob, dataUrl });
      },
      'image/png'
    );
  });
}

async function buildIcoFile(previews: SizePreview[]): Promise<Blob> {
  const sorted = [...previews].sort((a, b) => a.size - b.size);
  const pngBuffers: ArrayBuffer[] = [];
  const entries: { width: number; height: number; size: number; offset: number }[] = [];

  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + sorted.length * entrySize;

  let currentOffset = dataOffset;

  for (const p of sorted) {
    const buf = await p.blob.arrayBuffer();
    pngBuffers.push(buf);
    entries.push({
      width: p.size >= 256 ? 0 : p.size,
      height: p.size >= 256 ? 0 : p.size,
      size: buf.byteLength,
      offset: currentOffset,
    });
    currentOffset += buf.byteLength;
  }

  const totalSize = currentOffset;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sorted.length, true);

  for (let i = 0; i < sorted.length; i++) {
    const e = entries[i];
    const base = headerSize + i * entrySize;
    view.setUint8(base + 0, e.width);
    view.setUint8(base + 1, e.height);
    view.setUint8(base + 2, 0);
    view.setUint8(base + 3, 0);
    view.setUint16(base + 4, 1, true);
    view.setUint16(base + 6, 32, true);
    view.setUint32(base + 8, e.size, true);
    view.setUint32(base + 12, e.offset, true);
  }

  const result = new Uint8Array(buffer);
  let writeOffset = dataOffset;
  for (const buf of pngBuffers) {
    result.set(new Uint8Array(buf), writeOffset);
    writeOffset += buf.byteLength;
  }

  return new Blob([result], { type: 'image/x-icon' });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function IcoGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('favicon');
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Set<IcoSize>>(new Set([16, 32, 48]));
  const [previews, setPreviews] = useState<SizePreview[]>([]);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('请上传图片文件！');
        return;
      }
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      setImageSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        generatePreviews(img, selectedSizes);
      };
      img.src = dataUrl;
    },
    [selectedSizes, showToast]
  );

  const generatePreviews = useCallback(
    (img: HTMLImageElement, sizes: Set<IcoSize>) => {
      const tasks = ICO_SIZES.filter((s) => sizes.has(s)).map(async (size) => {
        const { blob, dataUrl } = await resizeToPng(img, size);
        return { size, dataUrl, blob };
      });
      Promise.all(tasks).then(setPreviews);
    },
    []
  );

  const toggleSize = useCallback(
    (size: IcoSize) => {
      setSelectedSizes((prev) => {
        const next = new Set(prev);
        if (next.has(size)) {
          if (next.size <= 1) return prev;
          next.delete(size);
        } else {
          next.add(size);
        }
        if (imageEl) generatePreviews(imageEl, next);
        return next;
      });
    },
    [imageEl, generatePreviews]
  );

  const handleSelectAll = useCallback(() => {
    const all = new Set(ICO_SIZES);
    setSelectedSizes(all);
    if (imageEl) generatePreviews(imageEl, all);
  }, [imageEl, generatePreviews]);

  const handleSelectNone = useCallback(() => {
    const min = new Set<IcoSize>([16]);
    setSelectedSizes(min);
    if (imageEl) generatePreviews(imageEl, min);
  }, [imageEl, generatePreviews]);

  const handleDownloadIco = useCallback(async () => {
    if (previews.length === 0) { showToast('请先上传图片并选择尺寸！'); return; }
    setGenerating(true);
    try {
      const blob = await buildIcoFile(previews);
      downloadBlob(blob, `${fileName}.ico`);
      showToast('ICO 文件已下载！');
    } catch {
      showToast('ICO 生成失败');
    } finally {
      setGenerating(false);
    }
  }, [previews, fileName, showToast]);

  const handleDownloadPng = useCallback(
    (preview: SizePreview) => {
      downloadBlob(preview.blob, `${fileName}_${preview.size}x${preview.size}.png`);
      showToast(`PNG ${preview.size}×${preview.size} 已下载！`);
    },
    [fileName, showToast]
  );

  const handleDownloadAllPng = useCallback(() => {
    previews.forEach((p, i) => {
      setTimeout(() => downloadBlob(p.blob, `${fileName}_${p.size}x${p.size}.png`), i * 200);
    });
    showToast('所有 PNG 文件已开始下载！');
  }, [previews, fileName, showToast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">ICO 图标生成器</h2>
          <p className="text-sm text-text-secondary">上传图片，生成多尺寸 ICO / PNG 图标文件</p>
        </div>
      </div>

      {!imageSrc ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl bg-bg-secondary hover:bg-bg-tertiary hover:border-primary transition-colors cursor-pointer"
        >
          <ImageIcon className="w-16 h-16 text-text-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">拖拽图片到此处，或点击上传</p>
            <p className="text-xs text-text-muted mt-1">支持 PNG / JPG / WebP / SVG / BMP 等格式</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors">
            <Upload className="w-4 h-4" />选择图片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />换图
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
            <div className="flex-1" />
            {imageEl && (
              <span className="text-xs text-text-muted">
                原始尺寸: {imageEl.naturalWidth} × {imageEl.naturalHeight}
              </span>
            )}
          </div>

          <div className="flex gap-4 min-h-0 flex-1">
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="bg-bg-secondary border border-border rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                <img
                  src={imageSrc}
                  alt="原始图片"
                  className="max-w-full max-h-[280px] object-contain rounded-md"
                />
              </div>

              <div className="text-xs font-medium text-text-secondary">尺寸预览</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {ICO_SIZES.map((size) => {
                  const preview = previews.find((p) => p.size === size);
                  const isSelected = selectedSizes.has(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-bg-secondary hover:border-primary/50'
                      )}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                      >
                        {preview ? (
                          <img src={preview.dataUrl} alt={`${size}×${size}`} width={Math.min(size, 64)} height={Math.min(size, 64)} className="image-rendering-pixelated" />
                        ) : (
                          <div
                            className="bg-bg-tertiary rounded-sm"
                            style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && <Check className="w-3 h-3 text-primary" />}
                        <span className={cn('text-xs', isSelected ? 'text-primary font-medium' : 'text-text-muted')}>
                          {size}×{size}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-72 shrink-0 flex flex-col gap-3 overflow-auto">
              <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">选择尺寸</div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  全选
                </button>
                <button
                  onClick={handleSelectNone}
                  className="px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  最小
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {ICO_SIZES.map((size) => (
                  <label
                    key={size}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors',
                      selectedSizes.has(size)
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-bg-secondary hover:border-primary/50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => toggleSize(size)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text-primary flex-1">{size} × {size}</span>
                    {selectedSizes.has(size) && previews.find((p) => p.size === size) && (
                      <span className="text-[10px] text-text-muted font-mono">
                        {(previews.find((p) => p.size === size)!.blob.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted">文件名</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleDownloadIco}
                  disabled={previews.length === 0 || generating}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  {generating ? '生成中...' : '下载 ICO 文件'}
                </button>
                <button
                  onClick={handleDownloadAllPng}
                  disabled={previews.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors disabled:opacity-40"
                >
                  <FileOutput className="w-3.5 h-3.5" />下载全部 PNG
                </button>
              </div>

              {previews.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-medium text-text-secondary">单独下载 PNG</div>
                  {previews.map((p) => (
                    <button
                      key={p.size}
                      onClick={() => handleDownloadPng(p)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {p.size} × {p.size}
                      <span className="text-text-muted ml-auto">{(p.blob.size / 1024).toFixed(1)} KB</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
