import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // WSO2 API Manager gateway: VITE_API_BASE_URL=/votesecureapi/1.0.0/api
      "/votesecureapi": {
        target: "https://localhost:8243",
        changeOrigin: true,
        secure: false, // accept WSO2 self-signed certificate
      },
    },
  },
});
