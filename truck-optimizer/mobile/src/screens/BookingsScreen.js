import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { api } from '../api';
import { C, shadow } from '../theme';
import { useFocusEffect } from '@react-navigation/native';

const STATUS = {
  active:    { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Active',    dot: '#4ade80' },
  completed: { color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Completed', dot: '#60a5fa' },
  cancelled: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Cancelled', dot: '#f87171' },
};

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
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingTxt}>Loading bookings…</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const truck    = trucks.find(t => t.id === item.truckId);
    const truckVol = truck ? truck.length * truck.width * truck.height : 0;
    const loadPct  = truckVol > 0 ? Math.min((item.totalVol || 0) / truckVol, 1) : 0;
    const wtPct    = truck ? Math.min((item.totalWeight || 0) / truck.maxWt, 1) : 0;
    const statusKey = item.status || 'active';
    const st        = STATUS[statusKey] || STATUS.active;
    const date      = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    return (
      <View style={s.card}>
        {/* Colored top accent bar */}
        <View style={[s.cardAccent, { backgroundColor: st.color }]} />

        {/* Header */}
        <View style={s.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.truckName}>
              {truck ? truck.name : 'Unknown Truck'}
              {truck?.licensePlate ? `  ·  ${truck.licensePlate}` : ''}
            </Text>
            <Text style={s.cardDate}>{date}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <View style={[s.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {/* Route */}
        {item.route && (
          <View style={s.routeRow}>
            <View style={s.routeEndpoint}>
              <View style={[s.routeDotFrom, { backgroundColor: C.primary }]} />
              <Text style={s.routeLabel} numberOfLines={1}>{item.route.fromLabel || '—'}</Text>
            </View>
            <View style={s.routeLine}>
              <View style={s.routeLineDash} />
              <Text style={s.routeArrow}>→</Text>
            </View>
            <View style={[s.routeEndpoint, { alignItems: 'flex-end' }]}>
              <View style={[s.routeDotFrom, { backgroundColor: C.success }]} />
              <Text style={[s.routeLabel, { textAlign: 'right' }]} numberOfLines={1}>{item.route.toLabel || '—'}</Text>
            </View>
          </View>
        )}
        {item.route?.distance_km > 0 && (
          <View style={s.routeMeta}>
            <Text style={s.routeMetaTxt}>
              📍 {item.route.distance_km.toFixed(0)} km  ·  {item.shippingOption === 'shared' ? 'LTL — Shared' : 'FTL — Full Load'}
            </Text>
          </View>
        )}

        {/* Load bars */}
        {truck && (
          <View style={s.loadSection}>
            <View style={s.loadRow}>
              <Text style={s.loadLbl}>Volume</Text>
              <View style={s.barWrap}>
                <View style={[
                  s.bar,
                  { width: `${Math.round(loadPct * 100)}%` },
                  { backgroundColor: loadPct > 0.85 ? C.danger : C.primary },
                ]} />
              </View>
              <Text style={[s.loadPct, { color: loadPct > 0.85 ? C.danger : C.text2 }]}>
                {Math.round(loadPct * 100)}%
              </Text>
            </View>
            <View style={s.loadRow}>
              <Text style={s.loadLbl}>Weight</Text>
              <View style={s.barWrap}>
                <View style={[
                  s.bar,
                  { width: `${Math.round(wtPct * 100)}%` },
                  { backgroundColor: wtPct > 0.85 ? C.danger : C.success },
                ]} />
              </View>
              <Text style={[s.loadPct, { color: wtPct > 0.85 ? C.danger : C.text2 }]}>
                {Math.round(wtPct * 100)}%
              </Text>
            </View>
          </View>
        )}

        {/* Cancel */}
        {statusKey === 'active' && (
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primaryL} />}
      ListEmptyComponent={
        <View style={s.empty}>
          <View style={s.emptyIconWrap}>
            <Text style={s.emptyIcon}>📋</Text>
          </View>
          <Text style={s.emptyTitle}>No bookings yet</Text>
          <Text style={s.emptyHint}>Confirmed bookings will appear here.</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: C.bg },
  list:   { padding: 14, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  loadingTxt: { marginTop: 14, fontSize: 13, color: C.text2, fontWeight: '600' },

  /* Card */
  card: {
    backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border,
    marginBottom: 14, overflow: 'hidden',
    ...shadow.sm,
  },
  cardAccent: { height: 4 },
  cardHead:   { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  truckName:  { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 3 },
  cardDate:   { fontSize: 11, color: C.text2, fontWeight: '600' },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, marginLeft: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, fontWeight: '800' },

  /* Route */
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 6, gap: 8 },
  routeEndpoint: { flex: 1 },
  routeDotFrom:  { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  routeLabel:    { fontSize: 12, fontWeight: '700', color: C.text },
  routeLine:     { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  routeLineDash: { height: 1, width: 20, backgroundColor: C.border },
  routeArrow:    { fontSize: 11, color: C.text3, marginTop: 2 },
  routeMeta:     { paddingHorizontal: 16, marginBottom: 10 },
  routeMetaTxt:  { fontSize: 11, color: C.text2, fontWeight: '600' },

  /* Load bars */
  loadSection: {
    paddingHorizontal: 16, paddingBottom: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 10,
  },
  loadRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadLbl:  {
    fontSize: 10, fontWeight: '800', color: C.text3,
    width: 48, textTransform: 'uppercase', letterSpacing: 0.3,
  },
  barWrap: {
    flex: 1, height: 7, backgroundColor: C.surface3,
    borderRadius: 4, overflow: 'hidden',
  },
  bar:     { height: '100%', borderRadius: 4 },
  loadPct: { fontSize: 10, fontWeight: '800', width: 30, textAlign: 'right' },

  /* Cancel */
  cancelBtn: {
    margin: 14, marginTop: 4,
    borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#fff5f5',
  },
  cancelTxt: { fontSize: 12, fontWeight: '800', color: C.danger },

  /* Empty */
  empty:       { alignItems: 'center', paddingVertical: 72 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...shadow.sm,
  },
  emptyIcon:  { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: C.text, marginBottom: 6 },
  emptyHint:  { fontSize: 12, color: C.text2 },
});
