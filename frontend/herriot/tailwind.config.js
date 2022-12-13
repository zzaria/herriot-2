const plugin = require('tailwindcss/plugin');
module.exports = {
    theme: {
        extend: {
            backgroundImage: {

            },
            colors: {
                'glass': {
                    150: 'rgba(0,0,0,0.15)',
                    600: 'rgba(0,0,0,0.6)',
                    900: 'rgba(12,12,12,0.95)',
                },
                'frostedglass': {
                    150: 'rgba(255,255,255,0.15)',
                    600: 'rgba(255,255,255,0.6)',
                    900: 'rgba(255,255,255,0.90)',
                },
                'white': '#ffffff',
                'purple': '#3f3cbb',
                'midnight': '#121063',
                'metal': '#565584',
                'tahiti': '#3ab7bf',
                'silver': '#ecebff',
                'bubble-gum': '#ff77e9',
                'bermuda': '#78dcca',
            },
            screens: {
                '3xl': '2100px',
                // => @media (min-width: 1280px) { ... }
            },
        }
    },
    corePlugins: {
        preflight: false,
    }
}