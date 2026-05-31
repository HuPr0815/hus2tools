# TestKit 亮系主题设计系统 — AI 设计提示词

## 设计风格

融合 **Claymorphism（黏土形态）+ Multi-Color Gradient（多色渐变）+ Memphis（几何装饰）+ Hand-Drawn Sketch（手绘温暖感）** 的综合性亮系主题。整体呈现柔软、蓬松、亲和、活泼的视觉感受，每个 UI 元素都像手工捏制的马卡龙色黏土物体。

---

## 1. 马卡龙色彩系统（Macaron Color Palette）

色彩原则：高明度（Lightness > 65%）、中等饱和度（Saturation 40-60%）、柔和色调过渡。

### 粉系（Pink）
| Token | Hex | 用途 |
|-------|-----|------|
| `--clay-pink-light` | `#ffc8dd` | 背景/浅色面 |
| `--clay-pink-main` | `#ffb3d9` | 主色面 |
| `--clay-pink-medium` | `#ff99ac` | 中等强调 |
| `--clay-pink-dark` | `#ff8fb3` | 深色强调 |
| `--clay-pink-deep` | `#ff6a88` | 最深/CTA |

### 蓝系（Blue）
| Token | Hex |
|-------|-----|
| `--clay-blue-light` | `#cae9ff` |
| `--clay-blue-main` | `#a2d2ff` |
| `--clay-blue-medium` | `#7eb8e0` |
| `--clay-blue-dark` | `#5a9fd4` |

### 紫系（Purple）
| Token | Hex |
|-------|-----|
| `--clay-purple-light` | `#e4c1f9` |
| `--clay-purple-main` | `#d4a5f3` |
| `--clay-purple-medium` | `#c48ee8` |
| `--clay-purple-dark` | `#b377dc` |

### 绿系（Green — 主品牌色）
| Token | Hex |
|-------|-----|
| `--clay-green-light` | `#d8f3dc` |
| `--clay-green-main` | `#b7e4c7` |
| `--clay-green-medium` | `#95d5b2` |
| `--clay-green-dark` | `#74c69d` |

### 黄系（Yellow）
| Token | Hex |
|-------|-----|
| `--clay-yellow-light` | `#fff4bd` |
| `--clay-yellow-main` | `#ffe6a7` |
| `--clay-yellow-medium` | `#ffd98e` |
| `--clay-yellow-dark` | `#ffcc77` |

### 中性色（Neutral）
| Token | Hex | 用途 |
|-------|-----|------|
| `--clay-white` | `#ffffff` | 纯白面 |
| `--clay-gray-light` | `#f8f9fa` | 浅灰底 |
| `--clay-gray-medium` | `#e9ecef` | 中灰 |
| `--clay-text-primary` | `#495057` | 主文字 |
| `--clay-text-secondary` | `#6c757d` | 副文字 |

### 语义色（Semantic）
| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#74c69d` | 主品牌色 = clay-green-dark |
| `--color-cta` | `#ff6a88` | CTA 按钮 = clay-pink-deep |
| `--color-success` | `#74c69d` | 成功 = clay-green-dark |
| `--color-warning` | `#ffcc77` | 警告 = clay-yellow-dark |
| `--color-error` | `#ff6a88` | 错误 = clay-pink-deep |
| `--color-info` | `#5a9fd4` | 信息 = clay-blue-dark |

### 背景色（Background）
| Token | Hex | 用途 |
|-------|-----|------|
| `--color-bg-primary` | `#ffecd2` | 页面主背景（暖米色） |
| `--color-bg-secondary` | `#ffffff` | 卡片/面板背景 |
| `--color-bg-tertiary` | `#f8f0e3` | 次级背景 |
| `--color-bg-elevated` | `#ffffff` | 浮层/弹窗背景 |

---

## 2. Claymorphism 阴影系统（The Soul）

Claymorphism 的灵魂是 **4 层阴影叠加**：2 层外部阴影（制造悬浮感）+ 2 层内部阴影（创造厚度感）。

### 阴影变量
```css
--shadow-clay-outer-light: rgba(255, 255, 255, 0.7);  /* 左上高光 */
--shadow-clay-outer-dark: rgba(200, 170, 220, 0.35);   /* 右下阴影 */
--shadow-clay-inner-light: rgba(255, 255, 255, 0.5);   /* 内部左上高光 */
--shadow-clay-inner-dark: rgba(200, 170, 220, 0.25);    /* 内部右下阴影 */
--shadow-clay-inset-light: rgba(255, 255, 255, 0.6);   /* 凹陷左上高光 */
--shadow-clay-inset-dark: rgba(200, 170, 220, 0.25);    /* 凹陷右下阴影 */
```

### 阴影类（4 态切换）
```
.shadow-clay        → 默认悬浮态（-4px/-4px 外 + -2px/-2px 内）
.shadow-clay-hover  → 悬停态（外阴影扩大至 -6px/-6px）
.shadow-clay-active → 按下态（外阴影收缩至 -2px/-2px，内阴影加深至 -3px/-3px）
.shadow-clay-inset  → 凹陷/雕刻态（仅内阴影，inset 3px 3px）
```

### 彩色 clay 阴影
每种马卡龙色系有对应的彩色阴影变体：
- `.shadow-clay-green` — 外阴影右下为 `rgba(116,198,157,0.3)`，内阴影右下 `rgba(116,198,157,0.2)`
- `.shadow-clay-blue` — 外阴影右下为 `rgba(162,210,255,0.3)`，内阴影右下 `rgba(162,210,255,0.2)`
- `.shadow-clay-pink` — 外阴影右下为 `rgba(255,143,179,0.3)`，内阴影右下 `rgba(255,143,179,0.2)`
- `.shadow-clay-yellow` — 外阴影右下为 `rgba(255,204,119,0.3)`，内阴影右下 `rgba(255,204,119,0.2)`
- `.shadow-clay-purple` — 外阴影右下为 `rgba(212,165,243,0.3)`，内阴影右下 `rgba(212,165,243,0.2)`

---

## 3. 圆角系统（Extreme Roundness）

```
rounded-clay-sm    → 16px   （小标签/徽章/收藏按钮）
rounded-clay       → 24px   （按钮/输入框/图标容器/小型卡片）
rounded-clay-lg    → 32px   （大型卡片/对话框）
rounded-clay-xl    → 48px   （特大容器/Hero区域）
rounded-clay-full  → 50px   （胶囊按钮/导航栏）
```

禁止使用小于 16px 的圆角。Claymorphism 的核心特征是极致圆润。

---

## 4. 多色马卡龙渐变背景（Home Gradient）

首页背景使用 **6 色循环渐变**（黄 → 粉 → 紫 → 蓝 → 绿 → 黄），覆盖全视口：

```css
.home-gradient {
  background: linear-gradient(
    135deg,
    #fff4bd  0%,    /* clay-yellow-light */
    #ffc8dd 20%,    /* clay-pink-light */
    #e4c1f9 40%,    /* clay-purple-light */
    #cae9ff 60%,    /* clay-blue-light */
    #d8f3dc 80%,    /* clay-green-light */
    #fff4bd 100%    /* 首尾同色形成循环 */
  );
}

/* 渐变动画 */
.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 5. 动画系统

### 缓动函数
所有交互动画使用 **spring 弹性缓动**：
```css
ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```
- 按钮：`transition: all 0.3s ease-spring`
- 按钮按下：`transform: scale(0.97)`（物理反馈）

### 动画类
| 类名 | 效果 | 时长 |
|------|------|------|
| `animate-fade-in` | 淡入（spring 缓动） | 0.3s |
| `animate-slide-up` | 从下 10px 滑入 | 0.35s |
| `animate-slide-down` | 从上 -8px 滑入 | 0.3s |
| `animate-scale-in` | scale 0.94→1 | 0.3s |
| `animate-pop-in` | scale 0.6→1.05→1 | 0.4s |
| `animate-spin-once` | 旋转 360° | 0.35s |
| `animate-wiggle` | ±2° 摆动（无限） | 2s |
| `animate-float-1` | 上浮 20px + 微旋转 | 7s |
| `animate-float-2` | 上浮 15px + 微旋转 | 9s |
| `animate-shimmer` | 光泽扫过 | 3s |
| `animate-gradient` | 渐变位移（无限） | 6s |

---

## 6. Memphis 几何装饰

在背景中使用半透明几何图形增加活泼感：
- **圆形**：`rounded-full`，直径 8-24px，`bg-clay-*-light/40`
- **旋转方块**：`rounded-sm rotate-45`，`bg-clay-*-light/30`
- **三角形**：CSS `clipPath: polygon(50% 0%, 0% 100%, 100% 100%)`
- 装饰元素统一使用 `pointer-events-none`，不影响交互
- 使用 `animate-float-1/2` 或 `animate-wiggle` 赋予生命感

### 模糊渐变光斑
3 个大尺寸模糊光斑作为背景深度：
- `w-[500px] h-[500px] bg-clay-blue-light/50 blur-[80px] rounded-full`
- `w-[400px] h-[400px] bg-clay-purple-light/40 blur-[70px] rounded-full`
- `w-[350px] h-[350px] bg-clay-green-light/40 blur-[60px] rounded-full`

---

## 7. 组件设计规范

### 工具卡片（ToolCard）
```
容器：bg-bg-secondary/90 backdrop-blur-sm rounded-clay-lg（32px）
阴影三态：
  - 默认：shadow-clay
  - hover：shadow-clay-hover + -translate-y-1.5 + ease-spring
  - active：shadow-clay-active + scale-[0.97]
鼠标追踪聚光灯：跟随鼠标位置显示径向渐变光斑
图标容器：CLAY_ICON_BG[colorIndex]（bg-clay-white/60 + 对应色系文字）
  图标容器 hover：scale-110 rotate-3
收藏星标：text-clay-yellow-dark fill-clay-yellow-dark
```

### 图标容器颜色轮换
5 组配色交替使用：
```tsx
const CLAY_ICON_BG = [
  'bg-clay-white/60 text-clay-green-dark',
  'bg-clay-white/60 text-clay-blue-dark',
  'bg-clay-white/60 text-clay-pink-deep',
  'bg-clay-white/60 text-clay-yellow-dark',
  'bg-clay-white/60 text-clay-purple-dark',
];
```

### 卡片渐变样式（彩色 clay 卡片）
```tsx
const CLAY_CARD_STYLES = [
  'bg-gradient-to-br from-clay-green-light to-clay-green shadow-clay-green',
  'bg-gradient-to-br from-clay-blue-light to-clay-blue shadow-clay-blue',
  'bg-gradient-to-br from-clay-pink-light to-clay-pink shadow-clay-pink',
  'bg-gradient-to-br from-clay-yellow-light to-clay-yellow shadow-clay-yellow',
  'bg-gradient-to-br from-clay-purple-light to-clay-purple shadow-clay-purple',
];
```

### 搜索输入框
```
容器：shadow-clay-inset（凹陷/雕刻感）
圆角：rounded-clay（24px）
聚焦：外发光 0 0 0 4px rgba(116,198,157,0.2)
placeholder：text-text-secondary
```

### 主题切换按钮
```
容器：bg-clay-yellow-light/60 shadow-clay rounded-clay（24px）
亮色模式 → 显示 Moon 图标（text-clay-purple-dark）
暗色模式 → 显示 Sun 图标（text-clay-yellow-dark）
点击 → animate-spin-once（旋转反馈）
```

### 分类区块标题
```
左侧装饰条：w-1 h-5 bg-gradient-to-b from-clay-green-dark to-clay-blue-dark rounded-clay-sm
标题文字：text-text-primary font-semibold
数量标签：text-text-muted
```

---

## 8. 字体系统

```css
font-family: 'Inter', 'Nunito', 'Quicksand', ui-sans-serif, system-ui, sans-serif;
font-family-mono: 'JetBrains Mono', ui-monospace, monospace;  /* 代码编辑器 */
```

- 正文：16px / 400 / line-height 1.6
- 标题（Hero）：3rem / 700
- 卡片标题：1.125rem / 600
- 分类标签：0.75rem / 600 / uppercase / tracking-wider

---

## 9. Hero 区域规范

```
整体：pt-[15vh] pb-16 px-4 flex flex-col items-center
Wrench 图标：rounded-clay-lg bg-clay-green-light shadow-clay-green + animate-wiggle
标题 "Test"：text-text-primary font-extrabold text-5xl
标题 "Kit"：bg-clip-text text-transparent bg-gradient-to-r from-clay-green-dark via-clay-blue-dark to-clay-purple-dark animate-shimmer
副标题：text-text-secondary + Sparkles 装饰图标
搜索框：max-w-xl w-full + shadow-clay-inset
```

---

## 10. 关键交互原则

1. **物理按压反馈**：任何可点击元素按下时必须 `scale-[0.97]` + 阴影从 hover 切换到 active
2. **弹簧缓动无处不在**：`cubic-bezier(0.34, 1.56, 0.64, 1)` 用于所有 transition
3. **无边框设计**：厚度完全由阴影创造，不使用 `border`
4. **哑光表面**：不添加高光反射/glossy 效果
5. **色彩一致**：背景与主体在同一马卡龙色系内，仅明度不同
6. **可访问性**：`prefers-reduced-motion` 完全禁用动画；focus-visible 使用 3px 绿色轮廓
7. **文字对比度**：主文字 `#495057` 在 `#ffecd2` 背景上对比度满足 WCAG AA

---

## 11. 禁止事项

- ❌ 圆角 < 16px
- ❌ 饱和度 > 70% 的鲜艳纯色
- ❌ `box-shadow: 0 2px 4px` 标准扁平阴影
- ❌ 仅使用外部阴影（必须内外 4 层）
- ❌ 使用 `border` 替代阴影
- ❌ 过度 3D 旋转/变形动画
- ❌ 暗色背景作为默认（亮系主题 = 暖色浅底）

---

## 12. Tailwind CSS 配置关键项

```js
// tailwind.config.js
{
  darkMode: 'class',
  extend: {
    colors: {
      // 所有 clay-* 颜色通过 CSS 变量引用，支持亮/暗自动切换
      'clay-pink': { light: 'var(--clay-pink-light)', DEFAULT: 'var(--clay-pink-main)', medium: '...', dark: '...', deep: '...' },
      'clay-blue': { light: 'var(--clay-blue-light)', DEFAULT: '...', medium: '...', dark: '...' },
      'clay-purple': { light: '...', DEFAULT: '...', medium: '...', dark: '...' },
      'clay-green': { light: '...', DEFAULT: '...', medium: '...', dark: '...' },
      'clay-yellow': { light: '...', DEFAULT: '...', medium: '...', dark: '...' },
      // 语义色
      'bg-primary': 'var(--color-bg-primary)',
      'bg-secondary': 'var(--color-bg-secondary)',
      'text-primary': 'var(--color-text-primary)',
      'text-secondary': 'var(--color-text-secondary)',
    },
    borderRadius: {
      'clay-sm': '16px',
      'clay': '24px',
      'clay-lg': '32px',
      'clay-xl': '48px',
      'clay-full': '50px',
    },
    transitionTimingFunction: {
      'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    fontFamily: {
      sans: ['Inter', 'Nunito', 'Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
  },
}
```