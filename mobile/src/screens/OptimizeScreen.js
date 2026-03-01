import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api } from '../api';
import { C, PAY_LABEL, PAY_COLOR, PAY_BG } from '../theme';

function ProgressBar({ pct, color }) {
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { flex: 1, height: 9, backgroundColor: C.border, borderRadius: 5, overflow: 'hidden' },
  fill:  { height: 9, borderRadius: 5 },
});

export default function OptimizeScreen() {
  const [store,     setStore]     = useState(null);
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async () => {
    try { setStore(await api.getData()); } catch (_) {}
  }, []);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const runOptimize = async () => {
    if (!store) { Alert.alert('Not ready', 'Data not loaded yet.'); return; }
    const { trucks = [], carriers = [], customers = [], items = [] } = store;
    if (!trucks.length) { Alert.alert('No trucks', 'Add trucks in the web Advanced Settings first.'); return; }
    if (!items.length)  { Alert.alert('No items',  'Add cargo items in the Cargo tab first.'); return; }
    setLoading(true);
    try {
      setResults(await api.optimize({ trucks, carriers, customers, items }));
    } catch (e) {
      Alert.alert('Optimization failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const custMap     = Object.fromEntries((store?.customers || []).map(c => [c.id, c]));
  const totalCost   = (results?.truckZoneSummary || []).reduce((s, ts) => s + (ts.estimatedCost || 0), 0);
  const totalPlaced = (results?.packers || []).reduce((s, p) => s + p.placements.length, 0);

  return (
    <ScrollView
      style={s.bg}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {/* Optimize Button Hero */}
      <View style={s.hero}>
        <TouchableOpacity style={s.optBtn} onPress={runOptimize} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <View style={s.optBtnInner}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={s.optBtnTxt}>Optimizing…</Text>
            </View>
          ) : (
            <View style={s.optBtnInner}>
              <Text style={s.optBtnIcon}>⚡</Text>
              <Text style={s.optBtnTxt}>Optimize Load Now</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={s.optHint}>
          Groups same-zone customers  ·  Maximises truck utilisation  ·  Shows route costs
        </Text>
      </View>

      {/* Empty state */}
      {!results && !loading && (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📊</Text>
          <Text style={s.emptyTitle}>No load plan yet</Text>
          <Text style={s.emptyTxt}>Tap the button above to generate your optimised load plan.</Text>
        </View>
      )}

      {results && (
        <>
          {/* Summary cards */}
          <View style={s.sumRow}>
            {[
              { num: results.packers.length, lbl: 'Trucks Used',   icon: '🚛' },
              { num: totalPlaced,            lbl: 'Items Placed',  icon: '📦' },
              { num: totalCost > 0 ? '$' + totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—', lbl: 'Fleet Cost', icon: '💰', col: C.primary },
            ].map(({ num, lbl, icon, col }) => (
              <View key={lbl} style={s.sumCard}>
                <Text style={s.sumIcon}>{icon}</Text>
                <Text style={[s.sumNum, col && { color: col }]}>{num}</Text>
                <Text style={s.sumLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {/* Warnings */}
          {results.splitWarn?.length > 0 && (
            <View style={s.warnBox}>
              <Text style={s.warnTitle}>⚠ Customer Split Across Trucks</Text>
              {results.splitWarn.map((w, i) => (
                <Text key={i} style={s.warnItem}>• {w.name} → {(w.trucks || []).join(', ')}</Text>
              ))}
            </View>
          )}

          {results.unplaced?.length > 0 && (
            <View style={s.errBox}>
              <Text style={s.errBoxTitle}>✕ Items That Didn't Fit</Text>
              {[...new Map(results.unplaced.map(u => [u.name, u])).values()].map((u, i) => (
                <Text key={i} style={s.errItem}>• {u.name} ({u.length}×{u.width}×{u.height} ft)</Text>
              ))}
            </View>
          )}

          {/* Truck cards */}
          {results.packers.map((p, i) => {
            const t      = p.truck;
            const ts     = (results.truckZoneSummary || [])[i];
            const volCap  = t.length * t.width * t.height;
            const volUsed = p.placements.reduce((s, pl) => s + pl.length * pl.width * pl.height, 0);
            const volPct  = volCap > 0 ? Math.min(100, Math.round(volUsed / volCap * 100)) : 0;
            const wtPct   = t.maxWt  > 0 ? Math.min(100, Math.round((p.usedWeight || 0) / t.maxWt * 100)) : 0;
            const volCol  = volPct >= 90 ? C.danger : volPct >= 70 ? C.warning : C.success;
            const wtCol   = wtPct  >= 90 ? C.danger : wtPct  >= 70 ? C.warning : C.success;
            const pillStyle = volPct >= 90 ? s.pillRed : volPct >= 70 ? s.pillYellow : s.pillGreen;
            return (
              <View key={i} style={s.truckCard}>
                {/* Card header */}
                <View style={s.truckHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.truckName}>🚛 {t.name}</Text>
                    <Text style={s.truckSub}>{t.length}×{t.width}×{t.height} ft  ·  max {(t.maxWt || 0).toLocaleString()} lbs</Text>
                  </View>
                  <View style={[s.pill, pillStyle]}>
                    <Text style={s.pillTxt}>{volPct}% full</Text>
                  </View>
                </View>

                {/* Progress bars */}
                <View style={s.truckBody}>
                  {[['Volume', volPct, volCol], ['Weight', wtPct, wtCol]].map(([lbl, pct, col]) => (
                    <View key={lbl} style={s.progRow}>
                      <Text style={s.progLbl}>{lbl}</Text>
                      <ProgressBar pct={pct} color={col} />
                      <Text style={[s.progPct, { color: col }]}>{pct}%</Text>
                    </View>
                  ))}

                  {/* Delivery zones */}
                  {ts?.zones?.length > 0 && (
                    <View style={s.zones}>
                      <Text style={s.zonesLbl}>Delivery Zones</Text>
                      {ts.zones.map((z, zi) => (
                        <View key={zi} style={s.zoneRow}>
                          <Text style={s.zoneIcon}>📍</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.zoneName}>
                              {z.zone}{z.distance ? `  ·  ${z.distance} mi` : ''}
                            </Text>
                            {(z.customers || []).map(zc => {
                              const fc = custMap[zc.id];
                              const ps = fc?.paymentStatus || 'pending';
                              return (
                                <View key={zc.id} style={s.custRow}>
                                  <View style={[s.payBadge, { backgroundColor: PAY_BG[ps] }]}>
                                    <Text style={[s.payBadgeTxt, { color: PAY_COLOR[ps] }]}>{PAY_LABEL[ps]}</Text>
                                  </View>
                                  <Text style={s.zoneCust}>{zc.name}</Text>
                                  {fc?.invoiceAmount > 0 && (
                                    <Text style={s.zoneAmt}>${Number(fc.invoiceAmount).toLocaleString()}</Text>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Trip cost */}
                  {ts?.estimatedCost != null && (
                    <View style={s.tripCost}>
                      <View>
                        <Text style={s.tripLbl}>Estimated Trip Cost</Text>
                        {ts.zones?.length > 1 && <Text style={s.tripSavings}>Multi-zone consolidated run</Text>}
                      </View>
                      <Text style={s.tripVal}>${ts.estimatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Fleet total */}
          {totalCost > 0 && (
            <View style={s.fleetTotal}>
              <View>
                <Text style={s.ftLbl}>Total Fleet Cost</Text>
                <Text style={s.ftSub}>{results.packers.length} trucks  ·  {totalPlaced} items placed</Text>
              </View>
              <Text style={s.ftVal}>${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
            </View>
          )}
          <View style={{ height: 36 }} />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  /* Hero */
  hero:       { backgroundColor: C.navy, padding: 20, paddingBottom: 24 },
  optBtn:     {
    borderRadius: 16, padding: 22, alignItems: 'center', justifyContent: 'center',
    minHeight: 72,
    backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 6,
  },
  optBtnInner:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  optBtnIcon: { fontSize: 24 },
  optBtnTxt:  { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  optHint:    { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 12, lineHeight: 17 },

  /* Empty */
  emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 24 },
  emptyIcon:  { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: C.text, marginBottom: 8 },
  emptyTxt:   { fontSize: 13, color: C.text2, textAlign: 'center', lineHeight: 20 },

  /* Summary */
  sumRow:  { flexDirection: 'row', gap: 8, marginHorizontal: 14, marginTop: 14, marginBottom: 12 },
  sumCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sumIcon: { fontSize: 18, marginBottom: 5 },
  sumNum:  { fontSize: 18, fontWeight: '900', color: C.text, letterSpacing: -0.3 },
  sumLbl:  { fontSize: 9, color: C.text2, textTransform: 'uppercase', marginTop: 3, fontWeight: '700', textAlign: 'center', letterSpacing: 0.4 },

  /* Warnings */
  warnBox:      { marginHorizontal: 14, marginBottom: 10, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, padding: 14 },
  warnTitle:    { fontSize: 12, fontWeight: '800', color: '#c2410c', marginBottom: 6 },
  warnItem:     { fontSize: 11, color: '#9a3412', marginTop: 3 },
  errBox:       { marginHorizontal: 14, marginBottom: 10, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 14 },
  errBoxTitle:  { fontSize: 12, fontWeight: '800', color: C.danger, marginBottom: 6 },
  errItem:      { fontSize: 11, color: '#991b1b', marginTop: 3 },

  /* Truck card */
  truckCard: {
    marginHorizontal: 14, marginBottom: 14, backgroundColor: C.surface,
    borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  truckHead: { backgroundColor: C.navy, padding: 14, flexDirection: 'row', alignItems: 'center' },
  truckName: { fontSize: 15, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.2 },
  truckSub:  { fontSize: 11, color: '#64748b', marginTop: 3 },
  pill:        { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, marginLeft: 10 },
  pillGreen:   { backgroundColor: 'rgba(34,197,94,0.2)' },
  pillYellow:  { backgroundColor: 'rgba(245,158,11,0.2)' },
  pillRed:     { backgroundColor: 'rgba(239,68,68,0.2)' },
  pillTxt:     { fontSize: 11, fontWeight: '800', color: '#f1f5f9' },
  truckBody:   { padding: 14 },

  /* Progress */
  progRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progLbl:  { fontSize: 11, color: C.text2, width: 54, fontWeight: '600' },
  progPct:  { fontSize: 12, fontWeight: '800', width: 38, textAlign: 'right' },

  /* Zones */
  zones:    { marginTop: 10 },
  zonesLbl: { fontSize: 10, fontWeight: '800', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  zoneRow:  { flexDirection: 'row', gap: 10, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, marginBottom: 6 },
  zoneIcon: { fontSize: 14, marginTop: 1 },
  zoneName: { fontSize: 12, fontWeight: '800', color: C.text, marginBottom: 4 },
  custRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  payBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  payBadgeTxt:{ fontSize: 9, fontWeight: '700' },
  zoneCust: { fontSize: 11, color: C.text, fontWeight: '600' },
  zoneAmt:  { fontSize: 10, fontWeight: '800', color: C.primary, marginLeft: 'auto' },

  /* Trip cost */
  tripCost:    {
    marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.05)', borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)', borderRadius: 10, padding: 12,
  },
  tripLbl:     { fontSize: 11, color: C.text2, fontWeight: '600' },
  tripSavings: { fontSize: 11, fontWeight: '700', color: C.success, marginTop: 3 },
  tripVal:     { fontSize: 20, fontWeight: '900', color: C.primary, letterSpacing: -0.4 },

  /* Fleet total */
  fleetTotal: {
    marginHorizontal: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  ftLbl:  { fontSize: 13, fontWeight: '800', color: C.text2 },
  ftSub:  { fontSize: 11, color: C.text2, marginTop: 3 },
  ftVal:  { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
});
