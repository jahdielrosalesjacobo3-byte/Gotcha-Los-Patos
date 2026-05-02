/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Anton', 'Impact', 'sans-serif'],
                body: ['Montserrat', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                bebas: ['Bebas Neue', 'Impact', 'sans-serif'],
            },
            colors: {
                bg: {
                    DEFAULT: '#0A0D0A',
                    surface: '#141A14',
                    deep: '#050605',
                },
                neon: {
                    green: '#39FF14',
                    orange: '#FF4500',
                    magenta: '#FF007F',
                },
                forest: {
                    DEFAULT: '#1F2A1F',
                    deep: '#0F1A10',
                    moss: '#3D5C3A',
                    olive: '#556B2F',
                },
                tactical: {
                    khaki: '#7A6B4F',
                    sand: '#C2B280',
                    char: '#1B1F1B',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'pulse-neon': {
                    '0%, 100%': { boxShadow: '0 0 25px rgba(57,255,20,0.55)' },
                    '50%': { boxShadow: '0 0 60px rgba(57,255,20,0.85)' },
                },
                'splatter': {
                    '0%': { transform: 'scale(0.8) rotate(0deg)', opacity: 0 },
                    '50%': { transform: 'scale(1.1) rotate(8deg)', opacity: 1 },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'scan': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-neon': 'pulse-neon 2.4s ease-in-out infinite',
                'splatter': 'splatter 0.6s ease-out',
                'float-slow': 'float-slow 6s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
