import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CameraIdleScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
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

      <View style={styles.content}>
        <Text style={styles.mainText}>Take a pic and get{'\n'}an answer</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.flashButton}>
          <Ionicons name="flash-outline" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="images-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterButton}
            onPress={() => navigation.navigate('CameraActive')}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  controls: {
    paddingBottom: 20,
  },
  flashButton: {
    alignSelf: 'center',
    marginBottom: 20,
    padding: 12,
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

export default CameraIdleScreen;
