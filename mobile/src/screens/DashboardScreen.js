import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { api } from '../api';
import { C, PAY_LABEL, PAY_COLOR, PAY_BG } from '../theme';

function StatCard({ num, label, color, icon }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statNum, color && { color }]}>{num}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [data,       setData]       = useState(null);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
        <Text style={{ fontSize: 48, marginBottom: 14 }}>⚠️</Text>
        <Text style={s.errTitle}>Cannot reach server</Text>
        <Text style={s.errSub}>{error}</Text>
        <Text style={s.errHint}>Check your internet connection and try again.</Text>
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
    <ScrollView
      style={s.bg}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeTxt}>LIVE DATA</Text>
        </View>
        <Text style={s.heroTitle}>🚛 Load Optimizer</Text>
        <Text style={s.heroSub}>Pull to refresh  ·  Tap Optimize tab to run load plan</Text>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        <StatCard num={trucks.length}    label="Own Trucks"   icon="🚛" />
        <StatCard num={carriers.length}  label="Carriers"     icon="🏢" />
        <StatCard num={customers.length} label="Customers"    icon="👥" />
        <StatCard num={totalUnits}       label="Cargo Units"  icon="📦" color={C.primary} />
      </View>

      {/* Payment Summary */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>💰 Payment Summary</Text>
      </View>
      <View style={s.payRow}>
        <View style={[s.payCard, s.payCardGreen]}>
          <Text style={s.payIcon}>✅</Text>
          <Text style={[s.payNum, { color: C.success }]}>${totalPaid.toLocaleString()}</Text>
          <Text style={s.payLbl}>Collected</Text>
        </View>
        <View style={[s.payCard, s.payCardOrange]}>
          <Text style={s.payIcon}>⏳</Text>
          <Text style={[s.payNum, { color: C.warning }]}>${outstanding.toLocaleString()}</Text>
          <Text style={s.payLbl}>Outstanding</Text>
        </View>
        <View style={[s.payCard, s.payCardBlue]}>
          <Text style={s.payIcon}>📄</Text>
          <Text style={[s.payNum, { color: C.primary }]}>${totalInvoiced.toLocaleString()}</Text>
          <Text style={s.payLbl}>Total Invoiced</Text>
        </View>
      </View>

      {/* Customer Status */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>👥 Customer Status</Text>
        <Text style={s.sectionCount}>{customers.length} total</Text>
      </View>

      {customers.length === 0
        ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTxt}>No customers yet.</Text>
          </View>
        )
        : customers.map(c => {
            const ps = c.paymentStatus || 'pending';
            return (
              <View key={c.id} style={s.custCard}>
                <View style={[s.colorBar, { backgroundColor: c.color || '#888' }]} />
                <View style={s.custBody}>
                  <View style={s.custRow}>
                    <Text style={s.custName}>{c.name}</Text>
                    <View style={[s.badge, { backgroundColor: PAY_BG[ps] }]}>
                      <Text style={[s.badgeTxt, { color: PAY_COLOR[ps] }]}>{PAY_LABEL[ps]}</Text>
                    </View>
                  </View>
                  <Text style={s.custMeta}>
                    Stop {c.stop}  ·  {c.zone || '—'}{c.distance ? `  ·  ${c.distance} mi` : ''}
                  </Text>
                  {c.invoiceAmount > 0 && (
                    <Text style={s.custInv}>${Number(c.invoiceAmount).toLocaleString()}</Text>
                  )}
                </View>
              </View>
            );
          })
      }
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:          { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errTitle:    { fontSize: 18, fontWeight: '800', color: C.danger, marginBottom: 8, textAlign: 'center' },
  errSub:      { fontSize: 13, color: C.text2, textAlign: 'center', marginBottom: 8 },
  errHint:     { fontSize: 12, color: C.text2, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16, lineHeight: 18 },
  retryBtn:    { backgroundColor: C.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, elevation: 3 },
  retryBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },

  /* Hero */
  hero:      {
    backgroundColor: C.navy, padding: 22, paddingTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  heroBadge:    { flexDirection: 'row', marginBottom: 10 },
  heroBadgeTxt: {
    fontSize: 9, fontWeight: '800', color: '#60a5fa', letterSpacing: 1.2,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.5 },
  heroSub:   { fontSize: 12, color: '#64748b', marginTop: 5, lineHeight: 18 },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingTop: 14, gap: 8 },
  statCard: {
    flex: 1, minWidth: '46%', backgroundColor: C.surface,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIcon:  { fontSize: 22, marginBottom: 8 },
  statNum:   { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5, lineHeight: 32 },
  statLbl:   { fontSize: 10, color: C.text2, marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '700' },

  /* Section */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14, marginTop: 20, marginBottom: 10 },
  sectionTitle:  { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: -0.1 },
  sectionCount:  { fontSize: 11, color: C.text2, fontWeight: '600' },

  /* Payment cards */
  payRow:       { flexDirection: 'row', gap: 8, marginHorizontal: 14, marginBottom: 4 },
  payCard:      {
    flex: 1, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  payCardGreen:  { borderColor: '#bbf7d0' },
  payCardOrange: { borderColor: '#fed7aa' },
  payCardBlue:   { borderColor: '#bfdbfe' },
  payIcon:  { fontSize: 18, marginBottom: 6 },
  payNum:   { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  payLbl:   { fontSize: 9, color: C.text2, marginTop: 3, textTransform: 'uppercase', fontWeight: '700', textAlign: 'center', letterSpacing: 0.4 },

  /* Customer cards */
  custCard: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginHorizontal: 14, marginBottom: 8, flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  colorBar:  { width: 6, backgroundColor: '#888' },
  custBody:  { flex: 1, padding: 12 },
  custRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  custName:  { fontSize: 14, fontWeight: '800', color: C.text, flex: 1 },
  custMeta:  { fontSize: 11, color: C.text2, lineHeight: 16 },
  custInv:   { fontSize: 15, fontWeight: '900', color: C.primary, marginTop: 6, letterSpacing: -0.3 },
  badge:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeTxt:  { fontSize: 10, fontWeight: '700' },

  /* Empty */
  emptyBox:  { alignItems: 'center', padding: 36, backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt:  { fontSize: 13, color: C.text2, textAlign: 'center' },
});
