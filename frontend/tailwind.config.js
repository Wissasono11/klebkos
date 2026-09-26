/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#d9562b',
          'primary-hover': '#c2471f',
          'primary-subtle': '#fceee8',
          secondary: '#3d0c1b',
          'secondary-hover': '#2c0a12',
          'secondary-subtle': '#f4e8eb',
          bg: '#f9f8f5',
          surface: '#ffffff',
          'surface-2': '#f3f0e9',
          'surface-dark': '#1e1d1b',
          'text-main': '#1a1a1a',
          'text-muted': '#6b6661',
          border: '#e8e5df',
          'border-strong': '#d1ccc0',
        },
        semantic: {
          success: '#10b981',
          'success-subtle': '#e6f7f0',
          warning: '#f59e0b',
          'warning-subtle': '#fef3c7',
          error: '#ef4444',
          'error-subtle': '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Open Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'bento': '1.25rem',
      }
    },
  },
  plugins: [],
}
