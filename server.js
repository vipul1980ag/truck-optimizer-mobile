'use strict';

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');
const Anthropic  = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Route-overlap helpers ────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToPolylineDist(lat, lng, coords) {
  return Math.min(...coords.map(([ln, la]) => haversineKm(lat, lng, la, ln)));
}

// Distance from point to a straight-line segment (in km), used for super-route detection
function pointToSegment(lat, lng, aLat, aLng, bLat, bLng) {
  const dx = bLat - aLat, dy = bLng - aLng;
  if (dx === 0 && dy === 0) return haversineKm(lat, lng, aLat, aLng);
  const t = Math.max(0, Math.min(1, ((lat - aLat) * dx + (lng - aLng) * dy) / (dx * dx + dy * dy)));
  return haversineKm(lat, lng, aLat + t * dx, aLng + t * dy);
}

// Bidirectional overlap — returns true when either route is a sub-route of the other.
// Case 1 (new is shorter / same): both new endpoints lie near the existing route's polyline.
// Case 2 (existing is shorter): both existing endpoints lie near the new route's polyline
//          (or its straight-line corridor when no polyline is available).
// newGeomCoords: GeoJSON [[lng,lat], …] for the new route if available.
function routeOverlaps(route, fromLat, fromLng, toLat, toLng, newGeomCoords) {
  const existCoords = route.geometry?.coordinates;

  // Case 1: new endpoints near existing polyline
  if (existCoords?.length) {
    if (pointToPolylineDist(fromLat, fromLng, existCoords) < 80
     && pointToPolylineDist(toLat,   toLng,   existCoords) < 80) return true;
  }

  // Case 2: existing endpoints near new route (existing is a sub-leg of the new route)
  if (route.fromLat != null && route.toLat != null) {
    if (newGeomCoords?.length) {
      // Use the actual new-route polyline for accuracy
      if (pointToPolylineDist(route.fromLat, route.fromLng, newGeomCoords) < 80
       && pointToPolylineDist(route.toLat,  route.toLng,  newGeomCoords) < 80) return true;
    } else {
      // Straight-line approximation when no polyline is provided
      if (pointToSegment(route.fromLat, route.fromLng, fromLat, fromLng, toLat, toLng) < 80
       && pointToSegment(route.toLat,  route.toLng,  fromLat, fromLng, toLat, toLng) < 80) return true;
    }
  }

  return false;
}

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
const NO_CACHE = { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' } };
app.get('/',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'portal.html'), NO_CACHE));
app.get('/advanced',(req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html'),  NO_CACHE));

app.use(express.static(path.join(__dirname, 'public'), { etag: false, lastModified: false, setHeaders: res => res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') }));

const DATA_DIR   = process.env.DATA_PATH || path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// ── Seed data (used on first run before any save) ──────────────────────────
const SEED = {
  version: 1,
  trucks: [
    { id: 1, name: 'Semi Truck 1', length: 53, width: 8.5, height: 9,   maxWt: 44000, baseRate: 600,  ratePerMi: 3.50, licensePlate: 'TRK-0001' },
    { id: 2, name: 'Box Truck 1',  length: 20, width: 7.5, height: 7.5, maxWt: 12000, baseRate: 280,  ratePerMi: 2.20, licensePlate: 'BOX-0002' },
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
  bookings:     [],
  rates:        [],
  nextIds: { truck: 3, carrier: 3, carrierTruck: 5, customer: 4, item: 7, color: 3, user: 1, booking: 1, rate: 1 },
};

// ── Persistence helpers ────────────────────────────────────────────────────
function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      if (!store.bookings) store.bookings = [];
      if (!store.nextIds.booking) store.nextIds.booking = 1;
      if (!store.rates) store.rates = [];
      if (!store.nextIds.rate) store.nextIds.rate = 1;
      return store;
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
  const signal = AbortSignal.timeout(8000);
  const headers = { 'User-Agent': 'TruckOptimizer/1.0 (vipul.orlando@gmail.com)' };

  // Try Photon first, fall back to Nominatim
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=5`;
    const r    = await fetch(url, { headers, signal });
    const data = await r.json();
    const results = (data.features || []).map(f => ({
      label: [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '),
      lat:   f.geometry.coordinates[1],
      lng:   f.geometry.coordinates[0],
    })).filter(r => r.label);
    if (results.length) return res.json(results);
  } catch (_) { /* fall through to Nominatim */ }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5&addressdetails=1`;
    const r    = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    const data = await r.json();
    const results = data.map(p => ({
      label: p.display_name,
      lat:   parseFloat(p.lat),
      lng:   parseFloat(p.lon),
    }));
    return res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed: ' + err.message });
  }
});

app.post('/api/routes', async (req, res) => {
  const { from, to } = req.body || {};
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng)
    return res.status(400).json({ error: 'from and to (lat, lng) are required' });
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?alternatives=true&geometries=geojson&overview=full&steps=false`;
    const r   = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await r.json();
    if (data.code !== 'Ok' || !data.routes?.length)
      return res.status(400).json({ error: 'No route found between these locations.' });
    const routes = data.routes.map((route, index) => ({
      index,
      distance_km:  Math.round((route.distance / 1000) * 10) / 10,
      duration_min: Math.round(route.duration / 60),
      geometry:     route.geometry,
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

// ── Bookings ─────────────────────────────────────────────────────────────────

// Available trucks for consolidation — must be before POST /api/bookings
app.post('/api/bookings/available-trucks', (req, res) => {
  const { fromLat, fromLng, toLat, toLng, neededWeight = 0, neededVol = 0 } = req.body || {};
  const store = readStore();
  const activeBookings = (store.bookings || []).filter(b => b.status === 'active');

  const matches = [];
  for (const booking of activeBookings) {
    const truck = (store.trucks || []).find(t => t.id === booking.truckId);
    if (!truck) continue;

    const truckVol       = truck.length * truck.width * truck.height;
    const remainingWeight = truck.maxWt - (booking.totalWeight || 0);
    const remainingVol    = truckVol - (booking.totalVol || 0);
    const remainingPct    = truckVol > 0 ? (remainingVol / truckVol) * 100 : 0;

    if (remainingWeight < neededWeight) continue;
    if (remainingVol    < neededVol)    continue;
    if (remainingPct    < 5)            continue;
    if (!routeOverlaps(booking.route || {}, fromLat, fromLng, toLat, toLng, null)) continue;

    matches.push({ booking, truck, remainingWeight, remainingVol, remainingPct });
  }
  res.json(matches);
});

app.post('/api/bookings', (req, res) => {
  const store = readStore();
  const b = {
    id:            store.nextIds.booking++,
    status:        'active',
    createdAt:     new Date().toISOString(),
    ...req.body,
  };
  store.bookings.push(b);
  writeStore(store);

  // After saving, find all OTHER active bookings whose routes overlap this one.
  // This covers both cases: new route is shorter OR longer than the existing route.
  const consolidationMatches = [];
  if (b.route?.fromLat != null && b.route?.toLat != null) {
    for (const other of store.bookings) {
      if (other.id === b.id || other.status !== 'active' || !other.route) continue;
      const truck = (store.trucks || []).find(t => t.id === other.truckId);
      if (!truck) continue;
      const truckVol     = truck.length * truck.width * truck.height;
      const remainingVol = truckVol - (other.totalVol || 0);
      const remainingPct = truckVol > 0 ? (remainingVol / truckVol) * 100 : 0;
      if (remainingPct < 5) continue;
      if (routeOverlaps(other.route, b.route.fromLat, b.route.fromLng, b.route.toLat, b.route.toLng, b.route.geometry?.coordinates)) {
        consolidationMatches.push({ booking: other, truck, remainingPct: Math.round(remainingPct) });
      }
    }
  }

  res.json({ ok: true, booking: b, consolidationMatches });
});

app.get('/api/bookings', (req, res) => {
  const store = readStore();
  const list  = [...(store.bookings || [])].reverse();
  res.json(list);
});

app.patch('/api/bookings/:id', (req, res) => {
  const id    = Number(req.params.id);
  const store = readStore();
  const b     = (store.bookings || []).find(x => x.id === id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (req.body.status) b.status = req.body.status;
  writeStore(store);
  res.json({ ok: true, booking: b });
});

app.delete('/api/bookings/:id', (req, res) => {
  const id    = Number(req.params.id);
  const store = readStore();
  store.bookings = (store.bookings || []).filter(b => b.id !== id);
  writeStore(store);
  res.json({ ok: true });
});

// ── Excel / CSV Bulk Import ───────────────────────────────────────────────────

app.post('/api/import/trucks', (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const store = readStore();
  let imported = 0;
  for (const r of rows) {
    if (!r.name) continue;
    store.trucks.push({
      id:           store.nextIds.truck++,
      name:         r.name,
      length:       r.length    || 0,
      width:        r.width     || 0,
      height:       r.height    || 0,
      maxWt:        r.maxWt     || 0,
      baseRate:     r.baseRate  || 0,
      ratePerMi:    r.ratePerMi || 0,
      licensePlate: r.licensePlate || '',
    });
    imported++;
  }
  writeStore(store);
  res.json({ ok: true, imported });
});

app.post('/api/import/items', (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const store = readStore();
  let imported = 0;
  for (const r of rows) {
    if (!r.name) continue;
    store.items.push({
      id:        store.nextIds.item++,
      name:      r.name,
      length:    r.length    || 0,
      width:     r.width     || 0,
      height:    r.height    || 0,
      weight:    r.weight    || 0,
      qty:       r.qty       || 1,
      rotate:    true,
      stackable: r.stackable !== false,
      isDG:      r.isDG      || false,
      dgClass:   '',
      customerId: null,
    });
    imported++;
  }
  writeStore(store);
  res.json({ ok: true, imported });
});

app.post('/api/import/carriers', (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const store = readStore();
  let imported = 0;
  // Group truck rows by carrier name, merging into existing carriers if name matches
  const groups = {};
  for (const r of rows) {
    if (!r.carrierName || !r.name) continue;
    if (!groups[r.carrierName]) groups[r.carrierName] = [];
    groups[r.carrierName].push(r);
  }
  for (const [cname, trucks] of Object.entries(groups)) {
    let carrier = store.carriers.find(c => c.name.toLowerCase() === cname.toLowerCase());
    if (!carrier) {
      carrier = { id: store.nextIds.carrier++, name: cname, trucks: [] };
      store.carriers.push(carrier);
    }
    for (const t of trucks) {
      carrier.trucks.push({
        tid:       store.nextIds.carrierTruck++,
        name:      t.name,
        length:    t.length    || 0,
        width:     t.width     || 0,
        height:    t.height    || 0,
        maxWt:     t.maxWt     || 0,
        baseRate:  t.baseRate  || 0,
        ratePerMi: t.ratePerMi || 0,
      });
      imported++;
    }
  }
  writeStore(store);
  res.json({ ok: true, imported });
});

app.post('/api/import/rates', (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const store = readStore();
  if (!store.rates) store.rates = [];
  if (!store.nextIds.rate) store.nextIds.rate = 1;
  let imported = 0;
  for (const r of rows) {
    if (!r.ratePerKm || r.ratePerKm <= 0) continue;
    // Resolve carrierId from carrier name string
    let carrierId = null;
    const carrierStr = (r.carrier || '').toLowerCase().trim();
    if (carrierStr && carrierStr !== 'any') {
      if (carrierStr === 'own fleet' || carrierStr === 'own') {
        carrierId = null; // own fleet stored as null, same as UI
      } else {
        const match = (store.carriers || []).find(c => c.name.toLowerCase() === carrierStr);
        carrierId = match ? match.id : null;
      }
    }
    // Resolve truckRef from truck name string
    let truckRef = null;
    const truckStr = (r.truck || '').trim();
    if (truckStr) {
      if (carrierId === null) {
        const match = (store.trucks || []).find(t => t.name.toLowerCase() === truckStr.toLowerCase());
        truckRef = match ? match.id : null;
      } else if (carrierId != null) {
        const carrier = (store.carriers || []).find(c => c.id === carrierId);
        const match = (carrier?.trucks || []).find(t => t.name.toLowerCase() === truckStr.toLowerCase());
        truckRef = match ? match.tid : null;
      }
    }
    store.rates.push({
      id:         store.nextIds.rate++,
      city:       r.city || null,
      carrierId:  carrierId,
      truckRef:   truckRef,
      ratePerKm:  r.ratePerKm,
    });
    imported++;
  }
  writeStore(store);
  res.json({ ok: true, imported });
});

// ── AI endpoints ─────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI     = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// AI chat assistant — conversational helper for cargo booking
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'messages array required' });
  }
  try {
    const store = readStore();

    // Static instructions cached; dynamic fleet data appended after
    const systemBlocks = [
      {
        type: 'text',
        text: `You are an AI assistant for a truck load optimizer platform.
Help customers book shipments, estimate costs, and understand their options.

When users describe cargo, extract: name, dimensions (length×width×height in ft), weight (lbs), quantity.
Respond in a friendly, concise manner. If the user wants to add cargo, return structured JSON in this format at the end of your message:
<cargo_data>{"name":"...","length":0,"width":0,"height":0,"weight":0,"qty":1}</cargo_data>

For load optimization questions, analyze the cargo list and suggest the best truck.
For pricing, use approximate $2-4 per mile as a general estimate.`,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: `Current fleet summary:
- Own trucks: ${store.trucks.map(t => `${t.name} (${t.length}×${t.width}×${t.height} ft, max ${t.maxWt} lbs)`).join(', ')}
- Carrier partners: ${store.carriers.map(c => c.name).join(', ')}`,
      },
    ];

    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: systemBlocks,
      messages,
    });

    const response = await stream.finalMessage();
    const textBlock = response.content.find(b => b.type === 'text');
    res.json({ reply: textBlock?.text ?? '' });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'AI service unavailable. Check ANTHROPIC_API_KEY.' });
  }
});

const SCAN_PROMPT = `You are a professional freight estimator. Analyze this photo and identify every distinct item visible.

For each item, estimate:
- name: common name for the item
- length, width, height: dimensions in feet INCLUDING typical packaging/crating (add ~3-6 inches per side for cardboard/pallet/foam)
- weight: estimated weight in lbs INCLUDING packaging
- qty: count of identical items visible
- stackable: true if safe to stack other items on top
- isFragile: true if requires careful handling
- packagingNote: brief note about packaging (e.g. "standard carton", "pallet-wrapped", "crated")

Return ONLY a JSON array — no explanation, no markdown. Example:
[{"name":"3-seat sofa","length":7.5,"width":3.5,"height":3.2,"weight":220,"qty":1,"stackable":false,"isFragile":false,"packagingNote":"moving blanket wrap"},{"name":"coffee table","length":4.2,"width":2.2,"height":1.8,"weight":60,"qty":1,"stackable":true,"isFragile":false,"packagingNote":"cardboard corners"}]

If you cannot identify any items (e.g. the image is blurry or not cargo-related), return an empty array: []`;

function parseItemsJson(text) {
  const match = (text || '').trim().match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

// AI photo scanner — Gemini Flash primary, Claude Haiku fallback
app.post('/api/ai/scan-items', async (req, res) => {
  const { imageBase64, mediaType = 'image/jpeg' } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

  // ── Primary: Gemini 2.0 Flash ─────────────────────────────────────────────
  if (genAI) {
    try {
      const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: SCAN_PROMPT },
          ],
        }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.2 },
      });
      const text  = result.response.text();
      const items = parseItemsJson(text);
      if (items.length > 0) return res.json(items);
    } catch (err) {
      console.error('Gemini scan error:', err.message, '— falling back to Claude');
    }
  }

  // ── Fallback: Claude Haiku ────────────────────────────────────────────────
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: SCAN_PROMPT },
        ],
      }],
    });
    const textBlock = response.content.find(b => b.type === 'text');
    res.json(parseItemsJson(textBlock?.text));
  } catch (err) {
    console.error('Claude scan error:', err.message);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// AI cargo parser — parse a plain-language description into cargo fields
app.post('/api/ai/parse-cargo', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Parse this cargo description into JSON with fields: name (string), length (ft), width (ft), height (ft), weight (lbs), qty (integer), stackable (boolean), isDG (boolean — is it dangerous goods?).
Use standard sizes if exact dimensions not given (e.g. euro pallet = 3.9×3.1 ft, standard pallet = 4×4 ft).
Return ONLY valid JSON, no explanation.

Description: "${description}"`,
      }],
    });
    const text = response.content[0].text.trim();
    // Extract JSON even if wrapped in code block
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(422).json({ error: 'Could not parse description' });
    const parsed = JSON.parse(match[0]);
    res.json(parsed);
  } catch (err) {
    console.error('AI parse error:', err.message);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// AI load advisor — analyze current items and suggest optimal truck + tips
app.post('/api/ai/advise', async (req, res) => {
  const store = readStore();
  try {
    const totalVol = store.items.reduce((s, it) => s + it.length * it.width * it.height * (it.qty || 1), 0);
    const totalWt  = store.items.reduce((s, it) => s + it.weight * (it.qty || 1), 0);
    const itemList = store.items.map(it => `${it.qty}× ${it.name} (${it.length}×${it.width}×${it.height} ft, ${it.weight} lbs each)`).join('\n');
    const truckList = store.trucks.map(t => `${t.name}: ${t.length}×${t.width}×${t.height} ft, max ${t.maxWt} lbs, $${t.baseRate} base + $${t.ratePerMi}/mi`).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are a load optimization expert. Analyze this shipment and give 3-5 concise bullet-point tips.

CARGO (total ${totalVol.toFixed(0)} cu ft, ${totalWt.toLocaleString()} lbs):
${itemList || 'No items yet'}

AVAILABLE TRUCKS:
${truckList}

Give specific recommendations: best truck match, stacking order, fragile item placement, weight distribution. Be brief and practical.`,
      }],
    });
    res.json({ advice: response.content[0].text });
  } catch (err) {
    console.error('AI advise error:', err.message);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Truck Optimizer → http://localhost:${PORT}`));
