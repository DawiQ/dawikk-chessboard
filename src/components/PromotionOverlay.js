// enhanced/common/dawikk-chessboard/PromotionOverlay.js - Ultra-zoptymalizowana wersja

import React, { memo, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// *** ZOPTYMALIZOWANE IMPORTY THEME ***
import { 
  useThemeColors, 
  useTextColors, 
  useBackgroundColors 
} from '../themeContext';

// *** STAŁE DANE FIGUR (nie zmieniają się nigdy) ***
const PIECE_ICONS = {
  'q': { icon: 'chess-queen', label: 'Hetman' },
  'r': { icon: 'chess-rook', label: 'Wieża' },
  'b': { icon: 'chess-bishop', label: 'Goniec' },
  'n': { icon: 'chess-knight', label: 'Skoczek' }
};

const PIECE_ORDER = ['q', 'r', 'b', 'n']; // Stabilna kolejność

// *** OPTION COMPONENT - Memoized osobno ***
const PromotionOption = memo(({ 
  piece, 
  pieceInfo, 
  color, 
  onSelect, 
  borderColor 
}) => {
  // *** STABLE CALLBACK ***
  const handlePress = useCallback(() => {
    onSelect(piece);
  }, [onSelect, piece]);

  // *** MEMOIZED STYLES ***
  const optionStyle = useMemo(() => [
    styles.option,
    {
      backgroundColor: color === 'w' 
        ? 'rgba(0, 0, 0, 0.2)' 
        : 'rgba(255, 255, 255, 0.2)',
      borderColor: borderColor,
      borderWidth: 1,
    }
  ], [color, borderColor]);

  const iconColor = color === 'w' ? 'white' : 'black';
  const labelColor = color === 'w' ? 'white' : 'black';

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={optionStyle}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons 
        name={pieceInfo.icon} 
        size={40} 
        color={iconColor} 
      />
      <Text style={[styles.optionLabel, { color: labelColor }]}>
        {pieceInfo.label}
      </Text>
    </TouchableOpacity>
  );
});

PromotionOption.displayName = 'PromotionOption';

// *** GŁÓWNY KOMPONENT - Ultra-zoptymalizowany ***
const PromotionOverlay = memo(({ onSelect, color }) => {
  // *** PRECYZYJNE SELEKTORY THEME - tylko potrzebne kolory ***
  const colors = useThemeColors((theme) => ({
    borderPrimary: theme.borderPrimary
  }));
  
  const textColors = useTextColors((theme) => ({
    titleText: theme.titleText,
    subtitleText: theme.subtitleText
  }));
  
  const backgroundColors = useBackgroundColors((theme) => ({
    cardBackground: theme.cardBackground
  }));

  // *** MEMOIZED OVERLAY BACKGROUND ***
  const overlayBackground = useMemo(() => 'rgba(0, 0, 0, 0.8)', []);

  // *** MEMOIZED CARD STYLE ***
  const promotionCardStyle = useMemo(() => [
    styles.promotionCard,
    { 
      backgroundColor: backgroundColors.cardBackground,
      borderColor: colors.borderPrimary,
      borderWidth: 1,
    }
  ], [backgroundColors.cardBackground, colors.borderPrimary]);

  // *** MEMOIZED TEXT STYLES ***
  const titleTextStyle = useMemo(() => [
    styles.titleText, 
    { color: textColors.titleText }
  ], [textColors.titleText]);

  const instructionTextStyle = useMemo(() => [
    styles.instructionText, 
    { color: textColors.subtitleText }
  ], [textColors.subtitleText]);

  // *** RENDER OPTIONS - Memoized ***
  const renderOptions = useMemo(() => {
    return PIECE_ORDER.map(piece => {
      const pieceInfo = PIECE_ICONS[piece];
      
      return (
        <PromotionOption
          key={piece}
          piece={piece}
          pieceInfo={pieceInfo}
          color={color}
          onSelect={onSelect}
          borderColor={colors.borderPrimary}
        />
      );
    });
  }, [color, onSelect, colors.borderPrimary]);

  return (
    <View 
      style={[styles.overlay, { backgroundColor: overlayBackground }]}
    >
      <View style={promotionCardStyle}>
        <Text style={titleTextStyle}>
          Wybierz promocję
        </Text>
        
        <View style={styles.optionsContainer}>
          {renderOptions}
        </View>
        
        <Text style={instructionTextStyle}>
          Wybierz figurę na którą chcesz promować pionka
        </Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // *** CUSTOM EQUALITY FUNCTION ***
  // Ten komponent renderuje się tylko gdy zmieni się color lub onSelect
  return (
    prevProps.color === nextProps.color &&
    prevProps.onSelect === nextProps.onSelect
  );
});

// *** STAŁE STYLE (nie będą się zmieniać) ***
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promotionCard: {
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  optionLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
});

PromotionOverlay.displayName = 'PromotionOverlay';

// *** PERFORMANCE UTILITIES ***
export const PromotionOverlayPure = PromotionOverlay;

// *** HOC WRAPPER z dodatkowymi optymalizacjami ***
const OptimizedPromotionOverlay = memo((props) => {
  // Dodatkowa walidacja - render tylko jeśli props są prawidłowe
  if (!props.onSelect || !props.color) {
    return null;
  }

  // Sprawdź czy color jest prawidłowy
  if (props.color !== 'w' && props.color !== 'b') {
    console.warn('PromotionOverlay: Invalid color prop:', props.color);
    return null;
  }

  return <PromotionOverlay {...props} />;
});

OptimizedPromotionOverlay.displayName = 'OptimizedPromotionOverlay';

// *** DEV ONLY - Performance monitoring ***
if (__DEV__) {
  let promotionRenderCount = 0;
  const originalRender = PromotionOverlay.type?.render || PromotionOverlay.render;
  
  if (originalRender) {
    PromotionOverlay.render = function(...args) {
      promotionRenderCount++;
      console.log(`PromotionOverlay render #${promotionRenderCount}`);
      return originalRender.call(this, ...args);
    };
  }
}

export default OptimizedPromotionOverlay;