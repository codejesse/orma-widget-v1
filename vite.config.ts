import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const isES = process.env.BUILD === "es";
const external = isES ? ["react", "react-dom"] : [];

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {}, // prevent ReferenceError for any other process.env usage
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/wrapper.ts"),
      name: "OrmaWidget",
      fileName: (format) => `orma-widget.${format}.js`,
      formats: ["umd", "es"],
    },
    rollupOptions: {
      external,
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
