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
    const options   = ['\u2713 Mark Paid', '\u23f3 Mark Pending', '\u26a0 Mark Overdue', 'Cancel'];
    const statusMap = { 0: 'paid', 1: 'pending', 2: 'overdue' };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, title: `Payment status \u2014 ${cust.name}` },
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
        <View style={{ flex: 1, padding: 12 }}>
          <View style={s.row}>
            <Text style={s.name}>{c.name}</Text>
            <TouchableOpacity style={[s.badge, { backgroundColor: PAY_BG[ps] }]} onPress={() => changeStatus(c)}>
              <Text style={[s.badgeTxt, { color: PAY_COLOR[ps] }]}>{PAY_LABEL[ps]}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.meta}>Stop {c.stop} {'\u00b7'} {c.zone || '\u2014'}{c.distance ? ` \u00b7 ${c.distance} mi` : ''}</Text>
          <Text style={s.meta}>
            {TERMS_LABEL[c.paymentTerms] || c.paymentTerms || 'Net 30'} {'\u00b7'} {METHOD_LABEL[c.paymentMethod] || c.paymentMethod || 'Invoice'}
          </Text>
          {c.invoiceAmount > 0 && (
            <Text style={s.inv}>${Number(c.invoiceAmount).toLocaleString()}</Text>
          )}
          {canPay && (
            <TouchableOpacity style={s.payBtn} onPress={() => navigation.navigate('Payment', { customer: c })}>
              <Text style={s.payBtnTxt}>{'\uD83D\uDCB3'} Pay Now via PayPal</Text>
            </TouchableOpacity>
          )}
          {ps === 'paid' && (
            <View style={s.paidRow}>
              <Text style={s.paidTxt}>{'\u2713'} Invoice settled</Text>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={s.empty}>No customers. Configure them in the web Advanced Settings.</Text>}
      ListHeaderComponent={
        <Text style={s.hint}>Tap a payment badge to change status {'\u00b7'} Use "Pay Now" for PayPal</Text>
      }
    />
  );
}

const s = StyleSheet.create({
  list:     { padding: 12, gap: 10 },
  hint:     { fontSize: 11, color: C.text2, textAlign: 'center', marginBottom: 6, padding: 8, backgroundColor: C.surface, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  card:     { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, flexDirection: 'row', overflow: 'hidden', elevation: 1 },
  colorBar: { width: 5 },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name:     { fontSize: 15, fontWeight: '800', color: C.text, flex: 1 },
  meta:     { fontSize: 11, color: C.text2, marginTop: 2 },
  inv:      { fontSize: 18, fontWeight: '900', color: C.primary, marginTop: 6 },
  badge:    { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeTxt: { fontSize: 10, fontWeight: '700' },
  payBtn:   { marginTop: 10, backgroundColor: '#ffc439', borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  payBtnTxt:{ fontSize: 13, fontWeight: '800', color: '#111' },
  paidRow:  { marginTop: 8, backgroundColor: '#f0fdf4', borderRadius: 6, padding: 6, alignItems: 'center' },
  paidTxt:  { fontSize: 12, fontWeight: '700', color: C.success },
  empty:    { fontSize: 13, color: C.text2, textAlign: 'center', padding: 30, paddingHorizontal: 20 },
});
