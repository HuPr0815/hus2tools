import { useState } from 'react';
import { Globe, Search, Navigation, CheckCircle } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import CopyButton from '@/components/shared/CopyButton';
import { lookupIp, type IpInfo } from './utils';

export default function IpLookup() {
  const [ipInput, setIpInput, _clearIpInput] = usePersistInput('ip-lookup');
  const [result, setResult] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!ipInput.trim()) return;
    setLoading(true);
    try {
      const info = await lookupIp(ipInput);
      setResult(info);
    } finally {
      setLoading(false);
    }
  };

  const handleMyIp = async () => {
    setIpInput('');
    setLoading(true);
    try {
      const info = await lookupIp('');
      setResult(info);
    } finally {
      setLoading(false);
    }
  };

  const infoItems = result
    ? [
        { label: 'IP 地址', value: result.ip },
        { label: '国家', value: result.country ?? '' },
        { label: '地区', value: result.region ?? '' },
        { label: '城市', value: result.city ?? '' },
        { label: 'ISP', value: result.org ?? '' },
        { label: '时区', value: result.timezone ?? '' },
        { label: '纬度', value: result.loc ? result.loc.split(',')[0] : '' },
        { label: '经度', value: result.loc ? result.loc.split(',')[1] : '' },
      ]
    : [];

  return (
    <BasicToolLayout
      title="IP 查询"
      description="查询 IP 地址的地理位置与网络信息"
      icon={<Globe className="w-7 h-7" />}
      resultSection={
        result ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                查询结果
              </span>
              <div className="flex gap-2">
                <CopyButton text={result.ip} />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-clay-blue-light dark:bg-clay-blue-deep/30 shadow-clay flex items-center justify-center">
                <Globe className="w-6 h-6 text-clay-blue-dark dark:text-clay-blue-light" />
              </div>
              <div>
                <div className="text-xl font-bold text-on-surface">{result.ip}</div>
                <div className="text-xs text-on-surface-variant">
                  {[result.country, result.region, result.city].filter(Boolean).join(' · ') || '未知位置'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-surface dark:bg-black/40 p-3 shadow-clay-inset"
                >
                  <div className="text-xs text-outline mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-on-surface">{item.value || '-'}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant shadow-clay-inset overflow-hidden" style={{ height: '200px' }}>
              <div className="w-full h-full flex items-center justify-center text-outline text-xs">
                <div className="flex flex-col items-center gap-2">
                  <Globe className="w-8 h-8 opacity-30" />
                  <span>地图占位</span>
                  {result.loc && (() => {
                    const [lat, lon] = result.loc.split(',');
                    return lat !== '0' && lon !== '0' ? (
                      <span className="text-[10px] opacity-50">
                        {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
      showResult={result !== null}
    >
      <div className="flex items-center gap-2">
        <input
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="输入 IP 地址，如 8.8.8.8"
          className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !ipInput.trim()}
          className="group relative px-6 py-3 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Search className="w-4 h-4" />
            查询
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={handleMyIp}
          className="px-4 py-3 rounded-2xl bg-clay-blue-light text-clay-blue-dark font-semibold shadow-clay hover:shadow-clay-hover transition-all clay-button"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </BasicToolLayout>
  );
}
