import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      "shared/index": "src/shared/index.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
  },
  {
    entry: {
      "client/index": "src/client/index.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom", "zustand", "lucide-react"],
    outDir: "dist",
  },
  {
    entry: {
      "server/index": "src/server/index.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
  },
]);
