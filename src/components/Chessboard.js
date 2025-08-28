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

// *** DEFAULT THEMES - for standalone usage ***
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

// *** LOADING BOARD ROW COMPONENT ***
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

// *** READONLY BOARD ROW COMPONENT ***
const ReadonlyBoardRow = React.memo(({ 
  row, 
  rowIndex, 
  lastMoveFrom, 
  lastMoveTo, 
  perspective, 
  hintSquare,
  circledSquares,
  currentSquareSize,
  boardTheme
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
            onSquarePress={() => {}}
            isLastMoveFrom={squareNotation === lastMoveFrom}
            isLastMoveTo={squareNotation === lastMoveTo}
            isHintSquare={squareNotation === hintSquare}
            isCircled={circledSquares?.includes(squareNotation)}
            onGestureEvent={() => {}}
            onHandlerStateChange={() => {}}
            perspective={perspective}
            currentSquareSize={currentSquareSize}
            readonly={true}
            boardTheme={boardTheme}
          />
        );
      })}
    </View>
  );
});

ReadonlyBoardRow.displayName = 'ReadonlyBoardRow';

// *** NORMAL BOARD ROW COMPONENT ***
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
  circledSquares,
  currentSquareSize,
  boardTheme,
  readonly
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
            isCircled={circledSquares?.includes(squareNotation)}
            onGestureEvent={onGestureEvent(squareNotation)}
            onHandlerStateChange={onHandlerStateChange(squareNotation)}
            perspective={perspective}
            currentSquareSize={currentSquareSize}
            boardTheme={boardTheme}
            readonly={readonly}
          />
        );
      })}
    </View>
  );
});

BoardRow.displayName = 'BoardRow';

// *** MAIN CHESSBOARD COMPONENT - ENHANCED WITH HAND & BRAIN CONTROL ***
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
    restrictToCircled = false, // 🎯 NEW PROP: Control if only circled pieces can move
    onRestrictedMoveAttempt, // 🎯 NEW PROP: Callback when trying to move non-circled piece
    boardTheme = null,
    textColors = null,
    colors = null,
    isDarkTheme = false,
    showArrows = true,
    showCoordinates = true,
    readonly = false
  } = props;

  // 🎯 USE PROVIDED THEME OR DEFAULTS
  const activeBoardTheme = boardTheme || DEFAULT_BOARD_THEME;
  const activeTextColors = textColors || DEFAULT_TEXT_COLORS;

  // *** STATE ***
  const [chess, setChess] = useState(() => {
    const initialChess = new Chess(initialFen);
    console.log('🎲 [Chessboard] Initial chess created:', {
      fen: initialChess.fen().split(' ')[0],
      turn: initialChess.turn()
    });
    return initialChess;
  });
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
  const chessRef = useRef();
  
  if (!chessRef.current) {
    chessRef.current = chess;
  }

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
    console.log('🔍 [Chessboard] useEffect FEN check:', {
      initialFen: initialFen,
      prevFen: prevFenRef.current,
      changed: initialFen !== prevFenRef.current
    });
    
    if (initialFen && initialFen !== prevFenRef.current) {
      console.log('🔄 [Chessboard] Updating chess position:', {
        from: prevFenRef.current?.split(' ')[0],
        to: initialFen.split(' ')[0],
        turn: initialFen.split(' ')[1]
      });
      
      const newChess = new Chess(initialFen);
      setChess(newChess);
      chessRef.current = newChess;
      setSelectedSquare(null);
      setValidMoves([]);
      setHintSquare(null);
      prevFenRef.current = initialFen;
      
      console.log('✅ [Chessboard] Chess position updated, new turn:', newChess.turn());
    }
  }, [initialFen]);

  useEffect(() => {
    chessRef.current = chess;
  }, [chess]);

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
      chessRef.current = newChess;
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

    const currentChess = chessRef.current;
    console.log('🎯 [Chessboard] handleMove called:', {
      from, to, promotion,
      currentTurn: currentChess.turn(),
      fen: currentChess.fen().split(' ')[0]
    });

    try {
      const testChess = new Chess(currentChess.fen());
      const move = testChess.move({ from, to, promotion });
      
      if (move) {
        const newChess = new Chess(currentChess.fen());
        const actualMove = newChess.move({ from, to, promotion });
        
        if (actualMove) {
          console.log('✅ [Chessboard] Move executed successfully:', {
            move: actualMove.san,
            newTurn: newChess.turn(),
            newFen: newChess.fen().split(' ')[0]
          });
          
          setChess(newChess);
          chessRef.current = newChess;
          onMove?.(from, to, promotion);
          
          setLastMoveFrom(from);
          setLastMoveTo(to);
          
          setSelectedSquare(null);
          setValidMoves([]);
          setHintSquare(null);
        }
      } else {
        console.warn('❌ [Chessboard] Invalid move attempted:', { from, to, promotion });
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } catch (e) {
      console.warn('❌ [Chessboard] Move error:', e);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, []);

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

  // *** 🎯 CHECK IF PIECE CAN BE SELECTED (Hand & Brain mode) ***
  const canSelectPiece = useCallback((square) => {
    // If restrictToCircled is true and we have circled squares
    if (restrictToCircled && circledSquares && circledSquares.length > 0) {
      return circledSquares.includes(square);
    }
    // If not restricted or no circles, allow all
    return true;
  }, [restrictToCircled, circledSquares]);

  // *** SQUARE PRESS HANDLER - ENHANCED WITH RESTRICTION CHECK ***
  const onSquarePress = useCallback((square) => {
    if (isLoading || readonly) return;

    const currentChess = chessRef.current;
    const currentTurn = currentChess.turn();
    const clickedPiece = currentChess.get(square);
    const selectedPiece = selectedSquare ? currentChess.get(selectedSquare) : null;

    console.log('👆 [Chessboard] Square pressed:', {
      square,
      currentTurn,
      clickedPiece: clickedPiece ? `${clickedPiece.color}${clickedPiece.type}` : 'empty',
      selectedSquare,
      canSelect: canSelectPiece(square),
      restrictToCircled,
      isCircled: circledSquares?.includes(square),
      fen: currentChess.fen().split(' ')[0]
    });

    // CASE 1: Clicking the same piece - toggle selection
    if (selectedSquare === square) {
      console.log('🔄 [Chessboard] Toggle selection - deselecting');
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // CASE 2: We have a selected piece
    if (selectedSquare && selectedPiece) {
      // Check if clicking on another of our pieces (switching selection)
      if (clickedPiece && clickedPiece.color === currentTurn) {
        // 🎯 CHECK RESTRICTION for the new piece
        if (!canSelectPiece(square)) {
          console.log('🚫 [Chessboard] Cannot select non-circled piece:', square);
          if (onRestrictedMoveAttempt) {
            onRestrictedMoveAttempt(square, 'select');
          }
          // Optionally vibrate to indicate restriction
          Vibration.vibrate(100);
          return;
        }
        
        console.log('🔄 [Chessboard] Switching to different piece:', square);
        const moves = currentChess.moves({ square, verbose: true }).map(move => move.to);
        setValidMoves(moves);
        setSelectedSquare(square);
        return;
      }
      
      // Check if it's a pawn promotion
      if (selectedPiece.type === 'p' && 
         ((selectedPiece.color === 'b' && selectedSquare[1] === '2' && square[1] === '1') || 
          (selectedPiece.color === 'w' && selectedSquare[1] === '7' && square[1] === '8'))) {
        console.log('👑 [Chessboard] Pawn promotion detected');
        handlePawnPromotion(selectedSquare, square);
        return;
      }
      
      // Attempt to move to target square
      console.log('🎯 [Chessboard] Attempting move from', selectedSquare, 'to', square);
      handleMove(selectedSquare, square);
      return;
    }

    // CASE 3: First piece selection
    if (clickedPiece && clickedPiece.color === currentTurn) {
      // 🎯 CHECK RESTRICTION for initial selection
      if (!canSelectPiece(square)) {
        console.log('🚫 [Chessboard] Cannot select non-circled piece:', square);
        if (onRestrictedMoveAttempt) {
          onRestrictedMoveAttempt(square, 'select');
        }
        // Vibrate to indicate restriction
        Vibration.vibrate(100);
        return;
      }
      
      console.log('✅ [Chessboard] Selecting piece:', square, `(${clickedPiece.color}${clickedPiece.type})`);
      const moves = currentChess.moves({ square, verbose: true }).map(move => move.to);
      console.log('📋 [Chessboard] Available moves:', moves);
      setValidMoves(moves);
      setSelectedSquare(square);
    } else {
      console.log('❌ [Chessboard] Cannot select:', {
        reason: clickedPiece ? 'wrong color' : 'empty square',
        pieceColor: clickedPiece?.color,
        currentTurn
      });
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [isLoading, readonly, selectedSquare, handlePawnPromotion, handleMove, canSelectPiece, restrictToCircled, circledSquares, onRestrictedMoveAttempt]);

  // *** GESTURE HANDLERS - ENHANCED WITH RESTRICTION CHECK ***
  const onGestureEvent = useCallback((square) => ({ nativeEvent }) => {
    if (isLoading || readonly || !currentSquareSize) return;
    
    // 🎯 CHECK RESTRICTION for drag start
    if (!canSelectPiece(square)) {
      return; // Don't allow dragging non-circled pieces
    }
    
    panValues.current[square] = {
      x: nativeEvent.translationX,
      y: nativeEvent.translationY
    };
  }, [isLoading, readonly, currentSquareSize, canSelectPiece]);

  const onHandlerStateChange = useCallback((square) => ({ nativeEvent }) => {
    if (isLoading || readonly || !currentSquareSize) return;
    
    // 🎯 CHECK RESTRICTION at drag start
    if (nativeEvent.state === State.BEGAN) {
      if (!canSelectPiece(square)) {
        console.log('🚫 [Chessboard] Cannot drag non-circled piece:', square);
        if (onRestrictedMoveAttempt) {
          onRestrictedMoveAttempt(square, 'drag');
        }
        Vibration.vibrate(100);
        return;
      }
    }
    
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
          const currentChess = chessRef.current;
          const piece = currentChess.get(selectedSquare);
          if (piece?.type === 'p' && (toRow === 0 || toRow === 7)) {
            Vibration.vibrate(30);
            handlePawnPromotion(selectedSquare, to);
          } else {
            Vibration.vibrate(50);
            handleMove(selectedSquare, to);
          }
        } else {
          if (validMoves.includes(to)) {
            const currentChess = chessRef.current;
            const piece = currentChess.get(selectedSquare);
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
  }, [isLoading, perspective, currentSquareSize, selectedSquare, validMoves, expectedMove, handleMove, handlePawnPromotion, canSelectPiece, onRestrictedMoveAttempt]);

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
      const currentChess = chessRef.current;
      const piece = currentChess.get(from);
      return piece ? piece.type : null;
    } catch (error) {
      return null;
    }
  }, []);

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

  // *** LOG BOARD RENDER ***
  console.log('🎨 [Chessboard] Rendering with state:', {
    fen: chess.fen().split(' ')[0],
    turn: chess.turn(),
    selectedSquare,
    validMoves: validMoves.length,
    lastMove: `${lastMoveFrom}-${lastMoveTo}`,
    perspective,
    circledSquares: circledSquares?.length || 0,
    restrictToCircled
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.chessboardWrapper}>
        <View style={styles.outerContainer}>
          <View style={styles.boardWithLabels}>
            <View style={styles.boardRowContainer}>
              {/* RANK LABELS */}
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
                          boardTheme={activeBoardTheme}
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
                          circledSquares={circledSquares}
                          perspective={perspective}
                          currentSquareSize={currentSquareSize}
                          boardTheme={activeBoardTheme}
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
                          circledSquares={circledSquares}
                          perspective={perspective}
                          currentSquareSize={currentSquareSize}
                          boardTheme={activeBoardTheme}
                          readonly={readonly}
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
                      <Text style={[styles.coordinateText, { color: activeTextColors.subtitleText }]}>
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
          colors={colors}
          textColors={activeTextColors}
          backgroundColors={{ cardBackground: colors?.cardBackground || '#FFFFFF' }}
        />
      )}
    </GestureHandlerRootView>
  );
});

// *** SIMPLIFIED WRAPPER - No more complex theme context dependency ***
const SmoothChessboardWrapper = React.memo(forwardRef((props, ref) => {
  // If no theme is provided, use default green theme
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