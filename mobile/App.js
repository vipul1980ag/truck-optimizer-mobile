import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

import AuthScreen            from './src/screens/AuthScreen';
import DashboardScreen       from './src/screens/DashboardScreen';
import AdminScreen           from './src/screens/AdminScreen';
import ParkingScreen         from './src/screens/ParkingScreen';
import BookingsScreen        from './src/screens/BookingsScreen';
import CustomersScreen       from './src/screens/CustomersScreen';
import PaymentWebViewScreen  from './src/screens/PaymentWebViewScreen';
import LocationScreen        from './src/screens/wizard/LocationScreen';
import CustomerScreen        from './src/screens/wizard/CustomerScreen';
import AddCargoScreen        from './src/screens/wizard/AddCargoScreen';
import ReviewCargoScreen     from './src/screens/wizard/ReviewCargoScreen';
import RouteScreen           from './src/screens/wizard/RouteScreen';
import ChargesScreen         from './src/screens/wizard/ChargesScreen';
import ConfirmScreen         from './src/screens/wizard/ConfirmScreen';
import ShipOptionScreen      from './src/screens/wizard/ShipOptionScreen';
import Viz3DScreen           from './src/screens/wizard/Viz3DScreen';

import { AuthProvider, useAuth } from './src/AuthContext';
import { WizardProvider }        from './src/WizardContext';
import { ThemeProvider }         from './src/ThemeContext';
import { LocaleProvider }        from './src/LocaleContext';

const RootStack = createNativeStackNavigator();
const CustStack = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();

const HEADER = {
  headerStyle:         { backgroundColor: '#0c1f40' },
  headerTintColor:     '#f1f5f9',
  headerTitleStyle:    { fontWeight: '900', fontSize: 17, letterSpacing: -0.3 },
  headerShadowVisible: false,
};

function SignOutBtn() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={ls.signOutBtn}>
      <Text style={ls.signOutTxt}>Sign Out</Text>
    </TouchableOpacity>
  );
}

function CustomersStack() {
  return (
    <CustStack.Navigator screenOptions={{ ...HEADER, headerRight: () => <SignOutBtn /> }}>
      <CustStack.Screen name="CustomersList" component={CustomersScreen}
        options={{ title: '👥 Customers' }} />
      <CustStack.Screen name="Payment"       component={PaymentWebViewScreen}
        options={{ title: '💳 Pay via PayPal' }} />
    </CustStack.Navigator>
  );
}

function NewBookingPlaceholder() {
  return <View style={{ flex: 1, backgroundColor: '#f0f4f8' }} />;
}

const TAB_CONFIG = {
  Home:      { icon: '🏠', label: 'Home' },
  Bookings:  { icon: '📋', label: 'Bookings' },
  New:       { icon: '🚛', label: 'New' },
  Parking:   { icon: '🅿️', label: 'Parking' },
  Admin:     { icon: '⚙️', label: 'Fleet' },
  Customers: { icon: '👥', label: 'Clients' },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const cfg = TAB_CONFIG[route.name];
          return (
            <View style={[ls.tabIconWrap, focused && ls.tabIconWrapActive]}>
              <Text style={[ls.tabIcon, { opacity: focused ? 1 : 0.65 }]}>
                {cfg?.icon}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor:   '#60a5fa',
        tabBarInactiveTintColor: '#64748b',
        tabBarHideOnKeyboard:    true,
        tabBarStyle: {
          backgroundColor: '#0c1f40',
          borderTopColor:  'rgba(255,255,255,0.07)',
          borderTopWidth:  1,
          paddingBottom:   Math.max(insets.bottom, 8),
          paddingTop:      8,
          height:          64 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2, marginTop: 2 },
        ...HEADER,
        headerRight: () => <SignOutBtn />,
      })}
    >
      <Tab.Screen name="Home"      component={DashboardScreen}
        options={{ title: '🚛 Dashboard', tabBarLabel: TAB_CONFIG.Home.label }} />

      <Tab.Screen name="Bookings"  component={BookingsScreen}
        options={{ title: '📋 Bookings', tabBarLabel: TAB_CONFIG.Bookings.label }} />

      <Tab.Screen name="New"       component={NewBookingPlaceholder}
        options={{ tabBarLabel: TAB_CONFIG.New.label }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Location');
          },
        })}
      />

      <Tab.Screen name="Parking"   component={ParkingScreen}
        options={{ title: '🅿️ Find Parking', tabBarLabel: TAB_CONFIG.Parking.label }} />

      <Tab.Screen name="Admin"     component={AdminScreen}
        options={{ title: '⚙️ Fleet & Carriers', tabBarLabel: TAB_CONFIG.Admin.label }} />

      <Tab.Screen name="Customers" component={CustomersStack}
        options={{ tabBarLabel: TAB_CONFIG.Customers.label, headerShown: false }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={ls.splash}>
        <View style={ls.splashCircle1} pointerEvents="none" />
        <View style={ls.splashCircle2} pointerEvents="none" />
        <View style={ls.splashLogoWrap}>
          <Text style={{ fontSize: 46 }}>🚛</Text>
        </View>
        <Text style={ls.splashTitle}>Load Optimizer</Text>
        <Text style={ls.splashSub}>Intelligent Cargo Management</Text>
        <ActivityIndicator color="#60a5fa" size="large" style={{ marginTop: 36 }} />
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <WizardProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={MainTabs} />

          <RootStack.Group screenOptions={{
            headerShown: true, ...HEADER,
            headerRight: () => <SignOutBtn />,
          }}>
            <RootStack.Screen name="Location"    component={LocationScreen}
              options={{ title: '🚛 New Booking' }} />
            <RootStack.Screen name="Customer"    component={CustomerScreen}
              options={{ title: '👤 Select Customer' }} />
            <RootStack.Screen name="AddCargo"    component={AddCargoScreen}
              options={{ title: '📦 Add Cargo' }} />
            <RootStack.Screen name="ReviewCargo" component={ReviewCargoScreen}
              options={{ title: '📋 Review Cargo' }} />
            <RootStack.Screen name="ShipOption"  component={ShipOptionScreen}
              options={{ title: '🚚 Shipping Option' }} />
            <RootStack.Screen name="Route"       component={RouteScreen}
              options={{ title: '🗺️ Select Route' }} />
            <RootStack.Screen name="Charges"     component={ChargesScreen}
              options={{ title: '💰 Charges' }} />
            <RootStack.Screen name="Confirm"     component={ConfirmScreen}
              options={{ headerShown: false }} />
            <RootStack.Screen name="Viz3D"       component={Viz3DScreen}
              options={{ title: '🧊 3D Load View' }} />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
    </WizardProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}

const ls = StyleSheet.create({
  /* Splash / Loading */
  splash: {
    flex: 1, backgroundColor: '#0c1f40',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  splashCircle1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(37,99,235,0.13)', top: -110, right: -90,
  },
  splashCircle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(124,58,237,0.09)', bottom: 60, left: -90,
  },
  splashLogoWrap: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: 'rgba(37,99,235,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.38)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  splashTitle: { fontSize: 28, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.8, marginBottom: 6 },
  splashSub:   { fontSize: 13, color: '#64748b', letterSpacing: 0.4 },

  /* Sign out button */
  signOutBtn: {
    marginRight: 14, backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  signOutTxt: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },

  /* Tab bar icons */
  tabIconWrap:       { alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: {},
  tabIcon:           { fontSize: 22 },
});
