import { useState, useRef, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { QrCode, Download, Copy, Check, RefreshCw, Wifi, User, Link } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import ClaySelect from '@/components/shared/ClaySelect';
import ClaySlider from '@/components/shared/ClaySlider';
import ClayToggle from '@/components/shared/ClayToggle';
import ClaySegmentedControl from '@/components/shared/ClaySegmentedControl';
import { cn } from '@/lib/utils';
import {
  buildWifiString,
  buildVCardString,
  buildUrlString,
  downloadCanvasAsPng,
  downloadSvgAsPng,
  renderQrToCanvas,
  copyCanvasToClipboard,
} from './utils';

/* ──────────── 类型定义 ──────────── */

type TabValue = 'qr' | 'barcode' | 'other';
type OtherSubType = 'wifi' | 'vcard' | 'url';

const TAB_OPTIONS: { label: string; value: TabValue }[] = [
  { label: 'QR码', value: 'qr' },
  { label: '条形码', value: 'barcode' },
  { label: '其他码', value: 'other' },
];

const ERROR_LEVEL_OPTIONS = [
  { value: 'L', label: 'L - 低 (7%)' },
  { value: 'M', label: 'M - 中 (15%)' },
  { value: 'Q', label: 'Q - 较高 (25%)' },
  { value: 'H', label: 'H - 高 (30%)' },
];

const BARCODE_FORMAT_OPTIONS = [
  { value: 'CODE128', label: 'CODE128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'UPC', label: 'UPC' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'ITF14', label: 'ITF-14' },
  { value: 'MSI', label: 'MSI' },
  { value: 'pharmacode', label: 'Pharmacode' },
];

const ENCRYPTION_OPTIONS = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: '无密码' },
];

const OTHER_SUB_OPTIONS: { label: string; value: OtherSubType }[] = [
  { label: 'WiFi', value: 'wifi' },
  { label: 'vCard', value: 'vcard' },
  { label: 'URL', value: 'url' },
];

/* ──────────── 主组件 ──────────── */

export default function CodeGenerator() {
  // ── 公共状态 ──
  const [activeTab, setActiveTab] = useState<TabValue>('qr');
  const [copied, setCopied] = useState(false);

  // ── QR 码状态 ──
  const [qrText, setQrText] = useState('https://example.com');
  const [qrErrorLevel, setQrErrorLevel] = useState('M');
  const [qrSize, setQrSize] = useState(256);
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── 条形码状态 ──
  const [barcodeText, setBarcodeText] = useState('123456789012');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeShowText, setBarcodeShowText] = useState(true);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  // ── 其他码状态 ──
  const [otherSubType, setOtherSubType] = useState<OtherSubType>('wifi');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [urlValue, setUrlValue] = useState('https://');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const otherCanvasRef = useRef<HTMLCanvasElement>(null);

  /* ── QR 码渲染 ── */
  const renderQr = useCallback(async () => {
    if (!qrCanvasRef.current || !qrText) return;
    try {
      await renderQrToCanvas(qrCanvasRef.current, qrText, {
        width: qrSize,
        errorCorrectionLevel: qrErrorLevel as 'L' | 'M' | 'Q' | 'H',
        color: { dark: qrFgColor, light: qrBgColor },
      });
    } catch {
      // 忽略渲染错误
    }
  }, [qrText, qrSize, qrErrorLevel, qrFgColor, qrBgColor]);

  useEffect(() => {
    renderQr();
  }, [renderQr]);

  /* ── 条形码渲染 ── */
  useEffect(() => {
    if (!barcodeSvgRef.current || !barcodeText) return;
    try {
      JsBarcode(barcodeSvgRef.current, barcodeText, {
        format: barcodeFormat,
        width: barcodeWidth,
        height: barcodeHeight,
        displayValue: barcodeShowText,
        background: '#ffffff',
        lineColor: '#000000',
        margin: 10,
      });
    } catch {
      // 格式不匹配时清空
      if (barcodeSvgRef.current) {
        barcodeSvgRef.current.innerHTML = '';
      }
    }
  }, [barcodeText, barcodeFormat, barcodeWidth, barcodeHeight, barcodeShowText]);

  /* ── 其他码内容生成 ── */
  const otherContent = (() => {
    switch (otherSubType) {
      case 'wifi':
        return wifiSsid ? buildWifiString(wifiSsid, wifiPassword, wifiEncryption) : '';
      case 'vcard':
        return vcardName ? buildVCardString(vcardName, vcardPhone, vcardEmail, vcardCompany) : '';
      case 'url':
        return urlValue ? buildUrlString(urlValue, utmSource, utmMedium, utmCampaign) : '';
      default:
        return '';
    }
  })();

  /* ── 其他码渲染 ── */
  useEffect(() => {
    if (!otherCanvasRef.current || !otherContent) return;
    renderQrToCanvas(otherCanvasRef.current, otherContent, {
      width: 256,
      errorCorrectionLevel: 'M',
    }).catch(() => {});
  }, [otherContent]);

  /* ── 下载处理 ── */
  const handleDownloadQr = () => {
    if (qrCanvasRef.current) {
      downloadCanvasAsPng(qrCanvasRef.current, 'qrcode.png');
    }
  };

  const handleDownloadBarcode = () => {
    if (barcodeSvgRef.current) {
      downloadSvgAsPng(barcodeSvgRef.current, 'barcode.png');
    }
  };

  const handleDownloadOther = () => {
    if (otherCanvasRef.current) {
      downloadCanvasAsPng(otherCanvasRef.current, `${otherSubType}-qrcode.png`);
    }
  };

  /* ── 复制到剪贴板 ── */
  const handleCopyQr = async () => {
    if (!qrCanvasRef.current) return;
    const ok = await copyCanvasToClipboard(qrCanvasRef.current);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ── 重置 ── */
  const handleResetQr = () => {
    setQrText('https://example.com');
    setQrErrorLevel('M');
    setQrSize(256);
    setQrFgColor('#000000');
    setQrBgColor('#ffffff');
  };

  const handleResetBarcode = () => {
    setBarcodeText('123456789012');
    setBarcodeFormat('CODE128');
    setBarcodeWidth(2);
    setBarcodeHeight(100);
    setBarcodeShowText(true);
  };

  const handleResetOther = () => {
    setWifiSsid('');
    setWifiPassword('');
    setWifiEncryption('WPA');
    setVcardName('');
    setVcardPhone('');
    setVcardEmail('');
    setVcardCompany('');
    setUrlValue('https://');
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
  };

  /* ──────────── 渲染区域 ──────────── */

  const renderQrPreview = (canvasRef: React.RefObject<HTMLCanvasElement | null>, content: string) => (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white rounded-2xl p-3 shadow-clay-inset inline-flex items-center justify-center">
        <canvas ref={canvasRef} className={cn('max-w-full h-auto', !content && 'hidden')} />
        {!content && (
          <div className="w-64 h-64 flex items-center justify-center text-on-surface-variant text-sm">
            请输入内容以生成二维码
          </div>
        )}
      </div>
    </div>
  );

  const renderBarcodePreview = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white rounded-2xl p-3 shadow-clay-inset inline-flex items-center justify-center overflow-x-auto max-w-full">
        <svg ref={barcodeSvgRef} />
        {!barcodeText && (
          <div className="w-64 h-24 flex items-center justify-center text-on-surface-variant text-sm">
            请输入内容以生成条形码
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BasicToolLayout
      title="码生成器"
      description="QR码 / 条形码 / WiFi·vCard·URL 二维码一站式生成"
      icon={<QrCode className="w-7 h-7" />}
    >
      {/* ── Tab 切换 ── */}
      <ClaySegmentedControl
        options={TAB_OPTIONS}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* ═══════════ QR 码 Tab ═══════════ */}
      {activeTab === 'qr' && (
        <div className="flex flex-col gap-5">
          <ClayFieldInput
            label="内容"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="输入文本或网址"
          />

          <ClaySelect
            label="纠错等级"
            options={ERROR_LEVEL_OPTIONS}
            value={qrErrorLevel}
            onChange={setQrErrorLevel}
          />

          <ClaySlider
            label="尺寸"
            value={qrSize}
            min={100}
            max={500}
            unit="px"
            onChange={setQrSize}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">
                前景色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={qrFgColor}
                  onChange={(e) => setQrFgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer shrink-0"
                />
                <ClayFieldInput
                  value={qrFgColor}
                  onChange={(e) => setQrFgColor(e.target.value)}
                  size="sm"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">
                背景色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={qrBgColor}
                  onChange={(e) => setQrBgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer shrink-0"
                />
                <ClayFieldInput
                  value={qrBgColor}
                  onChange={(e) => setQrBgColor(e.target.value)}
                  size="sm"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* 预览 */}
          {renderQrPreview(qrCanvasRef, qrText)}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <ClayButton
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadQr}
              disabled={!qrText}
            >
              下载 PNG
            </ClayButton>
            <ClayButton
              variant="secondary"
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyQr}
              disabled={!qrText}
            >
              {copied ? '已复制' : '复制到剪贴板'}
            </ClayButton>
            <ClayButton
              variant="ghost"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetQr}
            >
              重置
            </ClayButton>
          </div>
        </div>
      )}

      {/* ═══════════ 条形码 Tab ═══════════ */}
      {activeTab === 'barcode' && (
        <div className="flex flex-col gap-5">
          <ClayFieldInput
            label="内容"
            value={barcodeText}
            onChange={(e) => setBarcodeText(e.target.value)}
            placeholder="输入条形码内容"
          />

          <ClaySelect
            label="条形码格式"
            options={BARCODE_FORMAT_OPTIONS}
            value={barcodeFormat}
            onChange={setBarcodeFormat}
          />

          <ClaySlider
            label="线条宽度"
            value={barcodeWidth}
            min={1}
            max={5}
            unit="px"
            onChange={setBarcodeWidth}
          />

          <ClaySlider
            label="高度"
            value={barcodeHeight}
            min={50}
            max={200}
            unit="px"
            onChange={setBarcodeHeight}
          />

          <ClayToggle
            label="显示文本"
            description="在条形码下方显示内容文本"
            checked={barcodeShowText}
            onChange={setBarcodeShowText}
          />

          {/* 预览 */}
          {renderBarcodePreview()}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <ClayButton
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadBarcode}
              disabled={!barcodeText}
            >
              下载 PNG
            </ClayButton>
            <ClayButton
              variant="ghost"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetBarcode}
            >
              重置
            </ClayButton>
          </div>
        </div>
      )}

      {/* ═══════════ 其他码 Tab ═══════════ */}
      {activeTab === 'other' && (
        <div className="flex flex-col gap-5">
          <ClaySegmentedControl
            options={OTHER_SUB_OPTIONS}
            value={otherSubType}
            onChange={setOtherSubType}
          />

          {/* ── WiFi ── */}
          {otherSubType === 'wifi' && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset flex flex-col gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <Wifi className="w-4 h-4" />
                  WiFi 二维码
                </div>
                <ClayFieldInput
                  label="网络名称 (SSID)"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="输入 WiFi 名称"
                />
                <ClayFieldInput
                  label="密码"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="输入 WiFi 密码"
                  type="password"
                />
                <ClaySelect
                  label="加密方式"
                  options={ENCRYPTION_OPTIONS}
                  value={wifiEncryption}
                  onChange={setWifiEncryption}
                />
              </div>
            </div>
          )}

          {/* ── vCard ── */}
          {otherSubType === 'vcard' && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset flex flex-col gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <User className="w-4 h-4" />
                  vCard 名片二维码
                </div>
                <ClayFieldInput
                  label="姓名"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="输入姓名"
                />
                <ClayFieldInput
                  label="电话"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="输入电话号码"
                />
                <ClayFieldInput
                  label="邮箱"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="输入邮箱地址"
                />
                <ClayFieldInput
                  label="公司"
                  value={vcardCompany}
                  onChange={(e) => setVcardCompany(e.target.value)}
                  placeholder="输入公司名称"
                />
              </div>
            </div>
          )}

          {/* ── URL ── */}
          {otherSubType === 'url' && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset flex flex-col gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <Link className="w-4 h-4" />
                  URL 二维码（支持 UTM 参数）
                </div>
                <ClayFieldInput
                  label="网址"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ClayFieldInput
                    label="utm_source"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="来源"
                    size="sm"
                  />
                  <ClayFieldInput
                    label="utm_medium"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="媒介"
                    size="sm"
                  />
                  <ClayFieldInput
                    label="utm_campaign"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="活动"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 预览 */}
          {renderQrPreview(otherCanvasRef, otherContent)}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <ClayButton
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadOther}
              disabled={!otherContent}
            >
              下载 PNG
            </ClayButton>
            <ClayButton
              variant="ghost"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetOther}
            >
              重置
            </ClayButton>
          </div>
        </div>
      )}
    </BasicToolLayout>
  );
}
