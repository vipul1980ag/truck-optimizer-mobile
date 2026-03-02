import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

export default function ChargesScreen({ navigation }) {
  const { items, shippingOption } = useWizard();
  const [truck,    setTruck]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.getData()
      .then(d => setTruck((d.trucks || [])[0] || null))
      .catch(() => setTruck(null))
      .finally(() => setLoading(false));
  }, []);

  // Cargo totals
  const totalItems  = items.reduce((s, i) => s + i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
  const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);

  // Cost estimate
  let truckVol = 0, fullCost = 0, estimate = 0, pct = 0;
  if (truck) {
    truckVol  = truck.length * truck.width * truck.height;
    fullCost  = truck.baseRate + truck.ratePerMi * 100;
    pct       = Math.min(totalVol / truckVol, 1);
    if (shippingOption === 'shared') {
      estimate = Math.max(fullCost * pct, fullCost * 0.25);
    } else {
      estimate = fullCost;
    }
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
      }));
      await api.saveData({
        ...fresh,
        items:   [...(fresh.items || []), ...newItems],
        nextIds: { ...fresh.nextIds, item: nextId },
      });
      navigation.navigate('Confirm', { totalItems, totalWeight, estimate });
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

        {/* Charges breakdown */}
        {truck ? (
          <View style={s.card}>
            <Text style={s.cardHead}>💰 Estimated Charges</Text>
            <Text style={s.disclaimer}>Based on 100-mile service estimate using {truck.name} rates</Text>
            <View style={s.row}>
              <Text style={s.rowLbl}>Base rate</Text>
              <Text style={s.rowVal}>${truck.baseRate.toLocaleString()}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLbl}>Per-mile (100 mi)</Text>
              <Text style={s.rowVal}>${(truck.ratePerMi * 100).toLocaleString()}</Text>
            </View>
            {shippingOption === 'shared' && (
              <View style={s.row}>
                <Text style={s.rowLbl}>Your share ({(pct * 100).toFixed(0)}%)</Text>
                <Text style={s.rowVal}>×{pct.toFixed(2)}</Text>
              </View>
            )}
            <View style={[s.row, s.totalRow]}>
              <Text style={s.totalLbl}>Estimated Total</Text>
              <Text style={s.totalVal}>${estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            </View>
            <Text style={s.note}>* Final price confirmed at pickup based on actual distance and weight</Text>
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.optDesc}>Could not load truck rates. You can still confirm your booking.</Text>
          </View>
        )}

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
});
