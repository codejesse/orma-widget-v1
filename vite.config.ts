// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser',
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
      plugins: [rollupNodePolyFill],
    },
  },
});