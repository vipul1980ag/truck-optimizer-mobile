import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, ActionSheetIOS, Platform,
} from 'react-native';
import { api } from '../api';
import { C, PAY_LABEL, PAY_COLOR, PAY_BG, TERMS_LABEL, METHOD_LABEL } from '../theme';

const STATUS_CYCLE = { pending: 'paid', paid: 'overdue', overdue: 'pending' };

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api.getData();
      setCustomers(d.customers || []);
      setStoreData(d);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useEffect(() => {
    load();
    return navigation.addListener('focus', load);
  }, [navigation, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const cycleStatus = async (cust) => {
    const newStatus    = STATUS_CYCLE[cust.paymentStatus || 'pending'];
    const newCustomers = customers.map(c => c.id === cust.id ? { ...c, paymentStatus: newStatus } : c);
    setCustomers(newCustomers);
    try {
      await api.saveData({ ...storeData, customers: newCustomers });
      setStoreData(prev => ({ ...prev, customers: newCustomers }));
    } catch (e) {
      Alert.alert('Save Error', e.message);
      load();
    }
  };

  const changeStatus = (cust) => {
    const options   = ['✓ Mark Paid', '⏳ Mark Pending', '⚠ Mark Overdue', 'Cancel'];
    const statusMap = { 0: 'paid', 1: 'pending', 2: 'overdue' };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, title: `Payment status — ${cust.name}` },
        async (idx) => {
          if (idx === 3) return;
          const newStatus    = statusMap[idx];
          const newCustomers = customers.map(c => c.id === cust.id ? { ...c, paymentStatus: newStatus } : c);
          setCustomers(newCustomers);
          try { await api.saveData({ ...storeData, customers: newCustomers }); }
          catch (e) { Alert.alert('Save Error', e.message); load(); }
        }
      );
    } else {
      cycleStatus(cust);
    }
  };

  const renderCustomer = ({ item: c }) => {
    const ps     = c.paymentStatus || 'pending';
    const canPay = c.invoiceAmount > 0 && ps !== 'paid';
    return (
      <View style={s.card}>
        <View style={[s.colorBar, { backgroundColor: c.color || '#888' }]} />
        <View style={s.cardBody}>
          <View style={s.topRow}>
            <Text style={s.name}>{c.name}</Text>
            <TouchableOpacity style={[s.badge, { backgroundColor: PAY_BG[ps] }]} onPress={() => changeStatus(c)}>
              <Text style={[s.badgeTxt, { color: PAY_COLOR[ps] }]}>{PAY_LABEL[ps]}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.meta}>
            Stop {c.stop}  ·  {c.zone || '—'}{c.distance ? `  ·  ${c.distance} mi` : ''}
          </Text>
          <Text style={s.meta}>
            {TERMS_LABEL[c.paymentTerms] || c.paymentTerms || 'Net 30'}  ·  {METHOD_LABEL[c.paymentMethod] || c.paymentMethod || 'Invoice'}
          </Text>

          {c.invoiceAmount > 0 && (
            <Text style={s.inv}>${Number(c.invoiceAmount).toLocaleString()}</Text>
          )}

          {canPay && (
            <TouchableOpacity
              style={s.payBtn}
              onPress={() => navigation.navigate('Payment', { customer: c })}
            >
              <Text style={s.payBtnTxt}>💳  Pay Now via PayPal</Text>
            </TouchableOpacity>
          )}

          {ps === 'paid' && (
            <View style={s.paidRow}>
              <Text style={s.paidTxt}>✓ Invoice settled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: C.bg }}
      data={customers}
      keyExtractor={c => String(c.id)}
      renderItem={renderCustomer}
      contentContainerStyle={s.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      ListEmptyComponent={
        <View style={s.emptyBox}>
          <Text style={s.emptyIcon}>👥</Text>
          <Text style={s.emptyTitle}>No customers yet</Text>
          <Text style={s.emptyHint}>Configure customers in the web Advanced Settings.</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={s.hint}>
          <Text style={s.hintTxt}>Tap a payment badge to change status  ·  Use "Pay Now" for PayPal</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  list: { padding: 14, gap: 12 },

  hint:    { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 10, marginBottom: 4, alignItems: 'center' },
  hintTxt: { fontSize: 11, color: C.text2, textAlign: 'center', lineHeight: 16 },

  card: {
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  colorBar: { width: 7 },
  cardBody: { flex: 1, padding: 14 },

  topRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name:     { fontSize: 16, fontWeight: '900', color: C.text, flex: 1, letterSpacing: -0.2 },
  meta:     { fontSize: 11, color: C.text2, marginTop: 2, lineHeight: 16 },
  inv:      { fontSize: 22, fontWeight: '900', color: C.primary, marginTop: 8, letterSpacing: -0.5 },

  badge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 10 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },

  payBtn: {
    marginTop: 12, borderRadius: 10, paddingVertical: 11, alignItems: 'center',
    backgroundColor: '#fbbf24',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  payBtnTxt: { fontSize: 14, fontWeight: '900', color: '#111' },

  paidRow: { marginTop: 10, backgroundColor: '#f0fdf4', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  paidTxt: { fontSize: 12, fontWeight: '700', color: C.success },

  emptyBox:   { alignItems: 'center', padding: 48, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptyHint:  { fontSize: 12, color: C.text2, textAlign: 'center', paddingHorizontal: 12 },
});
