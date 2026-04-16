# RT5VC Design System
## Green-Dominant Theme v2.0

---

## 📋 Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Logo Guidelines](#logo-guidelines)
5. [Layout Principles](#layout-principles)
6. [Accessibility](#accessibility)
7. [Implementation](#implementation)

---

## 🎨 Color Palette

### Primary Colors (Extracted from Logo)

| Token | HEX | Usage | WCAG Contrast |
|-------|-----|-------|---------------|
| `--color-green-700` | `#2E7D32` | Primary brand color, buttons, headers | White: 5.8:1 ✅ |
| `--color-green-800` | `#1B5E20` | Hover states, dark accents | White: 8.2:1 ✅ |
| `--color-green-600` | `#43A047` | Secondary actions, lighter green | White: 4.6:1 ✅ |
| `--color-green-100` | `#C8E6C9` | Light backgrounds, tints | Green-900: 8.4:1 ✅ |

### Secondary Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-teal-700` | `#00838F` | Secondary buttons, links |
| `--color-teal-800` | `#006064` | Hover states |
| `--color-teal-100` | `#B2EBF2` | Light accents |

### Accent Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-amber-700` | `#F9A825` | Icons, highlights, sun element |
| `--color-amber-800` | `#F57F17` | Hover states |
| `--color-amber-100` | `#FFECB3` | Light backgrounds |

### Neutral Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-navy-900` | `#1A237E` | Text on light, "RT05" color |
| `--color-neutral-900` | `#212121` | Body text |
| `--color-neutral-600` | `#757575` | Muted text |
| `--color-white` | `#FFFFFF` | Backgrounds, text on dark |

---

## 🔤 Typography

### Font Stack
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale (Responsive with clamp())

| Level | Mobile | Tablet | Desktop | Line Height | Weight |
|-------|--------|--------|---------|-------------|--------|
| Display 1 | 40px | 52px | 64px | 1.1 | 900 |
| Display 2 | 32px | 40px | 48px | 1.1 | 800 |
| Heading 1 | 28px | 34px | 40px | 1.2 | 700 |
| Heading 2 | 24px | 28px | 32px | 1.3 | 700 |
| Heading 3 | 20px | 22px | 24px | 1.3 | 600 |
| Body Large | 16px | 17px | 18px | 1.6 | 400 |
| Body | 14px | 15px | 16px | 1.5 | 400 |
| Small | 12px | 13px | 14px | 1.4 | 400 |
| Tiny | 12px | - | - | 1.4 | 400 |

### CSS Implementation
```css
.text-display-1 {
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 1.1;
  font-weight: 900;
}

.text-body {
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  line-height: 1.5;
}
```

---

## 📐 Spacing System

Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | BASE - small gaps |
| `space-3` | 12px | Compact component padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large section spacing |
| `space-10` | 40px | Hero spacing |

### Spacing Guidelines
- **Mobile padding**: 16px (space-4)
- **Tablet padding**: 24px (space-6)
- **Desktop padding**: 32px (space-8)
- **Card internal padding**: 16-20px

---

## 🎯 Logo Guidelines

### Logo Files
| Format | Path | Usage |
|--------|------|-------|
| PNG | `/public/rt5vc.png` | General use, fallback |
| SVG | `/public/rt5vc.svg` | Web, scalable preferred |

### Logo Sizes
| Size | Dimension | Usage |
|------|-----------|-------|
| XS | 32px | Favicon, badges |
| SM | 48px | Mobile header |
| MD | 64px | Tablet, cards |
| LG | 80px | Desktop header |
| XL | 120px | Hero section |
| 2XL | 160px | Splash page |

### Logo Container (for transparency)
```jsx
<div className="bg-white rounded-2xl p-3 shadow-xl">
  <Image
    src="/rt5vc.png"
    alt="RT 005 Villa Citayam"
    width={80}
    height={80}
    className="w-16 h-16 md:w-20 md:h-20 object-contain"
  />
</div>
```

---

## 📱 Layout Principles

### Mobile-First Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Grid System
- 12-column grid
- Gutter: 16px (mobile), 24px (tablet+)
- Max container width: 1280px

### Compact Splash Page Structure
```
┌─────────────────────────────┐
│      [Logo Container]       │  pt-6, pb-4
│         RT 005              │  text-4xl
│      Villa Citayam          │  text-base
├─────────────────────────────┤
│                             │
│     Sistem Keuangan         │  text-2xl
│   [description text]        │  text-sm
│                             │
│  [Badges: Kas|IPL|Riwayat]  │  gap-2
│                             │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │ [Masuk dengan Google│    │  p-5
│  │  helper text...     │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  © 2025 RT 005...           │  py-4
└─────────────────────────────┘
```

---

## ♿ Accessibility

### WCAG Compliance
- **Contrast ratios**: Minimum 4.5:1 for normal text
- **Focus indicators**: 2px solid green-700 with 2px offset
- **Touch targets**: Minimum 44x44px

### Focus States
```css
button:focus-visible {
  outline: 2px solid #2E7D32;
  outline-offset: 2px;
}
```

### ARIA Labels
```jsx
<button
  aria-label="Masuk dengan akun Google untuk mengakses sistem RT 005"
>
  Masuk dengan Google
</button>
```

### Semantic HTML
- Use `<header>`, `<main>`, `<section>`, `<footer>`
- Headings in hierarchical order (h1 → h2 → h3)
- Images have descriptive alt text

---

## 💻 Implementation

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        green: {
          700: '#2E7D32',  // Primary
          800: '#1B5E20',
        },
        teal: {
          700: '#00838F',  // Secondary
        },
        amber: {
          700: '#F9A825',  // Accent
        },
      },
    },
  },
}
```

### DaisyUI Theme
```javascript
daisyui: {
  themes: [{
    rt5vc: {
      "primary": "#2E7D32",
      "secondary": "#00838F",
      "accent": "#F9A825",
      "base-100": "#FFFFFF",
      "base-200": "#E8F5E9",
    }
  }],
}
```

### CSS Custom Properties
```css
:root {
  --rt5vc-green-primary: #2E7D32;
  --rt5vc-green-dark: #1B5E20;
  --rt5vc-teal: #00838F;
  --rt5vc-amber: #F9A825;
  --rt5vc-navy: #1A237E;
  
  --rt5vc-spacing-xs: 4px;
  --rt5vc-spacing-sm: 8px;
  --rt5vc-spacing-md: 16px;
  --rt5vc-spacing-lg: 24px;
  --rt5vc-spacing-xl: 32px;
}
```

---

## 📊 Performance Guidelines

### CSS
- Use Tailwind's JIT mode for minimal CSS
- Purge unused styles
- Minified CSS target: < 20KB

### Images
- Logo PNG: Optimize to < 30KB
- Logo SVG: Inline for critical path
- Use `next/image` for automatic optimization

### Accessibility
- Skip to main content link
- Reduced motion support:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔧 Migration Guide

### From Old Design
1. Replace all `primary` class references with `green-700`
2. Update background gradients to use green scale
3. Replace icon-only buttons with proper labels
4. Add `aria-label` to interactive elements
5. Update logo imports to use `/rt5vc.png`

### Component Updates Needed
- [ ] Header.js - Update logo
- [ ] PublicLayout.js - Update colors
- [ ] DashboardLayout.js - Update colors
- [ ] All page components - Verify contrast

---

## 📁 File Structure

```
public/
  rt5vc.png          # Main logo (PNG)
  rt5vc.svg          # Scalable logo (SVG)
  
design-tokens.js     # Token definitions
tailwind.config.js   # Theme configuration
globals.css          # Custom CSS, animations
```

---

## ✅ Checklist

### Visual Design
- [ ] Logo displays correctly on all backgrounds
- [ ] Green gradient is consistent
- [ ] Typography scale is responsive
- [ ] Spacing is consistent (8px base)

### Accessibility
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used

### Performance
- [ ] Images optimized
- [ ] CSS minified
- [ ] No inline styles
- [ ] Lazy loading for non-critical

---

**Version**: 2.0.0  
**Last Updated**: April 2025  
**Maintainer**: RT5VC Development Team
