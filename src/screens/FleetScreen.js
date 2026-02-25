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
    <ScrollView style={s.bg} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      <Text style={s.sectionTitle}>{'\uD83D\uDE9B'} Own Fleet</Text>
      {trucks.length === 0
        ? <Text style={s.empty}>No trucks. Add them in the web Advanced Settings.</Text>
        : trucks.map(t => (
            <View key={t.id} style={s.card}>
              <Text style={s.cardTitle}>{t.name}</Text>
              <Text style={s.cardMeta}>{t.length} x {t.width} x {t.height} ft</Text>
              <Text style={s.cardMeta}>Max weight: {(t.maxWt || 0).toLocaleString()} lbs</Text>
              {(t.baseRate > 0 || t.ratePerMi > 0) && (
                <View style={s.rateRow}>
                  <View style={s.ratePill}><Text style={s.rateTxt}>${t.baseRate} base</Text></View>
                  <View style={s.ratePill}><Text style={s.rateTxt}>${t.ratePerMi}/mi</Text></View>
                </View>
              )}
            </View>
          ))
      }

      <Text style={s.sectionTitle}>{'\uD83C\uDFE2'} Carriers</Text>
      {carriers.length === 0
        ? <Text style={s.empty}>No carriers. Add them in the web Advanced Settings.</Text>
        : carriers.map(car => (
            <View key={car.id} style={s.carrierCard}>
              <Text style={s.carrierName}>{car.name}</Text>
              {(car.trucks || []).map(ct => (
                <View key={ct.tid} style={s.ctRow}>
                  <Text style={s.ctName}>{ct.name}</Text>
                  <Text style={s.cardMeta}>{ct.length} x {ct.width} x {ct.height} ft {'\u00b7'} {(ct.maxWt || 0).toLocaleString()} lbs</Text>
                  <View style={s.rateRow}>
                    <View style={s.ratePill}><Text style={s.rateTxt}>${ct.baseRate} base</Text></View>
                    <View style={s.ratePill}><Text style={s.rateTxt}>${ct.ratePerMi}/mi</Text></View>
                  </View>
                </View>
              ))}
            </View>
          ))
      }
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:           { flex: 1, backgroundColor: C.bg },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 12, marginTop: 12, marginBottom: 8 },
  card:         { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginHorizontal: 12, marginBottom: 8 },
  cardTitle:    { fontSize: 15, fontWeight: '800', color: C.text },
  cardMeta:     { fontSize: 12, color: C.text2, marginTop: 3 },
  rateRow:      { flexDirection: 'row', gap: 6, marginTop: 8 },
  ratePill:     { backgroundColor: 'rgba(37,99,235,0.08)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  rateTxt:      { fontSize: 11, fontWeight: '700', color: C.primary },
  carrierCard:  { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginHorizontal: 12, marginBottom: 8 },
  carrierName:  { fontSize: 15, fontWeight: '800', color: '#f1f5f9', backgroundColor: C.navy, padding: 12 },
  ctRow:        { padding: 12, borderTopWidth: 1, borderColor: C.border },
  ctName:       { fontSize: 13, fontWeight: '700', color: C.text },
  empty:        { fontSize: 12, color: C.text2, textAlign: 'center', padding: 20 },
});
