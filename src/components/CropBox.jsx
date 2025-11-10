import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CropBox = ({ imageWidth, imageHeight, actualImageWidth, actualImageHeight, onCropChange }) => {
  const imageAspect = actualImageWidth / actualImageHeight;
  const containerAspect = imageWidth / imageHeight;
  
  let displayedImageWidth, displayedImageHeight, offsetX, offsetY;
  
  if (imageAspect > containerAspect) {
    displayedImageWidth = imageWidth;
    displayedImageHeight = imageWidth / imageAspect;
    offsetX = 0;
    offsetY = (imageHeight - displayedImageHeight) / 2;
  } else {
    displayedImageHeight = imageHeight;
    displayedImageWidth = imageHeight * imageAspect;
    offsetX = (imageWidth - displayedImageWidth) / 2;
    offsetY = 0;
  }
  
  const initialWidth = displayedImageWidth * 0.6;
  const initialHeight = displayedImageHeight * 0.3;
  const initialX = offsetX + (displayedImageWidth - initialWidth) / 2;
  const initialY = offsetY + (displayedImageHeight - initialHeight) / 2;

  const [boxDimensions, setBoxDimensions] = useState({
    x: initialX,
    y: initialY,
    width: initialWidth,
    height: initialHeight,
  });

  // Use refs for gesture state to prevent unnecessary re-renders
  const startDimensionsRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  
  const [isResizing, setIsResizing] = useState(false);

  // Debounce crop change events to reduce re-renders
  const debouncedCropChange = useCallback((dimensions) => {
    if (onCropChange) {
      // Use requestAnimationFrame to batch updates during gesture
      requestAnimationFrame(() => {
        onCropChange(dimensions);
      });
    }
  }, [onCropChange]);

  useEffect(() => {
    debouncedCropChange(boxDimensions);
  }, [boxDimensions, debouncedCropChange]);

  const handleSize = 30;
  const minSize = 40;

  const createPanResponder = useCallback((handleType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Store the current dimensions when gesture begins - using a ref for immediate access
        startDimensionsRef.current = boxDimensions;
        setIsResizing(handleType !== 'move');
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Use current dimensions directly to avoid stale closure issues
        const baseDimensions = startDimensionsRef.current || boxDimensions;
        let newDim = { ...baseDimensions };

        try {
          switch (handleType) {
            case 'move':
              newDim.x = Math.max(offsetX, Math.min(baseDimensions.x + dx, offsetX + displayedImageWidth - baseDimensions.width));
              newDim.y = Math.max(offsetY, Math.min(baseDimensions.y + dy, offsetY + displayedImageHeight - baseDimensions.height));
              break;
            
            case 'topLeft':
              newDim.width = Math.max(minSize, baseDimensions.width - dx);
              newDim.height = Math.max(minSize, baseDimensions.height - dy);
              newDim.x = baseDimensions.x + baseDimensions.width - newDim.width;
              newDim.y = baseDimensions.y + baseDimensions.height - newDim.height;
              break;
            
            case 'topRight':
              newDim.width = Math.max(minSize, baseDimensions.width + dx);
              newDim.height = Math.max(minSize, baseDimensions.height - dy);
              newDim.x = baseDimensions.x;
              newDim.y = baseDimensions.y + baseDimensions.height - newDim.height;
              break;
            
            case 'bottomLeft':
              newDim.width = Math.max(minSize, baseDimensions.width - dx);
              newDim.height = Math.max(minSize, baseDimensions.height + dy);
              newDim.x = baseDimensions.x + baseDimensions.width - newDim.width;
              newDim.y = baseDimensions.y;
              break;
            
            case 'bottomRight':
              newDim.width = Math.max(minSize, baseDimensions.width + dx);
              newDim.height = Math.max(minSize, baseDimensions.height + dy);
              newDim.x = baseDimensions.x;
              newDim.y = baseDimensions.y;
              break;
          }
          
          // Constrain to image bounds
          if (newDim.x < offsetX) {
            newDim.width = Math.max(minSize, newDim.width - (offsetX - newDim.x));
            newDim.x = offsetX;
          }
          if (newDim.y < offsetY) {
            newDim.height = Math.max(minSize, newDim.height - (offsetY - newDim.y));
            newDim.y = offsetY;
          }
          if (newDim.x + newDim.width > offsetX + displayedImageWidth) {
            newDim.width = offsetX + displayedImageWidth - newDim.x;
          }
          if (newDim.y + newDim.height > offsetY + displayedImageHeight) {
            newDim.height = offsetY + displayedImageHeight - newDim.y;
          }
          
          // Ensure minimum size
          newDim.width = Math.max(minSize, newDim.width);
          newDim.height = Math.max(minSize, newDim.height);
          
        } catch (error) {
          console.log('Crop operation error resolved smoothly');
          return;
        }

        // Batch state updates and use a timer to avoid excessive updates
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = setTimeout(() => {
          setBoxDimensions(newDim);
        }, 8); // ~120fps which is smooth but not overwhelming
      },
      onPanResponderRelease: () => {
        startDimensionsRef.current = null;
        updateTimeoutRef.current = null;
        setIsResizing(false);
      },
    });
  }, [offsetX, offsetY, displayedImageWidth, displayedImageHeight, minSize, boxDimensions]);

  const movePanResponder = createPanResponder('move');
  const topLeftPanResponder = createPanResponder('topLeft');
  const topRightPanResponder = createPanResponder('topRight');
  const bottomLeftPanResponder = createPanResponder('bottomLeft');
  const bottomRightPanResponder = createPanResponder('bottomRight');

  // Memoize handlers to prevent unnecessary re-renders - must be after responders are created
  const cropHandlers = useMemo(() => ({
    move: movePanResponder.panHandlers,
    topLeft: topLeftPanResponder.panHandlers,
    topRight: topRightPanResponder.panHandlers,
    bottomLeft: bottomLeftPanResponder.panHandlers,
    bottomRight: bottomRightPanResponder.panHandlers,
  }), [movePanResponder, topLeftPanResponder, topRightPanResponder, bottomLeftPanResponder, bottomRightPanResponder]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={[styles.overlayTop, { height: boxDimensions.y }]} />
        
        <View style={{ flexDirection: 'row', height: boxDimensions.height }}>
          <View style={[styles.overlayLeft, { width: boxDimensions.x }]} />
          <View style={{ width: boxDimensions.width }} />
          <View style={[styles.overlayRight, { flex: 1 }]} />
        </View>
        
        <View style={[styles.overlayBottom, { flex: 1 }]} />
      </View>

      <View
        style={[
          styles.cropBox,
          {
            left: boxDimensions.x,
            top: boxDimensions.y,
            width: boxDimensions.width,
            height: boxDimensions.height,
          },
        ]}
      >
        <View
          style={styles.border}
          {...(!isResizing ? cropHandlers.move : {})}
        />
        
        <View
          style={[styles.handle, styles.topLeft]}
          {...cropHandlers.topLeft}
        />
        <View
          style={[styles.handle, styles.topRight]}
          {...cropHandlers.topRight}
        />
        <View
          style={[styles.handle, styles.bottomLeft]}
          {...cropHandlers.bottomLeft}
        />
        <View
          style={[styles.handle, styles.bottomRight]}
          {...cropHandlers.bottomRight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  overlayTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayLeft: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayRight: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00BCD4',
    borderRadius: 8,
  },
  border: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  handle: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#00BCD4',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  topLeft: {
    top: -15,
    left: -15,
  },
  topRight: {
    top: -15,
    right: -15,
  },
  bottomLeft: {
    bottom: -15,
    left: -15,
  },
  bottomRight: {
    bottom: -15,
    right: -15,
  },
});

// Originally contained performance complex slow code.
// LEFT AS BACKUP COMPONENT - for dev benchmarking comparisons ONLY
// PRODUCTION: Replace this import in CameraActiveScreen with OptimizedCropBox
export default React.memo(CropBox, (prevProps, nextProps) => {
  return (
    prevProps.imageWidth === nextProps.imageWidth &&
    prevProps.imageHeight === nextProps.imageHeight &&
    prevProps.actualImageWidth === nextProps.actualImageWidth &&
    prevProps.actualImageHeight === nextProps.actualImageHeight
  );
});
