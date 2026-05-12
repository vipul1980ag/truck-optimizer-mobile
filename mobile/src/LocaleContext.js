import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

function getDeviceLocale() {
  try {
    const raw = Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;
    if (raw) return raw.substring(0, 2).toLowerCase();
  } catch {}
  return 'en';
}

export const LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🇺🇸' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'हिन्दी',    flag: '🇮🇳' },
  { code: 'ar', name: 'العربية',   flag: '🇸🇦' },
  { code: 'zh', name: '中文',       flag: '🇨🇳' },
];

const T = {
  en: {
    appTagline: 'Intelligent Cargo Management',
    welcome: 'Welcome', welcomeSub: 'Sign in or create a new account to continue',
    signIn: 'Sign In', signInSub: 'Existing account', signInTitle: 'Sign In', welcomeBack: 'Welcome back',
    register: 'Register', registerSub: 'New account', registerTitle: 'Create Account', joinToday: 'Join Load Optimizer today',
    emailAddress: 'Email Address', password: 'Password', phoneNumber: 'Phone Number', address: 'Address',
    signInBtn: 'Sign In  →', createAccountBtn: 'Create Account  →',
    noAccount: 'No account?', haveAccount: 'Have an account?',
    registerLink: 'Register →', signInLink: 'Sign In →', back: '← Back',
    emailRequired: 'Email and password are required.',
    allFieldsRequired: 'All fields are required.',
    passwordTooShort: 'Password must be at least 6 characters.',
    footer: 'Secure  ·  Reliable  ·  Efficient',
    emailPlaceholder: 'you@example.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'Min 6 characters', phonePlaceholder: '+1 555 000 0000',
    addressPlaceholder: '123 Main St, City, State, ZIP',
    liveData: 'LIVE DATA', heroTitle: '🚛 Load Optimizer',
    heroSub: 'Pull to refresh  ·  Tap New to create a booking',
    ownTrucks: 'Own Trucks', carriers: 'Carriers', customers: 'Customers', cargoUnits: 'Cargo Units',
    paymentSummary: 'Payment Summary', collected: 'Collected', outstanding: 'Outstanding', totalInvoiced: 'Total Invoiced',
    customerStatus: 'Customer Status', total: 'total',
    noCustomers: 'No customers yet', noCustomersHint: 'Customers will appear here once added.',
    loadingDashboard: 'Loading dashboard…', cannotReachServer: 'Cannot reach server',
    checkInternet: 'Check your internet connection and try again.',
    retry: 'Retry  →', lightMode: 'Light', darkMode: 'Dark',
    signOut: 'Sign Out', language: 'Language',
  },
  es: {
    appTagline: 'Gestión Inteligente de Carga',
    welcome: 'Bienvenido', welcomeSub: 'Inicia sesión o crea una cuenta nueva para continuar',
    signIn: 'Iniciar Sesión', signInSub: 'Cuenta existente', signInTitle: 'Iniciar Sesión', welcomeBack: 'Bienvenido de vuelta',
    register: 'Registrarse', registerSub: 'Cuenta nueva', registerTitle: 'Crear Cuenta', joinToday: 'Únete a Load Optimizer hoy',
    emailAddress: 'Correo Electrónico', password: 'Contraseña', phoneNumber: 'Teléfono', address: 'Dirección',
    signInBtn: 'Iniciar Sesión  →', createAccountBtn: 'Crear Cuenta  →',
    noAccount: '¿Sin cuenta?', haveAccount: '¿Tienes cuenta?',
    registerLink: 'Regístrate →', signInLink: 'Iniciar Sesión →', back: '← Volver',
    emailRequired: 'El correo y la contraseña son obligatorios.',
    allFieldsRequired: 'Todos los campos son obligatorios.',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres.',
    footer: 'Seguro  ·  Confiable  ·  Eficiente',
    emailPlaceholder: 'tu@ejemplo.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'Mínimo 6 caracteres', phonePlaceholder: '+1 555 000 0000',
    addressPlaceholder: 'Calle 123, Ciudad, Estado, CP',
    liveData: 'DATOS EN VIVO', heroTitle: '🚛 Load Optimizer',
    heroSub: 'Desliza para actualizar  ·  Toca Nuevo para crear un envío',
    ownTrucks: 'Camiones Propios', carriers: 'Transportistas', customers: 'Clientes', cargoUnits: 'Unidades de Carga',
    paymentSummary: 'Resumen de Pagos', collected: 'Cobrado', outstanding: 'Pendiente', totalInvoiced: 'Total Facturado',
    customerStatus: 'Estado de Clientes', total: 'total',
    noCustomers: 'Sin clientes aún', noCustomersHint: 'Los clientes aparecerán aquí una vez añadidos.',
    loadingDashboard: 'Cargando panel…', cannotReachServer: 'No se puede conectar al servidor',
    checkInternet: 'Verifica tu conexión a internet e inténtalo de nuevo.',
    retry: 'Reintentar  →', lightMode: 'Claro', darkMode: 'Oscuro',
    signOut: 'Salir', language: 'Idioma',
  },
  fr: {
    appTagline: 'Gestion Intelligente du Fret',
    welcome: 'Bienvenue', welcomeSub: 'Connectez-vous ou créez un nouveau compte pour continuer',
    signIn: 'Se Connecter', signInSub: 'Compte existant', signInTitle: 'Connexion', welcomeBack: 'Content de vous revoir',
    register: "S'inscrire", registerSub: 'Nouveau compte', registerTitle: 'Créer un Compte', joinToday: "Rejoignez Load Optimizer aujourd'hui",
    emailAddress: 'Adresse e-mail', password: 'Mot de passe', phoneNumber: 'Téléphone', address: 'Adresse',
    signInBtn: 'Se Connecter  →', createAccountBtn: 'Créer un Compte  →',
    noAccount: 'Pas de compte ?', haveAccount: 'Déjà un compte ?',
    registerLink: "S'inscrire →", signInLink: 'Se Connecter →', back: '← Retour',
    emailRequired: "L'e-mail et le mot de passe sont requis.",
    allFieldsRequired: 'Tous les champs sont requis.',
    passwordTooShort: 'Le mot de passe doit comporter au moins 6 caractères.',
    footer: 'Sécurisé  ·  Fiable  ·  Efficace',
    emailPlaceholder: 'vous@exemple.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'Min 6 caractères', phonePlaceholder: '+33 6 00 00 00 00',
    addressPlaceholder: '123 Rue Principale, Ville, Pays',
    liveData: 'DONNÉES EN DIRECT', heroTitle: '🚛 Load Optimizer',
    heroSub: 'Glisser pour actualiser  ·  Appuyez sur Nouveau pour créer une réservation',
    ownTrucks: 'Camions Propres', carriers: 'Transporteurs', customers: 'Clients', cargoUnits: 'Unités de Fret',
    paymentSummary: 'Résumé des Paiements', collected: 'Encaissé', outstanding: 'En Attente', totalInvoiced: 'Total Facturé',
    customerStatus: 'Statut Clients', total: 'total',
    noCustomers: "Aucun client pour l'instant", noCustomersHint: 'Les clients apparaîtront ici une fois ajoutés.',
    loadingDashboard: 'Chargement…', cannotReachServer: 'Impossible de joindre le serveur',
    checkInternet: 'Vérifiez votre connexion internet et réessayez.',
    retry: 'Réessayer  →', lightMode: 'Clair', darkMode: 'Sombre',
    signOut: 'Déconnexion', language: 'Langue',
  },
  de: {
    appTagline: 'Intelligentes Frachtmanagement',
    welcome: 'Willkommen', welcomeSub: 'Melden Sie sich an oder erstellen Sie ein neues Konto',
    signIn: 'Anmelden', signInSub: 'Bestehendes Konto', signInTitle: 'Anmelden', welcomeBack: 'Willkommen zurück',
    register: 'Registrieren', registerSub: 'Neues Konto', registerTitle: 'Konto Erstellen', joinToday: 'Treten Sie Load Optimizer heute bei',
    emailAddress: 'E-Mail-Adresse', password: 'Passwort', phoneNumber: 'Telefonnummer', address: 'Adresse',
    signInBtn: 'Anmelden  →', createAccountBtn: 'Konto Erstellen  →',
    noAccount: 'Kein Konto?', haveAccount: 'Haben Sie ein Konto?',
    registerLink: 'Registrieren →', signInLink: 'Anmelden →', back: '← Zurück',
    emailRequired: 'E-Mail und Passwort sind erforderlich.',
    allFieldsRequired: 'Alle Felder sind erforderlich.',
    passwordTooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    footer: 'Sicher  ·  Zuverlässig  ·  Effizient',
    emailPlaceholder: 'sie@beispiel.de', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'Mind. 6 Zeichen', phonePlaceholder: '+49 170 0000000',
    addressPlaceholder: 'Hauptstraße 123, Stadt, PLZ',
    liveData: 'LIVEDATEN', heroTitle: '🚛 Load Optimizer',
    heroSub: 'Zum Aktualisieren ziehen  ·  Neu antippen für Buchung',
    ownTrucks: 'Eigene LKW', carriers: 'Spediteure', customers: 'Kunden', cargoUnits: 'Frachteinheiten',
    paymentSummary: 'Zahlungsübersicht', collected: 'Eingegangen', outstanding: 'Ausstehend', totalInvoiced: 'Gesamt Fakturiert',
    customerStatus: 'Kundenstatus', total: 'gesamt',
    noCustomers: 'Noch keine Kunden', noCustomersHint: 'Kunden erscheinen hier, sobald sie hinzugefügt wurden.',
    loadingDashboard: 'Wird geladen…', cannotReachServer: 'Server nicht erreichbar',
    checkInternet: 'Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
    retry: 'Erneut versuchen  →', lightMode: 'Hell', darkMode: 'Dunkel',
    signOut: 'Abmelden', language: 'Sprache',
  },
  pt: {
    appTagline: 'Gestão Inteligente de Carga',
    welcome: 'Bem-vindo', welcomeSub: 'Entre ou crie uma nova conta para continuar',
    signIn: 'Entrar', signInSub: 'Conta existente', signInTitle: 'Entrar', welcomeBack: 'Bem-vindo de volta',
    register: 'Registrar', registerSub: 'Nova conta', registerTitle: 'Criar Conta', joinToday: 'Junte-se ao Load Optimizer hoje',
    emailAddress: 'Endereço de E-mail', password: 'Senha', phoneNumber: 'Telefone', address: 'Endereço',
    signInBtn: 'Entrar  →', createAccountBtn: 'Criar Conta  →',
    noAccount: 'Sem conta?', haveAccount: 'Já tem conta?',
    registerLink: 'Registrar →', signInLink: 'Entrar →', back: '← Voltar',
    emailRequired: 'E-mail e senha são obrigatórios.',
    allFieldsRequired: 'Todos os campos são obrigatórios.',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres.',
    footer: 'Seguro  ·  Confiável  ·  Eficiente',
    emailPlaceholder: 'voce@exemplo.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'Mín. 6 caracteres', phonePlaceholder: '+55 11 00000-0000',
    addressPlaceholder: 'Rua Principal 123, Cidade, Estado, CEP',
    liveData: 'DADOS AO VIVO', heroTitle: '🚛 Load Optimizer',
    heroSub: 'Puxe para atualizar  ·  Toque em Novo para criar uma reserva',
    ownTrucks: 'Caminhões Próprios', carriers: 'Transportadoras', customers: 'Clientes', cargoUnits: 'Unidades de Carga',
    paymentSummary: 'Resumo de Pagamentos', collected: 'Recebido', outstanding: 'Pendente', totalInvoiced: 'Total Faturado',
    customerStatus: 'Status dos Clientes', total: 'total',
    noCustomers: 'Nenhum cliente ainda', noCustomersHint: 'Os clientes aparecerão aqui quando adicionados.',
    loadingDashboard: 'Carregando…', cannotReachServer: 'Não foi possível alcançar o servidor',
    checkInternet: 'Verifique sua conexão com a internet e tente novamente.',
    retry: 'Tentar novamente  →', lightMode: 'Claro', darkMode: 'Escuro',
    signOut: 'Sair', language: 'Idioma',
  },
  hi: {
    appTagline: 'स्मार्ट कार्गो प्रबंधन',
    welcome: 'स्वागत है', welcomeSub: 'जारी रखने के लिए साइन इन करें या नया खाता बनाएं',
    signIn: 'साइन इन', signInSub: 'मौजूदा खाता', signInTitle: 'साइन इन', welcomeBack: 'वापसी पर स्वागत है',
    register: 'रजिस्टर', registerSub: 'नया खाता', registerTitle: 'खाता बनाएं', joinToday: 'आज Load Optimizer से जुड़ें',
    emailAddress: 'ईमेल पता', password: 'पासवर्ड', phoneNumber: 'फ़ोन नंबर', address: 'पता',
    signInBtn: 'साइन इन करें  →', createAccountBtn: 'खाता बनाएं  →',
    noAccount: 'खाता नहीं है?', haveAccount: 'खाता है?',
    registerLink: 'रजिस्टर करें →', signInLink: 'साइन इन →', back: '← वापस',
    emailRequired: 'ईमेल और पासवर्ड आवश्यक हैं।',
    allFieldsRequired: 'सभी फ़ील्ड आवश्यक हैं।',
    passwordTooShort: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।',
    footer: 'सुरक्षित  ·  विश्वसनीय  ·  कुशल',
    emailPlaceholder: 'aap@udaharan.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: 'कम से कम 6 अक्षर', phonePlaceholder: '+91 98765 43210',
    addressPlaceholder: '123 मुख्य सड़क, शहर, राज्य, पिन',
    liveData: 'लाइव डेटा', heroTitle: '🚛 Load Optimizer',
    heroSub: 'ताज़ा करने के लिए खींचें  ·  नई बुकिंग के लिए New दबाएं',
    ownTrucks: 'अपने ट्रक', carriers: 'कैरियर', customers: 'ग्राहक', cargoUnits: 'कार्गो यूनिट',
    paymentSummary: 'भुगतान सारांश', collected: 'प्राप्त', outstanding: 'बकाया', totalInvoiced: 'कुल बिल',
    customerStatus: 'ग्राहक स्थिति', total: 'कुल',
    noCustomers: 'अभी कोई ग्राहक नहीं', noCustomersHint: 'ग्राहक जोड़ने के बाद यहां दिखेंगे।',
    loadingDashboard: 'डैशबोर्ड लोड हो रहा है…', cannotReachServer: 'सर्वर से नहीं जुड़ सका',
    checkInternet: 'अपना इंटरनेट कनेक्शन जांचें और फिर कोशिश करें।',
    retry: 'पुनः प्रयास  →', lightMode: 'हल्का', darkMode: 'गहरा',
    signOut: 'साइन आउट', language: 'भाषा',
  },
  ar: {
    appTagline: 'إدارة الشحن الذكية',
    welcome: 'مرحباً', welcomeSub: 'سجّل الدخول أو أنشئ حساباً جديداً للمتابعة',
    signIn: 'تسجيل الدخول', signInSub: 'حساب موجود', signInTitle: 'تسجيل الدخول', welcomeBack: 'مرحباً بعودتك',
    register: 'إنشاء حساب', registerSub: 'حساب جديد', registerTitle: 'إنشاء حساب', joinToday: 'انضم إلى Load Optimizer اليوم',
    emailAddress: 'البريد الإلكتروني', password: 'كلمة المرور', phoneNumber: 'رقم الهاتف', address: 'العنوان',
    signInBtn: 'تسجيل الدخول  →', createAccountBtn: 'إنشاء الحساب  →',
    noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب؟',
    registerLink: 'سجّل الآن →', signInLink: 'تسجيل الدخول →', back: '← رجوع',
    emailRequired: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
    allFieldsRequired: 'جميع الحقول مطلوبة.',
    passwordTooShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
    footer: 'آمن  ·  موثوق  ·  فعّال',
    emailPlaceholder: 'انت@مثال.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: '6 أحرف على الأقل', phonePlaceholder: '+966 50 000 0000',
    addressPlaceholder: 'شارع رئيسي 123، مدينة، رمز بريدي',
    liveData: 'بيانات مباشرة', heroTitle: '🚛 Load Optimizer',
    heroSub: 'اسحب للتحديث  ·  اضغط جديد لإنشاء حجز',
    ownTrucks: 'شاحناتنا', carriers: 'الناقلون', customers: 'العملاء', cargoUnits: 'وحدات الشحن',
    paymentSummary: 'ملخص المدفوعات', collected: 'المحصّل', outstanding: 'المستحق', totalInvoiced: 'إجمالي الفواتير',
    customerStatus: 'حالة العملاء', total: 'إجمالي',
    noCustomers: 'لا يوجد عملاء حتى الآن', noCustomersHint: 'سيظهر العملاء هنا بمجرد إضافتهم.',
    loadingDashboard: 'جاري التحميل…', cannotReachServer: 'تعذّر الوصول إلى الخادم',
    checkInternet: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
    retry: 'إعادة المحاولة  →', lightMode: 'فاتح', darkMode: 'داكن',
    signOut: 'تسجيل الخروج', language: 'اللغة',
  },
  zh: {
    appTagline: '智能货物管理',
    welcome: '欢迎', welcomeSub: '登录或创建新账户以继续',
    signIn: '登录', signInSub: '已有账户', signInTitle: '登录', welcomeBack: '欢迎回来',
    register: '注册', registerSub: '新建账户', registerTitle: '创建账户', joinToday: '立即加入 Load Optimizer',
    emailAddress: '电子邮件', password: '密码', phoneNumber: '电话号码', address: '地址',
    signInBtn: '登录  →', createAccountBtn: '创建账户  →',
    noAccount: '没有账户？', haveAccount: '已有账户？',
    registerLink: '立即注册 →', signInLink: '登录 →', back: '← 返回',
    emailRequired: '邮箱和密码为必填项。',
    allFieldsRequired: '所有字段均为必填项。',
    passwordTooShort: '密码至少需要6个字符。',
    footer: '安全  ·  可靠  ·  高效',
    emailPlaceholder: 'ni@lizi.com', passwordPlaceholder: '••••••••',
    minPasswordPlaceholder: '至少6个字符', phonePlaceholder: '+86 138 0000 0000',
    addressPlaceholder: '主街123号，城市，省份，邮编',
    liveData: '实时数据', heroTitle: '🚛 Load Optimizer',
    heroSub: '下拉刷新  ·  点击新建创建预订',
    ownTrucks: '自有卡车', carriers: '承运商', customers: '客户', cargoUnits: '货物单位',
    paymentSummary: '付款摘要', collected: '已收款', outstanding: '待收款', totalInvoiced: '总开票额',
    customerStatus: '客户状态', total: '总计',
    noCustomers: '暂无客户', noCustomersHint: '添加客户后将在此显示。',
    loadingDashboard: '加载中…', cannotReachServer: '无法连接到服务器',
    checkInternet: '请检查您的网络连接，然后重试。',
    retry: '重试  →', lightMode: '亮色', darkMode: '暗色',
    signOut: '退出', language: '语言',
  },
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('app_lang').then(saved => {
      if (saved && T[saved]) { setLang(saved); return; }
      const detected = getDeviceLocale();
      if (T[detected]) setLang(detected);
    }).catch(() => {});
  }, []);

  const setLanguage = (code) => {
    setLang(code);
    AsyncStorage.setItem('app_lang', code).catch(() => {});
  };

  const t = (key) => T[lang]?.[key] ?? T.en[key] ?? key;

  return (
    <LocaleContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
