# TestKit 主题风格系统文档

> 本文档完整描述 TestKit 工具网站的视觉设计系统，涵盖色彩、排版、阴影、动画、交互特效及代码规范。
>
> **设计来源**：Figma 设计稿 `xendEWl9gAxiTHVKtv1iyG`，所有阴影/圆角/间距参数均从 Figma API 提取并校准。

---

## 1. 设计风格概述

TestKit 采用 **Claymorphism（粘土拟物）** 风格作为核心视觉语言，融合了以下设计理念：

| 特征 | 描述 |
|------|------|
| **柔和圆角** | 大圆角（16px–50px）营造柔软、可触碰的视觉感受 |
| **凸起阴影** | 外凸 + 内凹双层阴影模拟粘土/橡皮泥的立体质感 |
| **低饱和色系** | 粉/蓝/紫/绿/黄五色体系，饱和度适中，温暖柔和 |
| **渐变背景** | 135° 对角线渐变，从浅色到主色，增加深度 |
| **弹性动画** | `cubic-bezier(0.34, 1.56, 0.64, 1)` 弹簧曲线，活泼自然 |
| **浮动装饰** | 背景模糊光斑 + 几何图形，营造梦幻氛围 |
| **暗色适配** | 完整的 dark mode 变量映射，暗色下降低亮度、提升对比度 |

---

## 2. 色彩系统

### 2.1 Clay 五色体系

项目以 5 种 Clay 颜色为核心，每种颜色包含 4–5 个明度层级：

```
┌─────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ 色系     │ light        │ main         │ medium       │ dark         │ deep         │
├─────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 🩷 Pink  │ #ffc8dd      │ #ffb3d9      │ #ff99ac      │ #ff8fb3      │ #ff6a88      │
│ 🩵 Blue  │ #cae9ff      │ #a2d2ff      │ #7eb8e0      │ #5a9fd4      │ —            │
│ 💜 Purple│ #e4c1f9      │ #d4a5f3      │ #c48ee8      │ #b377dc      │ —            │
│ 💚 Green │ #d8f3dc      │ #b7e4c7      │ #95d5b2      │ #74c69d      │ —            │
│ 💛 Yellow│ #fff4bd      │ #ffe6a7      │ #ffd98e      │ #ffcc77      │ —            │
└─────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**暗色模式映射：**

```
┌─────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ 色系     │ light        │ main         │ medium       │ dark         │ deep         │
├─────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 🩷 Pink  │ #4a1e3a      │ #6b2d54      │ #8b3d6e      │ #a8537f      │ #c46a99      │
│ 🩵 Blue  │ #1a3050      │ #264a6e      │ #356590      │ #4a85b8      │ —            │
│ 💜 Purple│ #352248      │ #4a3363      │ #634580      │ #7e5ca0      │ —            │
│ 💚 Green │ #1a3025      │ #2a5440      │ #3d7a5a      │ #52a07a      │ —            │
│ 💛 Yellow│ #352a18      │ #504228      │ #6e5c38      │ #8c764a      │ —            │
└─────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**Tailwind 用法：**
```html
<div className="bg-clay-pink-light text-clay-pink-dark" />
<div className="bg-clay-blue shadow-clay-blue" />
<div className="from-clay-green-light to-clay-green bg-gradient-to-br" />
```

### 2.2 语义色彩

```
┌──────────────┬──────────────┬──────────────────────────────────────────┐
│ Token        │ 亮色         │ 暗色                                     │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ primary      │ #74c69d      │ #52a07a                                  │
│ primary-hover│ #52b788      │ #68b890                                  │
│ primary-light│ rgba(116,198,157,0.2) │ rgba(82,160,122,0.2)              │
│ secondary    │ #a2d2ff      │ #4a85b8                                  │
│ cta          │ #ff6a88      │ #c46a99                                  │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ bg-primary   │ #ffecd2      │ #14142a  (奶油色底 / 深紫黑底)            │
│ bg-secondary │ #ffffff      │ #1c1c34  (白底 / 深紫底)                  │
│ bg-tertiary  │ #f8f0e3      │ #252540  (浅米色 / 中紫底)                │
│ bg-elevated  │ #ffffff      │ #202038  (浮层白 / 浮层深紫)               │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ border       │ rgba(0,0,0,0.06) │ rgba(255,255,255,0.08)              │
│ border-hover │ rgba(0,0,0,0.10) │ rgba(255,255,255,0.14)             │
│ border-focus │ #74c69d      │ #52a07a                                  │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ text-primary │ #495057      │ #e8e6f5                                  │
│ text-secondary│ #6c757d     │ #b8b6cc                                  │
│ text-muted   │ #adb5bd      │ rgba(255,255,255,0.40)                   │
│ text-inverse │ #ffffff      │ #14142a                                  │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ surface      │ rgba(255,255,255,0.7) │ rgba(255,255,255,0.05)          │
│ surface-hover│ rgba(255,255,255,0.9) │ rgba(255,255,255,0.09)         │
├──────────────┼──────────────┼──────────────────────────────────────────┤
│ error        │ #ff6a88      │ #c46a99                                  │
│ success      │ #74c69d      │ #52a07a                                  │
│ warning      │ #ffcc77      │ #8c764a                                  │
│ info         │ #5a9fd4      │ #4a85b8                                  │
└──────────────┴──────────────┴──────────────────────────────────────────┘
```

**Tailwind 用法：**
```html
<button className="bg-primary hover:bg-primary-hover text-white" />
<div className="bg-bg-secondary border border-border text-text-primary" />
<span className="text-text-muted" />信息提示</span>
<input className="focus:border-border-focus" />
```

### 2.3 首页渐变

```css
/* 亮色 */
.home-gradient {
  background: linear-gradient(135deg,
    #fff4bd 0%, #ffc8dd 20%, #e4c1f9 40%,
    #cae9ff 60%, #d8f3dc 80%, #fff4bd 100%);
}

/* 暗色 */
.dark .home-gradient {
  background: linear-gradient(135deg,
    #352a18 0%, #4a1e3a 20%, #352248 40%,
    #1a3050 60%, #1a3025 80%, #352a18 100%);
}
```

---

## 3. 排版系统

### 3.1 字体栈

```js
fontFamily: {
  sans: ['Inter', 'Nunito', 'Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
}
```

- **正文**：Inter（清晰、中性、高可读性）
- **标题**：Inter Bold（与正文统一，通过字重区分层级）
- **代码**：JetBrains Mono（等宽、连字支持）

### 3.2 字号规范

```
┌──────────────┬────────┬──────────────┐
│ 用途          │ 大小    │ Tailwind     │
├──────────────┼────────┼──────────────┤
│ 页面大标题    │ 48px   │ text-5xl     │
│ 工具标题      │ 18px   │ text-lg      │
│ 正文          │ 14px   │ text-sm      │
│ 辅助文字      │ 12px   │ text-xs      │
│ 微型标签      │ 10px   │ text-[10px]  │
│ 代码          │ 13px   │ text-[13px]  │
└──────────────┴────────┴──────────────┘
```

### 3.3 文本颜色层级

```html
<span className="text-text-primary">主要文字</span>
<span className="text-text-secondary">次要文字</span>
<span className="text-text-muted">弱化文字</span>
<span className="text-text-inverse">反色文字</span>
```

---

## 4. 圆角系统

```
┌──────────────┬────────┬──────────────────────┐
│ Token        │ 值      │ 用途                  │
├──────────────┼────────┼──────────────────────┤
│ rounded-md   │ 6px    │ 小型输入框、下拉框     │
│ rounded-lg   │ 8px    │ 中型按钮、徽章         │
│ rounded-xl   │ 12px   │ 工具面板、卡片         │
│ rounded-2xl  │ 16px   │ 大面板               │
│ rounded-clay-sm│ 16px  │ Clay 小圆角           │
│ rounded-clay │ 24px   │ Clay 标准圆角（按钮）  │
│ rounded-clay-lg│ 32px │ Clay 大圆角（卡片）    │
│ rounded-clay-xl│ 48px │ Clay 超大圆角         │
│ rounded-clay-full│ 50px│ Clay 全圆角（搜索栏）  │
└──────────────┴────────┴──────────────────────┘
```

---

## 5. 阴影系统（Claymorphism 核心 — Figma 校准）

Clay 阴影由 4 层 `box-shadow` 叠加而成，模拟粘土的凸起/凹陷效果。
所有参数均从 Figma 设计稿节点 `1:23`（Overlay+Shadow）提取校准。

### 5.1 阴影变量

```css
/* 亮色 — Figma 节点 1:23 提取 */
--shadow-clay-outer-light: rgba(255, 255, 255, 0.8);   /* 左上外高光 */
--shadow-clay-outer-dark: rgba(0, 0, 0, 0.08);         /* 右下外阴影 */
--shadow-clay-inner-light: rgba(255, 255, 255, 0.8);   /* 右下内高光 */
--shadow-clay-inner-dark: rgba(0, 0, 0, 0.05);          /* 左上内阴影 */
--shadow-clay-inset-light: rgba(255, 255, 255, 0.6);    /* 内凹高光 */
--shadow-clay-inset-dark: rgba(0, 0, 0, 0.06);          /* 内凹阴影 */

/* 暗色 */
--shadow-clay-outer-light: rgba(255, 255, 255, 0.05);
--shadow-clay-outer-dark: rgba(0, 0, 0, 0.45);
--shadow-clay-inner-light: rgba(255, 255, 255, 0.05);
--shadow-clay-inner-dark: rgba(0, 0, 0, 0.3);
--shadow-clay-inset-light: rgba(255, 255, 255, 0.04);
--shadow-clay-inset-dark: rgba(0, 0, 0, 0.35);
```

### 5.2 阴影类名（Figma 校准偏移量）

Figma 原始数据：`DROP_SHADOW offset(-8,-8) radius 16` + `INNER_SHADOW offset(-4,-4) radius 8`

```css
/* 标准凸起 — Figma: outer(-8,-8,r16) + inner(-4,-4,r8) */
.shadow-clay {
  box-shadow:
    -8px -8px 16px var(--shadow-clay-outer-light),
     8px  8px 16px var(--shadow-clay-outer-dark),
    inset -4px -4px 8px var(--shadow-clay-inner-dark),
    inset  4px  4px 8px var(--shadow-clay-inner-light);
}

/* 悬停凸起 — 更大偏移 */
.shadow-clay-hover {
  box-shadow:
    -10px -10px 20px var(--shadow-clay-outer-light),
     10px  10px 20px var(--shadow-clay-outer-dark),
    inset -4px -4px 8px var(--shadow-clay-inner-dark),
    inset  4px  4px 8px var(--shadow-clay-inner-light);
}

/* 按下凹陷 — 更小外阴影 + 更大内阴影 */
.shadow-clay-active {
  box-shadow:
    -4px -4px 10px var(--shadow-clay-outer-light),
     4px  4px 10px var(--shadow-clay-outer-dark),
    inset -6px -6px 12px var(--shadow-clay-inner-dark),
    inset  6px  6px 12px var(--shadow-clay-inner-light);
}

/* 输入框内凹 */
.shadow-clay-inset {
  box-shadow:
    inset 4px 4px 8px var(--shadow-clay-inset-dark),
    inset -4px -4px 8px var(--shadow-clay-inset-light);
}
```

### 5.3 彩色阴影

每种 Clay 颜色都有对应的彩色阴影变体，右下阴影替换为该色系的半透明色：

```css
.shadow-clay-green  → 右下: rgba(116,198,157,0.3), 内: rgba(116,198,157,0.2)
.shadow-clay-blue   → 右下: rgba(162,210,255,0.3), 内: rgba(162,210,255,0.2)
.shadow-clay-pink   → 右下: rgba(255,143,179,0.3), 内: rgba(255,143,179,0.2)
.shadow-clay-yellow → 右下: rgba(255,204,119,0.3), 内: rgba(255,204,119,0.2)
.shadow-clay-purple → 右下: rgba(212,165,243,0.3), 内: rgba(212,165,243,0.2)
```

**暗色模式**下彩色阴影的透明度提升（0.3→0.4, 0.2→0.3），以在深色背景上保持可见度。

---

## 6. 动画系统

### 6.1 弹簧缓动曲线

```js
transitionTimingFunction: {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}
```

这是整个项目最核心的缓动函数，特征是**过冲回弹**（overshoot），模拟物理弹簧效果。所有 Clay 组件的过渡都使用此曲线。

**Tailwind 用法：**
```html
<div className="transition-all duration-300 ease-spring" />
<button className="transition-all duration-300 ease-spring hover:shadow-clay-hover" />
```

### 6.2 关键帧动画

| 动画名 | 效果 | 时长 | 缓动 | 用途 |
|--------|------|------|------|------|
| `fadeIn` | 淡入 | 0.3s | spring | 通用出现 |
| `slideUp` | 上滑淡入 | 0.35s | spring | 卡片/面板出现 |
| `slideDown` | 下滑淡入 | 0.3s | spring | Header 出现 |
| `scaleIn` | 缩放淡入 | 0.3s | spring | 弹窗出现 |
| `spinOnce` | 旋转360° | 0.35s | ease-in-out | 主题切换图标 |
| `float1` | 上下浮动+微旋 | 7s | ease-in-out | 背景光斑1 |
| `float2` | 上下浮动+微旋 | 9s | ease-in-out | 背景光斑2 |
| `shimmer` | 背景位移动画 | 3s | linear | 文字闪光 |
| `gradientShift` | 渐变位移 | 6s | ease | 首页背景渐变流动 |
| `wiggle` | 左右微摆 | 2s | ease-in-out | Logo/装饰元素 |
| `drawIn` | SVG 描边绘制 | 0.6s | ease-out | SVG 图标出现 |
| `popIn` | 弹性缩放 | 0.4s | spring | 元素弹出 |

**代码定义：**

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes spinOnce {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-1.5deg); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

@keyframes drawIn {
  from { stroke-dashoffset: 100; opacity: 0; }
  to { stroke-dashoffset: 0; opacity: 1; }
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.6); }
  70% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
```

### 6.3 Tailwind 动画类名

```html
<div className="animate-fade-in" />       <!-- 淡入 -->
<div className="animate-slide-up" />      <!-- 上滑出现 -->
<div className="animate-slide-down" />     <!-- 下滑出现 -->
<div className="animate-scale-in" />      <!-- 缩放出现 -->
<div className="animate-spin-once" />      <!-- 旋转一圈 -->
<div className="animate-float-1" />        <!-- 浮动1（7s） -->
<div className="animate-float-2" />        <!-- 浮动2（9s） -->
<div className="animate-shimmer" />         <!-- 闪光流动 -->
<div className="animate-gradient" />       <!-- 渐变流动 -->
<div className="animate-wiggle" />          <!-- 左右摇摆 -->
<div className="animate-pop-in" />          <!-- 弹性弹出 -->
<svg className="animate-draw-in" />        <!-- SVG描边绘制 -->
```

### 6.4 减弱动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. 交互特效

### 7.1 按钮交互三态

Clay 按钮有三个视觉状态，对应三种阴影：

```
默认 → shadow-clay       （标准凸起）
悬停 → shadow-clay-hover （更高凸起 + 上移）
按下 → shadow-clay-active（凹陷效果 + 缩小）
```

**代码实现：**

```tsx
<button className={cn(
  'rounded-clay transition-all duration-300 ease-spring',
  isPressed
    ? 'shadow-clay-active scale-[0.97]'
    : isHovered
      ? 'shadow-clay-hover -translate-y-1.5'
      : 'shadow-clay',
)} />
```

**全局按钮基础样式：**

```css
button {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}
button:active:not(:disabled) {
  transform: scale(0.97);
}
```

### 7.2 鼠标跟随光效（ToolCard）

卡片悬停时，鼠标位置产生径向渐变光效：

```tsx
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
const [isHovered, setIsHovered] = useState(false);

const handleMouseMove = (e: React.MouseEvent) => {
  const rect = cardRef.current!.getBoundingClientRect();
  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
};

// 渲染
{isHovered && !isPressed && (
  <div
    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-clay-lg"
    style={{
      background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(116,198,157,0.1), transparent 60%)`,
    }}
  />
)}
```

### 7.3 主题切换旋转动画

点击主题切换按钮时，图标旋转一圈：

```tsx
const [spinning, setSpinning] = useState(false);

const toggleTheme = () => {
  setSpinning(true);
  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  setTimeout(() => setSpinning(false), 350);
};

<span className={cn(spinning && 'animate-spin-once')}>
  {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
</span>
```

### 7.4 卡片入场交错动画

工具卡片使用 `animationDelay` 实现交错入场：

```tsx
<div
  className="animate-slide-up"
  style={{ animationDelay: `${Math.min(index * 15, 500)}ms` }}
/>
```

### 7.5 侧边栏折叠过渡

侧边栏宽度变化使用 `transition-[width]` 精确过渡：

```tsx
<aside className={cn(
  'transition-[width] duration-300 ease-spring',
  collapsed ? 'w-[48px]' : 'w-[200px]'
)} />
```

内部文字使用 `opacity + width` 过渡实现淡出/淡入：

```tsx
<span className={cn(
  'transition-all duration-200 ease-spring',
  collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
)}>
  文字内容
</span>
```

### 7.6 收藏按钮悬停显示

收藏星标默认隐藏，悬停卡片时显示：

```tsx
<button className={cn(
  'absolute top-2.5 right-2.5 transition-all duration-200',
  isFav
    ? 'text-clay-yellow-dark opacity-100 shadow-clay-yellow'
    : 'text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-clay-yellow-dark'
)} />
```

### 7.7 焦点可见性

```css
*:focus-visible {
  outline: 3px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: 8px;
}
```

### 7.8 输入框聚焦效果

Clay 输入框聚焦时增加绿色光环：

```css
.clay-input:focus {
  box-shadow:
    inset 4px 4px 10px var(--shadow-clay-inset-dark),
    inset -4px -4px 10px var(--shadow-clay-inset-light),
    0 0 0 4px rgba(116, 198, 157, 0.2);
}
```

---

## 8. 背景装饰系统

### 8.1 浮动光斑

首页背景使用 3 个大尺寸模糊圆形，配合 `float` 动画：

```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {/* 大光斑 */}
  <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-clay-blue-light/50 blur-[80px] rounded-full animate-float-1" />
  <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-clay-purple-light/40 blur-[70px] rounded-full animate-float-2" />
  <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-clay-green-light/40 blur-[60px] rounded-full animate-float-1" style={{ animationDelay: '-3s' }} />

  {/* 小几何装饰 */}
  <div className="absolute top-[8%] right-[6%] w-5 h-5 bg-clay-pink-main/25 rounded-full animate-float-1" />
  <div className="absolute top-[18%] left-[8%] w-4 h-4 bg-clay-blue-main/25 rotate-45 animate-float-2" />
  <div className="absolute top-[40%] right-[4%] w-6 h-6 bg-clay-yellow-medium/25 animate-wiggle"
    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
  {/* ... 更多装饰 */}
</div>
```

### 8.2 渐变背景动画

首页背景使用 `animate-gradient` 实现渐变流动：

```tsx
<div className="home-gradient animate-gradient">
  {/* 内容 */}
</div>
```

```css
.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}
```

---

## 9. 组件样式规范

### 9.1 主要按钮（Primary）

```html
<button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
  <Icon className="w-4 h-4" />
  按钮文字
</button>
```

### 9.2 次要按钮（Secondary）

```html
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-colors">
  <Icon className="w-3.5 h-3.5" />
  按钮文字
</button>
```

### 9.3 成功按钮（Success）

```html
<button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-success/90 hover:bg-success text-white transition-colors">
  <Icon className="w-4 h-4" />
  下载
</button>
```

### 9.4 工具面板

```html
<div className="flex flex-col gap-4 h-full">
  <!-- 标题区 -->
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-primary" />
    <div>
      <h2 className="text-lg font-semibold text-text-primary">工具名称</h2>
      <p className="text-sm text-text-secondary">工具描述</p>
    </div>
  </div>

  <!-- 内容区 -->
  <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
    ...
  </div>
</div>
```

### 9.5 输入框

```html
<input type="text"
  className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary font-mono focus:outline-none focus:border-primary"
/>
```

### 9.6 下拉选择框

```html
<select className="px-2 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary">
  <option>选项1</option>
</select>
```

### 9.7 Tab 切换

```html
<div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
  <button className={cn(
    'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
    isActive ? 'bg-bg-tertiary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
  )}>
    <Icon className="w-3.5 h-3.5" />
    标签
  </button>
</div>
```

### 9.8 比率/标签选择器

```html
<button className={cn(
  'px-2.5 py-1 text-xs rounded-md transition-colors',
  isSelected ? 'bg-primary text-white' : 'bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary'
)}>
  1:1
</button>
```

### 9.9 信息面板

```html
<div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
  <span>宽度: 1920</span>
  <span>高度: 1080</span>
  <span>大小: 2.3 MB</span>
</div>
```

### 9.10 拖拽上传区

```html
<div className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl bg-bg-secondary hover:bg-bg-tertiary hover:border-primary transition-colors cursor-pointer">
  <ImageIcon className="w-16 h-16 text-text-muted" />
  <p className="text-sm font-medium text-text-primary">拖拽文件到此处，或点击上传</p>
  <p className="text-xs text-text-muted mt-1">支持格式说明</p>
</div>
```

### 9.11 Clay 卡片（首页工具卡片）

```html
<div className={cn(
  'relative bg-bg-secondary/90 backdrop-blur-sm rounded-clay-lg p-4 text-left group cursor-pointer overflow-hidden',
  'transition-all duration-300 ease-spring',
  isPressed ? 'shadow-clay-active scale-[0.97]'
    : isHovered ? 'shadow-clay-hover -translate-y-1.5'
    : 'shadow-clay',
)}>
  ...
</div>
```

### 9.12 Clay 图标容器

```html
<span className="w-10 h-10 rounded-clay flex items-center justify-center shrink-0 shadow-clay bg-clay-white/60 text-clay-green-dark transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-3">
  <Icon className="w-4 h-4" />
</span>
```

---

## 10. 暗色模式实现

### 10.1 切换机制

使用 Tailwind `darkMode: "class"` 策略，通过在 `<html>` 元素添加/移除 `dark` 类名切换：

```ts
// useTheme.ts (Zustand store)
function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
}
```

### 10.2 CSS 变量自动切换

所有颜色通过 CSS 变量定义，`.dark` 类下自动覆盖：

```css
:root {
  --color-primary: #74c69d;
  --color-bg-primary: #ffecd2;
  /* ... */
}

.dark {
  --color-primary: #52a07a;
  --color-bg-primary: #14142a;
  /* ... */
}
```

### 10.3 持久化

主题偏好存储在 `localStorage`，key 为 `testkit:theme`，支持 `light` / `dark` / `system` 三种模式。

---

## 11. 滚动条样式

```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--clay-gray-medium) transparent;
}
```

---

## 12. 文本选择样式

```css
::selection {
  background: var(--clay-green-light);
  color: var(--clay-text-primary);
}
```

---

## 13. 代码编辑器样式

```css
.cm-editor {
  font-size: 13px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
```

---

## 14. 过渡时长规范

| 场景 | 时长 | 缓动 | Tailwind |
|------|------|------|----------|
| 按钮悬停/状态切换 | 150–200ms | spring | `duration-150` / `duration-200` |
| 卡片悬停/面板展开 | 300ms | spring | `duration-300 ease-spring` |
| 侧边栏折叠 | 300ms | spring | `duration-300 ease-spring` |
| 主题切换旋转 | 350ms | ease-in-out | `animate-spin-once` |
| 页面元素入场 | 300–400ms | spring | `animate-slide-up` |
| 背景渐变流动 | 6s | ease | `animate-gradient` |
| 光斑浮动 | 7–9s | ease-in-out | `animate-float-1/2` |
| Logo 摇摆 | 2s | ease-in-out | `animate-wiggle` |

---

## 15. 完整 Clay 卡片组件代码

以下是首页 ToolCard 的完整实现，展示了所有特效的综合运用：

```tsx
function ToolCard({ tool, colorIndex, isFav, onClick, onToggleFav, delay }) {
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={cn(
        'relative bg-bg-secondary/90 backdrop-blur-sm rounded-clay-lg p-4 text-left group cursor-pointer overflow-hidden',
        'transition-all duration-300 ease-spring',
        isPressed ? 'shadow-clay-active scale-[0.97]'
          : isHovered ? 'shadow-clay-hover -translate-y-1.5'
          : 'shadow-clay',
        'animate-slide-up',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 鼠标跟随光效 */}
      {isHovered && !isPressed && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-clay-lg"
          style={{
            background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(116,198,157,0.1), transparent 60%)`,
          }}
        />
      )}

      {/* 收藏按钮 */}
      <button
        onClick={onToggleFav}
        className={cn(
          'absolute top-2.5 right-2.5 p-1.5 rounded-clay-sm transition-all duration-200 z-10',
          isFav
            ? 'text-clay-yellow-dark opacity-100 shadow-clay-yellow'
            : 'text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-clay-yellow-dark'
        )}
      >
        <Star className={cn('w-3.5 h-3.5', isFav && 'fill-clay-yellow-dark')} />
      </button>

      {/* 图标 + 文字 */}
      <div className="relative flex items-start gap-3">
        <span className={cn(
          'w-10 h-10 rounded-clay flex items-center justify-center shrink-0 shadow-clay transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-3',
          getClayIconBg(colorIndex)
        )}>
          {tool.icon}
        </span>
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate transition-colors duration-200 group-hover:text-clay-green-dark">
              {tool.name}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 16. 设计原则总结

| 原则 | 实践 |
|------|------|
| **柔软可触** | 大圆角 + Clay 阴影，所有元素看起来像可按压的粘土 |
| **弹性反馈** | spring 缓动曲线，所有交互都有过冲回弹感 |
| **层次分明** | 三态阴影（默认/悬停/按下）清晰区分交互状态 |
| **色彩柔和** | 低饱和 Clay 五色 + 语义色，避免刺眼 |
| **暗色适配** | 完整变量映射，暗色下自动降低亮度、提升对比度 |
| **无障碍** | focus-visible 焦点环、prefers-reduced-motion 支持 |
| **性能优先** | 动画仅使用 transform/opacity，避免 layout thrashing |
| **一致性** | 所有组件遵循相同的圆角/阴影/动画/颜色规范 |
