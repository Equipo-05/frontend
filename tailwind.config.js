/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#f8f9ff",
        "surface-dim": "#d1dbec",
        "surface-container": "#eeedf4",
        "surface-container-low": "#f4f3fa",
        "outline": "#737784",
        "outline-variant": "#c3c6d5",
        "primary": "#001e52",
        "on-primary": "#ffffff",
        "primary-container": "#00327d",
        "on-primary-container": "#7d9eee",
        "secondary": "#006878",
        "on-secondary": "#ffffff",
        "background": "#faf8ff",
        "on-surface": "#121c28",
        "on-surface-variant": "#434651",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "gutter": "24px",
      },
      fontFamily: {
        "body-md": ["Atkinson Hyperlegible Next", "sans-serif"],
        "label-md": ["Atkinson Hyperlegible Next", "sans-serif"],
        "headline-lg": ["Atkinson Hyperlegible Next", "sans-serif"],
        "caption": ["Atkinson Hyperlegible Next", "sans-serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}