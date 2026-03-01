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
        id:              fresh.nextIds.item,
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
        <View style={s.cardLeft}>
          <View style={s.qtyCircle}>
            <Text style={s.qtyNum}>{item.qty}</Text>
            <Text style={s.qtyX}>×</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.itemName}>{item.name}</Text>
          <Text style={s.meta}>{item.length} × {item.width} × {item.height} ft</Text>
          <Text style={s.meta}>
            {(item.weight || 0).toLocaleString()} lbs
            {item.packagingWeight > 0
              ? ` + ${item.packagingWeight.toLocaleString()} pkg = ${totalWt.toLocaleString()} lbs`
              : ''}
          </Text>
          {cust && (
            <View style={s.custTag}>
              <View style={[s.custDot, { backgroundColor: cust.color }]} />
              <Text style={[s.custLbl, { color: cust.color }]}>{cust.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={s.rmBtn} onPress={() => removeItem(item.id)}>
          <Text style={s.rmTxt}>✕</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>No cargo items yet</Text>
            <Text style={s.emptyHint}>Tap the button above to add your first item.</Text>
          </View>
        }
        ListHeaderComponent={
          <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
            <Text style={s.addBtnTxt}>＋ Add Cargo Item</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Modal Header */}
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>📦 Add Cargo Item</Text>
              <Text style={s.modalSub}>Fill in dimensions and assign to a customer</Text>
            </View>
            <TouchableOpacity style={s.modalClose} onPress={() => setModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.lbl}>Item Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Standard Pallet"
              placeholderTextColor={C.text3}
              value={form.name}
              onChangeText={f('name')}
            />

            <Text style={s.lbl}>Assign to Customer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
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

            <Text style={s.lbl}>Dimensions (ft)</Text>
            <View style={s.dimRow}>
              {[['Length', 'length'], ['Width', 'width'], ['Height', 'height']].map(([lbl, key]) => (
                <View key={key} style={{ flex: 1 }}>
                  <Text style={s.dimLbl}>{lbl}</Text>
                  <TextInput style={s.input} keyboardType="decimal-pad" value={form[key]} onChangeText={f(key)} placeholderTextColor={C.text3} />
                </View>
              ))}
            </View>

            <Text style={s.lbl}>Weight & Quantity</Text>
            <View style={s.dimRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.dimLbl}>Item Wt (lbs)</Text>
                <TextInput style={s.input} keyboardType="decimal-pad" value={form.weight} onChangeText={f('weight')} placeholderTextColor={C.text3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.dimLbl}>Pkg Wt (lbs)</Text>
                <TextInput style={s.input} keyboardType="decimal-pad" value={form.packagingWeight} onChangeText={f('packagingWeight')} placeholderTextColor={C.text3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.dimLbl}>Qty</Text>
                <TextInput style={s.input} keyboardType="number-pad" value={form.qty} onChangeText={f('qty')} placeholderTextColor={C.text3} />
              </View>
            </View>

            <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={addItem} disabled={saving}>
              <Text style={s.submitTxt}>{saving ? 'Saving…' : '＋ Add Item'}</Text>
            </TouchableOpacity>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  list: { padding: 14, gap: 10 },

  /* Item card */
  card: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardLeft:  { alignItems: 'center', paddingTop: 2 },
  qtyCircle: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  qtyNum:    { fontSize: 15, fontWeight: '900', color: C.primary, lineHeight: 18 },
  qtyX:      { fontSize: 9, color: C.text2, fontWeight: '700' },
  itemName:  { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 4 },
  meta:      { fontSize: 11, color: C.text2, marginTop: 1, lineHeight: 16 },
  custTag:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  custDot:   { width: 8, height: 8, borderRadius: 4 },
  custLbl:   { fontSize: 11, fontWeight: '700' },
  rmBtn:     { padding: 6, borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, marginLeft: 4 },
  rmTxt:     { color: C.danger, fontSize: 12, fontWeight: '800' },

  /* Empty */
  emptyBox:   { alignItems: 'center', padding: 48, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 6 },
  emptyHint:  { fontSize: 12, color: C.text2, textAlign: 'center' },

  /* Add button */
  addBtn: {
    backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  addBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },

  /* Modal */
  modalHead:     {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, paddingTop: 22,
    backgroundColor: C.navy,
  },
  modalTitle:    { fontSize: 18, fontWeight: '900', color: '#f1f5f9' },
  modalSub:      { fontSize: 11, color: '#64748b', marginTop: 4 },
  modalClose:    { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },
  modalBody:     { flex: 1, padding: 18, backgroundColor: C.bg },

  lbl:    { fontSize: 11, fontWeight: '800', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  dimLbl: { fontSize: 10, fontWeight: '700', color: C.text2, textAlign: 'center', marginBottom: 4 },
  input:  {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, padding: 11, fontSize: 14, color: C.text, marginBottom: 14,
  },
  dimRow: { flexDirection: 'row', gap: 8 },

  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface, marginRight: 7 },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipTxt:    { fontSize: 12, fontWeight: '700', color: C.text },

  submitBtn:  {
    backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  submitTxt:  { color: '#fff', fontSize: 16, fontWeight: '900' },
});
