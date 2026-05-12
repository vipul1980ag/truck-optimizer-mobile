import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { C, shadow } from '../theme';
import { useLocale, LANGUAGES } from '../LocaleContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const { lang, setLanguage, t } = useLocale();
  const [view, setView] = useState('choose');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');

  const [rEmail,   setREmail]   = useState('');
  const [rPass,    setRPass]    = useState('');
  const [rPhone,   setRPhone]   = useState('');
  const [rAddress, setRAddress] = useState('');

  function go(v) { setErr(''); setView(v); }

  async function doLogin() {
    if (!lEmail.trim() || !lPass) { setErr(t('emailRequired')); return; }
    setBusy(true); setErr('');
    try { await login(lEmail.trim(), lPass); }
    catch (e) { setErr(e.message); }
    finally   { setBusy(false); }
  }

  async function doRegister() {
    if (!rEmail.trim() || !rPass || !rPhone.trim() || !rAddress.trim()) {
      setErr(t('allFieldsRequired')); return;
    }
    if (rPass.length < 6) { setErr(t('passwordTooShort')); return; }
    setBusy(true); setErr('');
    try { await register(rEmail.trim(), rPass, rPhone.trim(), rAddress.trim()); }
    catch (e) { setErr(e.message); }
    finally   { setBusy(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.circle1} pointerEvents="none" />
      <View style={s.circle2} pointerEvents="none" />
      <View style={s.circle3} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Branding */}
          <View style={s.header}>
            <View style={s.logoWrap}>
              <Text style={s.logo}>🚛</Text>
            </View>
            <Text style={s.appName}>Load Optimizer</Text>
            <Text style={s.tagline}>{t('appTagline')}</Text>
          </View>

          {/* Language picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.langRow}
            style={s.langScroll}
          >
            {LANGUAGES.map(l => {
              const active = l.code === lang;
              return (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  style={[s.langPill, active && s.langPillActive]}
                  activeOpacity={0.7}
                >
                  <Text style={s.langFlag}>{l.flag}</Text>
                  <Text style={[s.langCode, active && s.langCodeActive]}>
                    {l.code.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Card */}
          <View style={s.card}>

            {/* Choose */}
            {view === 'choose' && (
              <>
                <Text style={s.cardTitle}>{t('welcome')}</Text>
                <Text style={s.cardSub}>{t('welcomeSub')}</Text>
                <View style={s.chooseRow}>
                  <TouchableOpacity style={[s.chooseBtn, s.chooseBtnBlue]} onPress={() => go('login')}>
                    <View style={[s.chooseIconWrap, { backgroundColor: '#dbeafe' }]}>
                      <Text style={s.chooseBtnIcon}>🔑</Text>
                    </View>
                    <Text style={s.chooseBtnLabel}>{t('signIn')}</Text>
                    <Text style={s.chooseBtnSub}>{t('signInSub')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.chooseBtn, s.chooseBtnPurple]} onPress={() => go('register')}>
                    <View style={[s.chooseIconWrap, { backgroundColor: '#ede9fe' }]}>
                      <Text style={s.chooseBtnIcon}>✨</Text>
                    </View>
                    <Text style={s.chooseBtnLabel}>{t('register')}</Text>
                    <Text style={s.chooseBtnSub}>{t('registerSub')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Login */}
            {view === 'login' && (
              <>
                <View style={s.viewHead}>
                  <View>
                    <Text style={s.cardTitle}>{t('signInTitle')}</Text>
                    <Text style={s.cardSub}>{t('welcomeBack')}</Text>
                  </View>
                  <TouchableOpacity style={s.backBtnWrap} onPress={() => go('choose')}>
                    <Text style={s.backBtn}>{t('back')}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={s.lbl}>{t('emailAddress')}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>✉️</Text>
                  <TextInput
                    style={s.input} value={lEmail} onChangeText={setLEmail}
                    placeholder={t('emailPlaceholder')} placeholderTextColor={C.text3}
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  />
                </View>

                <Text style={s.lbl}>{t('password')}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>🔒</Text>
                  <TextInput
                    style={s.input} value={lPass} onChangeText={setLPass}
                    placeholder={t('passwordPlaceholder')} placeholderTextColor={C.text3}
                    secureTextEntry autoCapitalize="none"
                  />
                </View>

                {!!err && (
                  <View style={s.errWrap}>
                    <Text style={s.errTxt}>⚠️  {err}</Text>
                  </View>
                )}

                <TouchableOpacity style={s.submitBtn} onPress={doLogin} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>{t('signInBtn')}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => go('register')} style={s.switchWrap}>
                  <Text style={s.switchTxt}>
                    {t('noAccount')}{'  '}<Text style={s.switchLink}>{t('registerLink')}</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Register */}
            {view === 'register' && (
              <>
                <View style={s.viewHead}>
                  <View>
                    <Text style={s.cardTitle}>{t('registerTitle')}</Text>
                    <Text style={s.cardSub}>{t('joinToday')}</Text>
                  </View>
                  <TouchableOpacity style={s.backBtnWrap} onPress={() => go('choose')}>
                    <Text style={s.backBtn}>{t('back')}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={s.lbl}>{t('emailAddress')}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>✉️</Text>
                  <TextInput
                    style={s.input} value={rEmail} onChangeText={setREmail}
                    placeholder={t('emailPlaceholder')} placeholderTextColor={C.text3}
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  />
                </View>

                <Text style={s.lbl}>{t('password')}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>🔒</Text>
                  <TextInput
                    style={s.input} value={rPass} onChangeText={setRPass}
                    placeholder={t('minPasswordPlaceholder')} placeholderTextColor={C.text3}
                    secureTextEntry autoCapitalize="none"
                  />
                </View>

                <Text style={s.lbl}>{t('phoneNumber')}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>📱</Text>
                  <TextInput
                    style={s.input} value={rPhone} onChangeText={setRPhone}
                    placeholder={t('phonePlaceholder')} placeholderTextColor={C.text3}
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={s.lbl}>{t('address')}</Text>
                <View style={[s.inputWrap, s.textareaWrap]}>
                  <Text style={[s.inputIcon, { alignSelf: 'flex-start', marginTop: 4 }]}>📍</Text>
                  <TextInput
                    style={[s.input, s.textarea]} value={rAddress} onChangeText={setRAddress}
                    placeholder={t('addressPlaceholder')} placeholderTextColor={C.text3}
                    multiline numberOfLines={3} textAlignVertical="top" autoCapitalize="words"
                  />
                </View>

                {!!err && (
                  <View style={s.errWrap}>
                    <Text style={s.errTxt}>⚠️  {err}</Text>
                  </View>
                )}

                <TouchableOpacity style={[s.submitBtn, s.submitBtnPurple]} onPress={doRegister} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>{t('createAccountBtn')}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => go('login')} style={s.switchWrap}>
                  <Text style={s.switchTxt}>
                    {t('haveAccount')}{'  '}<Text style={s.switchLink}>{t('signInLink')}</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={s.footer}>{t('footer')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.navy },

  circle1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(37,99,235,0.13)', top: -110, right: -90,
  },
  circle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(124,58,237,0.09)', bottom: 60, left: -90,
  },
  circle3: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(37,99,235,0.07)', top: 230, left: -30,
  },

  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 48 },

  header: { alignItems: 'center', marginBottom: 20 },
  logoWrap: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: 'rgba(37,99,235,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.38)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, ...shadow.md, shadowColor: '#3b82f6',
  },
  logo:    { fontSize: 46 },
  appName: { fontSize: 28, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.8, marginBottom: 6 },
  tagline: { fontSize: 13, color: '#64748b', letterSpacing: 0.4 },

  /* Language picker */
  langScroll: { marginBottom: 20 },
  langRow:    { paddingHorizontal: 4, gap: 8 },
  langPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  langPillActive: {
    backgroundColor: 'rgba(37,99,235,0.35)',
    borderColor: 'rgba(96,165,250,0.6)',
  },
  langFlag: { fontSize: 16 },
  langCode: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  langCodeActive: { color: '#93c5fd' },

  /* Card */
  card: { backgroundColor: C.surface, borderRadius: 26, padding: 24, ...shadow.xl },
  cardTitle: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: C.text2, marginBottom: 24, lineHeight: 19 },

  viewHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  backBtnWrap: {
    backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1, borderColor: C.border,
  },
  backBtn: { fontSize: 12, color: C.primary, fontWeight: '700' },

  chooseRow:       { flexDirection: 'row', gap: 12 },
  chooseBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 22, paddingHorizontal: 10,
    borderRadius: 18, borderWidth: 1.5,
  },
  chooseBtnBlue:   { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  chooseBtnPurple: { borderColor: '#ddd6fe', backgroundColor: '#faf5ff' },
  chooseIconWrap:  {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  chooseBtnIcon:  { fontSize: 28 },
  chooseBtnLabel: { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 3 },
  chooseBtnSub:   { fontSize: 11, color: C.text2 },

  lbl: {
    fontSize: 11, fontWeight: '700', color: C.text2, textTransform: 'uppercase',
    letterSpacing: 0.7, marginTop: 18, marginBottom: 7,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border, borderRadius: 13,
    backgroundColor: C.surface2, paddingHorizontal: 13,
  },
  textareaWrap: { alignItems: 'flex-start', paddingVertical: 8 },
  inputIcon:    { fontSize: 16, marginRight: 9 },
  input:        { flex: 1, paddingVertical: 13, fontSize: 14, color: C.text },
  textarea:     { height: 76, paddingTop: 4 },

  errWrap: {
    marginTop: 14, backgroundColor: '#fef2f2', borderRadius: 10,
    padding: 12, borderLeftWidth: 3, borderLeftColor: C.danger,
  },
  errTxt: { fontSize: 12, color: C.danger, lineHeight: 18 },

  submitBtn: {
    marginTop: 22, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  submitBtnPurple: { backgroundColor: C.accent, shadowColor: C.accent },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },

  switchWrap: { marginTop: 18, alignItems: 'center' },
  switchTxt:  { fontSize: 13, color: C.text2, textAlign: 'center' },
  switchLink: { color: C.primary, fontWeight: '700' },

  footer: {
    textAlign: 'center', marginTop: 28,
    fontSize: 11, color: '#334155', letterSpacing: 2, textTransform: 'uppercase',
  },
});
