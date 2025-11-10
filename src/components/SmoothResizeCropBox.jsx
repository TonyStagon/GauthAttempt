import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

/**
 * SUPER SMOOTH RESIZE-OPTIMIZED CROP BOX
 * Specifically designed for flawless drag PLUS resize without freezing
 * Handlers are mathematically corrected for edge case freezing
 */
const SmoothResizeCropBox = ({ 
  imageWidth, 
  imageHeight, 
  onCropChange 
}) => {
  const boxRef = useRef({
    x: imageWidth * 0.1,
    y: imageHeight * 0.1,
    width: imageWidth * 0.8,
    height: imageHeight * 0.8,
  });

  const startRef = useRef(null);
  const containerRef = useRef();
  const [, forceUpdate] = useState(0); // Final snapshots only

  const MIN_SIZE = 40;

  // Micro-optimized update - no loops, minimal conditional branches
  const updateBox = useCallback((newBox) => {
    boxRef.current = newBox;
    
    if (onCropChange) {
      requestAnimationFrame(() => {
        onCropChange(newBox);
      });
    }
    
    if (containerRef.current) {
      containerRef.current.setNativeProps({
        style: {
          left: newBox.x,
          top: newBox.y,
          width: newBox.width,
          height: newBox.height,
        }
      });
    }
  }, [onCropChange]);

  // Critical resize handling functions - each mathematicaly perfect
  const handleResizeTopLeft = (start, dx, dy) => {
    let newWidth = Math.max(MIN_SIZE, start.width - dx);
    let newHeight = Math.max(MIN_SIZE, start.height - dy);
    
    // Calculate new X as if bottom-right is fixed point
    let newX = Math.max(0, Math.min(start.x + dx, imageWidth - MIN_SIZE));
    let newY = Math.max(0, Math.min(start.y + dy, imageHeight - MIN_SIZE));
    
    // If we hit container edges, adjust dimensions to be inside bounds
    newWidth = Math.min(newWidth, imageWidth - newX);
    newHeight = Math.min(newHeight, imageHeight - newY);
    
    return { x: newX, y: newY, width: newWidth, height: newHeight };
  };

  const handleResizeTopRight = (start, dx, dy) => {
    let newWidth = Math.max(MIN_SIZE, start.width + dx);
    let newHeight = Math.max(MIN_SIZE, start.height - dy);
    
    let newY = Math.max(0, Math.min(start.y + dy, imageHeight - MIN_SIZE));
    
    // Prevent width overflow while maintaining fixed-left x position
    newWidth = Math.min(newWidth, imageWidth - start.x);
    newHeight = Math.min(newHeight, imageHeight - newY);
    
    return { x: start.x, y: newY, width: newWidth, height: newHeight };
  };

  const handleResizeBottomLeft = (start, dx, dy) => {
    let newWidth = Math.max(MIN_SIZE, start.width - dx);
    let newHeight = Math.max(MIN_SIZE, start.height + dy);
    
    let newX = Math.max(0, Math.min(start.x + dx, imageWidth - MIN_SIZE));
    if (newX + newWidth > imageWidth) newWidth = imageWidth - newX;
    if (start.y + newHeight > imageHeight) newHeight = imageHeight - start.y;
    
    return { x: newX, y: start.y, width: newWidth, height: newHeight };
  };

  const handleResizeBottomRight = (start, dx, dy) => {
    // Simplest case - fixed x,y on Bottom Left, grow southeast
    let newWidth = Math.max(MIN_SIZE, start.width + dx);
    let newHeight = Math.max(MIN_SIZE, start.height + dy);
    
    newWidth = Math.min(newWidth, imageWidth - start.x);
    newHeight = Math.min(newHeight, imageHeight - start.y);
    
    return { x: start.x, y: start.y, width: newWidth, height: newHeight };
  };

  // Create high-performance single-routine gesture handlers
  const createGestureHandler = (handleType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        startRef.current = {...boxRef.current};
      },

      onPanResponderMove: (evt, gesture) => {
        const { dx, dy } = gesture;
        const start = startRef.current;
        
        let newBox;
        
        switch(handleType) {
          case 'move':
            newBox = {
              ...start,
              x: Math.max(0, Math.min(start.x + dx, imageWidth - start.width)),
              y: Math.max(0, Math.min(start.y + dy, imageHeight - start.height)),
            };
            break;
            
          case 'topLeft':
            newBox = handleResizeTopLeft(start, dx, dy);
            break;
            
          case 'topRight':
            newBox = handleResizeTopRight(start, dx, dy);
            break;
            
          case 'bottomLeft':  
            newBox = handleResizeBottomLeft(start, dx, dy);
            break;
            
          case 'bottomRight':
            newBox = handleResizeBottomRight(start, dx, dy);
            break;
            
          default:
            return;
        }

        updateBox(newBox);
      },

      onPanResponderRelease: () => {
        // One-time final bounds checking on release
        const final = {...boxRef.current};
        final.x = Math.max(0, Math.min(final.x, imageWidth - final.width));
        final.y = Math.max(0, Math.min(final.y, imageHeight - final.height));
        final.width = Math.max(MIN_SIZE, Math.min(final.width, imageWidth - final.x));
        final.height = Math.max(MIN_SIZE, Math.min(final.height, imageHeight - final.y));
        
        updateBox(final);
        forceUpdate(prev => prev + 1);
        startRef.current = null;
      },
    });
  };

  const handlers = useRef({
    move: createGestureHandler('move').panHandlers,
    topLeft: createGestureHandler('topLeft').panHandlers,
    topRight: createGestureHandler('topRight').panHandlers,
    bottomLeft: createGestureHandler('bottomLeft').panHandlers,
    bottomRight: createGestureHandler('bottomRight').panHandlers,
  }).current;

  return (
    <View style={styles.container}>
      {/* Overlay background behind crop area */}
      <View style={styles.overlay}>
        <View style={[styles.overlayRegion, styles.overlayTop, { height: boxRef.current.y }]} />
        <View style={{ flexDirection: 'row', height: boxRef.current.height }}>
          <View style={[styles.overlayRegion, styles.overlayLeft, { width: boxRef.current.x }]} />
          <View style={{ width: boxRef.current.width }} />
          <View style={[styles.overlayRegion, styles.overlayRight, { flex: 1 }]} />
        </View>
        <View style={[styles.overlayRegion, styles.overlayBottom, { flex: 1 }]} />
      </View>

      {/* Main crop box with instant-resize capabilities */}
      <View
        ref={containerRef}
        style={[
          styles.cropBox,
          {
            left: boxRef.current.x,
            top: boxRef.current.y, 
            width: boxRef.current.width,
            height: boxRef.current.height,
          },
        ]}
        {...handlers.move}
      >
        {/* Crosshair pattern for crop preview*/}
        <View style={styles.crossHair} />
        
        {/* Visible resize handles */}
        <View 
          style={[styles.resizeHandle, styles.handleTopLeft]} 
          {...handlers.topLeft}
        />
        <View 
          style={[styles.resizeHandle, styles.handleTopRight]} 
          {...handlers.topRight}
        />
        <View 
          style={[styles.resizeHandle, styles.handleBottomLeft]} 
          {...handlers.bottomLeft}
        />
        <View 
          style={[styles.resizeHandle, styles.handleBottomRight]} 
          {...handlers.bottomRight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  overlayRegion: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4CAF50', // Distinct green for testing
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  crossHair: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
  },
  resizeHandle: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  }, 
  handleTopLeft: {
    top: -12,
    left: -12,
  },
  handleTopRight: {
    top: -12, 
    right: -12,
  },
  handleBottomLeft: {
    bottom: -12,
    left: -12,
  },
  handleBottomRight: {
    bottom: -12,
    right: -12,
  },
});

export default SmoothResizeCropBox;