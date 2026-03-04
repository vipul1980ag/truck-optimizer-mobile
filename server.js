'use strict';

const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');

const { optimize }      = require('./engine/optimizer');
const { analyzeRoutes } = require('./engine/routes');

const app = express();
app.use(express.json({ limit: '5mb' }));

// ── PayPal config ───────────────────────────────────────────────────────────
// Replace these with your real PayPal sandbox (or live) credentials.
// Get them at: https://developer.paypal.com → Apps & Credentials → Create App
const PAYPAL_CLIENT_ID     = process.env.PAYPAL_CLIENT_ID     || 'YOUR_PAYPAL_SANDBOX_CLIENT_ID';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_SANDBOX_CLIENT_SECRET';
const PAYPAL_BASE          = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('PayPal auth failed — check your CLIENT_ID and CLIENT_SECRET');
  return data.access_token;
}

// Portal (simplified dashboard) at root; full optimizer at /advanced
app.get('/',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'portal.html')));
app.get('/advanced',(req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR   = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// ── Seed data (used on first run before any save) ──────────────────────────
const SEED = {
  version: 1,
  trucks: [
    { id: 1, name: 'Semi Truck 1', length: 53, width: 8.5, height: 9,   maxWt: 44000, baseRate: 600,  ratePerMi: 3.50 },
    { id: 2, name: 'Box Truck 1',  length: 20, width: 7.5, height: 7.5, maxWt: 12000, baseRate: 280,  ratePerMi: 2.20 },
  ],
  carriers: [
    { id: 1, name: 'FastFreight LLC', trucks: [
      { tid: 1, name: '53ft Dry Van', length: 53, width: 8.5, height: 9,   maxWt: 44000, baseRate: 520, ratePerMi: 3.20 },
      { tid: 2, name: '48ft Reefer',  length: 48, width: 8.5, height: 9,   maxWt: 42000, baseRate: 450, ratePerMi: 2.90 },
    ]},
    { id: 2, name: 'QuickHaul Express', trucks: [
      { tid: 3, name: '40ft Truck',   length: 40, width: 8,   height: 8.5, maxWt: 36000, baseRate: 380, ratePerMi: 2.60 },
      { tid: 4, name: '28ft Sprinter',length: 28, width: 8,   height: 8,   maxWt: 24000, baseRate: 260, ratePerMi: 2.10 },
    ]},
  ],
  customers: [
    { id: 1, name: 'Acme Corp',     stop: 1, color: '#3b82f6', zone: 'Chicago',   distance: 320, paymentStatus: 'paid',    paymentTerms: 'net30', paymentMethod: 'invoice', invoiceAmount: 2400 },
    { id: 2, name: 'Beta Supplies', stop: 2, color: '#22c55e', zone: 'Chicago',   distance: 320, paymentStatus: 'pending', paymentTerms: 'net60', paymentMethod: 'bank',    invoiceAmount: 1800 },
    { id: 3, name: 'Gamma Retail',  stop: 3, color: '#f59e0b', zone: 'Milwaukee', distance: 180, paymentStatus: 'pending', paymentTerms: 'cod',   paymentMethod: 'cod',     invoiceAmount: 950  },
  ],
  items: [
    { id: 1, name: 'Std Pallet',   length: 4, width: 4, height: 5, weight: 2000, qty: 8,  rotate: true,  customerId: 1 },
    { id: 2, name: 'Half Pallet',  length: 4, width: 2, height: 4, weight: 800,  qty: 6,  rotate: true,  customerId: 1 },
    { id: 3, name: 'Supply Crate', length: 6, width: 4, height: 4, weight: 3000, qty: 3,  rotate: false, customerId: 2 },
    { id: 4, name: 'Retail Box',   length: 3, width: 3, height: 3, weight: 400,  qty: 10, rotate: true,  customerId: 2 },
    { id: 5, name: 'Large Crate',  length: 5, width: 4, height: 4, weight: 3500, qty: 2,  rotate: false, customerId: 3 },
    { id: 6, name: 'Small Box',    length: 2, width: 2, height: 2, weight: 150,  qty: 15, rotate: true,  customerId: 3 },
  ],
  users:        [],
  catalogItems: [],
  nextIds: { truck: 3, carrier: 3, carrierTruck: 5, customer: 4, item: 7, color: 3, user: 1 },
};

// ── Persistence helpers ────────────────────────────────────────────────────
function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (_) {}
  return SEED;
}

function writeStore(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ── Auth helpers ───────────────────────────────────────────────────────────
function hashPassword(plain, salt) {
  return crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
}
function genSalt()  { return crypto.randomBytes(16).toString('hex'); }
function genToken() { return crypto.randomBytes(32).toString('hex'); }

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

// ── Auth Routes ────────────────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { email, password, phone, address } = req.body || {};
  if (!email || !password || !phone || !address)
    return res.status(400).json({ error: 'All fields are required (email, password, phone, address).' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const store = readStore();
  if (!store.users) store.users = [];
  if (!store.nextIds.user) store.nextIds.user = 1;

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const salt         = genSalt();
  const passwordHash = hashPassword(password, salt);
  const token        = genToken();
  const newUser      = {
    id: store.nextIds.user++,
    email: email.toLowerCase().trim(),
    passwordHash,
    salt,
    phone:     phone.trim(),
    address:   address.trim(),
    token,
    createdAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  writeStore(store);

  res.json({ token, user: { id: newUser.id, email: newUser.email, phone: newUser.phone, address: newUser.address } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const store = readStore();
  if (!store.users) store.users = [];

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) return res.status(401).json({ error: 'Invalid email or password.' });

  user.token = genToken();
  writeStore(store);

  res.json({ token: user.token, user: { id: user.id, email: user.email, phone: user.phone, address: user.address } });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getTokenFromHeader(req);
  if (token) {
    const store = readStore();
    const user  = (store.users || []).find(u => u.token === token);
    if (user) { user.token = null; writeStore(store); }
  }
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  const store = readStore();
  const user  = (store.users || []).find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired token.' });

  res.json({ user: { id: user.id, email: user.email, phone: user.phone, address: user.address } });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json(readStore());
});

app.put('/api/data', (req, res) => {
  const existing = readStore();
  const update   = { ...req.body };
  // Preserve auth data — clients don't send users so never let PUT wipe them
  if (existing.users && existing.users.length) update.users = existing.users;
  if (existing.nextIds && update.nextIds) {
    update.nextIds.user = existing.nextIds.user || update.nextIds.user;
  }
  // Preserve custom catalog items
  if (existing.catalogItems && existing.catalogItems.length) update.catalogItems = existing.catalogItems;
  writeStore(update);
  res.json({ ok: true });
});

// ── Custom Catalog ──────────────────────────────────────────────────────────
app.get('/api/catalog', (req, res) => {
  const store    = readStore();
  const category = req.query.category; // optional filter: 'household' | 'industrial'
  const items    = store.catalogItems || [];
  res.json(category ? items.filter(i => i.category === category) : items);
});

app.post('/api/catalog', (req, res) => {
  const { name, category, l, w, h, wt } = req.body || {};
  if (!name || !category || !l || !w || !h)
    return res.status(400).json({ error: 'name, category, l, w, h are required.' });

  const store = readStore();
  if (!store.catalogItems) store.catalogItems = [];

  // Deduplicate by name + category (case-insensitive)
  const exists = store.catalogItems.find(
    i => i.name.toLowerCase() === name.toLowerCase().trim() && i.category === category
  );
  if (exists) return res.json({ ok: true, item: exists, duplicate: true });

  const item = {
    id:       Date.now(),
    name:     name.trim(),
    category,
    l:        parseFloat(l)  || 4,
    w:        parseFloat(w)  || 4,
    h:        parseFloat(h)  || 4,
    wt:       parseFloat(wt) || 0,
    addedAt:  new Date().toISOString(),
  };
  store.catalogItems.push(item);
  writeStore(store);
  res.json({ ok: true, item });
});

app.post('/api/optimize', (req, res) => {
  try {
    const { trucks, carriers, customers, items, config } = req.body;
    if (!trucks?.length)  return res.status(400).json({ error: 'Please add at least one own-fleet truck.' });
    if (!items?.length)   return res.status(400).json({ error: 'Please add at least one item.' });

    const { packers, unplaced, splitWarn } = optimize({ trucks, items, customers: customers || [], config: config || {} });
    const analysis = analyzeRoutes({ customers: customers || [], items, trucks, carriers: carriers || [] });

    // Strip non-serialisable Float32Array hmap before sending
    const out = packers.map(p => ({
      truck:         p.truck,
      placements:    p.placements,
      usedWeight:    p.usedWeight,
      customerZones: p.customerZones,
    }));

    // ── Consolidated run summary ──────────────────────────────────────────
    // For each truck figure out which delivery zones landed on it, then
    // compute the estimated trip cost (own-fleet rate × max zone distance).
    const custList = customers || [];
    const truckZoneSummary = out.map((p, i) => {
      const t = trucks[i];
      const custIds = [...new Set(
        p.placements.map(pl => pl.customerId).filter(id => id != null)
      )];

      // Build zone detail objects
      const zoneDetails = {};
      for (const cid of custIds) {
        const cust = custList.find(c => c.id === cid);
        if (!cust) continue;
        const zone = cust.zone?.trim() || '(No Zone)';
        if (!zoneDetails[zone]) zoneDetails[zone] = { zone, customers: [], distance: 0 };
        if (!zoneDetails[zone].customers.find(c => c.id === cid)) {
          zoneDetails[zone].customers.push(
            { id: cust.id, name: cust.name, stop: cust.stop, color: cust.color }
          );
        }
        zoneDetails[zone].distance = Math.max(zoneDetails[zone].distance, cust.distance || 0);
      }

      const zoneList = Object.values(zoneDetails)
        .sort((a, b) => b.distance - a.distance);     // farther zones first
      const maxDist = zoneList.reduce((m, z) => Math.max(m, z.distance), 0);
      const hasCost = (t.baseRate > 0 || t.ratePerMi > 0);
      const estimatedCost = hasCost ? (t.baseRate || 0) + maxDist * (t.ratePerMi || 0) : null;

      return { truckId: t.id, truckName: t.name, zones: zoneList, maxDist, estimatedCost };
    });

    res.json({ packers: out, unplaced, splitWarn, analysis, truckZoneSummary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Routing / Geocoding / Tolls ─────────────────────────────────────────────

app.post('/api/geocode', async (req, res) => {
  const { query } = req.body || {};
  if (!query || !query.trim()) return res.status(400).json({ error: 'query is required' });
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=5`;
    const r   = await fetch(url, {
      headers: { 'User-Agent': 'TruckOptimizer/1.0 (contact@truckoptimizer.com)' },
    });
    const data = await r.json();
    const results = (data.features || []).map(f => ({
      label: [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '),
      lat:   f.geometry.coordinates[1],
      lng:   f.geometry.coordinates[0],
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed: ' + err.message });
  }
});

app.post('/api/routes', async (req, res) => {
  const { from, to } = req.body || {};
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng)
    return res.status(400).json({ error: 'from and to (lat, lng) are required' });
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?alternatives=true&geometries=geojson&overview=full&steps=false`;
    const r   = await fetch(url);
    const data = await r.json();
    if (data.code !== 'Ok' || !data.routes?.length)
      return res.status(400).json({ error: 'No route found between these locations.' });
    const routes = data.routes.map((route, index) => ({
      index,
      distance_km:  Math.round((route.distance / 1000) * 10) / 10,
      duration_min: Math.round(route.duration / 60),
      geometry:     route.geometry,  // GeoJSON LineString
    }));
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Routing failed: ' + err.message });
  }
});

app.post('/api/tolls', async (req, res) => {
  const { geometry, vehicleType = '2AxlesTruck' } = req.body || {};
  if (!geometry?.coordinates?.length)
    return res.status(400).json({ error: 'geometry (GeoJSON LineString) is required' });

  res.json({ toll_cost: 0 });
});

// ── PayPal API Routes ───────────────────────────────────────────────────────

// Expose client ID to the frontend so it can load the PayPal JS SDK
app.get('/api/payment/config', (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

// Create a PayPal order for the given customer invoice amount
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'USD', customerId, customerName } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const token = await getPayPalToken();
    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: String(customerId),
          description:  `Invoice — ${customerName}`,
          amount:       { currency_code: currency, value: Number(amount).toFixed(2) },
        }],
      }),
    });
    const order = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: order.message || 'PayPal order creation failed' });
    res.json({ id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Capture an approved PayPal order and mark the customer as paid in the store
app.post('/api/payment/capture-order', async (req, res) => {
  try {
    const { orderID, customerId } = req.body;
    if (!orderID) return res.status(400).json({ error: 'Missing orderID' });

    const token = await getPayPalToken();
    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const capture = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: capture.message || 'Capture failed' });

    // Persist payment status to store
    if (capture.status === 'COMPLETED' && customerId) {
      const store = readStore();
      const cust  = store.customers.find(c => c.id === Number(customerId));
      if (cust) {
        cust.paymentStatus = 'paid';
        cust.lastPaymentId = capture.id;
        cust.paidAt        = new Date().toISOString();
        writeStore(store);
      }
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;
    res.json({ status: capture.status, captureId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mobile payment page (served to iOS WebView) ─────────────────────────────
// Renders a styled PayPal checkout page; posts a message to React Native on success.
app.get('/pay/:customerId', (req, res) => {
  const store = readStore();
  const cust  = store.customers.find(c => c.id === Number(req.params.customerId));
  if (!cust) return res.status(404).send('<h2>Customer not found</h2>');

  const amount   = Number(cust.invoiceAmount || 0).toFixed(2);
  const custName = cust.name.replace(/'/g, "\\'");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>Pay Invoice</title>
<script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #f1f5f9; color: #0f172a; padding: 0; }
  .header { background: #1e293b; padding: 20px 16px; }
  .header h1 { font-size: 18px; font-weight: 800; color: #f1f5f9; }
  .header p  { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .card { background: #fff; border-radius: 14px; margin: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .amount-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; }
  .amount-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; }
  .amount-value { font-size: 32px; font-weight: 900; color: #2563eb; }
  .terms { font-size: 11px; color: #64748b; margin-top: 3px; }
  #paypal-button-container { margin-top: 4px; }
  #msg { text-align: center; padding: 10px 0; min-height: 24px; font-size: 13px; color: #64748b; }
  .success { text-align: center; padding: 30px 16px; }
  .success-icon { font-size: 52px; margin-bottom: 12px; }
  .success-title { font-size: 20px; font-weight: 800; color: #16a34a; }
  .success-sub { font-size: 12px; color: #166534; margin-top: 6px; }
  .secure { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 14px; }
</style>
</head>
<body>
<div class="header">
  <h1>💳 Pay Invoice</h1>
  <p>${cust.name}</p>
</div>
<div class="card">
  <div class="amount-row">
    <div>
      <div class="amount-label">Invoice Amount</div>
      <div class="terms">${(({ cod:'COD',net30:'Net 30',net60:'Net 60',net90:'Net 90' })[cust.paymentTerms] || cust.paymentTerms || 'Net 30')} · ${(({ invoice:'Invoice',bank:'Bank Transfer',card:'Credit Card',check:'Check',cod:'COD' })[cust.paymentMethod] || cust.paymentMethod || 'Invoice')}</div>
    </div>
    <div class="amount-value">$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
  </div>
  <div id="paypal-button-container"></div>
  <div id="msg"></div>
  <div class="secure">🔒 Secured by PayPal · 256-bit SSL</div>
</div>
<script>
paypal.Buttons({
  style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
  createOrder: async () => {
    const r = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: ${amount}, currency: 'USD', customerId: ${cust.id}, customerName: '${custName}' })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Order creation failed');
    return d.id;
  },
  onApprove: async (data) => {
    document.getElementById('msg').textContent = 'Processing…';
    const r = await fetch('/api/payment/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: data.orderID, customerId: ${cust.id} })
    });
    const result = await r.json();
    if (result.status === 'COMPLETED') {
      document.getElementById('paypal-button-container').innerHTML = '';
      document.getElementById('msg').innerHTML =
        '<div class="success"><div class="success-icon">✅</div><div class="success-title">Payment Successful!</div><div class="success-sub">Capture ID: ' + (result.captureId || '—') + '</div></div>';
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'paid', captureId: result.captureId }));
      }
    } else {
      document.getElementById('msg').textContent = 'Unexpected status: ' + result.status;
    }
  },
  onCancel: () => {
    document.getElementById('msg').textContent = 'Payment cancelled.';
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancelled' }));
    }
  },
  onError: (err) => {
    document.getElementById('msg').textContent = 'Error: ' + err;
  }
}).render('#paypal-button-container');
</script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Truck Optimizer → http://localhost:${PORT}`));
