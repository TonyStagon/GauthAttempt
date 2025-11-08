import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import CameraIdleScreen from './src/screens/CameraIdleScreen';
import CameraActiveScreen from './src/screens/CameraActiveScreen';
import SubjectSelectionScreen from './src/screens/SubjectSelectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="CameraIdle"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress,
              },
            }),
          }}
        >
          <Stack.Screen name="CameraIdle" component={CameraIdleScreen} />
          <Stack.Screen name="CameraActive" component={CameraActiveScreen} />
          <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
