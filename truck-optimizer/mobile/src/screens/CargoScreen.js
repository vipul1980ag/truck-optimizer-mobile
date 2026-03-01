import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Alert, Modal, ScrollView, RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../api';
import { C } from '../theme';

const BLANK = { name: '', length: '4', width: '4', height: '4', weight: '500', packagingWeight: '0', qty: '1', customerId: null };

// ── Mobile Catalogs ───────────────────────────────────────────────────────────
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
    { name: 'Full Mattress',        l: 6.5, w: 4.5, h: 1.0, wt:  60 },
    { name: 'Twin Mattress',        l: 6.5, w: 3.5, h: 0.5, wt:  45 },
    { name: 'Dresser (wide)',       l: 4.0, w: 1.5, h: 4.0, wt: 150 },
    { name: 'Chest of Drawers',     l: 3.0, w: 1.5, h: 4.5, wt: 120 },
    { name: 'Wardrobe',             l: 4.0, w: 2.0, h: 6.0, wt: 250 },
    { name: 'Nightstand',           l: 1.5, w: 1.5, h: 2.0, wt:  30 },
    { name: 'Vanity Table',         l: 3.5, w: 1.5, h: 4.5, wt:  80 },
    { name: 'Tall Mirror',          l: 1.5, w: 0.5, h: 6.0, wt:  40 },
    { name: 'Bunk Bed',             l: 7.0, w: 3.5, h: 6.0, wt: 200 },
  ]},
  { cat: 'Dining Room', items: [
    { name: 'Dining Table (6-seat)',l: 6.0, w: 3.0, h: 2.5, wt: 150 },
    { name: 'Dining Table (4-seat)',l: 4.0, w: 3.0, h: 2.5, wt: 100 },
    { name: 'Dining Chair',         l: 1.5, w: 1.5, h: 3.5, wt:  20 },
    { name: 'Bar Stool',            l: 1.5, w: 1.5, h: 3.5, wt:  15 },
    { name: 'Buffet / Sideboard',   l: 5.0, w: 1.5, h: 3.0, wt: 180 },
    { name: 'China Cabinet',        l: 3.5, w: 1.5, h: 6.0, wt: 200 },
    { name: 'Bar Cart',             l: 2.5, w: 1.5, h: 3.5, wt:  30 },
    { name: 'Bench (dining)',       l: 4.0, w: 1.5, h: 1.5, wt:  40 },
  ]},
  { cat: 'Kitchen / Appliances', items: [
    { name: 'Refrigerator (full)',  l: 3.0, w: 2.5, h: 6.0, wt: 300 },
    { name: 'Refrigerator (mini)', l: 1.5, w: 1.5, h: 3.5, wt:  60 },
    { name: 'Oven / Range',         l: 2.5, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Washing Machine',      l: 2.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Dryer',                l: 2.0, w: 2.5, h: 3.5, wt: 150 },
    { name: 'Dishwasher',           l: 2.0, w: 2.0, h: 3.5, wt: 100 },
    { name: 'Microwave',            l: 1.5, w: 1.5, h: 1.0, wt:  40 },
    { name: 'Chest Freezer',        l: 4.0, w: 2.0, h: 3.0, wt: 150 },
    { name: 'Kitchen Island',       l: 4.0, w: 2.0, h: 3.0, wt: 200 },
  ]},
  { cat: 'Home Office', items: [
    { name: 'Desk (large)',         l: 5.0, w: 2.0, h: 2.5, wt: 100 },
    { name: 'Desk (small)',         l: 3.5, w: 1.5, h: 2.5, wt:  60 },
    { name: 'L-Shaped Desk',        l: 6.0, w: 5.0, h: 2.5, wt: 150 },
    { name: 'Office Chair',         l: 2.0, w: 2.0, h: 4.0, wt:  40 },
    { name: 'Filing Cabinet (4dr)', l: 1.5, w: 2.0, h: 4.5, wt: 130 },
    { name: 'Bookcase',             l: 3.0, w: 1.0, h: 6.0, wt:  80 },
    { name: 'Printer (desktop)',    l: 1.5, w: 1.5, h: 1.0, wt:  20 },
    { name: 'Monitor 27"',          l: 2.5, w: 0.5, h: 1.5, wt:  15 },
    { name: 'Desktop Computer',     l: 1.5, w: 1.0, h: 1.5, wt:  20 },
  ]},
  { cat: 'Exercise Equipment', items: [
    { name: 'Treadmill',            l: 5.5, w: 2.5, h: 4.0, wt: 250 },
    { name: 'Exercise Bike',        l: 3.5, w: 2.0, h: 4.0, wt: 100 },
    { name: 'Elliptical Trainer',   l: 5.0, w: 2.5, h: 5.0, wt: 200 },
    { name: 'Weight Bench',         l: 4.0, w: 2.0, h: 3.5, wt:  80 },
    { name: 'Weight Rack',          l: 3.0, w: 2.0, h: 5.0, wt: 150 },
    { name: 'Rowing Machine',       l: 7.0, w: 2.0, h: 3.5, wt: 100 },
    { name: 'Punching Bag',         l: 1.5, w: 1.5, h: 4.0, wt:  70 },
    { name: 'Squat Rack',           l: 4.0, w: 4.0, h: 7.0, wt: 300 },
  ]},
  { cat: 'Outdoor / Garage', items: [
    { name: 'Lawn Mower (push)',    l: 3.0, w: 2.0, h: 3.0, wt:  80 },
    { name: 'Riding Mower',         l: 6.0, w: 4.0, h: 4.0, wt: 450 },
    { name: 'Patio Table',          l: 4.0, w: 4.0, h: 2.5, wt:  80 },
    { name: 'Patio Chair',          l: 2.0, w: 2.0, h: 3.0, wt:  25 },
    { name: 'Patio Sofa',           l: 6.0, w: 3.0, h: 3.0, wt: 120 },
    { name: 'BBQ Grill',            l: 2.5, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Bicycle',              l: 5.5, w: 1.5, h: 3.5, wt:  25 },
    { name: 'Workbench',            l: 6.0, w: 2.0, h: 3.0, wt: 200 },
    { name: 'Tool Cabinet',         l: 2.5, w: 1.5, h: 5.0, wt: 180 },
    { name: 'Storage Shelving',     l: 4.0, w: 1.5, h: 6.0, wt:  60 },
    { name: 'Ladder (6 ft)',        l: 6.0, w: 1.5, h: 0.5, wt:  25 },
    { name: 'Kayak / Canoe',        l:12.0, w: 2.5, h: 1.5, wt:  55 },
  ]},
  { cat: 'Moving Boxes', items: [
    { name: 'Small Box',            l: 1.5, w: 1.5, h: 1.5, wt:  40 },
    { name: 'Medium Box',           l: 2.0, w: 1.5, h: 1.5, wt:  60 },
    { name: 'Large Box',            l: 2.0, w: 2.0, h: 2.0, wt:  80 },
    { name: 'Extra-Large Box',      l: 2.5, w: 2.0, h: 2.0, wt: 100 },
    { name: 'Wardrobe Box',         l: 2.0, w: 2.0, h: 4.0, wt:  60 },
    { name: 'Picture / Mirror Box', l: 3.5, w: 0.5, h: 3.0, wt:  30 },
    { name: 'Dish Pack Box',        l: 1.5, w: 1.5, h: 2.0, wt:  50 },
    { name: 'Book Box',             l: 1.5, w: 1.5, h: 1.0, wt:  60 },
  ]},
];

const MOBILE_INDUSTRIAL = [
  { cat: 'Pallets & Crates', items: [
    { name: 'Standard Pallet (48×40)', l: 4.0, w: 3.5, h: 0.6, wt:   50 },
    { name: 'Euro Pallet (47×31)',      l: 3.9, w: 2.6, h: 0.6, wt:   55 },
    { name: 'Double-Wing Pallet',       l: 4.0, w: 4.0, h: 0.6, wt:   60 },
    { name: 'Wooden Crate (small)',     l: 3.0, w: 2.0, h: 2.0, wt:   80 },
    { name: 'Wooden Crate (large)',     l: 6.0, w: 4.0, h: 4.0, wt:  200 },
    { name: 'Pallet + Load (48×40)',    l: 4.0, w: 3.5, h: 4.5, wt: 2000 },
    { name: 'Steel Skid',               l: 5.0, w: 3.0, h: 0.5, wt:  150 },
  ]},
  { cat: 'Industrial Machinery', items: [
    { name: 'CNC Machine (small)',      l: 6.0, w: 4.0, h: 5.0, wt: 4000 },
    { name: 'Compressor (industrial)', l: 5.0, w: 3.0, h: 4.0, wt: 1500 },
    { name: 'Generator (portable)',     l: 4.0, w: 2.0, h: 2.5, wt:  500 },
    { name: 'Generator (standby)',      l: 8.0, w: 3.0, h: 4.0, wt: 2500 },
    { name: 'Industrial Press',         l: 5.0, w: 3.0, h: 6.0, wt: 3000 },
    { name: 'Conveyor Belt (8 ft)',     l: 9.0, w: 2.0, h: 3.0, wt:  600 },
    { name: 'Lathe Machine',            l: 8.0, w: 3.0, h: 5.0, wt: 3500 },
    { name: 'Air Compressor (tank)',    l: 3.0, w: 2.0, h: 3.5, wt:  300 },
  ]},
  { cat: 'Warehouse Equipment', items: [
    { name: 'Pallet Rack Section',      l: 8.0, w: 3.5, h: 8.0, wt:  250 },
    { name: 'Shelving Unit (heavy)',    l: 6.0, w: 2.0, h: 6.0, wt:  120 },
    { name: 'Wire Shelving (5-tier)',   l: 4.0, w: 1.5, h: 6.0, wt:   60 },
    { name: 'Mezzanine Panel',          l: 8.0, w: 4.0, h: 0.5, wt:  400 },
    { name: 'Dock Plate',               l: 4.0, w: 3.0, h: 0.5, wt:  200 },
    { name: 'Industrial Workbench',     l: 6.0, w: 2.5, h: 3.5, wt:  250 },
    { name: 'Storage Cabinet (steel)', l: 3.0, w: 1.5, h: 5.5, wt:  150 },
  ]},
  { cat: 'Material Handling', items: [
    { name: 'Forklift (3-ton)',         l: 9.0, w: 4.0, h: 6.0, wt: 9000 },
    { name: 'Pallet Jack (manual)',     l: 5.5, w: 1.5, h: 4.0, wt:  170 },
    { name: 'Pallet Jack (electric)',   l: 6.0, w: 2.0, h: 4.5, wt:  600 },
    { name: 'Hand Truck / Dolly',       l: 1.5, w: 1.0, h: 4.5, wt:   25 },
    { name: 'Platform Cart (large)',    l: 4.0, w: 2.5, h: 1.5, wt:   80 },
    { name: 'Drum (55-gal steel)',      l: 2.0, w: 2.0, h: 3.0, wt:  500 },
    { name: 'IBC Tote (275-gal)',       l: 3.5, w: 3.0, h: 3.5, wt: 2800 },
  ]},
  { cat: 'Construction Materials', items: [
    { name: 'Lumber Bundle (8 ft)',      l:  8.0, w: 2.0, h: 2.0, wt:  800 },
    { name: 'Plywood Bundle (4×8)',      l:  8.5, w: 4.5, h: 2.0, wt:  700 },
    { name: 'Drywall Bundle (4×8)',      l:  8.5, w: 4.5, h: 1.5, wt: 1200 },
    { name: 'Steel Beam (20 ft)',        l: 20.0, w: 1.0, h: 1.0, wt: 1000 },
    { name: 'Concrete Block (pallet)',   l:  4.0, w: 3.5, h: 2.5, wt: 2800 },
    { name: 'Roofing Shingles (pallet)', l:  4.0, w: 3.0, h: 4.0, wt: 2500 },
    { name: 'HVAC Unit (split)',          l:  4.0, w: 2.0, h: 2.5, wt:  300 },
    { name: 'Pipe Bundle (10 ft)',        l: 10.0, w: 2.0, h: 2.0, wt:  400 },
  ]},
  { cat: 'Office & Business', items: [
    { name: 'Server Rack (42U)',        l: 3.0, w: 3.5, h: 6.5, wt:  250 },
    { name: 'Commercial Copier',        l: 2.5, w: 2.0, h: 3.5, wt:  200 },
    { name: 'Cubicle Desk System',      l: 6.0, w: 5.0, h: 4.0, wt:  300 },
    { name: 'Safe (commercial)',        l: 2.5, w: 2.0, h: 4.0, wt: 1000 },
    { name: 'Vending Machine',          l: 3.0, w: 2.5, h: 6.0, wt:  500 },
    { name: 'ATM Machine',              l: 2.0, w: 2.0, h: 5.5, wt:  600 },
    { name: 'Large Format Printer',     l: 5.0, w: 2.5, h: 3.5, wt:  300 },
  ]},
  { cat: 'Retail Equipment', items: [
    { name: 'Glass Display Case',       l: 4.0, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Checkout Counter',         l: 5.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Gondola Shelving',         l: 4.0, w: 1.5, h: 5.0, wt: 100 },
    { name: 'Clothing Rack (floor)',    l: 3.0, w: 1.5, h: 5.0, wt:  40 },
    { name: 'Point of Sale Kiosk',      l: 2.0, w: 2.0, h: 5.0, wt: 150 },
    { name: 'Commercial Refrigerator', l: 3.0, w: 2.5, h: 6.0, wt: 400 },
    { name: 'Walk-in Cooler Panel',     l: 4.0, w: 4.0, h: 8.0, wt: 600 },
  ]},
  { cat: 'Food & Beverage', items: [
    { name: 'Restaurant Range (6-brn)', l: 3.5, w: 2.5, h: 3.5, wt:  350 },
    { name: 'Commercial Dishwasher',    l: 4.0, w: 2.5, h: 4.0, wt:  300 },
    { name: 'Walk-in Refrigerator',     l: 8.0, w: 6.0, h: 8.0, wt: 1500 },
    { name: 'Ice Machine (commercial)', l: 2.5, w: 2.0, h: 3.5, wt:  250 },
    { name: 'Deep Fryer (commercial)',  l: 2.0, w: 2.0, h: 3.5, wt:  150 },
    { name: 'Prep Table (stainless)',   l: 5.0, w: 2.0, h: 3.0, wt:  200 },
    { name: 'Keg (half-barrel)',         l: 1.5, w: 1.5, h: 2.0, wt:  170 },
    { name: 'Food Truck Equipment Kit', l: 6.0, w: 3.0, h: 4.0, wt:  800 },
  ]},
];

export default function CargoScreen() {
  const [items,     setItems]     = useState([]);
  const [customers, setCustomers] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [modal,     setModal]     = useState(false);
  const [refreshing,setRefreshing]= useState(false);
  const [saving,    setSaving]    = useState(false);
  const [step,        setStep]        = useState(1);   // 1 = category picker, 2 = item picker + form
  const [category,    setCategory]    = useState(null); // 'household' | 'industrial'
  const [selectedCat, setSelectedCat] = useState(null); // sub-category name

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

  const pickMobileItem = (item) => {
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
  };

  const resetWizard = () => { setStep(1); setCategory(null); setSelectedCat(null); };

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
      resetWizard();
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
          <TouchableOpacity style={s.addBtn} onPress={() => { resetWizard(); setModal(true); }}>
            <Text style={s.addBtnTxt}>＋ Add Cargo Item</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Modal Header */}
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>
                {step === 1 ? '📦 Add Cargo Item' : category === 'household' ? '🏠 Household Items' : '🏭 Industrial Items'}
              </Text>
              <Text style={s.modalSub}>
                {step === 1 ? 'Select a category to get started' : 'Pick an item or enter details manually'}
              </Text>
            </View>
            <TouchableOpacity style={s.modalClose} onPress={() => { setModal(false); resetWizard(); }}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">

            {/* ── STEP 1: Category picker ── */}
            {step === 1 && (
              <View style={s.catPickRow}>
                <TouchableOpacity style={s.catPickBtn} onPress={() => { setCategory('household'); setSelectedCat(null); setStep(2); }}>
                  <Text style={s.catPickIcon}>🏠</Text>
                  <Text style={s.catPickLabel}>Household</Text>
                  <Text style={s.catPickSub}>Furniture, appliances & boxes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.catPickBtn} onPress={() => { setCategory('industrial'); setSelectedCat(null); setStep(2); }}>
                  <Text style={s.catPickIcon}>🏭</Text>
                  <Text style={s.catPickLabel}>Industrial / Business</Text>
                  <Text style={s.catPickSub}>Pallets, machinery & equipment</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2: Item picker + form ── */}
            {step === 2 && (
              <>
                {/* Back button */}
                <TouchableOpacity style={s.backBtn} onPress={() => { setStep(1); setCategory(null); setSelectedCat(null); }}>
                  <Text style={s.backBtnTxt}>← Change Category</Text>
                </TouchableOpacity>

                {/* Sub-category chips */}
                <Text style={s.lbl}>Sub-Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {(category === 'household' ? MOBILE_HOUSEHOLD : MOBILE_INDUSTRIAL).map(group => (
                    <TouchableOpacity
                      key={group.cat}
                      style={[s.chip, selectedCat === group.cat && s.chipActive]}
                      onPress={() => setSelectedCat(group.cat)}>
                      <Text style={[s.chipTxt, selectedCat === group.cat && { color: '#fff' }]}>{group.cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Item chips for selected sub-category */}
                {selectedCat && (
                  <>
                    <Text style={s.lbl}>Select Item</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                      {((category === 'household' ? MOBILE_HOUSEHOLD : MOBILE_INDUSTRIAL)
                        .find(g => g.cat === selectedCat)?.items || [])
                        .map(item => (
                          <TouchableOpacity key={item.name} style={s.itemChip} onPress={() => pickMobileItem(item)}>
                            <Text style={s.itemChipName}>{item.name}</Text>
                            <Text style={s.itemChipDims}>{item.l}×{item.w}×{item.h} ft · {item.wt} lbs</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </>
                )}

                {/* Item name (pre-filled or manual) */}
                <Text style={s.lbl}>Item Name</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. Standard Pallet"
                  placeholderTextColor={C.text3}
                  value={form.name}
                  onChangeText={f('name')}
                />

                {/* Customer assignment */}
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

                {/* Dimensions */}
                <Text style={s.lbl}>Dimensions (ft)</Text>
                <View style={s.dimRow}>
                  {[['Length', 'length'], ['Width', 'width'], ['Height', 'height']].map(([lbl, key]) => (
                    <View key={key} style={{ flex: 1 }}>
                      <Text style={s.dimLbl}>{lbl}</Text>
                      <TextInput style={s.input} keyboardType="decimal-pad" value={form[key]} onChangeText={f(key)} placeholderTextColor={C.text3} />
                    </View>
                  ))}
                </View>

                {/* Weight & Qty */}
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
              </>
            )}
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

  /* Category picker (Step 1) */
  catPickRow:   { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 16 },
  catPickBtn:   {
    flex: 1, backgroundColor: C.surface2, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.border, padding: 18, alignItems: 'center', gap: 8,
  },
  catPickIcon:  { fontSize: 30 },
  catPickLabel: { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center' },
  catPickSub:   { fontSize: 10, color: C.text2, textAlign: 'center', lineHeight: 14 },

  /* Step 2 back button */
  backBtn:    {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start',
  },
  backBtnTxt: { fontSize: 12, fontWeight: '700', color: C.text2 },

  /* Item chips */
  itemChip:     {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.primary,
    backgroundColor: 'rgba(37,99,235,0.05)',
    marginRight: 8, minWidth: 110, maxWidth: 170,
  },
  itemChipName: { fontSize: 11, fontWeight: '800', color: C.primary, marginBottom: 3 },
  itemChipDims: { fontSize: 9,  color: C.text2 },
});
