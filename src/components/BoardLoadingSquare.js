// enhanced/common/dawikk-chessboard-fresh/BoardLoadingSquare.js - PURE FLEX LAYOUT VERSION

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BoardLoadingSquare = ({ 
  isCenter, 
  baseColor, 
  animationDelay = 0,
  isDarkTheme = false
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCenter) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
            delay: animationDelay,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );

      const colorAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
            delay: animationDelay,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      pulseAnimation.start();
      colorAnimation.start();

      return () => {
        pulseAnimation.stop();
        colorAnimation.stop();
      };
    }
  }, [isCenter, animationDelay]);

  // *** SQUARE STYLE - Pure flex ***
  const squareStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: baseColor,
    justifyContent: 'center',
    alignItems: 'center',
  }), [baseColor]);

  if (!isCenter) {
    return <View style={squareStyle} />;
  }

  // Animation interpolations
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isDarkTheme 
      ? ['#FFFFFF', '#000000']
      : ['#000000', '#FFFFFF'],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={squareStyle}>
      <Animated.View
        style={[
          styles.animatedSquare,
          {
            backgroundColor,
            transform: [{ scale }],
            opacity,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animatedSquare: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
  },
});

export default BoardLoadingSquare;