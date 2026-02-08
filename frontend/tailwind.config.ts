import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
    darkMode: ["class"],
    content: [
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                // Premium E-commerce Color Palette
                border: "hsl(220 13% 91%)",
                input: "hsl(220 13% 91%)",
                ring: "hsl(222 47% 11%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(222 47% 11%)",
                
                // Collector Brand Colors - Facile à utiliser !
                'collector-navy': {
                    DEFAULT: '#0a1628', // Navy principal
                    50: '#f6f7f9',
                    100: '#eceef2',
                    200: '#d4dae3',
                    300: '#afb9cb',
                    400: '#8493ae',
                    500: '#637394',
                    600: '#4f5b7a',
                    700: '#414a64',
                    800: '#384054',
                    900: '#0a1628',
                },
                
                'collector-gold': {
                    DEFAULT: '#d4af37', // Or luxe
                    50: '#fefcf3',
                    100: '#fef7e0',
                    200: '#fdedb8',
                    300: '#fbe089',
                    400: '#f8cf58',
                    500: '#d4af37',
                    600: '#c99b2a',
                    700: '#a67d22',
                    800: '#896521',
                    900: '#6f521f',
                },
                
                'collector-charcoal': {
                    DEFAULT: '#36454f', // Charcoal bleu
                    50: '#f6f7f8',
                    100: '#e8ebed',
                    200: '#d1d8dd',
                    300: '#adb7c2',
                    400: '#8391a1',
                    500: '#667584',
                    600: '#525f6e',
                    700: '#444f5b',
                    800: '#36454f',
                    900: '#2d383f',
                },
                
                'collector-silver': {
                    DEFAULT: '#c0c0c0', // Argent
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#c0c0c0',
                    500: '#a3a3a3',
                    600: '#737373',
                    700: '#525252',
                    800: '#404040',
                    900: '#262626',
                },
                
                'collector-emerald': {
                    DEFAULT: '#10b981', // Vert success
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                
                'collector-red': {
                    DEFAULT: '#ef4444', // Rouge erreur
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                
                primary: {
                    DEFAULT: "hsl(222 47% 11%)",
                    foreground: "hsl(0 0% 100%)",
                },
                
                secondary: {
                    DEFAULT: "hsl(215 25% 27%)",
                    foreground: "hsl(0 0% 100%)",
                },
                
                accent: {
                    DEFAULT: "hsl(37 90% 51%)",
                    foreground: "hsl(222 47% 11%)",
                },
                
                success: {
                    DEFAULT: "hsl(142 71% 45%)",
                    foreground: "hsl(0 0% 100%)",
                },
                
                destructive: {
                    DEFAULT: "hsl(0 84% 60%)",
                    foreground: "hsl(0 0% 100%)",
                },
                
                muted: {
                    DEFAULT: "hsl(220 13% 96%)",
                    foreground: "hsl(220 9% 46%)",
                },
                
                popover: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(222 47% 11%)",
                },
                
                card: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(222 47% 11%)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "border-beam": {
                    "100%": {
                        "offset-distance": "100%",
                    },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
            },
        },
    },
    plugins: [animate],
} satisfies Config;

export default config;
