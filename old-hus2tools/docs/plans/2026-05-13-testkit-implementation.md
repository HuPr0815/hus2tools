# TestKit — 测试工程师工具箱 实施计划 (v2 — 评审后)

**Goal:** 构建一个面向测试工程师的在线工具箱网站，提供数据转换校验、日常效率工具和 API 调试功能，即开即用，纯前端零部署。
**Architecture:** React SPA，侧边栏导航 + 主内容区，每个工具为独立懒加载模块，Zustand 管理状态，所有处理纯前端完成（API 调试工具除外，需发 HTTP 请求）。
**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 4, Zustand, React Router 7, CodeMirror 6, Lucide React, Vitest, Playwright

---

## 评审变更记录

| 来源 | 变更 |
|------|------|
| CEO | Monaco Editor → CodeMirror 6（轻量 200KB） |
| CEO | JSON↔YAML、哈希计算器改为内置 |
| CEO | 新增 API 调试工具（杀手级功能） |
| Eng | ToolDefinition 拆分为 InternalTool / ExternalTool |
| Eng | 添加 Error Boundary 包裹懒加载工具 |
| Eng | usePersistInput 提前到布局完成后 |
| Eng | 创建 tools/index.ts 集中注册 |
| Eng | localStorage 大小检查 + try-catch |
| Eng | 补充边界用例测试 |
| Design | 间距系统 4px 基数 token |
| Design | 完整色彩变量系统 |
| Design | 排版层级定义 |
| Design | 空状态占位提示 |
| DX | 粘贴即处理（智能自动识别） |
| DX | 错误提示加修复建议 |

---

## 内置工具清单（11 个）

| 工具 | ID | 分类 |
|------|----|------|
| JSON 格式化/压缩 | json-formatter | transform |
| 正则表达式测试器 | regex-tester | transform |
| Base64 编解码 | base64 | transform |
| URL 编解码 | url-encode | transform |
| 时间戳转换 | timestamp | transform |
| 随机数据生成 | data-generator | efficiency |
| 文本 Diff 对比 | text-diff | efficiency |
| 字符统计 | char-counter | efficiency |
| JSON↔YAML 转换 | json-yaml | transform |
| 哈希计算器 | hash-calculator | transform |
| API 调试工具 | api-debugger | efficiency |

## 外部链接工具（5 个）

| 工具 | 跳转目标 |
|------|----------|
| SQL 格式化 | https://sqlformat.org |
| Cron 表达式生成器 | https://crontab.guru |
| 颜色工具 | https://coolors.co |
| UUID 生成器 | https://uuidgenerator.net |
| 密码生成器 | https://passwordsgenerator.net |

---

## Task 1: 项目脚手架与依赖安装

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/index.css` (含设计 token)

**Step 1: 初始化 Vite + React + TypeScript 项目**
```bash
npm create vite@latest . -- --template react-ts
```

**Step 2: 安装核心依赖**
```bash
npm install react-router-dom zustand @codemirror/lang-json @codemirror/lang-yaml @codemirror/theme-one-dark lucide-react diff
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/diff
```

**Step 3: 配置 Tailwind CSS 4 + 设计 token**
- `vite.config.ts` 添加 tailwindcss 插件
- `src/index.css` 添加设计 token：

```css
@import "tailwindcss";

@theme {
  --color-primary: #10B981;
  --color-primary-hover: #059669;
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-bg-tertiary: #334155;
  --color-border: #475569;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-error: #EF4444;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}

:root {
  --spacing-unit: 4px;
}

.dark {
  color-scheme: dark;
}

.light {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8FAFC;
  --color-bg-tertiary: #E2E8F0;
  --color-border: #CBD5E1;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
}
```

**Step 4: 配置 Vitest**
- `vite.config.ts` 添加 test 配置（jsdom 环境）
- 创建 `src/setupTests.ts`

**Step 5: 验证项目启动**
```bash
npm run dev && npm run test
```

**Step 6: Commit**
```bash
git init && git add -A && git commit -m "feat: scaffold project with Tailwind, CodeMirror, design tokens"
```

---

## Task 2: 类型定义与工具注册系统

**Files:**
- Create: `src/types/tool.ts`
- Create: `src/lib/tool-registry.ts`
- Test: `src/lib/tool-registry.test.ts`

**Step 1: 编写失败测试** — register, getTool, getAllTools, getByCategory, clearTools, searchTools

**Step 2: 运行测试确认失败**

**Step 3: 编写类型定义**
```typescript
// src/types/tool.ts
import type { ReactNode, LazyExoticComponent, ComponentType } from 'react';

export type ToolCategory = 'transform' | 'efficiency';

export interface InternalTool {
  type: 'internal';
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  category: ToolCategory;
  component: LazyExoticComponent<ComponentType>;
  keywords: string[];
  placeholder?: string;
}

export interface ExternalTool {
  type: 'external';
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  category: ToolCategory;
  externalUrl: string;
  keywords: string[];
}

export type ToolDefinition = InternalTool | ExternalTool;
```

**Step 4: 编写工具注册系统** — Map 存储，支持 searchTools(keywords)

**Step 5: 运行测试确认通过**

**Step 6: Commit**

---

## Task 3: 主题系统

**Files:**
- Create: `src/hooks/useTheme.ts`
- Test: `src/hooks/useTheme.test.ts`

TDD: Zustand store → localStorage 持久化 → system preference 监听 → document class 更新

---

## Task 4: 共享组件 — CopyButton

**Files:**
- Create: `src/components/shared/CopyButton.tsx`
- Test: `src/components/shared/CopyButton.test.tsx`

TDD: 点击复制 → ✓ 反馈 → 2 秒恢复 → execCommand 降级

---

## Task 5: 共享组件 — CodeEditor

**Files:**
- Create: `src/components/shared/CodeEditor.tsx`
- Test: `src/components/shared/CodeEditor.test.tsx`

封装 CodeMirror 6，支持 language / theme / value / onChange

---

## Task 6: 输入持久化 Hook

**Files:**
- Create: `src/hooks/usePersistInput.ts`
- Test: `src/hooks/usePersistInput.test.ts`

TDD: localStorage 读写 → 防抖 300ms → 大小检查（>4MB 跳过）→ try-catch

---

## Task 7: Error Boundary

**Files:**
- Create: `src/components/shared/ToolErrorBoundary.tsx`
- Test: `src/components/shared/ToolErrorBoundary.test.tsx`

懒加载工具加载失败时显示友好错误页面 + 重试按钮

---

## Task 8: Sidebar 组件

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Test: `src/components/layout/Sidebar.test.tsx`

分类展示 → 当前高亮 → 外链 ↗ → 可折叠 → 搜索过滤

---

## Task 9: Header 组件

**Files:**
- Create: `src/components/layout/Header.tsx`
- Test: `src/components/layout/Header.test.tsx`

Logo → 搜索框 → 主题切换

---

## Task 10: 路由与 App 布局

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/tools/index.ts` (集中注册)
- Modify: `src/main.tsx`

React Router → lazy load → Error Boundary 包裹 → 404 → tools/index.ts 注册所有工具

---

## Task 11-21: 内置工具（每个工具 TDD 流程相同）

每个工具遵循：
1. 编写 utils.ts 失败测试（含边界用例：空输入、超大输入、Unicode、XSS）
2. 运行测试确认失败
3. 编写 utils.ts 实现
4. 运行测试确认通过
5. 编写组件（含空状态占位、粘贴即处理、错误修复建议）
6. 注册到 tools/index.ts
7. Commit

### Task 11: JSON 格式化 — formatJson, compressJson, validateJson
### Task 12: 正则测试器 — matchRegex, validatePattern, 常用模板
### Task 13: Base64 编解码 — encode, decode, UTF-8 处理
### Task 14: 时间戳转换 — 自动检测秒/毫秒, 多时区, 当前时间戳
### Task 15: 随机数据生成 — 手机号, 身份证, 邮箱, 姓名, 批量
### Task 16: Diff 对比 — diff 算法, 行级对比, 统一/分离视图
### Task 17: URL 编解码 — encode, decode, 参数解析
### Task 18: 字符统计 — 计数, 去重, 大小写
### Task 19: JSON↔YAML 转换 — 双向转换, 实时预览
### Task 20: 哈希计算器 — MD5/SHA1/SHA256/SHA512
### Task 21: API 调试工具 — HTTP 请求构造, Headers/Body 编辑, 响应展示

---

## Task 22: 全局搜索

SearchDialog 组件 → Ctrl+K → 关键词过滤 → 键盘导航

## Task 23: 响应式适配

MobileTabBar → AppLayout 响应式 → 断点 md:768px

## Task 24: E2E 测试

Playwright → 工具导航 → JSON 格式化流程 → API 调试流程

## Task 25: 最终集成

外部链接注册 → 全量测试 → lint → build
