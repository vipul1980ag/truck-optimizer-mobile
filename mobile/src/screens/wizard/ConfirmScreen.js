import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';

export default function ConfirmScreen({ navigation, route }) {
  const { resetWizard, shippingOption } = useWizard();
  const { totalItems, totalWeight, estimate, hasDG, dgCount, dgSurcharge } = route.params || {};

  function startNew() {
    resetWizard();
    navigation.reset({ index: 0, routes: [{ name: 'AddCargo' }] });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Success icon */}
        <View style={s.iconWrap}>
          <Text style={s.icon}>✅</Text>
        </View>

        <Text style={s.title}>Booking Confirmed!</Text>
        <Text style={s.sub}>Your cargo has been submitted successfully.</Text>

        {/* Summary card */}
        <View style={s.card}>
          <Text style={s.cardHead}>Booking Summary</Text>
          <View style={s.row}>
            <Text style={s.rowLbl}>Items submitted</Text>
            <Text style={s.rowVal}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowLbl}>Total weight</Text>
            <Text style={s.rowVal}>{(totalWeight || 0).toLocaleString()} lbs</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowLbl}>Shipping type</Text>
            <Text style={s.rowVal}>
              {shippingOption === 'shared' ? '🤝 Share Truck (LTL)' : '🚚 Private Truck (FTL)'}
            </Text>
          </View>
          {!!estimate && (
            <View style={s.row}>
              <Text style={s.rowLbl}>Estimated cost</Text>
              <Text style={[s.rowVal, { color: C.primary, fontSize: 16 }]}>
                ${estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
          )}
          {hasDG && (
            <View style={[s.row, { borderBottomWidth: 0 }]}>
              <Text style={[s.rowLbl, { color: '#c2410c' }]}>⚠ DG items</Text>
              <Text style={[s.rowVal, { color: '#c2410c' }]}>
                {dgCount} item{dgCount !== 1 ? 's' : ''} · +${(dgSurcharge || 0).toLocaleString()} surcharge
              </Text>
            </View>
          )}
        </View>

        {hasDG && (
          <View style={s.dgNote}>
            <Text style={s.dgNoteTxt}>🚛 A DG-certified truck will be assigned. Our team will confirm DG documentation requirements.</Text>
          </View>
        )}

        <Text style={s.note}>Our team will contact you to confirm pickup details and final pricing.</Text>

        <TouchableOpacity style={s.newBtn} onPress={startNew}>
          <Text style={s.newBtnTxt}>＋ Start New Booking</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },

  iconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  icon:  { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, marginBottom: 6, textAlign: 'center' },
  sub:   { fontSize: 14, color: C.text2, marginBottom: 28, textAlign: 'center' },

  card:     { backgroundColor: C.surface, borderRadius: 14, padding: 18, width: '100%', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  cardHead: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 12 },
  row:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.surface2 },
  rowLbl:   { fontSize: 13, color: C.text2 },
  rowVal:   { fontSize: 13, fontWeight: '700', color: C.text },

  note:   { fontSize: 12, color: C.text2, textAlign: 'center', lineHeight: 18, marginBottom: 28, paddingHorizontal: 10 },
  dgNote: { backgroundColor: '#fff7ed', borderRadius: 10, padding: 12, width: '100%', borderWidth: 1, borderColor: '#fed7aa', marginBottom: 12 },
  dgNoteTxt: { fontSize: 12, color: '#c2410c', fontWeight: '700', textAlign: 'center', lineHeight: 18 },

  newBtn:    { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  newBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
