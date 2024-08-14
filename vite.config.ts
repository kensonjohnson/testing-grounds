import { defineConfig, loadEnv } from "vite";
import { join } from "node:path";
import { cwd } from "node:process";
import react from "@vitejs/plugin-react";

// Read about the Vite config here: https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { PORT } = loadEnv(mode, cwd(), "");
  const apiProxy = `http://localhost:${PORT}`;
  return {
    root: "frontend",
    build: {
      outDir: join(cwd(), "build/frontend"),
      emptyOutDir: true,
    },
    plugins: [react()],
    server: {
      // Proxy API requests to the backend, to make them appear as if
      // they are coming from the same origin.
      // Read up here: https://vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        // Shorthand syntax
        // http://localhost:5173/ping -> http://localhost:3000/ping
        "/ping": apiProxy,
        "/auth": apiProxy,
        "/user": apiProxy,
        "/list": apiProxy,
        "/task": apiProxy,
        "/conversation": apiProxy,
        "/billing": apiProxy,
        "/checkout": apiProxy,

        // Full syntax
        // http://localhost:5173/api/foo -> http://localhost:3000/foo
        // "/api": {
        //   target: "http://localhost:3000",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, ""),
        // },
      },
    },
  };
});
