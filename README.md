# 🏆 dawikk-cessboard

A highly optimized, feature-rich React Native chessboard component with gesture support, beautiful animations, and an advanced customizable theme system.

## ✨ Features

- **🎮 Complete Chess Logic**: Built on chess.js for accurate move validation
- **👆 Advanced Gesture Support**: Smooth drag & drop with haptic feedback
- **🎨 Beautiful Theme System**: 6+ built-in themes with advanced hint system
- **💡 Intelligent Hint System**: Animated square highlighting with visual effects
- **📱 Mobile Optimized**: Perfect touch interactions for mobile devices
- **⚡ Ultra Performance**: Optimized rendering with caching and memoization
- **🎯 Visual Feedback**: Move highlights, legal move indicators, last move tracking
- **🏹 Custom Arrows**: Multiple arrow styles including knight move L-shapes
- **🔄 Promotion Overlay**: Beautiful pawn promotion interface with piece selection
- **📐 Responsive Design**: Adapts to different screen sizes automatically
- **🎪 Loading Animations**: Smooth animated loading states with center focus
- **🎭 Dark Mode Support**: Built-in dark theme with proper contrast
- **🪵 Natural Themes**: Wood, stone, and other natural-looking boards

## 📦 Installation

```bash
npm install dawikk-chessboard
```

### Required Peer Dependencies

```bash
npm install react-native-gesture-handler react-native-svg @expo/vector-icons chess.js
```

## 🚀 Quick Start

```javascript
import React, { useRef } from 'react';
import { View } from 'react-native';
import Chessboard, { ThemeProvider, DefaultThemes } from 'dawikk-chessboard';

const ChessApp = () => {
  const boardRef = useRef();

  const handleMove = (from, to, promotion) => {
    console.log('Move:', from, 'to', to, promotion ? `promoting to ${promotion}` : '');
  };

  return (
    <ThemeProvider initialBoardTheme="green">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Chessboard
          ref={boardRef}
          fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          onMove={handleMove}
          perspective="white"
        />
      </View>
    </ThemeProvider>
  );
};

export default ChessApp;
```

## 📖 API Reference

### Chessboard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fen` | string | Starting position | Chess position in FEN notation |
| `perspective` | 'white' \| 'black' | 'white' | Board orientation |
| `onMove` | function | Required | Callback when a move is made `(from, to, promotion) => void` |
| `isLoading` | boolean | false | Shows animated loading state |
| `lastMoveFrom` | string | undefined | Highlight last move source square |
| `lastMoveTo` | string | undefined | Highlight last move target square |
| `bestMove` | string | undefined | Show best move arrow (e.g., "e2e4") |
| `expectedMove` | string | undefined | Expected move for training mode |
| `arrows` | ArrowConfig[] | [] | Custom arrows to display |
| `isDarkTheme` | boolean | false | Enable dark theme mode |

### Chessboard Methods

Access these methods via ref:

```javascript
const boardRef = useRef();

// Highlight a square with animated hint (auto-clears after 3 seconds)
boardRef.current.highlight('e4');

// Clear highlight manually
boardRef.current.clearHighlight();

// Set new position
boardRef.current.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
```

### Arrow Configuration

```javascript
const arrows = [
  {
    from: 'e2',
    to: 'e4',
    color: 'rgba(255, 0, 0, 0.8)', // Custom color
    opacity: 0.8, // Custom opacity
    piece: 'n' // 'n' for knight moves (L-shaped arrows)
  }
];
```

## 🎨 Advanced Theme System

### Available Built-in Themes

```javascript
import { DefaultThemes, QuickThemes } from 'dawikk-chessboard';

// Available themes:
// DefaultThemes.classic - Traditional brown/cream
// DefaultThemes.green - Modern green (recommended)  
// DefaultThemes.blue - Cool blue tones
// DefaultThemes.purple - Royal purple
// DefaultThemes.dark - Dark mode
// DefaultThemes.wood - Natural wood appearance

// Quick presets:
// QuickThemes.tournament - Professional look
// QuickThemes.modern - Online platform style
// QuickThemes.analysis - Analysis-friendly
// QuickThemes.night - Dark mode optimized
// QuickThemes.wooden - Natural appearance
// QuickThemes.royal - Elegant purple
```

### Basic Theme Usage

```javascript
import { ThemeProvider, DefaultThemes } from 'dawikk-chessboard';

<ThemeProvider initialBoardTheme="green">
  <Chessboard {...props} />
</ThemeProvider>
```

### Advanced Theme Usage with Custom Colors

```javascript
import { ThemeProvider, createBoardTheme } from 'dawikk-chessboard';

const customTheme = createBoardTheme({
  light: '#f0d9b5',      // Light squares
  dark: '#b58863',       // Dark squares
  highlighted: '#ffff00', // Selected square
  moveFrom: '#ffeb3b',   // Last move from
  moveTo: '#4caf50',     // Last move to
  dot: 'rgba(0, 0, 0, 0.5)', // Legal move dots
  
  // Advanced hint system
  hintBorder: '#FF6B35',     // Animated border color
  hintGlow: 'rgba(255, 107, 53, 0.6)', // Glow effect
  hintLightBg: '#FFEFD5',    // Light square hint background
  hintDarkBg: '#FF8C69'      // Dark square hint background
});

const textColors = {
  titleText: '#000000',
  subtitleText: '#666666'
};

<ThemeProvider 
  initialBoardTheme="green"
  initialTextColors={textColors}
>
  <Chessboard {...props} />
</ThemeProvider>
```

### Dynamic Theme Switching

```javascript
import { useThemeActions } from 'dawikk-chessboard';

const ThemeSelector = () => {
  const { updateBoardTheme } = useThemeActions();
  
  return (
    <View style={{ flexDirection: 'row' }}>
      <Button title="Green" onPress={() => updateBoardTheme('green')} />
      <Button title="Classic" onPress={() => updateBoardTheme('classic')} />
      <Button title="Dark" onPress={() => updateBoardTheme('dark')} />
    </View>
  );
};
```

## 🎮 Advanced Features

### Training Mode with Hints

```javascript
const [currentHint, setCurrentHint] = useState('e2');
const boardRef = useRef();

// Highlight the best square for learning
const showHint = () => {
  boardRef.current.highlight(currentHint);
};

<Chessboard
  ref={boardRef}
  fen={position}
  onMove={handleMove}
  expectedMove="e2e4" // Shows visual feedback for correct moves
  bestMove="e2e4" // Shows arrow for best move
/>
```

### Custom Arrows and Annotations

```javascript
const [arrows, setArrows] = useState([
  // Straight arrow
  { from: 'e2', to: 'e4', color: 'rgba(0, 255, 0, 0.8)' },
  
  // Knight move (L-shaped arrow)
  { from: 'b1', to: 'c3', piece: 'n', color: 'rgba(255, 0, 0, 0.8)' },
  
  // Semi-transparent arrow
  { from: 'd2', to: 'd4', opacity: 0.5 }
]);

<Chessboard
  fen={position}
  onMove={handleMove}
  arrows={arrows}
/>
```

### Loading States with Animation

```javascript
const [isAnalyzing, setIsAnalyzing] = useState(false);

// Show loading animation during analysis
<Chessboard
  isLoading={isAnalyzing} // Shows beautiful center-focused animation
  fen={position}
  onMove={handleMove}
/>
```

### Comprehensive Game Example

```javascript
import React, { useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import Chessboard, { 
  ThemeProvider, 
  useThemeActions,
  DefaultThemes 
} from 'dawikk-chessboard';

const ChessGame = () => {
  const boardRef = useRef();
  const [chess] = useState(() => new Chess());
  const [position, setPosition] = useState(chess.fen());
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [arrows, setArrows] = useState([]);
  const { updateBoardTheme } = useThemeActions();

  const handleMove = useCallback((from, to, promotion) => {
    const move = chess.move({ from, to, promotion });
    
    if (move) {
      setPosition(chess.fen());
      setLastMove({ from, to });
      
      // Clear arrows after move
      setArrows([]);
      
      // Show hint for opponent move
      setTimeout(() => {
        const moves = chess.moves({ verbose: true });
        if (moves.length > 0) {
          boardRef.current?.highlight(moves[0].to);
        }
      }, 1000);
    }
  }, [chess]);

  const showBestMove = useCallback(() => {
    const moves = chess.moves({ verbose: true });
    if (moves.length > 0) {
      const bestMove = moves[0];
      setArrows([{
        from: bestMove.from,
        to: bestMove.to,
        color: 'rgba(0, 255, 0, 0.8)',
        piece: bestMove.piece // Automatically handles knight moves
      }]);
    }
  }, [chess]);

  return (
    <ThemeProvider initialBoardTheme="green">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Theme selector */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => updateBoardTheme('classic')}>
            <Text>Classic</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => updateBoardTheme('green')}>
            <Text>Green</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => updateBoardTheme('dark')}>
            <Text>Dark</Text>
          </TouchableOpacity>
        </View>

        {/* Chessboard */}
        <Chessboard
          ref={boardRef}
          fen={position}
          onMove={handleMove}
          lastMoveFrom={lastMove.from}
          lastMoveTo={lastMove.to}
          arrows={arrows}
          perspective="white"
        />

        {/* Controls */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity onPress={showBestMove}>
            <Text>Show Best Move</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setArrows([])}>
            <Text>Clear Arrows</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemeProvider>
  );
};
```

## 🎨 Theme Hooks

```javascript
import { 
  useThemeColors, 
  useTextColors, 
  useBackgroundColors,
  useBoardTheme,
  useThemeActions 
} from 'dawikk-chessboard';

// Get all theme colors
const colors = useThemeColors();

// Get specific color categories
const textColors = useTextColors();
const backgrounds = useBackgroundColors();

// Get board theme info
const { boardTheme, boardThemeName } = useBoardTheme();

// Theme actions
const { updateBoardTheme, isLoading } = useThemeActions();
```

## 🔧 Performance Optimization

The library includes several performance optimizations:

- **Advanced Memoization**: All components use React.memo with custom equality functions
- **Intelligent Caching**: Coordinate calculations, paths, and theme colors are cached
- **Native Animations**: Uses native driver for transform animations where possible
- **Debounced Updates**: Theme changes and storage operations are debounced
- **Minimal Re-renders**: Custom equality functions prevent unnecessary updates
- **Component Splitting**: Theme contexts are split for granular updates

### Performance Monitoring (Development)

```javascript
// The library includes built-in performance monitoring in development
// Check console for render count logs:
// "🎨 Theme renders: 100"
// "🏹 Arrow renders: 50" 
// "🎨 Square renders: 640 (10 boards)"
```

### Manual Cache Management

```javascript
import { clearArrowCache, clearSquareCache } from 'dawikk-chessboard';

// Clear caches if needed (usually not necessary)
clearArrowCache();
clearSquareCache();
```

## 📱 Platform Support

- ✅ iOS
- ✅ Android  
- ✅ Expo (SDK 47+)
- ✅ React Native CLI (0.60+)

## 🔗 Dependencies

### Required
- `chess.js` - Chess game logic (bundled)

### Peer Dependencies
- `react` - ^16.8.0 || ^17.0.0 || ^18.0.0
- `react-native` - ^0.60.0
- `react-native-gesture-handler` - ^2.0.0
- `react-native-svg` - ^12.0.0
- `@expo/vector-icons` - ^13.0.0 (optional)

## 🎪 Loading States & Animations

```javascript
// Show loading with animated center squares
<Chessboard
  isLoading={true}
  fen={position}
  onMove={handleMove}
  isDarkTheme={isDark} // Adapts loading colors to theme
/>
```

The loading animation features:
- Center 4 squares (e4, e5, d4, d5) animate in sequence
- Pulsing and color-changing effects
- Automatic dark/light theme adaptation
- Smooth transitions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/yourusername/dawikk-chessboard
cd dawikk-chessboard
npm install
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [chess.js](https://github.com/jhlywa/chess.js) for chess logic
- Inspired by lichess.org and chess.com interfaces
- Thanks to the React Native community for gesture handling libraries

## 📚 Examples Repository

Check out the [examples folder](./examples) for detailed implementations:

- **BasicUsage.js** - Simple implementation
- **CustomThemes.js** - Theme customization
- **TrainingMode.js** - Educational features  
- **GameAnalysis.js** - Analysis tools
- **TournamentMode.js** - Tournament interface

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check the [documentation](#-api-reference) first
2. Search [existing issues](https://github.com/yourusername/dawikk-chessboard/issues)
3. Create a [new issue](https://github.com/yourusername/dawikk-chessboard/issues/new) with:
   - React Native version
   - Device/platform information  
   - Minimal reproduction code
   - Expected vs actual behavior

## 🚀 What's Next?

Planned features for future releases:
- Sound effects for moves
- Blindfold chess mode
- Analysis arrows
- Opening book integration
- Engine evaluation bars
- Puzzle mode enhancements

---

**Made with ♟️ by Dawid (Dawikk)**

*Experience the smoothest chess interface on React Native* 🏆