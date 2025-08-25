import React, { memo, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// *** DEFAULT COLORS - for standalone usage ***
const DEFAULT_COLORS = {
  borderPrimary: '#E5E7EB',
  cardBackground: '#FFFFFF',
  titleText: '#111827',
  subtitleText: '#6B7280'
};

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

// *** GŁÓWNY KOMPONENT - STANDALONE VERSION ***
const PromotionOverlay = memo(({ 
  onSelect, 
  color,
  // 🎯 NEW PROPS - Accept colors directly
  colors = null,
  textColors = null,
  backgroundColors = null
}) => {
  
  // 🎯 USE PROVIDED COLORS OR DEFAULTS
  const activeColors = colors || DEFAULT_COLORS;
  const activeTextColors = textColors || DEFAULT_COLORS;
  const activeBackgroundColors = backgroundColors || DEFAULT_COLORS;

  // *** MEMOIZED OVERLAY BACKGROUND ***
  const overlayBackground = useMemo(() => 'rgba(0, 0, 0, 0.8)', []);

  // *** MEMOIZED CARD STYLE ***
  const promotionCardStyle = useMemo(() => [
    styles.promotionCard,
    { 
      backgroundColor: activeBackgroundColors.cardBackground,
      borderColor: activeColors.borderPrimary,
      borderWidth: 1,
    }
  ], [activeBackgroundColors.cardBackground, activeColors.borderPrimary]);

  // *** MEMOIZED TEXT STYLES ***
  const titleTextStyle = useMemo(() => [
    styles.titleText, 
    { color: activeTextColors.titleText }
  ], [activeTextColors.titleText]);

  const instructionTextStyle = useMemo(() => [
    styles.instructionText, 
    { color: activeTextColors.subtitleText }
  ], [activeTextColors.subtitleText]);

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
          borderColor={activeColors.borderPrimary}
        />
      );
    });
  }, [color, onSelect, activeColors.borderPrimary]);

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
  return (
    prevProps.color === nextProps.color &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.colors === nextProps.colors &&
    prevProps.textColors === nextProps.textColors &&
    prevProps.backgroundColors === nextProps.backgroundColors
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

export default PromotionOverlay;