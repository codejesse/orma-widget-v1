// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser', // Alias for process
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'OrmaFeedbackWidget',
      fileName: (format) => `feedback-widget.${format}.js`,
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      external: ['react', 'react-dom'], // Ensure React is external
      plugins: [
        rollupNodePolyFill, // Polyfill Node.js modules
        inject({
          process: 'process/browser', // Inject process polyfill
        }),
      ],
    },
  },
});