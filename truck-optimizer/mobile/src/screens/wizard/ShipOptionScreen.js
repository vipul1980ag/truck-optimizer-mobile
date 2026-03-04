import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { C } from '../../theme';

const OPTIONS = [
  {
    key:   'shared',
    icon:  '🤝',
    title: 'Share Truck (LTL)',
    sub:   'Less Than Truckload',
    desc:  'Split the truck with other customers going the same way. Lower cost, flexible pickup windows.',
    tag:   'Best value',
    tagColor: '#16a34a',
    tagBg:    '#dcfce7',
  },
  {
    key:   'private',
    icon:  '🚚',
    title: 'Private Truck (FTL)',
    sub:   'Full Truckload',
    desc:  'A dedicated truck exclusively for your cargo. Faster delivery and full control over scheduling.',
    tag:   'Fastest',
    tagColor: '#1d4ed8',
    tagBg:    '#dbeafe',
  },
];

export default function ShipOptionScreen({ navigation }) {
  const { shippingOption, setShippingOption, items } = useWizard();
  const hasDG   = items.some(i => i.isDG);
  const dgItems = items.filter(i => i.isDG);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.heading}>How would you like to ship?</Text>
        <Text style={s.sub}>Choose the option that best fits your needs</Text>

        {hasDG && (
          <View style={s.dgNotice}>
            <Text style={s.dgNoticeTitle}>⚠ Dangerous Goods in your shipment</Text>
            <Text style={s.dgNoticeTxt}>
              {dgItems.length} item{dgItems.length !== 1 ? 's are' : ' is'} declared as DG. A DG-certified truck will be assigned. A 15% DG surcharge applies to the estimated charges.
            </Text>
          </View>
        )}

        {OPTIONS.map(opt => {
          const selected = shippingOption === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[s.card, selected && s.cardSelected]}
              onPress={() => setShippingOption(opt.key)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <Text style={s.cardIcon}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{opt.title}</Text>
                  <Text style={s.cardSub}>{opt.sub}</Text>
                </View>
                <View style={[s.tag, { backgroundColor: opt.tagBg }]}>
                  <Text style={[s.tagTxt, { color: opt.tagColor }]}>{opt.tag}</Text>
                </View>
              </View>
              <Text style={s.cardDesc}>{opt.desc}</Text>
              {selected && (
                <View style={s.selectedBadge}>
                  <Text style={s.selectedBadgeTxt}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[s.nextBtn, !shippingOption && s.nextBtnDisabled]}
          onPress={() => shippingOption && navigation.navigate('Location')}
          activeOpacity={shippingOption ? 0.8 : 1}
        >
          <Text style={s.nextBtnTxt}>Next: Enter Route →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  container: { flexGrow: 1, padding: 20 },

  heading: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  sub:     { fontSize: 13, color: C.text2, marginBottom: 16 },

  dgNotice:      { backgroundColor: '#fff7ed', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: '#fed7aa' },
  dgNoticeTitle: { fontSize: 14, fontWeight: '900', color: '#c2410c', marginBottom: 4 },
  dgNoticeTxt:   { fontSize: 12, color: '#9a3412', lineHeight: 18 },

  card: {
    backgroundColor: C.surface, borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderWidth: 2, borderColor: C.border,
  },
  cardSelected: { borderColor: C.primary, backgroundColor: '#f0f7ff' },

  cardTop:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardIcon:  { fontSize: 30 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: C.text },
  cardSub:   { fontSize: 11, color: C.text2, marginTop: 1 },
  cardDesc:  { fontSize: 13, color: C.text2, lineHeight: 19 },

  tag:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagTxt: { fontSize: 10, fontWeight: '800' },

  selectedBadge:    { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  selectedBadgeTxt: { fontSize: 12, fontWeight: '800', color: C.primary },

  nextBtn:         { marginTop: 8, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#cbd5e1' },
  nextBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '800' },
});
