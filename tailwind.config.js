import fs from "fs";

/** @type {import('tailwindcss').Config} */

let theme = {};
try {
  const themePath = "./theme.json";

  if (fs.existsSync(themePath)) {
    theme = JSON.parse(fs.readFileSync(themePath, "utf-8"));
  }
} catch (err) {
  console.error('failed to parse custom styles', err)
}

const defaultTheme = {
  container: {
    center: true,
    padding: "2rem",
  },
  extend: {
    screens: {
      coarse: { raw: "(pointer: coarse)" },
      fine: { raw: "(pointer: fine)" },
      pwa: { raw: "(display-mode: standalone)" },
    },
    colors: {
      background: "var(--color-background)",
      foreground: "var(--color-foreground)",
      card: {
        DEFAULT: "var(--color-card)",
        foreground: "var(--color-card-foreground)",
      },
      popover: {
        DEFAULT: "var(--color-popover)",
        foreground: "var(--color-popover-foreground)",
      },
      primary: {
        DEFAULT: "var(--color-primary)",
        foreground: "var(--color-primary-foreground)",
      },
      secondary: {
        DEFAULT: "var(--color-secondary)",
        foreground: "var(--color-secondary-foreground)",
      },
      muted: {
        DEFAULT: "var(--color-muted)",
        foreground: "var(--color-muted-foreground)",
      },
      accent: {
        DEFAULT: "var(--color-accent)",
        foreground: "var(--color-accent-foreground)",
      },
      destructive: {
        DEFAULT: "var(--color-destructive)",
        foreground: "var(--color-destructive-foreground)",
      },
      warning: {
        DEFAULT: "var(--color-warning)",
        foreground: "var(--color-warning-foreground)",
      },
      border: "var(--color-border)",
      input: "var(--color-input)",
      ring: "var(--color-ring)",
      chart: {
        1: "var(--color-chart-1)",
        2: "var(--color-chart-2)",
        3: "var(--color-chart-3)",
        4: "var(--color-chart-4)",
        5: "var(--color-chart-5)",
      },
    },
    borderRadius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
      "2xl": "var(--radius-2xl)",
      full: "var(--radius-full)",
    },
  },
  darkMode: "class",
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { ...defaultTheme, ...theme },
};