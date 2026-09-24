/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5651D8",
          hover: "#4843c2",
          50: "#f5f4fd",
          100: "#ecebfa",
          200: "#dbd8f7",
          300: "#bfbaf1",
          400: "#9e95e8",
          500: "#5651D8",
          600: "#4843c2",
          700: "#3d37a8",
          800: "#332e8c",
          900: "#2b2773",
        },
        brand: {
          DEFAULT: "#5651D8",
          hover: "#4843c2",
          light: "#EEF0FD",
        },
        border: {
          DEFAULT: "#E0E0E0",
          subtle: "#E0E0E0",
          strong: "#CBD5E1",
        },
        surface: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
          muted: "#F3F4F6",
        },
      },
      backgroundColor: {
        default: "#F9FAFB",
      },
      borderColor: {
        default: "#E0E0E0",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        purple: "0 4px 14px 0 rgba(86, 81, 216, 0.35)",
      },
    },
  },
  plugins: [],
}
