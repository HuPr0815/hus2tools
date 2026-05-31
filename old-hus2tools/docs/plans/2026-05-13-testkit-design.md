# TestKit — 测试工程师工具箱 设计文档

## 概述

面向全角色测试团队（手工、自动化、性能、安全）的在线工具网站，提供数据转换校验和日常效率工具，即开即用，纯前端零部署。

## 设计方案：极简工具箱

侧边栏导航 + 主内容区，每个工具独立面板，点击即切换，即开即用。

## 工具清单

### 内置工具（8 个）

| 工具 | ID | 说明 |
|------|----|------|
| JSON 格式化/压缩 | json-formatter | 格式化、压缩、校验 JSON，支持树形视图 |
| 正则表达式测试器 | regex-tester | 输入正则+文本，实时高亮匹配，支持常用正则模板 |
| Base64 编解码 | base64 | 文本编解码，支持图片预览 |
| URL 编解码 | url-encode | URL 编码/解码，参数解析为键值对 |
| 时间戳转换 | timestamp | Unix 时间戳 ↔ 可读时间，支持毫秒/秒级，多时区 |
| 随机数据生成 | data-generator | 手机号、身份证、邮箱、姓名等中国特化测试数据 |
| 文本 Diff 对比 | text-diff | 双栏文本对比，差异高亮 |
| 字符统计 | char-counter | 字数/行数/字节统计，去重，大小写转换 |

### 外部链接工具（7 个）

| 工具 | 跳转目标 | 说明 |
|------|----------|------|
| SQL 格式化 | https://sqlformat.org | SQL 美化/压缩 |
| Cron 表达式生成器 | https://crontab.guru | 可视化 Cron 配置 |
| 颜色工具 | https://coolors.co | HEX/RGB/HSL 互转 |
| JSON ↔ YAML 转换 | https://json2yaml.com | 双向转换 |
| 哈希计算器 | https://emn178.github.io/online-tools/sha256.html | 多算法哈希 |
| UUID 生成器 | https://uuidgenerator.net | 批量生成 UUID |
| 密码生成器 | https://passwordsgenerator.net | 可配置密码生成 |

### MVP 优先实现（6 个内置工具）

JSON 格式化、正则测试器、Base64、时间戳、随机数据生成、Diff 对比

## 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | React 19 + Vite 6 | 用户指定，快速 HMR |
| 样式 | Tailwind CSS 4 | 原子化 CSS，工具类网站样式一致性好 |
| 状态 | Zustand | 轻量，每个工具独立 store |
| 路由 | React Router 7 | 侧边栏导航 + URL 路由，支持书签直达 |
| 代码编辑 | Monaco Editor | JSON/SQL/YAML 编辑器，语法高亮+校验 |
| 图标 | Lucide React | 轻量、风格统一 |
| 部署 | 静态托管 | 纯前端，零运维 |

## 目录结构

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, MainPanel
│   └── shared/          # CopyButton, CodeEditor, FileDropzone
├── tools/
│   ├── json-formatter/  # 每个工具一个目录
│   │   ├── index.tsx    # 工具主组件
│   │   ├── store.ts     # 工具独立状态
│   │   └── utils.ts     # 工具逻辑
│   ├── regex-tester/
│   ├── base64/
│   └── ...
├── hooks/               # 共享 hooks
├── lib/                 # 工具函数库
├── types/               # TypeScript 类型
└── App.tsx
```

## 核心设计模式

每个工具 = 独立模块，遵循统一接口：

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  icon: ReactNode;
  category: 'transform' | 'efficiency';
  component: LazyExoticComponent<typeof ToolComponent>;
  keywords: string[];
  externalUrl?: string;
}
```

- 工具通过 React.lazy() 按需加载，首屏只加载侧边栏
- 每个工具目录自包含（组件 + 状态 + 逻辑），新增工具只需加目录+注册
- 外部链接工具通过 externalUrl 字段标记，侧边栏显示 ↗ 图标

## UI/UX 设计

### 布局

- 顶部：Logo + 搜索框 + 主题切换
- 左侧：可折叠侧边栏，分类展示工具，当前工具高亮
- 右侧：工具主内容区（输入区 → 转换按钮 → 输出区）
- 底部：状态栏（当前工具说明 + 快捷键提示）

### 交互细节

- 侧边栏可折叠，折叠后只显示图标
- 全局搜索：Ctrl/Cmd + K 唤起，关键词过滤工具列表
- 一键复制：所有输出区右上角复制按钮，复制后 ✓ 反馈
- 暗色/亮色主题：默认跟随系统，可手动切换
- 输入持久化：localStorage 存储，key 格式 testkit:{toolId}:input
- 响应式：移动端侧边栏变底部 Tab 栏

### 视觉风格

- 配色：深色主题为主，主色青绿色 #10B981
- 字体：JetBrains Mono（代码区）+ Inter（UI 文本）
- 间距：紧凑信息密度
- 动效：最小化，仅复制反馈和工具切换微动效

## 数据流

```
用户输入 → 本地处理 → 输出结果
   │                        │
   └── localStorage ────────┘  (输入持久化)
```

- 所有处理纯前端完成，零数据上传
- 工具间联动：JSON 校验通过后可一键跳转到格式化工具并带入数据

## 错误处理

- 输入校验失败：输入区下方红色提示，不弹窗
- 处理异常：输出区显示友好错误信息 + 可展开原始错误
- 复制失败：降级为 document.execCommand('copy')

## 测试策略

| 层级 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Vitest | 每个工具的 utils.ts 纯函数 |
| 组件测试 | Vitest + Testing Library | 共享组件交互行为 |
| E2E 测试 | Playwright | 关键路径：工具切换、输入→输出→复制 |

## MVP 范围（v0.1）

### 必须交付

- 项目脚手架 + 布局框架
- 暗色/亮色主题切换
- 6 个内置工具：JSON 格式化、正则测试器、Base64、时间戳、随机数据生成、Diff 对比
- 2 个内置工具：URL 编解码、字符统计
- 7 个外部链接工具
- 输入持久化（localStorage）
- 一键复制
- 响应式适配

### 明确不做（YAGNI）

- 用户登录/账户系统
- 工具使用数据统计
- 工具收藏/自定义排序
- 国际化（先只做中文）
- PWA 离线支持
