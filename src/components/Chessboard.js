// src/components/Chessboard.js
import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle, useRef, useEffect, useReducer } from 'react';
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

const DEFAULT_BOARD_THEME = {
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
};

const DEFAULT_TEXT_COLORS = {
  subtitleText: '#6B7280'
};

const BOARD_ACTIONS = {
  SELECT_SQUARE: 'SELECT_SQUARE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_HINT: 'SET_HINT',
  CLEAR_HINT: 'CLEAR_HINT',
  SET_LAST_MOVE: 'SET_LAST_MOVE',
  SHOW_PROMOTION: 'SHOW_PROMOTION',
  HIDE_PROMOTION: 'HIDE_PROMOTION',
  RESET_STATE: 'RESET_STATE'
};

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.SELECT_SQUARE:
      return {
        ...state,
        selectedSquare: action.square,
        validMoves: action.validMoves || []
      };
    case BOARD_ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selectedSquare: null,
        validMoves: []
      };
    case BOARD_ACTIONS.SET_HINT:
      return {
        ...state,
        hintSquare: action.square
      };
    case BOARD_ACTIONS.CLEAR_HINT:
      return {
        ...state,
        hintSquare: null
      };
    case BOARD_ACTIONS.SET_LAST_MOVE:
      return {
        ...state,
        lastMoveFrom: action.from,
        lastMoveTo: action.to
      };
    case BOARD_ACTIONS.SHOW_PROMOTION:
      return {
        ...state,
        showPromotion: true,
        promotionFrom: action.from,
        promotionTo: action.to
      };
    case BOARD_ACTIONS.HIDE_PROMOTION:
      return {
        ...state,
        showPromotion: false,
        promotionFrom: '',
        promotionTo: ''
      };
    case BOARD_ACTIONS.RESET_STATE:
      return {
        selectedSquare: null,
        validMoves: [],
        lastMoveFrom: action.lastMoveFrom || null,
        lastMoveTo: action.lastMoveTo || null,
        hintSquare: null,
        showPromotion: false,
        promotionFrom: '',
        promotionTo: ''
      };
    default:
      return state;
  }
};

// Helper function to transform board array based on perspective
const transformBoardArray = (originalArray, perspective) => {
  const result = [];
  
  if (perspective === 'white') {
    // For white: just copy as is
    for (let i = 0; i < originalArray.length; i++) {
      const row = [];
      for (let j = 0; j < originalArray[i].length; j++) {
        row.push(originalArray[i][j]);
      }
      result.push(row);
    }
  } else {
    // For black: reverse rows and columns
    for (let i = originalArray.length - 1; i >= 0; i--) {
      const row = [];
      for (let j = originalArray[i].length - 1; j >= 0; j--) {
        row.push(originalArray[i][j]);
      }
      result.push(row);
    }
  }
  
  return result;
};

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

const OptimizedBoardRow = React.memo(({ 
  row, 
  rowIndex, 
  handlers, 
  boardState, 
  perspective, 
  circledSquares,
  currentSquareSize,
  boardTheme,
  readonly,
  highlightedSquares,
  blindfoldMode,
  hiddenSquares,
  onBlindSelect
}) => {
  const squareNotations = useMemo(() => {
    return Array.from({ length: 8 }, (_, colIndex) => {
      return perspective === 'white'
        ? `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`
        : `${String.fromCharCode(104 - colIndex)}${rowIndex + 1}`;
    });
  }, [rowIndex, perspective]);

  return (
    <View style={styles.boardRow}>
      {row.map((square, colIndex) => {
        const squareNotation = squareNotations[colIndex];
        
        const customHighlight = highlightedSquares?.find(h => h.square === squareNotation);
        
        const hasPiece = square !== null;
        const isHidden = blindfoldMode && hasPiece && (
          hiddenSquares === "all" || 
          hiddenSquares?.has?.(squareNotation)
        );
        
        return (
          <Square
            key={`${squareNotation}`}
            piece={square}
            row={rowIndex}
            col={colIndex}
            square={squareNotation}
            isHighlighted={boardState.selectedSquare === squareNotation}
            isMovePossible={boardState.validMoves.includes(squareNotation)}
            onSquarePress={handlers.onSquarePress}
            isLastMoveFrom={boardState.lastMoveFrom === squareNotation}
            isLastMoveTo={boardState.lastMoveTo === squareNotation}
            isHintSquare={boardState.hintSquare === squareNotation}
            isCircled={circledSquares?.includes(squareNotation)}
            onGestureEvent={handlers.onGestureEvent}
            onHandlerStateChange={handlers.onHandlerStateChange}
            perspective={perspective}
            currentSquareSize={currentSquareSize}
            boardTheme={boardTheme}
            readonly={readonly}
            customHighlightColor={customHighlight?.color}
            showToken={isHidden}
            onBlindSelect={onBlindSelect}
          />
        );
      })}
    </View>
  );
});

OptimizedBoardRow.displayName = 'OptimizedBoardRow';

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
    circledSquares = [],
    restrictToCircled = false,
    onRestrictedMoveAttempt,
    boardTheme = null,
    textColors = null,
    colors = null,
    isDarkTheme = false,
    showArrows = true,
    showCoordinates = true,
    readonly = false,
    highlightedSquares = [],
    blindfoldMode = false,
    hiddenSquares = null,
    onBlindSelect = null,
  } = props;

  const activeBoardTheme = boardTheme || DEFAULT_BOARD_THEME;
  const activeTextColors = textColors || DEFAULT_TEXT_COLORS;

  const [boardState, dispatch] = useReducer(boardReducer, {
    selectedSquare: null,
    validMoves: [],
    lastMoveFrom: propLastMoveFrom || null,
    lastMoveTo: propLastMoveTo || null,
    hintSquare: null,
    showPromotion: false,
    promotionFrom: '',
    promotionTo: ''
  });

  const chessRef = useRef(new Chess(initialFen, {skipValidation: true}));
  
  const [boardArray, setBoardArray] = useState(() => {
    if (chessRef.current) {
      const originalArray = chessRef.current.board();
      return transformBoardArray(originalArray, perspective);
    } else {
      return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
    }
  });

  const panValuesRef = useRef({});
  const lastMoveTimeRef = useRef(0);
  const boardDimensionsRef = useRef({ width: 0, height: 0 });
  const [currentSquareSize, setCurrentSquareSize] = useState(0);
  const prevFenRef = useRef(initialFen);
  const prevPerspectiveRef = useRef(perspective);

  const handleBoardLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    boardDimensionsRef.current = { width, height };
    const size = Math.floor(Math.min(width, height) / 8);
    setCurrentSquareSize(size);
  }, []);

  useEffect(() => {
    const fenChanged = initialFen && initialFen !== prevFenRef.current;
    const perspectiveChanged = perspective !== prevPerspectiveRef.current;
    
    if (fenChanged || perspectiveChanged) {
      if (fenChanged) {
        chessRef.current = new Chess(initialFen, {skipValidation: true});
      }
      
      const originalArray = chessRef.current.board();
      const array = transformBoardArray(originalArray, perspective);
      setBoardArray(array);
      
      if (fenChanged) {
        dispatch({ 
          type: BOARD_ACTIONS.RESET_STATE, 
          lastMoveFrom: propLastMoveFrom,
          lastMoveTo: propLastMoveTo
        });
      }
      
      prevFenRef.current = initialFen;
      prevPerspectiveRef.current = perspective;
    }
  }, [initialFen, perspective, propLastMoveFrom, propLastMoveTo]);

  useEffect(() => {
    if (propLastMoveFrom !== boardState.lastMoveFrom || propLastMoveTo !== boardState.lastMoveTo) {
      dispatch({ 
        type: BOARD_ACTIONS.SET_LAST_MOVE, 
        from: propLastMoveFrom, 
        to: propLastMoveTo 
      });
    }
  }, [propLastMoveFrom, propLastMoveTo]);

  useImperativeHandle(ref, () => ({
    highlight: (square) => {
      if (!square || typeof square !== 'string' || !/^[a-h][1-8]$/.test(square)) {
        console.warn('Invalid square for highlight:', square);
        return;
      }
      dispatch({ type: BOARD_ACTIONS.SET_HINT, square });
      setTimeout(() => {
        dispatch({ type: BOARD_ACTIONS.CLEAR_HINT });
      }, 3000);
    },
    clearHighlight: () => {
      dispatch({ type: BOARD_ACTIONS.CLEAR_HINT });
    },
    setFen: (fen) => {
      chessRef.current = new Chess(fen, {skipValidation: true});
      const originalArray = chessRef.current.board();
      const array = transformBoardArray(originalArray, perspective);
      setBoardArray(array);
      dispatch({ type: BOARD_ACTIONS.RESET_STATE });
    }
  }), [perspective]);

  const handleMove = useCallback((from, to, promotion) => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 150) return;
    lastMoveTimeRef.current = now;

    try {
      const currentChess = chessRef.current;
      const testChess = new Chess(currentChess.fen(), {skipValidation: true});
      const move = testChess.move({ from, to, promotion });
      
      if (move) {
        chessRef.current.move({ from, to, promotion });
        const originalArray = chessRef.current.board();
        const array = transformBoardArray(originalArray, perspective);
        setBoardArray(array);
        onMove?.(from, to, promotion);
        
        dispatch({ type: BOARD_ACTIONS.SET_LAST_MOVE, from, to });
        dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
      } else {
        dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
      }
    } catch (e) {
      console.warn('Move error:', e);
      dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
    }
  }, [onMove, perspective]);

  const handlePromotionSelect = useCallback((piece) => {
    handleMove(boardState.promotionFrom, boardState.promotionTo, piece);
    dispatch({ type: BOARD_ACTIONS.HIDE_PROMOTION });
  }, [handleMove, boardState.promotionFrom, boardState.promotionTo]);

  const canSelectPiece = useCallback((square) => {
    if (restrictToCircled && circledSquares && circledSquares.length > 0) {
      return circledSquares.includes(square);
    }
    return true;
  }, [restrictToCircled, circledSquares]);

  const onSquarePress = useCallback((square) => {
    if (isLoading || readonly) return;

    if (blindfoldMode && onBlindSelect) {
      onBlindSelect(square);
      return;
    }

    const currentChess = chessRef.current;
    const currentTurn = currentChess.turn();
    const clickedPiece = currentChess.get(square);
    const selectedPiece = boardState.selectedSquare ? currentChess.get(boardState.selectedSquare) : null;

    if (boardState.selectedSquare === square) {
      dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
      return;
    }

    if (boardState.selectedSquare && selectedPiece) {
      if (clickedPiece && clickedPiece.color === currentTurn) {
        if (!canSelectPiece(square)) {
          onRestrictedMoveAttempt?.(square, 'select');
          Vibration.vibrate(100);
          return;
        }
        const moves = currentChess.moves({ square, verbose: true }).map(move => move.to);
        dispatch({ type: BOARD_ACTIONS.SELECT_SQUARE, square, validMoves: moves });
        return;
      }
      
      if (selectedPiece.type === 'p' && 
         ((selectedPiece.color === 'b' && boardState.selectedSquare[1] === '2' && square[1] === '1') || 
          (selectedPiece.color === 'w' && boardState.selectedSquare[1] === '7' && square[1] === '8'))) {
        dispatch({ 
          type: BOARD_ACTIONS.SHOW_PROMOTION, 
          from: boardState.selectedSquare, 
          to: square 
        });
        return;
      }
      
      handleMove(boardState.selectedSquare, square);
      return;
    }

    if (clickedPiece && clickedPiece.color === currentTurn) {
      if (!canSelectPiece(square)) {
        onRestrictedMoveAttempt?.(square, 'select');
        Vibration.vibrate(100);
        return;
      }
      const moves = currentChess.moves({ square, verbose: true }).map(move => move.to);
      dispatch({ type: BOARD_ACTIONS.SELECT_SQUARE, square, validMoves: moves });
    } else {
      dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
    }
  }, [isLoading, readonly, boardState.selectedSquare, handleMove, canSelectPiece, onRestrictedMoveAttempt, blindfoldMode, onBlindSelect]);

  const onGestureEvent = useCallback(({ nativeEvent }, square) => {
    if (isLoading || readonly || !currentSquareSize) return;
    if (!canSelectPiece(square)) return;
    
    panValuesRef.current[square] = {
      x: nativeEvent.translationX,
      y: nativeEvent.translationY
    };
  }, [isLoading, readonly, currentSquareSize, canSelectPiece]);

  const onHandlerStateChange = useCallback(({ nativeEvent }, square) => {
    if (isLoading || readonly || !currentSquareSize || blindfoldMode) return;
    
    if (nativeEvent.state === State.BEGAN) {
      if (!canSelectPiece(square)) {
        onRestrictedMoveAttempt?.(square, 'drag');
        Vibration.vibrate(100);
        return;
      }
    }
    
    if (nativeEvent.state === State.END) {
      const col = parseInt(square.charCodeAt(0) - 97);
      const row = perspective === 'white' ? 8 - parseInt(square[1]) : parseInt(square[1]) - 1;
      
      const toCol = col + Math.round(nativeEvent.translationX / currentSquareSize);
      const toRow = row + Math.round(nativeEvent.translationY / currentSquareSize);

      panValuesRef.current[square] = { x: 0, y: 0 };

      if (toCol >= 0 && toCol < 8 && toRow >= 0 && toRow < 8) {
        const to = perspective === 'white'
          ? `${String.fromCharCode(97 + toCol)}${8 - toRow}`
          : `${String.fromCharCode(104 - toCol)}${toRow + 1}`;

        if (boardState.validMoves.includes(to)) {
          const currentChess = chessRef.current;
          const piece = currentChess.get(boardState.selectedSquare);
          if (piece?.type === 'p' && (toRow === 0 || toRow === 7)) {
            Vibration.vibrate(30);
            dispatch({ 
              type: BOARD_ACTIONS.SHOW_PROMOTION, 
              from: boardState.selectedSquare, 
              to 
            });
          } else {
            Vibration.vibrate(50);
            handleMove(boardState.selectedSquare, to);
          }
        } else {
          Vibration.vibrate(80);
        }
      } else {
        Vibration.vibrate(80);
      }
      dispatch({ type: BOARD_ACTIONS.CLEAR_SELECTION });
    }
  }, [isLoading, readonly, perspective, currentSquareSize, boardState.selectedSquare, boardState.validMoves, handleMove, canSelectPiece, onRestrictedMoveAttempt, blindfoldMode]);

  const handlers = useMemo(() => ({
    onSquarePress,
    onGestureEvent: (square) => (event) => onGestureEvent(event, square),
    onHandlerStateChange: (square) => (event) => onHandlerStateChange(event, square)
  }), [onSquarePress, onGestureEvent, onHandlerStateChange]);

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

  const bestMoveData = useMemo(() => {
    if (!bestMove || typeof bestMove !== 'string' || bestMove.length < 4) return null;
    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) return null;
    return { from, to };
  }, [bestMove]);

  const movingPiece = useMemo(() => {
    if (!bestMoveData) return null;
    try {
      const piece = chessRef.current?.get(bestMoveData.from);
      return piece ? piece.type : null;
    } catch {
      return null;
    }
  }, [bestMoveData]);

  // *** OPTIMIZED ARROWS RENDERING ***
  const renderedArrows = useMemo(() => {
    if (isLoading || !showArrows || currentSquareSize <= 0 || boardDimensionsRef.current.width <= 0) {
      return null;
    }

    const arrowComponents = [];

    // Render user arrows
    if (arrows?.length > 0) {
      arrows.forEach((arrow) => {
        // Use stable key based on arrow properties
        const key = `${arrow.from}-${arrow.to}-${arrow.color || 'default'}`;
        arrowComponents.push(
          <Arrow
            key={key}
            from={arrow.from}
            to={arrow.to}
            squareSize={currentSquareSize}
            boardSize={boardDimensionsRef.current.width}
            perspective={perspective}
            piece={arrow.piece || null}
            opacity={arrow.opacity || 0.8}
            color={arrow.color || 'rgba(131, 169, 120, 0.8)'}
          />
        );
      });
    }

    // Render best move arrow
    if (bestMoveData) {
      arrowComponents.push(
        <Arrow
          key="best-move"
          from={bestMoveData.from}
          to={bestMoveData.to}
          squareSize={currentSquareSize}
          boardSize={boardDimensionsRef.current.width}
          perspective={perspective}
          piece={movingPiece}
          opacity={0.8}
        />
      );
    }

    return arrowComponents.length > 0 ? arrowComponents : null;
  }, [isLoading, showArrows, currentSquareSize, arrows, bestMoveData, movingPiece, perspective]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.chessboardWrapper}>
        <View style={styles.outerContainer}>
          <View style={styles.boardWithLabels}>
            <View style={styles.boardRowContainer}>
              {showCoordinates && (
                <View style={styles.rankLabelsWrapper}>
                  <View style={styles.rankLabels}>
                    {ranks.map((rank, index) => (
                      <View key={`rank-${index}`} style={styles.rankLabelItem}>
                        <Text style={[styles.coordinateText, { color: activeTextColors.subtitleText }]}>
                          {rank}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              <View style={styles.boardWrapper}>
                <View 
                  style={styles.boardContainer}
                  onLayout={handleBoardLayout}
                >
                  <View style={styles.board}>
                    {isLoading ? (
                      Array.from({ length: 8 }, (_, rowIndex) => (
                        <LoadingBoardRow
                          key={`loading-row-${rowIndex}`}
                          rowIndex={rowIndex}
                          perspective={perspective}
                          boardTheme={activeBoardTheme}
                          isDarkTheme={isDarkTheme}
                        />
                      ))
                    ) : (
                      boardArray.map((row, rowIndex) => (
                        <OptimizedBoardRow
                          key={`row-${rowIndex}`}
                          row={row}
                          rowIndex={rowIndex}
                          handlers={handlers}
                          boardState={boardState}
                          perspective={perspective}
                          circledSquares={circledSquares}
                          currentSquareSize={currentSquareSize}
                          boardTheme={activeBoardTheme}
                          readonly={readonly}
                          highlightedSquares={highlightedSquares}
                          blindfoldMode={blindfoldMode}
                          hiddenSquares={hiddenSquares}
                          onBlindSelect={onBlindSelect}
                        />
                      ))
                    )}

                    {renderedArrows}
                  </View>
                </View>
              </View>
            </View>
            
            {showCoordinates && (
              <View style={styles.fileLabelsRow}>
                <View style={styles.fileLabelsOffset} />
                <View style={styles.fileLabels}>
                  {files.map((file, index) => (
                    <View key={`file-${index}`} style={styles.fileLabelItem}>
                      <Text style={[styles.coordinateText, { color: activeTextColors.subtitleText }]}>
                        {file}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {boardState.showPromotion && (
        <PromotionOverlay 
          onSelect={handlePromotionSelect} 
          color={chessRef.current?.turn() || 'w'}
          colors={colors}
          textColors={activeTextColors}
          backgroundColors={{ cardBackground: colors?.cardBackground || '#FFFFFF' }}
        />
      )}
    </GestureHandlerRootView>
  );
});

SmoothChessboard.displayName = 'SmoothChessboard';

const SmoothChessboardWrapper = React.memo(forwardRef((props, ref) => {
  const defaultBoardTheme = {
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
  };

  const memoizedProps = useMemo(() => ({
    ...props,
    boardTheme: props.boardTheme || defaultBoardTheme,
    textColors: props.textColors || DEFAULT_TEXT_COLORS
  }), [props]);

  return (
    <SmoothChessboard 
      {...memoizedProps} 
      ref={ref}
    />
  );
}));

SmoothChessboardWrapper.displayName = 'Chessboard';

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
    aspectRatio: 1,
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