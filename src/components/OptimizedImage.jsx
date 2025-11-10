import React, { useMemo } from 'react';
import { Image } from 'react-native';

/**
 * OptimizedImage component that prevents unnecessary re-renders
 * and reduces style calculation overhead
 */
const OptimizedImage = React.memo(({ 
  source, 
  width, 
  height, 
  style: additionalStyles,
  resizeMode = 'contain',
  fadeDuration = 0, // Disable fade for instant loading
  ...props 
}) => {

  const imageStyle = useMemo(() => ({
    width,
    height,
    resizeMode,
    ...additionalStyles // Merged outside the object to prevent re-calculation
  }), [width, height, resizeMode, additionalStyles]);

  return (
    <Image
      source={source}
      style={[imageStyle, additionalStyles]}
      fadeDuration={fadeDuration}
      {...props}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if source URI or dimensions change
  return (
    prevProps.source?.uri === nextProps.source?.uri &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});

export default OptimizedImage;