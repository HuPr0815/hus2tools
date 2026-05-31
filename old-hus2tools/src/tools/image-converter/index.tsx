import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  Download,
  Trash2,
  ImageIcon,
  Settings2,
  ZoomIn,
  Archive,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TargetFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico';
type ResizeMode = 'none' | 'custom' | 'percentage';

const FORMAT_OPTIONS: { value: TargetFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'bmp', label: 'BMP' },
  { value: 'ico', label: 'ICO' },
];

const ICO_SIZES = [16, 32, 48, 256];

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/svg+xml',
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getExt(format: TargetFormat): string {
  if (format === 'jpeg') return 'jpg';
  return format;
}

function getMimeType(format: TargetFormat): string {
  const map: Record<TargetFormat, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  };
  return map[format];
}

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedWidth: number;
  convertedHeight: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

async function convertImage(
  img: HTMLImageElement,
  format: TargetFormat,
  quality: number,
  targetWidth: number,
  targetHeight: number,
  icoSize: number
): Promise<Blob> {
  let w = targetWidth || img.naturalWidth;
  let h = targetHeight || img.naturalHeight;

  if (format === 'ico') {
    w = icoSize;
    h = icoSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg' || format === 'bmp') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(img, 0, 0, w, h);

  const mimeType = getMimeType(format);
  const q = format === 'jpeg' || format === 'webp' ? quality / 100 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('转换失败'));
      },
      mimeType,
      q
    );
  });
}

export default function ImageConverter() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('webp');
  const [quality, setQuality] = useState(80);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('none');
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const [icoSize, setIcoSize] = useState(32);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) =>
      ACCEPTED_TYPES.some((t) => f.type.startsWith(t.split('/')[0]))
    );
    if (fileArr.length === 0) {
      showToast('没有找到支持的图片文件');
      return;
    }

    const newItems: ImageItem[] = [];
    for (const file of fileArr) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const img = await loadImage(dataUrl);
        newItems.push({
          id: generateId(),
          file,
          originalUrl: dataUrl,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          convertedBlob: null,
          convertedUrl: null,
          convertedWidth: 0,
          convertedHeight: 0,
          status: 'pending',
        });
      } catch {
        newItems.push({
          id: generateId(),
          file,
          originalUrl: '',
          originalWidth: 0,
          originalHeight: 0,
          convertedBlob: null,
          convertedUrl: null,
          convertedWidth: 0,
          convertedHeight: 0,
          status: 'error',
          error: '加载失败',
        });
      }
    }
    setImages((prev) => [...prev, ...newItems]);
  }, [showToast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      isDragging.current = false;
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = false;
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      return prev.filter((i) => i.id !== id);
    });
    if (previewId === id) setPreviewId(null);
  }, [previewId]);

  const clearAll = useCallback(() => {
    images.forEach((item) => {
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setImages([]);
    setPreviewId(null);
  }, [images]);

  const computeTargetSize = useCallback(
    (origW: number, origH: number): [number, number] => {
      if (resizeMode === 'none') return [origW, origH];
      if (resizeMode === 'percentage') {
        const scale = percentage / 100;
        return [Math.round(origW * scale), Math.round(origH * scale)];
      }
      if (resizeMode === 'custom') {
        let w = customWidth || origW;
        let h = customHeight || origH;
        if (maintainAspectRatio && customWidth > 0 && customHeight === 0) {
          h = Math.round(origH * (w / origW));
        } else if (maintainAspectRatio && customHeight > 0 && customWidth === 0) {
          w = Math.round(origW * (h / origH));
        } else if (maintainAspectRatio && customWidth > 0 && customHeight > 0) {
          const scaleW = w / origW;
          const scaleH = h / origH;
          const scale = Math.min(scaleW, scaleH);
          w = Math.round(origW * scale);
          h = Math.round(origH * scale);
        }
        return [w || origW, h || origH];
      }
      return [origW, origH];
    },
    [resizeMode, percentage, customWidth, customHeight, maintainAspectRatio]
  );

  const handleConvert = useCallback(async () => {
    const pending = images.filter((i) => i.status === 'pending' || i.status === 'error');
    if (pending.length === 0) {
      showToast('没有需要转换的图片');
      return;
    }

    setConverting(true);
    setProgress({ current: 0, total: pending.length });

    for (let idx = 0; idx < pending.length; idx++) {
      const item = pending[idx];
      setProgress({ current: idx + 1, total: pending.length });

      setImages((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' as const } : i))
      );

      try {
        const img = await loadImage(item.originalUrl);
        const [tw, th] = computeTargetSize(img.naturalWidth, img.naturalHeight);
        const blob = await convertImage(img, targetFormat, quality, tw, th, icoSize);
        const url = URL.createObjectURL(blob);

        setImages((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  convertedBlob: blob,
                  convertedUrl: url,
                  convertedWidth: tw,
                  convertedHeight: th,
                  status: 'done' as const,
                }
              : i
          )
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error' as const, error: String(err) }
              : i
          )
        );
      }
    }

    setConverting(false);
    showToast('转换完成！');
  }, [images, targetFormat, quality, icoSize, computeTargetSize, showToast]);

  const handleDownloadSingle = useCallback(
    (item: ImageItem) => {
      if (!item.convertedBlob || !item.convertedUrl) return;
      const baseName = item.file.name.replace(/\.[^.]+$/, '');
      const link = document.createElement('a');
      link.href = item.convertedUrl;
      link.download = `${baseName}.${getExt(targetFormat)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [targetFormat]
  );

  const handleDownloadAll = useCallback(async () => {
    const done = images.filter((i) => i.status === 'done' && i.convertedBlob);
    if (done.length === 0) {
      showToast('没有已转换的图片');
      return;
    }

    if (done.length === 1) {
      handleDownloadSingle(done[0]);
      return;
    }

    const zip = new JSZip();
    for (const item of done) {
      const baseName = item.file.name.replace(/\.[^.]+$/, '');
      const ext = getExt(targetFormat);
      zip.file(`${baseName}.${ext}`, item.convertedBlob!);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`已打包 ${done.length} 张图片`);
  }, [images, targetFormat, handleDownloadSingle, showToast]);

  const handleWidthChange = useCallback(
    (w: number) => {
      setCustomWidth(w);
      if (maintainAspectRatio && images.length > 0) {
        const item = images[0];
        if (item.originalWidth > 0 && w > 0) {
          setCustomHeight(Math.round(item.originalHeight * (w / item.originalWidth)));
        }
      }
    },
    [maintainAspectRatio, images]
  );

  const handleHeightChange = useCallback(
    (h: number) => {
      setCustomHeight(h);
      if (maintainAspectRatio && images.length > 0) {
        const item = images[0];
        if (item.originalHeight > 0 && h > 0) {
          setCustomWidth(Math.round(item.originalWidth * (h / item.originalHeight)));
        }
      }
    },
    [maintainAspectRatio, images]
  );

  const doneCount = images.filter((i) => i.status === 'done').length;
  const pendingCount = images.filter((i) => i.status === 'pending' || i.status === 'error').length;
  const previewItem = images.find((i) => i.id === previewId);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">图片格式转换</h2>
          <p className="text-sm text-text-secondary">
            批量转换图片格式，支持 PNG / JPEG / WebP / BMP / ICO
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl bg-bg-secondary hover:bg-bg-tertiary hover:border-primary transition-colors cursor-pointer"
        >
          <Upload className="w-16 h-16 text-text-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">拖拽图片到此处，或点击上传</p>
            <p className="text-xs text-text-muted mt-1">
              支持 PNG / JPG / WebP / BMP / GIF / AVIF / TIFF / SVG，可多选
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors">
            <Upload className="w-4 h-4" />
            选择图片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
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
              <Upload className="w-3.5 h-3.5" />
              添加图片
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空全部
            </button>
            <div className="flex-1" />
            <span className="text-xs text-text-muted">
              共 {images.length} 张 · 已转换 {doneCount} 张
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>

          <div className="flex gap-4 min-h-0 flex-1">
            <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-auto">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg bg-bg-secondary hover:bg-bg-tertiary hover:border-primary transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">拖拽或点击添加更多图片</span>
              </div>

              <div className="flex flex-col gap-2">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
                      previewId === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-bg-secondary hover:border-primary/50'
                    )}
                  >
                    <div
                      className="w-12 h-12 rounded-md overflow-hidden bg-bg-tertiary shrink-0 cursor-pointer"
                      onClick={() => setPreviewId(previewId === item.id ? null : item.id)}
                    >
                      <img
                        src={item.convertedUrl || item.originalUrl}
                        alt={item.file.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">
                        {item.file.name}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {item.originalWidth} × {item.originalHeight}
                        {item.status === 'done' && item.convertedWidth !== item.originalWidth && (
                          <span>
                            {' '}
                            <ArrowRight className="w-2.5 h-2.5 inline" /> {item.convertedWidth} ×{' '}
                            {item.convertedHeight}
                          </span>
                        )}
                      </div>
                      {item.status === 'done' && item.convertedBlob && (
                        <div className="text-[10px] text-text-muted">
                          {formatBytes(item.file.size)}{' '}
                          <ArrowRight className="w-2.5 h-2.5 inline" />{' '}
                          {formatBytes(item.convertedBlob.size)}
                          {item.convertedBlob.size < item.file.size && (
                            <span className="text-success ml-1">
                              节省{' '}
                              {(
                                (1 - item.convertedBlob.size / item.file.size) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          )}
                          {item.convertedBlob.size > item.file.size && (
                            <span className="text-error ml-1">
                              +{((item.convertedBlob.size / item.file.size - 1) * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                      {item.status === 'converting' && (
                        <div className="text-[10px] text-primary">转换中...</div>
                      )}
                      {item.status === 'error' && (
                        <div className="text-[10px] text-error">{item.error || '转换失败'}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === 'done' && (
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                          title="下载"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {item.status === 'done' && (
                        <span className="p-1 text-success">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(item.id)}
                        className="p-1.5 rounded-md hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                        title="移除"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-72 shrink-0 flex flex-col gap-3 overflow-auto">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-text-secondary bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" />
                  转换设置
                </span>
                {showSettings ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showSettings && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">目标格式</label>
                    <div className="flex flex-wrap gap-1.5">
                      {FORMAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTargetFormat(opt.value)}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-md transition-colors',
                            targetFormat === opt.value
                              ? 'bg-primary text-white'
                              : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {targetFormat === 'ico' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-text-muted">ICO 尺寸</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ICO_SIZES.map((s) => (
                          <button
                            key={s}
                            onClick={() => setIcoSize(s)}
                            className={cn(
                              'px-2.5 py-1 text-xs rounded-md transition-colors',
                              icoSize === s
                                ? 'bg-primary text-white'
                                : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary'
                            )}
                          >
                            {s}×{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-text-muted">质量</label>
                        <span className="text-xs font-mono text-text-secondary">{quality}%</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">尺寸调整</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { key: 'none', label: '原始尺寸' },
                          { key: 'custom', label: '自定义' },
                          { key: 'percentage', label: '百分比' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setResizeMode(opt.key)}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-md transition-colors',
                            resizeMode === opt.key
                              ? 'bg-primary text-white'
                              : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {resizeMode === 'custom' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                          <input
                            type="checkbox"
                            checked={maintainAspectRatio}
                            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            className="accent-primary"
                          />
                          保持宽高比
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-text-muted">宽度</label>
                          <input
                            type="number"
                            value={customWidth || ''}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                            placeholder="自动"
                            className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-text-muted">高度</label>
                          <input
                            type="number"
                            value={customHeight || ''}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                            placeholder="自动"
                            className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {resizeMode === 'percentage' && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-text-muted">缩放比例</label>
                        <span className="text-xs font-mono text-text-secondary">{percentage}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={500}
                        step={5}
                        value={percentage}
                        onChange={(e) => setPercentage(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleConvert}
                  disabled={converting || pendingCount === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40"
                >
                  {converting ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      转换中 ({progress.current}/{progress.total})
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-4 h-4" />
                      开始转换{pendingCount > 0 ? ` (${pendingCount}张)` : ''}
                    </>
                  )}
                </button>

                {doneCount > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    {doneCount === 1 ? '下载转换结果' : `打包下载 (${doneCount}张)`}
                  </button>
                )}
              </div>

              {previewItem && previewItem.status === 'done' && previewItem.convertedUrl && (
                <div className="flex flex-col gap-2 mt-2 border-t border-border pt-3">
                  <div className="text-xs font-medium text-text-secondary">转换前后对比</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted">原图</span>
                      <div className="aspect-square rounded-md overflow-hidden bg-bg-tertiary border border-border">
                        <img
                          src={previewItem.originalUrl}
                          alt="原图"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-text-muted text-center">
                        {previewItem.originalWidth}×{previewItem.originalHeight}
                        <br />
                        {formatBytes(previewItem.file.size)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted">
                        {targetFormat.toUpperCase()}
                      </span>
                      <div className="aspect-square rounded-md overflow-hidden bg-bg-tertiary border border-border">
                        <img
                          src={previewItem.convertedUrl!}
                          alt="转换后"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-text-muted text-center">
                        {previewItem.convertedWidth}×{previewItem.convertedHeight}
                        <br />
                        {previewItem.convertedBlob && formatBytes(previewItem.convertedBlob.size)}
                        {previewItem.convertedBlob &&
                          previewItem.convertedBlob.size < previewItem.file.size && (
                            <span className="text-success">
                              {' '}
                              -{((1 - previewItem.convertedBlob.size / previewItem.file.size) * 100).toFixed(1)}%
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {converting && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-text-primary">
                正在转换 {progress.current} / {progress.total}
              </span>
              <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
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
