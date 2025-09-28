# dawikk-chessboard

A highly optimized, feature-rich React Native chessboard component with gesture support, animations, customizable themes, and standalone mode support.

## Features

- 🎨 **Beautiful Themes** - Multiple pre-built themes (classic, green, blue, purple, dark, wood)
- 🎯 **Hand & Brain Mode** - Circle pieces to indicate which can be moved
- 👁️ **Blindfold Chess** - Shadow chess mode with hidden pieces (NEW in v0.2.0)
- 🎨 **Custom Highlights** - Highlight squares with custom colors (NEW in v0.2.0)
- ⚡ **Skip Validation** - Bypass chess.js validation for custom scenarios (NEW in v0.2.0)
- 👆 **Gesture Support** - Drag and drop pieces with smooth animations
- 🎮 **Interactive** - Tap to select, drag to move
- 📱 **Responsive** - Adapts to any screen size
- ⚡ **Optimized** - High performance with React Native best practices
- 🔧 **Standalone Mode** - Works without theme context
- 🏹 **Arrows** - Show best moves, hints, and custom arrows
- 👑 **Promotion** - Beautiful piece promotion overlay
- 📐 **Coordinates** - Optional file and rank labels
- 🔄 **Loading States** - Animated loading board
- 📍 **Move Hints** - Highlight possible moves
- 🎯 **Hint System** - Visual hints with animations

## Installation

```bash
npm install dawikk-chessboard
# or
yarn add dawikk-chessboard
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install react-native-gesture-handler react-native-svg @expo/vector-icons chess.js react-native-responsive-fontsize
```

For iOS, run:
```bash
cd ios && pod install
```

## Quick Start

```javascript
import React, { useState } from 'react';
import { View } from 'react-native';
import Chessboard from 'dawikk-chessboard';
import { Chess } from 'chess.js';

export default function ChessGame() {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());

  const handleMove = (from, to, promotion) => {
    try {
      chess.move({ from, to, promotion });
      setFen(chess.fen());
    } catch (error) {
      console.log('Invalid move');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Chessboard 
        fen={fen}
        onMove={handleMove}
      />
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fen` | string | Starting position | Board position in FEN notation |
| `onMove` | function | Required | Callback when a move is made `(from, to, promotion) => void` |
| `perspective` | 'white' \| 'black' | 'white' | Board orientation |
| `circledSquares` | string[] | [] | Squares to circle (for Hand & Brain mode) |
| `arrows` | ArrowConfig[] | [] | Custom arrows to display |
| `bestMove` | string | null | Best move hint (e.g., "e2e4") |
| `lastMoveFrom` | string | null | Highlight last move from square |
| `lastMoveTo` | string | null | Highlight last move to square |
| `boardTheme` | BoardTheme | green theme | Board color theme |
| `showCoordinates` | boolean | true | Show file and rank labels |
| `showArrows` | boolean | true | Enable arrow display |
| `readonly` | boolean | false | Disable piece interaction |
| `isLoading` | boolean | false | Show loading animation |
| `isDarkTheme` | boolean | false | Dark mode support |
| **NEW** `skipValidation` | boolean | false | Skip chess.js move validation |
| **NEW** `highlightedSquares` | Array | [] | Custom square highlights `[{square: 'e4', color: '#FF0000'}]` |
| **NEW** `blindfoldMode` | boolean | false | Enable shadow chess mode with tokens |
| **NEW** `hiddenSquares` | Set \| "all" | null | Squares to hide in blindfold mode |
| **NEW** `onBlindSelect` | function | null | Callback for blind square selection |
| **NEW** `customBoardArray` | Array | null | Custom board array for skipValidation mode |

## New Features (v0.2.0)

### 🎯 Skip Validation Mode

Bypass chess.js validation for custom chess variants or special scenarios:

```javascript
// Custom board without validation
const customBoard = Array.from({ length: 8 }, () => 
  Array.from({ length: 8 }, () => null)
);

// Place pieces manually
customBoard[0][0] = { type: 'r', color: 'w' };
customBoard[7][7] = { type: 'k', color: 'b' };

<Chessboard 
  skipValidation={true}
  customBoardArray={customBoard}
  onMove={(from, to) => {
    console.log(`Move from ${from} to ${to}`);
    // Handle move without validation
  }}
/>
```

### 🎨 Custom Square Highlights

Highlight squares with custom colors for tutorials, analysis, or special effects:

```javascript
<Chessboard 
  fen={fen}
  highlightedSquares={[
    { square: 'e4', color: '#FF0000' },     // Red
    { square: 'e5', color: '#00FF00' },     // Green
    { square: 'd4', color: 'rgba(0,0,255,0.5)' }, // Semi-transparent blue
    { square: 'f6', color: '#FFD700' }      // Gold
  ]}
  onMove={handleMove}
/>
```

### 👁️ Blindfold Chess Mode

Perfect for memory training and shadow chess variants where pieces are hidden:

```javascript
// Helper to create set with all squares
const createAllSquaresSet = () => {
  const squares = new Set();
  const files = 'abcdefgh';
  const ranks = '12345678';
  
  for (let file of files) {
    for (let rank of ranks) {
      squares.add(`${file}${rank}`);
    }
  }
  
  return squares;
};

// All pieces hidden
<Chessboard 
  fen={chess.fen()}
  blindfoldMode={true}
  hiddenSquares="all"  // Hide all pieces
  onBlindSelect={(square) => {
    console.log('Selected hidden square:', square);
  }}
  onMove={handleMove}
/>

// Selective hiding
const [hiddenSquares, setHiddenSquares] = useState(new Set(['e4', 'e5', 'd4']));

<Chessboard 
  fen={chess.fen()}
  blindfoldMode={true}
  hiddenSquares={hiddenSquares}
  onBlindSelect={(square) => {
    // Reveal piece on click
    setHiddenSquares(prev => {
      const newSet = new Set(prev);
      newSet.delete(square);
      return newSet;
    });
  }}
  onMove={handleMove}
/>

// Dynamic revealing game
const [hiddenSquares, setHiddenSquares] = useState("all");

const handleSquareClick = (square) => {
  if (hiddenSquares === "all") {
    // First click - create set without clicked square
    const allSquares = createAllSquaresSet();
    allSquares.delete(square);
    setHiddenSquares(allSquares);
  } else {
    // Subsequent clicks - reveal more squares
    const newHidden = new Set(hiddenSquares);
    newHidden.delete(square);
    setHiddenSquares(newHidden);
  }
};
```

## Hand & Brain Mode

Perfect for the Hand & Brain chess variant where one player chooses the piece type and another chooses which piece to move:

```javascript
import Chessboard from 'dawikk-chessboard';

function HandAndBrainGame() {
  const [circledSquares, setCircledSquares] = useState([]);
  
  // When "Brain" selects a piece type (e.g., knights)
  const selectPieceType = (pieceType) => {
    const squares = getSquaresWithPieceType(pieceType);
    setCircledSquares(squares); // e.g., ['g1', 'b1']
  };

  return (
    <Chessboard 
      fen={fen}
      onMove={handleMove}
      circledSquares={circledSquares} // Circles appear around these pieces
    />
  );
}
```

## Themes

### Using Pre-built Themes

```javascript
import Chessboard, { DefaultThemes } from 'dawikk-chessboard';

<Chessboard 
  fen={fen}
  onMove={handleMove}
  boardTheme={DefaultThemes.classic}
/>
```

Available themes:
- `DefaultThemes.classic` - Traditional brown and beige
- `DefaultThemes.green` - Modern green (default)
- `DefaultThemes.blue` - Calming blue
- `DefaultThemes.purple` - Royal purple
- `DefaultThemes.dark` - Dark mode
- `DefaultThemes.wood` - Natural wood

### Custom Theme

```javascript
const customTheme = {
  light: '#F0E68C',
  dark: '#8B7355',
  highlighted: '#FFD700',
  moveFrom: 'rgba(255, 215, 0, 0.5)',
  moveTo: 'rgba(255, 215, 0, 0.3)',
  dot: 'rgba(0, 0, 0, 0.3)',
  hintBorder: '#FF6347',
  hintGlow: 'rgba(255, 99, 71, 0.6)',
  hintLightBg: '#FFEFD5',
  hintDarkBg: '#CD853F'
};

<Chessboard 
  fen={fen}
  onMove={handleMove}
  boardTheme={customTheme}
/>
```

## Advanced Features

### Arrows

Show multiple arrows for analysis or training:

```javascript
const arrows = [
  { from: 'e2', to: 'e4', color: 'rgba(0, 255, 0, 0.5)' },
  { from: 'g1', to: 'f3', color: 'rgba(255, 0, 0, 0.5)' }
];

<Chessboard 
  fen={fen}
  onMove={handleMove}
  arrows={arrows}
/>
```

### Ref Methods

```javascript
const boardRef = useRef();

// Highlight a square temporarily
boardRef.current.highlight('e4');

// Clear highlights
boardRef.current.clearHighlight();

// Set position directly
boardRef.current.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// NEW: Set custom board array (skipValidation mode only)
boardRef.current.setBoardArray(customBoardArray);
```

### Readonly Board

Perfect for displaying positions without interaction:

```javascript
<Chessboard 
  fen={fen}
  readonly={true}
  lastMoveFrom="e2"
  lastMoveTo="e4"
/>
```

## Examples

### Puzzle Mode

```javascript
function ChessPuzzle() {
  const [fen] = useState('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1');
  const solution = 'f3g5'; // Ng5!

  return (
    <Chessboard 
      fen={fen}
      onMove={handleMove}
      bestMove={solution}
      boardTheme={DefaultThemes.blue}
    />
  );
}
```

### Memory Training Game

```javascript
function MemoryChess() {
  const [hiddenSquares, setHiddenSquares] = useState("all");
  const [moveCount, setMoveCount] = useState(0);

  const handleBlindSelect = (square) => {
    // Reveal square temporarily
    if (hiddenSquares === "all") {
      const allSquares = createAllSquaresSet();
      allSquares.delete(square);
      setHiddenSquares(allSquares);
    } else {
      const newHidden = new Set(hiddenSquares);
      newHidden.delete(square);
      setHiddenSquares(newHidden);
    }

    // Hide again after 2 seconds
    setTimeout(() => {
      setHiddenSquares("all");
    }, 2000);
  };

  return (
    <Chessboard 
      fen={chess.fen()}
      blindfoldMode={true}
      hiddenSquares={hiddenSquares}
      onBlindSelect={handleBlindSelect}
      onMove={(from, to) => {
        setMoveCount(prev => prev + 1);
        handleMove(from, to);
      }}
    />
  );
}
```

### Chess Variant Board

```javascript
function CustomVariant() {
  // Create custom starting position
  const customBoard = createCustomStartingPosition();
  
  return (
    <Chessboard 
      skipValidation={true}
      customBoardArray={customBoard}
      highlightedSquares={[
        { square: 'd4', color: 'rgba(255, 0, 0, 0.3)' },
        { square: 'e4', color: 'rgba(255, 0, 0, 0.3)' },
        { square: 'd5', color: 'rgba(255, 0, 0, 0.3)' },
        { square: 'e5', color: 'rgba(255, 0, 0, 0.3)' },
      ]}
      onMove={(from, to) => {
        // Custom move logic
        console.log(`Custom move: ${from} to ${to}`);
      }}
    />
  );
}
```

## Performance Tips

1. **Use `readonly` mode** for display-only boards
2. **Memoize callbacks** passed to `onMove` and `onBlindSelect`
3. **Limit arrows** to necessary ones only
4. **Use refs** for imperative actions instead of state changes
5. **For blindfold mode**, consider revealing squares progressively rather than all at once

## Requirements

- React Native 0.60+
- React 16.8+
- iOS 11+ / Android 5+

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Changelog

### v0.2.0
- Added `skipValidation` prop for bypassing chess.js validation
- Added `highlightedSquares` for custom square highlighting
- Added `blindfoldMode` for shadow chess variants
- Added `hiddenSquares` and `onBlindSelect` for blindfold gameplay
- Added `customBoardArray` for custom board positions
- Added token display for hidden pieces
- Improved performance with better memoization

### v0.1.4
- Added `circledSquares` prop for Hand & Brain mode
- Added circle indicator animation for selected pieces
- Improved TypeScript definitions

### v0.1.3
- Initial stable release
- Standalone mode support
- 6 pre-built themes
- Full gesture support
- Promotion overlay
- Arrow system
- Loading states

## License

MIT © Dawid Wrzesinski (Dawikk)

## Author

**Dawid Wrzesinski (Dawikk)**
- Email: dawikk.apps@gmail.com
- GitHub: [DawiQ](https://github.com/DawiQ)

## Support

If you like this project, please consider giving it a ⭐ on [GitHub](https://github.com/DawiQ/dawikk-chessboard)!

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/DawiQ/dawikk-chessboard/issues).