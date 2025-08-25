// ============================================================================
// MAIN COMPONENTS - Standalone, work with props
// ============================================================================
export { default as Chessboard } from './src/components/Chessboard';
export { default as Square } from './src/components/Square';
export { default as Arrow } from './src/components/Arrow';
export { default as PromotionOverlay } from './src/components/PromotionOverlay';
export { default as BoardLoadingSquare } from './src/components/BoardLoadingSquare';

// ============================================================================
// THEME UTILITIES - Simplified, no complex context
// ============================================================================

// Basic board themes
export { 
  chessboardThemes,
  getChessboardTheme,
  getAvailableThemes,
  isValidTheme,
  createCustomTheme,
  themeCategories,
  getThemeAccessibility
} from './src/chessboardColors';

// ============================================================================
// UTILITY FUNCTIONS - Lightweight
// ============================================================================
export const clearArrowCache = () => {
  if (__DEV__) {
    console.log('Arrow cache cleared');
  }
};

export const clearSquareCache = () => {
  if (__DEV__) {
    console.log('Square cache cleared');
  }
};

// ============================================================================
// PRE-BUILT THEMES - Easy to use with props
// ============================================================================
export const DefaultThemes = {
  classic: {
    light: '#F0D9B5',
    dark: '#B58863',
    highlighted: '#ffeb3b',
    moveFrom: 'rgba(181, 136, 99, 1)',
    moveTo: 'rgba(140, 98, 57, 1)',
    dot: 'rgba(0, 0, 0, 0.5)',
    hintBorder: '#FF8C00',
    hintGlow: 'rgba(255, 140, 0, 0.7)',
    hintLightBg: '#FFF8DC',
    hintDarkBg: '#CD853F'
  },
  green: {
    light: '#EEEED2',
    dark: '#769656',
    highlighted: '#ffeb3b',
    moveFrom: 'rgba(118, 150, 86, 1)',
    moveTo: 'rgba(81, 107, 56, 1)',
    dot: 'rgba(0, 0, 0, 0.5)',
    hintBorder: '#FF7F50',
    hintGlow: 'rgba(255, 127, 80, 0.7)',
    hintLightBg: '#FFEFD5',
    hintDarkBg: '#FF8C69'
  },
  blue: {
    light: '#EAE9D2',
    dark: '#4B7399',
    highlighted: '#ffeb3b',
    moveFrom: 'rgba(100, 149, 237, 1)',
    moveTo: 'rgba(65, 105, 225, 1)',
    dot: 'rgba(0, 0, 0, 0.5)',
    hintBorder: '#FF4500',
    hintGlow: 'rgba(255, 69, 0, 0.8)',
    hintLightBg: '#FFE4B5',
    hintDarkBg: '#FF6347'
  },
  purple: {
    light: '#D0B5F0',
    dark: '#8B63B5',
    highlighted: '#6A3AAA',
    moveFrom: 'rgba(139, 99, 181, 1)',
    moveTo: 'rgba(106, 58, 170, 1)',
    dot: 'rgba(0, 0, 0, 0.5)',
    hintBorder: '#FFD700',
    hintGlow: 'rgba(255, 215, 0, 0.8)',
    hintLightBg: '#FFFACD',
    hintDarkBg: '#DAA520'
  },
  dark: {
    light: '#4a4a4a',
    dark: '#2c2c2c',
    highlighted: '#ffff00',
    moveFrom: 'rgba(100, 100, 100, 1)',
    moveTo: 'rgba(120, 120, 120, 1)',
    dot: 'rgba(255, 255, 255, 0.5)',
    hintBorder: '#FF6B35',
    hintGlow: 'rgba(255, 107, 53, 0.9)',
    hintLightBg: '#666666',
    hintDarkBg: '#444444'
  },
  wood: {
    light: '#DEB887',
    dark: '#8B4513',
    highlighted: '#ffeb3b',
    moveFrom: 'rgba(139, 69, 19, 0.8)',
    moveTo: 'rgba(160, 82, 45, 0.8)',
    dot: 'rgba(0, 0, 0, 0.5)',
    hintBorder: '#228B22',
    hintGlow: 'rgba(34, 139, 34, 0.7)',
    hintLightBg: '#F0FFF0',
    hintDarkBg: '#32CD32'
  }
};

// ============================================================================
// QUICK THEME PRESETS - Easy access
// ============================================================================
export const QuickThemes = {
  // Professional tournament look
  tournament: DefaultThemes.classic,
  
  // Modern online chess platform
  modern: DefaultThemes.green,
  
  // Training and analysis
  analysis: DefaultThemes.blue,
  
  // Dark mode for low light
  night: DefaultThemes.dark,
  
  // Natural wood appearance
  wooden: DefaultThemes.wood,
  
  // Royal and elegant
  royal: DefaultThemes.purple
};

// ============================================================================
// THEME UTILITIES - Simplified versions
// ============================================================================
export const ThemeUtils = {
  // Get theme by category
  getThemesByCategory: (category) => {
    const categories = {
      classic: ['classic', 'wood'],
      modern: ['green', 'blue', 'purple'],
      special: ['dark']
    };
    return categories[category] || [];
  },
  
  // Get contrasting color for text
  getContrastingColor: (backgroundColor) => {
    // Simple brightness calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },
  
  // Validate theme completeness
  validateTheme: (theme) => {
    const requiredKeys = [
      'light', 'dark', 'highlighted', 'moveFrom', 'moveTo', 'dot',
      'hintBorder', 'hintGlow', 'hintLightBg', 'hintDarkBg'
    ];
    
    return requiredKeys.every(key => {
      const hasKey = theme.hasOwnProperty(key);
      const isString = typeof theme[key] === 'string';
      const hasLength = theme[key]?.length > 0;
      return hasKey && isString && hasLength;
    });
  },
  
  // Create theme from base
  createThemeFromBase: (baseThemeName, overrides = {}) => {
    const baseTheme = DefaultThemes[baseThemeName] || DefaultThemes.green;
    return { ...baseTheme, ...overrides };
  },
  
  // Quick theme switcher
  getThemeFor: (situation) => {
    const situationThemes = {
      'puzzle': DefaultThemes.green,
      'analysis': DefaultThemes.blue, 
      'tournament': DefaultThemes.classic,
      'night': DefaultThemes.dark,
      'beginner': DefaultThemes.wood,
      'advanced': DefaultThemes.purple
    };
    return situationThemes[situation] || DefaultThemes.green;
  }
};

// ============================================================================
// DEFAULT EXPORT - Main Chessboard component
// ============================================================================
export { default } from './src/components/Chessboard';