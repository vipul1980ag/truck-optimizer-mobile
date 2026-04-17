import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

function suggestTruck(trucks, totalWeight, totalVol, hasDG, hasFragile, category) {
  const semi = trucks.find(t => t.maxWt >= 30000) || trucks[0];
  const box  = trucks.find(t => t.maxWt <  30000) || trucks[0];
  if (!semi || !box) return null;
  const boxVol = box.length * box.width * box.height;

  if (hasDG)                     return { truck: semi, reason: 'DG-certified truck required for dangerous goods' };
  if (totalWeight > box.maxWt)   return { truck: semi, reason: `cargo weight (${totalWeight.toLocaleString()} lbs) exceeds box truck limit` };
  if (totalVol > boxVol * 0.9)   return { truck: semi, reason: `cargo volume (${totalVol.toFixed(0)} cu ft) requires larger truck` };
  if (category === 'industrial') return { truck: semi, reason: 'industrial cargo suits a large semi truck' };
  if (hasFragile)                return { truck: box,  reason: 'handle-with-care items — box truck provides better control' };
                                  return { truck: box,  reason: 'cargo fits efficiently in a box truck' };
}

export default function ReviewCargoScreen({ navigation }) {
  const { items, updateItem, removeItem, cargoCategory, customers,
          startLocation, destLocation, selectedTruck, setSelectedTruck } = useWizard();
  const customerMap = Object.fromEntries(customers.map(c => [c._id, c]));
  const [expandedId,      setExpandedId]      = useState(null);
  const [editForm,        setEditForm]        = useState({});
  const [suggestion,      setSuggestion]      = useState(null); // {truck, reason}
  const [allTrucks,       setAllTrucks]       = useState([]);
  const [trucksLoading,   setTrucksLoading]   = useState(true);
  const [consolidation,   setConsolidation]   = useState(null); // best matching booking

  // Auto go back if all items deleted
  useEffect(() => {
    if (items.length === 0) navigation.goBack();
  }, [items.length]);

  useEffect(() => {
    api.getData()
      .then(data => {
        const trucks = data.trucks || [];
        setAllTrucks(trucks);
        if (!trucks.length) return;
        const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
        const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
        const hasDG       = items.some(i => i.isDG);
        const hasFragile  = items.some(i => i.isFragile);
        const result = suggestTruck(trucks, totalWeight, totalVol, hasDG, hasFragile, cargoCategory);
        setSuggestion(result);
      })
      .catch(() => {})
      .finally(() => setTrucksLoading(false));
  }, []);

  // C3: Load consolidation options when route is known
  useEffect(() => {
    if (!startLocation || !destLocation) return;
    const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
    const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
    api.getAvailableTrucks(
      startLocation.lat, startLocation.lng,
      destLocation.lat,  destLocation.lng,
      totalWeight, totalVol
    )
      .then(matches => { if (matches.length) setConsolidation(matches[0]); })
      .catch(() => {}); // fail silently
  }, [startLocation, destLocation]);

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

  const suggestedTruck = suggestion?.truck;
  const suggestionReason = suggestion?.reason;
  const utilizationPct = suggestedTruck
    ? Math.max(
        totalWeight / suggestedTruck.maxWt,
        totalVol / (suggestedTruck.length * suggestedTruck.width * suggestedTruck.height)
      )
    : 0;

  function renderItem({ item }) {
    const isExpanded = expandedId === item._id;
    return (
      <View style={[s.card, item.isDG && s.cardDG]}>
        {/* Summary row */}
        <View style={s.cardRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <Text style={s.itemName}>{item.name}</Text>
              {item.isDG && (
                <View style={s.dgBadge}><Text style={s.dgBadgeTxt}>⚠ DG</Text></View>
              )}
              {item.isFragile && (
                <View style={s.fragileBadge}><Text style={s.fragileBadgeTxt}>🔔 Handle with care</Text></View>
              )}
              {item.customerId && customerMap[item.customerId] && (
                <View style={s.customerBadge}><Text style={s.customerBadgeTxt}>👤 {customerMap[item.customerId].name}</Text></View>
              )}
            </View>
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

  // C4: Show truck picker alert
  function openTruckPicker() {
    if (!allTrucks.length) return;
    const options = allTrucks.map(t => t.name);
    options.push('Cancel');
    Alert.alert('Select Truck', 'Choose a truck for this booking', options.map((label, index) => ({
      text: label,
      style: index === options.length - 1 ? 'cancel' : 'default',
      onPress: () => {
        if (index < allTrucks.length) setSelectedTruck(allTrucks[index]);
      },
    })));
  }

  const effectiveTruck = selectedTruck || suggestedTruck;

  function ListFooter() {
    if (trucksLoading) {
      return (
        <View style={s.suggestionCard}>
          <ActivityIndicator color={C.primary} />
          <Text style={[s.suggReason, { marginTop: 6 }]}>Analyzing cargo…</Text>
        </View>
      );
    }

    const displayTruck = effectiveTruck?.truck || effectiveTruck;
    const displayReason = selectedTruck ? 'Manually selected' : suggestionReason;
    const displayUtil = displayTruck
      ? Math.max(
          totalWeight / displayTruck.maxWt,
          totalVol / (displayTruck.length * displayTruck.width * displayTruck.height)
        )
      : 0;

    return (
      <>
        {displayTruck && (
          <View style={s.suggestionCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.suggHead}>🚛 Recommended Truck</Text>
              {allTrucks.length > 1 && (
                <TouchableOpacity onPress={openTruckPicker}>
                  <Text style={s.changeLink}>Change →</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={s.suggName}>{displayTruck.name}{displayTruck.licensePlate ? ` · ${displayTruck.licensePlate}` : ''}</Text>
            <Text style={s.suggReason}>{displayReason}</Text>
            <View style={s.suggStats}>
              <Text style={s.suggStat}>{displayTruck.length} ft · {displayTruck.maxWt.toLocaleString()} lbs max</Text>
              <Text style={s.suggStat}>Utilization: {Math.min(Math.round(displayUtil * 100), 100)}%</Text>
            </View>
          </View>
        )}

        {/* C3: Consolidation banner */}
        {consolidation && (
          <View style={s.consolidationCard}>
            <Text style={s.consolHead}>🚛 Route consolidation available</Text>
            <Text style={s.consolBody}>
              {consolidation.truck.name}{consolidation.truck.licensePlate ? ` · ${consolidation.truck.licensePlate}` : ''}
            </Text>
            <Text style={s.consolRoute}>
              {consolidation.booking.route?.fromLabel || ''} → {consolidation.booking.route?.toLabel || ''}
            </Text>
            <Text style={s.consolCapacity}>
              {Math.round(consolidation.remainingPct)}% capacity remaining
            </Text>
            <TouchableOpacity style={s.consolBtn} onPress={() => {
              Alert.alert(
                'Join Shipment',
                `Join ${consolidation.truck.name} on this route? This may reduce your cost.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Join', onPress: () => setSelectedTruck(consolidation.truck) },
                ]
              );
            }}>
              <Text style={s.consolBtnTxt}>Join this truck</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
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
        ListFooterComponent={<ListFooter />}
      />

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.addMoreBtn} onPress={() => navigation.goBack()}>
          <Text style={s.addMoreTxt}>＋ Add More</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.viz3dBtn} onPress={() => navigation.navigate('Viz3D')}>
          <Text style={s.viz3dTxt}>🧊 3D Load</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.confirmBtn} onPress={() => navigation.navigate('ShipOption')}>
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
  cardDG:  { borderColor: '#fed7aa', backgroundColor: '#fffbeb' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  itemName:{ fontSize: 14, fontWeight: '800', color: C.text },
  itemDims:{ fontSize: 11, color: C.text2, marginTop: 2 },

  dgBadge:      { backgroundColor: '#ffedd5', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#fed7aa' },
  dgBadgeTxt:   { fontSize: 8, fontWeight: '800', color: '#9a3412' },
  fragileBadge:    { backgroundColor: '#d1fae5', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#6ee7b7' },
  fragileBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#065f46' },
  customerBadge:    { backgroundColor: '#eff6ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#bfdbfe' },
  customerBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#1d4ed8' },

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

  // Truck suggestion card
  suggestionCard: { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: C.primary },
  suggHead:  { fontSize: 11, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  suggName:  { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 4 },
  suggReason:{ fontSize: 12, color: C.text2, lineHeight: 17, marginBottom: 10 },
  suggStats: { flexDirection: 'row', gap: 16 },
  suggStat:  { fontSize: 11, color: C.primary, fontWeight: '700' },
  changeLink: { fontSize: 12, fontWeight: '700', color: C.primary },

  // Consolidation card
  consolidationCard: {
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#86efac',
  },
  consolHead:     { fontSize: 13, fontWeight: '900', color: '#15803d', marginBottom: 4 },
  consolBody:     { fontSize: 13, fontWeight: '700', color: '#166534', marginBottom: 2 },
  consolRoute:    { fontSize: 11, color: '#166534', marginBottom: 2 },
  consolCapacity: { fontSize: 11, color: '#15803d', marginBottom: 10 },
  consolBtn:      { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  consolBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '800' },

  bottomBar: {
    flexDirection: 'row', gap: 8, padding: 12, paddingHorizontal: 16,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
  },
  addMoreBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.primary, alignItems: 'center',
  },
  addMoreTxt: { color: C.primary, fontSize: 13, fontWeight: '800' },
  viz3dBtn:   { flex: 1, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#3b82f6' },
  viz3dTxt:   { color: '#60a5fa', fontSize: 13, fontWeight: '800' },
  confirmBtn: { flex: 1, backgroundColor: C.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
