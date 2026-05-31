import { useState, useEffect, useCallback } from 'react';
import { Search, Copy, Check, Wifi, MapPin, Globe, Clock } from 'lucide-react';

interface IpInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  timezone: string;
  lat: number;
  lon: number;
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

function isValidIpv4(ip: string): boolean {
  return IPV4_REGEX.test(ip.trim());
}

export default function IpLookup() {
  const [inputIp, setInputIp] = useState('');
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [myIp, setMyIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchMyIp = useCallback(async () => {
    setAutoLoading(true);
    setError('');
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (!res.ok) throw new Error('获取本机 IP 失败');
      const data = await res.json();
      setMyIp(data.ip);
      return data.ip;
    } catch {
      setError('无法获取本机 IP 地址，请检查网络连接');
      return null;
    } finally {
      setAutoLoading(false);
    }
  }, []);

  const lookupIp = useCallback(async (ip: string) => {
    setLoading(true);
    setError('');
    setIpInfo(null);
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}`);
      if (!res.ok) throw new Error('IP 查询失败');
      const data = await res.json();
      if (data.status === 'fail') throw new Error(data.message || 'IP 查询失败');
      setIpInfo({
        ip: data.query,
        country: data.country || '',
        region: data.regionName || '',
        city: data.city || '',
        isp: data.isp || '',
        org: data.org || '',
        timezone: data.timezone || '',
        lat: data.lat,
        lon: data.lon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询出错');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyIp().then(ip => {
      if (ip) lookupIp(ip);
    });
  }, [fetchMyIp, lookupIp]);

  const handleLookup = useCallback(() => {
    const trimmed = inputIp.trim();
    if (!trimmed) {
      setError('请输入 IP 地址');
      return;
    }
    if (!isValidIpv4(trimmed)) {
      setError('请输入有效的 IPv4 地址');
      return;
    }
    lookupIp(trimmed);
  }, [inputIp, lookupIp]);

  const handleMyIpLookup = useCallback(() => {
    if (myIp) {
      setInputIp('');
      lookupIp(myIp);
    } else {
      fetchMyIp().then(ip => {
        if (ip) lookupIp(ip);
      });
    }
  }, [myIp, lookupIp, fetchMyIp]);

  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  }, [handleLookup]);

  const infoFields: { key: keyof IpInfo; label: string; icon: React.ReactNode }[] = [
    { key: 'ip', label: 'IP 地址', icon: <Wifi className="w-4 h-4" /> },
    { key: 'country', label: '国家', icon: <Globe className="w-4 h-4" /> },
    { key: 'region', label: '地区', icon: <MapPin className="w-4 h-4" /> },
    { key: 'city', label: '城市', icon: <MapPin className="w-4 h-4" /> },
    { key: 'isp', label: 'ISP', icon: <Globe className="w-4 h-4" /> },
    { key: 'org', label: '组织', icon: <Globe className="w-4 h-4" /> },
    { key: 'timezone', label: '时区', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Wifi className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">IP 地址查询</h2>
          <p className="text-sm text-on-surface-variant">查询 IP 地址的地理位置与网络信息</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-clay-sm bg-surface-container-lowest border border-outline-variant/30 shadow-clay-inset">
        <Wifi className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm text-on-surface-variant shrink-0">本机 IP</span>
        {autoLoading ? (
          <span className="text-sm text-outline">检测中...</span>
        ) : myIp ? (
          <>
            <span className="font-mono text-sm text-on-surface">{myIp}</span>
            <button
              onClick={() => handleCopy(myIp, 'myIp')}
              className="p-1 rounded-md hover:bg-surface-container transition-colors ease-spring"
              title="复制 IP"
            >
              {copiedField === 'myIp' ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-outline" />
              )}
            </button>
          </>
        ) : (
          <span className="text-sm text-error">获取失败</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputIp}
          onChange={e => setInputIp(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入 IPv4 地址，如 8.8.8.8"
          className="flex-1 min-w-[200px] px-4 py-2 text-sm rounded-clay-sm bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono shadow-clay-inset transition-colors ease-spring"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-clay-sm bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring ease-spring disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          查询
        </button>
        <button
          onClick={handleMyIpLookup}
          disabled={loading || autoLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-clay-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors ease-spring disabled:opacity-50"
        >
          <Wifi className="w-3.5 h-3.5" />
          本机
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-clay-sm bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-on-surface-variant">查询中...</span>
        </div>
      )}

      {ipInfo && !loading && (
        <div className="flex flex-col gap-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            {infoFields.map(field => {
              const value = String(ipInfo[field.key]);
              return (
                <div
                  key={field.key}
                  className="flex items-start gap-3 px-4 py-3 rounded-clay-sm bg-surface-container-lowest border border-outline-variant/30 shadow-clay transition-all ease-spring hover:shadow-clay-hover"
                >
                  <div className="mt-0.5 text-primary">{field.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-on-surface-variant mb-0.5">{field.label}</div>
                    <div className="text-sm text-on-surface font-mono break-all">{value || '-'}</div>
                  </div>
                  <button
                    onClick={() => value && handleCopy(value, field.key)}
                    className="p-1 rounded-md hover:bg-surface-container transition-colors ease-spring shrink-0"
                    title="复制"
                  >
                    {copiedField === field.key ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-outline" />
                    )}
                  </button>
                </div>
              );
            })}
            <div className="flex items-start gap-3 px-4 py-3 rounded-clay-sm bg-surface-container-lowest border border-outline-variant/30 shadow-clay transition-all ease-spring hover:shadow-clay-hover">
              <div className="mt-0.5 text-primary"><MapPin className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-on-surface-variant mb-0.5">经纬度</div>
                <div className="text-sm text-on-surface font-mono">
                  {ipInfo.lat}, {ipInfo.lon}
                </div>
              </div>
              <button
                onClick={() => handleCopy(`${ipInfo.lat}, ${ipInfo.lon}`, 'latlon')}
                className="p-1 rounded-md hover:bg-surface-container transition-colors ease-spring shrink-0"
                title="复制经纬度"
              >
                {copiedField === 'latlon' ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-outline" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
