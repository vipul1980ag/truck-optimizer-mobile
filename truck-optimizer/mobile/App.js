import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import AuthScreen            from './src/screens/AuthScreen';
import DashboardScreen       from './src/screens/DashboardScreen';
import AdminScreen           from './src/screens/AdminScreen';
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
import Viz3DScreen           from './src/screens/wizard/Viz3DScreen';

import { AuthProvider, useAuth } from './src/AuthContext';
import { WizardProvider }        from './src/WizardContext';

const RootStack = createNativeStackNavigator();
const CustStack = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();

const HEADER = {
  headerStyle:      { backgroundColor: '#0c1f40' },
  headerTintColor:  '#f1f5f9',
  headerTitleStyle: { fontWeight: '900', fontSize: 17, letterSpacing: -0.3 },
  headerShadowVisible: false,
};

function SignOutBtn() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
      <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Sign Out</Text>
    </TouchableOpacity>
  );
}

/* Customers needs its own stack so Pay Now works */
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

/* Placeholder — New Booking tab press is intercepted before showing this */
function NewBookingPlaceholder() {
  return <View style={{ flex: 1, backgroundColor: '#eef2f7' }} />;
}

const ICON = { Home: '🏠', Bookings: '📋', New: '🚛', Admin: '⚙️', Customers: '👥' };

/* ── 4 real tabs + 1 intercepted "New Booking" tab ─────────────── */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.7 }}>
            {ICON[route.name]}
          </Text>
        ),
        tabBarActiveTintColor:   '#60a5fa',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarHideOnKeyboard:    true,
        tabBarStyle: {
          backgroundColor: '#0c1f40',
          borderTopColor:  '#1e3a5f',
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      6,
          height:          72,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        ...HEADER,
        headerRight: () => <SignOutBtn />,
      })}
    >
      <Tab.Screen name="Home"      component={DashboardScreen}
        options={{ title: '🚛 Dashboard', tabBarLabel: 'Home' }} />

      <Tab.Screen name="Bookings"  component={BookingsScreen}
        options={{ title: '📋 Bookings' }} />

      {/* Intercept press → push wizard onto root stack */}
      <Tab.Screen name="New"       component={NewBookingPlaceholder}
        options={{ tabBarLabel: 'New Booking' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Location');
          },
        })}
      />

      <Tab.Screen name="Admin"     component={AdminScreen}
        options={{ title: '⚙️ Fleet & Carriers', tabBarLabel: 'Admin' }} />

      <Tab.Screen name="Customers" component={CustomersStack}
        options={{ tabBarLabel: 'Customers', headerShown: false }} />
    </Tab.Navigator>
  );
}

/* ── Root: Tabs + wizard screens as siblings ────────────────────── */
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0c1f40', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🚛</Text>
        <ActivityIndicator color="#60a5fa" size="large" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <WizardProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>

          {/* Tabs — always visible unless wizard is open */}
          <RootStack.Screen name="Tabs" component={MainTabs} />

          {/* Wizard — slides on top of tabs */}
          <RootStack.Group screenOptions={{
            headerShown: true, ...HEADER,
            headerRight: () => <SignOutBtn />,
          }}>
            <RootStack.Screen name="Location"    component={LocationScreen}
              options={{ title: '🚛 New Booking' }} />
            <RootStack.Screen name="Customer"    component={CustomerScreen}
              options={{ title: '👤 Customers' }} />
            <RootStack.Screen name="AddCargo"    component={AddCargoScreen}
              options={{ title: '📦 Add Cargo' }} />
            <RootStack.Screen name="ReviewCargo" component={ReviewCargoScreen}
              options={{ title: '📋 Review Cargo' }} />
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
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
