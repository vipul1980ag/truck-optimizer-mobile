import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { C } from '../theme';

/* ─── helpers ─────────────────────────────────────────────────── */
const nextTruckId  = trucks   => Math.max(0, ...(trucks   || []).map(t => t.id))  + 1;
const nextCarrierId= carriers => Math.max(0, ...(carriers || []).map(c => c.id))  + 1;
const nextCTruckId = trucks   => Math.max(0, ...(trucks   || []).map(t => t.tid)) + 1;

const BLANK_TRUCK = {
  name:'', licensePlate:'',
  length:'53', width:'8.5', height:'9',
  maxWt:'44000', baseRate:'600', ratePerMi:'3.50',
};
const BLANK_CARRIER = { name:'' };
const BLANK_CT = {
  name:'', length:'53', width:'8.5', height:'9',
  maxWt:'44000', baseRate:'700', ratePerMi:'4.00',
};
const BLANK_RATE = { city: '', carrierId: '', truckRef: '', ratePerKm: '2.00' };

/* ─── small reusable label + input ───────────────────────────── */
function Field({ label, value, onChangeText, placeholder, keyboard, caps }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.lbl}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.text3}
        keyboardType={keyboard || 'default'}
        autoCapitalize={caps || 'none'}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminScreen() {
  const [data,        setData]       = useState(null);
  const [refreshing,  setRefreshing] = useState(false);

  /* truck modal */
  const [truckModal,  setTruckModal]  = useState(false);
  const [truckForm,   setTruckForm]   = useState(BLANK_TRUCK);
  const [editTruckId, setEditTruckId] = useState(null);
  const [savingT,     setSavingT]     = useState(false);

  /* carrier modal */
  const [carrierModal,  setCarrierModal]  = useState(false);
  const [carrierForm,   setCarrierForm]   = useState(BLANK_CARRIER);
  const [editCarrierId, setEditCarrierId] = useState(null);
  const [savingC,       setSavingC]       = useState(false);

  /* carrier-truck modal */
  const [ctModal,   setCtModal]   = useState(false);
  const [ctForm,    setCtForm]    = useState(BLANK_CT);
  const [ctCarrier, setCtCarrier] = useState(null); // carrier being edited
  const [savingCT,  setSavingCT]  = useState(false);

  /* rate modal */
  const [rateModal,  setRateModal]  = useState(false);
  const [rateForm,   setRateForm]   = useState(BLANK_RATE);
  const [editRateId, setEditRateId] = useState(null);
  const [savingR,    setSavingR]    = useState(false);

  /* ── load ───────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    try { setData(await api.getData()); } catch (e) { Alert.alert('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  /* ── own truck CRUD ─────────────────────────────────────────── */
  const tf = k => v => setTruckForm(p => ({ ...p, [k]: v }));

  function openAddTruck() {
    setEditTruckId(null); setTruckForm(BLANK_TRUCK); setTruckModal(true);
  }
  function openEditTruck(t) {
    setEditTruckId(t.id);
    setTruckForm({
      name: t.name || '', licensePlate: t.licensePlate || '',
      length: String(t.length), width: String(t.width), height: String(t.height),
      maxWt: String(t.maxWt), baseRate: String(t.baseRate), ratePerMi: String(t.ratePerMi),
    });
    setTruckModal(true);
  }

  async function saveTruck() {
    if (!truckForm.name.trim()) { Alert.alert('Required', 'Truck name is required.'); return; }
    setSavingT(true);
    try {
      const fresh  = await api.getData();
      const trucks = fresh.trucks || [];
      let updated;
      if (editTruckId != null) {
        updated = trucks.map(t => t.id !== editTruckId ? t : {
          ...t,
          name: truckForm.name.trim(),
          licensePlate: truckForm.licensePlate.trim().toUpperCase(),
          length:    parseFloat(truckForm.length)    || t.length,
          width:     parseFloat(truckForm.width)     || t.width,
          height:    parseFloat(truckForm.height)    || t.height,
          maxWt:     parseFloat(truckForm.maxWt)     || t.maxWt,
          baseRate:  parseFloat(truckForm.baseRate)  || t.baseRate,
          ratePerMi: parseFloat(truckForm.ratePerMi) || t.ratePerMi,
        });
      } else {
        updated = [...trucks, {
          id:          nextTruckId(trucks),
          name:        truckForm.name.trim(),
          licensePlate:truckForm.licensePlate.trim().toUpperCase(),
          length:      parseFloat(truckForm.length)    || 53,
          width:       parseFloat(truckForm.width)     || 8.5,
          height:      parseFloat(truckForm.height)    || 9,
          maxWt:       parseFloat(truckForm.maxWt)     || 44000,
          baseRate:    parseFloat(truckForm.baseRate)  || 600,
          ratePerMi:   parseFloat(truckForm.ratePerMi) || 3.5,
        }];
      }
      await api.saveData({ ...fresh, trucks: updated });
      await load(); setTruckModal(false);
    } catch (e) { Alert.alert('Save Error', e.message); }
    finally { setSavingT(false); }
  }

  function deleteTruck(t) {
    Alert.alert('Delete Truck', `Remove "${t.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const fresh = await api.getData();
          await api.saveData({ ...fresh, trucks: (fresh.trucks || []).filter(x => x.id !== t.id) });
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  /* ── carrier CRUD ───────────────────────────────────────────── */
  function openAddCarrier() {
    setEditCarrierId(null); setCarrierForm(BLANK_CARRIER); setCarrierModal(true);
  }
  function openEditCarrier(c) {
    setEditCarrierId(c.id); setCarrierForm({ name: c.name || '' }); setCarrierModal(true);
  }

  async function saveCarrier() {
    if (!carrierForm.name.trim()) { Alert.alert('Required', 'Carrier name is required.'); return; }
    setSavingC(true);
    try {
      const fresh    = await api.getData();
      const carriers = fresh.carriers || [];
      let updated;
      if (editCarrierId != null) {
        updated = carriers.map(c => c.id !== editCarrierId ? c : { ...c, name: carrierForm.name.trim() });
      } else {
        updated = [...carriers, { id: nextCarrierId(carriers), name: carrierForm.name.trim(), trucks: [] }];
      }
      await api.saveData({ ...fresh, carriers: updated });
      await load(); setCarrierModal(false);
    } catch (e) { Alert.alert('Save Error', e.message); }
    finally { setSavingC(false); }
  }

  function deleteCarrier(c) {
    Alert.alert('Delete Carrier', `Remove "${c.name}" and all its trucks?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const fresh = await api.getData();
          await api.saveData({ ...fresh, carriers: (fresh.carriers || []).filter(x => x.id !== c.id) });
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  /* ── carrier truck CRUD ─────────────────────────────────────── */
  const ctf = k => v => setCtForm(p => ({ ...p, [k]: v }));

  function openAddCarrierTruck(carrier) {
    setCtCarrier(carrier); setCtForm(BLANK_CT); setCtModal(true);
  }

  async function saveCarrierTruck() {
    if (!ctForm.name.trim()) { Alert.alert('Required', 'Truck name is required.'); return; }
    setSavingCT(true);
    try {
      const fresh    = await api.getData();
      const carriers = fresh.carriers || [];
      const updated  = carriers.map(c => {
        if (c.id !== ctCarrier.id) return c;
        const newTruck = {
          tid:       nextCTruckId(c.trucks || []),
          name:      ctForm.name.trim(),
          length:    parseFloat(ctForm.length)    || 53,
          width:     parseFloat(ctForm.width)     || 8.5,
          height:    parseFloat(ctForm.height)    || 9,
          maxWt:     parseFloat(ctForm.maxWt)     || 44000,
          baseRate:  parseFloat(ctForm.baseRate)  || 700,
          ratePerMi: parseFloat(ctForm.ratePerMi) || 4.0,
        };
        return { ...c, trucks: [...(c.trucks || []), newTruck] };
      });
      await api.saveData({ ...fresh, carriers: updated });
      await load(); setCtModal(false);
    } catch (e) { Alert.alert('Save Error', e.message); }
    finally { setSavingCT(false); }
  }

  function deleteCarrierTruck(carrier, tid) {
    Alert.alert('Remove Truck', 'Remove this truck from the carrier?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const fresh   = await api.getData();
          const carriers = fresh.carriers.map(c =>
            c.id !== carrier.id ? c : { ...c, trucks: (c.trucks || []).filter(t => t.tid !== tid) }
          );
          await api.saveData({ ...fresh, carriers });
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  /* ── rate CRUD ──────────────────────────────────────────────── */
  function findRate(rateList, city, carrierId, truckRef) {
    const score = r =>
      (r.city      ? (r.city === city                   ? 4 : -99) : 0) +
      (r.carrierId != null ? (r.carrierId === carrierId ? 2 : -99) : 0) +
      (r.truckRef  != null ? (r.truckRef  === truckRef  ? 1 : -99) : 0);
    const matches = (rateList || []).filter(r => score(r) >= 0);
    if (!matches.length) return null;
    return matches.reduce((best, r) => score(r) > score(best) ? r : best, matches[0]);
  }

  function openAddRate() {
    setEditRateId(null);
    setRateForm(BLANK_RATE);
    setRateModal(true);
  }

  function openEditRate(r) {
    setEditRateId(r.id);
    setRateForm({
      city:       r.city || '',
      carrierId:  r.carrierId != null ? String(r.carrierId) : '',
      truckRef:   r.truckRef  != null ? String(r.truckRef)  : '',
      ratePerKm:  String(r.ratePerKm),
    });
    setRateModal(true);
  }

  async function saveRate() {
    const ratePerKm = parseFloat(rateForm.ratePerKm);
    if (isNaN(ratePerKm) || ratePerKm <= 0) {
      Alert.alert('Required', 'Please enter a valid rate per km.');
      return;
    }
    setSavingR(true);
    try {
      const fresh    = await api.getData();
      const existing = fresh.rates || [];
      const carrierId = rateForm.carrierId === '' ? null : Number(rateForm.carrierId);
      const truckRef  = rateForm.truckRef  === '' ? null : Number(rateForm.truckRef);
      const city      = rateForm.city.trim() || null;

      let updated;
      if (editRateId != null) {
        updated = existing.map(r => r.id !== editRateId ? r : { ...r, city, carrierId, truckRef, ratePerKm });
      } else {
        const maxId = existing.reduce((m, r) => Math.max(m, r.id || 0), 0);
        updated = [...existing, { id: maxId + 1, city, carrierId, truckRef, ratePerKm }];
      }
      await api.saveData({ ...fresh, rates: updated });
      await load();
      setRateModal(false);
    } catch (e) { Alert.alert('Save Error', e.message); }
    finally { setSavingR(false); }
  }

  function deleteRate(r) {
    Alert.alert('Delete Rate', 'Remove this rate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const fresh = await api.getData();
          await api.saveData({ ...fresh, rates: (fresh.rates || []).filter(x => x.id !== r.id) });
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  /* ── render ─────────────────────────────────────────────────── */
  if (!data) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const { trucks = [], carriers = [], rates = [] } = data;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* ── Stats banner ──────────────────────── */}
        <View style={s.statsBanner}>
          <View style={s.statItem}><Text style={s.statNum}>{trucks.length}</Text><Text style={s.statLbl}>Own Trucks</Text></View>
          <View style={s.statDiv} />
          <View style={s.statItem}><Text style={s.statNum}>{carriers.length}</Text><Text style={s.statLbl}>Carriers</Text></View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{carriers.reduce((s, c) => s + (c.trucks || []).length, 0)}</Text>
            <Text style={s.statLbl}>Carrier Trucks</Text>
          </View>
        </View>

        {/* ── Own Fleet ─────────────────────────── */}
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>🚛 Own Fleet</Text>
          <TouchableOpacity style={s.addBadge} onPress={openAddTruck}>
            <Text style={s.addBadgeTxt}>＋ Add Truck</Text>
          </TouchableOpacity>
        </View>

        {trucks.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🚛</Text>
            <Text style={s.emptyTitle}>No trucks yet</Text>
            <Text style={s.emptyHint}>Tap "+ Add Truck" to add your first truck.</Text>
          </View>
        ) : trucks.map(t => (
          <View key={t.id} style={s.card}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{t.name}</Text>
                {!!t.licensePlate && (
                  <View style={s.plateBadge}><Text style={s.plateTxt}>{t.licensePlate}</Text></View>
                )}
                <Text style={s.cardMeta}>{t.length} × {t.width} × {t.height} ft</Text>
                <Text style={s.cardMeta}>{(t.maxWt || 0).toLocaleString()} lbs max weight</Text>
                <Text style={s.cardMeta}>${t.baseRate} base  ·  ${t.ratePerMi}/mi</Text>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.editBtn} onPress={() => openEditTruck(t)}>
                  <Text style={s.editBtnTxt}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => deleteTruck(t)}>
                  <Text style={s.delBtnTxt}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* ── Carriers ──────────────────────────── */}
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>🏢 External Carriers</Text>
          <TouchableOpacity style={s.addBadge} onPress={openAddCarrier}>
            <Text style={s.addBadgeTxt}>＋ Add Carrier</Text>
          </TouchableOpacity>
        </View>

        {carriers.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🏢</Text>
            <Text style={s.emptyTitle}>No carriers yet</Text>
            <Text style={s.emptyHint}>Add external shipping partners here.</Text>
          </View>
        ) : carriers.map(c => (
          <View key={c.id} style={s.card}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{c.name}</Text>
                <Text style={s.cardMeta}>{(c.trucks || []).length} truck{(c.trucks||[]).length!==1?'s':''}</Text>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.editBtn} onPress={() => openEditCarrier(c)}>
                  <Text style={s.editBtnTxt}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => deleteCarrier(c)}>
                  <Text style={s.delBtnTxt}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Carrier trucks list */}
            {(c.trucks || []).map(ct => (
              <View key={ct.tid} style={s.subRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.subName}>{ct.name}</Text>
                  <Text style={s.subMeta}>{ct.length}×{ct.width}×{ct.height} ft  ·  {(ct.maxWt||0).toLocaleString()} lbs</Text>
                  <Text style={s.subMeta}>${ct.baseRate} base  ·  ${ct.ratePerMi}/mi</Text>
                </View>
                <TouchableOpacity style={s.subDelBtn} onPress={() => deleteCarrierTruck(c, ct.tid)}>
                  <Text style={s.subDelTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={s.addSubBtn} onPress={() => openAddCarrierTruck(c)}>
              <Text style={s.addSubTxt}>＋ Add Truck to {c.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ── Rate Overrides ────────────────────────── */}
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>💲 Rate Overrides</Text>
          <TouchableOpacity style={s.addBadge} onPress={openAddRate}>
            <Text style={s.addBadgeTxt}>＋ Add Rate</Text>
          </TouchableOpacity>
        </View>

        {rates.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>💲</Text>
            <Text style={s.emptyTitle}>No rate overrides</Text>
            <Text style={s.emptyHint}>Add per-km rates by city, carrier, and truck type.</Text>
          </View>
        ) : rates.map(r => {
          const carrierName = r.carrierId == null
            ? (r.truckRef != null ? 'Own Fleet' : 'Any carrier')
            : (carriers.find(c => c.id === r.carrierId)?.name || `Carrier #${r.carrierId}`);
          let truckName = 'Any truck';
          if (r.truckRef != null) {
            if (r.carrierId == null) {
              truckName = trucks.find(t => t.id === r.truckRef)?.name || `Truck #${r.truckRef}`;
            } else {
              const carr = carriers.find(c => c.id === r.carrierId);
              truckName = carr?.trucks?.find(t => t.tid === r.truckRef)?.name || `Truck #${r.truckRef}`;
            }
          }
          return (
            <View key={r.id} style={s.card}>
              <View style={s.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{r.city || 'Any city'}</Text>
                  <Text style={s.cardMeta}>{carrierName} · {truckName}</Text>
                  <Text style={s.cardMeta}>${r.ratePerKm}/km</Text>
                </View>
                <View style={s.actions}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEditRate(r)}>
                    <Text style={s.editBtnTxt}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.delBtn} onPress={() => deleteRate(r)}>
                    <Text style={s.delBtnTxt}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ Own Truck Form Modal ══════════════════════════════════ */}
      <Modal visible={truckModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>{editTruckId != null ? '✏️ Edit Truck' : '🚛 Add Truck'}</Text>
              <Text style={s.modalSub}>Fill in the truck details below</Text>
            </View>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setTruckModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Field label="Truck Name *" value={truckForm.name} onChangeText={tf('name')} placeholder="e.g. Semi Truck 1" caps="words" />
            <Field label="License Plate" value={truckForm.licensePlate} onChangeText={tf('licensePlate')} placeholder="e.g. ABC-1234" caps="characters" />

            <Text style={s.lbl}>Dimensions (ft)</Text>
            <View style={s.row3}>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Length</Text><TextInput style={s.input} value={truckForm.length} onChangeText={tf('length')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Width</Text><TextInput style={s.input} value={truckForm.width}  onChangeText={tf('width')}  keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Height</Text><TextInput style={s.input} value={truckForm.height} onChangeText={tf('height')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
            </View>

            <Field label="Max Weight (lbs)" value={truckForm.maxWt} onChangeText={tf('maxWt')} placeholder="44000" keyboard="decimal-pad" />

            <Text style={s.lbl}>Pricing</Text>
            <View style={s.row2}>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Base Rate ($)</Text><TextInput style={s.input} value={truckForm.baseRate}  onChangeText={tf('baseRate')}  keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Rate/Mile ($/mi)</Text><TextInput style={s.input} value={truckForm.ratePerMi} onChangeText={tf('ratePerMi')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
            </View>

            <TouchableOpacity style={[s.saveBtn, savingT && { opacity: 0.6 }]} onPress={saveTruck} disabled={savingT}>
              <Text style={s.saveBtnTxt}>{savingT ? 'Saving…' : 'Save Truck'}</Text>
            </TouchableOpacity>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Carrier Form Modal ════════════════════════════════════ */}
      <Modal visible={carrierModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>{editCarrierId != null ? '✏️ Edit Carrier' : '🏢 Add Carrier'}</Text>
              <Text style={s.modalSub}>External shipping partner</Text>
            </View>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setCarrierModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Field label="Company / Carrier Name *" value={carrierForm.name} onChangeText={v => setCarrierForm(p => ({ ...p, name: v }))} placeholder="e.g. FastFreight Inc" caps="words" />
            <TouchableOpacity style={[s.saveBtn, savingC && { opacity: 0.6 }]} onPress={saveCarrier} disabled={savingC}>
              <Text style={s.saveBtnTxt}>{savingC ? 'Saving…' : 'Save Carrier'}</Text>
            </TouchableOpacity>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Carrier Truck Form Modal ══════════════════════════════ */}
      <Modal visible={ctModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>＋ Add Truck</Text>
              <Text style={s.modalSub}>{ctCarrier?.name}</Text>
            </View>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setCtModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Field label="Truck Name *" value={ctForm.name} onChangeText={ctf('name')} placeholder="e.g. FF Semi 1" caps="words" />

            <Text style={s.lbl}>Dimensions (ft)</Text>
            <View style={s.row3}>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Length</Text><TextInput style={s.input} value={ctForm.length} onChangeText={ctf('length')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Width</Text><TextInput style={s.input} value={ctForm.width}  onChangeText={ctf('width')}  keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Height</Text><TextInput style={s.input} value={ctForm.height} onChangeText={ctf('height')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
            </View>

            <Field label="Max Weight (lbs)" value={ctForm.maxWt} onChangeText={ctf('maxWt')} placeholder="44000" keyboard="decimal-pad" />

            <Text style={s.lbl}>Pricing</Text>
            <View style={s.row2}>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Base Rate ($)</Text><TextInput style={s.input} value={ctForm.baseRate}  onChangeText={ctf('baseRate')}  keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
              <View style={{ flex:1 }}><Text style={s.dimLbl}>Rate/Mile ($/mi)</Text><TextInput style={s.input} value={ctForm.ratePerMi} onChangeText={ctf('ratePerMi')} keyboardType="decimal-pad" placeholderTextColor={C.text3} /></View>
            </View>

            <TouchableOpacity style={[s.saveBtn, savingCT && { opacity: 0.6 }]} onPress={saveCarrierTruck} disabled={savingCT}>
              <Text style={s.saveBtnTxt}>{savingCT ? 'Saving…' : 'Add Truck'}</Text>
            </TouchableOpacity>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Rate Form Modal ═══════════════════════════════════════ */}
      <Modal visible={rateModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHead}>
            <View>
              <Text style={s.modalTitle}>{editRateId != null ? '✏️ Edit Rate' : '💲 Add Rate'}</Text>
              <Text style={s.modalSub}>Per-km charge override</Text>
            </View>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setRateModal(false)}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Field
              label="Origin City (optional — blank = any city)"
              value={rateForm.city}
              onChangeText={v => setRateForm(p => ({ ...p, city: v }))}
              placeholder="e.g. Chicago"
              caps="words"
            />

            <Text style={s.lbl}>Carrier (optional)</Text>
            <View style={s.ratePickerRow}>
              <TouchableOpacity style={s.ratePickerBtn} onPress={() => {
                const opts = [
                  { text: 'Any carrier', onPress: () => setRateForm(p => ({ ...p, carrierId: '', truckRef: '' })) },
                  { text: 'Own Fleet',   onPress: () => setRateForm(p => ({ ...p, carrierId: 'own', truckRef: '' })) },
                  ...carriers.map(c => ({ text: c.name, onPress: () => setRateForm(p => ({ ...p, carrierId: String(c.id), truckRef: '' })) })),
                  { text: 'Cancel', style: 'cancel' },
                ];
                Alert.alert('Select Carrier', '', opts);
              }}>
                <Text style={s.ratePickerTxt}>
                  {rateForm.carrierId === '' ? 'Any carrier'
                    : rateForm.carrierId === 'own' ? 'Own Fleet'
                    : carriers.find(c => String(c.id) === rateForm.carrierId)?.name || 'Select…'}
                </Text>
                <Text style={s.ratePickerArrow}>▾</Text>
              </TouchableOpacity>
            </View>

            <Text style={[s.lbl, { marginTop: 4 }]}>Truck (optional)</Text>
            <View style={s.ratePickerRow}>
              <TouchableOpacity style={s.ratePickerBtn} onPress={() => {
                let truckOpts = [{ text: 'Any truck', onPress: () => setRateForm(p => ({ ...p, truckRef: '' })) }];
                if (rateForm.carrierId === 'own') {
                  truckOpts = [...truckOpts, ...trucks.map(t => ({ text: t.name, onPress: () => setRateForm(p => ({ ...p, truckRef: String(t.id) })) }))];
                } else if (rateForm.carrierId) {
                  const carr = carriers.find(c => String(c.id) === rateForm.carrierId);
                  truckOpts = [...truckOpts, ...(carr?.trucks || []).map(t => ({ text: t.name, onPress: () => setRateForm(p => ({ ...p, truckRef: String(t.tid) })) }))];
                }
                Alert.alert('Select Truck', '', [...truckOpts, { text: 'Cancel', style: 'cancel' }]);
              }}>
                <Text style={s.ratePickerTxt}>
                  {rateForm.truckRef === '' ? 'Any truck'
                    : rateForm.carrierId === 'own' || rateForm.carrierId === ''
                      ? trucks.find(t => String(t.id) === rateForm.truckRef)?.name || `Truck #${rateForm.truckRef}`
                      : (() => {
                          const carr = carriers.find(c => String(c.id) === rateForm.carrierId);
                          return carr?.trucks?.find(t => String(t.tid) === rateForm.truckRef)?.name || `Truck #${rateForm.truckRef}`;
                        })()
                  }
                </Text>
                <Text style={s.ratePickerArrow}>▾</Text>
              </TouchableOpacity>
            </View>

            <Field
              label="Rate per km ($/km) *"
              value={rateForm.ratePerKm}
              onChangeText={v => setRateForm(p => ({ ...p, ratePerKm: v }))}
              placeholder="2.00"
              keyboard="decimal-pad"
            />

            <TouchableOpacity style={[s.saveBtn, savingR && { opacity: 0.6 }]} onPress={saveRate} disabled={savingR}>
              <Text style={s.saveBtnTxt}>{savingR ? 'Saving…' : 'Save Rate'}</Text>
            </TouchableOpacity>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsBanner: {
    flexDirection: 'row', backgroundColor: C.navy,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum:  { fontSize: 22, fontWeight: '900', color: '#f1f5f9' },
  statLbl:  { fontSize: 9,  color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },
  statDiv:  { width: 1, backgroundColor: '#1e3a5f', marginVertical: 4 },

  sectionHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 14, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.text },
  addBadge:     { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBadgeTxt:  { color: '#fff', fontSize: 12, fontWeight: '800' },

  card: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginHorizontal: 14, marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardRow:  { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  cardName: { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 4 },
  cardMeta: { fontSize: 11, color: C.text2, marginTop: 1 },
  plateBadge: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4, borderWidth: 1, borderColor: C.border },
  plateTxt:   { fontSize: 11, fontWeight: '800', color: C.text, letterSpacing: 0.5 },

  actions:    { gap: 6, marginLeft: 10 },
  editBtn:    { backgroundColor: 'rgba(37,99,235,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)' },
  editBtnTxt: { fontSize: 11, fontWeight: '700', color: C.primary },
  delBtn:     { backgroundColor: '#fff1f2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#fecaca' },
  delBtnTxt:  { fontSize: 11, fontWeight: '700', color: C.danger },

  subRow:    { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2 },
  subName:   { fontSize: 13, fontWeight: '700', color: C.text },
  subMeta:   { fontSize: 10, color: C.text2, marginTop: 1 },
  subDelBtn: { marginLeft: 10, padding: 6, backgroundColor: '#fff1f2', borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },
  subDelTxt: { fontSize: 12, color: C.danger, fontWeight: '800' },
  addSubBtn: { margin: 10, marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: C.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  addSubTxt: { fontSize: 12, fontWeight: '700', color: C.primary },

  emptyCard:  { alignItems: 'center', padding: 32, backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  emptyIcon:  { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 4 },
  emptyHint:  { fontSize: 12, color: C.text2, textAlign: 'center' },

  /* modal */
  modalHead:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 22, backgroundColor: C.navy },
  modalTitle:    { fontSize: 18, fontWeight: '900', color: '#f1f5f9' },
  modalSub:      { fontSize: 11, color: '#64748b', marginTop: 3 },
  modalCloseBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },
  modalBody:     { flex: 1, padding: 18, backgroundColor: C.bg },

  lbl:    { fontSize: 11, fontWeight: '800', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  dimLbl: { fontSize: 10, fontWeight: '700', color: C.text2, textAlign: 'center', marginBottom: 4 },
  input:  { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, padding: 11, fontSize: 14, color: C.text, marginBottom: 14 },
  row3:   { flexDirection: 'row', gap: 8 },
  row2:   { flexDirection: 'row', gap: 8 },

  saveBtn:    { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },

  ratePickerRow: { marginBottom: 14 },
  ratePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, padding: 11 },
  ratePickerTxt: { fontSize: 14, color: C.text },
  ratePickerArrow: { fontSize: 14, color: C.text2 },
});
