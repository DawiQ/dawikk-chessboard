// enhanced/common/dawikk-chessboard-fresh/Chessboard.js - PURE FLEX LAYOUT VERSION

import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Vibration, 
  Text
} from 'react-native';
import { Chess } from 'chess.js';
import { RFValue } from "react-native-responsive-fontsize";
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Square from './Square';
import PromotionOverlay from './PromotionOverlay';
import BoardLoadingSquare from './BoardLoadingSquare';
import Arrow from './Arrow';

import { 
  useBoardTheme, 
  useTextColors,
  useThemeColors
} from '../themeContext';

// *** LOADING BOARD ROW COMPONENT - Flex Version ***
const LoadingBoardRow = React.memo(({ 
  rowIndex, 
  perspective, 
  boardTheme,
  isDarkTheme = false
}) => {
  const getCenterSquares = () => {
    if (perspective === 'white') {
      return [
        { row: 3, col: 3 }, { row: 3, col: 4 },
        { row: 4, col: 3 }, { row: 4, col: 4 }
      ];
    } else {
      return [
        { row: 4, col: 3 }, { row: 4, col: 4 },
        { row: 3, col: 3 }, { row: 3, col: 4 }
      ];
    }
  };

  const centerSquares = getCenterSquares();
  
  return (
    <View style={styles.boardRow}>
      {Array.from({ length: 8 }, (_, colIndex) => {
        const isCenter = centerSquares.some(
          square => square.row === rowIndex && square.col === colIndex
        );
        
        let animationDelay = 0;
        if (isCenter) {
          const centerIndex = centerSquares.findIndex(
            square => square.row === rowIndex && square.col === colIndex
          );
          animationDelay = centerIndex * 150;
        }

        const isBlack = (rowIndex + colIndex) % 2 !== 0;
        const baseColor = boardTheme 
          ? (isBlack ? boardTheme.dark : boardTheme.light)
          : (isBlack ? '#769656' : '#eeeed2');

        return (
          <BoardLoadingSquare
            key={`loading-${rowIndex}-${colIndex}`}
            isCenter={isCenter}
            baseColor={baseColor}
            animationDelay={animationDelay}
            isDarkTheme={isDarkTheme}
          />
        );
      })}
    </View>
  );
});

LoadingBoardRow.displayName = 'LoadingBoardRow';

// *** READONLY BOARD ROW COMPONENT - Optimized for performance ***
const ReadonlyBoardRow = React.memo(({ 
  row, 
  rowIndex, 
  lastMoveFrom, 
  lastMoveTo, 
  perspective, 
  hintSquare,
  currentSquareSize
}) => {
  return (
    <View style={styles.boardRow}>
      {row.map((square, colIndex) => {
        const squareNotation = perspective === 'white'
          ? `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`
          : `${String.fromCharCode(104 - colIndex)}${rowIndex + 1}`;

        return (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={square}
            row={rowIndex}
            col={colIndex}
            square={squareNotation}
            isHighlighted={false}
            isMovePossible={false}
            onSquarePress={() => {}} // Empty function for readonly
            isLastMoveFrom={squareNotation === lastMoveFrom}
            isLastMoveTo={squareNotation === lastMoveTo}
            isHintSquare={squareNotation === hintSquare}
            onGestureEvent={() => {}} // Empty function for readonly
            onHandlerStateChange={() => {}} // Empty function for readonly
            perspective={perspective}
            currentSquareSize={currentSquareSize}
            readonly={true}
          />
        );
      })}
    </View>
  );
});

ReadonlyBoardRow.displayName = 'ReadonlyBoardRow';

// *** NORMAL BOARD ROW COMPONENT - Flex Version ***
const BoardRow = React.memo(({ 
  row, 
  rowIndex, 
  onSquarePress, 
  onGestureEvent, 
  onHandlerStateChange, 
  selectedSquare, 
  validMoves, 
  lastMoveFrom, 
  lastMoveTo, 
  perspective, 
  hintSquare,
  currentSquareSize
}) => {
  return (
    <View style={styles.boardRow}>
      {row.map((square, colIndex) => {
        const squareNotation = perspective === 'white'
          ? `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`
          : `${String.fromCharCode(104 - colIndex)}${rowIndex + 1}`;

        return (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={square}
            row={rowIndex}
            col={colIndex}
            square={squareNotation}
            isHighlighted={selectedSquare === squareNotation}
            isMovePossible={validMoves.includes(squareNotation)}
            onSquarePress={onSquarePress}
            isLastMoveFrom={squareNotation === lastMoveFrom}
            isLastMoveTo={squareNotation === lastMoveTo}
            isHintSquare={squareNotation === hintSquare}
            onGestureEvent={onGestureEvent(squareNotation)}
            onHandlerStateChange={onHandlerStateChange(squareNotation)}
            perspective={perspective}
            currentSquareSize={currentSquareSize}
          />
        );
      })}
    </View>
  );
});

BoardRow.displayName = 'BoardRow';

// *** MAIN COMPONENT WITH PURE FLEX LAYOUT ***
const SmoothChessboard = forwardRef((props, ref) => {
  const {
    fen: initialFen,
    perspective = 'white',
    onMove,
    lastMoveFrom: propLastMoveFrom,
    lastMoveTo: propLastMoveTo,
    isLoading = false,
    bestMove,
    arrows = [],
    expectedMove,
    textColors,
    boardTheme,
    colors,
    isDarkTheme = false,
    showArrows = true,
    showCoordinates = true,
    readonly = false  // New prop for view-only mode
  } = props;

  // *** STATE ***
  const [chess, setChess] = useState(() => new Chess(initialFen));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [lastMoveFrom, setLastMoveFrom] = useState(propLastMoveFrom || null);
  const [lastMoveTo, setLastMoveTo] = useState(propLastMoveTo || null);
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionFrom, setPromotionFrom] = useState('');
  const [promotionTo, setPromotionTo] = useState('');
  const [hintSquare, setHintSquare] = useState(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });

  // *** REFS ***
  const panValues = useRef({});
  const lastMoveTime = useRef(0);
  const moveDebounceDelay = 150;
  const boardRef = useRef(null);
  const prevFenRef = useRef(initialFen);

  // Calculate square size based on board dimensions
  const currentSquareSize = useMemo(() => {
    if (!boardDimensions.width || !boardDimensions.height) return 0;
    const size = Math.min(boardDimensions.width, boardDimensions.height);
    return Math.floor(size / 8);
  }, [boardDimensions]);

  // Handle board layout to get dimensions
  const handleBoardLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardDimensions({ width, height });
  }, []);

  // *** EFFECT TO UPDATE CHESS POSITION ***
  useEffect(() => {
    if (initialFen && initialFen !== prevFenRef.current) {
      const newChess = new Chess(initialFen);
      setChess(newChess);
      setSelectedSquare(null);
      setValidMoves([]);
      setHintSquare(null);
      prevFenRef.current = initialFen;
      
      console.log('📋 Board position updated from prop');
    }
  }, [initialFen]);

  // *** EFFECT TO UPDATE LAST MOVE ***
  useEffect(() => {
    setLastMoveFrom(propLastMoveFrom);
    setLastMoveTo(propLastMoveTo);
  }, [propLastMoveFrom, propLastMoveTo]);

  // *** IMPERATIVE HANDLE FOR REF ***
  useImperativeHandle(ref, () => ({
    highlight: (square) => {
      console.log('🔍 Highlighting square:', square);
      
      if (!square || typeof square !== 'string') {
        console.warn('Invalid square for highlight:', square);
        return;
      }
      
      if (!/^[a-h][1-8]$/.test(square)) {
        console.warn('Invalid square format for highlight:', square);
        return;
      }
      
      setHintSquare(square);
      
      setTimeout(() => {
        setHintSquare(prevHint => prevHint === square ? null : prevHint);
      }, 3000);
    },
    
    clearHighlight: () => {
      setHintSquare(null);
    },
    
    setFen: (fen) => {
      const newChess = new Chess(fen);
      setChess(newChess);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMoveFrom(null);
      setLastMoveTo(null);
      setHintSquare(null);
    }
  }), []);

  // *** HANDLE MOVE ***
  const handleMove = useCallback((from, to, promotion) => {
    const now = Date.now();
    if (now - lastMoveTime.current < moveDebounceDelay) {
      return;
    }
    lastMoveTime.current = now;

    try {
      const testChess = new Chess(chess.fen());
      const move = testChess.move({ from, to, promotion });
      
      if (move) {
        // Create new chess instance with the move
        const newChess = new Chess(chess.fen());
        const actualMove = newChess.move({ from, to, promotion });
        
        if (actualMove) {
          setChess(newChess); // Update chess state
          onMove?.(from, to, promotion);
          
          setLastMoveFrom(from);
          setLastMoveTo(to);
          setSelectedSquare(null);
          setValidMoves([]);
          setHintSquare(null);
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } catch (e) {
      console.warn('Move error:', e);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [chess, onMove]);

  // *** HANDLE PAWN PROMOTION ***
  const handlePawnPromotion = useCallback((from, to) => {
    setShowPromotion(true);
    setPromotionFrom(from);
    setPromotionTo(to);
  }, []);

  // *** HANDLE PROMOTION SELECT ***
  const handlePromotionSelect = useCallback((piece) => {
    handleMove(promotionFrom, promotionTo, piece);
    setShowPromotion(false);
    setPromotionFrom('');
    setPromotionTo('');
  }, [handleMove, promotionFrom, promotionTo]);

  // *** SQUARE PRESS HANDLER ***
  const onSquarePress = useCallback((square) => {
    if (isLoading || readonly) return; // Skip if readonly

    if (selectedSquare && selectedSquare !== square) {
      const piece = chess.get(selectedSquare);
      const pieceTo = chess.get(square);
      
      if (piece && piece.type === 'p' && 
         ((piece.color === 'b' && selectedSquare[1] === '2' && square[1] === '1') || 
          (piece.color === 'w' && selectedSquare[1] === '7' && square[1] === '8'))) {
        handlePawnPromotion(selectedSquare, square);
      } else {
        if (piece && pieceTo && piece.color === pieceTo.color) {
          const moves = chess.moves({ square, verbose: true }).map(move => move.to);
          setValidMoves(moves);
          setSelectedSquare(square);
          return;
        } else {
          handleMove(selectedSquare, square);
        }
      }
    } else {
      const moves = chess.moves({ square, verbose: true }).map(move => move.to);
      setValidMoves(moves);
      setSelectedSquare(square);
    }
  }, [isLoading, readonly, selectedSquare, chess, handleMove, handlePawnPromotion]);

  // *** GESTURE HANDLERS ***
  const onGestureEvent = useCallback((square) => ({ nativeEvent }) => {
    if (isLoading || readonly || !currentSquareSize) return; // Skip if readonly
    
    panValues.current[square] = {
      x: nativeEvent.translationX,
      y: nativeEvent.translationY
    };
  }, [isLoading, readonly, currentSquareSize]);

  const onHandlerStateChange = useCallback((square) => ({ nativeEvent }) => {
    if (isLoading || readonly || !currentSquareSize) return; // Skip if readonly
    
    if (nativeEvent.state === State.END) {
      const col = parseInt(square.charCodeAt(0) - 97);
      const row = perspective === 'white' ? 8 - parseInt(square[1]) : parseInt(square[1]) - 1;
      
      const toCol = col + Math.round(nativeEvent.translationX / currentSquareSize);
      const toRow = row + Math.round(nativeEvent.translationY / currentSquareSize);

      panValues.current[square] = { x: 0, y: 0 };

      if (toCol >= 0 && toCol < 8 && toRow >= 0 && toRow < 8) {
        const to = perspective === 'white'
          ? `${String.fromCharCode(97 + toCol)}${8 - toRow}`
          : `${String.fromCharCode(104 - toCol)}${toRow + 1}`;

        if (expectedMove === `${selectedSquare}${to}`) {
          const piece = chess.get(selectedSquare);
          if (piece?.type === 'p' && (toRow === 0 || toRow === 7)) {
            Vibration.vibrate(30);
            handlePawnPromotion(selectedSquare, to);
          } else {
            Vibration.vibrate(50);
            handleMove(selectedSquare, to);
          }
        } else {
          if (validMoves.includes(to)) {
            const piece = chess.get(selectedSquare);
            if (piece?.type === 'p' && (toRow === 0 || toRow === 7)) {
              Vibration.vibrate(30);
              handlePawnPromotion(selectedSquare, to);
            } else {
              Vibration.vibrate(50);
              handleMove(selectedSquare, to);
            }
          } else {
            Vibration.vibrate(80);
          }
        }
      } else {
        Vibration.vibrate(80);
      }
      setSelectedSquare(null);
    }
  }, [isLoading, perspective, currentSquareSize, selectedSquare, validMoves, expectedMove, chess, handleMove, handlePawnPromotion]);

  // *** PARSE BEST MOVE ***
  const parseBestMove = useCallback(() => {
    if (!bestMove || typeof bestMove !== 'string' || bestMove.length < 4) {
      return null;
    }

    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    
    const isValidSquare = (square) => {
      return /^[a-h][1-8]$/.test(square);
    };

    if (!isValidSquare(from) || !isValidSquare(to)) {
      return null;
    }

    return { from, to };
  }, [bestMove]);

  // *** GET MOVING PIECE ***
  const getMovingPiece = useCallback((from) => {
    try {
      const piece = chess.get(from);
      return piece ? piece.type : null;
    } catch (error) {
      return null;
    }
  }, [chess]);

  // *** MEMOIZED VALUES ***
  const files = useMemo(() => 
    perspective === 'white' 
      ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] 
      : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
  , [perspective]);
      
  const ranks = useMemo(() =>
    perspective === 'white'
      ? ['8', '7', '6', '5', '4', '3', '2', '1']
      : ['1', '2', '3', '4', '5', '6', '7', '8']
  , [perspective]);

  const bestMoveData = useMemo(() => parseBestMove(), [parseBestMove]);
  const movingPiece = useMemo(() => bestMoveData ? getMovingPiece(bestMoveData.from) : null, [bestMoveData, getMovingPiece]);

  const board = useMemo(() => {
    const boardArray = chess.board();
    if (perspective === 'black') {
      boardArray.reverse();
      for (let row of boardArray) {
        row.reverse();
      }
    }
    return boardArray;
  }, [chess, perspective]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.chessboardWrapper}>
        {/* Square container for the entire chessboard component */}
        <View style={styles.outerContainer}>
          <View style={styles.boardWithLabels}>
            {/* Board row with rank labels */}
            <View style={styles.boardRowContainer}>
              {/* RANK LABELS */}
              {showCoordinates && (
                <View style={styles.rankLabelsWrapper}>
                  <View style={styles.rankLabels}>
                    {ranks.map((rank, index) => (
                      <View key={`rank-${index}`} style={styles.rankLabelItem}>
                        <Text style={[styles.coordinateText, { color: textColors.subtitleText }]}>
                          {rank}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* BOARD */}
              <View style={styles.boardWrapper}>
                <View 
                  ref={boardRef}
                  style={styles.boardContainer}
                  onLayout={handleBoardLayout}
                >
                  <View style={styles.board}>
                    {/* Board Content */}
                    {isLoading ? (
                      Array.from({ length: 8 }, (_, rowIndex) => (
                        <LoadingBoardRow
                          key={`loading-row-${rowIndex}`}
                          rowIndex={rowIndex}
                          perspective={perspective}
                          boardTheme={boardTheme}
                          isDarkTheme={isDarkTheme}
                        />
                      ))
                    ) : readonly ? (
                      // Readonly mode - optimized for performance
                      board.map((row, rowIndex) => (
                        <ReadonlyBoardRow
                          key={`readonly-row-${rowIndex}`}
                          row={row}
                          rowIndex={rowIndex}
                          lastMoveFrom={lastMoveFrom}
                          lastMoveTo={lastMoveTo}
                          hintSquare={hintSquare}
                          perspective={perspective}
                          currentSquareSize={currentSquareSize}
                        />
                      ))
                    ) : (
                      // Interactive mode
                      board.map((row, rowIndex) => (
                        <BoardRow
                          key={`row-${rowIndex}`}
                          row={row}
                          rowIndex={rowIndex}
                          onSquarePress={onSquarePress}
                          onGestureEvent={onGestureEvent}
                          onHandlerStateChange={onHandlerStateChange}
                          selectedSquare={selectedSquare}
                          validMoves={validMoves}
                          lastMoveFrom={lastMoveFrom}
                          lastMoveTo={lastMoveTo}
                          hintSquare={hintSquare}
                          perspective={perspective}
                          currentSquareSize={currentSquareSize}
                        />
                      ))
                    )}

                    {/* Arrow overlays - only render if we have dimensions */}
                    {!isLoading && showArrows && currentSquareSize > 0 && (
                      <>
                        {/* Custom arrows */}
                        {arrows && arrows.length > 0 && arrows.map((arrow, index) => (
                          <Arrow
                            key={`custom-arrow-${index}-${arrow.from}-${arrow.to}`}
                            from={arrow.from}
                            to={arrow.to}
                            squareSize={currentSquareSize}
                            boardSize={boardDimensions.width}
                            perspective={perspective}
                            piece={arrow.piece || null}
                            opacity={arrow.opacity || 0.8}
                            color={arrow.color || 'rgba(131, 169, 120, 0.8)'}
                          />
                        ))}

                        {/* Best move arrow */}
                        {bestMoveData && (
                          <Arrow
                            from={bestMoveData.from}
                            to={bestMoveData.to}
                            squareSize={currentSquareSize}
                            boardSize={boardDimensions.width}
                            perspective={perspective}
                            piece={movingPiece}
                            opacity={0.8}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
            
            {/* FILE LABELS */}
            {showCoordinates ? (
              <View style={styles.fileLabelsRow}>
                <View style={styles.fileLabelsOffset} />
                <View style={styles.fileLabels}>
                  {files.map((file, index) => (
                    <View key={`file-${index}`} style={styles.fileLabelItem}>
                      <Text style={[styles.coordinateText, { color: textColors.subtitleText }]}>
                        {file}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      
      {showPromotion && (
        <PromotionOverlay 
          onSelect={handlePromotionSelect} 
          color={chess.turn()}
        />
      )}
    </GestureHandlerRootView>
  );
});

// *** WRAPPER COMPONENT ***
const SmoothChessboardWrapper = React.memo(forwardRef((props, ref) => {
  const { boardTheme } = useBoardTheme();
  const textColors = useTextColors();
  
  const colors = useThemeColors((theme) => ({
    background: theme?.background,
    titleText: theme?.titleText
  }));

  const memoizedProps = useMemo(() => ({
    ...props,
    boardTheme,
    colors,
    textColors: {
      subtitleText: textColors.subtitleText
    }
  }), [props, boardTheme, colors, textColors.subtitleText]);

  return (
    <SmoothChessboard 
      {...memoizedProps} 
      ref={ref}
    />
  );
}));

SmoothChessboardWrapper.displayName = 'SmoothChessboard';

// *** PURE FLEX LAYOUT STYLES ***
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chessboardWrapper: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerContainer: {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: 1, // The entire component maintains square ratio
  },
  boardWithLabels: {
    flex: 1,
    width: '100%',
  },
  boardRowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rankLabelsWrapper: {
    width: 24,
    paddingRight: 4,
  },
  rankLabels: {
    flex: 1,
    flexDirection: 'column',
  },
  rankLabelItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardWrapper: {
    flex: 1,
  },
  boardContainer: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  board: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  boardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  fileLabelsRow: {
    height: 24,
    flexDirection: 'row',
    marginTop: 4,
  },
  fileLabelsOffset: {
    width: 24,
  },
  fileLabels: {
    flex: 1,
    flexDirection: 'row',
  },
  fileLabelItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinateText: {
    fontSize: RFValue(12),
    fontWeight: '600',
  },
});

export default SmoothChessboardWrapper;