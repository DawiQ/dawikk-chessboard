// chessboardColors.js - Beautiful chessboard themes with enhanced hint system

export const chessboardThemes = {
    default: {
      apiKey: 'default',
      name: 'Default',
      dark: '#5A5449',
      light: '#958C7B',
      highlighted: '#ffeb3b',
      moveFrom: 'rgba(206, 147, 103, 1)',
      moveTo: 'rgba(206, 147, 103, 1)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Enhanced hint colors - distinctive orange-red theme
      hintBorder: '#FF6B35',           // Orange-red border
      hintLightBg: '#FFE5D9',          // Light peach background
      hintDarkBg: '#D45087',           // Pink-purple dark background
      hintGlow: 'rgba(255, 107, 53, 0.6)' // Orange glow effect
    },
    
    classic: {
      apiKey: 'classic',
      name: 'Classic',
      dark: '#B58863',
      light: '#F0D9B5',
      highlighted: '#ffeb3b',
      moveFrom: 'rgba(181, 136, 99, 1)',
      moveTo: 'rgba(140, 98, 57, 1)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Classic theme: Warm brown-gold hints
      hintBorder: '#FF8C00',           // Dark orange border
      hintLightBg: '#FFF8DC',          // Cornsilk light background
      hintDarkBg: '#CD853F',           // Peru - warm brown
      hintGlow: 'rgba(255, 140, 0, 0.7)'
    },
    
    blue: {
      apiKey: 'blue',
      name: 'Blue',
      dark: '#4B7399',
      light: '#EAE9D2',
      highlighted: '#ffeb3b',
      moveFrom: 'rgba(100, 149, 237, 1)',
      moveTo: 'rgba(65, 105, 225, 1)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Blue theme: Contrasting warm hints on cool background
      hintBorder: '#FF4500',           // OrangeRed - strong contrast with blue
      hintLightBg: '#FFE4B5',          // Moccasin - warm light
      hintDarkBg: '#FF6347',           // Tomato - warm dark
      hintGlow: 'rgba(255, 69, 0, 0.8)'
    },
    
    green: {
      apiKey: 'green',
      name: 'Green',
      dark: '#769656',
      light: '#EEEED2',
      highlighted: '#ffeb3b',
      moveFrom: 'rgba(118, 150, 86, 1)',
      moveTo: 'rgba(81, 107, 56, 1)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Green theme: Warm orange hints - complementary to green
      hintBorder: '#FF7F50',           // Coral - perfect contrast with green
      hintLightBg: '#FFEFD5',          // PapayaWhip - subtle light
      hintDarkBg: '#FF8C69',           // Salmon - warm dark
      hintGlow: 'rgba(255, 127, 80, 0.7)'
    },
    
    purple: {
      apiKey: 'purple',
      name: 'Purple',
      dark: '#8B63B5',
      light: '#D0B5F0',
      highlighted: '#6A3AAA',
      moveFrom: 'rgba(139, 99, 181, 1)',
      moveTo: 'rgba(106, 58, 170, 1)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Purple theme: Gold-yellow hints - complementary to purple
      hintBorder: '#FFD700',           // Gold - classic contrast with purple
      hintLightBg: '#FFFACD',          // LemonChiffon - light golden
      hintDarkBg: '#DAA520',           // GoldenRod - dark golden
      hintGlow: 'rgba(255, 215, 0, 0.8)'
    },
    
    // ✨ New theme: Dark mode
    dark: {
      apiKey: 'dark',
      name: 'Dark',
      dark: '#2c2c2c',
      light: '#4a4a4a',
      highlighted: '#ffff00',
      moveFrom: 'rgba(100, 100, 100, 1)',
      moveTo: 'rgba(120, 120, 120, 1)',
      dot: 'rgba(255, 255, 255, 0.5)',
      
      // ✨ Dark theme: Bright hints for visibility
      hintBorder: '#FF6B35',           // Bright orange for visibility
      hintLightBg: '#666666',          // Lighter gray
      hintDarkBg: '#444444',           // Darker gray with hint
      hintGlow: 'rgba(255, 107, 53, 0.9)'
    },
    
    // ✨ New theme: Wood
    wood: {
      apiKey: 'wood',
      name: 'Wood',
      dark: '#8B4513',   // SaddleBrown
      light: '#DEB887',  // BurlyWood
      highlighted: '#ffeb3b',
      moveFrom: 'rgba(139, 69, 19, 0.8)',
      moveTo: 'rgba(160, 82, 45, 0.8)',
      dot: 'rgba(0, 0, 0, 0.5)',
      
      // ✨ Wood theme: Natural green hints
      hintBorder: '#228B22',           // ForestGreen
      hintLightBg: '#F0FFF0',          // Honeydew - light green
      hintDarkBg: '#32CD32',           // LimeGreen - vibrant green
      hintGlow: 'rgba(34, 139, 34, 0.7)'
    }
  };
  
  // Helper function to get theme by name
  export const getChessboardTheme = (themeName = 'green') => {
    return chessboardThemes[themeName] || chessboardThemes.green;
  };
  
  // Get all available theme names
  export const getAvailableThemes = () => {
    return Object.keys(chessboardThemes);
  };
  
  // Validate theme object
  export const isValidTheme = (theme) => {
    const requiredKeys = ['light', 'dark', 'highlighted', 'moveFrom', 'moveTo', 'dot'];
    return theme && typeof theme === 'object' && 
           requiredKeys.every(key => typeof theme[key] === 'string');
  };
  
  // Create custom theme with fallbacks
  export const createCustomTheme = (customTheme = {}, baseName = 'green') => {
    const baseTheme = chessboardThemes[baseName] || chessboardThemes.green;
    return { ...baseTheme, ...customTheme };
  };
  
  // Theme categories for UI selection
  export const themeCategories = {
    classic: ['default', 'classic', 'wood'],
    modern: ['green', 'blue', 'purple'], 
    special: ['dark']
  };
  
  // Color contrast ratios for accessibility
  export const getThemeAccessibility = (themeName) => {
    const theme = chessboardThemes[themeName];
    if (!theme) return null;
    
    return {
      name: theme.name,
      hasHighContrast: theme.name === 'classic' || theme.name === 'dark',
      hintVisibility: theme.name === 'green' ? 'high' : 'medium',
      recommended: theme.name === 'green' || theme.name === 'classic'
    };
  };
  
  export default chessboardThemes;