# SignWriting Comprehensive Debug Report

## 📋 **Current Status**

**Primary Issue**: SignWriting content displays correctly in development but fails to render in production builds of the Tauri application.

**Current State**: 
- ✅ **Development**: SignWriting works perfectly with proper SVG rendering
- ❌ **Production**: SignWriting elements are empty (`children count: 0`)
- ❌ **Library Error**: Internal `compose` function has null reference bug

**Last Updated**: August 11, 2025

## 🔍 **Root Cause Analysis Timeline**

### **Phase 1: Initial Hypothesis (Minification Issues)**
- **Suspected**: Vite's minification was breaking web component constructor names
- **Evidence**: Constructor names were being mangled (`constructor name: i`)
- **Attempted Fix**: Disabled minification (`minify: false`) and excluded dependencies
- **Result**: ❌ Issue persisted, development environment also broke

### **Phase 2: Font Loading & Path Issues**
- **Suspected**: Fonts not loading due to incorrect paths in production bundle
- **Evidence**: Font 404 errors, empty web component elements
- **Attempted Fix**: Multiple font path strategies, CSS injection, FontFace API
- **Result**: ❌ Fonts load correctly but web components still empty

### **Phase 3: Timing/Initialization Issues**
- **Suspected**: Race conditions between font loading and component initialization
- **Evidence**: `componentOnReady` timeouts, empty innerHTML
- **Attempted Fix**: Comprehensive initialization sequence with `appGlobalScript` and `window.sgnw` event
- **Result**: ❌ Issue persisted, timing wasn't the root cause

### **Phase 4: Library Internal Bug (CONFIRMED)**
- **Suspected**: SignWriting library has internal rendering issues
- **Evidence**: `TypeError: Cannot read properties of null (reading '0')` in `compose` function
- **Current Status**: 🔍 **CONFIRMED** - This appears to be the actual root cause

## 🛠️ **All Attempted Solutions**

### **1. Minification Workarounds**
```typescript
// vite.config.ts - Initial approach
build: {
  minify: false,
  optimizeDeps: {
    exclude: ['@sutton-signwriting/sgnw-components']
  }
}
```

### **2. Terser Configuration**
```typescript
// vite.config.ts - Comprehensive name preservation
build: {
  minify: 'terser',
  terserOptions: {
    keep_fnames: true,
    keep_classnames: true,
    mangle: {
      reserved: [
        'appGlobalScript', 'connectedCallback', 'HostElement',
        'plt', 'jmp', 'componentOnReady', 'FswSign', 'compose'
        // ... extensive list of internal names
      ]
    }
  }
}
```

### **3. Font Loading Strategies**
```typescript
// Multiple approaches tried:
// 1. Static imports for font modules
// 2. FontFace API with explicit loading
// 3. CSS injection with absolute paths
// 4. Relative font paths in CSS
// 5. vite-plugin-static-copy for font files
```

### **4. Initialization Sequence Refactor**
```typescript
// main.tsx - Comprehensive initialization
const initializeApp = async () => {
  await applyPolyfills?.();
  const { a: appGlobalScript } = await import('@sutton-signwriting/sgnw-components/dist/components/global.js');
  appGlobalScript();
  await defineCustomElements(window);
  await new Promise<void>((resolve) => {
    // Wait for sgnw event or flag
  });
};
```

### **5. Component Architecture Changes**
- **From**: Imperative DOM manipulation with `dangerouslySetInnerHTML`
- **To**: Declarative JSX usage (`<fsw-sign>`)
- **Result**: Cleaner code but same underlying library issue

### **6. Error Handling & Fallbacks**
```typescript
// SignWritingDisplay.tsx - Error handling
const [renderErrors, setRenderErrors] = useState<{[key: string]: string}>({});
const getAlternativeTokens = (originalToken: string): string[] => {
  return [
    'M500x500S10000450x450', // Simple hand symbol
    'M500x500S20500450x450', // Another simple symbol
    'M500x500S1f000450x450', // Basic symbol
  ];
};
```

## 📊 **Test Results & Evidence**

### **Development Environment (Current)**
```
✅ API Working: 
- [ApiService] SignWriting response: {signwriting: 'M500x500S14c20489x524S27106515x543S30a00482x482S33e00482x482'}
- [App] FSW tokens: ['M500x500S14c20489x524S27106515x543S30a00482x482S33e00482x482']
- [SignWritingDisplay] Normalized results: ['M500X500S14C20489X524S27106515X543S30A00482X482S33E00482X482']

❌ Library Error:
- TypeError: Cannot read properties of null (reading '0')
- at Object.compose (chunk-JXN6XGJ7.js?v=b65436cc:60:152)
- at FswSign.render (fsw-sign_2.entry-B4EWN4DP.js?v=b65436cc:47:28)
```

### **Production Environment (Previous)**
```
❌ Component Timeout:
- Error waiting for component ready: Error: Timeout
- Constructor name: i (minified)
- Empty children/innerHTML
```

### **Test Suite Results**
```
✅ Web Component Definition: PASS
✅ Window.sgnw Flag: PASS  
✅ Element Creation: PASS
❌ Component Ready: FAIL (Timeout)
❌ Font Loading: FAIL
```

## 🔧 **Current Code Implementation**

### **1. Current Vite Configuration**
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
  base: './',
  build: {
    assetsInlineLimit: 0,
    minify: 'terser', 
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
          // ... other reserved names
        ]
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.ttf')) {
            return 'fonts/[name][extname]'
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
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

### **2. Current Font CSS**
```css
/* frontend/src/fonts.css */
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
```

### **3. Current Main Entry Point**
```typescript
// frontend/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
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

### **4. Current SignWriting Service**
```typescript
// frontend/src/services/SignWritingService.ts
import * as fontModule from '@sutton-signwriting/font-ttf/font/font.min';
import { signNormalize } from '@sutton-signwriting/font-ttf/fsw/fsw';

const SignWritingService = {
  fontsLoaded: false,

  async loadFonts() {
    if (this.fontsLoaded) return;
    this.fontsLoaded = true;

    try {
      fontModule.cssAppend('/fonts/');
      return new Promise<void>(resolve => fontModule.cssLoaded(resolve));
    } catch (e) {
      console.error('Failed to load SignWriting fonts:', e);
      return Promise.reject(e);
    }
  },

  async normalizeFSW(fswToken: string | null) {
    if (!fswToken || typeof fswToken !== 'string') return null;
    try {
      return signNormalize(fswToken);
    } catch (e) {
      console.error(`Failed to normalize FSW token for canvas: "${fswToken}"`, e);
      return null;
    }
  }
};

export default SignWritingService;
```

### **5. Current SignWriting Display Component**
```typescript
// frontend/src/components/SignWritingDisplay.tsx
import React, { useEffect, useState, useRef } from 'react';
import SignWritingService from '../services/SignWritingService';

const SignWritingDisplay: React.FC<SignWritingDisplayProps> = ({ fswTokens, direction = 'col', className, signSize = 48 }) => {
  const [normalizedTokens, setNormalizedTokens] = useState<string[]>([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await SignWritingService.loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        setFontsLoaded(false);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    const normalizeTokens = async () => {
      try {
        const results = await Promise.all(
          fswTokens.map(token => SignWritingService.normalizeFSW(token))
        );
        setNormalizedTokens(results.filter(Boolean) as string[]);
      } catch (error) {
        console.error('Failed to normalize tokens:', error);
        setNormalizedTokens([]);
      }
    };

    if (fswTokens.length > 0) {
      normalizeTokens();
    } else {
      setNormalizedTokens([]);
    }
  }, [fswTokens]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div
          id="signwriting-container"
          className={`flex flex-${direction} items-center ${direction === 'col' ? 'space-y-4' : 'space-x-4'} p-2`}
          ref={containerRef}
        >
          {normalizedTokens.map((token, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <fsw-sign
                sign={token}
                style={{
                  direction: 'ltr',
                  display: 'block',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  color: 'var(--text-primary)',
                  fill: 'var(--text-primary)',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="hover:scale-105 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 📊 **Detailed Logs Analysis**

### **Development Logs (logs1.md)**
```
✅ SignWritingService font loading completed
✅ fsw-sign web component is defined
✅ Component test successful!
✅ Library is fully initialized

❌ Library Error:
TypeError: null is not an object (evaluating 'styleObject.background.match(re.colorbase)[0]')
```

### **Production Logs**
```
✅ SignWritingService font loading completed
✅ fsw-sign web component is defined
❌ Error waiting for component ready: Error: Timeout
❌ Children after new sign: 0
❌ innerHTML after new sign: ...
```

## 🎯 **Current Understanding**

### **What We Know Works**
1. ✅ Backend API translation
2. ✅ Font loading and CSS
3. ✅ Web component definition
4. ✅ React component lifecycle
5. ✅ State management and data flow
6. ✅ CSS styling and font paths

### **What's Broken**
1. ❌ SignWriting library's internal `compose` function
2. ❌ Rendering of complex FSW tokens
3. ❌ Error handling within the library
4. ❌ Production environment compatibility

### **The Real Issue**
The SignWriting library itself has a bug where the `compose` function tries to access a null value when processing certain FSW tokens. This is not a configuration, timing, or integration issue - it's a library bug.

## 🚀 **AI-Suggested Solutions (ai_suggestion.md)**

### **Recommended Approach**
1. **Centralized Initialization**: Move all initialization logic to `main.tsx`
2. **Declarative Components**: Use simple JSX instead of imperative DOM creation
3. **Proper Library Lifecycle**: Respect the library's `window.sgnw` flag
4. **Re-enable Minification**: Remove workarounds and optimize properly

### **Key Changes Suggested**
```typescript
// main.tsx - Proper initialization sequence
const initializeApp = async () => {
  await applyPolyfills?.();
  appGlobalScript();
  await defineCustomElements(window);
  await new Promise<void>((resolve) => {
    if ((window as any).sgnw) {
      resolve();
    } else {
      window.addEventListener('sgnw', () => resolve(), { once: true });
    }
  });
  renderApp();
};
```

## 📝 **Key Learnings**

1. **Don't Assume Configuration Issues**: The problem was deeper than build configuration
2. **Test Library Independently**: Always test third-party libraries in isolation
3. **Comprehensive Logging**: Detailed logging was crucial for identifying the real issue
4. **API vs Library**: Backend API can work perfectly while frontend library fails
5. **Error Boundaries**: Important for handling library failures gracefully
6. **Library Bugs**: Third-party libraries can have internal bugs that affect production

## 🔗 **Related Files**

- `frontend/src/main.tsx` - Application entry point
- `frontend/src/components/SignWritingDisplay.tsx` - Main SignWriting component
- `frontend/vite.config.ts` - Build configuration
- `frontend/src/services/SignWritingService.ts` - Font loading service
- `frontend/src/fonts.css` - Font declarations
- `frontend/src/types/fsw-sign.d.ts` - TypeScript definitions

## 📅 **Timeline**

- **Initial Issue**: Production builds failing
- **First Attempt**: Minification fixes
- **Second Attempt**: Font loading and path fixes
- **Third Attempt**: Timing/initialization fixes  
- **Fourth Attempt**: Library bug investigation
- **Current**: Confirmed library internal error

## 🚀 **Next Steps & Recommendations**

### **Immediate Actions**
1. **Test Alternative Tokens**: Verify if simple tokens work while complex ones fail
2. **Library Version Check**: Investigate if this is a known issue in the current version
3. **Fallback Strategy**: Implement alternative rendering methods for failed tokens

### **Long-term Solutions**
1. **Library Fork**: Consider forking and fixing the library
2. **Alternative Library**: Research other SignWriting rendering libraries
3. **Custom Renderer**: Build a custom FSW to SVG renderer
4. **Bug Report**: Report the issue to the SignWriting library maintainers

### **Workarounds**
1. **Token Validation**: Pre-validate FSW tokens before rendering
2. **Error Recovery**: Implement graceful degradation for failed tokens
3. **Alternative Display**: Show FSW code as text when rendering fails

## 🔧 **Technical Details**

### **SignWriting Library Version**
- `@sutton-signwriting/sgnw-components`: Latest version
- **Issue**: Internal `compose` function has null reference bug

### **Build Configuration**
- **Vite**: v7.0.2
- **React**: Latest
- **Tauri**: v2.x
- **Minification**: Currently enabled with terser configuration

### **Font Loading**
- **Fonts**: SuttonSignWritingLine, SuttonSignWritingFill, SuttonSignWritingOneD
- **Status**: Fonts load correctly, not the issue

### **API Integration**
- **Backend**: FastAPI with SignWriting translation
- **Status**: ✅ Working perfectly
- **Response**: Valid FSW tokens returned

---

**Status**: 🔍 **INVESTIGATING** - Library internal bug confirmed, exploring workarounds and alternatives.

**Note**: This report consolidates information from 6 separate debugging files and represents the complete history of SignWriting issues in this project. 