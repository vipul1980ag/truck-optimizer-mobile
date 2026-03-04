import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

function LocationField({ label, value, onChangeText, onSearch, loading, suggestions, onSelectSuggestion }) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Search ${label.toLowerCase()}...`}
          placeholderTextColor={C.text3}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={s.searchBtn} onPress={onSearch} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.searchBtnTxt}>🔍</Text>
          }
        </TouchableOpacity>
      </View>
      {suggestions.length > 0 && (
        <View style={s.suggestions}>
          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.suggestionItem, idx < suggestions.length - 1 && s.suggestionBorder]}
              onPress={() => onSelectSuggestion(item)}
            >
              <Text style={s.suggestionTxt} numberOfLines={2}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {suggestions.length === 0 && suggestions._noResults && (
        <View style={s.suggestions}>
          <Text style={s.noResults}>No results found</Text>
        </View>
      )}
    </View>
  );
}

export default function LocationScreen({ navigation }) {
  const { setStartLocation, setDestLocation, startLocation, destLocation } = useWizard();

  const [startText,        setStartText]        = useState(startLocation?.label || '');
  const [destText,         setDestText]          = useState(destLocation?.label || '');
  const [startSuggestions, setStartSuggestions]  = useState([]);
  const [destSuggestions,  setDestSuggestions]   = useState([]);
  const [startLoading,     setStartLoading]      = useState(false);
  const [destLoading,      setDestLoading]       = useState(false);

  async function search(query, setLoading, setSuggestions, setLocation) {
    if (!query.trim()) return;
    setLoading(true);
    setLocation(null);
    try {
      const results = await api.geocode(query);
      if (results.length === 0) {
        const arr = []; arr._noResults = true;
        setSuggestions(arr);
      } else {
        setSuggestions(results);
      }
    } catch (e) {
      Alert.alert('Search Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function selectSuggestion(item, setText, setSuggestions, setLocation) {
    setText(item.label);
    setSuggestions([]);
    setLocation(item);
  }

  const bothSet = !!(startLocation && destLocation);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>📍 Where is your cargo going?</Text>
        <Text style={s.sub}>Enter pickup and delivery locations to find the best route</Text>

        <LocationField
          label="Start Location (Pickup)"
          value={startText}
          onChangeText={t => { setStartText(t); if (startLocation) setStartLocation(null); setStartSuggestions([]); }}
          onSearch={() => search(startText, setStartLoading, setStartSuggestions, setStartLocation)}
          loading={startLoading}
          suggestions={startSuggestions}
          onSelectSuggestion={item => selectSuggestion(item, setStartText, setStartSuggestions, setStartLocation)}
        />

        {startLocation && (
          <View style={s.confirmedBadge}>
            <Text style={s.confirmedTxt}>✓ {startLocation.label}</Text>
          </View>
        )}

        <LocationField
          label="Destination (Delivery)"
          value={destText}
          onChangeText={t => { setDestText(t); if (destLocation) setDestLocation(null); setDestSuggestions([]); }}
          onSearch={() => search(destText, setDestLoading, setDestSuggestions, setDestLocation)}
          loading={destLoading}
          suggestions={destSuggestions}
          onSelectSuggestion={item => selectSuggestion(item, setDestText, setDestSuggestions, setDestLocation)}
        />

        {destLocation && (
          <View style={s.confirmedBadge}>
            <Text style={s.confirmedTxt}>✓ {destLocation.label}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.nextBtn, !bothSet && s.nextBtnDisabled]}
          onPress={() => bothSet && navigation.navigate('Route')}
          activeOpacity={bothSet ? 0.8 : 1}
        >
          <Text style={s.nextBtnTxt}>Find Routes 🗺️</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  container: { flexGrow: 1, padding: 20 },

  heading: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  sub:     { fontSize: 13, color: C.text2, marginBottom: 24, lineHeight: 19 },

  fieldWrap:  { marginBottom: 8, zIndex: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.text2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border,
  },
  searchBtn: {
    backgroundColor: C.primary, borderRadius: 10, width: 48, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnTxt: { fontSize: 18 },

  suggestions: {
    backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border,
    marginTop: 4, overflow: 'hidden',
  },
  suggestionItem:   { paddingHorizontal: 14, paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: C.surface2 },
  suggestionTxt:    { fontSize: 13, color: C.text, lineHeight: 18 },
  noResults:        { padding: 14, fontSize: 13, color: C.text2, fontStyle: 'italic' },

  confirmedBadge: {
    backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: 16, borderWidth: 1, borderColor: '#86efac',
  },
  confirmedTxt: { fontSize: 12, color: '#166534', fontWeight: '700', lineHeight: 16 },

  nextBtn:         { marginTop: 24, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#cbd5e1' },
  nextBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '800' },
});
