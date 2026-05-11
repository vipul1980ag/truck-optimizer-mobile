'use strict';

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');
const Anthropic  = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const twilio     = require('twilio');

// ── Notification helpers ─────────────────────────────────────────────────────

// Lazy-init email transport (set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM)
let _mailTransport = null;
function getMailTransport() {
  if (!_mailTransport && process.env.SMTP_HOST && process.env.SMTP_USER) {
    _mailTransport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _mailTransport;
}

// Lazy-init Twilio client (set TWILIO_SID / TWILIO_TOKEN)
let _twilioClient = null;
function getTwilio() {
  if (!_twilioClient && process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    _twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  }
  return _twilioClient;
}

// Normalise phone to E.164 (assumes India +91 prefix if no country code given)
function toE164(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (digits.length === 10) return '+91' + digits;   // default to India
  if (digits.length > 10)   return '+' + digits;
  return null;
}

async function sendEmail(to, subject, htmlBody) {
  const transport = getMailTransport();
  if (!transport || !to) return;
  try {
    await transport.sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html:    htmlBody,
      text:    htmlBody.replace(/<[^>]+>/g, ''),
    });
    console.log(`[notify] email → ${to} | ${subject}`);
  } catch (err) {
    console.error('[notify] email error:', err.message);
  }
}

async function sendSMS(to, body) {
  const client = getTwilio();
  const e164   = toE164(to);
  if (!client || !e164 || !process.env.TWILIO_SMS_FROM) return;
  try {
    await client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: e164, body });
    console.log(`[notify] SMS → ${e164}`);
  } catch (err) {
    console.error('[notify] SMS error:', err.message);
  }
}

async function sendWhatsApp(to, body) {
  const client = getTwilio();
  const e164   = toE164(to);
  if (!client || !e164 || !process.env.TWILIO_WA_FROM) return;
  try {
    await client.messages.create({
      from: 'whatsapp:' + process.env.TWILIO_WA_FROM,
      to:   'whatsapp:' + e164,
      body,
    });
    console.log(`[notify] WhatsApp → ${e164}`);
  } catch (err) {
    console.error('[notify] WhatsApp error:', err.message);
  }
}

// Send email + SMS + WhatsApp to a user (all channels fire in parallel, failures are silent)
async function notifyUser({ email, phone }, subject, htmlBody, smsBody) {
  await Promise.allSettled([
    sendEmail(email, subject, htmlBody),
    sendSMS(phone,   smsBody || htmlBody.replace(/<[^>]+>/g, '')),
    sendWhatsApp(phone, smsBody || htmlBody.replace(/<[^>]+>/g, '')),
  ]);
}

// Build a styled HTML email body
function buildEmailHtml(title, lines, footerNote) {
  const rows = lines.map(l =>
    `<tr><td style="padding:6px 0;font-size:14px;color:#334155;">${l}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f1f5f9;padding:24px;">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:20px 24px;">
      <img src="https://toc.dnw-ai.com/toc-logo.png" alt="TOC" height="32" style="margin-bottom:8px;display:block;" onerror="this.style.display='none'">
      <div style="color:#fff;font-size:20px;font-weight:900;">${title}</div>
    </div>
    <div style="padding:24px;"><table style="width:100%;border-collapse:collapse;">${rows}</table></div>
    ${footerNote ? `<div style="background:#f8fafc;padding:12px 24px;font-size:11px;color:#94a3b8;">${footerNote}</div>` : ''}
  </div></body></html>`;
}

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
// Used for quick pre-filter before the percentage check.
function routeOverlaps(route, fromLat, fromLng, toLat, toLng, newGeomCoords) {
  const existCoords = route.geometry?.coordinates;

  if (existCoords?.length) {
    if (pointToPolylineDist(fromLat, fromLng, existCoords) < 80
     && pointToPolylineDist(toLat,   toLng,   existCoords) < 80) return true;
  }

  if (route.fromLat != null && route.toLat != null) {
    if (newGeomCoords?.length) {
      if (pointToPolylineDist(route.fromLat, route.fromLng, newGeomCoords) < 80
       && pointToPolylineDist(route.toLat,  route.toLng,  newGeomCoords) < 80) return true;
    } else {
      if (pointToSegment(route.fromLat, route.fromLng, fromLat, fromLng, toLat, toLng) < 80
       && pointToSegment(route.toLat,  route.toLng,  fromLat, fromLng, toLat, toLng) < 80) return true;
    }
  }

  return false;
}

// Percentage of coordsA (new route) whose midpoints lie within thresholdKm of coordsB (existing route).
// Returns 0–100.
function routeOverlapPct(coordsA, coordsB, thresholdKm = 2.0) {
  if (!coordsA?.length || !coordsB?.length) return 0;
  let totalLen = 0, coveredLen = 0;
  for (let i = 0; i < coordsA.length - 1; i++) {
    const [lngA1, latA1] = coordsA[i];
    const [lngA2, latA2] = coordsA[i + 1];
    const segLen = haversineKm(latA1, lngA1, latA2, lngA2);
    totalLen += segLen;
    const midLat = (latA1 + latA2) / 2;
    const midLng = (lngA1 + lngA2) / 2;
    if (pointToPolylineDist(midLat, midLng, coordsB) <= thresholdKm) coveredLen += segLen;
  }
  return totalLen > 0 ? (coveredLen / totalLen) * 100 : 0;
}

// Extra km the existing truck must drive off its route to service the new pickup/dropoff.
function estimateDetourKm(existingCoords, newFromLat, newFromLng, newToLat, newToLng) {
  if (!existingCoords?.length) return Infinity;
  return pointToPolylineDist(newFromLat, newFromLng, existingCoords)
       + pointToPolylineDist(newToLat,   newToLng,   existingCoords);
}

// Absolute calendar days between two YYYY-MM-DD strings (or ISO timestamps).
function daysDiff(d1, d2) {
  if (!d1 || !d2) return Infinity;
  const ms = Math.abs(new Date(d1).setHours(0,0,0,0) - new Date(d2).setHours(0,0,0,0));
  return ms / 86_400_000;
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

// Serve from public-dist/ (obfuscated build) when available, else public/ (dev fallback)
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public-dist'))
  ? path.join(__dirname, 'public-dist')
  : path.join(__dirname, 'public');

const NO_CACHE = { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' } };
app.get('/',        (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'portal.html'), NO_CACHE));
app.get('/advanced',(req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html'),  NO_CACHE));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html'), NO_CACHE));

app.use(express.static(PUBLIC_DIR, { etag: false, lastModified: false, setHeaders: res => res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') }));

const DATA_DIR   = process.env.DATA_PATH || path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// ── Seed data (used on first run before any save) ──────────────────────────
const SEED = {
  version: 1,
  trucks: [
    { id: 1, name: 'Semi Truck 1', length: 53, width: 8.5, height: 9,   maxWt: 44000, baseRate: 600,  ratePerMi: 3.50, licensePlate: 'TRK-0001', shared: true  },
    { id: 2, name: 'Box Truck 1',  length: 20, width: 7.5, height: 7.5, maxWt: 12000, baseRate: 280,  ratePerMi: 2.20, licensePlate: 'BOX-0002', shared: false },
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
// Accepts: fromLat, fromLng, toLat, toLng, newGeomCoords, neededWeight, neededVol, pickupDate
// For shared bookings: enforces ≥80% route overlap, ≤5% detour, ±2-day date window.
app.post('/api/bookings/available-trucks', (req, res) => {
  const {
    fromLat, fromLng, toLat, toLng,
    newGeomCoords = null,
    neededWeight  = 0,
    neededVol     = 0,
    pickupDate    = null,
  } = req.body || {};

  const store          = readStore();
  const activeBookings = (store.bookings || []).filter(
    b => b.status === 'active' && b.shippingOption === 'shared'
  );

  const matches = [];
  for (const booking of activeBookings) {
    const truck = (store.trucks || []).find(t => t.id === booking.truckId);
    if (!truck || !truck.shared) continue;                       // truck must be marked shareable

    // ── Capacity checks ──────────────────────────────────────────────────────
    const truckVol        = truck.length * truck.width * truck.height;
    const remainingWeight = truck.maxWt - (booking.totalWeight || 0);
    const remainingVol    = truckVol - (booking.totalVol || 0);
    const remainingPct    = truckVol > 0 ? (remainingVol / truckVol) * 100 : 0;
    if (remainingWeight < neededWeight) continue;
    if (remainingVol    < neededVol)    continue;
    if (remainingPct    < 5)            continue;

    // ── Date window: ±2 calendar days ────────────────────────────────────────
    if (pickupDate && booking.pickupDate && daysDiff(pickupDate, booking.pickupDate) > 2) continue;

    const existCoords = booking.route?.geometry?.coordinates;

    // ── Route overlap: ≥80% of new route must lie within 2 km of existing route ──
    const overlapPct = routeOverlapPct(newGeomCoords, existCoords);
    if (overlapPct < 80) continue;

    // ── Detour: ≤5% of existing route distance ────────────────────────────────
    const existDistKm   = booking.route?.distance_km || 0;
    const detourKm      = estimateDetourKm(existCoords, fromLat, fromLng, toLat, toLng);
    const detourPct     = existDistKm > 0 ? (detourKm / existDistKm) * 100 : 100;
    if (detourPct > 5) continue;

    matches.push({
      booking,
      truck,
      remainingWeight,
      remainingVol,
      remainingPct:  Math.round(remainingPct),
      overlapPct:    Math.round(overlapPct),
      detourPct:     parseFloat(detourPct.toFixed(1)),
      detourKm:      parseFloat(detourKm.toFixed(1)),
    });
  }

  // Best matches first: highest overlap, then least detour
  matches.sort((a, b) => b.overlapPct - a.overlapPct || a.detourPct - b.detourPct);
  res.json(matches);
});

// ── Shared-booking cost optimisation ─────────────────────────────────────────
// Finds candidate shared bookings, groups by truck, calculates per-user costs,
// and returns proposals sorted by "all users save" first, then new-user savings.
// Returns: { proposals, newUserPrivateCost }
app.post('/api/bookings/optimize-shared', (req, res) => {
  const {
    fromLat, fromLng, toLat, toLng,
    newGeomCoords  = null,
    pickupDate     = null,
    totalWeight    = 0,
    totalVol       = 0,
    distance_km    = 0,
    distance_miles = 0,
  } = req.body || {};

  const store      = readStore();
  const allTrucks  = store.trucks   || [];
  const allBookings = store.bookings || [];
  const dist_mi    = distance_miles || distance_km * 0.621371;

  function truckFullCost(t) { return t.baseRate + t.ratePerMi * dist_mi; }

  function userSharedCost(userVol, truckVol, fullCost) {
    const pct = truckVol > 0 ? userVol / truckVol : 0;
    return Math.max(fullCost * pct, fullCost * 0.20);
  }

  function calcPrivateCost(weight, vol) {
    const fitting = allTrucks.filter(t => {
      const tv = t.length * t.width * t.height;
      return tv >= vol && t.maxWt >= weight;
    });
    const pool = fitting.length ? fitting : allTrucks;
    if (!pool.length) return 0;
    return Math.min(...pool.map(t => truckFullCost(t)));
  }

  const newUserPrivate = calcPrivateCost(totalWeight, totalVol);

  // ── Find candidate shared bookings ───────────────────────────────────────
  const activeShared = allBookings.filter(b => b.status === 'active' && b.shippingOption === 'shared');
  const truckGroups  = {};

  for (const booking of activeShared) {
    const truck = allTrucks.find(t => t.id === booking.truckId);
    if (!truck || !truck.shared) continue;
    if (pickupDate && booking.pickupDate && daysDiff(pickupDate, booking.pickupDate) > 2) continue;

    const existCoords = booking.route?.geometry?.coordinates;
    const overlapPct  = routeOverlapPct(newGeomCoords, existCoords);
    if (overlapPct < 80) continue;

    const existDistKm = booking.route?.distance_km || distance_km;
    const detourKm    = estimateDetourKm(existCoords, fromLat, fromLng, toLat, toLng);
    const detourPct   = existDistKm > 0 ? (detourKm / existDistKm) * 100 : 100;
    if (detourPct > 5) continue;

    if (!truckGroups[truck.id]) {
      truckGroups[truck.id] = { truck, bookings: [], overlapPct: 0, detourPct: 0, detourKm: 0 };
    }
    if (overlapPct > truckGroups[truck.id].overlapPct) {
      truckGroups[truck.id].overlapPct = overlapPct;
      truckGroups[truck.id].detourPct  = detourPct;
      truckGroups[truck.id].detourKm   = detourKm;
    }
    truckGroups[truck.id].bookings.push(booking);
  }

  // ── Build proposals ───────────────────────────────────────────────────────
  function buildBookingDetails(t) {
    const tv = t.length * t.width * t.height;
    const fc = truckFullCost(t);
    return truckGroups[t.id]
      ? truckGroups[t.id].bookings.map(b => {
          const uVol = b.totalVol    || 0;
          const uWt  = b.totalWeight || 0;
          const sc   = userSharedCost(uVol, tv, fc);
          const pc   = calcPrivateCost(uWt, uVol);
          return {
            bookingId:   b.id,
            vol:         Math.round(uVol),
            weight:      Math.round(uWt),
            sharedCost:  Math.round(sc),
            privateCost: Math.round(pc),
            saves:       Math.round(pc - sc),
            savesPct:    pc > 0 ? Math.round((1 - sc / pc) * 100) : 0,
          };
        })
      : [];
  }

  const proposals = [];

  for (const group of Object.values(truckGroups)) {
    const { truck, bookings, overlapPct, detourPct, detourKm } = group;
    const truckVol       = truck.length * truck.width * truck.height;
    const existingVol    = bookings.reduce((s, b) => s + (b.totalVol    || 0), 0);
    const existingWeight = bookings.reduce((s, b) => s + (b.totalWeight || 0), 0);

    if ((truckVol - existingVol) >= totalVol && (truck.maxWt - existingWeight) >= totalWeight) {
      // ── Fits on existing truck ────────────────────────────────────────────
      const fc           = truckFullCost(truck);
      const bkDetails    = buildBookingDetails(truck);
      const newUserSC    = userSharedCost(totalVol, truckVol, fc);
      const newUserSaves = newUserPrivate - newUserSC;
      const allSave      = newUserSaves > 0 && bkDetails.every(b => b.saves > 0);
      const utilPct      = truckVol > 0 ? Math.round(((existingVol + totalVol) / truckVol) * 100) : 0;

      proposals.push({
        type:     'fit-existing',
        truck:    { id: truck.id, name: truck.name, licensePlate: truck.licensePlate, vol: Math.round(truckVol), maxWt: truck.maxWt },
        bookings: bkDetails,
        newUser:  {
          vol: Math.round(totalVol), weight: Math.round(totalWeight),
          sharedCost: Math.round(newUserSC), privateCost: Math.round(newUserPrivate),
          saves: Math.round(newUserSaves),
          savesPct: newUserPrivate > 0 ? Math.round((1 - newUserSC / newUserPrivate) * 100) : 0,
        },
        truckUtilPct: utilPct, allSave,
        overlapPct: Math.round(overlapPct),
        detourPct:  parseFloat(detourPct.toFixed(1)),
        detourKm:   parseFloat(detourKm.toFixed(1)),
      });

    } else {
      // ── Doesn't fit — find a bigger shared truck ──────────────────────────
      const totalNeededVol    = existingVol + totalVol;
      const totalNeededWeight = existingWeight + totalWeight;
      const biggerTrucks = allTrucks
        .filter(t => t.id !== truck.id && t.shared)
        .filter(t => {
          const tv = t.length * t.width * t.height;
          return tv >= totalNeededVol && t.maxWt >= totalNeededWeight;
        })
        .sort((a, b) => truckFullCost(a) - truckFullCost(b));

      if (!biggerTrucks.length) continue;
      const bigTruck    = biggerTrucks[0];
      const bigTruckVol = bigTruck.length * bigTruck.width * bigTruck.height;
      const bigFC       = truckFullCost(bigTruck);

      // Build booking details using bigger truck's rates for all existing users
      const bkDetails   = group.bookings.map(b => {
        const uVol = b.totalVol    || 0;
        const uWt  = b.totalWeight || 0;
        const sc   = userSharedCost(uVol, bigTruckVol, bigFC);
        const pc   = calcPrivateCost(uWt, uVol);
        return {
          bookingId:   b.id,
          vol:         Math.round(uVol),
          weight:      Math.round(uWt),
          sharedCost:  Math.round(sc),
          privateCost: Math.round(pc),
          saves:       Math.round(pc - sc),
          savesPct:    pc > 0 ? Math.round((1 - sc / pc) * 100) : 0,
        };
      });

      const newUserSC    = userSharedCost(totalVol, bigTruckVol, bigFC);
      const newUserSaves = newUserPrivate - newUserSC;
      const allSave      = newUserSaves > 0 && bkDetails.every(b => b.saves > 0);
      const utilPct      = bigTruckVol > 0 ? Math.round(((existingVol + totalVol) / bigTruckVol) * 100) : 0;

      proposals.push({
        type:         'upgrade-truck',
        truck:        { id: truck.id,    name: truck.name,    licensePlate: truck.licensePlate,    vol: Math.round(truckVol),    maxWt: truck.maxWt    },
        upgradeTruck: { id: bigTruck.id, name: bigTruck.name, licensePlate: bigTruck.licensePlate, vol: Math.round(bigTruckVol), maxWt: bigTruck.maxWt },
        bookings:     bkDetails,
        newUser: {
          vol: Math.round(totalVol), weight: Math.round(totalWeight),
          sharedCost: Math.round(newUserSC), privateCost: Math.round(newUserPrivate),
          saves: Math.round(newUserSaves),
          savesPct: newUserPrivate > 0 ? Math.round((1 - newUserSC / newUserPrivate) * 100) : 0,
        },
        truckUtilPct: utilPct, allSave,
        overlapPct: Math.round(overlapPct),
        detourPct:  parseFloat(detourPct.toFixed(1)),
        detourKm:   parseFloat(detourKm.toFixed(1)),
      });
    }
  }

  // allSave proposals first, then by new-user savings descending
  proposals.sort((a, b) => {
    if (a.allSave !== b.allSave) return b.allSave ? 1 : -1;
    return b.newUser.saves - a.newUser.saves;
  });

  res.json({ proposals, newUserPrivateCost: Math.round(newUserPrivate) });
});

app.post('/api/bookings', (req, res) => {
  const store = readStore();

  // Extract caller's user from Bearer token (if sent) — enriches booking with contact info
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const callerUser  = bearerToken
    ? (store.users || []).find(u => u.token === bearerToken) || null
    : null;

  const b = {
    id:            store.nextIds.booking++,
    status:        'active',
    createdAt:     new Date().toISOString(),
    ...req.body,
    // Store caller's contact info so notifications can reach them later
    ...(callerUser ? {
      userId:      callerUser.id,
      notifyEmail: req.body.notifyEmail || callerUser.email,
      notifyPhone: req.body.notifyPhone || callerUser.phone,
    } : {
      notifyEmail: req.body.notifyEmail || null,
      notifyPhone: req.body.notifyPhone || null,
    }),
  };
  store.bookings.push(b);
  writeStore(store);

  // ── Find consolidation matches ───────────────────────────────────────────
  const consolidationMatches = [];
  const newCoords = b.route?.geometry?.coordinates;

  if (b.route?.fromLat != null && b.route?.toLat != null) {
    for (const other of store.bookings) {
      if (other.id === b.id || other.status !== 'active' || !other.route) continue;
      if (other.shippingOption !== 'shared') continue;

      const truck = (store.trucks || []).find(t => t.id === other.truckId);
      if (!truck || !truck.shared) continue;

      const truckVol     = truck.length * truck.width * truck.height;
      const remainingVol = truckVol - (other.totalVol || 0);
      const remainingPct = truckVol > 0 ? (remainingVol / truckVol) * 100 : 0;
      if (remainingPct < 5) continue;

      if (b.pickupDate && other.pickupDate && daysDiff(b.pickupDate, other.pickupDate) > 2) continue;

      const existCoords = other.route?.geometry?.coordinates;
      const overlapPct  = routeOverlapPct(newCoords, existCoords);
      if (overlapPct < 80) continue;

      const existDistKm = other.route?.distance_km || 0;
      const detourKm    = estimateDetourKm(
        existCoords, b.route.fromLat, b.route.fromLng, b.route.toLat, b.route.toLng
      );
      const detourPct   = existDistKm > 0 ? (detourKm / existDistKm) * 100 : 100;
      if (detourPct > 5) continue;

      consolidationMatches.push({
        booking:      other,
        truck,
        remainingPct: Math.round(remainingPct),
        overlapPct:   Math.round(overlapPct),
        detourPct:    parseFloat(detourPct.toFixed(1)),
        detourKm:     parseFloat(detourKm.toFixed(1)),
      });
    }
  }

  consolidationMatches.sort((a, b) => b.overlapPct - a.overlapPct || a.detourPct - b.detourPct);
  res.json({ ok: true, booking: b, consolidationMatches });

  // ── Fire milestone notifications (non-blocking) ───────────────────────────
  if (b.shippingOption === 'shared') {
    (async () => {
      try {
        const routeStr  = `${b.route?.fromLabel || 'Origin'} → ${b.route?.toLabel || 'Destination'}`;
        const dateStr   = b.pickupDate ? `📅 Pickup: <strong>${b.pickupDate}</strong>` : '';
        const truckName = (() => {
          const t = (store.trucks || []).find(t => t.id === b.truckId);
          return t ? t.name : 'Shared truck';
        })();
        const upgradeTruckName = b.upgradeTruckName || null;
        const groupSize        = consolidationMatches.length + 1;

        // ── Notify the NEW user ──────────────────────────────────────────────
        const newEmail = b.notifyEmail;
        const newPhone = b.notifyPhone;
        if (newEmail || newPhone) {
          if (consolidationMatches.length > 0) {
            // Joined an existing group
            const milestone = upgradeTruckName
              ? `⬆️ Truck Upgraded — You Joined a Shared Group!`
              : `🎉 You Joined a Shared Truck Group!`;
            const truckLine = upgradeTruckName
              ? `Truck upgraded to <strong>${upgradeTruckName}</strong> to fit everyone.`
              : `Truck: <strong>${truckName}</strong>`;
            const html = buildEmailHtml(milestone, [
              `Route: <strong>${routeStr}</strong>`,
              dateStr,
              truckLine,
              `Group size: <strong>${groupSize} shippers</strong>`,
              `Sharing this truck splits the cost — you pay less than booking privately! 🚛`,
            ], 'Truck Load Optimizer · toc.dnw-ai.com');
            const sms = `TOC: ${upgradeTruckName ? '⬆️ Truck upgraded & you joined a shared group!' : '🎉 You joined a shared truck group!'} Route: ${routeStr}${b.pickupDate ? ', pickup ' + b.pickupDate : ''}. Truck: ${upgradeTruckName || truckName}. ${groupSize} shippers total. toc.dnw-ai.com`;
            await notifyUser({ email: newEmail, phone: newPhone }, milestone, html, sms);
          } else {
            // First on this lane — no group yet
            const html = buildEmailHtml('🚛 Your Shared-Truck Booking is Confirmed!', [
              `Route: <strong>${routeStr}</strong>`,
              dateStr,
              `Truck: <strong>${truckName}</strong>`,
              `You're the first shipper on this lane. Others may join and further reduce your cost!`,
            ], 'Truck Load Optimizer · toc.dnw-ai.com');
            const sms = `TOC: ✅ Shared truck booking confirmed! Route: ${routeStr}${b.pickupDate ? ', pickup ' + b.pickupDate : ''}. Truck: ${truckName}. You're first on this lane — more shippers = more savings! toc.dnw-ai.com`;
            await notifyUser({ email: newEmail, phone: newPhone }, '🚛 Shared-Truck Booking Confirmed', html, sms);
          }
        }

        // ── Notify each EXISTING user whose booking was just consolidated ──
        for (const m of consolidationMatches) {
          const ob = m.booking;
          // Look up contact: stored on booking, or fall back to user record
          let existEmail = ob.notifyEmail;
          let existPhone = ob.notifyPhone;
          if (!existEmail && ob.userId) {
            const u = (store.users || []).find(u => u.id === ob.userId);
            if (u) { existEmail = u.email; existPhone = u.phone; }
          }
          if (!existEmail && !existPhone) continue;

          const usedPct   = 100 - m.remainingPct;
          const milestone = upgradeTruckName
            ? `⬆️ Your Truck Was Upgraded — New Shipper Joined!`
            : `🎉 New Shipper Joined Your Shared Truck!`;
          const html = buildEmailHtml(milestone, [
            upgradeTruckName
              ? `Your truck has been upgraded to <strong>${upgradeTruckName}</strong> to fit everyone — same lane, bigger truck.`
              : `A new shipper just joined your shared truck on this route.`,
            `Route: <strong>${routeStr}</strong>`,
            dateStr,
            `Truck now <strong>${usedPct}% full</strong> (${groupSize} shippers).`,
            `The more shippers share, the less everyone pays. You're saving vs. private booking! 🎉`,
          ], 'Truck Load Optimizer · toc.dnw-ai.com');
          const sms = `TOC: ${upgradeTruckName ? '⬆️ Your truck was upgraded to ' + upgradeTruckName + ' and a' : '🎉 A'} new shipper joined your lane! Route: ${routeStr}. Truck ${usedPct}% full (${groupSize} shippers). More savings for everyone! toc.dnw-ai.com`;
          await notifyUser({ email: existEmail, phone: existPhone }, milestone, html, sms);
        }
      } catch (err) {
        console.error('[notify] milestone error:', err.message);
      }
    })();
  }
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
      shared:       r.shared === true,
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
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const genAI     = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// AI chat assistant — conversational helper for cargo booking
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  if (!anthropic) return res.status(503).json({ error: 'AI service unavailable. Check ANTHROPIC_API_KEY.' });
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
  if (!anthropic) return res.status(503).json({ error: 'AI service unavailable. No API keys configured.' });
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
  if (!anthropic) return res.status(503).json({ error: 'AI service unavailable. Check ANTHROPIC_API_KEY.' });
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
  if (!anthropic) return res.status(503).json({ error: 'AI service unavailable. Check ANTHROPIC_API_KEY.' });
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
