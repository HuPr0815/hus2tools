import { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'cropperjs';
import { Crop, Upload, Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ImageIcon, Plus, Copy, Check, Trash2, FileOutput, Layers, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type ImageFormat,
  type ViewBox,
  type SpriteRegion,
  type WebPFrame,
  type UndoState,
  detectFormat,
  isSvg,
  isRaster,
  r,
  formatBytes,
  parseViewBox,
  pixelToViewBox,
  viewBoxToPixel,
  downloadCroppedSvg,
  downloadCroppedRaster,
  readExifData,
  extractWebPFrames,
  detectByPixelGap,
  detectSpriteRegions,
  generateSpriteCss,
  compressRaster,
  multiFormatExport,
  getExt,
} from './utils';

type TabType = 'crop' | 'compress' | 'sprite';

const RATIO_PRESETS = [
  { label: '自由', value: 0 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '2:1', value: 2 },
];

const SPRITE_LAYOUTS = [
  { label: '自动判断', value: 'auto' },
  { label: '横向排列', value: 'horizontal' },
  { label: '纵向排列', value: 'vertical' },
  { label: '网格排列', value: 'grid' },
  { label: '像素检测', value: 'pixel' },
  { label: 'DOM 结构', value: 'dom' },
];

export default function ImageCrop() {
  const [tab, setTab] = useState<TabType>('crop');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ImageFormat | null>(null);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [rasterDataUrl, setRasterDataUrl] = useState<string | null>(null);
  const [rasterImageEl, setRasterImageEl] = useState<HTMLImageElement | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [vb, setVb] = useState<ViewBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);
  const [outputFmt, setOutputFmt] = useState('same');
  const [outputQuality, setOutputQuality] = useState(92);
  const [activeRatio, setActiveRatio] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentScaleX, setCurrentScaleX] = useState(1);
  const [currentScaleY, setCurrentScaleY] = useState(1);

  const [exifFields, setExifFields] = useState<{ label: string; value: string }[]>([]);
  const [exifExpanded, setExifExpanded] = useState(true);
  const [webpFrames, setWebpFrames] = useState<WebPFrame[]>([]);

  const [spriteRegions, setSpriteRegions] = useState<SpriteRegion[]>([]);
  const [activeSpriteIdx, setActiveSpriteIdx] = useState(-1);
  const [spriteCount, setSpriteCount] = useState(5);
  const [spriteLayout, setSpriteLayout] = useState('auto');
  const [spriteCss, setSpriteCss] = useState('');
  const [showSpriteCss, setShowSpriteCss] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', x: 0, y: 0, w: 0, h: 0 });

  const [compFmt, setCompFmt] = useState('webp');
  const [compQuality, setCompQuality] = useState(80);
  const [compMaxSize, setCompMaxSize] = useState(0);
  const [compMaxWidth, setCompMaxWidth] = useState(0);
  const [compMaxHeight, setCompMaxHeight] = useState(0);
  const [compResult, setCompResult] = useState<{ origSize: number; compSize: number; savedPct: string } | null>(null);

  const [progress, setProgress] = useState<{ text: string; pct: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cropperRef = useRef<Cropper | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isUpdatingFromCropper = useRef(false);
  const isUpdatingFromInput = useRef(false);
  const isUndoRedoAction = useRef(false);
  const undoStack = useRef<UndoState[]>([]);
  const redoStack = useRef<UndoState[]>([]);
  const cropPreviewRAF = useRef<number | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const pushUndoState = useCallback(
    (x: number, y: number, w: number, h: number, rotation?: number, scaleX?: number, scaleY?: number) => {
      const state: UndoState = {
        x, y, w, h,
        rotation: rotation ?? currentRotation,
        scaleX: scaleX ?? currentScaleX,
        scaleY: scaleY ?? currentScaleY,
      };
      const stack = undoStack.current;
      if (stack.length > 0) {
        const last = stack[stack.length - 1];
        if (
          Math.abs(last.x - x) < 0.5 && Math.abs(last.y - y) < 0.5 &&
          Math.abs(last.w - w) < 0.5 && Math.abs(last.h - h) < 0.5 &&
          last.rotation === state.rotation && last.scaleX === state.scaleX && last.scaleY === state.scaleY
        ) return;
      }
      stack.push(state);
      if (stack.length > 30) stack.shift();
      redoStack.current = [];
    },
    [currentRotation, currentScaleX, currentScaleY]
  );

  const updateCropPreview = useCallback(() => {
    if (isSvg(format)) return;
    if (!rasterImageEl || !previewCanvasRef.current) return;
    const x = cropX, y = cropY, w = cropW, h = cropH;
    if (w <= 0 || h <= 0) return;
    const canvas = previewCanvasRef.current;
    const maxW = 340;
    const scale = Math.min(maxW / w, 1);
    const canvasW = Math.round(w * scale);
    const canvasH = Math.round(h * scale);
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(rasterImageEl, x, y, w, h, 0, 0, canvasW, canvasH);
  }, [format, rasterImageEl, cropX, cropY, cropW, cropH]);

  const syncActiveSpriteRegion = useCallback(
    (x: number, y: number, w: number, h: number) => {
      if (activeSpriteIdx < 0 || activeSpriteIdx >= spriteRegions.length) return;
      setSpriteRegions((prev) => {
        const next = [...prev];
        next[activeSpriteIdx] = { ...next[activeSpriteIdx], x, y, w, h };
        return next;
      });
    },
    [activeSpriteIdx, spriteRegions.length]
  );

  const getSelection = useCallback(() => {
    return cropperRef.current?.getCropperSelection() ?? null;
  }, []);

  const getCropperImage = useCallback(() => {
    return cropperRef.current?.getCropperImage() ?? null;
  }, []);

  const imgElRef = useRef<HTMLImageElement | null>(null);

  const initCropper = useCallback(() => {
    const img = imgElRef.current;
    if (!img || !imageSrc) return;

    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    cropperRef.current = new Cropper(img, {
      container: containerRef.current ?? undefined,
      template: `<cropper-canvas background="true" style="min-height:300px;max-height:500px;"><cropper-image rotatable scalable translatable></cropper-image><cropper-selection initial-coverage="1" movable resizable outlined precise><cropper-grid bordered covered></cropper-grid><cropper-crosshair centered></cropper-crosshair><cropper-handle action="move"></cropper-handle><cropper-handle action="n-resize"></cropper-handle><cropper-handle action="e-resize"></cropper-handle><cropper-handle action="s-resize"></cropper-handle><cropper-handle action="w-resize"></cropper-handle><cropper-handle action="ne-resize"></cropper-handle><cropper-handle action="nw-resize"></cropper-handle><cropper-handle action="se-resize"></cropper-handle><cropper-handle action="sw-resize"></cropper-handle><cropper-shade></cropper-shade></cropper-selection></cropper-canvas>`,
    });

    const selection = getSelection();
    if (selection) {
      selection.addEventListener('change', () => {
        if (isUpdatingFromInput.current) return;
        isUpdatingFromCropper.current = true;
        const sx = selection.x;
        const sy = selection.y;
        const sw = selection.width;
        const sh = selection.height;
        const vbCrop = pixelToViewBox(sx, sy, sw, sh, vb, naturalW, naturalH);
        if (!isUndoRedoAction.current) pushUndoState(vbCrop.x, vbCrop.y, vbCrop.w, vbCrop.h);
        setCropX(r(vbCrop.x));
        setCropY(r(vbCrop.y));
        setCropW(r(vbCrop.w));
        setCropH(r(vbCrop.h));
        syncActiveSpriteRegion(vbCrop.x, vbCrop.y, vbCrop.w, vbCrop.h);
        if (isRaster(format)) {
          if (cropPreviewRAF.current) cancelAnimationFrame(cropPreviewRAF.current);
          cropPreviewRAF.current = requestAnimationFrame(updateCropPreview);
        }
        isUpdatingFromCropper.current = false;
        isUndoRedoAction.current = false;
      });
    }

    const cropperImage = getCropperImage();
    if (cropperImage) {
      cropperImage.addEventListener('transform', () => {
        const matrix = cropperImage.$getTransform();
        if (matrix && matrix.length >= 6) {
          const a = matrix[0];
          const b = matrix[1];
          const rotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
          const scaleX = a < 0 ? -1 : 1;
          const scaleY = b < 0 ? -1 : 1;
          setCurrentRotation(rotation);
          setCurrentScaleX(scaleX);
          setCurrentScaleY(scaleY);
        }
      });
    }
  }, [imageSrc, vb, naturalW, naturalH, pushUndoState, syncActiveSpriteRegion, format, updateCropPreview, getSelection, getCropperImage]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const fmt = detectFormat(file);
      if (!fmt) { showToast('不支持的文件格式！'); return; }

      setFileName(file.name.replace(/\.[^.]+$/, ''));
      setFormat(fmt);
      setOriginalFile(file);
      setCurrentRotation(0);
      setCurrentScaleX(1);
      setCurrentScaleY(1);
      setSpriteRegions([]);
      setActiveSpriteIdx(-1);
      setWebpFrames([]);
      setExifFields([]);
      setCompResult(null);
      undoStack.current = [];
      redoStack.current = [];

      if (isSvg(fmt)) {
        const text = await file.text();
        setSvgText(text);
        const parsedVb = parseViewBox(text);
        let newVb: ViewBox;
        if (parsedVb) {
          newVb = parsedVb;
        } else {
          const wMatch = text.match(/\swidth\s*=\s*"([^"]*)"/);
          const hMatch = text.match(/\sheight\s*=\s*"([^"]*)"/);
          newVb = { x: 0, y: 0, w: wMatch ? parseFloat(wMatch[1]) : 800, h: hMatch ? parseFloat(hMatch[1]) : 600 };
        }
        setVb(newVb);
        const blob = new Blob([text], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      } else {
        setSvgText(null);
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        setRasterDataUrl(dataUrl);
        setImageSrc(dataUrl);

        const img = new Image();
        img.onload = async () => {
          setRasterImageEl(img);
          const newVb: ViewBox = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
          setVb(newVb);
          setNaturalW(img.naturalWidth);
          setNaturalH(img.naturalHeight);
          const fields = await readExifData(file, img);
          setExifFields(fields);
          if (fmt === 'webp') {
            const frames = await extractWebPFrames(file);
            setWebpFrames(frames);
          }
        };
        img.src = dataUrl;
      }
    },
    [showToast]
  );

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); }, [handleFileSelect]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  useEffect(() => {
    if (!imageSrc || !containerRef.current) return;
    setTimeout(initCropper, 100);
    return () => {
      if (cropperRef.current) { cropperRef.current.destroy(); cropperRef.current = null; }
    };
  }, [imageSrc, initCropper]);

  useEffect(() => {
    if (cropPreviewRAF.current) cancelAnimationFrame(cropPreviewRAF.current);
    cropPreviewRAF.current = requestAnimationFrame(updateCropPreview);
  }, [cropX, cropY, cropW, cropH, updateCropPreview]);

  const handleCropInputChange = useCallback(
    (field: 'x' | 'y' | 'w' | 'h', value: number) => {
      if (isUpdatingFromCropper.current) return;
      const selection = getSelection();
      if (!selection) return;
      isUpdatingFromInput.current = true;

      let nx = field === 'x' ? value : cropX;
      let ny = field === 'y' ? value : cropY;
      let nw = field === 'w' ? value : cropW;
      let nh = field === 'h' ? value : cropH;

      setCropX(nx); setCropY(ny); setCropW(nw); setCropH(nh);

      const pixel = viewBoxToPixel(nx, ny, nw, nh, vb, naturalW, naturalH);
      selection.$change(pixel.x, pixel.y, pixel.w, pixel.h);
      syncActiveSpriteRegion(nx, ny, nw, nh);
      isUpdatingFromInput.current = false;
    },
    [cropX, cropY, cropW, cropH, vb, naturalW, naturalH, syncActiveSpriteRegion, getSelection]
  );

  const handleDownload = useCallback(() => {
    if (!format) { showToast('请先上传图片文件！'); return; }
    if (isSvg(format) && svgText) {
      downloadCroppedSvg(svgText, cropX, cropY, cropW, cropH, fileName);
      showToast('SVG 文件已下载！');
    } else if (rasterImageEl && rasterDataUrl) {
      downloadCroppedRaster(rasterImageEl, cropX, cropY, cropW, cropH, outputFmt, format, outputQuality / 100, rasterDataUrl, vb, fileName);
      showToast('文件已下载！');
    }
  }, [format, svgText, cropX, cropY, cropW, cropH, fileName, rasterImageEl, rasterDataUrl, outputFmt, outputQuality, vb, showToast]);

  const handleReset = useCallback(() => {
    const selection = getSelection();
    const cropperImage = getCropperImage();
    if (!selection) return;
    setActiveSpriteIdx(-1);
    setCurrentRotation(0);
    setCurrentScaleX(1);
    setCurrentScaleY(1);
    setActiveRatio(0);
    isUpdatingFromInput.current = true;
    const pixel = viewBoxToPixel(vb.x, vb.y, vb.w, vb.h, vb, naturalW, naturalH);
    selection.$change(pixel.x, pixel.y, pixel.w, pixel.h);
    selection.aspectRatio = 0;
    if (cropperImage) cropperImage.$resetTransform();
    isUpdatingFromInput.current = false;
    pushUndoState(vb.x, vb.y, vb.w, vb.h, 0, 1, 1);
  }, [vb, naturalW, naturalH, pushUndoState, getSelection, getCropperImage]);

  const handleRatioChange = useCallback(
    (ratio: number) => {
      const selection = getSelection();
      if (!selection) return;
      setActiveRatio(ratio);
      selection.aspectRatio = ratio;
    },
    [getSelection]
  );

  const handleTransform = useCallback(
    (action: string) => {
      const cropperImage = getCropperImage();
      const selection = getSelection();
      if (!cropperImage || !selection) return;
      const vbCrop = pixelToViewBox(selection.x, selection.y, selection.width, selection.height, vb, naturalW, naturalH);
      if (action === 'rotate-left') {
        cropperImage.$rotate('-90deg');
        setCurrentRotation((prev) => prev - 90);
      } else if (action === 'rotate-right') {
        cropperImage.$rotate('90deg');
        setCurrentRotation((prev) => prev + 90);
      } else if (action === 'flip-h') {
        const newScaleX = currentScaleX * -1;
        cropperImage.$scale(newScaleX);
        setCurrentScaleX(newScaleX);
      } else if (action === 'flip-v') {
        const newScaleY = currentScaleY * -1;
        cropperImage.$scale(1, newScaleY);
        setCurrentScaleY(newScaleY);
      }
      pushUndoState(vbCrop.x, vbCrop.y, vbCrop.w, vbCrop.h, currentRotation, currentScaleX, currentScaleY);
    },
    [vb, naturalW, naturalH, currentRotation, currentScaleX, currentScaleY, pushUndoState, getSelection, getCropperImage]
  );

  const handleUndo = useCallback(() => {
    const stack = undoStack.current;
    if (stack.length <= 1) { showToast('没有更多可撤销的操作'); return; }
    const current = stack.pop()!;
    redoStack.current.push(current);
    const prev = stack[stack.length - 1];
    isUndoRedoAction.current = true;
    const selection = getSelection();
    const cropperImage = getCropperImage();
    if (prev.rotation !== undefined && cropperImage) {
      setCurrentRotation(prev.rotation);
      setCurrentScaleX(prev.scaleX ?? 1);
      setCurrentScaleY(prev.scaleY ?? 1);
      cropperImage.$resetTransform();
    }
    if (selection) {
      const px = viewBoxToPixel(prev.x, prev.y, prev.w, prev.h, vb, naturalW, naturalH);
      selection.$change(px.x, px.y, px.w, px.h);
    }
    setCropX(r(prev.x)); setCropY(r(prev.y)); setCropW(r(prev.w)); setCropH(r(prev.h));
    syncActiveSpriteRegion(prev.x, prev.y, prev.w, prev.h);
    isUndoRedoAction.current = false;
  }, [vb, naturalW, naturalH, showToast, syncActiveSpriteRegion, getSelection, getCropperImage]);

  const handleRedo = useCallback(() => {
    const rStack = redoStack.current;
    if (rStack.length === 0) { showToast('没有更多可重做的操作'); return; }
    const state = rStack.pop()!;
    undoStack.current.push(state);
    isUndoRedoAction.current = true;
    const selection = getSelection();
    const cropperImage = getCropperImage();
    if (state.rotation !== undefined && cropperImage) {
      setCurrentRotation(state.rotation);
      setCurrentScaleX(state.scaleX ?? 1);
      setCurrentScaleY(state.scaleY ?? 1);
      cropperImage.$resetTransform();
    }
    if (selection) {
      const px = viewBoxToPixel(state.x, state.y, state.w, state.h, vb, naturalW, naturalH);
      selection.$change(px.x, px.y, px.w, px.h);
    }
    setCropX(r(state.x)); setCropY(r(state.y)); setCropW(r(state.w)); setCropH(r(state.h));
    syncActiveSpriteRegion(state.x, state.y, state.w, state.h);
    isUndoRedoAction.current = false;
  }, [vb, naturalW, naturalH, showToast, syncActiveSpriteRegion, getSelection, getCropperImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); if (e.shiftKey) handleRedo(); else handleUndo(); }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); handleRedo(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleDetectSprite = useCallback(async () => {
    if (spriteLayout === 'pixel' && rasterImageEl) {
      setProgress({ text: '正在检测...', pct: 0 });
      const regions = await detectByPixelGap(rasterImageEl, spriteCount, (text, pct) => setProgress({ text, pct }));
      setSpriteRegions(regions);
      setProgress(null);
      if (regions.length > 0) { const css = generateSpriteCss(regions, fileName || 'image'); setSpriteCss(css); }
    } else {
      const regions = detectSpriteRegions(spriteCount, spriteLayout, svgText, format);
      setSpriteRegions(regions);
      if (regions.length > 0) { const css = generateSpriteCss(regions, fileName || 'image'); setSpriteCss(css); }
    }
  }, [spriteLayout, spriteCount, rasterImageEl, svgText, format, fileName]);

  const handleCompress = useCallback(async () => {
    if (!rasterImageEl) { showToast('请先上传图片！'); return; }
    setProgress({ text: '正在压缩...', pct: 10 });
    const targetFmt = compFmt === 'same' ? (format === 'jpg' ? 'jpg' : format || 'webp') : compFmt;
    const result = await compressRaster(rasterImageEl, targetFmt, compQuality / 100, compMaxSize, compMaxWidth, compMaxHeight, (text, pct) => setProgress({ text, pct }));
    setProgress(null);
    if (result) {
      const origSize = originalFile?.size || 0;
      const savedPct = origSize > 0 ? ((1 - result.blob.size / origSize) * 100).toFixed(1) : '0.0';
      setCompResult({ origSize, compSize: result.blob.size, savedPct });
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${fileName}_compressed.${getExt(result.fmt)}`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`压缩完成！节省 ${savedPct}%`);
    } else { showToast('压缩失败'); }
  }, [rasterImageEl, compFmt, compQuality, compMaxSize, compMaxWidth, compMaxHeight, format, originalFile, fileName, showToast]);

  const handleMultiFormatExport = useCallback(async () => {
    if (!rasterImageEl) return;
    setProgress({ text: '正在生成多格式对比...', pct: 5 });
    await multiFormatExport(rasterImageEl, compQuality / 100, compMaxWidth, compMaxHeight, (text, pct) => setProgress({ text, pct }), fileName);
    setProgress(null);
    showToast('多格式导出完成');
  }, [rasterImageEl, compQuality, compMaxWidth, compMaxHeight, fileName, showToast]);

  const handleCopyCss = useCallback(async () => {
    if (!spriteCss) return;
    try { await navigator.clipboard.writeText(spriteCss); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('复制失败'); }
  }, [spriteCss, showToast]);

  const handleLocateSprite = useCallback(
    (idx: number) => {
      setActiveSpriteIdx(idx);
      const reg = spriteRegions[idx];
      const selection = getSelection();
      if (reg && selection) {
        isUpdatingFromInput.current = true;
        const pixel = viewBoxToPixel(reg.x, reg.y, reg.w, reg.h, vb, naturalW, naturalH);
        selection.$change(pixel.x, pixel.y, pixel.w, pixel.h);
        setCropX(r(reg.x)); setCropY(r(reg.y)); setCropW(r(reg.w)); setCropH(r(reg.h));
        isUpdatingFromInput.current = false;
      }
    },
    [spriteRegions, vb, naturalW, naturalH, getSelection]
  );

  const handleDeleteSprite = useCallback((idx: number) => {
    setSpriteRegions((prev) => prev.filter((_, i) => i !== idx));
    if (activeSpriteIdx === idx) setActiveSpriteIdx(-1);
  }, [activeSpriteIdx]);

  const handleAddSprite = useCallback(() => {
    const newRegion: SpriteRegion = {
      name: addForm.name || `sprite_${String(spriteRegions.length + 1).padStart(2, '0')}`,
      x: addForm.x, y: addForm.y, w: addForm.w, h: addForm.h,
    };
    setSpriteRegions((prev) => [...prev, newRegion]);
    setShowAddForm(false);
    setAddForm({ name: '', x: 0, y: 0, w: 0, h: 0 });
    const css = generateSpriteCss([...spriteRegions, newRegion], fileName || 'image');
    setSpriteCss(css);
  }, [addForm, spriteRegions, fileName]);

  const handleDownloadSprite = useCallback(
    (reg: SpriteRegion) => {
      if (isSvg(format) && svgText) { downloadCroppedSvg(svgText, reg.x, reg.y, reg.w, reg.h, fileName); }
      else if (rasterImageEl && rasterDataUrl) { downloadCroppedRaster(rasterImageEl, reg.x, reg.y, reg.w, reg.h, 'same', format!, outputQuality / 100, rasterDataUrl, vb, fileName); }
    },
    [format, svgText, rasterImageEl, rasterDataUrl, outputQuality, vb, fileName]
  );

  const handleBatchDownload = useCallback(() => {
    spriteRegions.forEach((reg) => { setTimeout(() => handleDownloadSprite(reg), spriteRegions.indexOf(reg) * 200); });
  }, [spriteRegions, handleDownloadSprite]);

  const handleDownloadFrame = useCallback((frame: WebPFrame, idx: number) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl; link.download = `${fileName}_frame_${idx + 1}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [fileName]);

  const isSvgMode = isSvg(format);
  const isRasterMode = isRaster(format);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Crop className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">图片裁剪</h2>
          <p className="text-sm text-text-secondary">上传图片，框选裁剪区域，下载裁剪后的文件</p>
        </div>
      </div>

      {!imageSrc ? (
        <div
          onDrop={handleDrop} onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl bg-bg-secondary hover:bg-bg-tertiary hover:border-primary transition-colors cursor-pointer"
        >
          <ImageIcon className="w-16 h-16 text-text-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">拖拽图片到此处，或点击上传</p>
            <p className="text-xs text-text-muted mt-1">支持 SVG / PNG / JPG / GIF / WebP / BMP / AVIF / ICO / TIFF</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors">
            <Upload className="w-4 h-4" />选择图片
          </button>
          <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg,.gif,.webp,.bmp,.avif,.ico,.tiff,.tif,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} className="hidden" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors">
              <Upload className="w-3.5 h-3.5" />换图
            </button>
            <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg,.gif,.webp,.bmp,.avif,.ico,.tiff,.tif,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} className="hidden" />
            <div className="flex-1" />
            <span className="text-xs text-text-muted">{format?.toUpperCase()} · {naturalW} × {naturalH}</span>
          </div>

          <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
            {[
              { key: 'crop' as TabType, label: '裁剪', icon: <Crop className="w-3.5 h-3.5" /> },
              { key: 'compress' as TabType, label: '压缩', icon: <Package className="w-3.5 h-3.5" /> },
              { key: 'sprite' as TabType, label: '精灵图', icon: <Layers className="w-3.5 h-3.5" /> },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn('flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors', tab === t.key ? 'bg-bg-tertiary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 min-h-0 flex-1">
            <div ref={containerRef} className="flex-1 min-w-0 min-h-[300px] max-h-[500px] bg-bg-secondary border border-border rounded-xl overflow-hidden">
              <img ref={imgElRef} src={imageSrc ?? undefined} alt="裁剪预览" className="block max-w-full" />
            </div>

            <div className="w-72 shrink-0 flex flex-col gap-3 overflow-auto">
              {tab === 'crop' && (
                <>
                  <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {isSvgMode ? '裁剪参数 (viewBox 坐标)' : '裁剪参数 (像素坐标)'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'X 起点', field: 'x' as const, val: cropX }, { label: 'Y 起点', field: 'y' as const, val: cropY }, { label: '宽度', field: 'w' as const, val: cropW }, { label: '高度', field: 'h' as const, val: cropH }].map((item) => (
                      <div key={item.field} className="flex flex-col gap-1">
                        <label className="text-xs text-text-muted">{item.label}</label>
                        <input type="number" value={item.val} min={item.field === 'w' || item.field === 'h' ? 1 : undefined}
                          onChange={(e) => handleCropInputChange(item.field, parseFloat(e.target.value) || 0)}
                          className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                      </div>
                    ))}
                  </div>

                  {isRasterMode && (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-text-secondary">输出格式</div>
                        <select value={outputFmt} onChange={(e) => setOutputFmt(e.target.value)} className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary">
                          <option value="same">与原格式相同</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option><option value="svg">SVG (仅嵌入)</option>
                        </select>
                      </div>

                      {(outputFmt === 'jpeg' || outputFmt === 'webp') && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">质量</span>
                          <input type="range" min={10} max={100} value={outputQuality} onChange={(e) => setOutputQuality(Number(e.target.value))} className="flex-1 accent-primary" />
                          <span className="text-xs font-mono text-text-secondary w-10 text-right">{outputQuality}%</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-text-secondary">宽高比</div>
                        <div className="flex flex-wrap gap-1.5">
                          {RATIO_PRESETS.map((rp) => (
                            <button key={rp.label} onClick={() => handleRatioChange(rp.value)}
                              className={cn('px-2.5 py-1 text-xs rounded-md transition-colors', activeRatio === rp.value ? 'bg-primary text-white' : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary')}>
                              {rp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-text-secondary">变换</div>
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => handleTransform('rotate-left')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><RotateCcw className="w-3 h-3" /> 左旋</button>
                          <button onClick={() => handleTransform('rotate-right')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><RotateCw className="w-3 h-3" /> 右旋</button>
                          <button onClick={() => handleTransform('flip-h')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><FlipHorizontal className="w-3 h-3" /> 水平</button>
                          <button onClick={() => handleTransform('flip-v')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><FlipVertical className="w-3 h-3" /> 垂直</button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-medium text-text-secondary">裁剪预览</div>
                        <canvas ref={previewCanvasRef} className="max-w-full rounded-md border border-border" />
                      </div>
                    </>
                  )}
                </>
              )}

              {tab === 'compress' && (
                <>
                  {isSvgMode ? (
                    <div className="flex flex-col gap-3">
                      <div className="text-xs font-medium text-text-secondary">SVG 压缩优化（需要 SVGO 支持）</div>
                      <p className="text-xs text-text-muted">SVG 压缩功能需要在线加载 SVGO，部署后可用</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-text-muted">输出格式</label>
                        <select value={compFmt} onChange={(e) => setCompFmt(e.target.value)} className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary">
                          <option value="webp">WebP (推荐，体积最小)</option><option value="same">与原格式相同</option><option value="png">PNG (无损)</option><option value="jpeg">JPEG (有损)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">质量</span>
                        <input type="range" min={10} max={100} value={compQuality} onChange={(e) => setCompQuality(Number(e.target.value))} className="flex-1 accent-primary" />
                        <span className="text-xs font-mono text-text-secondary w-10 text-right">{compQuality}%</span>
                      </div>
                      {[{ label: '目标大小', val: compMaxSize, set: setCompMaxSize, unit: 'KB' }, { label: '最大宽度', val: compMaxWidth, set: setCompMaxWidth, unit: 'px' }, { label: '最大高度', val: compMaxHeight, set: setCompMaxHeight, unit: 'px' }].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <label className="text-xs text-text-muted w-16">{item.label}</label>
                          <input type="number" value={item.val || ''} onChange={(e) => item.set(parseInt(e.target.value) || 0)} placeholder="不限" className="flex-1 px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                          <span className="text-xs text-text-muted">{item.unit}</span>
                        </div>
                      ))}
                      {compResult && (
                        <div className="p-2 rounded-md bg-success/10 border border-success/20 text-xs text-success">
                          原始: {formatBytes(compResult.origSize)} → 压缩后: {formatBytes(compResult.compSize)}<br />节省: {compResult.savedPct}%
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {tab === 'sprite' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-text-muted">物品数量</label>
                      <input type="number" value={spriteCount} min={1} max={50} onChange={(e) => setSpriteCount(parseInt(e.target.value) || 5)} className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-text-muted">排列方式</label>
                      <select value={spriteLayout} onChange={(e) => setSpriteLayout(e.target.value)} className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary">
                        {SPRITE_LAYOUTS.map((l) => (<option key={l.value} value={l.value} disabled={l.value === 'dom' && !isSvgMode}>{l.label}</option>))}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleDetectSprite} className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors">检测</button>

                  {spriteRegions.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-auto">
                      {spriteRegions.map((reg, idx) => (
                        <div key={idx} onClick={() => handleLocateSprite(idx)}
                          className={cn('flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors', activeSpriteIdx === idx ? 'border-primary bg-primary/5' : 'border-border bg-bg-secondary hover:border-primary/50')}>
                          <span className="w-5 h-5 rounded bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-text-primary truncate">{reg.name}</div>
                            <div className="text-[10px] text-text-muted font-mono">{r(reg.x)}, {r(reg.y)} | {r(reg.w)} × {r(reg.h)}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); handleDownloadSprite(reg); }} className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary"><Download className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSprite(idx); }} className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><Plus className="w-3 h-3" /> 自定义区域</button>
                    <button onClick={() => { setSpriteRegions([]); setSpriteCss(''); }} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><Trash2 className="w-3 h-3" /> 清空</button>
                  </div>

                  {showAddForm && (
                    <div className="p-2 rounded-md bg-bg-secondary border border-border flex flex-col gap-2">
                      <input type="text" placeholder="名称" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} className="px-2 py-1 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary focus:outline-none focus:border-primary" />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input type="number" placeholder="X" value={addForm.x} onChange={(e) => setAddForm((p) => ({ ...p, x: parseFloat(e.target.value) || 0 }))} className="px-2 py-1 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                        <input type="number" placeholder="Y" value={addForm.y} onChange={(e) => setAddForm((p) => ({ ...p, y: parseFloat(e.target.value) || 0 }))} className="px-2 py-1 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                        <input type="number" placeholder="宽" value={addForm.w} onChange={(e) => setAddForm((p) => ({ ...p, w: parseFloat(e.target.value) || 0 }))} className="px-2 py-1 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                        <input type="number" placeholder="高" value={addForm.h} onChange={(e) => setAddForm((p) => ({ ...p, h: parseFloat(e.target.value) || 0 }))} className="px-2 py-1 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary font-mono focus:outline-none focus:border-primary" />
                      </div>
                      <button onClick={handleAddSprite} className="px-3 py-1 text-sm rounded-md bg-primary text-white">添加</button>
                    </div>
                  )}

                  {spriteCss && (
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => setShowSpriteCss(!showSpriteCss)} className="text-xs text-text-muted hover:text-text-primary transition-colors">{showSpriteCss ? '隐藏' : '显示'} CSS 代码</button>
                      {showSpriteCss && (<pre className="p-2 text-[10px] font-mono text-text-primary bg-bg-tertiary rounded-md border border-border max-h-40 overflow-auto whitespace-pre-wrap break-all">{spriteCss}</pre>)}
                      <button onClick={handleCopyCss} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors">
                        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '复制 CSS'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
            <span>原始尺寸: {naturalW} × {naturalH}</span>
            <span>格式: {format?.toUpperCase() || '-'}</span>
            <span>裁剪: {r(cropX)},{r(cropY)} {r(cropW)}×{r(cropH)}</span>
            {originalFile && <span>大小: {formatBytes(originalFile.size)}</span>}
          </div>

          {exifFields.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button onClick={() => setExifExpanded(!exifExpanded)} className="w-full px-3 py-2 text-xs font-medium text-text-secondary bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-between transition-colors">
                <span>📷 图片信息 ({exifFields.length})</span><span>{exifExpanded ? '▾' : '▸'}</span>
              </button>
              {exifExpanded && (
                <div className="grid grid-cols-2 gap-1 p-2 bg-bg-secondary">
                  {exifFields.map((f, i) => (<div key={i} className="flex gap-1 text-[10px]"><span className="text-text-muted shrink-0">{f.label}:</span><span className="text-text-primary font-medium truncate">{f.value}</span></div>))}
                </div>
              )}
            </div>
          )}

          {webpFrames.length > 0 && (
            <div className="border border-border rounded-lg p-2 bg-bg-secondary">
              <div className="text-xs font-medium text-text-secondary mb-2">🎬 动画帧 ({webpFrames.length}帧)</div>
              <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-auto">
                {webpFrames.map((frame, i) => (
                  <button key={i} onClick={() => handleDownloadFrame(frame, i)} className="border border-border rounded overflow-hidden hover:border-primary transition-colors">
                    <img src={frame.dataUrl} alt={`帧 ${i + 1}`} className="w-full h-10 object-contain" />
                    <div className="text-[8px] text-text-muted text-center">帧{i + 1}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {tab === 'crop' && (
              <>
                <button onClick={handleDownload} disabled={!format} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors disabled:opacity-40"><Download className="w-4 h-4" />下载裁剪后的图片</button>
                <button onClick={handleReset} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><RotateCcw className="w-3.5 h-3.5" />重置为全图</button>
              </>
            )}
            {tab === 'compress' && isRasterMode && (
              <>
                <button onClick={handleCompress} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"><Package className="w-4 h-4" />压缩并下载</button>
                <button onClick={handleMultiFormatExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors"><FileOutput className="w-3.5 h-3.5" />多格式对比导出</button>
              </>
            )}
            {tab === 'sprite' && spriteRegions.length > 0 && (
              <button onClick={handleBatchDownload} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors"><Download className="w-4 h-4" />批量下载全部</button>
            )}
          </div>
        </div>
      )}

      {toast && (<div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-sm z-50">{toast}</div>)}
      {progress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <p className="text-text-primary font-medium mb-4">{progress.text}</p>
            <div className="w-60 h-2 bg-bg-tertiary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${progress.pct}%` }} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
