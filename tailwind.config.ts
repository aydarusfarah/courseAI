import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft:  "0 4px 24px rgba(15, 23, 42, 0.07)",
        glow:  "0 0 0 3px rgba(99, 102, 241, 0.18), 0 4px 24px rgba(99, 102, 241, 0.15)",
        "glow-blue": "0 0 0 3px rgba(59, 130, 246, 0.20), 0 4px 24px rgba(59, 130, 246, 0.12)",
        card:  "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)"
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        // vivid blue accent
        blue: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a"
        },
        // violet accent for glow highlights
        violet: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95"
        }
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)",
        "card-gradient":  "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      transitionDuration: {
        DEFAULT: "200ms"
      }
    }
  },
  plugins: []
};

export default config;
