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
  const { items, addItem } = useWizard();

  const [step,        setStep]        = useState(1);
  const [category,    setCategory]    = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [form,        setForm]        = useState(BLANK);

  const catalog = category === 'household' ? MOBILE_HOUSEHOLD : MOBILE_INDUSTRIAL;
  const catItems = selectedCat
    ? (catalog.find(c => c.cat === selectedCat)?.items || [])
    : [];

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

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
      name:           form.name.trim(),
      length:         parseFloat(form.length)         || 4,
      width:          parseFloat(form.width)          || 4,
      height:         parseFloat(form.height)         || 4,
      weight:         parseFloat(form.weight)         || 0,
      packagingWeight:parseFloat(form.packagingWeight)|| 0,
      qty:            parseInt(form.qty)              || 1,
    });
    // reset to step 1 for next item
    setStep(1);
    setCategory(null);
    setSelectedCat(null);
    setForm(BLANK);
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── Step 1: category picker ── */}
          {step === 1 && (
            <>
              <Text style={s.sectionTitle}>What type of cargo?</Text>
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

          {/* ── Step 2: sub-cat + item + form ── */}
          {step === 2 && (
            <>
              {/* Back + heading */}
              <View style={s.stepHead}>
                <TouchableOpacity onPress={() => { setStep(1); setCategory(null); setSelectedCat(null); setForm(BLANK); }}>
                  <Text style={s.backBtn}>← Category</Text>
                </TouchableOpacity>
                <Text style={s.stepHeadTitle}>
                  {category === 'household' ? '🏠 Household' : '🏭 Industrial'}
                </Text>
              </View>

              {/* Sub-category chips */}
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

              {/* Item chips */}
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

              {/* Form */}
              <Text style={s.lbl}>Item Name</Text>
              <TextInput style={s.input} value={form.name} onChangeText={f('name')} placeholder="e.g. Sofa (3-seat)" placeholderTextColor={C.text3} />

              <View style={s.dimRow}>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Length (ft)</Text>
                  <TextInput style={s.input} value={form.length} onChangeText={f('length')} keyboardType="decimal-pad" placeholderTextColor={C.text3} />
                </View>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Width (ft)</Text>
                  <TextInput style={s.input} value={form.width} onChangeText={f('width')} keyboardType="decimal-pad" placeholderTextColor={C.text3} />
                </View>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Height (ft)</Text>
                  <TextInput style={s.input} value={form.height} onChangeText={f('height')} keyboardType="decimal-pad" placeholderTextColor={C.text3} />
                </View>
              </View>

              <View style={s.dimRow}>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Weight (lbs)</Text>
                  <TextInput style={s.input} value={form.weight} onChangeText={f('weight')} keyboardType="decimal-pad" placeholderTextColor={C.text3} />
                </View>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Pkg Wt (lbs)</Text>
                  <TextInput style={s.input} value={form.packagingWeight} onChangeText={f('packagingWeight')} keyboardType="decimal-pad" placeholderTextColor={C.text3} />
                </View>
                <View style={s.dimField}>
                  <Text style={s.lbl}>Qty</Text>
                  <TextInput style={s.input} value={form.qty} onChangeText={f('qty')} keyboardType="number-pad" placeholderTextColor={C.text3} />
                </View>
              </View>

              <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
                <Text style={s.addBtnTxt}>＋ Add Item</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>

        {/* ── Bottom bar ── */}
        {items.length > 0 && (
          <View style={s.bottomBar}>
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{items.length} item{items.length !== 1 ? 's' : ''} added</Text>
            </View>
            <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate('ReviewCargo')}>
              <Text style={s.viewBtnTxt}>View List ({items.length}) →</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 14 },
  catRow:  { flexDirection: 'row', gap: 12, marginBottom: 8 },
  catBtn:  {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 20,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface,
  },
  catIcon:  { fontSize: 28 },
  catLabel: { fontSize: 14, fontWeight: '800', color: C.text },
  catSub:   { fontSize: 10, color: C.text2, textAlign: 'center', paddingHorizontal: 4 },

  stepHead:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepHeadTitle: { fontSize: 14, fontWeight: '800', color: C.text },
  backBtn:       { fontSize: 13, color: C.primary, fontWeight: '700' },

  lbl: { fontSize: 10, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4, marginTop: 10 },

  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, marginRight: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive:   { borderColor: C.primary, backgroundColor: '#eff6ff' },
  chipTxt:      { fontSize: 12, color: C.text2, fontWeight: '600' },
  chipTxtActive:{ color: C.primary, fontWeight: '800' },

  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 9,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, color: C.text, backgroundColor: C.surface,
  },
  dimRow:   { flexDirection: 'row', gap: 8, marginTop: 2 },
  dimField: { flex: 1 },

  addBtn:    { marginTop: 16, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, paddingHorizontal: 16,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
  },
  badge:    { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: C.primary },
  viewBtn:    { backgroundColor: C.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  viewBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
