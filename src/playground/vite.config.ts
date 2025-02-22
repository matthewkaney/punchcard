import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

import solidPlugin from "vite-plugin-solid";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/punchcard/",
  plugins: [solidPlugin()],
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: resolve(__dirname, "src/playground/index.html"),
  //     },
  //   },
  // },
});
