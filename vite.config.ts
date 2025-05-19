import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const external = process.env.BUILD === "es" ? ["react", "react-dom"] : [];

export default defineConfig({
  plugins: [react()],
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
