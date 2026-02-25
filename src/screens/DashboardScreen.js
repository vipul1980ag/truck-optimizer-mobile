import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { api } from '../api';
import { C, PAY_LABEL, PAY_COLOR, PAY_BG } from '../theme';

function StatCard({ num, label, color }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statNum, color && { color }]}>{num}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [data,      setData]      = useState(null);
  const [error,     setError]     = useState(null);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await api.getData());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!data && !error) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={s.errTitle}>Cannot reach server</Text>
        <Text style={s.errSub}>{error}</Text>
        <Text style={s.errHint}>
          Cannot connect to the server. Please check your internet connection and try again.
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryBtnTxt}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { trucks = [], carriers = [], customers = [], items = [] } = data;
  const totalUnits    = items.reduce((s, i) => s + (i.qty || 1), 0);
  const totalInvoiced = customers.reduce((s, c) => s + (c.invoiceAmount || 0), 0);
  const totalPaid     = customers.filter(c => c.paymentStatus === 'paid')
                                 .reduce((s, c) => s + (c.invoiceAmount || 0), 0);
  const outstanding   = totalInvoiced - totalPaid;

  return (
    <ScrollView style={s.bg} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>🚛 Load Optimizer</Text>
        <Text style={s.heroSub}>Pull down to refresh · Tap Optimize tab to run load plan</Text>
      </View>

      <View style={s.statsGrid}>
        <StatCard num={trucks.length}    label="Own Trucks"  />
        <StatCard num={carriers.length}  label="Carriers"    />
        <StatCard num={customers.length} label="Customers"   />
        <StatCard num={totalUnits}       label="Cargo Units" color={C.primary} />
      </View>

      <Text style={s.sectionTitle}>💰 Payment Summary</Text>
      <View style={s.payRow}>
        <View style={[s.payCard, { borderColor: '#bbf7d0' }]}>
          <Text style={[s.payNum, { color: C.success }]}>${totalPaid.toLocaleString()}</Text>
          <Text style={s.payLbl}>Collected</Text>
        </View>
        <View style={[s.payCard, { borderColor: '#fed7aa' }]}>
          <Text style={[s.payNum, { color: C.warning }]}>${outstanding.toLocaleString()}</Text>
          <Text style={s.payLbl}>Outstanding</Text>
        </View>
        <View style={[s.payCard, { borderColor: C.border }]}>
          <Text style={[s.payNum, { color: C.text }]}>${totalInvoiced.toLocaleString()}</Text>
          <Text style={s.payLbl}>Total Invoiced</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>👥 Customer Status</Text>
      {customers.length === 0
        ? <Text style={s.empty}>No customers yet.</Text>
        : customers.map(c => {
            const ps = c.paymentStatus || 'pending';
            return (
              <View key={c.id} style={s.custCard}>
                <View style={[s.dot, { backgroundColor: c.color || '#888' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.custName}>{c.name}</Text>
                  <Text style={s.custMeta}>Stop {c.stop} · {c.zone || '—'}{c.distance ? ` · ${c.distance} mi` : ''}</Text>
                  {c.invoiceAmount > 0 && (
                    <Text style={s.custInv}>${Number(c.invoiceAmount).toLocaleString()} invoice</Text>
                  )}
                </View>
                <View style={[s.badge, { backgroundColor: PAY_BG[ps] }]}>
                  <Text style={[s.badgeTxt, { color: PAY_COLOR[ps] }]}>{PAY_LABEL[ps]}</Text>
                </View>
              </View>
            );
          })
      }
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: C.bg },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errTitle:   { fontSize: 18, fontWeight: '800', color: C.danger, marginBottom: 8, textAlign: 'center' },
  errSub:     { fontSize: 13, color: C.text2, textAlign: 'center', marginBottom: 12 },
  errHint:    { fontSize: 12, color: C.text2, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16, lineHeight: 18 },
  retryBtn:   { backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 8 },
  retryBtnTxt:{ color: '#fff', fontWeight: '800', fontSize: 15 },
  hero:       { backgroundColor: C.navy, padding: 20 },
  heroTitle:  { fontSize: 24, fontWeight: '900', color: '#f1f5f9' },
  heroSub:    { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },
  statCard:   { flex: 1, minWidth: '46%', backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center', elevation: 1 },
  statNum:    { fontSize: 30, fontWeight: '900', color: C.text },
  statLbl:    { fontSize: 10, color: C.text2, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' },
  sectionTitle:{ fontSize: 12, fontWeight: '800', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 12, marginTop: 8, marginBottom: 8 },
  payRow:     { flexDirection: 'row', gap: 8, marginHorizontal: 12, marginBottom: 4 },
  payCard:    { flex: 1, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: 'center' },
  payNum:     { fontSize: 17, fontWeight: '900' },
  payLbl:     { fontSize: 9, color: C.text2, marginTop: 3, textTransform: 'uppercase', fontWeight: '700', textAlign: 'center' },
  custCard:   { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, marginHorizontal: 12, marginBottom: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot:        { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  custName:   { fontSize: 13, fontWeight: '700', color: C.text },
  custMeta:   { fontSize: 11, color: C.text2, marginTop: 2 },
  custInv:    { fontSize: 11, fontWeight: '700', color: C.primary, marginTop: 2 },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  badgeTxt:   { fontSize: 10, fontWeight: '700' },
  empty:      { fontSize: 13, color: C.text2, textAlign: 'center', padding: 20 },
});
