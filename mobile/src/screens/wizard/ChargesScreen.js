import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

export default function ChargesScreen({ navigation }) {
  const { items, shippingOption, selectedRoute, selectedTruck,
          startLocation, destLocation, customers } = useWizard();
  const [truck,             setTruck]             = useState(null);
  const [allRates,          setAllRates]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [saving,            setSaving]            = useState(false);
  const [manualTollText,    setManualTollText]    = useState('');
  const [additionalText,    setAdditionalText]    = useState('');

  useEffect(() => {
    api.getData()
      .then(d => {
        setTruck(selectedTruck || (d.trucks || [])[0] || null);
        setAllRates(d.rates || []);
      })
      .catch(() => setTruck(null))
      .finally(() => setLoading(false));
  }, [selectedTruck]);

  // Cargo totals
  const totalItems  = items.reduce((s, i) => s + i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
  const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
  const hasDG       = items.some(i => i.isDG);
  const dgItems     = items.filter(i => i.isDG);

  // Route & distance
  const distance_km    = selectedRoute ? selectedRoute.distance_km : 160.9; // fallback ~100mi
  const distance_miles = distance_km * 0.621371;
  const toll_cost      = selectedRoute ? (selectedRoute.toll_cost || 0) : 0;

  const manualToll       = parseFloat(manualTollText)    || 0;
  const additionalCharge = parseFloat(additionalText)    || 0;

  function findRate(rateList, city, carrierId, truckRef) {
    const score = r =>
      (r.city      ? (r.city === city                   ? 4 : -99) : 0) +
      (r.carrierId != null ? (r.carrierId === carrierId ? 2 : -99) : 0) +
      (r.truckRef  != null ? (r.truckRef  === truckRef  ? 1 : -99) : 0);
    const matches = (rateList || []).filter(r => score(r) >= 0);
    if (!matches.length) return null;
    return matches.reduce((best, r) => score(r) > score(best) ? r : best, matches[0]);
  }

  // Cost estimate
  let truckVol = 0, fullCost = 0, baseCost = 0, dgSurcharge = 0, estimate = 0, pct = 0;
  let rateMatch = null;
  if (truck) {
    truckVol  = truck.length * truck.width * truck.height;
    const originCity = startLocation?.label?.split(',')[0]?.trim() || '';
    rateMatch = findRate(allRates, originCity, null, truck.id);
    fullCost  = rateMatch
      ? rateMatch.ratePerKm * distance_km
      : truck.baseRate + truck.ratePerMi * distance_miles;
    pct       = Math.min(totalVol / truckVol, 1);
    baseCost  = shippingOption === 'shared'
      ? Math.max(fullCost * pct, fullCost * 0.25)
      : fullCost;
    dgSurcharge = hasDG ? baseCost * 0.15 : 0;
    estimate    = baseCost + dgSurcharge + toll_cost + manualToll + additionalCharge;
  }

  async function confirmBooking() {
    setSaving(true);
    try {
      const fresh   = await api.getData();
      let   nextId  = fresh.nextIds?.item || 1;
      const newItems = items.map(i => ({
        id:             nextId++,
        name:           i.name,
        length:         i.length,
        width:          i.width,
        height:         i.height,
        weight:         i.weight,
        packagingWeight:i.packagingWeight || 0,
        qty:            i.qty,
        rotate:         true,
        customerId:     null,
        shippingOption,
        stackable:      i.stackable !== false,
        isDG:           i.isDG || false,
        dgClass:        i.dgClass || '',
        dgCanCombine:   i.dgCanCombine !== false,
      }));
      await api.saveData({
        ...fresh,
        items:   [...(fresh.items || []), ...newItems],
        nextIds: { ...fresh.nextIds, item: nextId },
      });

      // C5: Save booking record; check for route-overlap consolidation opportunities
      const inferredTruck = selectedTruck || truck;
      let consolidationMatches = [];
      if (inferredTruck?.id) {
        try {
          const res = await api.createBooking({
            truckId:       inferredTruck.id,
            shippingOption,
            route: {
              fromLabel:    startLocation?.label,
              fromLat:      startLocation?.lat,
              fromLng:      startLocation?.lng,
              toLabel:      destLocation?.label,
              toLat:        destLocation?.lat,
              toLng:        destLocation?.lng,
              distance_km:  selectedRoute?.distance_km,
              duration_min: selectedRoute?.duration_min,
              geometry:     selectedRoute?.geometry,
            },
            customers:   customers.map(c => ({ _id: c._id, name: c.name, address: c.address })),
            items:       items.map(i => ({ name: i.name, length: i.length, width: i.width, height: i.height, weight: i.weight, qty: i.qty })),
            totalWeight,
            totalVol,
          });
          consolidationMatches = res?.consolidationMatches || [];
        } catch (_) { /* non-critical — booking save failure should not block confirm */ }
      }

      navigation.navigate('Confirm', { totalItems, totalWeight, estimate, hasDG, dgCount: dgItems.length, dgSurcharge: Math.round(dgSurcharge), distanceKm: distance_km, tollCost: toll_cost, manualToll, additionalCharge });

      // Notify about overlapping routes after navigation settles
      if (consolidationMatches.length) {
        const m = consolidationMatches[0];
        const route = m.booking.route ? `${m.booking.route.fromLabel || ''} → ${m.booking.route.toLabel || ''}` : 'overlapping route';
        setTimeout(() => {
          Alert.alert(
            '🔁 Route Overlap Detected',
            `${m.truck.name}${m.truck.licensePlate ? ` (${m.truck.licensePlate})` : ''} is on a similar route (${route}) with ${Math.round(m.remainingPct)}% capacity available.\n\nConsider consolidating your next shipment to reduce cost.`,
            [{ text: 'Got it' }]
          );
        }, 600);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not save booking: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Cargo summary */}
        <View style={s.card}>
          <Text style={s.cardHead}>📦 Cargo Summary</Text>
          <View style={s.row}><Text style={s.rowLbl}>Total items</Text><Text style={s.rowVal}>{totalItems}</Text></View>
          <View style={s.row}><Text style={s.rowLbl}>Total weight</Text><Text style={s.rowVal}>{totalWeight.toLocaleString()} lbs</Text></View>
          <View style={s.row}><Text style={s.rowLbl}>Total volume</Text><Text style={s.rowVal}>{totalVol.toFixed(1)} cu ft</Text></View>
          {truck && (
            <View style={s.row}>
              <Text style={s.rowLbl}>Truck utilization</Text>
              <Text style={s.rowVal}>{(pct * 100).toFixed(0)}% of {truck.name}</Text>
            </View>
          )}
          <View style={s.row}>
            <Text style={s.rowLbl}>Route distance</Text>
            <Text style={s.rowVal}>{distance_km.toFixed(0)} km ({distance_miles.toFixed(0)} mi)</Text>
          </View>
        </View>

        {/* Shipping option */}
        <View style={s.card}>
          <Text style={s.cardHead}>
            {shippingOption === 'shared' ? '🤝 Share Truck (LTL)' : '🚚 Private Truck (FTL)'}
          </Text>
          {shippingOption === 'shared' ? (
            <Text style={s.optDesc}>Cost prorated by your cargo volume. You share the truck with other customers — great for smaller loads.</Text>
          ) : (
            <Text style={s.optDesc}>A dedicated truck for your cargo only. Full truck capacity reserved for you.</Text>
          )}
        </View>

        {/* DG warning */}
        {hasDG && (
          <View style={s.dgWarning}>
            <Text style={s.dgWarningTitle}>⚠ Dangerous Goods Detected</Text>
            <Text style={s.dgWarningTxt}>
              Your shipment contains {dgItems.length} DG item{dgItems.length !== 1 ? 's' : ''}.
              A DG-certified truck will be required. A 15% surcharge has been applied.
            </Text>
          </View>
        )}

        {/* Charges breakdown */}
        {truck ? (
          <View style={s.card}>
            <Text style={s.cardHead}>💰 Estimated Charges</Text>
            <Text style={s.disclaimer}>Based on actual route distance using {truck.name} rates{rateMatch ? ' (rate override)' : ''}</Text>
            {!rateMatch && (
              <View style={s.row}>
                <Text style={s.rowLbl}>Base rate</Text>
                <Text style={s.rowVal}>${truck.baseRate.toLocaleString()}</Text>
              </View>
            )}
            <View style={s.row}>
              {rateMatch ? (
                <>
                  <Text style={s.rowLbl}>Per-km ({distance_km.toFixed(0)} km) — rate override</Text>
                  <Text style={s.rowVal}>${(rateMatch.ratePerKm * distance_km).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                </>
              ) : (
                <>
                  <Text style={s.rowLbl}>Per-mile ({distance_miles.toFixed(0)} mi)</Text>
                  <Text style={s.rowVal}>${(truck.ratePerMi * distance_miles).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                </>
              )}
            </View>
            {shippingOption === 'shared' && (
              <View style={s.row}>
                <Text style={s.rowLbl}>Your share ({(pct * 100).toFixed(0)}%)</Text>
                <Text style={s.rowVal}>×{pct.toFixed(2)}</Text>
              </View>
            )}
            {hasDG && (
              <View style={s.row}>
                <Text style={[s.rowLbl, { color: '#c2410c', fontWeight: '700' }]}>⚠ DG surcharge (15%)</Text>
                <Text style={[s.rowVal, { color: '#c2410c' }]}>+${Math.round(dgSurcharge).toLocaleString()}</Text>
              </View>
            )}
            {toll_cost > 0 && (
              <View style={s.row}>
                <Text style={[s.rowLbl, { color: '#7c3aed', fontWeight: '700' }]}>🚦 Toll charges</Text>
                <Text style={[s.rowVal, { color: '#7c3aed' }]}>+${toll_cost.toFixed(2)}</Text>
              </View>
            )}
            {manualToll > 0 && (
              <View style={s.row}>
                <Text style={[s.rowLbl, { color: '#7c3aed', fontWeight: '700' }]}>🚦 Manual toll</Text>
                <Text style={[s.rowVal, { color: '#7c3aed' }]}>+${manualToll.toFixed(2)}</Text>
              </View>
            )}
            {additionalCharge > 0 && (
              <View style={s.row}>
                <Text style={[s.rowLbl, { color: '#0369a1', fontWeight: '700' }]}>➕ Additional charges</Text>
                <Text style={[s.rowVal, { color: '#0369a1' }]}>+${additionalCharge.toFixed(2)}</Text>
              </View>
            )}
            <View style={[s.row, s.totalRow]}>
              <Text style={s.totalLbl}>Estimated Total</Text>
              <Text style={s.totalVal}>${estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            </View>
            <Text style={s.note}>* Based on {distance_km.toFixed(0)} km actual route distance. Final price confirmed at pickup.</Text>
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.optDesc}>Could not load truck rates. You can still confirm your booking.</Text>
          </View>
        )}

        {/* Manual adjustments */}
        <View style={s.card}>
          <Text style={s.cardHead}>✏️ Manual Adjustments</Text>
          <View style={s.inputRow}>
            <Text style={s.inputLbl}>🚦 Toll charges ($)</Text>
            <TextInput
              style={s.input}
              value={manualTollText}
              onChangeText={setManualTollText}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={C.text3}
            />
          </View>
          <View style={[s.inputRow, { borderBottomWidth: 0 }]}>
            <Text style={s.inputLbl}>➕ Additional flat charges ($)</Text>
            <TextInput
              style={s.input}
              value={additionalText}
              onChangeText={setAdditionalText}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={C.text3}
            />
          </View>
        </View>

      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.confirmBtn} onPress={confirmBooking} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.confirmTxt}>Confirm Booking ✓</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 8 },

  card:     { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  cardHead: { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 12 },

  row:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.surface2 },
  rowLbl: { fontSize: 13, color: C.text2 },
  rowVal: { fontSize: 13, fontWeight: '700', color: C.text },

  totalRow: { borderBottomWidth: 0, marginTop: 6, paddingTop: 10, borderTopWidth: 2, borderTopColor: C.border },
  totalLbl: { fontSize: 16, fontWeight: '900', color: C.text },
  totalVal: { fontSize: 20, fontWeight: '900', color: C.primary },

  optDesc:    { fontSize: 13, color: C.text2, lineHeight: 19 },
  disclaimer: { fontSize: 11, color: C.text3, marginBottom: 10 },
  note:       { fontSize: 10, color: C.text3, marginTop: 10, lineHeight: 15 },

  footer:     { padding: 12, paddingHorizontal: 16, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  confirmBtn: { backgroundColor: C.success, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },

  dgWarning:     { backgroundColor: '#fff7ed', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#fed7aa' },
  dgWarningTitle:{ fontSize: 14, fontWeight: '900', color: '#c2410c', marginBottom: 4 },
  dgWarningTxt:  { fontSize: 12, color: '#9a3412', lineHeight: 18 },

  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.surface2 },
  inputLbl: { fontSize: 13, color: C.text2, flex: 1 },
  input:    { width: 90, backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: C.text, fontWeight: '700', textAlign: 'right', borderWidth: 1, borderColor: C.border },
});
