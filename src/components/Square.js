import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// *** PIECE IMAGES - Requires assets folder ***
const PIECES = {
  br: require('../../assets/br.png'),
  bp: require('../../assets/bp.png'),
  bn: require('../../assets/bn.png'),
  bb: require('../../assets/bb.png'),
  bq: require('../../assets/bq.png'),
  bk: require('../../assets/bk.png'),
  wr: require('../../assets/wr.png'),
  wp: require('../../assets/wp.png'),
  wn: require('../../assets/wn.png'),
  wb: require('../../assets/wb.png'),
  wq: require('../../assets/wq.png'),
  wk: require('../../assets/wk.png'),
};

// *** DEFAULT BOARD THEME - fallback when no theme provided ***
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

// *** ANIMATED HINT COMPONENT - Accept boardTheme as prop ***
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
      boardTheme?.hintBorder || DEFAULT_BOARD_THEME.hintBorder,
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
            backgroundColor: boardTheme?.hintGlow || DEFAULT_BOARD_THEME.hintGlow,
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
            backgroundColor: boardTheme?.hintGlow || DEFAULT_BOARD_THEME.hintGlow,
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
          color={boardTheme?.hintBorder || DEFAULT_BOARD_THEME.hintBorder}
        />
      </Animated.View>
    </>
  );
});

AnimatedHint.displayName = 'AnimatedHint';

// *** 🎯 NEW: CIRCLE INDICATOR FOR HAND & BRAIN MODE ***
const CircleIndicator = memo(() => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.circleIndicator,
        { transform: [{ scale: scaleAnim }] }
      ]}
      pointerEvents="none"
    >
      <View style={styles.circleOuter}>
        <View style={styles.circleInner} />
      </View>
    </Animated.View>
  );
});

CircleIndicator.displayName = 'CircleIndicator';

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

// *** PIECE COMPONENT WITH IMAGES ***
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

// *** MAIN SQUARE COMPONENT - STANDALONE VERSION ***
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
  isCircled = false, // 🎯 NEW PROP
  currentSquareSize,
  readonly = false,
  // 🎯 NEW PROPS - Accept theme directly
  boardTheme = null // Accept boardTheme as prop instead of using context
}) => {
  
  // 🎯 USE PROP OR DEFAULT THEME
  const activeTheme = boardTheme || DEFAULT_BOARD_THEME;

  const backgroundColor = useMemo(() => {
    const isBlack = (row + col) % 2 !== 0;
    const normalColor = isBlack ? activeTheme.dark : activeTheme.light;
    
    if (isHintSquare) {
      if (activeTheme.hintLightBg && activeTheme.hintDarkBg) {
        return isBlack ? activeTheme.hintDarkBg : activeTheme.hintLightBg;
      }
      return isBlack ? '#FF8C69' : '#FFEFD5';
    }
    
    return normalColor;
  }, [row, col, activeTheme, isHintSquare]);

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

    if (isHighlighted && !readonly) {
      styles.highlight = {
        backgroundColor: activeTheme.highlighted,
      };
    }
    if (isLastMoveFrom) {
      styles.lastMoveFrom = {
        backgroundColor: activeTheme.moveFrom,
        opacity: 0.7,
      };
    }
    if (isLastMoveTo) {
      styles.lastMoveTo = {
        backgroundColor: activeTheme.moveTo,
        opacity: 0.4,
      };
    }
    if (isMovePossible && !readonly) {
      styles.dot = {
        width: '30%',
        height: '30%',
        borderRadius: 100,
        backgroundColor: activeTheme.dot || 'rgba(0, 0, 0, 0.5)',
      };
    }

    return styles;
  }, [activeTheme, isHighlighted, isLastMoveFrom, isLastMoveTo, isMovePossible, readonly]);

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
      
      {/* 🎯 NEW: Circle indicator for Hand & Brain mode */}
      {isCircled && piece && (
        <CircleIndicator />
      )}
      
      {isHintSquare && (
        <AnimatedHint 
          boardTheme={activeTheme} 
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
    'isHintSquare', 'isCircled', 'row', 'col', 'currentSquareSize', 'readonly', 'boardTheme'
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

// *** STYLES REMAIN THE SAME ***
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
  // 🎯 NEW STYLES: Circle indicator for Hand & Brain mode
  circleIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  circleOuter: {
    width: '90%',
    height: '90%',
    borderRadius: 200,
    borderWidth: 3,
    borderColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  circleInner: {
    width: '85%',
    height: '85%',
    borderRadius: 200,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.5)',
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
  },
});

export default Square;