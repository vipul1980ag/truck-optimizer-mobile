import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { api } from '../api';
import { shadow, PAY_LABEL, PAY_COLOR, PAY_BG } from '../theme';
import { useTheme } from '../ThemeContext';
import { useLocale } from '../LocaleContext';

function StatCard({ num, label, icon, idx, theme, isDark }) {
  const iconBgs = isDark
    ? ['#1e3a5f', '#2e1a4f', '#0f3030', '#3d2a00']
    : ['#dbeafe', '#ede9fe', '#ccfbf1', '#fef3c7'];
  const accents = [theme.primary, theme.accent, theme.teal, theme.warning];
  const accent = accents[idx % 4];
  const iconBg = iconBgs[idx % 4];
  return (
    <View style={{
      flex: 1, minWidth: '46%', backgroundColor: theme.surface,
      borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border,
      ...shadow.sm,
    }}>
      <View style={{ height: 4, width: '100%', backgroundColor: accent }} />
      <View style={{
        width: 46, height: 46, borderRadius: 23, backgroundColor: iconBg,
        alignItems: 'center', justifyContent: 'center', margin: 14, marginBottom: 8,
      }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 30, fontWeight: '900', letterSpacing: -1, paddingHorizontal: 14, lineHeight: 34, color: accent }}>{num}</Text>
      <Text style={{
        fontSize: 10, color: theme.text2, paddingHorizontal: 14, paddingBottom: 14,
        marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '700',
      }}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLocale();
  const [data,       setData]       = useState(null);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

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
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={s.loadingTxt}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <View style={s.errIconWrap}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
        </View>
        <Text style={s.errTitle}>{t('cannotReachServer')}</Text>
        <Text style={s.errSub}>{error}</Text>
        <Text style={s.errHint}>{t('checkInternet')}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryBtnTxt}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { trucks = [], carriers = [], customers = [], items = [] } = data;
  const totalUnits    = items.reduce((sum, i) => sum + (i.qty || 1), 0);
  const totalInvoiced = customers.reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);
  const totalPaid     = customers.filter(c => c.paymentStatus === 'paid')
                                 .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);
  const outstanding   = totalInvoiced - totalPaid;

  return (
    <ScrollView
      style={s.bg}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryL} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroCircle} pointerEvents="none" />
        <View style={s.heroCircle2} pointerEvents="none" />
        <View style={s.heroBadgeRow}>
          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeTxt}>{t('liveData')}</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={s.themeToggle} activeOpacity={0.7}>
            <Text style={s.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
            <Text style={s.themeToggleLbl}>{isDark ? t('lightMode') : t('darkMode')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.heroTitle}>{t('heroTitle')}</Text>
        <Text style={s.heroSub}>{t('heroSub')}</Text>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        <StatCard num={trucks.length}    label={t('ownTrucks')}  icon="🚛" idx={0} theme={theme} isDark={isDark} />
        <StatCard num={carriers.length}  label={t('carriers')}   icon="🏢" idx={1} theme={theme} isDark={isDark} />
        <StatCard num={customers.length} label={t('customers')}  icon="👥" idx={2} theme={theme} isDark={isDark} />
        <StatCard num={totalUnits}       label={t('cargoUnits')} icon="📦" idx={3} theme={theme} isDark={isDark} />
      </View>

      {/* Payment Summary */}
      <View style={s.sectionHeader}>
        <View style={[s.sectionDot, { backgroundColor: theme.success }]} />
        <Text style={s.sectionTitle}>{t('paymentSummary')}</Text>
      </View>

      <View style={s.payRow}>
        <View style={[s.payCard, s.payCardGreen]}>
          <View style={[s.payIconWrap, { backgroundColor: isDark ? '#14532d' : '#dcfce7' }]}>
            <Text style={s.payIcon}>✅</Text>
          </View>
          <Text style={[s.payNum, { color: theme.success }]}>${totalPaid.toLocaleString()}</Text>
          <Text style={s.payLbl}>{t('collected')}</Text>
        </View>

        <View style={[s.payCard, s.payCardOrange]}>
          <View style={[s.payIconWrap, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
            <Text style={s.payIcon}>⏳</Text>
          </View>
          <Text style={[s.payNum, { color: theme.warning }]}>${outstanding.toLocaleString()}</Text>
          <Text style={s.payLbl}>{t('outstanding')}</Text>
        </View>

        <View style={[s.payCard, s.payCardBlue]}>
          <View style={[s.payIconWrap, { backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }]}>
            <Text style={s.payIcon}>📄</Text>
          </View>
          <Text style={[s.payNum, { color: theme.primary }]}>${totalInvoiced.toLocaleString()}</Text>
          <Text style={s.payLbl}>{t('totalInvoiced')}</Text>
        </View>
      </View>

      {/* Customer Status */}
      <View style={s.sectionHeader}>
        <View style={[s.sectionDot, { backgroundColor: theme.accent }]} />
        <Text style={s.sectionTitle}>{t('customerStatus')}</Text>
        <View style={s.sectionPill}>
          <Text style={s.sectionPillTxt}>{customers.length} {t('total')}</Text>
        </View>
      </View>

      {customers.length === 0
        ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>{t('noCustomers')}</Text>
            <Text style={s.emptyHint}>{t('noCustomersHint')}</Text>
          </View>
        )
        : customers.map(c => {
            const ps = c.paymentStatus || 'pending';
            return (
              <View key={c.id} style={s.custCard}>
                <View style={[s.colorBar, { backgroundColor: c.color || theme.primary }]} />
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

function makeStyles(T, isDark) {
  return StyleSheet.create({
    bg:     { flex: 1, backgroundColor: T.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: T.bg },

    loadingTxt: { marginTop: 14, fontSize: 13, color: T.text2, fontWeight: '600' },

    errIconWrap: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    errTitle:    { fontSize: 18, fontWeight: '900', color: T.danger, marginBottom: 8, textAlign: 'center' },
    errSub:      { fontSize: 13, color: T.text2, textAlign: 'center', marginBottom: 6 },
    errHint:     { fontSize: 12, color: T.text3, textAlign: 'center', marginBottom: 28, paddingHorizontal: 16, lineHeight: 18 },
    retryBtn:    {
      backgroundColor: T.primary, paddingHorizontal: 36, paddingVertical: 13,
      borderRadius: 12, ...shadow.md, shadowColor: T.primary,
    },
    retryBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },

    /* Hero */
    hero: {
      backgroundColor: T.navy,
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
    heroBadgeRow: {
      flexDirection: 'row', marginBottom: 14,
      justifyContent: 'space-between', alignItems: 'center',
    },
    heroBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: 'rgba(34,197,94,0.15)',
      borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    heroBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
    heroBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#4ade80', letterSpacing: 1.2 },
    heroTitle:    { fontSize: 28, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.6, marginBottom: 6 },
    heroSub:      { fontSize: 12, color: '#64748b', lineHeight: 18 },

    /* Theme toggle */
    themeToggle: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20,
    },
    themeToggleIcon: { fontSize: 14 },
    themeToggleLbl:  { fontSize: 10, fontWeight: '700', color: '#cbd5e1', letterSpacing: 0.5 },

    /* Stats */
    statsGrid: {
      flexDirection: 'row', flexWrap: 'wrap',
      paddingHorizontal: 12, paddingTop: 16, gap: 10,
    },

    /* Section headers */
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      marginHorizontal: 14, marginTop: 24, marginBottom: 12,
    },
    sectionDot:   { width: 8, height: 8, borderRadius: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '900', color: T.text, flex: 1, letterSpacing: -0.2 },
    sectionPill:  {
      backgroundColor: T.surface3, paddingHorizontal: 10, paddingVertical: 3,
      borderRadius: 20, borderWidth: 1, borderColor: T.border,
    },
    sectionPillTxt: { fontSize: 11, color: T.text2, fontWeight: '700' },

    /* Payment cards */
    payRow:  { flexDirection: 'row', gap: 10, marginHorizontal: 14, marginBottom: 4 },
    payCard: {
      flex: 1, borderRadius: 16, borderWidth: 1.5,
      padding: 14, alignItems: 'center',
      ...shadow.sm,
    },
    payCardGreen:  { backgroundColor: isDark ? '#0d2818' : '#f0fdf4', borderColor: isDark ? '#166534' : '#86efac' },
    payCardOrange: { backgroundColor: isDark ? '#1c1004' : '#fffbeb', borderColor: isDark ? '#78350f' : '#fcd34d' },
    payCardBlue:   { backgroundColor: isDark ? '#0d1f3c' : '#eff6ff', borderColor: isDark ? '#1e3a5f' : '#93c5fd' },
    payIconWrap:   {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    payIcon: { fontSize: 18 },
    payNum:  { fontSize: 17, fontWeight: '900', letterSpacing: -0.4, marginBottom: 3 },
    payLbl:  {
      fontSize: 9, color: T.text2, textTransform: 'uppercase',
      fontWeight: '700', textAlign: 'center', letterSpacing: 0.5,
    },

    /* Customer cards */
    custCard: {
      backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border,
      marginHorizontal: 14, marginBottom: 10, flexDirection: 'row', overflow: 'hidden',
      ...shadow.sm,
    },
    colorBar: { width: 5 },
    custBody: { flex: 1, padding: 14 },
    custRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    custName: { fontSize: 14, fontWeight: '800', color: T.text, flex: 1, marginRight: 8 },
    custMeta: { fontSize: 11, color: T.text2, lineHeight: 17 },
    custInv:  { fontSize: 16, fontWeight: '900', color: T.primary, marginTop: 7, letterSpacing: -0.4 },
    badge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeTxt: { fontSize: 10, fontWeight: '700' },

    /* Empty */
    emptyBox: {
      alignItems: 'center', padding: 40,
      backgroundColor: T.surface, marginHorizontal: 14, borderRadius: 16,
      borderWidth: 1, borderColor: T.border, borderStyle: 'dashed',
    },
    emptyIcon:  { fontSize: 44, marginBottom: 12 },
    emptyTitle: { fontSize: 14, fontWeight: '800', color: T.text, marginBottom: 6 },
    emptyHint:  { fontSize: 12, color: T.text3, textAlign: 'center' },
  });
}
