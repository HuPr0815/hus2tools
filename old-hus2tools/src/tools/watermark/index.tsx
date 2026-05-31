import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Droplets,
  Upload,
  Download,
  ImageIcon,
  Type,
  Image as ImageIconLucide,
  Grid3X3,
  RotateCw,
  Trash2,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WatermarkType = 'text' | 'image';
type Position9 =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
type ExportFormat = 'png' | 'jpeg' | 'webp';

const FONT_OPTIONS = [
  { label: '默认', value: 'sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '楷体', value: 'KaiTi, serif' },
  { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
];

const POSITION_9: { key: Position9; label: string }[] = [
  { key: 'top-left', label: '左上' },
  { key: 'top-center', label: '上中' },
  { key: 'top-right', label: '右上' },
  { key: 'center-left', label: '左中' },
  { key: 'center', label: '居中' },
  { key: 'center-right', label: '右中' },
  { key: 'bottom-left', label: '左下' },
  { key: 'bottom-center', label: '下中' },
  { key: 'bottom-right', label: '右下' },
];

function getPositionCoords(
  pos: Position9,
  imgW: number,
  imgH: number,
  wmW: number,
  wmH: number,
  offsetX: number,
  offsetY: number,
  padding: number
) {
  let x = 0;
  let y = 0;
  switch (pos) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-center':
      x = (imgW - wmW) / 2;
      y = padding;
      break;
    case 'top-right':
      x = imgW - wmW - padding;
      y = padding;
      break;
    case 'center-left':
      x = padding;
      y = (imgH - wmH) / 2;
      break;
    case 'center':
      x = (imgW - wmW) / 2;
      y = (imgH - wmH) / 2;
      break;
    case 'center-right':
      x = imgW - wmW - padding;
      y = (imgH - wmH) / 2;
      break;
    case 'bottom-left':
      x = padding;
      y = imgH - wmH - padding;
      break;
    case 'bottom-center':
      x = (imgW - wmW) / 2;
      y = imgH - wmH - padding;
      break;
    case 'bottom-right':
      x = imgW - wmW - padding;
      y = imgH - wmH - padding;
      break;
  }
  return { x: x + offsetX, y: y + offsetY };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Watermark() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  const [textContent, setTextContent] = useState('水印文字');
  const [textFontSize, setTextFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#000000');
  const [textOpacity, setTextOpacity] = useState(30);
  const [textRotation, setTextRotation] = useState(-30);
  const [textFont, setTextFont] = useState('sans-serif');

  const [wmImageSrc, setWmImageSrc] = useState<string | null>(null);
  const [wmImageEl, setWmImageEl] = useState<HTMLImageElement | null>(null);
  const [wmImageScale, setWmImageScale] = useState(30);
  const [wmImageOpacity, setWmImageOpacity] = useState(30);

  const [position, setPosition] = useState<Position9>('center');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [posPadding, setPosPadding] = useState(20);

  const [tileMode, setTileMode] = useState(false);
  const [tileRowGap, setTileRowGap] = useState(100);
  const [tileColGap, setTileColGap] = useState(200);
  const [tileRotation, setTileRotation] = useState(-30);

  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(92);

  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
        setNaturalW(img.naturalWidth);
        setNaturalH(img.naturalHeight);
      };
      img.src = dataUrl;
    },
    [showToast]
  );

  const handleWmFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('请上传图片文件！');
        return;
      }
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      setWmImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => {
        setWmImageEl(img);
      };
      img.src = dataUrl;
    },
    [showToast]
  );

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

  const renderWatermark = useCallback(
    (ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) => {
      ctx.save();
      if (watermarkType === 'text') {
        ctx.font = `${textFontSize}px ${textFont}`;
        ctx.fillStyle = hexToRgba(textColor, textOpacity / 100);
        ctx.textBaseline = 'top';

        const metrics = ctx.measureText(textContent || '水印文字');
        const wmW = metrics.width;
        const wmH = textFontSize * 1.2;

        if (tileMode) {
          const rad = (tileRotation * Math.PI) / 180;
          const stepX = wmW + tileColGap;
          const stepY = wmH + tileRowGap;
          const diagonal = Math.sqrt(canvasW * canvasW + canvasH * canvasH);
          ctx.translate(canvasW / 2, canvasH / 2);
          ctx.rotate(rad);
          for (let y = -diagonal; y < diagonal; y += stepY) {
            for (let x = -diagonal; x < diagonal; x += stepX) {
              ctx.fillText(textContent || '水印文字', x, y);
            }
          }
        } else {
          const { x, y } = getPositionCoords(
            position,
            canvasW,
            canvasH,
            wmW,
            wmH,
            offsetX,
            offsetY,
            posPadding
          );
          const rad = (textRotation * Math.PI) / 180;
          ctx.translate(x + wmW / 2, y + wmH / 2);
          ctx.rotate(rad);
          ctx.fillText(textContent || '水印文字', -wmW / 2, -wmH / 2);
        }
      } else if (watermarkType === 'image' && wmImageEl) {
        const scale = wmImageScale / 100;
        const wmW = wmImageEl.naturalWidth * scale;
        const wmH = wmImageEl.naturalHeight * scale;

        if (tileMode) {
          const rad = (tileRotation * Math.PI) / 180;
          const stepX = wmW + tileColGap;
          const stepY = wmH + tileRowGap;
          const diagonal = Math.sqrt(canvasW * canvasW + canvasH * canvasH);
          ctx.globalAlpha = wmImageOpacity / 100;
          ctx.translate(canvasW / 2, canvasH / 2);
          ctx.rotate(rad);
          for (let y = -diagonal; y < diagonal; y += stepY) {
            for (let x = -diagonal; x < diagonal; x += stepX) {
              ctx.drawImage(wmImageEl, x, y, wmW, wmH);
            }
          }
        } else {
          const { x, y } = getPositionCoords(
            position,
            canvasW,
            canvasH,
            wmW,
            wmH,
            offsetX,
            offsetY,
            posPadding
          );
          ctx.globalAlpha = wmImageOpacity / 100;
          ctx.drawImage(wmImageEl, x, y, wmW, wmH);
        }
      }
      ctx.restore();
    },
    [
      watermarkType,
      textContent,
      textFontSize,
      textColor,
      textOpacity,
      textRotation,
      textFont,
      wmImageEl,
      wmImageScale,
      wmImageOpacity,
      position,
      offsetX,
      offsetY,
      posPadding,
      tileMode,
      tileRowGap,
      tileColGap,
      tileRotation,
    ]
  );

  useEffect(() => {
    if (!imageEl || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const maxW = 600;
    const scale = Math.min(maxW / naturalW, 1);
    const canvasW = Math.round(naturalW * scale);
    const canvasH = Math.round(naturalH * scale);
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(imageEl, 0, 0, canvasW, canvasH);
    ctx.save();
    ctx.scale(scale, scale);
    renderWatermark(ctx, naturalW, naturalH);
    ctx.restore();
  }, [imageEl, naturalW, naturalH, renderWatermark]);

  const handleDownload = useCallback(() => {
    if (!imageEl) {
      showToast('请先上传图片！');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageEl, 0, 0, naturalW, naturalH);
    renderWatermark(ctx, naturalW, naturalH);

    const mimeMap: Record<ExportFormat, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    const quality = exportFormat === 'png' ? undefined : exportQuality / 100;
    const dataUrl = canvas.toDataURL(mimeMap[exportFormat], quality);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName || 'image'}_watermark.${exportFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('下载成功！');
  }, [imageEl, naturalW, naturalH, renderWatermark, exportFormat, exportQuality, fileName, showToast]);

  const handleReset = useCallback(() => {
    setImageSrc(null);
    setImageEl(null);
    setFileName('');
    setNaturalW(0);
    setNaturalH(0);
    setTextContent('水印文字');
    setTextFontSize(48);
    setTextColor('#000000');
    setTextOpacity(30);
    setTextRotation(-30);
    setTextFont('sans-serif');
    setWmImageSrc(null);
    setWmImageEl(null);
    setWmImageScale(30);
    setWmImageOpacity(30);
    setPosition('center');
    setOffsetX(0);
    setOffsetY(0);
    setPosPadding(20);
    setTileMode(false);
    setTileRowGap(100);
    setTileColGap(200);
    setTileRotation(-30);
    setExportFormat('png');
    setExportQuality(92);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Droplets className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">图片水印</h2>
          <p className="text-sm text-text-secondary">为图片添加文字或图片水印，支持平铺和9宫格定位</p>
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
            <p className="text-xs text-text-muted mt-1">支持 PNG / JPG / WebP / BMP 等常见图片格式</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors">
            <Upload className="w-4 h-4" />
            选择图片
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
              <Upload className="w-3.5 h-3.5" />
              换图
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
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              重置
            </button>
            <div className="flex-1" />
            <span className="text-xs text-text-muted">
              {naturalW} × {naturalH}
            </span>
          </div>

          <div className="flex gap-4 min-h-0 flex-1">
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="text-xs font-medium text-text-secondary">预览</div>
              <div className="flex-1 min-h-[300px] bg-bg-secondary border border-border rounded-xl overflow-auto flex items-center justify-center p-2">
                <canvas ref={previewCanvasRef} className="max-w-full max-h-[500px] rounded-md" />
              </div>
            </div>

            <div className="w-80 shrink-0 flex flex-col gap-3 overflow-auto">
              <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
                {[
                  { key: 'text' as WatermarkType, label: '文字水印', icon: <Type className="w-3.5 h-3.5" /> },
                  { key: 'image' as WatermarkType, label: '图片水印', icon: <ImageIconLucide className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setWatermarkType(t.key)}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      watermarkType === t.key
                        ? 'bg-bg-tertiary text-text-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {watermarkType === 'text' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">水印文字</label>
                    <input
                      type="text"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">字体大小</span>
                    <input
                      type="range"
                      min={8}
                      max={200}
                      value={textFontSize}
                      onChange={(e) => setTextFontSize(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-12 text-right">{textFontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">颜色</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-text-secondary">{textColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">透明度</span>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={textOpacity}
                      onChange={(e) => setTextOpacity(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-10 text-right">{textOpacity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">旋转</span>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={textRotation}
                      onChange={(e) => setTextRotation(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-10 text-right">{textRotation}°</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">字体</label>
                    <select
                      value={textFont}
                      onChange={(e) => setTextFont(e.target.value)}
                      className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {watermarkType === 'image' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">水印图片</label>
                    {wmImageSrc ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={wmImageSrc}
                          alt="水印图片"
                          className="w-16 h-16 object-contain rounded border border-border bg-bg-tertiary"
                        />
                        <button
                          onClick={() => {
                            setWmImageSrc(null);
                            setWmImageEl(null);
                          }}
                          className="p-1.5 rounded-md bg-bg-tertiary hover:bg-border text-text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => wmFileInputRef.current?.click()}
                        className="px-3 py-2 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors border border-dashed border-border"
                      >
                        点击上传水印图片
                      </button>
                    )}
                    <input
                      ref={wmFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleWmFileSelect(file);
                      }}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">缩放</span>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={wmImageScale}
                      onChange={(e) => setWmImageScale(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-12 text-right">{wmImageScale}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">透明度</span>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={wmImageOpacity}
                      onChange={(e) => setWmImageOpacity(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-10 text-right">{wmImageOpacity}%</span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <Grid3X3 className="w-3.5 h-3.5" />
                    平铺模式
                  </div>
                  <button
                    onClick={() => setTileMode(!tileMode)}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative',
                      tileMode ? 'bg-primary' : 'bg-bg-tertiary border border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        tileMode ? 'translate-x-4' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                {tileMode && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">行间距</span>
                      <input
                        type="range"
                        min={10}
                        max={500}
                        value={tileRowGap}
                        onChange={(e) => setTileRowGap(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-mono text-text-secondary w-12 text-right">{tileRowGap}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">列间距</span>
                      <input
                        type="range"
                        min={10}
                        max={500}
                        value={tileColGap}
                        onChange={(e) => setTileColGap(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-mono text-text-secondary w-12 text-right">{tileColGap}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">旋转</span>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={tileRotation}
                        onChange={(e) => setTileRotation(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-mono text-text-secondary w-10 text-right">{tileRotation}°</span>
                    </div>
                  </div>
                )}

                {!tileMode && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-medium text-text-secondary">水印位置</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {POSITION_9.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => setPosition(p.key)}
                          className={cn(
                            'px-2 py-1.5 text-xs rounded-md transition-colors',
                            position === p.key
                              ? 'bg-primary text-white'
                              : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary'
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">X 偏移</span>
                      <input
                        type="number"
                        value={offsetX}
                        onChange={(e) => setOffsetX(parseInt(e.target.value) || 0)}
                        className="flex-1 px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-text-muted">px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">Y 偏移</span>
                      <input
                        type="number"
                        value={offsetY}
                        onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)}
                        className="flex-1 px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-text-muted">px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-14 shrink-0">边距</span>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={posPadding}
                        onChange={(e) => setPosPadding(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-mono text-text-secondary w-12 text-right">{posPadding}px</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Settings2 className="w-3.5 h-3.5" />
                  导出设置
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-text-muted">输出格式</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="png">PNG (无损)</option>
                    <option value="jpeg">JPEG (有损)</option>
                    <option value="webp">WebP (推荐)</option>
                  </select>
                </div>
                {exportFormat !== 'png' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-14 shrink-0">质量</span>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-mono text-text-secondary w-10 text-right">{exportQuality}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownload}
              disabled={!imageEl}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              下载带水印的图片
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              重置
            </button>
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
