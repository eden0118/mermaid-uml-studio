import type { Config } from 'tailwindcss';
import { THEME_CONFIG } from './lib/theme.config';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 從統一配置檔引入主色系
      colors: {
        primary: THEME_CONFIG.colors.primary,
        success: { DEFAULT: THEME_CONFIG.colors.semantic.success },
        error: { DEFAULT: THEME_CONFIG.colors.semantic.error },
        warning: { DEFAULT: THEME_CONFIG.colors.semantic.warning },
        info: { DEFAULT: THEME_CONFIG.colors.semantic.info },
      },
      // 動畫時間配置
      transitionDuration: {
        fast: THEME_CONFIG.animation.duration.fast,
        normal: THEME_CONFIG.animation.duration.normal,
        slow: THEME_CONFIG.animation.duration.slow,
      },
      // 陰影系統
      boxShadow: THEME_CONFIG.shadows,
      // 圓角系統
      borderRadius: THEME_CONFIG.borderRadius,
      // Z-index 系統
      zIndex: {
        dropdown: '20',
        sticky: '30',
        modal: '50',
        popover: '60',
        tooltip: '70',
      },
    },
  },
  plugins: [],
};

export default config;
