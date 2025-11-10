import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SUBJECTS = ['Math', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography'];

const SubjectSelectionScreen = ({ route, navigation }) => {
  const { imageUri, cropRegion, imageWidth, imageHeight } = route.params || {};

  const handleSubjectSelect = (subject) => {
    console.log(`Subject selected: ${subject}`);
  };

  // Memoize display calculations to prevent expensive re-calculation on every render
  const {
    displayCropWidth,
    displayCropHeight,
    displayImageWidth,
    displayImageHeight,
    displayOffsetX,
    displayOffsetY,
  } = useMemo(() => {
    const maxDisplayWidth = 320;
    const maxDisplayHeight = 240;
    
    let displayScale = 1;
    if (cropRegion) {
      const scaleByWidth = maxDisplayWidth / cropRegion.width;
      const scaleByHeight = maxDisplayHeight / cropRegion.height;
      displayScale = Math.min(scaleByWidth, scaleByHeight, 1);
    }
    
    return {
      displayCropWidth: cropRegion ? cropRegion.width * displayScale : 0,
      displayCropHeight: cropRegion ? cropRegion.height * displayScale : 0,
      displayImageWidth: imageWidth ? imageWidth * displayScale : 0,
      displayImageHeight: imageHeight ? imageHeight * displayScale : 0,
      displayOffsetX: cropRegion ? cropRegion.x * displayScale : 0,
      displayOffsetY: cropRegion ? cropRegion.y * displayScale : 0,
    };
  }, [cropRegion, imageWidth, imageHeight]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.proBadge}>
          <Ionicons name="gift" size={20} color="#00BCD4" />
          <Text style={styles.proText}>Get pro</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {imageUri && (
          <View style={styles.croppedImageContainer}>
            <View style={[
              styles.croppedImageWrapper,
              {
                width: displayCropWidth,
                height: displayCropHeight,
              }
            ]}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: displayImageWidth,
                  height: displayImageHeight,
                  position: 'absolute',
                  left: -displayOffsetX,
                  top: -displayOffsetY,
                }}
                resizeMode="contain"
                fadeDuration={0} // Disable fade to improve perceived performance
              />
            </View>
          </View>
        )}

        <View style={styles.questionSection}>
          <Text style={styles.questionText}>What is the question related to?</Text>

          <View style={styles.subjectsContainer}>
            {SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={styles.subjectButton}
                onPress={() => handleSubjectSelect(subject)}
                activeOpacity={0.7}
              >
                <Text style={styles.subjectText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  proText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  croppedImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  croppedImageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  questionSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  subjectsContainer: {
    gap: 12,
  },
  subjectButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subjectText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SubjectSelectionScreen;
