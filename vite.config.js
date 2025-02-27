import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5175,
    cors: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "156a-118-200-149-160.ngrok-free.app",
    ],
    proxy: {
      // If you have an API server, you can proxy requests here
    },
  },
});
