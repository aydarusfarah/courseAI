import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF", 100: "#E0E7FF", 200: "#C7D2FE",
          300: "#A5B4FC", 400: "#818CF8", 500: "#6366F1",
          600: "#4F46E5", 700: "#4338CA", 800: "#3730A3", 900: "#312E81"
        },
        violet: {
          50: "#F5F3FF", 100: "#EDE9FE", 200: "#DDD6FE",
          300: "#C4B5FD", 400: "#A78BFA", 500: "#8B5CF6",
          600: "#7C3AED", 700: "#6D28D9", 800: "#5B21B6", 900: "#4C1D95"
        },
        blue: {
          50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE",
          300: "#93C5FD", 400: "#60A5FA", 500: "#3B82F6",
          600: "#2563EB", 700: "#1D4ED8", 800: "#1E40AF", 900: "#1E3A8A"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#F8FAFC",
          dark: "#111827",
          "dark-2": "#1F2937"
        }
      },
      boxShadow: {
        xs:   "0 1px 2px rgba(15,23,42,0.04)",
        sm:   "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        md:   "0 4px 6px rgba(15,23,42,0.05), 0 2px 4px rgba(15,23,42,0.04)",
        lg:   "0 10px 15px rgba(15,23,42,0.05), 0 4px 6px rgba(15,23,42,0.03)",
        xl:   "0 20px 25px rgba(15,23,42,0.06), 0 8px 10px rgba(15,23,42,0.03)",
        soft: "0 4px 24px rgba(15,23,42,0.07)",
        card: "0 1px 3px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04)",
        glow: "0 0 0 3px rgba(99,102,241,0.16), 0 4px 20px rgba(99,102,241,0.12)",
        "glow-sm": "0 0 0 2px rgba(99,102,241,0.14)",
        "glow-blue": "0 0 0 3px rgba(59,130,246,0.18), 0 4px 20px rgba(59,130,246,0.10)",
        "glow-emerald": "0 0 0 3px rgba(16,185,129,0.18)",
        inner: "inset 0 1px 2px rgba(15,23,42,0.06)"
      },
      backgroundImage: {
        "brand-gradient":   "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)",
        "brand-gradient-r": "linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #4F46E5 100%)",
        "subtle-gradient":  "linear-gradient(145deg, #FFFFFF 0%, #F8FAFF 100%)",
        "dark-gradient":    "linear-gradient(145deg, #111827 0%, #0B1220 100%)",
        "hero-gradient":    "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 60%)",
        "card-glow":        "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }]
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      animation: {
        "fade-up":   "fadeUp 200ms ease both",
        shimmer:     "shimmer 1.4s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite"
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
