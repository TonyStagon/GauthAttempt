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
  }, []);

  const handleSize = 30;
  const minSize = 80;

  const createPanResponder = (handleType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        
        setBoxDimensions(prev => {
          let newDimensions = { ...prev };

          switch (handleType) {
            case 'move':
              newDimensions.x = Math.max(offsetX, Math.min(prev.x + dx, offsetX + displayedImageWidth - prev.width));
              newDimensions.y = Math.max(offsetY, Math.min(prev.y + dy, offsetY + displayedImageHeight - prev.height));
              break;
            
            case 'topLeft':
              const newWidthTL = prev.width - dx;
              const newHeightTL = prev.height - dy;
              if (newWidthTL >= minSize && prev.x + dx >= offsetX) {
                newDimensions.x = prev.x + dx;
                newDimensions.width = newWidthTL;
              }
              if (newHeightTL >= minSize && prev.y + dy >= offsetY) {
                newDimensions.y = prev.y + dy;
                newDimensions.height = newHeightTL;
              }
              break;
            
            case 'topRight':
              const newWidthTR = prev.width + dx;
              const newHeightTR = prev.height - dy;
              if (newWidthTR >= minSize && prev.x + newWidthTR <= offsetX + displayedImageWidth) {
                newDimensions.width = newWidthTR;
              }
              if (newHeightTR >= minSize && prev.y + dy >= offsetY) {
                newDimensions.y = prev.y + dy;
                newDimensions.height = newHeightTR;
              }
              break;
            
            case 'bottomLeft':
              const newWidthBL = prev.width - dx;
              const newHeightBL = prev.height + dy;
              if (newWidthBL >= minSize && prev.x + dx >= offsetX) {
                newDimensions.x = prev.x + dx;
                newDimensions.width = newWidthBL;
              }
              if (newHeightBL >= minSize && prev.y + newHeightBL <= offsetY + displayedImageHeight) {
                newDimensions.height = newHeightBL;
              }
              break;
            
            case 'bottomRight':
              const newWidthBR = prev.width + dx;
              const newHeightBR = prev.height + dy;
              if (newWidthBR >= minSize && prev.x + newWidthBR <= offsetX + displayedImageWidth) {
                newDimensions.width = newWidthBR;
              }
              if (newHeightBR >= minSize && prev.y + newHeightBR <= offsetY + displayedImageHeight) {
                newDimensions.height = newHeightBR;
              }
              break;
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
