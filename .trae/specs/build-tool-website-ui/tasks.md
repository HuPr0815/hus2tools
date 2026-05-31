# Tasks

- [x] Task 1: 项目初始化与构建配置
  - [x] SubTask 1.1: 使用 Vite 创建 React + TypeScript 项目
  - [x] SubTask 1.2: 安装所有依赖
  - [x] SubTask 1.3: 配置 Tailwind CSS v3 + PostCSS + 路径别名 @/
  - [x] SubTask 1.4: 配置 vite.config.ts
  - [x] SubTask 1.5: 配置 tsconfig.json 路径映射
  - [x] SubTask 1.6: 验证 npm run dev 可正常启动

- [x] Task 2: Claymorphism 设计系统实现
  - [x] SubTask 2.1: 创建 index.css，定义所有 CSS 变量
  - [x] SubTask 2.2: 配置 tailwind.config.js
  - [x] SubTask 2.3: 实现 4 种 Clay 阴影类 + 5 种彩色阴影
  - [x] SubTask 2.4: 实现 12 种关键帧动画
  - [x] SubTask 2.5: 实现全局样式

- [x] Task 3: 类型定义与工具注册系统
  - [x] SubTask 3.1: 创建 src/types/tool.ts
  - [x] SubTask 3.2: 创建 src/lib/tool-registry.ts
  - [x] SubTask 3.3: 创建 src/lib/utils.ts

- [x] Task 4: 自定义 Hooks
  - [x] SubTask 4.1: 创建 src/hooks/useTheme.ts
  - [x] SubTask 4.2: 创建 src/hooks/useFavorites.ts
  - [x] SubTask 4.3: 创建 src/hooks/useRecentTools.ts
  - [x] SubTask 4.4: 创建 src/hooks/usePersistInput.ts

- [x] Task 5: 共享组件
  - [x] SubTask 5.1: 创建 CodeEditor.tsx
  - [x] SubTask 5.2: 创建 CopyButton.tsx
  - [x] SubTask 5.3: 创建 ToolErrorBoundary.tsx

- [x] Task 6: 布局组件（1:1参照模板）
  - [x] SubTask 6.1: 创建 AppLayout.tsx
  - [x] SubTask 6.2: 创建 Sidebar.tsx
  - [x] SubTask 6.3: 创建 Header.tsx
  - [x] SubTask 6.4: 创建 SearchDialog.tsx
  - [x] SubTask 6.5: 创建 HomePage.tsx

- [x] Task 7: 格式化与校验类工具 UI（6 个）
  - [x] json-formatter, json-path, regex-tester, sql-formatter, jwt-decoder, cron-generator

- [x] Task 8: 编码与解码类工具 UI（6 个）
  - [x] base64, url-encode, html-entities, unicode-converter, hash-calculator, text-encrypt

- [x] Task 9: 数据转换类工具 UI（9 个）
  - [x] json-yaml, timestamp, number-base, color-picker, css-gradient, image-crop, watermark, ico-generator, image-converter

- [x] Task 10: 数据生成类工具 UI（4 个）
  - [x] data-generator, uuid-generator, password-generator, lorem-generator

- [x] Task 11: 文本处理类工具 UI（3 个）
  - [x] text-diff, char-counter, markdown-preview

- [x] Task 12: 网络与API类工具 UI（3 个）
  - [x] api-debugger, http-status, ip-lookup

- [x] Task 13: 办公工具类 UI（8 个，均为外部链接）
  - [x] 注册 8 个外部工具到 tool-registry

- [x] Task 14: 外部工具类 UI（12 个，均为外部链接）
  - [x] 注册 12 个外部工具到 tool-registry

- [x] Task 15: 工具注册汇总与路由集成
  - [x] SubTask 15.1: 创建 src/tools/index.tsx
  - [x] SubTask 15.2: 创建 src/App.tsx
  - [x] SubTask 15.3: 创建 src/main.tsx
  - [x] SubTask 15.4: 创建 index.html
  - [x] SubTask 15.5: TypeScript 编译通过，项目可正常启动

# Task Dependencies
- Task 1 → Task 2
- Task 2 → Task 3
- Task 3 → Task 4, 5, 6
- Task 4 → Task 6
- Task 5 → Task 7-12
- Task 6 → Task 7-12
- Task 3 + 5 + 6 → Task 7-14
- Task 7-14 → Task 15
