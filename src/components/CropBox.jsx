import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (onCropChange) {
      onCropChange(boxDimensions);
    }
  }, [boxDimensions, onCropChange]);

  const handleSize = 30;
  const minSize = 40;

  const createPanResponder = (handleType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        
        setBoxDimensions(prev => {
          let newDimensions = { ...prev };
          let newDim = { ...prev };

          try {
            switch (handleType) {
              case 'move':
                newDim.x = Math.max(offsetX, Math.min(prev.x + dx, offsetX + displayedImageWidth - prev.width));
                newDim.y = Math.max(offsetY, Math.min(prev.y + dy, offsetY + displayedImageHeight - prev.height));
                break;
              
              case 'topLeft':
                newDim.width = Math.max(minSize, prev.width - dx);
                newDim.height = Math.max(minSize, prev.height - dy);
                newDim.x = prev.x + dx;
                newDim.y = prev.y + dy;
                
                // Adjust if goes out of bounds
                if (newDim.x < offsetX) {
                  newDim.width += (newDim.x - offsetX);
                  newDim.x = offsetX;
                }
                if (newDim.y < offsetY) {
                  newDim.height += (newDim.y - offsetY);
                  newDim.y = offsetY;
                }
                break;
              
              case 'topRight':
                newDim.width = Math.max(minSize, prev.width + dx);
                newDim.height = Math.max(minSize, prev.height - dy);
                newDim.y = prev.y + dy;
                
                // Adjust if goes out of bounds
                if (prev.x + newDim.width > offsetX + displayedImageWidth) {
                  newDim.width = offsetX + displayedImageWidth - prev.x;
                }
                if (newDim.y < offsetY) {
                  newDim.height += (newDim.y - offsetY);
                  newDim.y = offsetY;
                }
                break;
              
              case 'bottomLeft':
                newDim.width = Math.max(minSize, prev.width - dx);
                newDim.height = Math.max(minSize, prev.height + dy);
                newDim.x = prev.x + dx;
                
                // Adjust if goes out of bounds
                if (newDim.x < offsetX) {
                  newDim.width += (newDim.x - offsetX);
                  newDim.x = offsetX;
                }
                if (prev.y + newDim.height > offsetY + displayedImageHeight) {
                  newDim.height = offsetY + displayedImageHeight - prev.y;
                }
                break;
              
              case 'bottomRight':
                newDim.width = Math.max(minSize, prev.width + dx);
                newDim.height = Math.max(minSize, prev.height + dy);
                
                // Adjust if goes out of bounds
                if (prev.x + newDim.width > offsetX + displayedImageWidth) {
                  newDim.width = offsetX + displayedImageWidth - prev.x;
                }
                if (prev.y + newDim.height > offsetY + displayedImageHeight) {
                  newDim.height = offsetY + displayedImageHeight - prev.y;
                }
                break;
            }
            
            // Final validate bounds for corner cases
            newDim.x = Math.max(offsetX, newDim.x);
            newDim.y = Math.max(offsetY, newDim.y);
            newDim.width = Math.min(newDim.width, offsetX + displayedImageWidth - newDim.x);
            newDim.height = Math.min(newDim.height, offsetY + displayedImageHeight - newDim.y);
            
            newDimensions = newDim;
          } catch (error) {
            console.log('Crop operation error resolved safely');
            return prev;
          }

          if (onCropChange) {
            onCropChange(newDimensions);
          }

          return newDimensions;
        });
      },
      onPanResponderRelease: () => {},
    });
  };

  const movePanResponder = createPanResponder('move');
  const topLeftPanResponder = createPanResponder('topLeft');
  const topRightPanResponder = createPanResponder('topRight');
  const bottomLeftPanResponder = createPanResponder('bottomLeft');
  const bottomRightPanResponder = createPanResponder('bottomRight');

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
        {...movePanResponder.panHandlers}
      >
        <View style={styles.border} />
        
        <View
          style={[styles.handle, styles.topLeft]}
          {...topLeftPanResponder.panHandlers}
        />
        <View
          style={[styles.handle, styles.topRight]}
          {...topRightPanResponder.panHandlers}
        />
        <View
          style={[styles.handle, styles.bottomLeft]}
          {...bottomLeftPanResponder.panHandlers}
        />
        <View
          style={[styles.handle, styles.bottomRight]}
          {...bottomRightPanResponder.panHandlers}
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

export default CropBox;
