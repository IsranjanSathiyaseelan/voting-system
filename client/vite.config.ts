import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/votesecureapi": {
        target: "https://localhost:8243",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
