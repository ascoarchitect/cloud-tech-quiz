/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4dabf5',
            main: '#1976d2',
            dark: '#1565c0',
          },
          secondary: {
            light: '#f5f5f5',
            main: '#f0f0f0',
            dark: '#e0e0e0',
          },
          success: {
            light: '#81c784',
            main: '#4caf50',
            dark: '#388e3c',
          },
          warning: {
            light: '#ffb74d',
            main: '#ff9800',
            dark: '#f57c00',
          },
          error: {
            light: '#e57373',
            main: '#f44336',
            dark: '#d32f2f',
          },
        },
        fontFamily: {
          sans: ['Inter', 'Roboto', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        boxShadow: {
          card: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
          raised: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '2rem',
        },
      },
    },
    plugins: [],
    // This ensures Tailwind's utility classes don't conflict with MUI
    corePlugins: {
      preflight: false,
    },
  }