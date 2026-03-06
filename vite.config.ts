import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Connect } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
    // HMR configuration for proxy environments (Builder.io, Render, etc.)
    // Don't specify host/port - let Vite auto-detect from browser location
    hmr: {
      overlay: false,
      protocol: "wss",
    },
    // Allow all hosts to connect (important for Render/proxy deployments)
    allowedHosts: "all",
    // SPA fallback: serve index.html for any route that doesn't match a file
    middlewareMode: false,
    cors: true,
  },
  plugins: [
    react(),
    {
      name: "hmr-ping-handler",
      configureServer(server: any) {
        return () => {
          server.middlewares.use((req: Connect.IncomingMessage, res: any, next: any) => {
            // Handle Vite HMR ping requests
            if (req.url?.includes("__vite_ping")) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end('{"ok":true}');
            } else {
              next();
            }
          });
        };
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
  },
  build: {
    minify: "terser",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
