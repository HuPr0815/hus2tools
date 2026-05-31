import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type HttpStatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'all';

interface HttpStatusEntry {
  code: number;
  name: string;
  description: string;
  useCase: string;
  category: HttpStatusCategory;
}

const STATUS_CODES: HttpStatusEntry[] = [
  { code: 100, name: 'Continue', description: '继续发送请求', useCase: '大文件上传时分段发送，服务器确认可继续', category: '1xx' },
  { code: 101, name: 'Switching Protocols', description: '切换协议', useCase: 'WebSocket 握手时从 HTTP 升级到 WS 协议', category: '1xx' },
  { code: 102, name: 'Processing', description: '处理中', useCase: 'WebDAV 请求耗时较长时，告知客户端服务器正在处理', category: '1xx' },

  { code: 200, name: 'OK', description: '请求成功', useCase: 'GET/POST 请求正常返回数据', category: '2xx' },
  { code: 201, name: 'Created', description: '已创建', useCase: 'POST 请求成功创建新资源，如注册用户、新增订单', category: '2xx' },
  { code: 202, name: 'Accepted', description: '已接受', useCase: '异步任务已接收但未处理完成，如批量导入、邮件发送', category: '2xx' },
  { code: 203, name: 'Non-Authoritative Information', description: '非权威信息', useCase: '代理服务器修改了原始响应后返回', category: '2xx' },
  { code: 204, name: 'No Content', description: '无内容', useCase: 'DELETE 请求成功但无需返回内容，或 PUT 更新成功', category: '2xx' },
  { code: 205, name: 'Reset Content', description: '重置内容', useCase: '告知浏览器重置表单输入，如清空表单字段', category: '2xx' },
  { code: 206, name: 'Partial Content', description: '部分内容', useCase: '断点续传、大文件分片下载时返回部分数据', category: '2xx' },
  { code: 207, name: 'Multi-Status', description: '多状态', useCase: 'WebDAV 批量操作时，每个操作返回各自状态', category: '2xx' },
  { code: 208, name: 'Already Reported', description: '已报告', useCase: 'WebDAV 中避免重复枚举已报告的绑定', category: '2xx' },
  { code: 226, name: 'IM Used', description: 'IM 已使用', useCase: '服务器对实例操作已执行并返回 delta 编码响应', category: '2xx' },

  { code: 300, name: 'Multiple Choices', description: '多种选择', useCase: '请求的资源有多个表示形式，需用户或客户端选择', category: '3xx' },
  { code: 301, name: 'Moved Permanently', description: '永久重定向', useCase: '网站域名更换、HTTP 迁移到 HTTPS，旧 URL 永久指向新地址', category: '3xx' },
  { code: 302, name: 'Found', description: '临时重定向', useCase: '未登录用户访问需认证页面时重定向到登录页', category: '3xx' },
  { code: 303, name: 'See Other', description: '参见其他', useCase: 'POST 提交后重定向到结果页面，强制使用 GET 访问', category: '3xx' },
  { code: 304, name: 'Not Modified', description: '未修改', useCase: '浏览器缓存有效，服务器告知客户端使用本地缓存', category: '3xx' },
  { code: 307, name: 'Temporary Redirect', description: '临时重定向', useCase: '与 302 类似但保证请求方法和请求体不变', category: '3xx' },
  { code: 308, name: 'Permanent Redirect', description: '永久重定向', useCase: '与 301 类似但保证请求方法和请求体不变', category: '3xx' },

  { code: 400, name: 'Bad Request', description: '错误请求', useCase: '请求参数格式错误、必填字段缺失、JSON 解析失败', category: '4xx' },
  { code: 401, name: 'Unauthorized', description: '未授权', useCase: '未携带 Token 或 Token 过期，需重新登录认证', category: '4xx' },
  { code: 402, name: 'Payment Required', description: '需要付款', useCase: '付费 API 未订阅或余额不足（保留状态码）', category: '4xx' },
  { code: 403, name: 'Forbidden', description: '禁止访问', useCase: '已认证但权限不足，如普通用户访问管理员接口', category: '4xx' },
  { code: 404, name: 'Not Found', description: '未找到', useCase: '请求的资源不存在，如错误的 API 路径或已删除的数据', category: '4xx' },
  { code: 405, name: 'Method Not Allowed', description: '方法不允许', useCase: '对只支持 GET 的接口发送了 POST 请求', category: '4xx' },
  { code: 406, name: 'Not Acceptable', description: '不可接受', useCase: '服务器无法返回 Accept 头指定的内容类型', category: '4xx' },
  { code: 407, name: 'Proxy Authentication Required', description: '需要代理认证', useCase: '通过代理服务器访问需先完成代理身份验证', category: '4xx' },
  { code: 408, name: 'Request Timeout', description: '请求超时', useCase: '客户端发送请求过慢，服务器关闭连接', category: '4xx' },
  { code: 409, name: 'Conflict', description: '冲突', useCase: '资源状态冲突，如重复注册、乐观锁版本冲突', category: '4xx' },
  { code: 410, name: 'Gone', description: '已删除', useCase: '资源已被永久删除且无转发地址，比 404 更明确', category: '4xx' },
  { code: 411, name: 'Length Required', description: '需要内容长度', useCase: '服务器要求请求包含 Content-Length 头', category: '4xx' },
  { code: 412, name: 'Precondition Failed', description: '前提条件失败', useCase: 'If-Match/If-Unmodified-Since 条件不满足', category: '4xx' },
  { code: 413, name: 'Payload Too Large', description: '请求体过大', useCase: '上传文件超过服务器限制大小', category: '4xx' },
  { code: 414, name: 'URI Too Long', description: 'URI 过长', useCase: 'GET 请求查询参数过多导致 URL 超长', category: '4xx' },
  { code: 415, name: 'Unsupported Media Type', description: '不支持的媒体类型', useCase: '请求 Content-Type 不被支持，如发送 XML 但服务器只接受 JSON', category: '4xx' },
  { code: 416, name: 'Range Not Satisfiable', description: '范围不满足', useCase: '请求的文件范围超出实际大小，如 Range 头越界', category: '4xx' },
  { code: 417, name: 'Expectation Failed', description: '期望失败', useCase: '服务器无法满足 Expect 请求头的要求', category: '4xx' },
  { code: 418, name: "I'm a Teapot", description: '我是茶壶', useCase: 'HTCPCP 协议彩蛋，拒绝用茶壶煮咖啡', category: '4xx' },
  { code: 421, name: 'Misdirected Request', description: '错误定向的请求', useCase: 'HTTP/2 中请求被发送到无法产生响应的服务器', category: '4xx' },
  { code: 422, name: 'Unprocessable Entity', description: '无法处理的实体', useCase: '请求格式正确但语义错误，如验证规则不通过', category: '4xx' },
  { code: 423, name: 'Locked', description: '已锁定', useCase: 'WebDAV 中资源被锁定无法操作', category: '4xx' },
  { code: 424, name: 'Failed Dependency', description: '依赖失败', useCase: 'WebDAV 中因前置请求失败导致当前请求失败', category: '4xx' },
  { code: 425, name: 'Too Early', description: '太早', useCase: 'TLS 1.3 中服务器不愿冒险处理可能被重放的数据', category: '4xx' },
  { code: 426, name: 'Upgrade Required', description: '需要升级', useCase: '服务器要求客户端升级到 TLS 等更安全的协议', category: '4xx' },
  { code: 428, name: 'Precondition Required', description: '需要前提条件', useCase: '服务器要求请求包含 If-Match 等条件头防止丢失更新', category: '4xx' },
  { code: 429, name: 'Too Many Requests', description: '请求过多', useCase: '触发 API 限流/频率限制，需等待后重试', category: '4xx' },
  { code: 431, name: 'Request Header Fields Too Large', description: '请求头字段过大', useCase: '请求头过大，如 Cookie 过长导致服务器拒绝', category: '4xx' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: '因法律原因不可用', useCase: '因政府审查或法律要求而屏蔽的内容', category: '4xx' },

  { code: 500, name: 'Internal Server Error', description: '服务器内部错误', useCase: '后端代码异常、未捕获的错误、空指针等', category: '5xx' },
  { code: 501, name: 'Not Implemented', description: '未实现', useCase: '服务器不支持请求的方法，如自定义 HTTP 方法', category: '5xx' },
  { code: 502, name: 'Bad Gateway', description: '网关错误', useCase: '反向代理/网关从上游服务器收到无效响应', category: '5xx' },
  { code: 503, name: 'Service Unavailable', description: '服务不可用', useCase: '服务器过载或维护中，通常配合 Retry-After 头', category: '5xx' },
  { code: 504, name: 'Gateway Timeout', description: '网关超时', useCase: '反向代理等待上游服务器响应超时', category: '5xx' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'HTTP 版本不支持', useCase: '服务器不支持请求中使用的 HTTP 协议版本', category: '5xx' },
  { code: 506, name: 'Variant Also Negotiates', description: '变体也协商', useCase: '透明内容协商配置错误导致循环协商', category: '5xx' },
  { code: 507, name: 'Insufficient Storage', description: '存储不足', useCase: 'WebDAV 服务器存储空间不足无法完成请求', category: '5xx' },
  { code: 508, name: 'Loop Detected', description: '检测到循环', useCase: 'WebDAV 中检测到无限循环引用', category: '5xx' },
  { code: 510, name: 'Not Extended', description: '未扩展', useCase: '服务器要求请求包含扩展 HTTP 头', category: '5xx' },
  { code: 511, name: 'Network Authentication Required', description: '需要网络认证', useCase: '公共 WiFi 需要先登录认证才能访问网络', category: '5xx' },
];

const CATEGORY_TABS: { key: HttpStatusCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: '1xx', label: '1xx 信息' },
  { key: '2xx', label: '2xx 成功' },
  { key: '3xx', label: '3xx 重定向' },
  { key: '4xx', label: '4xx 客户端错误' },
  { key: '5xx', label: '5xx 服务端错误' },
];

const CATEGORY_COLORS: Record<HttpStatusCategory, { bg: string; border: string; text: string; badge: string }> = {
  '1xx': { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', badge: 'bg-gray-500/20 text-gray-400' },
  '2xx': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  '3xx': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
  '4xx': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
  '5xx': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  'all': { bg: '', border: '', text: '', badge: '' },
};

export default function HttpStatus() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<HttpStatusCategory>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    return STATUS_CODES.filter(entry => {
      const matchCategory = category === 'all' || entry.category === category;
      if (!matchCategory) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        String(entry.code).includes(q) ||
        entry.name.toLowerCase().includes(q) ||
        entry.description.includes(q) ||
        entry.useCase.includes(q)
      );
    });
  }, [search, category]);

  const toggleExpand = useCallback((code: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">HTTP 状态码查询</h2>
          <p className="text-sm text-text-secondary">快速查询 HTTP 状态码含义及常见场景</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索状态码或描述..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-clay-sm bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors ease-spring"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-clay-sm transition-colors ease-spring',
              category === tab.key
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-text-muted text-sm">
            未找到匹配的状态码
          </div>
        )}
        {filtered.map(entry => {
          const colors = CATEGORY_COLORS[entry.category];
          const isExpanded = expanded.has(entry.code);
          return (
            <div
              key={entry.code}
              className={cn(
                'rounded-clay-sm border bg-bg-secondary shadow-clay transition-all ease-spring cursor-pointer',
                colors.border,
                isExpanded && 'ring-1 ring-primary/30'
              )}
              onClick={() => toggleExpand(entry.code)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[3.5rem] px-2 py-1 text-sm font-mono font-bold rounded-md',
                    colors.badge
                  )}
                >
                  {entry.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', colors.text)}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary truncate block">
                    {entry.description}
                  </span>
                </div>
                <div className={cn('transition-transform ease-spring', colors.text)}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className={cn('px-4 pb-3 pt-0 border-t', colors.border)}>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-text-muted shrink-0 w-14">状态码</span>
                      <span className={cn('text-sm font-mono font-bold', colors.text)}>{entry.code}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-text-muted shrink-0 w-14">英文名</span>
                      <span className="text-sm text-text-primary">{entry.name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-text-muted shrink-0 w-14">中文描述</span>
                      <span className="text-sm text-text-primary">{entry.description}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-text-muted shrink-0 w-14">常见场景</span>
                      <span className="text-sm text-text-secondary">{entry.useCase}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-text-muted text-center">
        共 {filtered.length} 个状态码{category !== 'all' ? `（${CATEGORY_TABS.find(t => t.key === category)?.label}）` : ''}
      </div>
    </div>
  );
}
