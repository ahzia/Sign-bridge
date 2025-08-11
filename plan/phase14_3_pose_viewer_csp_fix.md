# Pose-Viewer CSP Fix Documentation

## Problem Description

When clicking the "translate" button in the animation section of the production build, the application showed a Content Security Policy (CSP) error:

```
Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'sha256-5w1GcoySj68RJSEGpnuLih80wLux2boy2x5j3pa52cA=' 'sha256-qWerZvGSKDfxC7RLvmPt6MZ6IBvvVMgmMLFm9XITAnU=' 'sha256-wM3DlOprXdSbNOR6FlvfkB92mojtySNhrH/WKGTBPLM=' 'sha256-bOoPZzqP5TydFiBZG6xihdL/lO4lX8aBkySQYdnZdCw=' 'sha256-XL2/sGqBmNtSftmGQCUv5/pejDG1hkN+Tdxm6f5dsbA=' 'sha256-gy9OPQtpTFXbHyRadU/ODlsEwGrfgL9l6RvN46e6wEQ=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='".
```

This error occurred specifically when the `pose-viewer` web component was trying to load and execute its animation functionality.

## Root Cause Analysis

The issue was caused by the `pose-viewer` web component using dynamic code execution through:

1. **Dynamic Imports**: The component uses `bootstrapLazy` function that dynamically loads and executes code
2. **Missing Script-Src Directive**: The CSP configuration only had `default-src` and `style-src` directives, but was missing an explicit `script-src` directive
3. **Web Component Registration**: The `defineCustomElements` function from `pose-viewer/loader` uses dynamic script evaluation to register the custom element

### Technical Details

The `pose-viewer` component structure:
```
pose-viewer/
├── loader/
│   ├── index.js (contains polyfill code)
│   └── index.es2017.js
└── dist/esm/
    ├── loader.js (main loader with bootstrapLazy)
    └── index-82963b9b.js (contains dynamic loading logic)
```

The `bootstrapLazy` function in the loader dynamically creates and registers the `pose-viewer` custom element, which requires `eval`-like functionality that was being blocked by CSP.

## Solution Implemented

### Updated CSP Configuration

**Before:**
```json
{
  "app": {
    "security": {
      "csp": "default-src blob: data: filesystem: ws: http: https: 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' blob: data: filesystem: http: https:"
    }
  }
}
```

**After:**
```json
{
  "app": {
    "security": {
      "csp": "default-src blob: data: filesystem: ws: http: https: 'unsafe-eval' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: filesystem: http: https:; style-src 'self' 'unsafe-inline' blob: data: filesystem: http: https:"
    }
  }
}
```

### Key Changes

1. **Added Explicit Script-Src Directive**: Added `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: filesystem: http: https:` to explicitly allow script execution
2. **Maintained Security**: Kept the existing `default-src` and `style-src` directives for comprehensive security coverage
3. **Web Component Support**: The `unsafe-eval` directive is necessary for web components that use dynamic code generation

## Files Modified

### `frontend/src-tauri/tauri.conf.json`
- **Line 15**: Updated CSP directive to include explicit `script-src` configuration
- **Impact**: Allows pose-viewer web component to execute its dynamic loading code

## Verification Steps

1. **Build Verification**: Application builds successfully without CSP-related errors
2. **Production Testing**: Animation section loads correctly when clicking "translate"
3. **Web Component Loading**: `pose-viewer` custom element registers and functions properly
4. **Animation Playback**: 3D pose animations play without CSP violations

## Technical Details

### Why This Fix Works

1. **Explicit Script Permissions**: The `script-src` directive explicitly allows the web component to execute its dynamic code
2. **Web Component Compatibility**: Modern web components often require `unsafe-eval` for dynamic element registration
3. **Tauri Security Model**: Tauri's CSP is more restrictive than web browsers, requiring explicit permissions for dynamic code execution

### Security Considerations

- **`unsafe-eval`**: Required for web components but should be used carefully
- **`unsafe-inline`**: Allows inline scripts, necessary for web component functionality
- **Scope Limitation**: The CSP still restricts other potentially dangerous sources

## Prevention

To prevent similar issues in the future:

1. **Test Web Components**: Always test web components in production builds
2. **CSP Configuration**: Include explicit `script-src` directives when using dynamic web components
3. **Security Review**: Regularly review CSP settings for security vs. functionality balance
4. **Component Documentation**: Check web component documentation for CSP requirements

## Related Issues

This fix also resolves:
- Dynamic web component loading issues
- CSP violations in production builds
- Animation functionality in Tauri applications

## Testing

The fix was verified by:
1. Building the production application: `npm run build`
2. Testing the animation section: Click "translate" button
3. Confirming pose-viewer loads without CSP errors
4. Verifying animation playback functionality

---

**Date**: August 11, 2024  
**Status**: ✅ Resolved  
**Impact**: Critical - Animation functionality now works in production builds 