import { Component, ReactNode } from 'react';
import { ViewStyle } from 'react-native';

// ============================================================================
// THEME TYPES
// ============================================================================

export interface BoardTheme {
  apiKey?: string;
  name?: string;
  light: string;
  dark: string;
  highlighted: string;
  moveFrom: string;
  moveTo: string;
  dot: string;
  hintBorder?: string;
  hintGlow?: string;
  hintLightBg?: string;
  hintDarkBg?: string;
}

export interface TextColors {
  titleText: string;
  subtitleText: string;
  labelText: string;
  headerTitleText: string;
  titleButtonText: string;
  titleButtonText2: string;
  bannerText: string;
}

export interface BackgroundColors {
  background: string;
  cardBackground: string;
  modalBackground: string;
}

export interface ThemeColors extends TextColors, BackgroundColors {
  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  
  // Quick start colors
  quickStartTacticalPuzzles: string;
  quickStartPlayGame: string;
  quickStartLearnChess: string;
  quickStartPuzzleSmash: string;
  
  // Functional colors
  success: string;
  error: string;
  gold: string;
  warning: string;
  info: string;
  
  // Border colors
  borderPrimary?: string;
  
  // Shadow colors
  shadowColor?: string;
  shadowColorStrong?: string;
}

export interface ArrowConfig {
  from: string;
  to: string;
  color?: string;
  opacity?: number;
  piece?: string;
}

// ============================================================================
// UPDATED COMPONENT PROPS - With standalone support
// ============================================================================

export interface ChessboardProps {
  fen?: string;
  perspective?: 'white' | 'black';
  onMove: (from: string, to: string, promotion?: string) => void;
  isLoading?: boolean;
  lastMoveFrom?: string;
  lastMoveTo?: string;
  bestMove?: string;
  expectedMove?: string;
  arrows?: ArrowConfig[];
  isDarkTheme?: boolean;
  showArrows?: boolean;
  showCoordinates?: boolean;
  readonly?: boolean;
  
  // 🎯 NEW: Circles around pieces on specific squares (for Hand & Brain)
  circledSquares?: string[];
  
  // 🎯 NEW STANDALONE PROPS
  boardTheme?: BoardTheme | null;
  textColors?: Partial<TextColors> | null;
  colors?: Partial<ThemeColors> | null;
}

export interface ChessboardRef {
  highlight: (square: string) => void;
  clearHighlight: () => void;
  setFen: (fen: string) => void;
}

export interface SquareProps {
  piece?: {
    type: string;
    color: 'w' | 'b';
  } | null;
  row: number;
  col: number;
  square: string;
  isHighlighted: boolean;
  isMovePossible: boolean;
  onSquarePress: (square: string) => void;
  onGestureEvent: (event: any) => void;
  onHandlerStateChange: (event: any) => void;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  isHintSquare?: boolean;
  isCircled?: boolean;  // 🎯 NEW: For Hand & Brain mode
  perspective?: 'white' | 'black';
  currentSquareSize?: number;
  readonly?: boolean;
  
  // 🎯 NEW STANDALONE PROPS
  boardTheme?: BoardTheme | null;
}

export interface ArrowProps {
  from: string;
  to: string;
  squareSize: number;
  boardSize: number;
  perspective?: 'white' | 'black';
  piece?: string | null;
  opacity?: number;
  color?: string;
}

export interface PromotionOverlayProps {
  onSelect: (piece: string) => void;
  color: 'w' | 'b';
  
  // 🎯 NEW STANDALONE PROPS
  colors?: Partial<ThemeColors> | null;
  textColors?: Partial<TextColors> | null;
  backgroundColors?: Partial<BackgroundColors> | null;
}

export interface BoardLoadingSquareProps {
  isCenter: boolean;
  baseColor: string;
  animationDelay?: number;
  isDarkTheme?: boolean;
}

export interface ThemeProviderProps {
  children: ReactNode;
  initialBoardTheme?: string;
  initialTextColors?: Partial<TextColors>;
  initialThemeColors?: Partial<ThemeColors>;
  initialBackgroundColors?: Partial<BackgroundColors>;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface BoardThemeContext {
  boardTheme: BoardTheme;
  boardThemeName: string;
}

export interface ThemeActions {
  updateBoardTheme: (themeName: string) => void;
  isLoading: boolean;
}

export interface ThemeAccessibility {
  name: string;
  hasHighContrast: boolean;
  hintVisibility: 'high' | 'medium' | 'low';
  recommended: boolean;
}

// ============================================================================
// COMPONENTS - Updated with new props
// ============================================================================

export class Chessboard extends Component<ChessboardProps> {
  highlight(square: string): void;
  clearHighlight(): void;
  setFen(fen: string): void;
}

export declare const Square: React.ComponentType<SquareProps>;
export declare const Arrow: React.ComponentType<ArrowProps>;
export declare const PromotionOverlay: React.ComponentType<PromotionOverlayProps>;
export declare const BoardLoadingSquare: React.ComponentType<BoardLoadingSquareProps>;

// ============================================================================
// THEME PROVIDER AND HOOKS - Optional for standalone usage
// ============================================================================

export declare const ThemeProvider: React.ComponentType<ThemeProviderProps>;

// Main theme hooks (optional - components work without these)
export declare function useThemeColors<T = ThemeColors>(selector?: (colors: ThemeColors) => T): T;
export declare function useTextColors(): TextColors;
export declare function useBackgroundColors<T = BackgroundColors>(selector?: (colors: BackgroundColors) => T): T;
export declare function useBoardTheme(): BoardThemeContext;
export declare function useThemeActions(): ThemeActions;

// Quick access hooks
export declare function useQuickStartColors(): {
  quickStartTacticalPuzzles: string;
  quickStartPlayGame: string;
  quickStartLearnChess: string;
  quickStartPuzzleSmash: string;
};

// Utility hooks
export declare function useTheme(): {
  colors: ThemeColors;
  boardTheme: BoardTheme;
  boardThemeName: string;
  updateBoardTheme: (themeName: string) => void;
  isLoading: boolean;
  appTheme: {
    colors: ThemeColors;
    name: string;
  };
};

export declare function useThemeName(): string;
export declare function useAppThemeName(): string;
export declare function usePredefinedTheme(themeName?: string): BoardTheme;
export declare function useThemeDebug(): {
  availableColors: string[];
  currentColors: ThemeColors;
  boardTheme: string;
  appTheme: string;
  hasAllColors: boolean;
};

// ============================================================================
// THEME UTILITIES - Enhanced for standalone usage
// ============================================================================

export declare function createBoardTheme(theme?: Partial<BoardTheme>): BoardTheme;
export declare function isDarkTheme(themeColors: Partial<ThemeColors>): boolean;

// Board theme utilities
export declare function getChessboardTheme(themeName?: string): BoardTheme;
export declare function getAvailableThemes(): string[];
export declare function isValidTheme(theme: any): theme is BoardTheme;
export declare function createCustomTheme(customTheme?: Partial<BoardTheme>, baseName?: string): BoardTheme;
export declare function getThemeAccessibility(themeName: string): ThemeAccessibility | null;

// Performance utilities
export declare function clearArrowCache(): void;
export declare function clearSquareCache(): void;

// ============================================================================
// THEME COLLECTIONS - Enhanced
// ============================================================================

export declare const chessboardThemes: Record<string, BoardTheme>;

export declare const DefaultThemes: {
  classic: BoardTheme;
  green: BoardTheme;
  blue: BoardTheme;
  purple: BoardTheme;
  dark: BoardTheme;
  wood: BoardTheme;
};

export declare const QuickThemes: {
  tournament: BoardTheme;
  modern: BoardTheme;
  analysis: BoardTheme;
  night: BoardTheme;
  wooden: BoardTheme;
  royal: BoardTheme;
};

export declare const themeCategories: {
  classic: string[];
  modern: string[];
  special: string[];
};

// 🎯 ENHANCED THEME UTILS
export declare const ThemeUtils: {
  getThemesByCategory: (category: string) => string[];
  getContrastingColor: (backgroundColor: string) => string;
  validateTheme: (theme: any) => boolean;
  createThemeFromBase: (baseThemeName: string, overrides?: Partial<BoardTheme>) => BoardTheme;
  getThemeFor: (situation: 'puzzle' | 'analysis' | 'tournament' | 'night' | 'beginner' | 'advanced') => BoardTheme;
};

// ============================================================================
// DEFAULT EXPORT - Main Chessboard component
// ============================================================================

export default Chessboard;