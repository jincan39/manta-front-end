module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    fontSize: {
      xsss: '.70rem',
      xss: '.75rem',
      xs: '.825rem',
      sm: '.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    },
    letterSpacing: {
      tightest: '-.075em'
    },
    minWidth: {
      layout: 'var(--min-width-layout)',
      table: 'var(--min-width-table)',
      md: 'var(--min-width-md)',
      lg: 'var(--min-width-lg)'
    },
    extend: {
      spacing: {
        128: '32rem',
        108: '27rem',
        113.5: '28.375rem',
        21: '5.375rem'
      },
      width: {
        68: '272px',
        75: '75rem'
      },
      backgroundImage: {
        gradient: 'var(--gradient-button-third)'
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        thirdry: 'var(--color-bg-thirdry)',
        fourth: 'var(--color-bg-fourth)',
        fifth: 'var(--color-bg-fifth)',
        overlay: 'var(--color-bg-overlay)',
        'table-row': 'var(--color-bg-table-row)',
        success: 'var(--color-bg-success)',
        danger: 'var(--color-bg-danger)',
        'manta-gray': 'var(--color-bg-manta-gray)',
        button: 'var(--color-bg-button-primary)',
        'button-secondary': 'var(--color-bg-button-secondary)',
        'button-fourth': 'var(--color-bg-button-fourth)',
        'connect-signer-button': '#2B49EA',
        'connect-wallet-button': '#00AFA5',
        'gradient-button': 'var(--gradient-button-secondary)',
        'light-warning': '#FF8A0020',
        'light-check': '#29CCB950'
      },
      textColor: {
        accent: 'var(--color-text-accent)',
        primary: 'var(--color-text-primary) !important',
        secondary: 'var(--color-text-secondary)',
        thirdry: 'var(--color-text-thirdry)',
        link: 'var(--color-bg-button-primary)',
        warning: 'var(--color-text-warning)',
        'gray-light': 'var(--color-text-gray)',
        'manta-gray': 'var(--color-bg-manta-gray)',
        'manta-blue': 'var(--color-manta-blue)',
        warning: '#FF8A00',
        check: '#29CCB9',
        error: '#FF472E'
      },
      fill: {
        current: 'var(--color-text-secondary)',
        primary: 'var(--color-fill-primary)',
        secondary: 'var(--color-fill-secondary)',
        gray: 'var(--color-fill-gray)'
      },
      borderColor: {
        'manta-gray': 'var(--color-bg-manta-gray)',
        'manta-blue-secondary': '#3A4DAE',
        primary: 'var(--color-border-primary)',
        secondary: 'var(--color-bg-button-primary)',
        warning: '#FF8A00',
        check: '#29CCB9',
        split: 'var(--color-bg-primary)'
      },
      scale: {
        200: '2'
      },
      maxHeight: {
        120: '30rem'
      },
      height: {
        content: 'max-content',
        70: '17.5rem'
      }
    }
  },
  variants: {
    extend: {
      fill: ['group-hover', 'active', 'hover'],
      textColor: ['active'],
      fontWeight: ['hover'],
      zIndex: ['hover'],
      display: ['group-hover']
    }
  },
  plugins: []
};
