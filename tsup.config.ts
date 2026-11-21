import { defineConfig } from "tsup";

// Avoid parallel clean race by cleaning dist before invoking tsup in npm run build
export default defineConfig([
  {
    entry: {
      "shared/index": "src/shared/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
  },
  {
    entry: {
      "client/index": "src/client/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    // Keep React JSX runtime external alongside peer dependencies
    external: ["react", "react-dom", "react/jsx-runtime", "zustand", "lucide-react"],
    outDir: "dist",
  },
  {
    entry: {
      "server/index": "src/server/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
  },
]);
