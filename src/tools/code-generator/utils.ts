import QRCode from 'qrcode';

/** WiFi QR 内容字符串生成 */
export function buildWifiString(ssid: string, password: string, encryption: string): string {
  return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
}

/** vCard QR 内容字符串生成 */
export function buildVCardString(name: string, phone: string, email: string, company: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    name && `N:${name}`,
    phone && `TEL:${phone}`,
    email && `EMAIL:${email}`,
    company && `ORG:${company}`,
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\n');
}

/** URL QR 内容字符串生成（带 UTM 参数） */
export function buildUrlString(url: string, utmSource?: string, utmMedium?: string, utmCampaign?: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (utmSource) u.searchParams.set('utm_source', utmSource);
    if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
    return u.toString();
  } catch {
    return url;
  }
}

/** 将 canvas 导出为 PNG 并触发下载 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** 将 SVG 元素导出为 PNG 并触发下载 */
export function downloadSvgAsPng(svgEl: SVGElement, filename: string, scale = 2): void {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = url;
}

/** 使用 QRCode 库渲染到 canvas */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    width: options.width ?? 256,
    margin: options.margin ?? 2,
    color: options.color,
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  });
}

/** 使用 QRCode 库获取 dataURL */
export async function renderQrToDataURL(
  text: string,
  options: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options.width ?? 256,
    margin: options.margin ?? 2,
    color: options.color,
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  });
}

/** 将 canvas 复制到剪贴板 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
