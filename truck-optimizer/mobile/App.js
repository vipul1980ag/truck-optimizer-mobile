import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import AuthScreen        from './src/screens/AuthScreen';
import LocationScreen    from './src/screens/wizard/LocationScreen';
import CustomerScreen    from './src/screens/wizard/CustomerScreen';
import AddCargoScreen    from './src/screens/wizard/AddCargoScreen';
import ReviewCargoScreen from './src/screens/wizard/ReviewCargoScreen';
import RouteScreen       from './src/screens/wizard/RouteScreen';
import ChargesScreen     from './src/screens/wizard/ChargesScreen';
import ConfirmScreen     from './src/screens/wizard/ConfirmScreen';
import Viz3DScreen      from './src/screens/wizard/Viz3DScreen';

import { AuthProvider, useAuth }     from './src/AuthContext';
import { WizardProvider }            from './src/WizardContext';

const WizardStack = createNativeStackNavigator();

const NAV_OPTS = {
  headerStyle:      { backgroundColor: '#0c1f40' },
  headerTintColor:  '#f1f5f9',
  headerTitleStyle: { fontWeight: '900', fontSize: 17, letterSpacing: -0.3 },
  headerShadowVisible: false,
};

function AppNavigator() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0c1f40', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🚛</Text>
        <ActivityIndicator color="#60a5fa" size="large" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  const signOutBtn = () => (
    <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
      <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Sign Out</Text>
    </TouchableOpacity>
  );

  return (
    <WizardProvider>
      <NavigationContainer>
        <WizardStack.Navigator screenOptions={{ ...NAV_OPTS, headerRight: signOutBtn }}>
          <WizardStack.Screen
            name="Location"
            component={LocationScreen}
            options={{ title: '🚛 New Booking' }}
          />
          <WizardStack.Screen
            name="Customer"
            component={CustomerScreen}
            options={{ title: '👤 Customers' }}
          />
          <WizardStack.Screen
            name="AddCargo"
            component={AddCargoScreen}
            options={{ title: '📦 Add Cargo Item' }}
          />
          <WizardStack.Screen
            name="ReviewCargo"
            component={ReviewCargoScreen}
            options={{ title: '📋 My Cargo List' }}
          />
          <WizardStack.Screen
            name="Route"
            component={RouteScreen}
            options={{ title: '🗺️ Select Route' }}
          />
          <WizardStack.Screen
            name="Charges"
            component={ChargesScreen}
            options={{ title: '💰 Estimated Charges' }}
          />
          <WizardStack.Screen
            name="Confirm"
            component={ConfirmScreen}
            options={{ headerShown: false }}
          />
          <WizardStack.Screen
            name="Viz3D"
            component={Viz3DScreen}
            options={{ title: '🧊 3D Load View' }}
          />
        </WizardStack.Navigator>
      </NavigationContainer>
    </WizardProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
