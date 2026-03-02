import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import DashboardScreen      from './src/screens/DashboardScreen';
import CargoScreen          from './src/screens/CargoScreen';
import CustomersScreen      from './src/screens/CustomersScreen';
import FleetScreen          from './src/screens/FleetScreen';
import OptimizeScreen       from './src/screens/OptimizeScreen';
import PaymentWebViewScreen from './src/screens/PaymentWebViewScreen';
import AuthScreen           from './src/screens/AuthScreen';
import { AuthProvider, useAuth } from './src/AuthContext';

const Tab       = createBottomTabNavigator();
const CustStack = createNativeStackNavigator();

const NAV_OPTS = {
  headerStyle:      { backgroundColor: '#0c1f40' },
  headerTintColor:  '#f1f5f9',
  headerTitleStyle: { fontWeight: '900', fontSize: 17, letterSpacing: -0.3 },
  headerShadowVisible: false,
};

function CustomersStack() {
  return (
    <CustStack.Navigator screenOptions={NAV_OPTS}>
      <CustStack.Screen name="CustomerList" component={CustomersScreen} options={{ title: 'Customers' }} />
      <CustStack.Screen name="Payment"      component={PaymentWebViewScreen} options={{ title: 'Pay Invoice' }} />
    </CustStack.Navigator>
  );
}

const TABS = [
  { name: 'Dashboard', icon: '🏠', label: 'Home',      component: DashboardScreen },
  { name: 'Cargo',     icon: '📦', label: 'Cargo',     component: CargoScreen },
  { name: 'Customers', icon: '👥', label: 'Customers', component: CustomersStack, noHeader: true },
  { name: 'Fleet',     icon: '🚛', label: 'Fleet',     component: FleetScreen },
  { name: 'Optimize',  icon: '⚡', label: 'Optimize',  component: OptimizeScreen },
];

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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...NAV_OPTS,
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Sign Out</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused }) => {
            const tab = TABS.find(t => t.name === route.name);
            return (
              <View style={{
                alignItems: 'center', justifyContent: 'center',
                width: 40, height: 28,
                backgroundColor: focused ? 'rgba(37,99,235,0.15)' : 'transparent',
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
                  {tab?.icon}
                </Text>
              </View>
            );
          },
          tabBarStyle: {
            backgroundColor: '#0c1f40',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor:   '#60a5fa',
          tabBarInactiveTintColor: '#475569',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
        })}
      >
        {TABS.map(t => (
          <Tab.Screen
            key={t.name}
            name={t.name}
            component={t.component}
            options={t.noHeader ? { headerShown: false, tabBarLabel: t.label } : { tabBarLabel: t.label }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
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
