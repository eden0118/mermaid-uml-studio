/**
 * 主題配置系統
 * ============================================
 * 集中管理所有可調控的主題參數
 * 包含顏色、尺寸、動畫等配置
 */

export const THEME_CONFIG = {
  /**
   * 主色系配置
   * ============================================
   * 使用語意化命名，方便全域調整
   */
  colors: {
    // 主色調 - 可根據品牌需求調整
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // 主要品牌色
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    // 功能色系
    semantic: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    // 灰階系統
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },

  /**
   * 編輯器配置
   * ============================================
   */
  editor: {
    // 預設字體大小範圍
    fontSize: {
      min: 10,
      max: 24,
      default: 14,
    },
    // 預設行高範圍
    lineHeight: {
      min: 1.0,
      max: 2.5,
      default: 1.5,
      step: 0.1,
    },
    // 字型選項
    fontFamilies: {
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      firaCode: '"Fira Code", "Cascadia Code", monospace',
    },
  },

  /**
   * 動畫配置
   * ============================================
   */
  animation: {
    // 標準過渡時間
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    // 緩動函數
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  /**
   * 間距系統
   * ============================================
   */
  spacing: {
    toolbar: {
      height: '3.5rem', // 56px
      padding: '1rem',
    },
    editor: {
      padding: '1rem',
      lineNumberWidth: '2.5rem', // 40px
    },
    modal: {
      padding: '1.5rem',
      maxWidth: '42rem', // 672px
    },
  },

  /**
   * 斷點配置
   * ============================================
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * 陰影系統
   * ============================================
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  /**
   * 圓角配置
   * ============================================
   */
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  /**
   * Z-index 層級系統
   * ============================================
   */
  zIndex: {
    dropdown: 20,
    sticky: 30,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },
} as const;

/**
 * 取得編輯器預設配置
 */
export const getDefaultEditorConfig = () => ({
  fontSize: THEME_CONFIG.editor.fontSize.default,
  fontFamily: THEME_CONFIG.editor.fontFamilies.mono,
  lineHeight: THEME_CONFIG.editor.lineHeight.default,
});

/**
 * 取得預覽預設配置
 */
export const getDefaultPreviewConfig = () => ({
  customCss: '',
});

/**
 * 型別匯出，供其他模組使用
 */
export type ThemeConfig = typeof THEME_CONFIG;
export type ColorPalette = typeof THEME_CONFIG.colors;
export type EditorConfigOptions = typeof THEME_CONFIG.editor;
