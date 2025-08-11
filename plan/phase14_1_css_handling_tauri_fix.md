# CSS Handling in Tauri Production - Complete Fix Guide

## 📋 **Problem Summary**

**Issue**: CSS files were not being handled properly in Tauri production builds, causing styling issues, missing styles, and inconsistent appearance between development and production environments.

**Environment**: Tauri v2.x with Vite frontend, React application using Tailwind CSS

## 🔍 **CSS Handling Challenges in Tauri**

### **Why CSS Fails in Production**
1. **Asset Path Resolution**: CSS imports and asset references break in production bundle
2. **Hash-based File Names**: Vite's default hashing breaks CSS asset references
3. **Static Asset Copying**: CSS-referenced assets (fonts, images) not properly copied
4. **CSS Inlining**: Critical CSS not properly inlined or loaded
5. **Base Path Issues**: Relative paths in CSS don't resolve correctly in production
6. **Font Path Resolution**: Font URLs in CSS don't work with Tauri's asset bundling

## 🛠️ **Solution Implementation**

### **1. Vite Configuration for CSS Handling**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@sutton-signwriting/font-ttf/font/*',
          dest: 'fonts'
        }
      ]
    })
  ],
  base: './', // Critical: Use relative paths for Tauri
  build: {
    assetsInlineLimit: 0, // Prevent asset inlining
    minify: 'terser', // Re-enabled with proper configuration
    terserOptions: {
      keep_fnames: true,
      keep_classnames: true,
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
        reserved: [
          'appGlobalScript',
          'defineCustomElements',
          'applyPolyfills',
          // ... other reserved names for SignWriting library
        ]
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.ttf')) {
            return 'fonts/[name][extname]' // Keep fonts in fonts/ directory
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]' // Keep CSS in assets with hash
          }
          return 'assets/[name]-[hash][extname]'
        }
      },
      external: [],
      preserveEntrySignatures: 'strict'
    }
  }
})
```

### **2. CSS Import Strategy**

```typescript
// frontend/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'        // Global styles first
import App from './pages/App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Import and define web components
import { defineCustomElements } from '@sutton-signwriting/sgnw-components/loader';

defineCustomElements(window);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

### **3. Global CSS with Tailwind Integration**

```css
/* frontend/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import './fonts.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Custom Properties for Theming */
:root {
  /* Light Theme Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  /* ... extensive color palette */
  
  /* Background Colors - Light Mode */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  /* ... other variables */
}

/* Dark Theme Colors */
[data-theme="dark"] {
  /* Background Colors - Dark Mode */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  /* ... dark mode overrides */
}

/* Custom base styles */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--bg-page);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
    min-height: 100vh;
  }
  
  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--secondary-300);
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-400);
  }
}

/* Custom component styles */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap select-none relative overflow-hidden;
  }
  
  .card {
    background: linear-gradient(135deg, var(--card-bg-gradient-start), var(--card-bg-gradient-end));
    border: 1.5px solid var(--card-border);
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    padding: 1.5rem;
    transition: background 0.3s, border 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .input {
    @apply w-full px-3 py-2 text-base border-2 rounded-lg transition-all duration-200;
    background: var(--bg-input);
    color: var(--text-primary);
    border-color: var(--border-input);
    min-height: 120px;
    max-height: 350px;
    resize: none;
  }
  
  /* ... other component styles */
}

/* Custom utility styles */
@layer utilities {
  /* Background utilities using CSS variables */
  .bg-theme-primary { background-color: var(--bg-primary); }
  .bg-theme-secondary { background-color: var(--bg-secondary); }
  .bg-theme-tertiary { background-color: var(--bg-tertiary); }
  /* ... extensive utility classes */
}

/* Keyframe Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### **4. Font CSS with Relative Paths (CRITICAL FIX)**

```css
/* frontend/src/fonts.css */
/* SignWriting Fonts - Load before components */
@font-face {
  font-family: 'SuttonSignWritingLine';
  src: url('./fonts/SuttonSignWritingLine.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: 'SuttonSignWritingFill';
  src: url('./fonts/SuttonSignWritingFill.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: 'SuttonSignWritingOneD';
  src: url('./fonts/SuttonSignWritingOneD.ttf') format('truetype');
  font-display: swap;
}

/* Force fsw-sign web component to use SignWriting fonts */
fsw-sign {
  font-family: 'SuttonSignWritingLine', 'SuttonSignWritingFill', 'SuttonSignWritingOneD', sans-serif !important;
}

/* Target any internal elements of the web component */
fsw-sign * {
  font-family: 'SuttonSignWritingLine', 'SuttonSignWritingFill', 'SuttonSignWritingOneD', sans-serif !important;
}

/* Ensure SVG elements inside fsw-sign use the fonts */
fsw-sign svg {
  font-family: 'SuttonSignWritingLine', 'SuttonSignWritingFill', 'SuttonSignWritingOneD', sans-serif !important;
}

/* Target any text elements that might be created by the web component */
fsw-sign text {
  font-family: 'SuttonSignWritingLine', 'SuttonSignWritingFill', 'SuttonSignWritingOneD', sans-serif !important;
}
```

### **5. Tailwind Configuration**

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  darkMode: 'media', // or 'class' for manual dark mode
}
```

## ✅ **What Worked**

### **1. Base Path Configuration**
- **Solution**: `base: './'` in Vite config
- **Result**: Relative paths work correctly in production

### **2. Asset File Naming**
- **Solution**: Custom `assetFileNames` function
- **Result**: CSS files maintain predictable names with hashes

### **3. Static Asset Copying**
- **Solution**: `vite-plugin-static-copy` for fonts
- **Result**: Fonts available in production at `fonts/` path

### **4. CSS Import Order**
- **Solution**: Import global CSS before component CSS
- **Result**: Proper CSS cascade and specificity

### **5. Font Display Strategy**
- **Solution**: `font-display: swap` in font-face declarations
- **Result**: No layout shift during font loading

### **6. Relative Font Paths (CRITICAL)**
- **Solution**: Use `./fonts/` relative paths in CSS (not `/fonts/`)
- **Result**: Fonts resolve correctly in production bundle

### **7. CSS Variables for Theming**
- **Solution**: Comprehensive CSS custom properties
- **Result**: Consistent theming across light/dark modes

### **8. Terser Configuration**
- **Solution**: Proper minification with preserved function names
- **Result**: SignWriting library works correctly in production

## 🔧 **Production Build Verification**

### **Check CSS Files in Bundle**
```bash
# After building
ls -la dist/assets/
# Should show:
# index-[hash].css
# fonts-[hash].css (if separate)
# Other component CSS files

ls -la dist/fonts/
# Should show:
# SuttonSignWritingLine.ttf
# SuttonSignWritingFill.ttf
# SuttonSignWritingOneD.ttf
```

### **Verify CSS Loading in Production**
```javascript
// In production app console
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  console.log('CSS file:', link.href, 'loaded:', link.sheet !== null);
});
```

### **Check Font Loading**
```javascript
// Verify fonts are loaded
document.fonts.ready.then(() => {
  console.log('All fonts loaded:', document.fonts.size);
  document.fonts.forEach(font => {
    console.log('Font:', font.family, 'status:', font.status);
  });
});
```

## 📊 **CSS Handling Test Results**

### **Development Environment**
```
✅ CSS files load correctly
✅ Tailwind classes work
✅ Custom CSS variables work
✅ Fonts load and display
✅ Dark mode works
✅ Animations work
✅ Responsive design works
✅ Google Fonts load
✅ SignWriting fonts load
```

### **Production Environment**
```
✅ CSS files bundled correctly
✅ Asset paths resolve properly
✅ Fonts load from correct paths
✅ Styles apply consistently
✅ No missing styles
✅ No layout shifts
✅ Performance optimized
✅ Theme switching works
✅ Animations work
✅ Scrollbar styling works
```

## 🎯 **Key Success Factors**

1. **Correct Base Path**: `base: './'` ensures relative paths work
2. **Asset File Naming**: Preserve file structure while adding hashes
3. **Static Asset Copying**: Ensure CSS-referenced assets are available
4. **Import Order**: Global CSS before component CSS
5. **Font Display Strategy**: Use `font-display: swap` for better UX
6. **Relative Font Paths**: Use `./fonts/` for font URLs (CRITICAL)
7. **CSS Variables**: Comprehensive theming system
8. **Tailwind Integration**: Proper layer organization
9. **Terser Configuration**: Preserve function names for libraries

## 📝 **Best Practices**

### **CSS Organization**
- Separate global CSS from component CSS
- Use CSS variables for theming
- Import CSS in correct order
- Use Tailwind for utility classes
- Organize with `@layer` directives

### **Build Configuration**
- Set `base: './'` for relative paths
- Configure `assetFileNames` for predictable output
- Use static copy plugin for assets
- Disable asset inlining when needed
- Preserve function names in minification

### **Font Handling**
- Use `font-display: swap` for better performance
- Use relative paths for font URLs (`./fonts/`)
- Load fonts before component initialization
- Verify font loading with `document.fonts.ready`
- Provide fallback fonts

### **Production Testing**
- Test CSS loading in production builds
- Verify asset paths resolve correctly
- Check font loading and display
- Test responsive design
- Verify dark mode functionality
- Test theme switching

## 🔗 **Related Files**

- `frontend/vite.config.ts` - Build configuration with CSS handling
- `frontend/src/index.css` - Global styles and Tailwind imports
- `frontend/src/fonts.css` - Font declarations with relative paths
- `frontend/tailwind.config.js` - Tailwind configuration
- `frontend/src/main.tsx` - CSS import order
- `frontend/package.json` - Dependencies including `vite-plugin-static-copy`

## 🚨 **Common Pitfalls to Avoid**

1. **Absolute Font Paths**: Don't use `/fonts/` in CSS (use `./fonts/`)
2. **Missing Base Path**: Always set `base: './'` for Tauri
3. **Asset Inlining**: Be careful with `assetsInlineLimit` for large assets
4. **Import Order**: Don't import component CSS before global CSS
5. **Font Loading**: Don't assume fonts are loaded without verification
6. **CSS Variables**: Don't forget to define fallback values
7. **Tailwind Layers**: Don't mix `@layer` directives incorrectly
8. **Minification**: Don't mangle function names that libraries depend on

## 🔄 **CSS Processing Flow**

1. **Development**: Vite processes CSS with HMR
2. **Build**: Vite bundles CSS with hashed filenames
3. **Asset Copy**: Static assets copied to correct locations
4. **Production**: Tauri serves bundled CSS from correct paths
5. **Runtime**: Browser loads CSS and applies styles

---

**Status**: ✅ **RESOLVED** - CSS handling works correctly in both development and production environments. 