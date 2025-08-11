import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
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
  // You can safely remove this exclusion now. Let Vite handle the dependencies.
  // optimizeDeps: {
  //   exclude: ['@sutton-signwriting/sgnw-components']
  // },
  build: {
    assetsInlineLimit: 0,
    // RE-ENABLE MINIFICATION. The timing issue was the real problem.
    minify: 'terser', 
    terserOptions: {
      // Preserve function names and class names for SignWriting library
      keep_fnames: true,
      keep_classnames: true,
      // Preserve specific function names that SignWriting library needs
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
        // Don't mangle SignWriting library functions
        reserved: [
          'appGlobalScript',
          'defineCustomElements',
          'applyPolyfills',
          'connectedCallback',
          'disconnectedCallback',
          'componentOnReady',
          'attributeChangedCallback',
          'HostElement',
          'StencilLazyHost',
          'registerHost',
          'plt',
          'jmp',
          'getHostRef',
          'connectedCallback',
          'disconnectedCallback',
          'componentWillLoad',
          'componentDidLoad',
          'componentWillRender',
          'componentDidRender',
          'componentWillUpdate',
          'componentDidUpdate',
          'componentDidUnload',
          'render',
          'hostData',
          'hostElement',
          'cmpMeta',
          'deferredConnectedCallbacks',
          'isBootstrapping',
          'appLoadFallback'
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
