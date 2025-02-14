import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/punchcard/",
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: resolve(__dirname, "src/playground/index.html"),
  //     },
  //   },
  // },
});
