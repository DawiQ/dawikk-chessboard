// themeContext.js - Simplified standalone version for dawikk-chessboard
import React, { 
  createContext, 
  useContext, 
  useMemo, 
  useCallback, 
  useState,
  useRef,
  useEffect
} from 'react';
import { chessboardThemes } from './chessboardColors';

// ============================================================================
// PERFORMANCE CACHE
// ============================================================================
class ThemeCache {
  constructor() {
    this.cache = new Map();
    this.renderCount = 0;
  }

  trackRender(hookName) {
    if (__DEV__) {
      this.renderCount++;
      if (this.renderCount % 100 === 0) {
        console.log(`🎨 Theme renders: ${this.renderCount} (${hookName})`);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

// ============================================================================
// CONTEXTS (split for performance)
// ============================================================================
const ThemeColorsContext = createContext({});
const BoardThemeContext = createContext({});
const ThemeActionsContext = createContext({});

// ============================================================================
// THEME PROVIDER - Simplified for standalone library
// ============================================================================
export const ThemeProvider = ({ 
  children, 
  initialBoardTheme = 'green',
  initialTextColors,
  initialThemeColors,
  initialBackgroundColors 
}) => {
  const [boardThemeName, setBoardThemeName] = useState(initialBoardTheme);
  const themeCache = useRef(new ThemeCache()).current;

  // Board theme state
  const boardTheme = useMemo(() => {
    return chessboardThemes[boardThemeName] || chessboardThemes.green;
  }, [boardThemeName]);

  // Default theme colors for chessboard library
  const defaultTextColors = {
    titleText: '#111827',
    subtitleText: '#9CA3AF',
    labelText: '#6B7280',
    headerTitleText: '#111827',
    titleButtonText: '#FFFFFF',
    titleButtonText2: '#111827',
    bannerText: '#111827'
  };

  const defaultThemeColors = {
    background: '#F9FAFB',
    titleText: '#111827',
    borderPrimary: '#E5E7EB'
  };

  const defaultBackgroundColors = {
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',
    modalBackground: '#FFFFFF'
  };

  // Merge with provided colors
  const textColors = useMemo(() => ({
    ...defaultTextColors,
    ...initialTextColors
  }), [initialTextColors]);

  const themeColors = useMemo(() => ({
    ...defaultThemeColors,
    ...initialThemeColors
  }), [initialThemeColors]);

  const backgroundColors = useMemo(() => ({
    ...defaultBackgroundColors,
    ...initialBackgroundColors
  }), [initialBackgroundColors]);

  // Combined colors for compatibility
  const allColors = useMemo(() => ({
    ...textColors,
    ...themeColors,
    ...backgroundColors,
    // Quick start colors for compatibility
    quickStartTacticalPuzzles: '#8B5CF6',
    quickStartPlayGame: '#059669',
    quickStartLearnChess: '#DC2626',
    quickStartPuzzleSmash: '#EA580C',
    // Accent colors
    accentPrimary: '#F59E0B',
    accentSecondary: '#3B82F6',
    // Functional colors
    success: '#10B981',
    error: '#EF4444',
    gold: '#F59E0B',
    warning: '#F59E0B',
    info: '#3B82F6'
  }), [textColors, themeColors, backgroundColors]);

  // Actions
  const updateBoardTheme = useCallback((newThemeName) => {
    if (chessboardThemes[newThemeName] && newThemeName !== boardThemeName) {
      setBoardThemeName(newThemeName);
    }
  }, [boardThemeName]);

  // Context values
  const boardThemeValue = useMemo(() => ({
    boardTheme,
    boardThemeName
  }), [boardTheme, boardThemeName]);

  const actionsValue = useMemo(() => ({
    updateBoardTheme,
    isLoading: false
  }), [updateBoardTheme]);

  useEffect(() => {
    return () => themeCache.clear();
  }, [themeCache]);

  return (
    <ThemeActionsContext.Provider value={actionsValue}>
      <ThemeColorsContext.Provider value={allColors}>
        <BoardThemeContext.Provider value={boardThemeValue}>
          {children}
        </BoardThemeContext.Provider>
      </ThemeColorsContext.Provider>
    </ThemeActionsContext.Provider>
  );
};

// ============================================================================
// OPTIMIZED HOOKS - Compatible with your original system
// ============================================================================

// Main colors hook
export const useThemeColors = (selector) => {
  const colors = useContext(ThemeColorsContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useThemeColors');
  
  return useMemo(() => {
    if (!selector) {
      return colors;
    }
    return selector(colors);
  }, [colors, selector]);
};

// Text colors hook
export const useTextColors = () => {
  const colors = useContext(ThemeColorsContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useTextColors');
  
  return useMemo(() => ({
    titleText: colors?.titleText || '#333333',
    subtitleText: colors?.subtitleText || '#666666',
    labelText: colors?.labelText || '#666666',
    headerTitleText: colors?.headerTitleText || '#222222',
    titleButtonText: colors?.titleButtonText || '#FFFFFF',
    titleButtonText2: colors?.titleButtonText2 || '#FFFFFF',
    bannerText: colors?.bannerText || '#111111'
  }), [
    colors?.titleText, 
    colors?.subtitleText, 
    colors?.labelText,
    colors?.headerTitleText,
    colors?.titleButtonText,
    colors?.titleButtonText2,
    colors?.bannerText
  ]);
};

// Background colors hook
export const useBackgroundColors = (selector) => {
  const colors = useContext(ThemeColorsContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useBackgroundColors');
  
  const backgroundColors = useMemo(() => ({
    background: colors?.background || '#FFFFFF',
    cardBackground: colors?.cardBackground || '#dadde2',
    modalBackground: colors?.modalBackground || '#dadde2'
  }), [colors?.background, colors?.cardBackground, colors?.modalBackground]);

  return selector ? selector(backgroundColors) : backgroundColors;
};

// Quick start colors hook
export const useQuickStartColors = () => {
  const colors = useContext(ThemeColorsContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useQuickStartColors');
  
  return useMemo(() => ({
    quickStartTacticalPuzzles: colors?.quickStartTacticalPuzzles || '#8B5CF6',
    quickStartPlayGame: colors?.quickStartPlayGame || '#059669',
    quickStartLearnChess: colors?.quickStartLearnChess || '#DC2626',
    quickStartPuzzleSmash: colors?.quickStartPuzzleSmash || '#EA580C'
  }), [
    colors?.quickStartTacticalPuzzles,
    colors?.quickStartPlayGame,
    colors?.quickStartLearnChess,
    colors?.quickStartPuzzleSmash
  ]);
};

// Board theme hook
export const useBoardTheme = () => {
  const boardTheme = useContext(BoardThemeContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useBoardTheme');
  
  return boardTheme;
};

// Theme actions hook
export const useThemeActions = () => {
  const actions = useContext(ThemeActionsContext);
  const cache = useRef(new ThemeCache()).current;
  
  if (__DEV__) cache.trackRender('useThemeActions');
  
  return actions;
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================
export const useTheme = () => {
  const colors = useThemeColors();
  const boardTheme = useBoardTheme();
  const actions = useThemeActions();
  
  return useMemo(() => ({
    colors,
    ...boardTheme,
    ...actions,
    appTheme: {
      colors: colors,
      name: 'light' // Default for standalone
    }
  }), [colors, boardTheme, actions]);
};

// Helper hook for theme name
export const useThemeName = () => {
  return 'light'; // Default for standalone
};

export const useAppThemeName = () => {
  return 'light'; // Default for standalone
};

// ============================================================================
// PREDEFINED THEME UTILITIES
// ============================================================================

/**
 * Hook to easily switch between predefined board themes
 * @param {string} themeName - Name of predefined theme
 * @returns {object} Board theme object
 */
export const usePredefinedTheme = (themeName = 'green') => {
  return useMemo(() => {
    const theme = chessboardThemes[themeName];
    if (!theme) {
      console.warn(`Theme '${themeName}' not found. Using green theme.`);
      return chessboardThemes.green;
    }
    return theme;
  }, [themeName]);
};

/**
 * Creates a custom board theme with validation
 * @param {object} theme - Custom theme object
 * @returns {object} Validated and merged theme
 */
export const createBoardTheme = (theme = {}) => {
  const defaultTheme = chessboardThemes.green;
  const validatedTheme = { ...defaultTheme };
  
  // Validate and merge theme properties
  Object.keys(theme).forEach(key => {
    if (defaultTheme.hasOwnProperty(key) && 
        typeof theme[key] === 'string' && 
        theme[key].length > 0) {
      validatedTheme[key] = theme[key];
    }
  });
  
  return validatedTheme;
};

/**
 * Detects if colors represent a dark theme
 * @param {object} themeColors - Theme colors object
 * @returns {boolean} True if dark theme
 */
export const isDarkTheme = (themeColors) => {
  if (!themeColors || !themeColors.background) return false;
  
  // Simple brightness check based on background color
  const bgColor = themeColors.background.toLowerCase();
  return bgColor.includes('#1') || bgColor.includes('#2') || 
         bgColor.includes('#3') || bgColor === '#000000';
};

// Debug utilities
export const useThemeDebug = () => {
  const colors = useThemeColors();
  const boardTheme = useBoardTheme();
  
  return useMemo(() => ({
    availableColors: Object.keys(colors || {}),
    currentColors: colors,
    boardTheme: boardTheme.boardThemeName,
    appTheme: 'light',
    hasAllColors: !!(
      colors?.background && 
      colors?.cardBackground && 
      colors?.titleText && 
      colors?.subtitleText
    )
  }), [colors, boardTheme]);
};

export default ThemeProvider;