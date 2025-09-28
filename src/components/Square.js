import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// *** PIECE IMAGES - Cache references ***
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

// *** DEFAULT BOARD THEME ***
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

// *** CACHED STYLES FOR COMMON PATTERNS ***
const cachedOverlayStyles = new Map();

const getCachedOverlayStyle = (key, style) => {
  if (!cachedOverlayStyles.has(key)) {
    cachedOverlayStyles.set(key, style);
  }
  return cachedOverlayStyles.get(key);
};

// *** TOKEN COMPONENT FOR BLINDFOLD MODE ***
const TokenComponent = memo(() => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
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
        styles.tokenContainer,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <View style={styles.tokenOuter}>
        <View style={styles.tokenInner}>
          <MaterialCommunityIcons 
            name="help" 
            size={20} 
            color="#666666" 
          />
        </View>
      </View>
    </Animated.View>
  );
});

TokenComponent.displayName = 'TokenComponent';

// *** OPTIMIZED ANIMATED HINT - Reduced re-renders ***
const AnimatedHint = memo(({ boardTheme, isBlack }) => {
  const animRefs = useRef({
    pulse: new Animated.Value(0),
    glow: new Animated.Value(0),
    scale: new Animated.Value(1)
  }).current;

  useEffect(() => {
    // Create all animations once
    const animations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(animRefs.pulse, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.glow, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(animRefs.glow, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.scale, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []); // Empty deps - animations never change

  // Memoize interpolations
  const { borderColor, glowOpacity, borderWidth } = useMemo(() => ({
    borderColor: animRefs.pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [
        boardTheme?.hintBorder || DEFAULT_BOARD_THEME.hintBorder,
        '#FFFFFF'
      ],
    }),
    glowOpacity: animRefs.glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.8],
    }),
    borderWidth: animRefs.pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 4],
    })
  }), [boardTheme]);

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
            transform: [{ scale: animRefs.scale }],
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
            transform: [{ scale: animRefs.scale }],
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

// *** OPTIMIZED CIRCLE INDICATOR ***
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

// *** STATIC PIECE IMAGE COMPONENT ***
const PieceImage = memo(({ pieceType }) => {
  const pieceSource = PIECES[pieceType];
  if (!pieceSource) return null;

  return (
    <Image
      style={styles.pieceImage}
      source={pieceSource}
      resizeMode="contain"
    />
  );
});

PieceImage.displayName = 'PieceImage';

// *** PIECE COMPONENT - Optimized ***
const PieceComponent = memo(({ piece, onGestureEvent, onHandlerStateChange, onPress, readonly }) => {
  const pieceType = `${piece.color}${piece.type.toLowerCase()}`;

  if (readonly) {
    return (
      <View style={styles.pieceContainer}>
        <PieceImage pieceType={pieceType} />
      </View>
    );
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      onActivated={onPress}
    >
      <View style={styles.pieceContainer}>
        <PieceImage pieceType={pieceType} />
      </View>
    </PanGestureHandler>
  );
});

PieceComponent.displayName = 'PieceComponent';

// *** MAIN SQUARE COMPONENT - HEAVILY OPTIMIZED ***
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
  isCircled = false,
  currentSquareSize,
  readonly = false,
  boardTheme = null,
  
  // *** NEW PROPS ***
  customHighlightColor = null, // Custom highlight color for this square
  showToken = false, // Show token instead of piece (blindfold mode)
  onBlindSelect = null, // Callback for blind square selection
}) => {
  
  const activeTheme = boardTheme || DEFAULT_BOARD_THEME;
  const isBlack = (row + col) % 2 !== 0;

  // *** OPTIMIZED BACKGROUND COLOR ***
  const backgroundColor = useMemo(() => {
    // NEW: Check for custom highlight first
    if (customHighlightColor) {
      return customHighlightColor;
    }
    
    const normalColor = isBlack ? activeTheme.dark : activeTheme.light;
    
    if (isHintSquare && activeTheme.hintLightBg && activeTheme.hintDarkBg) {
      return isBlack ? activeTheme.hintDarkBg : activeTheme.hintLightBg;
    }
    
    return normalColor;
  }, [isBlack, activeTheme, isHintSquare, customHighlightColor]);

  // *** OPTIMIZED OVERLAY STYLES WITH CACHING ***
  const overlayStyles = useMemo(() => {
    // Create a cache key from state
    const cacheKey = `${isHighlighted}-${isLastMoveFrom}-${isLastMoveTo}-${isMovePossible}-${readonly}`;
    
    if (cachedOverlayStyles.has(cacheKey)) {
      return cachedOverlayStyles.get(cacheKey);
    }

    const styles = {
      highlight: null,
      lastMoveFrom: null,
      lastMoveTo: null,
      dot: null,
    };

    if (isHighlighted && !readonly) {
      styles.highlight = getCachedOverlayStyle('highlight', {
        backgroundColor: activeTheme.highlighted,
      });
    }
    if (isLastMoveFrom) {
      styles.lastMoveFrom = getCachedOverlayStyle('lastMoveFrom', {
        backgroundColor: activeTheme.moveFrom,
        opacity: 0.7,
      });
    }
    if (isLastMoveTo) {
      styles.lastMoveTo = getCachedOverlayStyle('lastMoveTo', {
        backgroundColor: activeTheme.moveTo,
        opacity: 0.4,
      });
    }
    if (isMovePossible && !readonly) {
      styles.dot = getCachedOverlayStyle('dot', {
        width: '30%',
        height: '30%',
        borderRadius: 100,
        backgroundColor: activeTheme.dot || 'rgba(0, 0, 0, 0.5)',
      });
    }

    cachedOverlayStyles.set(cacheKey, styles);
    return styles;
  }, [activeTheme, isHighlighted, isLastMoveFrom, isLastMoveTo, isMovePossible, readonly]);

  // *** STABLE CALLBACKS ***
  const handlePress = useCallback(() => {
    // NEW: If in blind mode with callback, use that
    if (showToken && onBlindSelect) {
      onBlindSelect(square);
      return;
    }
    
    if (!readonly) {
      onSquarePress(square);
    }
  }, [onSquarePress, square, readonly, showToken, onBlindSelect]);

  const handleGestureEvent = useMemo(() => 
    onGestureEvent(square), 
    [onGestureEvent, square]
  );

  const handleHandlerStateChange = useMemo(() => 
    onHandlerStateChange(square), 
    [onHandlerStateChange, square]
  );

  // *** OPTIMIZED RENDER ***
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
      {/* Only render overlays if they exist */}
      {overlayStyles.lastMoveFrom && (
        <View style={[styles.overlay, overlayStyles.lastMoveFrom]} />
      )}
      {overlayStyles.lastMoveTo && (
        <View style={[styles.overlay, overlayStyles.lastMoveTo]} />
      )}
      {overlayStyles.highlight && (
        <View style={[styles.overlay, overlayStyles.highlight]} />
      )}
      
      {/* NEW: Render token or piece based on showToken */}
      {showToken ? (
        <TokenComponent />
      ) : (
        piece && (
          <PieceComponent
            piece={piece}
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleHandlerStateChange}
            onPress={handlePress}
            readonly={readonly}
          />
        )
      )}
      
      {/* Circle indicator */}
      {isCircled && piece && <CircleIndicator />}
      
      {/* Hint indicator */}
      {isHintSquare && (
        <AnimatedHint 
          boardTheme={activeTheme} 
          isBlack={isBlack}
        />
      )}
      
      {/* Move dot */}
      {overlayStyles.dot && (
        <View style={styles.dotContainer}>
          <View style={overlayStyles.dot} />
        </View>
      )}
    </SquareWrapper>
  );
}, (prevProps, nextProps) => {
  // Optimized comparison - check only what really matters
  
  // Quick check for piece changes
  if (prevProps.piece !== nextProps.piece) {
    if (!prevProps.piece && !nextProps.piece) return true;
    if (!prevProps.piece || !nextProps.piece) return false;
    if (prevProps.piece.type !== nextProps.piece.type || 
        prevProps.piece.color !== nextProps.piece.color) return false;
  }

  // Check visual state changes
  if (
    prevProps.isHighlighted !== nextProps.isHighlighted ||
    prevProps.isMovePossible !== nextProps.isMovePossible ||
    prevProps.isLastMoveFrom !== nextProps.isLastMoveFrom ||
    prevProps.isLastMoveTo !== nextProps.isLastMoveTo ||
    prevProps.isHintSquare !== nextProps.isHintSquare ||
    prevProps.isCircled !== nextProps.isCircled ||
    prevProps.customHighlightColor !== nextProps.customHighlightColor || // NEW
    prevProps.showToken !== nextProps.showToken // NEW
  ) {
    return false;
  }

  // Check structural changes
  if (
    prevProps.row !== nextProps.row ||
    prevProps.col !== nextProps.col ||
    prevProps.square !== nextProps.square ||
    prevProps.readonly !== nextProps.readonly ||
    prevProps.boardTheme !== nextProps.boardTheme
  ) {
    return false;
  }

  // Check callback changes (these should be stable but check anyway)
  if (
    prevProps.onSquarePress !== nextProps.onSquarePress ||
    prevProps.onGestureEvent !== nextProps.onGestureEvent ||
    prevProps.onHandlerStateChange !== nextProps.onHandlerStateChange ||
    prevProps.onBlindSelect !== nextProps.onBlindSelect // NEW
  ) {
    return false;
  }

  return true;
});

Square.displayName = 'Square';

// *** STYLES ***
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
  
  // *** NEW STYLES FOR TOKEN ***
  tokenContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  tokenOuter: {
    width: '70%',
    height: '70%',
    borderRadius: 200,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tokenInner: {
    width: '80%',
    height: '80%',
    borderRadius: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

// Clear cache periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (cachedOverlayStyles.size > 100) {
      cachedOverlayStyles.clear();
    }
  }, 60000); // Clear every minute if cache grows too large
}

export default Square;