# dawikk-chessboard

A highly optimized, feature-rich React Native chessboard component with gesture support, animations, customizable themes, and standalone mode support.

## Features

- 🎨 **Beautiful Themes** - Multiple pre-built themes (classic, green, blue, purple, dark, wood)
- 🎯 **Hand & Brain Mode** - Circle pieces to indicate which can be moved (NEW in v0.1.4)
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

## Hand & Brain Mode (NEW)

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

### Analysis Board

```javascript
function AnalysisBoard() {
  const boardRef = useRef();
  const [arrows, setArrows] = useState([]);

  const addArrow = (from, to) => {
    setArrows([...arrows, { from, to, color: 'rgba(0, 150, 0, 0.7)' }]);
  };

  return (
    <Chessboard 
      ref={boardRef}
      fen={fen}
      onMove={handleMove}
      arrows={arrows}
      boardTheme={DefaultThemes.green}
    />
  );
}
```

### Tournament Display

```javascript
function TournamentBoard() {
  return (
    <Chessboard 
      fen={fen}
      perspective={currentPlayer}
      readonly={true}
      showCoordinates={true}
      boardTheme={DefaultThemes.classic}
      lastMoveFrom={lastMove.from}
      lastMoveTo={lastMove.to}
    />
  );
}
```

## Performance Tips

1. **Use `readonly` mode** for display-only boards
2. **Memoize callbacks** passed to `onMove`
3. **Limit arrows** to necessary ones only
4. **Use refs** for imperative actions instead of state changes

## Requirements

- React Native 0.60+
- React 16.8+
- iOS 11+ / Android 5+

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Changelog

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