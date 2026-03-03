import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://truck-capacity-optimizer.onrender.com';

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

const DG_CLASSES = [
  'Class 1 — Explosives',
  'Class 2.1 — Flammable Gas',
  'Class 2.2 — Non-Flammable Gas',
  'Class 2.3 — Toxic Gas',
  'Class 3 — Flammable Liquid',
  'Class 4.1 — Flammable Solid',
  'Class 4.2 — Spontaneously Combustible',
  'Class 4.3 — Dangerous When Wet',
  'Class 5.1 — Oxidizer',
  'Class 5.2 — Organic Peroxide',
  'Class 6.1 — Toxic Substance',
  'Class 6.2 — Infectious Substance',
  'Class 7 — Radioactive',
  'Class 8 — Corrosive',
  'Class 9 — Miscellaneous DG',
];

const BLANK = { name: '', length: '4', width: '4', height: '4', weight: '500', packagingWeight: '0', qty: '1', stackable: true, isDG: false, dgClass: '', dgCanCombine: true };

export default function AddCargoScreen({ navigation }) {
  const { items, addItem, updateItem, removeItem } = useWizard();

  const [step,         setStep]         = useState(1);
  const [category,     setCategory]     = useState(null);
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [form,         setForm]         = useState(BLANK);
  const [expandedId,   setExpandedId]   = useState(null);
  const [editForm,     setEditForm]     = useState({});
  const [serverCatalog, setServerCatalog] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then(r => r.json())
      .then(data => setServerCatalog(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Merge server custom items into the local catalog for the selected category
  function buildCatalog(cat) {
    const base = cat === 'household' ? MOBILE_HOUSEHOLD : MOBILE_INDUSTRIAL;
    const custom = serverCatalog.filter(i => i.category === cat);
    if (!custom.length) return base;
    return [...base, { cat: '⭐ User-Added Items', items: custom.map(i => ({ name: i.name, l: i.l, w: i.w, h: i.h, wt: i.wt })) }];
  }

  const catalog  = buildCatalog(category);
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
    if (form.isDG && !form.dgClass) {
      Alert.alert('Required', 'Please select a DG Class for dangerous goods.');
      return;
    }
    const name   = form.name.trim();
    const length = parseFloat(form.length)          || 4;
    const width  = parseFloat(form.width)           || 4;
    const height = parseFloat(form.height)          || 4;
    const weight = parseFloat(form.weight)          || 0;

    addItem({
      name,
      length,
      width,
      height,
      weight,
      packagingWeight: parseFloat(form.packagingWeight) || 0,
      qty:             parseInt(form.qty)               || 1,
      stackable:       form.stackable,
      isDG:            form.isDG,
      dgClass:         form.isDG ? form.dgClass : '',
      dgCanCombine:    form.isDG ? form.dgCanCombine : true,
    });

    // Save to server catalog if it's a custom (not built-in) item
    const allBuiltIn = [...MOBILE_HOUSEHOLD, ...MOBILE_INDUSTRIAL].flatMap(g => g.items);
    const isBuiltIn  = allBuiltIn.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (!isBuiltIn && category) {
      fetch(`${API_BASE}/api/catalog`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, category, l: length, w: width, h: height, wt: weight }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok && !data.duplicate) {
            setServerCatalog(prev => [...prev, data.item]);
          }
        })
        .catch(() => {});
    }

    // Reset form, stay on same screen
    setStep(1);
    setCategory(null);
    setSelectedCat(null);
    setForm(BLANK);
    setExpandedId(null);
  }

  function startEdit(item) {
    setExpandedId(item._id);
    setEditForm({
      name:         item.name,
      length:       String(item.length),
      width:        String(item.width),
      height:       String(item.height),
      weight:       String(item.weight),
      qty:          String(item.qty),
      stackable:    item.stackable !== false,
      isDG:         item.isDG || false,
      dgClass:      item.dgClass || '',
      dgCanCombine: item.dgCanCombine !== false,
    });
  }

  function saveEdit(item) {
    if (!editForm.name.trim()) { Alert.alert('Required', 'Item name cannot be empty.'); return; }
    if (editForm.isDG && !editForm.dgClass) { Alert.alert('Required', 'Please select a DG Class.'); return; }
    updateItem(item._id, {
      name:         editForm.name.trim(),
      length:       parseFloat(editForm.length) || item.length,
      width:        parseFloat(editForm.width)  || item.width,
      height:       parseFloat(editForm.height) || item.height,
      weight:       parseFloat(editForm.weight) || item.weight,
      qty:          parseInt(editForm.qty)      || item.qty,
      stackable:    editForm.stackable !== false,
      isDG:         editForm.isDG || false,
      dgClass:      editForm.isDG ? (editForm.dgClass || '') : '',
      dgCanCombine: editForm.isDG ? (editForm.dgCanCombine !== false) : true,
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

  const totalUnits  = items.reduce((s, i) => s + i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Two-column body ── */}
        <View style={s.columns}>

          {/* LEFT column — add form */}
          <ScrollView style={s.leftCol} contentContainerStyle={s.leftContent} keyboardShouldPersistTaps="handled">

            <Text style={s.colHead}>＋ Add Item</Text>

            {/* Step 1: category */}
            {step === 1 && (
              <>
                <Text style={s.lbl}>Select Category</Text>
                <TouchableOpacity style={s.catBtn} onPress={() => { setCategory('household'); setStep(2); }}>
                  <Text style={s.catIcon}>🏠</Text>
                  <Text style={s.catLabel}>Household</Text>
                  <Text style={s.catSub}>Furniture · appliances · boxes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.catBtn, { marginTop: 8 }]} onPress={() => { setCategory('industrial'); setStep(2); }}>
                  <Text style={s.catIcon}>🏭</Text>
                  <Text style={s.catLabel}>Industrial</Text>
                  <Text style={s.catSub}>Pallets · machinery · equipment</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: sub-cat + item chips + form */}
            {step === 2 && (
              <>
                <View style={s.stepHead}>
                  <TouchableOpacity onPress={() => { setStep(1); setCategory(null); setSelectedCat(null); setForm(BLANK); }}>
                    <Text style={s.backBtn}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={s.stepTitle}>
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
                    <Text style={s.lbl}>Item</Text>
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

                <Text style={s.lbl}>Name</Text>
                <TextInput
                  style={s.input}
                  value={form.name}
                  onChangeText={f('name')}
                  placeholder="Item name"
                  placeholderTextColor={C.text3}
                />

                <View style={s.dimRow}>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>L (ft)</Text>
                    <TextInput style={s.input} value={form.length} onChangeText={f('length')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>W (ft)</Text>
                    <TextInput style={s.input} value={form.width} onChangeText={f('width')} keyboardType="decimal-pad" />
                  </View>
                </View>
                <View style={s.dimRow}>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>H (ft)</Text>
                    <TextInput style={s.input} value={form.height} onChangeText={f('height')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Qty</Text>
                    <TextInput style={s.input} value={form.qty} onChangeText={f('qty')} keyboardType="number-pad" />
                  </View>
                </View>
                <View style={s.dimRow}>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Weight (lbs)</Text>
                    <TextInput style={s.input} value={form.weight} onChangeText={f('weight')} keyboardType="decimal-pad" />
                  </View>
                  <View style={s.dimField}>
                    <Text style={s.lbl}>Pkg Wt</Text>
                    <TextInput style={s.input} value={form.packagingWeight} onChangeText={f('packagingWeight')} keyboardType="decimal-pad" />
                  </View>
                </View>

                {/* Stackable toggle */}
                <View style={s.stackableRow}>
                  <Text style={s.stackableIcon}>📦</Text>
                  <Text style={s.stackableTxt}>Stackable — items can be placed on top</Text>
                  <Switch
                    value={form.stackable}
                    onValueChange={v => setForm(p => ({ ...p, stackable: v }))}
                    trackColor={{ false: '#cbd5e1', true: '#bfdbfe' }}
                    thumbColor={form.stackable ? C.primary : '#94a3b8'}
                    style={{ marginLeft: 'auto' }}
                  />
                </View>

                {/* DG toggle */}
                <View style={s.dgSection}>
                  <View style={s.dgToggleRow}>
                    <Text style={s.dgToggleIcon}>⚠</Text>
                    <Text style={s.dgToggleTxt}>Dangerous Goods (DG)</Text>
                    <Switch
                      value={form.isDG}
                      onValueChange={v => setForm(p => ({ ...p, isDG: v, dgClass: '', dgCanCombine: true }))}
                      trackColor={{ false: '#cbd5e1', true: '#fed7aa' }}
                      thumbColor={form.isDG ? '#ea580c' : '#94a3b8'}
                      style={{ marginLeft: 'auto' }}
                    />
                  </View>

                  {form.isDG && (
                    <View style={s.dgFields}>
                      <Text style={s.lbl}>DG Class</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                        {DG_CLASSES.map(cls => (
                          <TouchableOpacity
                            key={cls}
                            style={[s.dgChip, form.dgClass === cls && s.dgChipActive]}
                            onPress={() => setForm(p => ({ ...p, dgClass: cls }))}
                          >
                            <Text style={[s.dgChipTxt, form.dgClass === cls && s.dgChipTxtActive]}>{cls}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <Text style={s.lbl}>Can combine with other items?</Text>
                      <View style={s.dgCombineRow}>
                        <TouchableOpacity
                          style={[s.dgCombineBtn, form.dgCanCombine && s.dgCombineBtnActive]}
                          onPress={() => setForm(p => ({ ...p, dgCanCombine: true }))}
                        >
                          <Text style={[s.dgCombineTxt, form.dgCanCombine && s.dgCombineTxtActive]}>✓ Yes — can combine</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.dgCombineBtn, !form.dgCanCombine && s.dgCombineBtnActive]}
                          onPress={() => setForm(p => ({ ...p, dgCanCombine: false }))}
                        >
                          <Text style={[s.dgCombineTxt, !form.dgCanCombine && s.dgCombineTxtActive]}>✕ No — must be isolated</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={s.dgNote}>
                        <Text style={s.dgNoteTxt}>🚛 A DG-certified truck will be required. A 15% DG surcharge applies.</Text>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
                  <Text style={s.addBtnTxt}>＋ Add to List</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Vertical divider */}
          <View style={s.divider} />

          {/* RIGHT column — cargo list */}
          <ScrollView style={s.rightCol} contentContainerStyle={s.rightContent} keyboardShouldPersistTaps="handled">

            <Text style={s.colHead}>📋 Cargo List</Text>

            {items.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📦</Text>
                <Text style={s.emptyTxt}>Added items{'\n'}appear here</Text>
              </View>
            ) : (
              <>
                {/* Summary strip */}
                <View style={s.summaryStrip}>
                  <View style={s.summaryCell}>
                    <Text style={s.summaryVal}>{items.length}</Text>
                    <Text style={s.summaryLbl}>Types</Text>
                  </View>
                  <View style={s.summarySep} />
                  <View style={s.summaryCell}>
                    <Text style={s.summaryVal}>{totalUnits}</Text>
                    <Text style={s.summaryLbl}>Units</Text>
                  </View>
                  <View style={s.summarySep} />
                  <View style={s.summaryCell}>
                    <Text style={s.summaryVal}>{totalWeight.toLocaleString()}</Text>
                    <Text style={s.summaryLbl}>lbs</Text>
                  </View>
                </View>

                {items.map(item => {
                  const isExp = expandedId === item._id;
                  return (
                    <View key={String(item._id)} style={[s.itemCard, item.isDG && s.itemCardDG]}>
                      <View style={s.itemRow}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                            {item.isDG && <View style={s.dgItemBadge}><Text style={s.dgItemBadgeTxt}>⚠ DG</Text></View>}
                          </View>
                          <Text style={s.itemDims}>
                            {item.length}×{item.width}×{item.height} ft · {item.weight} lbs · qty {item.qty}
                            {item.isDG && item.dgClass ? `\n${item.dgClass}` : ''}
                          </Text>
                          {item.stackable === false && (
                            <View style={s.noStackBadge}><Text style={s.noStackBadgeTxt}>🚫 No Stack</Text></View>
                          )}
                        </View>
                        <View style={s.itemBtns}>
                          <TouchableOpacity style={s.iconBtn} onPress={() => isExp ? setExpandedId(null) : startEdit(item)}>
                            <Text style={s.iconBtnTxt}>{isExp ? '✕' : '✏️'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={s.iconBtn} onPress={() => confirmDelete(item)}>
                            <Text style={s.iconBtnTxt}>🗑</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {isExp && (
                        <View style={s.editBox}>
                          <TextInput style={s.input} value={editForm.name} onChangeText={ef('name')} placeholderTextColor={C.text3} />
                          <View style={s.dimRow}>
                            <View style={s.dimField}>
                              <Text style={s.lbl}>L</Text>
                              <TextInput style={s.input} value={editForm.length} onChangeText={ef('length')} keyboardType="decimal-pad" />
                            </View>
                            <View style={s.dimField}>
                              <Text style={s.lbl}>W</Text>
                              <TextInput style={s.input} value={editForm.width} onChangeText={ef('width')} keyboardType="decimal-pad" />
                            </View>
                          </View>
                          <View style={s.dimRow}>
                            <View style={s.dimField}>
                              <Text style={s.lbl}>H</Text>
                              <TextInput style={s.input} value={editForm.height} onChangeText={ef('height')} keyboardType="decimal-pad" />
                            </View>
                            <View style={s.dimField}>
                              <Text style={s.lbl}>Qty</Text>
                              <TextInput style={s.input} value={editForm.qty} onChangeText={ef('qty')} keyboardType="number-pad" />
                            </View>
                          </View>
                          <Text style={s.lbl}>Weight (lbs)</Text>
                          <TextInput style={s.input} value={editForm.weight} onChangeText={ef('weight')} keyboardType="decimal-pad" />

                          {/* Stackable toggle in edit */}
                          <View style={[s.stackableRow, { marginTop: 8 }]}>
                            <Text style={s.stackableIcon}>📦</Text>
                            <Text style={s.stackableTxt}>Stackable</Text>
                            <Switch
                              value={editForm.stackable !== false}
                              onValueChange={v => setEditForm(p => ({ ...p, stackable: v }))}
                              trackColor={{ false: '#cbd5e1', true: '#bfdbfe' }}
                              thumbColor={editForm.stackable !== false ? C.primary : '#94a3b8'}
                              style={{ marginLeft: 'auto' }}
                            />
                          </View>

                          {/* DG toggle in edit */}
                          <View style={[s.dgToggleRow, { marginTop: 8 }]}>
                            <Text style={s.dgToggleIcon}>⚠</Text>
                            <Text style={s.dgToggleTxt}>Dangerous Goods</Text>
                            <Switch
                              value={editForm.isDG || false}
                              onValueChange={v => setEditForm(p => ({ ...p, isDG: v, dgClass: '', dgCanCombine: true }))}
                              trackColor={{ false: '#cbd5e1', true: '#fed7aa' }}
                              thumbColor={editForm.isDG ? '#ea580c' : '#94a3b8'}
                              style={{ marginLeft: 'auto' }}
                            />
                          </View>
                          {editForm.isDG && (
                            <View style={s.dgFields}>
                              <Text style={s.lbl}>DG Class</Text>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                                {DG_CLASSES.map(cls => (
                                  <TouchableOpacity key={cls} style={[s.dgChip, editForm.dgClass === cls && s.dgChipActive]} onPress={() => setEditForm(p => ({ ...p, dgClass: cls }))}>
                                    <Text style={[s.dgChipTxt, editForm.dgClass === cls && s.dgChipTxtActive]}>{cls}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}

                          <TouchableOpacity style={s.saveBtn} onPress={() => saveEdit(item)}>
                            <Text style={s.saveBtnTxt}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>

        {/* ── Bottom bar ── */}
        {items.length > 0 && (
          <View style={s.bottomBar}>
            <TouchableOpacity style={s.proceedBtn} onPress={() => navigation.navigate('ShipOption')}>
              <Text style={s.proceedTxt}>
                Next: Choose Shipping ({items.length} item{items.length !== 1 ? 's' : ''}) →
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },

  // Two-column layout
  columns:     { flex: 1, flexDirection: 'row' },
  leftCol:     { flex: 1 },
  leftContent: { padding: 12, paddingBottom: 20 },
  divider:     { width: 1, backgroundColor: C.border },
  rightCol:    { flex: 1 },
  rightContent:{ padding: 10, paddingBottom: 20 },

  colHead: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 10, letterSpacing: -0.2 },

  // Category buttons (stacked vertically in left col)
  catBtn:   { alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  catIcon:  { fontSize: 24 },
  catLabel: { fontSize: 12, fontWeight: '800', color: C.text, marginTop: 3 },
  catSub:   { fontSize: 9, color: C.text2, textAlign: 'center', marginTop: 2 },

  stepHead:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: C.text },
  backBtn:   { fontSize: 12, color: C.primary, fontWeight: '700' },

  lbl: { fontSize: 9, fontWeight: '700', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3, marginTop: 8 },

  chipScroll: { marginBottom: 2 },
  chip:       { paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  chipActive: { borderColor: C.primary, backgroundColor: '#eff6ff' },
  chipTxt:    { fontSize: 11, color: C.text2, fontWeight: '600' },
  chipTxtActive: { color: C.primary, fontWeight: '800' },

  input:    { borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, color: C.text, backgroundColor: C.surface },
  dimRow:   { flexDirection: 'row', gap: 6, marginTop: 2 },
  dimField: { flex: 1 },

  addBtn:    { marginTop: 12, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Right panel — summary
  summaryStrip: { flexDirection: 'row', backgroundColor: C.navy, borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center' },
  summaryCell:  { flex: 1, alignItems: 'center' },
  summarySep:   { width: 1, height: 24, backgroundColor: '#334155' },
  summaryVal:   { fontSize: 15, fontWeight: '900', color: '#f1f5f9' },
  summaryLbl:   { fontSize: 8, color: '#64748b', marginTop: 1 },

  // Right panel — empty state
  emptyState: { alignItems: 'center', paddingTop: 50 },
  emptyIcon:  { fontSize: 34, marginBottom: 8 },
  emptyTxt:   { fontSize: 11, color: C.text3, textAlign: 'center', lineHeight: 17 },

  // Right panel — item cards
  itemCard: { backgroundColor: C.surface, borderRadius: 10, padding: 9, marginBottom: 7, borderWidth: 1, borderColor: C.border },
  itemRow:  { flexDirection: 'row', alignItems: 'flex-start' },
  itemName: { fontSize: 12, fontWeight: '800', color: C.text },
  itemDims: { fontSize: 10, color: C.text2, marginTop: 2, lineHeight: 15 },

  itemBtns: { gap: 5, alignItems: 'center' },
  iconBtn:    { padding: 5, borderRadius: 6, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, marginBottom: 2 },
  iconBtnTxt: { fontSize: 12 },

  editBox:    { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn:    { marginTop: 8, backgroundColor: C.primary, borderRadius: 7, paddingVertical: 7, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Stackable row
  stackableRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface, marginTop: 8 },
  stackableIcon: { fontSize: 14 },
  stackableTxt:  { fontSize: 12, fontWeight: '600', color: C.text, flex: 1 },

  // DG section
  dgSection:       { marginTop: 10, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  dgToggleRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  dgToggleIcon:    { fontSize: 14 },
  dgToggleTxt:     { fontSize: 12, fontWeight: '700', color: C.text, flex: 1 },
  dgFields:        { marginTop: 8, padding: 10, backgroundColor: '#fff7ed', borderRadius: 10, borderWidth: 1.5, borderColor: '#fed7aa' },
  dgChip:          { paddingHorizontal: 8, paddingVertical: 4, marginRight: 5, borderRadius: 14, borderWidth: 1.5, borderColor: '#fed7aa', backgroundColor: '#fff7ed' },
  dgChipActive:    { borderColor: '#ea580c', backgroundColor: '#ffedd5' },
  dgChipTxt:       { fontSize: 10, color: '#9a3412', fontWeight: '600' },
  dgChipTxtActive: { color: '#c2410c', fontWeight: '800' },
  dgCombineRow:    { flexDirection: 'row', gap: 6, marginTop: 4 },
  dgCombineBtn:    { flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#fed7aa', backgroundColor: '#fff7ed', alignItems: 'center' },
  dgCombineBtnActive: { borderColor: '#ea580c', backgroundColor: '#ffedd5' },
  dgCombineTxt:    { fontSize: 10, color: '#9a3412', fontWeight: '600', textAlign: 'center' },
  dgCombineTxtActive: { color: '#c2410c', fontWeight: '800' },
  dgNote:          { marginTop: 8, padding: 7, backgroundColor: '#ffedd5', borderRadius: 6, borderWidth: 1, borderColor: '#fdba74' },
  dgNoteTxt:       { fontSize: 10, color: '#c2410c', fontWeight: '700', lineHeight: 15 },

  // Item card DG variant
  itemCardDG:    { borderColor: '#fed7aa', backgroundColor: '#fffbeb' },
  dgItemBadge:   { backgroundColor: '#ffedd5', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#fed7aa' },
  dgItemBadgeTxt:{ fontSize: 8, fontWeight: '800', color: '#9a3412' },
  noStackBadge:  { marginTop: 3, alignSelf: 'flex-start', backgroundColor: '#fee2e2', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#fecaca' },
  noStackBadgeTxt:{ fontSize: 8, fontWeight: '800', color: '#991b1b' },

  // Bottom bar
  bottomBar:  { padding: 10, paddingHorizontal: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  proceedBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  proceedTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
