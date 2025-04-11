// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { resolve } from 'path';
import rollupNodePolyFill from "rollup-plugin-node-polyfills";
import inject from "@rollup/plugin-inject";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env": {}, // Define process.env to avoid undefined errors
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: "process/browser", // Alias for process
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'OrmaFeedbackWidget',
      fileName: (format) => `feedback-widget.${format}.js`,
    },
    target: "esnext",
    rollupOptions: {
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      external: ["react", "react-dom"], // Ensure React is external
      plugins: [
        rollupNodePolyFill, // Polyfill Node.js modules
        inject({
          process: "process/browser", // Inject process polyfill
        }),
      ],
    },
  },
});