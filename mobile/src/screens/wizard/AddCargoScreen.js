import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';

// ── Catalogs ──────────────────────────────────────────────────────────────────
const MOBILE_HOUSEHOLD = [
  { cat: 'Living Room', items: [
    { name: 'Sofa (3-seat)',        l: 7.5, w: 3.0, h: 3.0, wt: 180 },
    { name: 'Loveseat',             l: 5.0, w: 3.0, h: 3.0, wt: 120 },
    { name: 'Armchair',             l: 3.0, w: 3.0, h: 3.5, wt:  70 },
    { name: 'Recliner',             l: 3.5, w: 3.0, h: 3.5, wt: 100 },
    { name: 'Sectional Sofa',       l:10.0, w: 5.0, h: 3.0, wt: 300 },
    { name: 'Coffee Table',         l: 4.0, w: 2.0, h: 1.5, wt:  50 },
    { name: 'Side Table',           l: 1.5, w: 1.5, h: 2.0, wt:  25 },
    { name: 'TV Stand',             l: 5.0, w: 1.5, h: 2.0, wt:  80 },
    { name: 'Entertainment Center', l: 6.0, w: 1.5, h: 5.0, wt: 200 },
    { name: 'Bookshelf (tall)',      l: 3.0, w: 1.0, h: 6.0, wt:  60 },
    { name: 'Ottoman',              l: 3.0, w: 2.0, h: 1.5, wt:  40 },
    { name: 'Floor Lamp',           l: 1.0, w: 1.0, h: 5.5, wt:  10 },
    { name: 'TV 55"',               l: 4.5, w: 0.5, h: 2.5, wt:  40 },
    { name: 'TV 75"',               l: 5.7, w: 0.5, h: 3.2, wt:  70 },
  ]},
  { cat: 'Bedroom', items: [
    { name: 'King Bed Frame',       l: 7.0, w: 6.5, h: 4.0, wt: 250 },
    { name: 'Queen Bed Frame',      l: 7.0, w: 5.5, h: 4.0, wt: 180 },
    { name: 'Full Bed Frame',       l: 6.5, w: 4.5, h: 4.0, wt: 140 },
    { name: 'Twin Bed Frame',       l: 6.5, w: 3.5, h: 4.0, wt: 100 },
    { name: 'King Mattress',        l: 6.5, w: 6.5, h: 1.0, wt: 100 },
    { name: 'Queen Mattress',       l: 6.5, w: 5.0, h: 1.0, wt:  80 },
    { name: 'Dresser (wide)',        l: 4.0, w: 1.5, h: 4.0, wt: 150 },
    { name: 'Wardrobe',             l: 4.0, w: 2.0, h: 6.0, wt: 250 },
    { name: 'Nightstand',           l: 1.5, w: 1.5, h: 2.0, wt:  30 },
    { name: 'Bunk Bed',             l: 7.0, w: 3.5, h: 6.0, wt: 200 },
  ]},
  { cat: 'Dining Room', items: [
    { name: 'Dining Table (6-seat)', l: 6.0, w: 3.0, h: 2.5, wt: 150 },
    { name: 'Dining Table (4-seat)', l: 4.0, w: 3.0, h: 2.5, wt: 100 },
    { name: 'Dining Chair',          l: 1.5, w: 1.5, h: 3.5, wt:  20 },
    { name: 'Buffet / Sideboard',    l: 5.0, w: 1.5, h: 3.0, wt: 180 },
    { name: 'China Cabinet',         l: 3.5, w: 1.5, h: 6.0, wt: 200 },
  ]},
  { cat: 'Kitchen / Appliances', items: [
    { name: 'Refrigerator (full)',   l: 3.0, w: 2.5, h: 6.0, wt: 300 },
    { name: 'Oven / Range',          l: 2.5, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Washing Machine',       l: 2.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Dryer',                 l: 2.0, w: 2.5, h: 3.5, wt: 150 },
    { name: 'Dishwasher',            l: 2.0, w: 2.0, h: 3.5, wt: 100 },
    { name: 'Chest Freezer',         l: 4.0, w: 2.0, h: 3.0, wt: 150 },
    { name: 'Kitchen Island',        l: 4.0, w: 2.0, h: 3.0, wt: 200 },
  ]},
  { cat: 'Home Office', items: [
    { name: 'Desk (large)',          l: 5.0, w: 2.0, h: 2.5, wt: 100 },
    { name: 'L-Shaped Desk',         l: 6.0, w: 5.0, h: 2.5, wt: 150 },
    { name: 'Office Chair',          l: 2.0, w: 2.0, h: 4.0, wt:  40 },
    { name: 'Filing Cabinet (4dr)',  l: 1.5, w: 2.0, h: 4.5, wt: 130 },
    { name: 'Bookcase',              l: 3.0, w: 1.0, h: 6.0, wt:  80 },
  ]},
  { cat: 'Exercise Equipment', items: [
    { name: 'Treadmill',             l: 5.5, w: 2.5, h: 4.0, wt: 250 },
    { name: 'Exercise Bike',         l: 3.5, w: 2.0, h: 4.0, wt: 100 },
    { name: 'Elliptical Trainer',    l: 5.0, w: 2.5, h: 5.0, wt: 200 },
    { name: 'Weight Bench',          l: 4.0, w: 2.0, h: 3.5, wt:  80 },
    { name: 'Squat Rack',            l: 4.0, w: 4.0, h: 7.0, wt: 300 },
  ]},
  { cat: 'Outdoor / Garage', items: [
    { name: 'Lawn Mower (push)',     l: 3.0, w: 2.0, h: 3.0, wt:  80 },
    { name: 'Riding Mower',          l: 6.0, w: 4.0, h: 4.0, wt: 450 },
    { name: 'Patio Table',           l: 4.0, w: 4.0, h: 2.5, wt:  80 },
    { name: 'BBQ Grill',             l: 2.5, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Bicycle',               l: 5.5, w: 1.5, h: 3.5, wt:  25 },
    { name: 'Tool Cabinet',          l: 2.5, w: 1.5, h: 5.0, wt: 180 },
  ]},
  { cat: 'Moving Boxes', items: [
    { name: 'Small Box',             l: 1.5, w: 1.5, h: 1.5, wt:  40 },
    { name: 'Medium Box',            l: 2.0, w: 1.5, h: 1.5, wt:  60 },
    { name: 'Large Box',             l: 2.0, w: 2.0, h: 2.0, wt:  80 },
    { name: 'Extra-Large Box',       l: 2.5, w: 2.0, h: 2.0, wt: 100 },
    { name: 'Wardrobe Box',          l: 2.0, w: 2.0, h: 4.0, wt:  60 },
  ]},
];

const MOBILE_INDUSTRIAL = [
  { cat: 'Pallets & Crates', items: [
    { name: 'Standard Pallet',       l: 4.0, w: 3.5, h: 0.6, wt:   50 },
    { name: 'Pallet + Load',         l: 4.0, w: 3.5, h: 4.5, wt: 2000 },
    { name: 'Wooden Crate (small)',  l: 3.0, w: 2.0, h: 2.0, wt:   80 },
    { name: 'Wooden Crate (large)',  l: 6.0, w: 4.0, h: 4.0, wt:  200 },
    { name: 'Steel Skid',            l: 5.0, w: 3.0, h: 0.5, wt:  150 },
  ]},
  { cat: 'Industrial Machinery', items: [
    { name: 'CNC Machine (small)',   l: 6.0, w: 4.0, h: 5.0, wt: 4000 },
    { name: 'Compressor',            l: 5.0, w: 3.0, h: 4.0, wt: 1500 },
    { name: 'Generator (portable)',  l: 4.0, w: 2.0, h: 2.5, wt:  500 },
    { name: 'Generator (standby)',   l: 8.0, w: 3.0, h: 4.0, wt: 2500 },
    { name: 'Conveyor Belt (8 ft)',  l: 9.0, w: 2.0, h: 3.0, wt:  600 },
  ]},
  { cat: 'Warehouse Equipment', items: [
    { name: 'Pallet Rack Section',   l: 8.0, w: 3.5, h: 8.0, wt: 250 },
    { name: 'Shelving Unit (heavy)', l: 6.0, w: 2.0, h: 6.0, wt: 120 },
    { name: 'Industrial Workbench',  l: 6.0, w: 2.5, h: 3.5, wt: 250 },
    { name: 'Storage Cabinet',       l: 3.0, w: 1.5, h: 5.5, wt: 150 },
  ]},
  { cat: 'Material Handling', items: [
    { name: 'Forklift (3-ton)',      l: 9.0, w: 4.0, h: 6.0, wt: 9000 },
    { name: 'Pallet Jack (manual)',  l: 5.5, w: 1.5, h: 4.0, wt:  170 },
    { name: 'Pallet Jack (electric)',l: 6.0, w: 2.0, h: 4.5, wt:  600 },
    { name: 'Hand Truck / Dolly',    l: 1.5, w: 1.0, h: 4.5, wt:   25 },
    { name: 'IBC Tote (275-gal)',    l: 3.5, w: 3.0, h: 3.5, wt: 2800 },
  ]},
  { cat: 'Construction', items: [
    { name: 'Lumber Bundle (8 ft)',  l:  8.0, w: 2.0, h: 2.0, wt:  800 },
    { name: 'Plywood Bundle',        l:  8.5, w: 4.5, h: 2.0, wt:  700 },
    { name: 'Drywall Bundle',        l:  8.5, w: 4.5, h: 1.5, wt: 1200 },
    { name: 'Steel Beam (20 ft)',    l: 20.0, w: 1.0, h: 1.0, wt: 1000 },
    { name: 'HVAC Unit (split)',     l:  4.0, w: 2.0, h: 2.5, wt:  300 },
  ]},
  { cat: 'Office & Business', items: [
    { name: 'Server Rack (42U)',     l: 3.0, w: 3.5, h: 6.5, wt: 250 },
    { name: 'Commercial Copier',     l: 2.5, w: 2.0, h: 3.5, wt: 200 },
    { name: 'Safe (commercial)',     l: 2.5, w: 2.0, h: 4.0, wt: 1000 },
    { name: 'Vending Machine',       l: 3.0, w: 2.5, h: 6.0, wt: 500 },
  ]},
  { cat: 'Retail Equipment', items: [
    { name: 'Glass Display Case',    l: 4.0, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Checkout Counter',      l: 5.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Gondola Shelving',      l: 4.0, w: 1.5, h: 5.0, wt: 100 },
    { name: 'Commercial Refrigerator',l:3.0, w: 2.5, h: 6.0, wt: 400 },
  ]},
  { cat: 'Food & Beverage', items: [
    { name: 'Restaurant Range',      l: 3.5, w: 2.5, h: 3.5, wt: 350 },
    { name: 'Commercial Dishwasher', l: 4.0, w: 2.5, h: 4.0, wt: 300 },
    { name: 'Ice Machine',           l: 2.5, w: 2.0, h: 3.5, wt: 250 },
    { name: 'Prep Table (stainless)',l: 5.0, w: 2.0, h: 3.0, wt: 200 },
  ]},
];

const BLANK = { name: '', length: '4', width: '4', height: '4', weight: '500', packagingWeight: '0', qty: '1' };

export default function AddCargoScreen({ navigation }) {
  const { items, addItem, updateItem, removeItem } = useWizard();

  const [step,        setStep]        = useState(1);
  const [category,    setCategory]    = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [form,        setForm]        = useState(BLANK);
  const [expandedId,  setExpandedId]  = useState(null);
  const [editForm,    setEditForm]    = useState({});

  const catalog  = category === 'household' ? MOBILE_HOUSEHOLD : MOBILE_INDUSTRIAL;
  const catItems = selectedCat
    ? (catalog.find(c => c.cat === selectedCat)?.items || [])
    : [];

  const f  = k => v => setForm(p => ({ ...p, [k]: v }));
  const ef = k => v => setEditForm(p => ({ ...p, [k]: v }));

  function pickItem(item) {
    setForm(p => ({
      ...p,
      name:            item.name,
      length:          String(item.l),
      width:           String(item.w),
      height:          String(item.h),
      weight:          String(item.wt),
      packagingWeight: '0',
      qty:             '1',
    }));
  }

  function handleAdd() {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter an item name.');
      return;
    }
    addItem({
      name:            form.name.trim(),
      length:          parseFloat(form.length)          || 4,
      width:           parseFloat(form.width)           || 4,
      height:          parseFloat(form.height)          || 4,
      weight:          parseFloat(form.weight)          || 0,
      packagingWeight: parseFloat(form.packagingWeight) || 0,
      qty:             parseInt(form.qty)               || 1,
    });
    // reset form for next addition — stay on same screen
    setStep(1);
    setCategory(null);
    setSelectedCat(null);
    setForm(BLANK);
    setExpandedId(null);
  }

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
    Alert.alert('Remove Item', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        removeItem(item._id);
        if (expandedId === item._id) setExpandedId(null);
      }},
    ]);
  }

  const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── Add form section ── */}
          <View style={s.formCard}>
            <Text style={s.formCardHead}>＋ Add Cargo Item</Text>

            {/* Step 1: category picker */}
            {step === 1 && (
              <>
                <Text style={s.lbl}>Select Category</Text>
                <View style={s.catRow}>
                  <TouchableOpacity style={s.catBtn} onPress={() => { setCategory('household'); setStep(2); }}>
                    <Text style={s.catIcon}>🏠</Text>
                    <Text style={s.catLabel}>Household</Text>
                    <Text style={s.catSub}>Furniture, appliances, boxes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.catBtn} onPress={() => { setCategory('industrial'); setStep(2); }}>
                    <Text style={s.catIcon}>🏭</Text>
                    <Text style={s.catLabel}>Industrial</Text>
                    <Text style={s.catSub}>Pallets, machinery, equipment</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Step 2: sub-cat + item + form */}
            {step === 2 && (
              <>
                <View style={s.stepHead}>
                  <TouchableOpacity onPress={() => { setStep(1); setCategory(null); setSelectedCat(null); setForm(BLANK); }}>
                    <Text style={s.backBtn}>← Category</Text>
                  </TouchableOpacity>
                  <Text style={s.stepHeadTitle}>
                    {category === 'household' ? '🏠 Household' : '🏭 Industrial'}
                  </Text>
                </View>

                <Text style={s.lbl}>Sub-Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                  {catalog.map(c => (
                    <TouchableOpacity
                      key={c.cat}
                      style={[s.chip, selectedCat === c.cat && s.chipActive]}
                      onPress={() => { setSelectedCat(c.cat); setForm(BLANK); }}
                    >
                      <Text style={[s.chipTxt, selectedCat === c.cat && s.chipTxtActive]}>{c.cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {catItems.length > 0 && (
                  <>
                    <Text style={s.lbl}>Select Item</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                      {catItems.map(item => (
                        <TouchableOpacity
                          key={item.name}
                          style={[s.chip, form.name === item.name && s.chipActive]}
                          onPress={() => pickItem(item)}
                        >
                          <Text style={[s.chipTxt, form.name === item.name && s.chipTxtActive]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Text style={s.lbl}>Item Name</Text>
                <TextInput style={s.input} value={form.name} onChangeText={f('name')} placeholder="e.g. Sofa (3-seat)" placeholderTextColor={C.text3} />

                <View style={s.dimRow}>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Length (ft)</Text>
                    <TextInput style={s.input} value={form.length} onChangeText={f('length')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Width (ft)</Text>
                    <TextInput style={s.input} value={form.width} onChangeText={f('width')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Height (ft)</Text>
                    <TextInput style={s.input} value={form.height} onChangeText={f('height')} keyboardType="decimal-pad" />
                  </View>
                </View>

                <View style={s.dimRow}>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Weight (lbs)</Text>
                    <TextInput style={s.input} value={form.weight} onChangeText={f('weight')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Pkg Wt (lbs)</Text>
                    <TextInput style={s.input} value={form.packagingWeight} onChangeText={f('packagingWeight')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Qty</Text>
                    <TextInput style={s.input} value={form.qty} onChangeText={f('qty')} keyboardType="number-pad" />
                  </View>
                </View>

                <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
                  <Text style={s.addBtnTxt}>＋ Add to List</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Added items list ── */}
          {items.length > 0 && (
            <>
              {/* Summary bar */}
              <View style={s.summaryBar}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryVal}>{items.length}</Text>
                  <Text style={s.summaryLbl}>Items</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryVal}>{items.reduce((s,i)=>s+i.qty,0)}</Text>
                  <Text style={s.summaryLbl}>Total Units</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryVal}>{totalWeight.toLocaleString()}</Text>
                  <Text style={s.summaryLbl}>Total lbs</Text>
                </View>
              </View>

              <Text style={s.listHead}>My Cargo List</Text>

              {items.map(item => {
                const isExp = expandedId === item._id;
                return (
                  <View key={String(item._id)} style={s.itemCard}>
                    <View style={s.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.itemName}>{item.name}</Text>
                        <Text style={s.itemDims}>
                          {item.length}×{item.width}×{item.height} ft · {item.weight} lbs · qty {item.qty}
                        </Text>
                      </View>
                      <TouchableOpacity style={s.iconBtn} onPress={() => isExp ? setExpandedId(null) : startEdit(item)}>
                        <Text style={s.iconBtnTxt}>{isExp ? '✕' : '✏️'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.iconBtn, { marginLeft: 6 }]} onPress={() => confirmDelete(item)}>
                        <Text style={s.iconBtnTxt}>🗑</Text>
                      </TouchableOpacity>
                    </View>

                    {isExp && (
                      <View style={s.editBox}>
                        <Text style={s.lbl}>Item Name</Text>
                        <TextInput style={s.input} value={editForm.name} onChangeText={ef('name')} placeholderTextColor={C.text3} />
                        <View style={s.dimRow}>
                          <View style={s.dimField}>
                            <Text style={s.lbl}>Length</Text>
                            <TextInput style={s.input} value={editForm.length} onChangeText={ef('length')} keyboardType="decimal-pad" />
                          </View>
                          <View style={s.dimField}>
                            <Text style={s.lbl}>Width</Text>
                            <TextInput style={s.input} value={editForm.width} onChangeText={ef('width')} keyboardType="decimal-pad" />
                          </View>
                          <View style={s.dimField}>
                            <Text style={s.lbl}>Height</Text>
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
              })}
            </>
          )}

        </ScrollView>

        {/* ── Bottom bar: proceed when items exist ── */}
        {items.length > 0 && (
          <View style={s.bottomBar}>
            <TouchableOpacity style={s.proceedBtn} onPress={() => navigation.navigate('ShipOption')}>
              <Text style={s.proceedTxt}>Next: Choose Shipping ({items.length} item{items.length !== 1 ? 's' : ''}) →</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 14, paddingBottom: 12 },

  // Form card
  formCard:     { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  formCardHead: { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 12 },

  catRow:  { flexDirection: 'row', gap: 10 },
  catBtn:  { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 18, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface2 },
  catIcon:  { fontSize: 26 },
  catLabel: { fontSize: 13, fontWeight: '800', color: C.text },
  catSub:   { fontSize: 10, color: C.text2, textAlign: 'center', paddingHorizontal: 2 },

  stepHead:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  stepHeadTitle: { fontSize: 13, fontWeight: '800', color: C.text },
  backBtn:       { fontSize: 13, color: C.primary, fontWeight: '700' },

  lbl: { fontSize: 10, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4, marginTop: 10 },

  chipScroll: { marginBottom: 2 },
  chip:       { paddingHorizontal: 12, paddingVertical: 6, marginRight: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  chipActive: { borderColor: C.primary, backgroundColor: '#eff6ff' },
  chipTxt:    { fontSize: 12, color: C.text2, fontWeight: '600' },
  chipTxtActive: { color: C.primary, fontWeight: '800' },

  input:    { borderWidth: 1.5, borderColor: C.border, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: C.text, backgroundColor: C.surface },
  dimRow:   { flexDirection: 'row', gap: 8, marginTop: 2 },
  dimField: { flex: 1 },

  addBtn:    { marginTop: 14, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Summary bar
  summaryBar:  { flexDirection: 'row', backgroundColor: C.navy, borderRadius: 12, padding: 12, marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal:  { fontSize: 17, fontWeight: '900', color: '#f1f5f9' },
  summaryLbl:  { fontSize: 9, color: '#64748b', marginTop: 1 },

  listHead: { fontSize: 13, fontWeight: '800', color: C.text2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Item cards
  itemCard: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  itemRow:  { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 13, fontWeight: '800', color: C.text },
  itemDims: { fontSize: 11, color: C.text2, marginTop: 2 },

  iconBtn:    { padding: 6, borderRadius: 8, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  iconBtnTxt: { fontSize: 13 },

  editBox:    { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn:    { marginTop: 10, backgroundColor: C.primary, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Bottom proceed bar
  bottomBar:  { padding: 12, paddingHorizontal: 14, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  proceedBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  proceedTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
