# Design Implementation Guide
## "The Atmospheric Horizon" - Editorial Hospitality Design System

## 📐 Core Principles

### 1. **NO BORDERS Rule**
❌ **NEVER use**: `border: 1px solid #xxx`
✅ **ALWAYS use**: Background color shifts between surface tiers

```css
/* BAD */
.card {
  border: 1px solid #e0e0e0;
}

/* GOOD - Tonal Layering */
.section {
  background: var(--clr-surface-low);  /* #f1f4f6 */
}
.card {
  background: var(--clr-surface-lowest);  /* #ffffff */
}
```

### 2. **Typography Hierarchy**
- **Serif (Noto Serif)**: Headlines, Display text - Authority & Prestige
- **Sans (Manrope)**: Body, Labels, UI - Utility & Readability

```jsx
<h1 className="display-lg">Hero Headline</h1>  {/* Serif */}
<p className="body-lg">Lead paragraph</p>      {/* Sans */}
```

### 3. **Surface Hierarchy** (Lightest to Darkest)
```
--clr-surface-lowest   #ffffff  ← Cards, elevated content
--clr-surface-low      #f1f4f6  ← Sections
--clr-surface          #f7fafc  ← Page background
--clr-surface-high     #e4e8eb  ← Recessed areas
--clr-surface-highest  #e0e3e5  ← Footer, utility
```

### 4. **Shadows - Ambient Only**
❌ **NEVER**: High-contrast shadows
✅ **ALWAYS**: Soft, 6% opacity max

```css
/* BAD */
box-shadow: 0 4px 6px rgba(0,0,0,0.3);

/* GOOD */
box-shadow: var(--shadow-lg);  /* 0 40px 80px rgba(24,28,30,0.06) */
```

### 5. **Buttons - Gradient Soul**
```css
/* Primary - Gradient */
background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-container) 100%);

/* Secondary - Ghost Border */
background: transparent;
border: 1px solid var(--glass-border);  /* rgba(196,198,209,0.15) */
```

## 🎨 Component Patterns

### Hero Section
```jsx
<section className="editorial-hero">
  <div className="editorial-hero-content">
    <h1 className="display-lg">Headline</h1>
    <p className="body-lg">Subheading</p>
  </div>
</section>
```

### Card with Tonal Layering
```jsx
<div className="editorial-card">
  <img className="editorial-image" src="..." alt="..." />
  <div style={{ padding: 'var(--sp-8)' }}>
    <h3 className="headline-md">Title</h3>
    <p className="body-md">Description</p>
  </div>
</div>
```

### Filter Pills
```jsx
<div className="editorial-filter">
  <button className="editorial-filter-btn active">All</button>
  <button className="editorial-filter-btn">Category</button>
</div>
```

### Grid Layout
```jsx
<div className="editorial-grid">
  {/* Cards auto-fill, min 380px */}
</div>
```

## 📝 Page Structure Template

```jsx
import '../styles/editorial.css';
import styles from './PageName.module.css';

const PageName = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className="editorial-hero">
        <div className="editorial-hero-content">
          <h1 className="display-lg">Page Title</h1>
          <p className="body-lg">Description</p>
        </div>
      </section>

      {/* Content */}
      <div className="editorial-container">
        {/* Filters */}
        <div className="editorial-filter">
          {/* Filter buttons */}
        </div>

        {/* Grid */}
        <div className="editorial-grid">
          {/* Cards */}
        </div>
      </div>
    </div>
  );
};
```

## 🎯 Specific Page Guidelines

### Articles Page
- ✅ Hero with gradient background
- ✅ Category filters with ghost borders
- ✅ Card grid with hover lift
- ✅ Floating category badges on images
- ✅ Pagination with gradient buttons

### Article Detail Page
- ✅ Full-width hero image
- ✅ Serif headline (headline-lg)
- ✅ Sans body text (body-lg)
- ✅ Sidebar with tonal shift
- ✅ Share buttons with ghost borders
- ✅ Related articles cards

### Attractions Page
- ✅ Similar to Articles
- ✅ Location badges
- ✅ Distance indicators
- ✅ "View on Map" CTA buttons

### Contact Page
- ✅ Two-column layout (info + form)
- ✅ Input fields with bottom border only
- ✅ Google Maps with rounded corners
- ✅ Icon cards for contact info

### FAQ Page
- ✅ Accordion with tonal layering
- ✅ NO divider lines between items
- ✅ Smooth expand/collapse
- ✅ Category sections with spacing

### Policy Pages
- ✅ Single column, max-width 900px
- ✅ Serif headings
- ✅ Sans body text
- ✅ Section spacing (var(--sp-12))
- ✅ Highlight boxes with tonal shift

### Auth Pages
- ✅ Centered card on gradient background
- ✅ Glassmorphism optional
- ✅ Input fields with focus states
- ✅ Social login buttons with ghost borders

## 🔧 CSS Variables Reference

### Colors
```css
--clr-primary: #00193c
--clr-primary-container: #002d62
--clr-on-primary: #ffffff
--clr-surface: #f7fafc
--clr-surface-lowest: #ffffff
--clr-on-surface: #181c1e
--clr-on-surface-variant: #41484d
```

### Spacing
```css
--sp-2: 0.5rem    /* 8px */
--sp-4: 1rem      /* 16px */
--sp-6: 1.5rem    /* 24px */
--sp-8: 2rem      /* 32px */
--sp-12: 3rem     /* 48px */
--sp-16: 4rem     /* 64px */
--sp-20: 5rem     /* 80px */
```

### Typography
```css
--font-serif: 'Noto Serif'
--font-sans: 'Manrope'
```

### Radius
```css
--r-md: 0.375rem   /* 6px */
--r-xl: 0.75rem    /* 12px */
--r-2xl: 1rem      /* 16px */
--r-full: 9999px   /* Pills */
```

## ✅ Checklist for Each Page

- [ ] Import `editorial.css`
- [ ] Use semantic HTML5 tags
- [ ] Hero section with gradient
- [ ] Typography classes (display-lg, headline-md, body-md)
- [ ] NO 1px borders for sections
- [ ] Surface hierarchy for depth
- [ ] Ambient shadows only
- [ ] Generous spacing (--sp-12, --sp-16)
- [ ] Hover states with transform
- [ ] Responsive breakpoints
- [ ] Loading states
- [ ] Error states

## 🚫 Common Mistakes to Avoid

1. ❌ Using `border: 1px solid` for section dividers
2. ❌ High-contrast shadows (opacity > 10%)
3. ❌ Mixing serif/sans incorrectly
4. ❌ Insufficient spacing between sections
5. ❌ Flat buttons without gradients
6. ❌ Center-aligning long body text
7. ❌ Using generic blue (#0000FF)
8. ❌ Forgetting hover states
9. ❌ Not using CSS variables
10. ❌ Ignoring responsive design

## 📱 Responsive Guidelines

```css
/* Mobile First */
@media (max-width: 768px) {
  .editorial-hero {
    min-height: 50vh;
    padding: var(--sp-12) var(--sp-4);
  }
  
  .editorial-container {
    padding: var(--sp-12) var(--sp-4);
  }
  
  .editorial-grid {
    gap: var(--sp-8);
  }
}
```

## 🎨 Color Usage Guide

### Primary Actions
- Buttons, Links, CTAs: `var(--clr-primary)`
- Hover states: Gradient or lighter shade

### Text Hierarchy
- Headlines: `var(--clr-on-surface)` (#181c1e)
- Body: `var(--clr-on-surface)` (#181c1e)
- Secondary: `var(--clr-on-surface-variant)` (#41484d)
- Disabled: 50% opacity

### Backgrounds
- Page: `var(--clr-surface)` (#f7fafc)
- Cards: `var(--clr-surface-lowest)` (#ffffff)
- Sections: Alternate between surface tiers

## 🔗 Resources

- Design System Doc: `DESIGN-HOTEL-WEB.md`
- Tokens: `frontend/src/styles/tokens.css`
- Editorial Styles: `frontend/src/styles/editorial.css`
- Global Styles: `frontend/src/styles/global.css`

---

**Remember**: "White Space as Luxury" - If it feels crowded, double the padding!
