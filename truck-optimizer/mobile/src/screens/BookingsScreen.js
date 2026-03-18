import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { api } from '../api';
import { C } from '../theme';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_COLOR = { active: '#16a34a', completed: '#2563eb', cancelled: '#dc2626' };
const STATUS_BG    = { active: '#dcfce7', completed: '#dbeafe', cancelled: '#fee2e2' };
const STATUS_LABEL = { active: 'Active',  completed: 'Completed', cancelled: 'Cancelled' };

export default function BookingsScreen() {
  const [bookings,   setBookings]   = useState([]);
  const [trucks,     setTrucks]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bs, data] = await Promise.all([
        fetch(`${require('../api').BASE_URL}/api/bookings`).then(r => r.json()),
        api.getData(),
      ]);
      setBookings(Array.isArray(bs) ? bs : []);
      setTrucks(data.trucks || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const cancelBooking = (id) => {
    Alert.alert('Cancel Booking', 'Mark this booking as cancelled?', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: async () => {
        try {
          await fetch(`${require('../api').BASE_URL}/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
          });
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const renderItem = ({ item }) => {
    const truck    = trucks.find(t => t.id === item.truckId);
    const truckVol = truck ? truck.length * truck.width * truck.height : 0;
    const loadPct  = truckVol > 0 ? Math.min((item.totalVol || 0) / truckVol, 1) : 0;
    const wtPct    = truck ? Math.min((item.totalWeight || 0) / truck.maxWt, 1) : 0;
    const status   = item.status || 'active';
    const date     = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

    return (
      <View style={s.card}>
        {/* Header */}
        <View style={s.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.truckName}>
              {truck ? truck.name : 'Unknown Truck'}
              {truck?.licensePlate ? `  ·  ${truck.licensePlate}` : ''}
            </Text>
            <Text style={s.cardDate}>{date}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: STATUS_BG[status] }]}>
            <Text style={[s.statusTxt, { color: STATUS_COLOR[status] }]}>
              {STATUS_LABEL[status] || status}
            </Text>
          </View>
        </View>

        {/* Route */}
        {item.route && (
          <View style={s.routeRow}>
            <Text style={s.routeFrom} numberOfLines={1}>{item.route.fromLabel || '—'}</Text>
            <Text style={s.routeArrow}>→</Text>
            <Text style={s.routeTo} numberOfLines={1}>{item.route.toLabel || '—'}</Text>
          </View>
        )}
        {item.route?.distance_km > 0 && (
          <Text style={s.routeDist}>{item.route.distance_km.toFixed(0)} km  ·  {item.shippingOption === 'shared' ? 'LTL' : 'FTL'}</Text>
        )}

        {/* Load bars */}
        {truck && (
          <View style={s.loadSection}>
            <View style={s.loadRow}>
              <Text style={s.loadLbl}>Volume</Text>
              <View style={s.barWrap}>
                <View style={[s.bar, { width: `${Math.round(loadPct * 100)}%`, backgroundColor: loadPct > 0.85 ? C.danger : C.primary }]} />
              </View>
              <Text style={s.loadPct}>{Math.round(loadPct * 100)}%</Text>
            </View>
            <View style={s.loadRow}>
              <Text style={s.loadLbl}>Weight</Text>
              <View style={s.barWrap}>
                <View style={[s.bar, { width: `${Math.round(wtPct * 100)}%`, backgroundColor: wtPct > 0.85 ? C.danger : C.success }]} />
              </View>
              <Text style={s.loadPct}>{Math.round(wtPct * 100)}%</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        {status === 'active' && (
          <TouchableOpacity style={s.cancelBtn} onPress={() => cancelBooking(item.id)}>
            <Text style={s.cancelTxt}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={s.bg}
      data={bookings}
      keyExtractor={b => String(b.id)}
      renderItem={renderItem}
      contentContainerStyle={s.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>No bookings yet</Text>
          <Text style={s.emptyHint}>Confirmed bookings will appear here.</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: C.bg },
  list:   { padding: 14, paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardHead:  { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  truckName: { fontSize: 14, fontWeight: '900', color: C.text, marginBottom: 2 },
  cardDate:  { fontSize: 11, color: C.text2 },

  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  statusTxt:   { fontSize: 11, fontWeight: '800' },

  routeRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, marginBottom: 2 },
  routeFrom: { fontSize: 12, fontWeight: '700', color: C.text, flex: 1 },
  routeArrow:{ fontSize: 12, color: C.text2 },
  routeTo:   { fontSize: 12, fontWeight: '700', color: C.text, flex: 1, textAlign: 'right' },
  routeDist: { fontSize: 11, color: C.text2, paddingHorizontal: 14, marginBottom: 10 },

  loadSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  loadRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadLbl:     { fontSize: 10, fontWeight: '700', color: C.text2, width: 46, textTransform: 'uppercase' },
  barWrap:     { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  bar:         { height: '100%', borderRadius: 3 },
  loadPct:     { fontSize: 10, fontWeight: '800', color: C.text2, width: 28, textAlign: 'right' },

  cancelBtn:  { margin: 12, marginTop: 4, borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  cancelTxt:  { fontSize: 12, fontWeight: '700', color: C.danger },

  empty:      { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptyHint:  { fontSize: 12, color: C.text2 },
});
