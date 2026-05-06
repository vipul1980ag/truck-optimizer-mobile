import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Linking, ScrollView,
} from 'react-native';
import { api, BASE_URL } from '../api';
import { C, shadow } from '../theme';

const PARKING_API = 'https://parking.dnw-ai.com';

function TruckPill({ truck, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[s.truckPill, selected && s.truckPillSel]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.truckPillTxt, selected && s.truckPillTxtSel]}>
        🚛 {truck.name}
      </Text>
      <Text style={[s.truckPillSub, selected && s.truckPillSubSel]}>
        {truck.height} ft tall
      </Text>
    </TouchableOpacity>
  );
}

function SpotCard({ spot, rank }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`;
  const distTxt = spot.distance < 1
    ? `${Math.round(spot.distance * 1000)} m`
    : `${spot.distance.toFixed(1)} km`;

  return (
    <View style={[s.spotCard, shadow]}>
      <View style={s.spotHead}>
        <View style={[s.rankBadge, spot.hgvDesignated && s.rankBadgeHgv]}>
          <Text style={[s.rankTxt, spot.hgvDesignated && s.rankTxtHgv]}>
            {spot.hgvDesignated ? '★' : rank}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.spotName} numberOfLines={1}>{spot.name}</Text>
          <Text style={s.spotAddr} numberOfLines={1}>{spot.address} · {distTxt}</Text>
        </View>
        <TouchableOpacity
          style={s.navBtn}
          onPress={() => Linking.openURL(mapsUrl)}
          activeOpacity={0.8}
        >
          <Text style={s.navBtnTxt}>🗺 Go</Text>
        </TouchableOpacity>
      </View>
      <View style={s.tagRow}>
        {spot.hgvDesignated && <View style={s.tagHgv}><Text style={s.tagHgvTxt}>HGV ✓</Text></View>}
        <View style={s.tagType}><Text style={s.tagTypeTxt}>{spot.type}</Text></View>
        {spot.costPerHour > 0
          ? <View style={s.tagPaid}><Text style={s.tagPaidTxt}>€{spot.costPerHour.toFixed(1)}/hr</Text></View>
          : <View style={s.tagFree}><Text style={s.tagFreeTxt}>Free</Text></View>}
        {spot.maxheight && (
          <View style={s.tagHeight}><Text style={s.tagHeightTxt}>Max {spot.maxheight} m</Text></View>
        )}
      </View>
    </View>
  );
}

export default function ParkingScreen() {
  const [trucks,       setTrucks]       = useState([]);
  const [selectedTruck,setSelectedTruck]= useState(null);
  const [location,     setLocation]     = useState('');
  const [spots,        setSpots]        = useState([]);
  const [status,       setStatus]       = useState('');
  const [loading,      setLoading]      = useState(false);

  const loadTrucks = useCallback(async () => {
    try {
      const data = await api.getData();
      setTrucks(data.trucks || []);
    } catch (_) {}
  }, []);

  useEffect(() => { loadTrucks(); }, [loadTrucks]);

  async function search() {
    if (!location.trim()) { setStatus('Please enter a location.'); return; }
    setLoading(true);
    setStatus('');
    setSpots([]);

    try {
      // Geocode
      setStatus('📍 Finding location…');
      const geoRes  = await fetch(`${BASE_URL}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: location.trim() }),
      });
      const geoData = await geoRes.json();
      if (!geoData?.length) { setStatus('Location not found. Try a different address.'); return; }
      const { lat, lng, label } = geoData[0];

      const vehicle   = selectedTruck ? 'truck' : 'car';
      const minHeight = selectedTruck ? selectedTruck.height : undefined;
      const radius    = selectedTruck ? 3000 : 800;

      setStatus(`🔍 Searching ${vehicle === 'truck' ? 'truck-suitable ' : ''}parking near ${label}…`);

      const params = new URLSearchParams({ lat, lng, radius, vehicle });
      if (minHeight) params.set('minHeight', String(minHeight));

      const parkRes  = await fetch(`${PARKING_API}/api/parkings/nearby?${params}`);
      const parkData = await parkRes.json();
      const data     = parkData.data || [];

      if (!data.length) {
        setStatus(`No ${vehicle === 'truck' ? 'truck-suitable ' : ''}parking found within ${radius / 1000} km.`);
      } else {
        setStatus(`Found ${data.length} spot${data.length > 1 ? 's' : ''} near ${label}`);
        setSpots(data.slice(0, 20));
      }
    } catch (e) {
      setStatus('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      {/* Truck selector */}
      <View style={s.truckSection}>
        <Text style={s.sectionLbl}>SELECT VEHICLE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.truckRow}>
          <TouchableOpacity
            style={[s.truckPill, !selectedTruck && s.truckPillSel]}
            onPress={() => setSelectedTruck(null)}
            activeOpacity={0.75}
          >
            <Text style={[s.truckPillTxt, !selectedTruck && s.truckPillTxtSel]}>🚗 Any vehicle</Text>
            <Text style={[s.truckPillSub, !selectedTruck && s.truckPillSubSel]}>Standard car</Text>
          </TouchableOpacity>
          {trucks.map(t => (
            <TruckPill
              key={t.id}
              truck={t}
              selected={selectedTruck?.id === t.id}
              onPress={() => setSelectedTruck(t)}
            />
          ))}
        </ScrollView>
        {selectedTruck && (
          <Text style={s.truckInfo}>
            Filtering for {selectedTruck.height} ft clearance · search radius 3 km
          </Text>
        )}
      </View>

      {/* Location input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.locInput}
          placeholder="Enter address, city or postcode…"
          placeholderTextColor={C.text3}
          value={location}
          onChangeText={setLocation}
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <TouchableOpacity
          style={[s.searchBtn, loading && s.searchBtnDis]}
          onPress={search}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.searchBtnTxt}>🔍</Text>}
        </TouchableOpacity>
      </View>

      {/* Status */}
      {!!status && <Text style={s.status}>{status}</Text>}

      {/* Results */}
      <FlatList
        data={spots}
        keyExtractor={sp => sp.id}
        renderItem={({ item, index }) => <SpotCard spot={item} rank={index + 1} />}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          !loading && !status ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🅿️</Text>
              <Text style={s.emptyTitle}>Find Parking</Text>
              <Text style={s.emptySub}>
                Select your truck above, enter a location,{'\n'}and we'll show the best spots nearby.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },

  truckSection: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, paddingTop: 12, paddingBottom: 8 },
  sectionLbl:   { fontSize: 10, fontWeight: '800', color: C.text3, letterSpacing: 0.5, marginHorizontal: 16, marginBottom: 8 },
  truckRow:     { paddingHorizontal: 16, gap: 8 },
  truckPill:    { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.surface2, alignItems: 'center' },
  truckPillSel: { borderColor: C.primary, backgroundColor: '#eff6ff' },
  truckPillTxt: { fontSize: 12, fontWeight: '700', color: C.text2 },
  truckPillTxtSel:{ color: C.primary },
  truckPillSub: { fontSize: 10, color: C.text3, marginTop: 1 },
  truckPillSubSel:{ color: C.primaryL },
  truckInfo:    { fontSize: 11, color: C.primary, marginHorizontal: 16, marginTop: 6, fontWeight: '600' },

  inputRow:   { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  locInput:   { flex: 1, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: C.text },
  searchBtn:  { backgroundColor: C.primary, borderRadius: 10, width: 44, alignItems: 'center', justifyContent: 'center' },
  searchBtnDis:{ opacity: 0.6 },
  searchBtnTxt:{ fontSize: 18 },

  status: { fontSize: 12, color: C.text2, textAlign: 'center', padding: 10, backgroundColor: C.surface2 },

  list: { padding: 12, gap: 10 },

  spotCard:   { backgroundColor: C.surface, borderRadius: 12, padding: 12 },
  spotHead:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankBadge:  { width: 30, height: 30, borderRadius: 15, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  rankBadgeHgv:{ backgroundColor: '#dcfce7' },
  rankTxt:    { fontSize: 12, fontWeight: '800', color: C.primary },
  rankTxtHgv: { color: '#16a34a' },
  spotName:   { fontSize: 13, fontWeight: '700', color: C.text },
  spotAddr:   { fontSize: 11, color: C.text3, marginTop: 1 },
  navBtn:     { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  navBtnTxt:  { fontSize: 11, fontWeight: '700', color: '#fff' },

  tagRow:     { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 8 },
  tagHgv:     { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagHgvTxt:  { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  tagType:    { backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagTypeTxt: { fontSize: 10, fontWeight: '700', color: '#1d4ed8' },
  tagFree:    { backgroundColor: '#f0fdf4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagFreeTxt: { fontSize: 10, fontWeight: '700', color: '#15803d' },
  tagPaid:    { backgroundColor: '#fff7ed', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagPaidTxt: { fontSize: 10, fontWeight: '700', color: '#c2410c' },
  tagHeight:  { backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagHeightTxt:{ fontSize: 10, fontWeight: '700', color: '#b45309' },

  emptyWrap:  { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: C.text3, textAlign: 'center', lineHeight: 20 },
});
