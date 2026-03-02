import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { C } from '../theme';

// view: 'choose' | 'login' | 'register'
export default function AuthScreen() {
  const { login, register } = useAuth();
  const [view, setView]     = useState('choose');
  const [busy, setBusy]     = useState(false);
  const [err,  setErr]      = useState('');

  // login fields
  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');

  // register fields
  const [rEmail,   setREmail]   = useState('');
  const [rPass,    setRPass]    = useState('');
  const [rPhone,   setRPhone]   = useState('');
  const [rAddress, setRAddress] = useState('');

  function go(v) { setErr(''); setView(v); }

  async function doLogin() {
    if (!lEmail.trim() || !lPass) { setErr('Email and password are required.'); return; }
    setBusy(true); setErr('');
    try { await login(lEmail.trim(), lPass); }
    catch (e) { setErr(e.message); }
    finally   { setBusy(false); }
  }

  async function doRegister() {
    if (!rEmail.trim() || !rPass || !rPhone.trim() || !rAddress.trim()) {
      setErr('All fields are required.'); return;
    }
    if (rPass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setBusy(true); setErr('');
    try { await register(rEmail.trim(), rPass, rPhone.trim(), rAddress.trim()); }
    catch (e) { setErr(e.message); }
    finally   { setBusy(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <Text style={s.logo}>🚛</Text>
            <Text style={s.appName}>Load Optimizer</Text>
            <Text style={s.tagline}>Truck cargo management</Text>
          </View>

          {/* Card */}
          <View style={s.card}>

            {/* ── Choose view ── */}
            {view === 'choose' && (
              <>
                <Text style={s.cardTitle}>👋 Welcome</Text>
                <Text style={s.cardSub}>Sign in or create a new account</Text>
                <View style={s.chooseRow}>
                  <TouchableOpacity style={s.chooseBtn} onPress={() => go('login')}>
                    <Text style={s.chooseBtnIcon}>🔑</Text>
                    <Text style={s.chooseBtnLabel}>Login</Text>
                    <Text style={s.chooseBtnSub}>Existing account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.chooseBtn} onPress={() => go('register')}>
                    <Text style={s.chooseBtnIcon}>✨</Text>
                    <Text style={s.chooseBtnLabel}>Register</Text>
                    <Text style={s.chooseBtnSub}>New user</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Login view ── */}
            {view === 'login' && (
              <>
                <View style={s.viewHead}>
                  <Text style={s.cardTitle}>🔑 Login</Text>
                  <TouchableOpacity onPress={() => go('choose')}>
                    <Text style={s.backBtn}>← Back</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.lbl}>Email</Text>
                <TextInput
                  style={s.input} value={lEmail} onChangeText={setLEmail}
                  placeholder="you@example.com" placeholderTextColor={C.text3}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                />
                <Text style={s.lbl}>Password</Text>
                <TextInput
                  style={s.input} value={lPass} onChangeText={setLPass}
                  placeholder="••••••••" placeholderTextColor={C.text3}
                  secureTextEntry autoCapitalize="none"
                />
                {!!err && <Text style={s.err}>{err}</Text>}
                <TouchableOpacity style={s.submitBtn} onPress={doLogin} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>Sign In</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => go('register')}>
                  <Text style={s.switchTxt}>No account? <Text style={s.switchLink}>Create one →</Text></Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Register view ── */}
            {view === 'register' && (
              <>
                <View style={s.viewHead}>
                  <Text style={s.cardTitle}>✨ Create Account</Text>
                  <TouchableOpacity onPress={() => go('choose')}>
                    <Text style={s.backBtn}>← Back</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.lbl}>Email</Text>
                <TextInput
                  style={s.input} value={rEmail} onChangeText={setREmail}
                  placeholder="you@example.com" placeholderTextColor={C.text3}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                />
                <Text style={s.lbl}>Password</Text>
                <TextInput
                  style={s.input} value={rPass} onChangeText={setRPass}
                  placeholder="Min 6 characters" placeholderTextColor={C.text3}
                  secureTextEntry autoCapitalize="none"
                />
                <Text style={s.lbl}>Phone Number</Text>
                <TextInput
                  style={s.input} value={rPhone} onChangeText={setRPhone}
                  placeholder="+1 555 000 0000" placeholderTextColor={C.text3}
                  keyboardType="phone-pad"
                />
                <Text style={s.lbl}>Address</Text>
                <TextInput
                  style={[s.input, s.textarea]} value={rAddress} onChangeText={setRAddress}
                  placeholder="123 Main St, City, State, ZIP"
                  placeholderTextColor={C.text3}
                  multiline numberOfLines={3} textAlignVertical="top"
                  autoCapitalize="words"
                />
                {!!err && <Text style={s.err}>{err}</Text>}
                <TouchableOpacity style={s.submitBtn} onPress={doRegister} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>Create Account</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => go('login')}>
                  <Text style={s.switchTxt}>Have an account? <Text style={s.switchLink}>Sign in →</Text></Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.navy },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },

  header:  { alignItems: 'center', marginBottom: 28 },
  logo:    { fontSize: 48, marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#64748b', marginTop: 4 },

  card:      { backgroundColor: C.surface, borderRadius: 20, padding: 24,
               shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
               elevation: 10 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: C.text2, marginBottom: 20 },

  viewHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn:   { fontSize: 13, color: C.primary, fontWeight: '700' },

  chooseRow: { flexDirection: 'row', gap: 12 },
  chooseBtn: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: 18, paddingHorizontal: 8,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface2,
  },
  chooseBtnIcon:  { fontSize: 26 },
  chooseBtnLabel: { fontSize: 14, fontWeight: '800', color: C.text },
  chooseBtnSub:   { fontSize: 10, color: C.text2 },

  lbl:   { fontSize: 11, fontWeight: '700', color: C.text2, textTransform: 'uppercase',
            letterSpacing: 0.4, marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: C.text, backgroundColor: C.surface,
  },
  textarea: { height: 80, paddingTop: 10 },
  err:      { fontSize: 12, color: C.danger, marginTop: 8 },

  submitBtn: {
    marginTop: 16, backgroundColor: C.primary, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  switchTxt:  { textAlign: 'center', marginTop: 14, fontSize: 13, color: C.text2 },
  switchLink: { color: C.primary, fontWeight: '700' },
});
