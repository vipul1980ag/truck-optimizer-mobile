import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

function minsToHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const LEAFLET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
  #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  map.setView([20, 0], 2);

  var routeLayer = null;
  var startMarker = null;
  var endMarker = null;

  function drawRoute(data) {
    if (routeLayer)   { map.removeLayer(routeLayer); routeLayer = null; }
    if (startMarker)  { map.removeLayer(startMarker); startMarker = null; }
    if (endMarker)    { map.removeLayer(endMarker); endMarker = null; }

    routeLayer = L.geoJSON(data.geometry, {
      style: { color: '#2563eb', weight: 4, opacity: 0.85 }
    }).addTo(map);

    startMarker = L.marker([data.start.lat, data.start.lng])
      .bindPopup('📍 Start').addTo(map);
    endMarker = L.marker([data.end.lat, data.end.lng])
      .bindPopup('🏁 Destination').addTo(map);

    map.fitBounds(routeLayer.getBounds(), { padding: [20, 20] });
  }

  function handleMessage(e) {
    try { drawRoute(JSON.parse(e.data)); } catch(_) {}
  }
  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
</script>
</body>
</html>`;

export default function RouteScreen({ navigation }) {
  const {
    startLocation, destLocation,
    selectedRoute, setSelectedRoute,
    items,
  } = useWizard();

  const webViewRef = useRef(null);
  const [routes,      setRoutes]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tollLoading, setTollLoading] = useState(false);
  const [error,       setError]       = useState(null);

  // Determine vehicle type from first available truck (fetched from API)
  const [vehicleType, setVehicleType] = useState('2AxlesTruck');

  useEffect(() => {
    api.getData()
      .then(d => {
        const truck = (d.trucks || [])[0];
        if (truck && truck.maxWt > 26000) setVehicleType('5AxlesTruck');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!startLocation || !destLocation) return;
    setLoading(true);
    setError(null);
    api.getRoutes(startLocation, destLocation)
      .then(r => {
        setRoutes(r);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Could not find routes between these locations.');
        setLoading(false);
      });
  }, [startLocation, destLocation]);

  // Draw selected route on map
  useEffect(() => {
    if (!selectedRoute || !webViewRef.current) return;
    const msg = JSON.stringify({
      geometry: selectedRoute.geometry,
      start:    startLocation,
      end:      destLocation,
    });
    webViewRef.current.injectJavaScript(`
      (function() {
        try { handleMessage({ data: ${JSON.stringify(msg)} }); } catch(e) {}
      })();
      true;
    `);
  }, [selectedRoute]);

  async function selectRoute(route) {
    setTollLoading(true);
    setSelectedRoute({ ...route, toll_cost: 0 });
    try {
      const tollData = await api.getTolls(route.geometry, vehicleType);
      setSelectedRoute({ ...route, toll_cost: tollData.toll_cost || 0 });
    } catch (_) {
      setSelectedRoute({ ...route, toll_cost: 0 });
    } finally {
      setTollLoading(false);
    }
  }

  // Clear route on back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setSelectedRoute(null);
    });
    return unsubscribe;
  }, [navigation]);

  const canConfirm = !!(selectedRoute && !tollLoading);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ marginTop: 12, color: C.text2, fontSize: 14 }}>Finding routes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, padding: 24 }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>🗺️</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 }}>No Routes Found</Text>
        <Text style={{ fontSize: 13, color: C.text2, textAlign: 'center', marginBottom: 24 }}>{error}</Text>
        <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>

        <Text style={s.heading}>🗺️ Select a Route</Text>
        <Text style={s.sub}>
          {startLocation?.label?.split(',')[0]} → {destLocation?.label?.split(',')[0]}
        </Text>

        {routes.map((route, idx) => {
          const isSelected = selectedRoute?.index === route.index;
          return (
            <TouchableOpacity
              key={idx}
              style={[s.routeCard, isSelected && s.routeCardSelected]}
              onPress={() => selectRoute(route)}
              activeOpacity={0.8}
            >
              <View style={s.routeCardLeft}>
                <Text style={[s.routeLabel, isSelected && s.routeLabelSelected]}>
                  Route {idx + 1}
                </Text>
                {isSelected && <Text style={s.routeSelectedBadge}>✓ Selected</Text>}
              </View>
              <View style={s.routeCardRight}>
                <Text style={[s.routeDist, isSelected && s.routeDistSelected]}>
                  {route.distance_km} km
                </Text>
                <Text style={s.routeDur}>{minsToHM(route.duration_min)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Map */}
        <View style={s.mapWrap}>
          <WebView
            ref={webViewRef}
            source={{ html: LEAFLET_HTML }}
            style={s.map}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            scrollEnabled={false}
          />
        </View>

        {/* Toll info */}
        {selectedRoute && (
          <View style={s.tollCard}>
            {tollLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={C.primary} />
                <Text style={s.tollTxt}>Calculating toll costs...</Text>
              </View>
            ) : (
              <>
                <Text style={s.tollLabel}>🚦 Estimated Toll Cost</Text>
                <Text style={s.tollAmt}>
                  {selectedRoute.toll_cost > 0
                    ? `$${selectedRoute.toll_cost.toFixed(2)}`
                    : 'No toll data available'}
                </Text>
              </>
            )}
          </View>
        )}

      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.confirmBtn, !canConfirm && s.confirmBtnDisabled]}
          onPress={() => canConfirm && navigation.navigate('Charges')}
          disabled={!canConfirm}
        >
          <Text style={s.confirmTxt}>Confirm Route & See Charges →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 8 },

  heading: { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 2 },
  sub:     { fontSize: 12, color: C.text2, marginBottom: 16, lineHeight: 17 },

  routeCard: {
    backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 2, borderColor: C.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  routeCardSelected: { borderColor: C.primary, backgroundColor: '#f0f7ff' },

  routeCardLeft:  { flex: 1 },
  routeCardRight: { alignItems: 'flex-end' },

  routeLabel:         { fontSize: 15, fontWeight: '800', color: C.text },
  routeLabelSelected: { color: C.primary },
  routeSelectedBadge: { fontSize: 11, color: C.primary, fontWeight: '700', marginTop: 2 },

  routeDist:         { fontSize: 18, fontWeight: '900', color: C.text },
  routeDistSelected: { color: C.primary },
  routeDur:          { fontSize: 12, color: C.text2, marginTop: 2 },

  mapWrap: { borderRadius: 14, overflow: 'hidden', height: 260, marginVertical: 12, borderWidth: 1, borderColor: C.border },
  map:     { flex: 1 },

  tollCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tollLabel: { fontSize: 13, color: C.text2, fontWeight: '700' },
  tollTxt:   { fontSize: 13, color: C.text2 },
  tollAmt:   { fontSize: 16, fontWeight: '900', color: C.primary },

  footer:     { padding: 12, paddingHorizontal: 16, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  confirmBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#cbd5e1' },
  confirmTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
