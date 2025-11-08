import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import CropBox from '../components/CropBox';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraActiveScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [cropRegion, setCropRegion] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setCropRegion(null);
  };

  const confirmCrop = () => {
    if (capturedImage && cropRegion) {
      const previewWidth = SCREEN_WIDTH;
      const previewHeight = SCREEN_HEIGHT - 200;
      
      const imageAspect = capturedImage.width / capturedImage.height;
      const previewAspect = previewWidth / previewHeight;
      
      let scaleX, scaleY, offsetX = 0, offsetY = 0;
      
      if (imageAspect > previewAspect) {
        scaleX = capturedImage.width / previewWidth;
        scaleY = scaleX;
        offsetY = (previewHeight - (capturedImage.height / scaleY)) / 2;
      } else {
        scaleY = capturedImage.height / previewHeight;
        scaleX = scaleY;
        offsetX = (previewWidth - (capturedImage.width / scaleX)) / 2;
      }
      
      const imageCropRegion = {
        x: Math.max(0, Math.min((cropRegion.x - offsetX) * scaleX, capturedImage.width)),
        y: Math.max(0, Math.min((cropRegion.y - offsetY) * scaleY, capturedImage.height)),
        width: cropRegion.width * scaleX,
        height: cropRegion.height * scaleY,
      };
      
      imageCropRegion.width = Math.min(imageCropRegion.width, capturedImage.width - imageCropRegion.x);
      imageCropRegion.height = Math.min(imageCropRegion.height, capturedImage.height - imageCropRegion.y);
      
      navigation.navigate('SubjectSelection', {
        imageUri: capturedImage.uri,
        cropRegion: imageCropRegion,
        imageWidth: capturedImage.width,
        imageHeight: capturedImage.height,
      });
    }
  };

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.proBadge}>
          <Ionicons name="gift" size={20} color="#00BCD4" />
          <Text style={styles.proText}>Get pro</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {!capturedImage ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          flash={flashMode}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-outline'}
                size={24}
                color={flashMode === 'on' ? '#FFD700' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedImage.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <CropBox
            imageWidth={SCREEN_WIDTH}
            imageHeight={SCREEN_HEIGHT - 200}
            actualImageWidth={capturedImage.width}
            actualImageHeight={capturedImage.height}
            onCropChange={setCropRegion}
          />
        </View>
      )}

      <View style={styles.controls}>
        {capturedImage && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePicture}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmCrop}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="images-outline" size={28} color="#fff" />
          </TouchableOpacity>

          {!capturedImage && (
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePicture}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          )}

          {capturedImage && (
            <View style={styles.shutterButton} />
          )}

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="search-outline" size={20} color="#888" />
            <Text style={styles.tabText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="camera" size={20} color="#00BCD4" />
            <Text style={[styles.tabText, styles.tabTextActive]}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="person-outline" size={20} color="#888" />
            <Text style={styles.tabText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  permissionButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  proText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  flashButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    marginBottom: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  controls: {
    paddingBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  retakeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#00BCD4',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00BCD4',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00BCD4',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  tab: {
    alignItems: 'center',
    padding: 8,
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  tabTextActive: {
    color: '#00BCD4',
  },
});

export default CameraActiveScreen;
