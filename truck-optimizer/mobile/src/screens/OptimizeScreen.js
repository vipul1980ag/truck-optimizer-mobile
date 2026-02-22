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
  track: { flex: 1, height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  fill:  { height: 8, borderRadius: 4 },
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
    <ScrollView style={s.bg} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={s.hero}>
        <TouchableOpacity style={s.optBtn} onPress={runOptimize} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="large" />
            : <Text style={s.optBtnTxt}>{'\u26a1'} Optimize Load Now</Text>}
        </TouchableOpacity>
        <Text style={s.optHint}>Groups same-zone customers {'\u00b7'} Maximises truck utilisation {'\u00b7'} Shows route costs</Text>
      </View>

      {!results && !loading && (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>{'\uD83D\uDCCA'}</Text>
          <Text style={s.emptyTxt}>Your load plan will appear here after optimising.</Text>
        </View>
      )}

      {results && (
        <>
          <View style={s.sumRow}>
            {[
              { num: results.packers.length, lbl: 'Trucks Used' },
              { num: totalPlaced,            lbl: 'Items Placed' },
              { num: totalCost > 0 ? '$' + totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '\u2014', lbl: 'Fleet Cost', col: C.primary },
            ].map(({ num, lbl, col }) => (
              <View key={lbl} style={s.sumCard}>
                <Text style={[s.sumNum, col && { color: col }]}>{num}</Text>
                <Text style={s.sumLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {results.splitWarn?.length > 0 && (
            <View style={s.warnBox}>
              <Text style={s.warnTitle}>{'\u26a0'} Customer Split Across Trucks</Text>
              {results.splitWarn.map((w, i) => (
                <Text key={i} style={s.warnItem}>{'\u2022'} {w.name} {'\u2192'} {(w.trucks || []).join(', ')}</Text>
              ))}
            </View>
          )}

          {results.unplaced?.length > 0 && (
            <View style={s.errBox}>
              <Text style={s.errTitle}>{'\u2715'} Items That Didn't Fit</Text>
              {[...new Map(results.unplaced.map(u => [u.name, u])).values()].map((u, i) => (
                <Text key={i} style={s.errItem}>{'\u2022'} {u.name} ({u.length}x{u.width}x{u.height} ft)</Text>
              ))}
            </View>
          )}

          {results.packers.map((p, i) => {
            const t   = p.truck;
            const ts  = (results.truckZoneSummary || [])[i];
            const volCap  = t.length * t.width * t.height;
            const volUsed = p.placements.reduce((s, pl) => s + pl.length * pl.width * pl.height, 0);
            const volPct  = volCap > 0 ? Math.min(100, Math.round(volUsed / volCap * 100)) : 0;
            const wtPct   = t.maxWt  > 0 ? Math.min(100, Math.round((p.usedWeight || 0) / t.maxWt * 100)) : 0;
            const volCol  = volPct >= 90 ? C.danger : volPct >= 70 ? C.warning : C.success;
            const wtCol   = wtPct  >= 90 ? C.danger : wtPct  >= 70 ? C.warning : C.success;
            return (
              <View key={i} style={s.truckCard}>
                <View style={s.truckHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.truckName}>{'\uD83D\uDE9B'} {t.name}</Text>
                    <Text style={s.truckSub}>{t.length}x{t.width}x{t.height} ft {'\u00b7'} max {(t.maxWt || 0).toLocaleString()} lbs</Text>
                  </View>
                  <View style={[s.pill, volPct >= 90 ? s.pillRed : volPct >= 70 ? s.pillYellow : s.pillGreen]}>
                    <Text style={s.pillTxt}>{volPct}% full</Text>
                  </View>
                </View>
                <View style={s.truckBody}>
                  {[['Volume', volPct, volCol], ['Weight', wtPct, wtCol]].map(([lbl, pct, col]) => (
                    <View key={lbl} style={s.progRow}>
                      <Text style={s.progLbl}>{lbl}</Text>
                      <ProgressBar pct={pct} color={col} />
                      <Text style={[s.progPct, { color: col }]}>{pct}%</Text>
                    </View>
                  ))}

                  {ts?.zones?.length > 0 && (
                    <View style={s.zones}>
                      <Text style={s.zonesLbl}>Delivery Zones</Text>
                      {ts.zones.map((z, zi) => (
                        <View key={zi} style={s.zoneRow}>
                          <Text style={s.zoneIcon}>{'\uD83D\uDCCD'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.zoneName}>{z.zone}{z.distance ? `  \u00b7  ${z.distance} mi` : ''}</Text>
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

          {totalCost > 0 && (
            <View style={s.fleetTotal}>
              <View>
                <Text style={s.ftLbl}>Total Fleet Cost</Text>
                <Text style={s.ftSub}>{results.packers.length} trucks {'\u00b7'} {totalPlaced} items placed</Text>
              </View>
              <Text style={s.ftVal}>${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
            </View>
          )}
          <View style={{ height: 30 }} />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: C.bg },
  hero:       { padding: 16 },
  optBtn:     { backgroundColor: C.primary, borderRadius: 14, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 64, elevation: 3 },
  optBtnTxt:  { color: '#fff', fontSize: 20, fontWeight: '900' },
  optHint:    { fontSize: 11, color: C.text2, textAlign: 'center', marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTxt:   { fontSize: 14, color: C.text2, textAlign: 'center' },
  sumRow:     { flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  sumCard:    { flex: 1, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' },
  sumNum:     { fontSize: 20, fontWeight: '900', color: C.text },
  sumLbl:     { fontSize: 9, color: C.text2, textTransform: 'uppercase', marginTop: 2, fontWeight: '700', textAlign: 'center' },
  warnBox:    { marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 10, padding: 12 },
  warnTitle:  { fontSize: 12, fontWeight: '700', color: '#c2410c', marginBottom: 5 },
  warnItem:   { fontSize: 11, color: '#9a3412', marginTop: 2 },
  errBox:     { marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12 },
  errTitle:   { fontSize: 12, fontWeight: '700', color: C.danger, marginBottom: 5 },
  errItem:    { fontSize: 11, color: '#991b1b', marginTop: 2 },
  truckCard:  { marginHorizontal: 12, marginBottom: 14, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', elevation: 2 },
  truckHead:  { backgroundColor: C.navy, padding: 14, flexDirection: 'row', alignItems: 'center' },
  truckName:  { fontSize: 15, fontWeight: '800', color: '#f1f5f9' },
  truckSub:   { fontSize: 11, color: '#64748b', marginTop: 2 },
  pill:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  pillGreen:  { backgroundColor: 'rgba(34,197,94,0.2)' },
  pillYellow: { backgroundColor: 'rgba(245,158,11,0.2)' },
  pillRed:    { backgroundColor: 'rgba(239,68,68,0.2)' },
  pillTxt:    { fontSize: 11, fontWeight: '700', color: '#f1f5f9' },
  truckBody:  { padding: 14 },
  progRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progLbl:    { fontSize: 11, color: C.text2, width: 52 },
  progPct:    { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  zones:      { marginTop: 8 },
  zonesLbl:   { fontSize: 10, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  zoneRow:    { flexDirection: 'row', gap: 8, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 8, marginBottom: 5 },
  zoneIcon:   { fontSize: 14 },
  zoneName:   { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 3 },
  custRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  payBadge:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  payBadgeTxt:{ fontSize: 9, fontWeight: '700' },
  zoneCust:   { fontSize: 11, color: C.text },
  zoneAmt:    { fontSize: 10, fontWeight: '700', color: C.primary, marginLeft: 'auto' },
  tripCost:   { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(37,99,235,0.05)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.15)', borderRadius: 8, padding: 10 },
  tripLbl:    { fontSize: 11, color: C.text2 },
  tripSavings:{ fontSize: 11, fontWeight: '700', color: C.success, marginTop: 2 },
  tripVal:    { fontSize: 18, fontWeight: '800', color: C.primary },
  fleetTotal: { marginHorizontal: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ftLbl:      { fontSize: 12, fontWeight: '700', color: C.text2 },
  ftSub:      { fontSize: 11, color: C.text2, marginTop: 2 },
  ftVal:      { fontSize: 24, fontWeight: '900', color: C.text },
});
