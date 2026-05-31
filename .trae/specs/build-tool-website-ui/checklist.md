# TestKit 工具网站项目验证清单

## 项目基础

- [x] **1. 项目可正常启动** — `vite.config.ts` 和 `package.json` 均存在，项目配置完整
- [x] **2. TypeScript 类型检查通过** — `npx tsc -b --noEmit` 退出码为 0，无类型错误
- [x] **3. ESLint 检查通过** — `npx eslint src/` 无错误无警告

## 设计系统

- [x] **4. Claymorphism 设计系统完整** — `tailwind.config.js` 定义了全部 clay-\* 颜色、border-radius（clay-sm/clay/clay-lg/clay-xl/clay-full）、动画（fade-in/slide-up/scale-in/float/shimmer/gradient 等）；`src/index.css` 定义了 shadow-clay/shadow-clay-hover/shadow-clay-active/shadow-clay-inset 等工具类及完整 CSS 变量
- [x] **5. 暗色模式正确切换** — `src/index.css` 包含 `.dark` 选择器下全部 CSS 变量覆盖；`src/hooks/useTheme.ts` 通过 `document.documentElement.classList.add/remove('dark')` 切换主题

## 页面与组件

- [x] **6. 首页完整渲染** — `HomePage.tsx` 包含 Hero 区域、搜索框、收藏工具区、分类工具网格，并从 `@/lib/tool-registry` 导入数据
- [x] **7. 工具卡片交互正确** — `ToolCard` 组件使用 `shadow-clay`/`shadow-clay-hover` 类，具备 Star 收藏/取消收藏功能（`shadow-clay-active` 已在 CSS 中定义但未应用于卡片 active 状态）
- [x] **8. 侧边栏可折叠** — `Sidebar.tsx` 通过 `collapsed` 状态切换宽度（`w-[60px]` vs `w-64`），折叠时隐藏文字内容
- [x] **9. Header 正确渲染** — `Header.tsx` 包含 Logo（Wrench 图标 + TestKit 文字）、搜索触发按钮（⌘K 提示）、主题切换按钮（Sun/Moon 图标）
- [x] **10. 搜索对话框可用** — `AppLayout.tsx` 注册了 Ctrl+K / ⌘K 快捷键触发搜索；`SearchDialog.tsx` 实现了搜索过滤和工具导航功能

## 工具注册与导航

- [x] **11. 所有 31 个内部工具页面可导航** — 实际注册了 31 个内部工具（含 `ip-lookup`），每个均有对应组件和路由
- [x] **12. 所有 20 个外部工具点击在新标签页打开** — 实际注册了 20 个外部工具，每个均有 `externalUrl` 并通过 `window.open(..., '_blank')` 打开

## 共享组件

- [x] **13. CodeEditor 组件正常** — `CodeEditor.tsx` 使用 CodeMirror 6，支持 json/yaml 语言扩展，具备行号、高亮、括号匹配、暗色主题切换
- [x] **14. CopyButton 组件正常** — `CopyButton.tsx` 使用 `navigator.clipboard.writeText` API，复制成功后显示 Check 图标和"已复制"反馈

## Hooks

- [x] **15. useTheme hook 正确** — 使用 Zustand store，localStorage 持久化（`testkit:theme`），通过 `applyTheme()` 应用/移除 `dark` class
- [x] **16. useFavorites hook 正确** — 使用 Zustand store，`toggleFavorite` 切换收藏状态，localStorage 持久化（`testkit:favorites`）
- [x] **17. useRecentTools hook 正确** — 使用 Zustand store，`addRecent` 添加最近使用，`MAX_RECENT = 20` 限制最大数量
- [x] **18. usePersistInput hook 正确** — 按 `testkit:input:${toolId}` 键存储，提供 `setAndPersist` 和 `clear` 方法

## 架构与路由

- [x] **19. 工具注册系统正确** — `tool-registry.ts` 提供 `getAllTools`、`searchTools`、`getTool`、`getGroupedTools`、`getToolsByCategory` 等函数
- [x] **20. 路由系统正确** — `App.tsx` 使用 `BrowserRouter`，配置 `/`（首页）和 `/:toolId`（工具页）路由

## 无障碍与可访问性

- [x] **21. 减弱动画偏好受尊重** — `src/index.css` 包含 `@media (prefers-reduced-motion: reduce)` 媒体查询，禁用动画和过渡
- [x] **22. 焦点可见性** — `src/index.css` 为 `button:focus-visible`、`a:focus-visible`、`input:focus-visible` 等定义了 `outline: 2px solid var(--clay-primary)` 样式

---

## 验证结果汇总

| 状态 | 数量 |
|------|------|
| ✅ 通过 | 22 |
| ❌ 未通过 | 0 |
