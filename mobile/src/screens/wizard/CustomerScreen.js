import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';

const BLANK = { name: '', phone: '', address: '', notes: '', declaredValue: '' };

export default function CustomerScreen({ navigation }) {
  const { customers, addCustomer, updateCustomer, removeCustomer } = useWizard();

  const [form,       setForm]       = useState(BLANK);
  const [expandedId, setExpandedId] = useState(null);
  const [editForm,   setEditForm]   = useState({});

  const f  = k => v => setForm(p => ({ ...p, [k]: v }));
  const ef = k => v => setEditForm(p => ({ ...p, [k]: v }));

  function handleAdd() {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Customer name is required.');
      return;
    }
    addCustomer({
      name:          form.name.trim(),
      phone:         form.phone.trim(),
      address:       form.address.trim(),
      notes:         form.notes.trim(),
      declaredValue: form.declaredValue.trim(),
    });
    setForm(BLANK);
  }

  function startEdit(customer) {
    setExpandedId(customer._id);
    setEditForm({
      name:          customer.name,
      phone:         customer.phone || '',
      address:       customer.address || '',
      notes:         customer.notes || '',
      declaredValue: customer.declaredValue || '',
    });
  }

  function saveEdit(customer) {
    if (!editForm.name.trim()) { Alert.alert('Required', 'Customer name cannot be empty.'); return; }
    updateCustomer(customer._id, {
      name:          editForm.name.trim(),
      phone:         editForm.phone.trim(),
      address:       editForm.address.trim(),
      notes:         editForm.notes.trim(),
      declaredValue: editForm.declaredValue.trim(),
    });
    setExpandedId(null);
  }

  function confirmDelete(customer) {
    Alert.alert('Remove Customer', `Remove "${customer.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        removeCustomer(customer._id);
        if (expandedId === customer._id) setExpandedId(null);
      }},
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Two-column body */}
        <View style={s.columns}>

          {/* LEFT — add form */}
          <ScrollView style={s.leftCol} contentContainerStyle={s.leftContent} keyboardShouldPersistTaps="handled">

            <Text style={s.colHead}>＋ Add Customer</Text>

            <Text style={s.lbl}>Name *</Text>
            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={f('name')}
              placeholder="Customer name"
              placeholderTextColor={C.text3}
            />

            <Text style={s.lbl}>Phone</Text>
            <TextInput
              style={s.input}
              value={form.phone}
              onChangeText={f('phone')}
              placeholder="Phone number"
              placeholderTextColor={C.text3}
              keyboardType="phone-pad"
            />

            <Text style={s.lbl}>Delivery Address</Text>
            <TextInput
              style={s.input}
              value={form.address}
              onChangeText={f('address')}
              placeholder="Delivery address"
              placeholderTextColor={C.text3}
            />

            <Text style={s.lbl}>Notes</Text>
            <TextInput
              style={[s.input, s.multiline]}
              value={form.notes}
              onChangeText={f('notes')}
              placeholder="Special instructions…"
              placeholderTextColor={C.text3}
              multiline
              numberOfLines={3}
            />

            <Text style={s.lbl}>Declared Value ($)</Text>
            <TextInput
              style={s.input}
              value={form.declaredValue}
              onChangeText={f('declaredValue')}
              placeholder="0.00"
              placeholderTextColor={C.text3}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
              <Text style={s.addBtnTxt}>＋ Add Customer</Text>
            </TouchableOpacity>

          </ScrollView>

          {/* Vertical divider */}
          <View style={s.divider} />

          {/* RIGHT — customer list */}
          <ScrollView style={s.rightCol} contentContainerStyle={s.rightContent} keyboardShouldPersistTaps="handled">

            <Text style={s.colHead}>👤 Customers</Text>

            {customers.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>👤</Text>
                <Text style={s.emptyTxt}>Customers{'\n'}appear here</Text>
              </View>
            ) : (
              customers.map(customer => {
                const isExp = expandedId === customer._id;
                return (
                  <View key={String(customer._id)} style={s.card}>
                    <View style={s.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardName} numberOfLines={1}>{customer.name}</Text>
                        {customer.phone ? <Text style={s.cardSub} numberOfLines={1}>{customer.phone}</Text> : null}
                        {customer.address ? <Text style={s.cardSub} numberOfLines={1}>{customer.address}</Text> : null}
                        {customer.declaredValue ? (
                          <View style={s.valueBadge}>
                            <Text style={s.valueBadgeTxt}>${customer.declaredValue}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={s.cardBtns}>
                        <TouchableOpacity style={s.iconBtn} onPress={() => isExp ? setExpandedId(null) : startEdit(customer)}>
                          <Text style={s.iconBtnTxt}>{isExp ? '✕' : '✏️'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.iconBtn} onPress={() => confirmDelete(customer)}>
                          <Text style={s.iconBtnTxt}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {isExp && (
                      <View style={s.editBox}>
                        <Text style={s.lbl}>Name *</Text>
                        <TextInput style={s.input} value={editForm.name} onChangeText={ef('name')} placeholderTextColor={C.text3} />
                        <Text style={s.lbl}>Phone</Text>
                        <TextInput style={s.input} value={editForm.phone} onChangeText={ef('phone')} placeholderTextColor={C.text3} keyboardType="phone-pad" />
                        <Text style={s.lbl}>Delivery Address</Text>
                        <TextInput style={s.input} value={editForm.address} onChangeText={ef('address')} placeholderTextColor={C.text3} />
                        <Text style={s.lbl}>Notes</Text>
                        <TextInput style={[s.input, s.multiline]} value={editForm.notes} onChangeText={ef('notes')} placeholderTextColor={C.text3} multiline numberOfLines={2} />
                        <Text style={s.lbl}>Declared Value ($)</Text>
                        <TextInput style={s.input} value={editForm.declaredValue} onChangeText={ef('declaredValue')} placeholderTextColor={C.text3} keyboardType="decimal-pad" />
                        <TouchableOpacity style={s.saveBtn} onPress={() => saveEdit(customer)}>
                          <Text style={s.saveBtnTxt}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Bottom bar */}
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.skipBtn} onPress={() => navigation.navigate('AddCargo')}>
            <Text style={s.skipTxt}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.nextBtn, customers.length === 0 && s.nextBtnDim]}
            onPress={() => navigation.navigate('AddCargo')}
          >
            <Text style={s.nextTxt}>
              {customers.length === 0
                ? 'Next → Add Cargo 📦'
                : `Next → (${customers.length} customer${customers.length !== 1 ? 's' : ''}) 📦`}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  columns:     { flex: 1, flexDirection: 'row' },
  leftCol:     { flex: 1 },
  leftContent: { padding: 12, paddingBottom: 20 },
  divider:     { width: 1, backgroundColor: C.border },
  rightCol:    { flex: 1 },
  rightContent:{ padding: 10, paddingBottom: 20 },

  colHead: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 10, letterSpacing: -0.2 },

  lbl:   { fontSize: 9, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, color: C.text, backgroundColor: C.surface },
  multiline: { minHeight: 60, textAlignVertical: 'top' },

  addBtn:    { marginTop: 12, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingTop: 50 },
  emptyIcon:  { fontSize: 34, marginBottom: 8 },
  emptyTxt:   { fontSize: 11, color: C.text3, textAlign: 'center', lineHeight: 17 },

  card:    { backgroundColor: C.surface, borderRadius: 10, padding: 9, marginBottom: 7, borderWidth: 1, borderColor: C.border },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName:{ fontSize: 12, fontWeight: '800', color: C.text },
  cardSub: { fontSize: 10, color: C.text2, marginTop: 1 },

  valueBadge:    { marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#eff6ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#bfdbfe' },
  valueBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#1d4ed8' },

  cardBtns: { gap: 5, alignItems: 'center' },
  iconBtn:    { padding: 5, borderRadius: 6, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, marginBottom: 2 },
  iconBtnTxt: { fontSize: 12 },

  editBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn:    { marginTop: 8, backgroundColor: C.primary, borderRadius: 7, paddingVertical: 7, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  bottomBar: { flexDirection: 'row', gap: 8, padding: 10, paddingHorizontal: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  skipBtn:   { flex: 0, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  skipTxt:   { color: C.text2, fontSize: 13, fontWeight: '700' },
  nextBtn:   { flex: 1, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  nextBtnDim:{ opacity: 0.65 },
  nextTxt:   { color: '#fff', fontSize: 13, fontWeight: '800' },
});
