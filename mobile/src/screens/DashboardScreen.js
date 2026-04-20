import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { api } from '../api';
import { C, shadow, PAY_LABEL, PAY_COLOR, PAY_BG } from '../theme';

const STAT_ACCENT = [
  { accent: C.primary,  iconBg: '#dbeafe' },
  { accent: C.accent,   iconBg: '#ede9fe' },
  { accent: C.teal,     iconBg: '#ccfbf1' },
  { accent: C.warning,  iconBg: '#fef3c7' },
];

function StatCard({ num, label, icon, idx }) {
  const { accent, iconBg } = STAT_ACCENT[idx % 4];
  return (
    <View style={s.statCard}>
      <View style={[s.statTopBar, { backgroundColor: accent }]} />
      <View style={[s.statIconWrap, { backgroundColor: iconBg }]}>
        <Text style={s.statIcon}>{icon}</Text>
      </View>
      <Text style={[s.statNum, { color: accent }]}>{num}</Text>
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
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingTxt}>Loading dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <View style={s.errIconWrap}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
        </View>
        <Text style={s.errTitle}>Cannot reach server</Text>
        <Text style={s.errSub}>{error}</Text>
        <Text style={s.errHint}>Check your internet connection and try again.</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryBtnTxt}>Retry  →</Text>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primaryL} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroCircle} pointerEvents="none" />
        <View style={s.heroCircle2} pointerEvents="none" />
        <View style={s.heroBadgeRow}>
          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeTxt}>LIVE DATA</Text>
          </View>
        </View>
        <Text style={s.heroTitle}>🚛 Load Optimizer</Text>
        <Text style={s.heroSub}>Pull to refresh  ·  Tap New to create a booking</Text>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        <StatCard num={trucks.length}    label="Own Trucks"  icon="🚛" idx={0} />
        <StatCard num={carriers.length}  label="Carriers"    icon="🏢" idx={1} />
        <StatCard num={customers.length} label="Customers"   icon="👥" idx={2} />
        <StatCard num={totalUnits}       label="Cargo Units" icon="📦" idx={3} />
      </View>

      {/* Payment Summary */}
      <View style={s.sectionHeader}>
        <View style={[s.sectionDot, { backgroundColor: C.success }]} />
        <Text style={s.sectionTitle}>Payment Summary</Text>
      </View>

      <View style={s.payRow}>
        <View style={[s.payCard, s.payCardGreen]}>
          <View style={[s.payIconWrap, { backgroundColor: '#dcfce7' }]}>
            <Text style={s.payIcon}>✅</Text>
          </View>
          <Text style={[s.payNum, { color: C.success }]}>${totalPaid.toLocaleString()}</Text>
          <Text style={s.payLbl}>Collected</Text>
        </View>

        <View style={[s.payCard, s.payCardOrange]}>
          <View style={[s.payIconWrap, { backgroundColor: '#fef3c7' }]}>
            <Text style={s.payIcon}>⏳</Text>
          </View>
          <Text style={[s.payNum, { color: C.warning }]}>${outstanding.toLocaleString()}</Text>
          <Text style={s.payLbl}>Outstanding</Text>
        </View>

        <View style={[s.payCard, s.payCardBlue]}>
          <View style={[s.payIconWrap, { backgroundColor: '#dbeafe' }]}>
            <Text style={s.payIcon}>📄</Text>
          </View>
          <Text style={[s.payNum, { color: C.primary }]}>${totalInvoiced.toLocaleString()}</Text>
          <Text style={s.payLbl}>Total Invoiced</Text>
        </View>
      </View>

      {/* Customer Status */}
      <View style={s.sectionHeader}>
        <View style={[s.sectionDot, { backgroundColor: C.accent }]} />
        <Text style={s.sectionTitle}>Customer Status</Text>
        <View style={s.sectionPill}>
          <Text style={s.sectionPillTxt}>{customers.length} total</Text>
        </View>
      </View>

      {customers.length === 0
        ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>No customers yet</Text>
            <Text style={s.emptyHint}>Customers will appear here once added.</Text>
          </View>
        )
        : customers.map(c => {
            const ps = c.paymentStatus || 'pending';
            return (
              <View key={c.id} style={s.custCard}>
                <View style={[s.colorBar, { backgroundColor: c.color || C.primary }]} />
                <View style={s.custBody}>
                  <View style={s.custRow}>
                    <Text style={s.custName} numberOfLines={1}>{c.name}</Text>
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
      <View style={{ height: 36 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: C.bg },

  loadingTxt: { marginTop: 14, fontSize: 13, color: C.text2, fontWeight: '600' },

  errIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  errTitle:    { fontSize: 18, fontWeight: '900', color: C.danger, marginBottom: 8, textAlign: 'center' },
  errSub:      { fontSize: 13, color: C.text2, textAlign: 'center', marginBottom: 6 },
  errHint:     { fontSize: 12, color: C.text3, textAlign: 'center', marginBottom: 28, paddingHorizontal: 16, lineHeight: 18 },
  retryBtn:    {
    backgroundColor: C.primary, paddingHorizontal: 36, paddingVertical: 13,
    borderRadius: 12, ...shadow.md, shadowColor: C.primary,
  },
  retryBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },

  /* Hero */
  hero: {
    backgroundColor: C.navy,
    padding: 22, paddingTop: 26, paddingBottom: 28,
    overflow: 'hidden',
    ...shadow.md,
  },
  heroCircle: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(37,99,235,0.14)', top: -90, right: -60,
  },
  heroCircle2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(124,58,237,0.08)', bottom: -60, left: -30,
  },
  heroBadgeRow: { flexDirection: 'row', marginBottom: 14 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80',
  },
  heroBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#4ade80', letterSpacing: 1.2 },
  heroTitle:    { fontSize: 28, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.6, marginBottom: 6 },
  heroSub:      { fontSize: 12, color: '#64748b', lineHeight: 18 },

  /* Stats */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 16, gap: 10,
  },
  statCard: {
    flex: 1, minWidth: '46%', backgroundColor: C.surface,
    borderRadius: 16, overflow: 'hidden',
    ...shadow.sm,
  },
  statTopBar:   { height: 4, width: '100%' },
  statIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    margin: 14, marginBottom: 8,
  },
  statIcon: { fontSize: 22 },
  statNum:  { fontSize: 30, fontWeight: '900', letterSpacing: -1, paddingHorizontal: 14, lineHeight: 34 },
  statLbl:  {
    fontSize: 10, color: C.text2, paddingHorizontal: 14, paddingBottom: 14,
    marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '700',
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 14, marginTop: 24, marginBottom: 12,
  },
  sectionDot:   { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: C.text, flex: 1, letterSpacing: -0.2 },
  sectionPill:  {
    backgroundColor: C.surface3, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
  },
  sectionPillTxt: { fontSize: 11, color: C.text2, fontWeight: '700' },

  /* Payment cards */
  payRow:  { flexDirection: 'row', gap: 10, marginHorizontal: 14, marginBottom: 4 },
  payCard: {
    flex: 1, borderRadius: 16, borderWidth: 1.5,
    padding: 14, alignItems: 'center',
    ...shadow.sm,
  },
  payCardGreen:  { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  payCardOrange: { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  payCardBlue:   { backgroundColor: '#eff6ff', borderColor: '#93c5fd' },
  payIconWrap:   {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  payIcon: { fontSize: 18 },
  payNum:  { fontSize: 17, fontWeight: '900', letterSpacing: -0.4, marginBottom: 3 },
  payLbl:  {
    fontSize: 9, color: C.text2, textTransform: 'uppercase',
    fontWeight: '700', textAlign: 'center', letterSpacing: 0.5,
  },

  /* Customer cards */
  custCard: {
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    marginHorizontal: 14, marginBottom: 10, flexDirection: 'row', overflow: 'hidden',
    ...shadow.sm,
  },
  colorBar: { width: 5 },
  custBody: { flex: 1, padding: 14 },
  custRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  custName: { fontSize: 14, fontWeight: '800', color: C.text, flex: 1, marginRight: 8 },
  custMeta: { fontSize: 11, color: C.text2, lineHeight: 17 },
  custInv:  { fontSize: 16, fontWeight: '900', color: C.primary, marginTop: 7, letterSpacing: -0.4 },
  badge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 10, fontWeight: '700' },

  /* Empty */
  emptyBox: {
    alignItems: 'center', padding: 40,
    backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
  },
  emptyIcon:  { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptyHint:  { fontSize: 12, color: C.text3, textAlign: 'center' },
});
