import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { api } from '../api';
import { C } from '../theme';

export default function FleetScreen() {
  const [data,      setData]      = useState(null);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async () => {
    try { setData(await api.getData()); } catch (_) {}
  }, []);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!data) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;
  const { trucks = [], carriers = [] } = data;

  return (
    <ScrollView
      style={s.bg}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {/* Own Fleet */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>🚛 Own Fleet</Text>
        <View style={s.countPill}>
          <Text style={s.countTxt}>{trucks.length}</Text>
        </View>
      </View>

      {trucks.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyIcon}>🚛</Text>
          <Text style={s.emptyTitle}>No trucks configured</Text>
          <Text style={s.emptyHint}>Add trucks in the web Advanced Settings.</Text>
        </View>
      ) : (
        trucks.map(t => (
          <View key={t.id} style={s.truckCard}>
            <View style={s.truckHead}>
              <Text style={s.truckIcon}>🚛</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.truckName}>{t.name}</Text>
                <Text style={s.truckDims}>{t.length} × {t.width} × {t.height} ft</Text>
              </View>
              <View style={s.maxWtBadge}>
                <Text style={s.maxWtTxt}>{(t.maxWt || 0).toLocaleString()} lbs</Text>
              </View>
            </View>
            {(t.baseRate > 0 || t.ratePerMi > 0) && (
              <View style={s.rateRow}>
                <View style={s.ratePill}>
                  <Text style={s.rateLbl}>Base Rate</Text>
                  <Text style={s.rateVal}>${t.baseRate}</Text>
                </View>
                <View style={s.ratePill}>
                  <Text style={s.rateLbl}>Per Mile</Text>
                  <Text style={s.rateVal}>${t.ratePerMi}</Text>
                </View>
              </View>
            )}
          </View>
        ))
      )}

      {/* Carriers */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>🏢 External Carriers</Text>
        <View style={s.countPill}>
          <Text style={s.countTxt}>{carriers.length}</Text>
        </View>
      </View>

      {carriers.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyIcon}>🏢</Text>
          <Text style={s.emptyTitle}>No carriers configured</Text>
          <Text style={s.emptyHint}>Add carriers in the web Advanced Settings.</Text>
        </View>
      ) : (
        carriers.map(car => (
          <View key={car.id} style={s.carrierCard}>
            <View style={s.carrierHead}>
              <Text style={s.carrierIcon}>🏢</Text>
              <Text style={s.carrierName}>{car.name}</Text>
              <View style={s.countPill}>
                <Text style={s.countTxt}>{(car.trucks || []).length} trucks</Text>
              </View>
            </View>
            {(car.trucks || []).map(ct => (
              <View key={ct.tid} style={s.ctRow}>
                <View style={s.ctLeft}>
                  <Text style={s.ctName}>{ct.name}</Text>
                  <Text style={s.ctDims}>{ct.length} × {ct.width} × {ct.height} ft  ·  {(ct.maxWt || 0).toLocaleString()} lbs</Text>
                </View>
                <View style={s.ctRates}>
                  <Text style={s.ctRate}>${ct.baseRate} base</Text>
                  <Text style={s.ctRate}>${ct.ratePerMi}/mi</Text>
                </View>
              </View>
            ))}
          </View>
        ))
      )}

      <View style={{ height: 36 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Section */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 18, marginBottom: 10 },
  sectionTitle:  { fontSize: 13, fontWeight: '800', color: C.text, flex: 1 },
  countPill:     { backgroundColor: C.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  countTxt:      { fontSize: 11, fontWeight: '700', color: C.text2 },

  /* Truck card */
  truckCard: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginHorizontal: 14, marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  truckHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderColor: C.border },
  truckIcon: { fontSize: 24 },
  truckName: { fontSize: 15, fontWeight: '800', color: C.text },
  truckDims: { fontSize: 11, color: C.text2, marginTop: 2 },
  maxWtBadge:{ backgroundColor: 'rgba(37,99,235,0.07)', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(37,99,235,0.15)' },
  maxWtTxt:  { fontSize: 11, fontWeight: '800', color: C.primary },
  rateRow:   { flexDirection: 'row', gap: 10, padding: 12 },
  ratePill:  { flex: 1, backgroundColor: C.surface2, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  rateLbl:   { fontSize: 9, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4 },
  rateVal:   { fontSize: 15, fontWeight: '900', color: C.primary, marginTop: 3 },

  /* Carrier card */
  carrierCard: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginHorizontal: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  carrierHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: C.navy },
  carrierIcon: { fontSize: 20 },
  carrierName: { fontSize: 15, fontWeight: '900', color: '#f1f5f9', flex: 1 },
  ctRow:    { padding: 12, borderTopWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ctLeft:   { flex: 1 },
  ctName:   { fontSize: 13, fontWeight: '700', color: C.text },
  ctDims:   { fontSize: 11, color: C.text2, marginTop: 2 },
  ctRates:  { gap: 3, alignItems: 'flex-end' },
  ctRate:   { fontSize: 11, fontWeight: '700', color: C.primary, backgroundColor: 'rgba(37,99,235,0.06)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },

  /* Empty */
  emptyBox:   { alignItems: 'center', padding: 36, backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 4 },
  emptyHint:  { fontSize: 12, color: C.text2, textAlign: 'center' },
});
