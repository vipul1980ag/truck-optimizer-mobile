import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../api';
import { C } from '../theme';

export default function PaymentWebViewScreen({ route, navigation }) {
  const { customer } = route.params;
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const onMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'paid') {
        Alert.alert(
          '\u2705 Payment Successful!',
          `${customer.name}\nCapture ID: ${msg.captureId || '\u2014'}`,
          [{ text: 'Done', onPress: () => navigation.goBack() }],
        );
      } else if (msg.type === 'cancelled') {
        Alert.alert('Cancelled', 'Payment was cancelled.');
      }
    } catch (_) {}
  };

  return (
    <View style={s.container}>
      <WebView
        ref={webRef}
        source={{ uri: `${BASE_URL}/pay/${customer.id}` }}
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />
      {loading && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingTxt}>Loading PayPal...</Text>
        </View>
      )}
      {error && (
        <View style={s.overlay}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>{'\u26a0\ufe0f'}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.danger }}>Could not load payment page</Text>
          <Text style={{ fontSize: 13, color: C.text2, marginTop: 8, textAlign: 'center' }}>
            Make sure the server is running and BASE_URL is correct in src/api.js
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingTxt: { fontSize: 14, color: C.text2, marginTop: 12 },
});
