// enhanced/common/dawikk-chessboard-fresh/Arrow.js - PURE FLEX LAYOUT VERSION

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

// ============================================================================
// COORDINATE CALCULATIONS - Percentage-based for flex layout
// ============================================================================
const getCoordinatesPercentage = (square, perspective) => {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1]);
  const x = perspective === 'white' ? file : 7 - file;
  const y = perspective === 'white' ? rank : 7 - rank;
  
  // Return percentages instead of absolute values
  return {
    x: (x * 12.5 + 6.25) + '%', // 12.5% per square, center at 6.25%
    y: (y * 12.5 + 6.25) + '%'
  };
};

// For calculations that need numeric values
const getCoordinatesNumeric = (square, perspective, boardSize) => {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1]);
  const x = perspective === 'white' ? file : 7 - file;
  const y = perspective === 'white' ? rank : 7 - rank;
  
  const squareSize = boardSize / 8;
  return {
    x: x * squareSize + squareSize / 2,
    y: y * squareSize + squareSize / 2
  };
};

// ============================================================================
// ARROW HEAD COMPONENT
// ============================================================================
const ArrowHead = memo(({ endPoint, angle, boardSize, color }) => {
  const size = Math.max(boardSize / 25, 8);
  const halfSize = size / 1.5;
  const points = `0,-${halfSize} 0,${halfSize} ${size},0`;
  const transform = `translate(${endPoint.x},${endPoint.y}) rotate(${angle})`;

  return (
    <Polygon
      points={points}
      fill={color}
      transform={transform}
    />
  );
});

ArrowHead.displayName = 'ArrowHead';

// ============================================================================
// ARROW LINES COMPONENT
// ============================================================================
const ArrowLines = memo(({ fromCoord, toCoord, endPoint, isKnightMove, color, boardSize }) => {
  const strokeWidth = Math.max(boardSize / 50, 3);
  
  if (isKnightMove) {
    const dx = toCoord.x - fromCoord.x;
    const dy = toCoord.y - fromCoord.y;
    const isHorizontalFirst = Math.abs(dx) > Math.abs(dy);
    
    const middleX = isHorizontalFirst ? fromCoord.x + dx : fromCoord.x;
    const middleY = isHorizontalFirst ? fromCoord.y : fromCoord.y + dy;

    return (
      <>
        <Line
          x1={fromCoord.x}
          y1={fromCoord.y}
          x2={middleX}
          y2={middleY}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1={middleX}
          y1={middleY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </>
    );
  }

  // Straight arrow
  const angle = Math.atan2(toCoord.y - fromCoord.y, toCoord.x - fromCoord.x);
  const squareSize = boardSize / 8;
  const startOffsetRatio = 0.25;
  
  const startX = fromCoord.x + Math.cos(angle) * (squareSize * startOffsetRatio);
  const startY = fromCoord.y + Math.sin(angle) * (squareSize * startOffsetRatio);

  return (
    <Line
      x1={startX}
      y1={startY}
      x2={endPoint.x}
      y2={endPoint.y}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
});

ArrowLines.displayName = 'ArrowLines';

// ============================================================================
// MAIN ARROW COMPONENT - Flex Layout Version
// ============================================================================
const Arrow = memo(({ 
  from, 
  to, 
  squareSize, // Still passed but only used for calculations
  boardSize, 
  perspective = 'white', 
  piece = null,
  opacity = 0.8,
  color = null
}) => {
  // *** VALIDATE PROPS ***
  if (!from || !to || !boardSize || boardSize < 80) {
    if (__DEV__) {
      console.warn('Arrow: Missing or invalid props', { from, to, boardSize });
    }
    return null;
  }

  // *** CALCULATE COORDINATES ***
  const coordinates = useMemo(() => {
    try {
      const fromCoord = getCoordinatesNumeric(from, perspective, boardSize);
      const toCoord = getCoordinatesNumeric(to, perspective, boardSize);
      return { fromCoord, toCoord };
    } catch (error) {
      if (__DEV__) {
        console.error('Error calculating coordinates:', error);
      }
      return null;
    }
  }, [from, to, perspective, boardSize]);

  if (!coordinates) return null;

  const { fromCoord, toCoord } = coordinates;

  // *** KNIGHT MOVE DETECTION ***
  const isKnightMove = useMemo(() => {
    return piece?.toLowerCase() === 'n';
  }, [piece]);

  // *** CALCULATE END POINT ***
  const endPoint = useMemo(() => {
    const dx = toCoord.x - fromCoord.x;
    const dy = toCoord.y - fromCoord.y;
    const squareSize = boardSize / 8;
    const insetDistance = squareSize * 0.2;
    
    if (isKnightMove) {
      const isHorizontalFirst = Math.abs(dx) > Math.abs(dy);
      const middleX = isHorizontalFirst ? fromCoord.x + dx : fromCoord.x;
      const middleY = isHorizontalFirst ? fromCoord.y : fromCoord.y + dy;
      
      const lastDx = toCoord.x - middleX;
      const lastDy = toCoord.y - middleY;
      const lastDistance = Math.sqrt(lastDx * lastDx + lastDy * lastDy);
      const ratio = Math.max(0, (lastDistance - insetDistance) / lastDistance);
      
      return {
        x: middleX + lastDx * ratio,
        y: middleY + lastDy * ratio
      };
    } else {
      const totalDistance = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.max(0, (totalDistance - insetDistance) / totalDistance);
      
      return {
        x: fromCoord.x + dx * ratio,
        y: fromCoord.y + dy * ratio
      };
    }
  }, [fromCoord, toCoord, boardSize, isKnightMove]);

  // *** CALCULATE ANGLE ***
  const angle = useMemo(() => {
    if (isKnightMove) {
      const dx = toCoord.x - fromCoord.x;
      const dy = toCoord.y - fromCoord.y;
      const isHorizontalFirst = Math.abs(dx) > Math.abs(dy);
      const middleX = isHorizontalFirst ? fromCoord.x + dx : fromCoord.x;
      const middleY = isHorizontalFirst ? fromCoord.y : fromCoord.y + dy;
      return Math.atan2(endPoint.y - middleY, endPoint.x - middleX) * 180 / Math.PI;
    } else {
      return Math.atan2(toCoord.y - fromCoord.y, toCoord.x - fromCoord.x) * 180 / Math.PI;
    }
  }, [fromCoord, toCoord, endPoint, isKnightMove]);

  // *** ARROW COLOR ***
  const arrowColor = color || "rgba(131, 169, 120, 0.8)";

  return (
    <View style={[styles.arrowContainer, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${boardSize} ${boardSize}`}>
        <ArrowLines 
          fromCoord={fromCoord}
          toCoord={toCoord}
          endPoint={endPoint}
          isKnightMove={isKnightMove}
          color={arrowColor}
          boardSize={boardSize}
        />
        <ArrowHead
          endPoint={endPoint}
          angle={angle}
          boardSize={boardSize}
          color={arrowColor}
        />
      </Svg>
    </View>
  );
}, (prevProps, nextProps) => {
  const keys = ['from', 'to', 'squareSize', 'boardSize', 'perspective', 'piece', 'opacity', 'color'];
  
  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  arrowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});

Arrow.displayName = 'Arrow';

export default Arrow;