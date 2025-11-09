import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

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

  const dragState = useRef({
    isDragging: false,
    type: null,
    startX: 0,
    startY: 0,
    startBox: null,
  });

  useEffect(() => {
    if (onCropChange) {
      onCropChange(boxDimensions);
    }
  }, [boxDimensions]);

  const minSize = 80;

  const handleMouseDown = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    
    dragState.current = {
      isDragging: true,
      type,
      startX: touch.pageX || touch.clientX,
      startY: touch.pageY || touch.clientY,
      startBox: { ...boxDimensions },
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDragging) return;

    const touch = e.touches ? e.touches[0] : e;
    const currentX = touch.pageX || touch.clientX;
    const currentY = touch.pageY || touch.clientY;
    
    const dx = currentX - dragState.current.startX;
    const dy = currentY - dragState.current.startY;
    
    const startBox = dragState.current.startBox;
    const type = dragState.current.type;
    
    let newDimensions = { ...startBox };

    switch (type) {
      case 'move':
        newDimensions.x = Math.max(offsetX, Math.min(startBox.x + dx, offsetX + displayedImageWidth - startBox.width));
        newDimensions.y = Math.max(offsetY, Math.min(startBox.y + dy, offsetY + displayedImageHeight - startBox.height));
        break;
      
      case 'topLeft':
        const newWidthTL = startBox.width - dx;
        const newHeightTL = startBox.height - dy;
        if (newWidthTL >= minSize && startBox.x + dx >= offsetX) {
          newDimensions.x = startBox.x + dx;
          newDimensions.width = newWidthTL;
        }
        if (newHeightTL >= minSize && startBox.y + dy >= offsetY) {
          newDimensions.y = startBox.y + dy;
          newDimensions.height = newHeightTL;
        }
        break;
      
      case 'topRight':
        const newWidthTR = startBox.width + dx;
        const newHeightTR = startBox.height - dy;
        if (newWidthTR >= minSize && startBox.x + newWidthTR <= offsetX + displayedImageWidth) {
          newDimensions.width = newWidthTR;
        }
        if (newHeightTR >= minSize && startBox.y + dy >= offsetY) {
          newDimensions.y = startBox.y + dy;
          newDimensions.height = newHeightTR;
        }
        break;
      
      case 'bottomLeft':
        const newWidthBL = startBox.width - dx;
        const newHeightBL = startBox.height + dy;
        if (newWidthBL >= minSize && startBox.x + dx >= offsetX) {
          newDimensions.x = startBox.x + dx;
          newDimensions.width = newWidthBL;
        }
        if (newHeightBL >= minSize && startBox.y + newHeightBL <= offsetY + displayedImageHeight) {
          newDimensions.height = newHeightBL;
        }
        break;
      
      case 'bottomRight':
        const newWidthBR = startBox.width + dx;
        const newHeightBR = startBox.height + dy;
        if (newWidthBR >= minSize && startBox.x + newWidthBR <= offsetX + displayedImageWidth) {
          newDimensions.width = newWidthBR;
        }
        if (newHeightBR >= minSize && startBox.y + newHeightBR <= offsetY + displayedImageHeight) {
          newDimensions.height = newHeightBR;
        }
        break;
    }

    setBoxDimensions(newDimensions);
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);
  };

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
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleMouseDown('move')}
        onTouchStart={handleMouseDown('move')}
      >
        <View style={styles.border} />
        
        <View
          style={[styles.handle, styles.topLeft]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleMouseDown('topLeft')}
          onTouchStart={handleMouseDown('topLeft')}
        />
        <View
          style={[styles.handle, styles.topRight]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleMouseDown('topRight')}
          onTouchStart={handleMouseDown('topRight')}
        />
        <View
          style={[styles.handle, styles.bottomLeft]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleMouseDown('bottomLeft')}
          onTouchStart={handleMouseDown('bottomLeft')}
        />
        <View
          style={[styles.handle, styles.bottomRight]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleMouseDown('bottomRight')}
          onTouchStart={handleMouseDown('bottomRight')}
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
    cursor: 'move',
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
    cursor: 'pointer',
  },
  topLeft: {
    top: -15,
    left: -15,
    cursor: 'nw-resize',
  },
  topRight: {
    top: -15,
    right: -15,
    cursor: 'ne-resize',
  },
  bottomLeft: {
    bottom: -15,
    left: -15,
    cursor: 'sw-resize',
  },
  bottomRight: {
    bottom: -15,
    right: -15,
    cursor: 'se-resize',
  },
});

export default CropBox;
