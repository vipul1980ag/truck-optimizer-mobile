import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';

export default function ReviewCargoScreen({ navigation }) {
  const { items, updateItem, removeItem } = useWizard();
  const [expandedId, setExpandedId] = useState(null);
  const [editForm,   setEditForm]   = useState({});

  // Auto go back if all items deleted
  useEffect(() => {
    if (items.length === 0) navigation.goBack();
  }, [items.length]);

  function startEdit(item) {
    setExpandedId(item._id);
    setEditForm({
      name:   item.name,
      length: String(item.length),
      width:  String(item.width),
      height: String(item.height),
      weight: String(item.weight),
      qty:    String(item.qty),
    });
  }

  function saveEdit(item) {
    if (!editForm.name.trim()) { Alert.alert('Required', 'Item name cannot be empty.'); return; }
    updateItem(item._id, {
      name:   editForm.name.trim(),
      length: parseFloat(editForm.length) || item.length,
      width:  parseFloat(editForm.width)  || item.width,
      height: parseFloat(editForm.height) || item.height,
      weight: parseFloat(editForm.weight) || item.weight,
      qty:    parseInt(editForm.qty)      || item.qty,
    });
    setExpandedId(null);
  }

  function confirmDelete(item) {
    Alert.alert('Remove Item', `Remove "${item.name}" from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(item._id) },
    ]);
  }

  const ef = k => v => setEditForm(p => ({ ...p, [k]: v }));

  const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
  const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);

  function renderItem({ item }) {
    const isExpanded = expandedId === item._id;
    return (
      <View style={s.card}>
        {/* Summary row */}
        <View style={s.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemDims}>
              {item.length}×{item.width}×{item.height} ft · {item.weight} lbs · qty {item.qty}
            </Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={() => isExpanded ? setExpandedId(null) : startEdit(item)}>
            <Text style={s.iconBtnTxt}>{isExpanded ? '✕' : '✏️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { marginLeft: 4 }]} onPress={() => confirmDelete(item)}>
            <Text style={s.iconBtnTxt}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* Edit expand */}
        {isExpanded && (
          <View style={s.editBox}>
            <Text style={s.lbl}>Item Name</Text>
            <TextInput style={s.input} value={editForm.name} onChangeText={ef('name')} placeholderTextColor={C.text3} />
            <View style={s.dimRow}>
              <View style={s.dimField}>
                <Text style={s.lbl}>Length (ft)</Text>
                <TextInput style={s.input} value={editForm.length} onChangeText={ef('length')} keyboardType="decimal-pad" />
              </View>
              <View style={s.dimField}>
                <Text style={s.lbl}>Width (ft)</Text>
                <TextInput style={s.input} value={editForm.width} onChangeText={ef('width')} keyboardType="decimal-pad" />
              </View>
              <View style={s.dimField}>
                <Text style={s.lbl}>Height (ft)</Text>
                <TextInput style={s.input} value={editForm.height} onChangeText={ef('height')} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={s.dimRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.lbl}>Weight (lbs)</Text>
                <TextInput style={s.input} value={editForm.weight} onChangeText={ef('weight')} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.lbl}>Quantity</Text>
                <TextInput style={s.input} value={editForm.qty} onChangeText={ef('qty')} keyboardType="number-pad" />
              </View>
            </View>
            <TouchableOpacity style={s.saveBtn} onPress={() => saveEdit(item)}>
              <Text style={s.saveBtnTxt}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Totals banner */}
      <View style={s.banner}>
        <View style={s.bannerItem}>
          <Text style={s.bannerVal}>{items.length}</Text>
          <Text style={s.bannerLbl}>Items</Text>
        </View>
        <View style={s.bannerItem}>
          <Text style={s.bannerVal}>{totalWeight.toLocaleString()}</Text>
          <Text style={s.bannerLbl}>Total lbs</Text>
        </View>
        <View style={s.bannerItem}>
          <Text style={s.bannerVal}>{totalVol.toFixed(0)}</Text>
          <Text style={s.bannerLbl}>Cu ft</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => String(i._id)}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
      />

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.addMoreBtn} onPress={() => navigation.goBack()}>
          <Text style={s.addMoreTxt}>＋ Add More</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.confirmBtn} onPress={() => navigation.navigate('Route')}>
          <Text style={s.confirmTxt}>Confirm →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { padding: 14, paddingBottom: 8 },

  banner: {
    flexDirection: 'row', backgroundColor: C.navy,
    paddingVertical: 10, paddingHorizontal: 20,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerVal:  { fontSize: 18, fontWeight: '900', color: '#f1f5f9' },
  bannerLbl:  { fontSize: 10, color: '#64748b', marginTop: 2 },

  card:    { backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  itemName:{ fontSize: 14, fontWeight: '800', color: C.text },
  itemDims:{ fontSize: 11, color: C.text2, marginTop: 2 },

  iconBtn:    { padding: 6, borderRadius: 8, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  iconBtnTxt: { fontSize: 14 },

  editBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  lbl:     { fontSize: 10, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3, marginTop: 8 },
  input:   {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 13, color: C.text, backgroundColor: C.surface,
  },
  dimRow:   { flexDirection: 'row', gap: 8 },
  dimField: { flex: 1 },

  saveBtn:    { marginTop: 12, backgroundColor: C.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  bottomBar: {
    flexDirection: 'row', gap: 10, padding: 12, paddingHorizontal: 16,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
  },
  addMoreBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.primary, alignItems: 'center',
  },
  addMoreTxt: { color: C.primary, fontSize: 14, fontWeight: '800' },
  confirmBtn: { flex: 1, backgroundColor: C.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
