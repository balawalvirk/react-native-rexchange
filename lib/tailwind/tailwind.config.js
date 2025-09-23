const plugin = require('tailwindcss/plugin');

module.exports = {
  theme: {
    screens: {
      sm: '380px',
      md: '420px',
      lg: '680px',
      tablet: '1024px',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        yellow: '#f1c84c',
        red: '#ca322f',
        green: '#10998e',
        facebookBlue: '#1877f2',
        overlay: 'rgba(0,0,0,0.5)',
        black: '#000000',
        purple: '#5d26c1',
        borderGray: '#E5E5E5',
        darkGray: '#575757',
        light: '#fafafa',
        white: 'white',
        medGreen: 'rgba(16, 153, 142, 0.75)',
        lightGreen: 'rgba(91, 180, 172, 0.1)',
        lightPurple: 'rgba(94, 39, 191, 0.13)',
        lightOrange: 'rgba(255, 183, 105, 0.1)',
        orange: '#f19948'
      },
      borderWidth: {
        1: '1px',
      },
      fontFamily: {
        rajdhani700: 'Rajdhani_700Bold',
        rajdhani600: 'Rajdhani_600SemiBold',
        rajdhani500: 'Rajdhani_500Medium',
        overpass700: 'Overpass_700Bold',
        overpass600: 'Overpass_600SemiBold',
        overpass500: 'Overpass_500Medium',
        overpass400: 'Overpass_400Regular',
        13: '13',
        7: '7',
      },
      flex: {
        '50': '0 0 50%'
      }
    },
  },
};
