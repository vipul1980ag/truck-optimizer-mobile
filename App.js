import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import DashboardScreen      from './src/screens/DashboardScreen';
import CargoScreen          from './src/screens/CargoScreen';
import CustomersScreen      from './src/screens/CustomersScreen';
import FleetScreen          from './src/screens/FleetScreen';
import OptimizeScreen       from './src/screens/OptimizeScreen';
import PaymentWebViewScreen from './src/screens/PaymentWebViewScreen';

const Tab       = createBottomTabNavigator();
const CustStack = createNativeStackNavigator();

const NAV_OPTS = {
  headerStyle:      { backgroundColor: '#1e293b' },
  headerTintColor:  '#f1f5f9',
  headerTitleStyle: { fontWeight: '800' },
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
  { name: 'Dashboard', icon: '🏠', component: DashboardScreen },
  { name: 'Cargo',     icon: '📦', component: CargoScreen },
  { name: 'Customers', icon: '👥', component: CustomersStack, noHeader: true },
  { name: 'Fleet',     icon: '🚛', component: FleetScreen },
  { name: 'Optimize',  icon: '⚡',       component: OptimizeScreen },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            ...NAV_OPTS,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>
                {TABS.find(t => t.name === route.name)?.icon}
              </Text>
            ),
            tabBarStyle:             { backgroundColor: '#1e293b', borderTopColor: '#334155' },
            tabBarActiveTintColor:   '#93c5fd',
            tabBarInactiveTintColor: '#64748b',
            tabBarLabelStyle:        { fontSize: 11, fontWeight: '700' },
          })}
        >
          {TABS.map(t => (
            <Tab.Screen
              key={t.name}
              name={t.name}
              component={t.component}
              options={t.noHeader ? { headerShown: false } : {}}
            />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
