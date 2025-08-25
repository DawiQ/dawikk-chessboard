// enhanced/common/dawikk-chessboard-fresh/Square.js - PURE FLEX LAYOUT VERSION

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBoardTheme } from '../themeContext';

// *** PIECE IMAGES - Requires assets folder ***
const PIECES = {
  br: require('../assets/br.png'),
  bp: require('../assets/bp.png'),
  bn: require('../assets/bn.png'),
  bb: require('../assets/bb.png'),
  bq: require('../assets/bq.png'),
  bk: require('../assets/bk.png'),
  wr: require('../assets/wr.png'),
  wp: require('../assets/wp.png'),
  wn: require('../assets/wn.png'),
  wb: require('../assets/wb.png'),
  wq: require('../assets/wq.png'),
  wk: require('../assets/wk.png'),
};

// *** ANIMATED HINT COMPONENT - Flex Version ***
const AnimatedHint = memo(({ boardTheme, isBlack }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();
    scaleAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      boardTheme?.hintBorder || '#FF6B35',
      '#FFFFFF'
    ],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  const borderWidth = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 4],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: boardTheme?.hintGlow || 'rgba(255, 107, 53, 0.4)',
            opacity: glowOpacity,
            borderRadius: 8,
            zIndex: 8,
          }
        ]}
      />
      
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: boardTheme?.hintGlow || 'rgba(255, 107, 53, 0.3)',
            opacity: glowOpacity,
            borderRadius: 6,
            zIndex: 9,
          }
        ]}
      />
      
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ scale: scaleAnim }],
            zIndex: 10,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              borderColor: borderColor,
              borderWidth: borderWidth,
              borderRadius: 4,
              backgroundColor: 'transparent',
            }
          ]}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.hintIndicator,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <MaterialCommunityIcons 
          name="lightbulb" 
          size={16} 
          color={boardTheme?.hintBorder || '#FF6B35'}
        />
      </Animated.View>
    </>
  );
});

AnimatedHint.displayName = 'AnimatedHint';

// *** READONLY PIECE COMPONENT - Optimized for performance ***
const ReadonlyPieceComponent = memo(({ piece }) => {
  const pieceType = `${piece.color}${piece.type.toLowerCase()}`;
  const pieceSource = PIECES[pieceType];

  if (!pieceSource) return null;

  return (
    <View style={styles.pieceContainer}>
      <Image
        style={styles.pieceImage}
        source={pieceSource}
        resizeMode="contain"
      />
    </View>
  );
});

ReadonlyPieceComponent.displayName = 'ReadonlyPieceComponent';

// *** PIECE COMPONENT WITH IMAGES - Flex Version ***
const PieceComponent = memo(({ piece, onGestureEvent, onHandlerStateChange, onPress }) => {
  const pieceType = `${piece.color}${piece.type.toLowerCase()}`;
  const pieceSource = PIECES[pieceType];

  if (!pieceSource) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      onActivated={onPress}
    >
      <View style={styles.pieceContainer}>
        <Image
          style={styles.pieceImage}
          source={pieceSource}
          resizeMode="contain"
        />
      </View>
    </PanGestureHandler>
  );
});

PieceComponent.displayName = 'PieceComponent';

// *** MAIN SQUARE COMPONENT - Pure Flex Version ***
const Square = memo(({ 
  piece, 
  row, 
  col, 
  square, 
  isHighlighted, 
  isMovePossible, 
  onSquarePress, 
  onGestureEvent, 
  onHandlerStateChange,
  isLastMoveFrom, 
  isLastMoveTo,
  isHintSquare = false,
  currentSquareSize, // Used only for gesture calculations, not for styling
  readonly = false  // New prop for readonly mode
}) => {
  const { boardTheme } = useBoardTheme();

  const backgroundColor = useMemo(() => {
    if (!boardTheme) return '#f0d9b5';
    
    const isBlack = (row + col) % 2 !== 0;
    const normalColor = isBlack ? boardTheme.dark : boardTheme.light;
    
    if (isHintSquare) {
      if (boardTheme.hintLightBg && boardTheme.hintDarkBg) {
        return isBlack ? boardTheme.hintDarkBg : boardTheme.hintLightBg;
      }
      return isBlack ? '#FF8C69' : '#FFEFD5';
    }
    
    return normalColor;
  }, [row, col, boardTheme, isHintSquare]);

  const overlayStyles = useMemo(() => {
    // Skip complex calculations in readonly mode if not needed
    if (readonly && !isLastMoveFrom && !isLastMoveTo && !isHintSquare) {
      return { highlight: null, lastMoveFrom: null, lastMoveTo: null, dot: null };
    }

    const styles = {
      highlight: null,
      lastMoveFrom: null,
      lastMoveTo: null,
      dot: null,
    };

    if (!boardTheme) {
      if (isHighlighted && !readonly) {
        styles.highlight = {
          backgroundColor: 'rgba(255, 255, 0, 0.6)',
        };
      }
      if (isLastMoveFrom) {
        styles.lastMoveFrom = {
          backgroundColor: 'rgba(255, 255, 0, 0.7)',
          opacity: 0.7,
        };
      }
      if (isLastMoveTo) {
        styles.lastMoveTo = {
          backgroundColor: 'rgba(255, 255, 0, 0.4)',
          opacity: 0.4,
        };
      }
      if (isMovePossible && !readonly) {
        styles.dot = {
          width: '30%',
          height: '30%',
          borderRadius: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        };
      }
    } else {
      if (isHighlighted && !readonly) {
        styles.highlight = {
          backgroundColor: boardTheme.highlighted,
        };
      }
      if (isLastMoveFrom) {
        styles.lastMoveFrom = {
          backgroundColor: boardTheme.moveFrom,
          opacity: 0.7,
        };
      }
      if (isLastMoveTo) {
        styles.lastMoveTo = {
          backgroundColor: boardTheme.moveTo,
          opacity: 0.4,
        };
      }
      if (isMovePossible && !readonly) {
        styles.dot = {
          width: '30%',
          height: '30%',
          borderRadius: 100,
          backgroundColor: boardTheme.dot || 'rgba(0, 0, 0, 0.5)',
        };
      }
    }

    return styles;
  }, [boardTheme, isHighlighted, isLastMoveFrom, isLastMoveTo, isMovePossible, readonly]);

  const handlePress = useCallback(() => {
    if (!readonly) {
      onSquarePress(square);
    }
  }, [onSquarePress, square, readonly]);

  const renderPiece = useCallback(() => {
    if (!piece) return null;
    
    // Use simpler component in readonly mode
    if (readonly) {
      return <ReadonlyPieceComponent piece={piece} />;
    }
    
    return (
      <PieceComponent
        piece={piece}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        onPress={handlePress}
      />
    );
  }, [piece, onGestureEvent, onHandlerStateChange, handlePress, readonly]);

  const isBlack = (row + col) % 2 !== 0;

  // In readonly mode, use View instead of Pressable for better performance
  const SquareWrapper = readonly ? View : Pressable;
  const wrapperProps = readonly ? {} : { onPress: handlePress };

  return (
    <SquareWrapper 
      {...wrapperProps}
      style={[
        styles.square,
        { backgroundColor }
      ]}
    >
      {overlayStyles.lastMoveFrom && (
        <View style={[styles.overlay, overlayStyles.lastMoveFrom]} />
      )}
      {overlayStyles.lastMoveTo && (
        <View style={[styles.overlay, overlayStyles.lastMoveTo]} />
      )}
      {overlayStyles.highlight && (
        <View style={[styles.overlay, overlayStyles.highlight]} />
      )}
      
      {renderPiece()}
      
      {isHintSquare && (
        <AnimatedHint 
          boardTheme={boardTheme} 
          isBlack={isBlack}
        />
      )}
      
      {overlayStyles.dot && (
        <View style={styles.dotContainer}>
          <View style={overlayStyles.dot} />
        </View>
      )}
    </SquareWrapper>
  );
}, (prevProps, nextProps) => {
  const essentialProps = [
    'isHighlighted', 'isMovePossible', 'isLastMoveFrom', 'isLastMoveTo',
    'isHintSquare', 'row', 'col', 'currentSquareSize', 'readonly'
  ];

  for (const prop of essentialProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  if (prevProps.piece !== nextProps.piece) {
    if (!prevProps.piece && !nextProps.piece) {
      return true;
    }
    if (!prevProps.piece || !nextProps.piece) {
      return false;
    }
    if (prevProps.piece.type !== nextProps.piece.type || 
        prevProps.piece.color !== nextProps.piece.color) {
      return false;
    }
  }

  if (prevProps.square !== nextProps.square) {
    return false;
  }

  return true;
});

Square.displayName = 'Square';

// *** PURE FLEX STYLES ***
const styles = StyleSheet.create({
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pieceContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pieceImage: {
    width: '85%',
    height: '85%',
  },
  dotContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  hintIndicator: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    zIndex: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 100,
    width: '25%',
    aspectRatio: 1,
    maxWidth: 24,
    maxHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
});

export default Square;