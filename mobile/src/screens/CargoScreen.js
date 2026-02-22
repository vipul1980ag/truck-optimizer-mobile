import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Alert, Modal, ScrollView, RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../api';
import { C } from '../theme';

const BLANK = { name: '', length: '4', width: '4', height: '4', weight: '500', packagingWeight: '0', qty: '1', customerId: null };

export default function CargoScreen() {
  const [items,     setItems]     = useState([]);
  const [customers, setCustomers] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [modal,     setModal]     = useState(false);
  const [refreshing,setRefreshing]= useState(false);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api.getData();
      setItems(d.items || []);
      setCustomers(d.customers || []);
      setStoreData(d);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const addItem = async () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Item name is required.'); return; }
    setSaving(true);
    try {
      const fresh   = await api.getData();
      const newItem = {
        id: fresh.nextIds.item,
        name:            form.name.trim(),
        length:          parseFloat(form.length)          || 4,
        width:           parseFloat(form.width)           || 4,
        height:          parseFloat(form.height)          || 4,
        weight:          parseFloat(form.weight)          || 0,
        packagingWeight: parseFloat(form.packagingWeight) || 0,
        qty:             parseInt(form.qty)               || 1,
        rotate:          true,
        customerId:      form.customerId || null,
      };
      const newItems   = [...(fresh.items || []), newItem];
      const newNextIds = { ...fresh.nextIds, item: fresh.nextIds.item + 1 };
      await api.saveData({ ...fresh, items: newItems, nextIds: newNextIds });
      setItems(newItems);
      setStoreData({ ...fresh, items: newItems, nextIds: newNextIds });
      setForm(BLANK);
      setModal(false);
    } catch (e) { Alert.alert('Save Error', e.message); }
    finally     { setSaving(false); }
  };

  const removeItem = id => {
    Alert.alert('Remove Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const fresh    = await api.getData();
          const newItems = fresh.items.filter(i => i.id !== id);
          await api.saveData({ ...fresh, items: newItems });
          setItems(newItems);
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const custMap = Object.fromEntries(customers.map(c => [c.id, c]));

  const renderItem = ({ item }) => {
    const cust    = item.customerId ? custMap[item.customerId] : null;
    const totalWt = (item.weight || 0) + (item.packagingWeight || 0);
    return (
      <View style={s.card}>
        <View style={{ flex: 1 }}>
          <View style={s.row}>
            <Text style={s.itemName}>{item.name}</Text>
            <View style={s.qtyBadge}><Text style={s.qtyTxt}>{'\u00d7'}{item.qty}</Text></View>
          </View>
          <Text style={s.meta}>{item.length}{'\u00d7'}{item.width}{'\u00d7'}{item.height} ft</Text>
          <Text style={s.meta}>
            {(item.weight || 0).toLocaleString()} lbs
            {item.packagingWeight > 0
              ? ` + ${item.packagingWeight.toLocaleString()} pkg = ${totalWt.toLocaleString()} lbs total`
              : ' item weight'}
          </Text>
          {cust && (
            <View style={s.row}>
              <View style={[s.dot, { backgroundColor: cust.color }]} />
              <Text style={[s.custLbl, { color: cust.color }]}>{cust.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={s.rmBtn} onPress={() => removeItem(item.id)}>
          <Text style={s.rmTxt}>{'\u2715'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={s.empty}>No cargo items yet.</Text>}
        ListHeaderComponent={
          <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
            <Text style={s.addBtnTxt}>{'\ufe0f\uff0b'} Add Cargo Item</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHead}>
            <Text style={s.modalTitle}>{'\uD83D\uDCE6'} Add Cargo Item</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ fontSize: 22, color: '#94a3b8' }}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.lbl}>Item Name</Text>
            <TextInput style={s.input} placeholder="e.g. Pallet A" value={form.name} onChangeText={f('name')} />

            <Text style={s.lbl}>Customer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <TouchableOpacity
                style={[s.chip, !form.customerId && s.chipActive]}
                onPress={() => setForm(p => ({ ...p, customerId: null }))}>
                <Text style={[s.chipTxt, !form.customerId && { color: '#fff' }]}>Unassigned</Text>
              </TouchableOpacity>
              {customers.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.chip, form.customerId === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                  onPress={() => setForm(p => ({ ...p, customerId: c.id }))}>
                  <Text style={[s.chipTxt, form.customerId === c.id && { color: '#fff' }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.dimRow}>
              {[['Length (ft)', 'length'], ['Width (ft)', 'width'], ['Height (ft)', 'height']].map(([lbl, key]) => (
                <View key={key} style={{ flex: 1 }}>
                  <Text style={s.lbl}>{lbl}</Text>
                  <TextInput style={s.input} keyboardType="decimal-pad" value={form[key]} onChangeText={f(key)} />
                </View>
              ))}
            </View>

            <View style={s.dimRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.lbl}>Item Wt (lbs)</Text>
                <TextInput style={s.input} keyboardType="decimal-pad" value={form.weight} onChangeText={f('weight')} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lbl}>Pkg Wt (lbs)</Text>
                <TextInput style={s.input} keyboardType="decimal-pad" value={form.packagingWeight} onChangeText={f('packagingWeight')} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lbl}>Qty</Text>
                <TextInput style={s.input} keyboardType="number-pad" value={form.qty} onChangeText={f('qty')} />
              </View>
            </View>

            <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={addItem} disabled={saving}>
              <Text style={s.submitTxt}>{saving ? 'Saving...' : '+ Add Item'}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  list:       { padding: 12, gap: 8 },
  card:       { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  itemName:   { fontSize: 14, fontWeight: '700', color: C.text },
  meta:       { fontSize: 11, color: C.text2, marginTop: 2 },
  qtyBadge:   { backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  qtyTxt:     { fontSize: 11, color: C.text2, fontWeight: '700' },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  custLbl:    { fontSize: 11, fontWeight: '700' },
  rmBtn:      { padding: 6, borderWidth: 1, borderColor: '#fecaca', borderRadius: 6 },
  rmTxt:      { color: C.danger, fontSize: 12, fontWeight: '700' },
  empty:      { textAlign: 'center', color: C.text2, fontSize: 13, marginTop: 40 },
  addBtn:     { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  addBtnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.text },
  modalBody:  { flex: 1, padding: 16, backgroundColor: C.bg },
  lbl:        { fontSize: 11, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 5 },
  input:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10, fontSize: 14, color: C.text, marginBottom: 12 },
  dimRow:     { flexDirection: 'row', gap: 8 },
  chip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, marginRight: 6 },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipTxt:    { fontSize: 12, fontWeight: '700', color: C.text },
  submitBtn:  { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  submitTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});
