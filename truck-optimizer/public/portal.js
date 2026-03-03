'use strict';

// ── Item Catalogs ──────────────────────────────────────────────────────────────
const PORTAL_HOUSEHOLD = [
  { cat: 'Living Room', items: [
    { name: 'Sofa (3-seat)',        l: 7.5, w: 3.0, h: 3.0, wt: 180 },
    { name: 'Loveseat',             l: 5.0, w: 3.0, h: 3.0, wt: 120 },
    { name: 'Armchair',             l: 3.0, w: 3.0, h: 3.5, wt:  70 },
    { name: 'Recliner',             l: 3.5, w: 3.0, h: 3.5, wt: 100 },
    { name: 'Sectional Sofa',       l:10.0, w: 5.0, h: 3.0, wt: 300 },
    { name: 'Coffee Table',         l: 4.0, w: 2.0, h: 1.5, wt:  50 },
    { name: 'Side Table',           l: 1.5, w: 1.5, h: 2.0, wt:  25 },
    { name: 'TV Stand',             l: 5.0, w: 1.5, h: 2.0, wt:  80 },
    { name: 'Entertainment Center', l: 6.0, w: 1.5, h: 5.0, wt: 200 },
    { name: 'Bookshelf (tall)',      l: 3.0, w: 1.0, h: 6.0, wt:  60 },
    { name: 'Ottoman',              l: 3.0, w: 2.0, h: 1.5, wt:  40 },
    { name: 'Floor Lamp',           l: 1.0, w: 1.0, h: 5.5, wt:  10 },
    { name: 'TV 55"',               l: 4.5, w: 0.5, h: 2.5, wt:  40 },
    { name: 'TV 75"',               l: 5.7, w: 0.5, h: 3.2, wt:  70 },
  ]},
  { cat: 'Bedroom', items: [
    { name: 'King Bed Frame',       l: 7.0, w: 6.5, h: 4.0, wt: 250 },
    { name: 'Queen Bed Frame',      l: 7.0, w: 5.5, h: 4.0, wt: 180 },
    { name: 'Full Bed Frame',       l: 6.5, w: 4.5, h: 4.0, wt: 140 },
    { name: 'Twin Bed Frame',       l: 6.5, w: 3.5, h: 4.0, wt: 100 },
    { name: 'King Mattress',        l: 6.5, w: 6.5, h: 1.0, wt: 100 },
    { name: 'Queen Mattress',       l: 6.5, w: 5.0, h: 1.0, wt:  80 },
    { name: 'Full Mattress',        l: 6.5, w: 4.5, h: 1.0, wt:  60 },
    { name: 'Twin Mattress',        l: 6.5, w: 3.5, h: 0.5, wt:  45 },
    { name: 'Dresser (wide)',       l: 4.0, w: 1.5, h: 4.0, wt: 150 },
    { name: 'Chest of Drawers',     l: 3.0, w: 1.5, h: 4.5, wt: 120 },
    { name: 'Wardrobe',             l: 4.0, w: 2.0, h: 6.0, wt: 250 },
    { name: 'Nightstand',           l: 1.5, w: 1.5, h: 2.0, wt:  30 },
    { name: 'Vanity Table',         l: 3.5, w: 1.5, h: 4.5, wt:  80 },
    { name: 'Tall Mirror',          l: 1.5, w: 0.5, h: 6.0, wt:  40 },
    { name: 'Bunk Bed',             l: 7.0, w: 3.5, h: 6.0, wt: 200 },
  ]},
  { cat: 'Dining Room', items: [
    { name: 'Dining Table (6-seat)',l: 6.0, w: 3.0, h: 2.5, wt: 150 },
    { name: 'Dining Table (4-seat)',l: 4.0, w: 3.0, h: 2.5, wt: 100 },
    { name: 'Dining Chair',         l: 1.5, w: 1.5, h: 3.5, wt:  20 },
    { name: 'Bar Stool',            l: 1.5, w: 1.5, h: 3.5, wt:  15 },
    { name: 'Buffet / Sideboard',   l: 5.0, w: 1.5, h: 3.0, wt: 180 },
    { name: 'China Cabinet',        l: 3.5, w: 1.5, h: 6.0, wt: 200 },
    { name: 'Bar Cart',             l: 2.5, w: 1.5, h: 3.5, wt:  30 },
    { name: 'Bench (dining)',       l: 4.0, w: 1.5, h: 1.5, wt:  40 },
  ]},
  { cat: 'Kitchen / Appliances', items: [
    { name: 'Refrigerator (full)',  l: 3.0, w: 2.5, h: 6.0, wt: 300 },
    { name: 'Refrigerator (mini)', l: 1.5, w: 1.5, h: 3.5, wt:  60 },
    { name: 'Oven / Range',         l: 2.5, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Washing Machine',      l: 2.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Dryer',                l: 2.0, w: 2.5, h: 3.5, wt: 150 },
    { name: 'Dishwasher',           l: 2.0, w: 2.0, h: 3.5, wt: 100 },
    { name: 'Microwave',            l: 1.5, w: 1.5, h: 1.0, wt:  40 },
    { name: 'Chest Freezer',        l: 4.0, w: 2.0, h: 3.0, wt: 150 },
    { name: 'Kitchen Island',       l: 4.0, w: 2.0, h: 3.0, wt: 200 },
  ]},
  { cat: 'Home Office', items: [
    { name: 'Desk (large)',         l: 5.0, w: 2.0, h: 2.5, wt: 100 },
    { name: 'Desk (small)',         l: 3.5, w: 1.5, h: 2.5, wt:  60 },
    { name: 'L-Shaped Desk',        l: 6.0, w: 5.0, h: 2.5, wt: 150 },
    { name: 'Office Chair',         l: 2.0, w: 2.0, h: 4.0, wt:  40 },
    { name: 'Filing Cabinet (4dr)', l: 1.5, w: 2.0, h: 4.5, wt: 130 },
    { name: 'Bookcase',             l: 3.0, w: 1.0, h: 6.0, wt:  80 },
    { name: 'Printer (desktop)',    l: 1.5, w: 1.5, h: 1.0, wt:  20 },
    { name: 'Monitor 27"',          l: 2.5, w: 0.5, h: 1.5, wt:  15 },
    { name: 'Desktop Computer',     l: 1.5, w: 1.0, h: 1.5, wt:  20 },
  ]},
  { cat: 'Exercise Equipment', items: [
    { name: 'Treadmill',            l: 5.5, w: 2.5, h: 4.0, wt: 250 },
    { name: 'Exercise Bike',        l: 3.5, w: 2.0, h: 4.0, wt: 100 },
    { name: 'Elliptical Trainer',   l: 5.0, w: 2.5, h: 5.0, wt: 200 },
    { name: 'Weight Bench',         l: 4.0, w: 2.0, h: 3.5, wt:  80 },
    { name: 'Weight Rack',          l: 3.0, w: 2.0, h: 5.0, wt: 150 },
    { name: 'Rowing Machine',       l: 7.0, w: 2.0, h: 3.5, wt: 100 },
    { name: 'Punching Bag',         l: 1.5, w: 1.5, h: 4.0, wt:  70 },
    { name: 'Squat Rack',           l: 4.0, w: 4.0, h: 7.0, wt: 300 },
  ]},
  { cat: 'Outdoor / Garage', items: [
    { name: 'Lawn Mower (push)',    l: 3.0, w: 2.0, h: 3.0, wt:  80 },
    { name: 'Riding Mower',         l: 6.0, w: 4.0, h: 4.0, wt: 450 },
    { name: 'Patio Table',          l: 4.0, w: 4.0, h: 2.5, wt:  80 },
    { name: 'Patio Chair',          l: 2.0, w: 2.0, h: 3.0, wt:  25 },
    { name: 'Patio Sofa',           l: 6.0, w: 3.0, h: 3.0, wt: 120 },
    { name: 'BBQ Grill',            l: 2.5, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Bicycle',              l: 5.5, w: 1.5, h: 3.5, wt:  25 },
    { name: 'Workbench',            l: 6.0, w: 2.0, h: 3.0, wt: 200 },
    { name: 'Tool Cabinet',         l: 2.5, w: 1.5, h: 5.0, wt: 180 },
    { name: 'Storage Shelving',     l: 4.0, w: 1.5, h: 6.0, wt:  60 },
    { name: 'Ladder (6 ft)',        l: 6.0, w: 1.5, h: 0.5, wt:  25 },
    { name: 'Kayak / Canoe',        l:12.0, w: 2.5, h: 1.5, wt:  55 },
  ]},
  { cat: 'Moving Boxes', items: [
    { name: 'Small Box',            l: 1.5, w: 1.5, h: 1.5, wt:  40 },
    { name: 'Medium Box',           l: 2.0, w: 1.5, h: 1.5, wt:  60 },
    { name: 'Large Box',            l: 2.0, w: 2.0, h: 2.0, wt:  80 },
    { name: 'Extra-Large Box',      l: 2.5, w: 2.0, h: 2.0, wt: 100 },
    { name: 'Wardrobe Box',         l: 2.0, w: 2.0, h: 4.0, wt:  60 },
    { name: 'Picture / Mirror Box', l: 3.5, w: 0.5, h: 3.0, wt:  30 },
    { name: 'Dish Pack Box',        l: 1.5, w: 1.5, h: 2.0, wt:  50 },
    { name: 'Book Box',             l: 1.5, w: 1.5, h: 1.0, wt:  60 },
  ]},
];

const PORTAL_INDUSTRIAL = [
  { cat: 'Pallets & Crates', items: [
    { name: 'Standard Pallet (48×40)', l: 4.0, w: 3.5, h: 0.6, wt:   50 },
    { name: 'Euro Pallet (47×31)',      l: 3.9, w: 2.6, h: 0.6, wt:   55 },
    { name: 'Double-Wing Pallet',       l: 4.0, w: 4.0, h: 0.6, wt:   60 },
    { name: 'Wooden Crate (small)',     l: 3.0, w: 2.0, h: 2.0, wt:   80 },
    { name: 'Wooden Crate (large)',     l: 6.0, w: 4.0, h: 4.0, wt:  200 },
    { name: 'Pallet + Load (48×40)',    l: 4.0, w: 3.5, h: 4.5, wt: 2000 },
    { name: 'Steel Skid',               l: 5.0, w: 3.0, h: 0.5, wt:  150 },
  ]},
  { cat: 'Industrial Machinery', items: [
    { name: 'CNC Machine (small)',      l: 6.0, w: 4.0, h: 5.0, wt: 4000 },
    { name: 'Compressor (industrial)', l: 5.0, w: 3.0, h: 4.0, wt: 1500 },
    { name: 'Generator (portable)',     l: 4.0, w: 2.0, h: 2.5, wt:  500 },
    { name: 'Generator (standby)',      l: 8.0, w: 3.0, h: 4.0, wt: 2500 },
    { name: 'Industrial Press',         l: 5.0, w: 3.0, h: 6.0, wt: 3000 },
    { name: 'Conveyor Belt (8 ft)',     l: 9.0, w: 2.0, h: 3.0, wt:  600 },
    { name: 'Lathe Machine',            l: 8.0, w: 3.0, h: 5.0, wt: 3500 },
    { name: 'Air Compressor (tank)',    l: 3.0, w: 2.0, h: 3.5, wt:  300 },
  ]},
  { cat: 'Warehouse Equipment', items: [
    { name: 'Pallet Rack Section',      l: 8.0, w: 3.5, h: 8.0, wt:  250 },
    { name: 'Shelving Unit (heavy)',    l: 6.0, w: 2.0, h: 6.0, wt:  120 },
    { name: 'Wire Shelving (5-tier)',   l: 4.0, w: 1.5, h: 6.0, wt:   60 },
    { name: 'Mezzanine Panel',          l: 8.0, w: 4.0, h: 0.5, wt:  400 },
    { name: 'Dock Plate',               l: 4.0, w: 3.0, h: 0.5, wt:  200 },
    { name: 'Industrial Workbench',     l: 6.0, w: 2.5, h: 3.5, wt:  250 },
    { name: 'Storage Cabinet (steel)', l: 3.0, w: 1.5, h: 5.5, wt:  150 },
  ]},
  { cat: 'Material Handling', items: [
    { name: 'Forklift (3-ton)',         l: 9.0, w: 4.0, h: 6.0, wt: 9000 },
    { name: 'Pallet Jack (manual)',     l: 5.5, w: 1.5, h: 4.0, wt:  170 },
    { name: 'Pallet Jack (electric)',   l: 6.0, w: 2.0, h: 4.5, wt:  600 },
    { name: 'Hand Truck / Dolly',       l: 1.5, w: 1.0, h: 4.5, wt:   25 },
    { name: 'Platform Cart (large)',    l: 4.0, w: 2.5, h: 1.5, wt:   80 },
    { name: 'Drum (55-gal steel)',      l: 2.0, w: 2.0, h: 3.0, wt:  500 },
    { name: 'IBC Tote (275-gal)',       l: 3.5, w: 3.0, h: 3.5, wt: 2800 },
  ]},
  { cat: 'Construction Materials', items: [
    { name: 'Lumber Bundle (8 ft)',      l:  8.0, w: 2.0, h: 2.0, wt:  800 },
    { name: 'Plywood Bundle (4×8)',      l:  8.5, w: 4.5, h: 2.0, wt:  700 },
    { name: 'Drywall Bundle (4×8)',      l:  8.5, w: 4.5, h: 1.5, wt: 1200 },
    { name: 'Steel Beam (20 ft)',        l: 20.0, w: 1.0, h: 1.0, wt: 1000 },
    { name: 'Concrete Block (pallet)',   l:  4.0, w: 3.5, h: 2.5, wt: 2800 },
    { name: 'Roofing Shingles (pallet)', l:  4.0, w: 3.0, h: 4.0, wt: 2500 },
    { name: 'HVAC Unit (split)',          l:  4.0, w: 2.0, h: 2.5, wt:  300 },
    { name: 'Pipe Bundle (10 ft)',        l: 10.0, w: 2.0, h: 2.0, wt:  400 },
  ]},
  { cat: 'Office & Business', items: [
    { name: 'Server Rack (42U)',        l: 3.0, w: 3.5, h: 6.5, wt:  250 },
    { name: 'Commercial Copier',        l: 2.5, w: 2.0, h: 3.5, wt:  200 },
    { name: 'Cubicle Desk System',      l: 6.0, w: 5.0, h: 4.0, wt:  300 },
    { name: 'Safe (commercial)',        l: 2.5, w: 2.0, h: 4.0, wt: 1000 },
    { name: 'Vending Machine',          l: 3.0, w: 2.5, h: 6.0, wt:  500 },
    { name: 'ATM Machine',              l: 2.0, w: 2.0, h: 5.5, wt:  600 },
    { name: 'Large Format Printer',     l: 5.0, w: 2.5, h: 3.5, wt:  300 },
  ]},
  { cat: 'Retail Equipment', items: [
    { name: 'Glass Display Case',       l: 4.0, w: 2.0, h: 4.0, wt: 150 },
    { name: 'Checkout Counter',         l: 5.0, w: 2.5, h: 3.5, wt: 200 },
    { name: 'Gondola Shelving',         l: 4.0, w: 1.5, h: 5.0, wt: 100 },
    { name: 'Clothing Rack (floor)',    l: 3.0, w: 1.5, h: 5.0, wt:  40 },
    { name: 'Point of Sale Kiosk',      l: 2.0, w: 2.0, h: 5.0, wt: 150 },
    { name: 'Commercial Refrigerator', l: 3.0, w: 2.5, h: 6.0, wt: 400 },
    { name: 'Walk-in Cooler Panel',     l: 4.0, w: 4.0, h: 8.0, wt: 600 },
  ]},
  { cat: 'Food & Beverage', items: [
    { name: 'Restaurant Range (6-brn)', l: 3.5, w: 2.5, h: 3.5, wt:  350 },
    { name: 'Commercial Dishwasher',    l: 4.0, w: 2.5, h: 4.0, wt:  300 },
    { name: 'Walk-in Refrigerator',     l: 8.0, w: 6.0, h: 8.0, wt: 1500 },
    { name: 'Ice Machine (commercial)', l: 2.5, w: 2.0, h: 3.5, wt:  250 },
    { name: 'Deep Fryer (commercial)',  l: 2.0, w: 2.0, h: 3.5, wt:  150 },
    { name: 'Prep Table (stainless)',   l: 5.0, w: 2.0, h: 3.0, wt:  200 },
    { name: 'Keg (half-barrel)',         l: 1.5, w: 1.5, h: 2.0, wt:  170 },
    { name: 'Food Truck Equipment Kit', l: 6.0, w: 3.0, h: 4.0, wt:  800 },
  ]},
];

let _portalCategory = null; // 'household' | 'industrial'

async function portalSetCategory(type) {
  _portalCategory = type;
  const sel = document.getElementById('p-item-select');
  sel.innerHTML = '<option value="">— Choose an item —</option>';
  const catalog = type === 'household' ? PORTAL_HOUSEHOLD : PORTAL_INDUSTRIAL;

  // Built-in items
  catalog.forEach(group => {
    const og = document.createElement('optgroup');
    og.label = group.cat;
    group.items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify(item);
      opt.textContent = item.name;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });

  // Custom items from server
  try {
    const res   = await fetch('/api/catalog?category=' + type);
    const custom = await res.json();
    if (custom.length) {
      const og = document.createElement('optgroup');
      og.label = '⭐ User-Added Items';
      custom.forEach(item => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify({ name: item.name, l: item.l, w: item.w, h: item.h, wt: item.wt });
        opt.textContent = item.name;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    }
  } catch (_) {}

  document.getElementById('p-step1').style.display = 'none';
  document.getElementById('p-step2').style.display = 'block';
}

function portalPickItem(val) {
  if (!val) return;
  const item = JSON.parse(val);
  document.getElementById('p-name').value       = item.name;
  document.getElementById('p-length').value     = item.l;
  document.getElementById('p-width').value      = item.w;
  document.getElementById('p-height').value     = item.h;
  document.getElementById('p-weight').value     = item.wt;
  document.getElementById('p-pkg-weight').value = '0';
  document.getElementById('p-qty').value        = '1';
}

function portalEnterCustomItem() {
  // Clear the dropdown selection and form so user can type freely
  document.getElementById('p-item-select').value = '';
  document.getElementById('p-name').value        = '';
  document.getElementById('p-length').value      = '4';
  document.getElementById('p-width').value       = '4';
  document.getElementById('p-height').value      = '4';
  document.getElementById('p-weight').value      = '100';
  document.getElementById('p-pkg-weight').value  = '0';
  document.getElementById('p-qty').value         = '1';
  document.getElementById('p-name').focus();
}

function portalToggleDG() {
  const checked = document.getElementById('p-is-dg').checked;
  document.getElementById('p-dg-fields').style.display = checked ? '' : 'none';
}

function portalResetCategory() {
  _portalCategory = null;
  document.getElementById('p-step1').style.display = 'block';
  document.getElementById('p-step2').style.display = 'none';
  document.getElementById('p-item-select').value = '';
  document.getElementById('p-name').value        = '';
  document.getElementById('p-length').value      = '4';
  document.getElementById('p-width').value       = '4';
  document.getElementById('p-height').value      = '4';
  document.getElementById('p-weight').value      = '500';
  document.getElementById('p-pkg-weight').value  = '0';
  document.getElementById('p-qty').value         = '1';
  document.getElementById('p-is-dg').checked     = false;
  document.getElementById('p-dg-fields').style.display = 'none';
  document.getElementById('p-dg-class').value    = '';
  document.getElementById('p-dg-combine').value  = 'true';
}

// ── Auth State ────────────────────────────────────────────────────────────────
let _authToken = localStorage.getItem('auth_token') || null;
let _authUser  = null;

async function checkAuth() {
  if (!_authToken) { applyAuthState(false); return; }
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + _authToken } });
    if (!res.ok) { _authToken = null; localStorage.removeItem('auth_token'); applyAuthState(false); return; }
    _authUser = (await res.json()).user;
    applyAuthState(true);
  } catch { applyAuthState(false); }
}

function applyAuthState(loggedIn) {
  document.getElementById('nav-login-btn').style.display  = loggedIn ? 'none' : '';
  document.getElementById('nav-user').style.display       = loggedIn ? '' : 'none';
  document.getElementById('cargo-lock').style.display     = loggedIn ? 'none' : '';
  document.getElementById('cargo-card').style.opacity     = loggedIn ? '1' : '0.35';
  document.getElementById('cargo-card').style.pointerEvents = loggedIn ? '' : 'none';
  if (loggedIn && _authUser) {
    document.getElementById('nav-user-email').textContent = _authUser.email;
  }
}

function openAuthModal()  {
  showAuthView('choose');
  document.getElementById('auth-modal').classList.add('open');
}
function closeAuthModal() { document.getElementById('auth-modal').classList.remove('open'); }
function authOverlayClick(e) { if (e.target === document.getElementById('auth-modal')) closeAuthModal(); }

function showAuthView(v) {
  ['choose', 'login', 'register'].forEach(id => {
    document.getElementById('auth-view-' + id).style.display = id === v ? '' : 'none';
  });
}

async function doLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-err');
  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Email and password are required.'; return; }
  try {
    const res  = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Login failed.'; return; }
    _authToken = data.token;
    _authUser  = data.user;
    localStorage.setItem('auth_token', _authToken);
    closeAuthModal();
    applyAuthState(true);
  } catch (e) { errEl.textContent = 'Network error: ' + e.message; }
}

async function doRegister() {
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const phone    = document.getElementById('reg-phone').value.trim();
  const address  = document.getElementById('reg-address').value.trim();
  const errEl    = document.getElementById('reg-err');
  errEl.textContent = '';
  if (!email || !password || !phone || !address) { errEl.textContent = 'All fields are required.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  try {
    const res  = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, phone, address })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Registration failed.'; return; }
    _authToken = data.token;
    _authUser  = data.user;
    localStorage.setItem('auth_token', _authToken);
    closeAuthModal();
    applyAuthState(true);
  } catch (e) { errEl.textContent = 'Network error: ' + e.message; }
}

async function doLogout() {
  if (_authToken) {
    await fetch('/api/auth/logout', {
      method: 'POST', headers: { Authorization: 'Bearer ' + _authToken }
    }).catch(() => {});
    _authToken = null;
    _authUser  = null;
    localStorage.removeItem('auth_token');
  }
  applyAuthState(false);
}

// ── State ─────────────────────────────────────────────────────────────────────
let trucks    = [];
let carriers  = [];
let customers = [];
let items     = [];
let nextIds   = { truck: 1, carrier: 1, carrierTruck: 1, customer: 1, item: 1 };

// ── Boot ──────────────────────────────────────────────────────────────────────
async function init() {
  await checkAuth();
  try {
    const data = await fetch('/api/data').then(r => r.json());
    applyPayload(data);
    renderAll();
  } catch (e) {
    showSaveStatus('Could not load data from server: ' + e.message, 'err');
  }
}

function applyPayload(data) {
  trucks    = data.trucks    || [];
  carriers  = data.carriers  || [];
  customers = data.customers || [];
  items     = data.items     || [];
  nextIds   = data.nextIds   || nextIds;
}

// ── Persistence ───────────────────────────────────────────────────────────────
async function saveToServer() {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    trucks, carriers, customers, items, nextIds,
  };
  try {
    const res = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showSaveStatus('Saved', 'ok');
  } catch (e) {
    showSaveStatus('Save failed: ' + e.message, 'err');
  }
}

function showSaveStatus(msg, cls) {
  const el = document.getElementById('p-save-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'save-status ' + (cls || '');
  if (cls === 'ok') setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, 2500);
}

// ── Add / Remove items ────────────────────────────────────────────────────────
function portalAddItem() {
  const name   = document.getElementById('p-name').value.trim();
  const length = parseFloat(document.getElementById('p-length').value) || 4;
  const width  = parseFloat(document.getElementById('p-width').value)  || 4;
  const height = parseFloat(document.getElementById('p-height').value) || 4;
  const weight          = parseFloat(document.getElementById('p-weight').value)     || 0;
  const packagingWeight = parseFloat(document.getElementById('p-pkg-weight').value) || 0;
  const qty    = parseInt(document.getElementById('p-qty').value, 10)  || 1;

  const isDG         = document.getElementById('p-is-dg').checked;
  const dgClass      = isDG ? (document.getElementById('p-dg-class').value || '') : '';
  const dgCanCombine = isDG ? (document.getElementById('p-dg-combine').value !== 'false') : true;

  if (!name) { alert('Please enter an item name.'); return; }
  if (length <= 0 || width <= 0 || height <= 0) { alert('Dimensions must be positive.'); return; }
  if (isDG && !dgClass) { alert('Please select a DG Class for dangerous goods.'); return; }

  items.push({
    id:             nextIds.item++,
    name,
    length,
    width,
    height,
    weight,
    packagingWeight,
    qty,
    rotate:         true,
    customerId:     null,
    isDG,
    dgClass,
    dgCanCombine,
  });

  // If item name not in built-in catalog, save it to server catalog for future users
  const allBuiltIn = [...PORTAL_HOUSEHOLD, ...PORTAL_INDUSTRIAL].flatMap(g => g.items);
  const isBuiltIn  = allBuiltIn.some(i => i.name.toLowerCase() === name.toLowerCase());
  if (!isBuiltIn && _portalCategory) {
    fetch('/api/catalog', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, category: _portalCategory, l: length, w: width, h: height, wt: weight }),
    }).catch(() => {});
  }

  // Reset form and stay on same screen — right panel updates
  portalResetCategory();
  saveToServer();
  renderAll();
}

function portalRemoveItem(id) {
  items = items.filter(it => it.id !== id);
  saveToServer();
  renderAll();
}

// ── Render helpers ────────────────────────────────────────────────────────────
function renderAll() {
  renderStats();
  renderCustomerSelect();
  renderItemList();
  renderCustomerList();
  renderFleetList();
}

function renderStats() {
  const totalTrucks = trucks.length + carriers.reduce((s, c) => s + (c.trucks?.length || 0), 0);
  setText('s-trucks',    trucks.length);
  setText('s-carriers',  carriers.length);
  setText('s-customers', customers.length);
  setText('s-units',     items.reduce((s, it) => s + (it.qty || 1), 0));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderCustomerSelect() {
  const sel = document.getElementById('p-customer');
  if (!sel) return; // not present in portal view
  const prev = sel.value;
  sel.innerHTML = '<option value="">— Unassigned —</option>';
  for (const c of customers) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    if (String(c.id) === prev) opt.selected = true;
    sel.appendChild(opt);
  }
}

function renderItemList() {
  const el = document.getElementById('p-item-list');
  if (!el) return;

  // Update summary strip + proceed bar
  const sumEl     = document.getElementById('p-list-summary');
  const proceedEl = document.getElementById('p-proceed-bar');

  if (!items.length) {
    el.innerHTML = '<p class="list-empty-msg">No items yet — add some on the left.</p>';
    if (sumEl)     sumEl.style.display     = 'none';
    if (proceedEl) proceedEl.style.display = 'none';
    return;
  }

  const totalUnits  = items.reduce((s, it) => s + (it.qty || 1), 0);
  const totalWeight = items.reduce((s, it) => s + (it.weight + (it.packagingWeight || 0)) * it.qty, 0);

  if (sumEl) {
    sumEl.style.display = '';
    document.getElementById('lss-types').textContent  = items.length;
    document.getElementById('lss-units').textContent  = totalUnits;
    document.getElementById('lss-weight').textContent = totalWeight.toLocaleString();
  }
  if (proceedEl) proceedEl.style.display = '';

  el.innerHTML = '<div class="item-list">' +
    items.map(it => `
      <div class="item-row">
        <div class="item-row-info">
          <div class="item-row-name">
            ${esc(it.name)} <span style="font-weight:400;color:var(--text2);">×${it.qty}</span>
            ${it.isDG ? `<span class="dg-badge">⚠ DG</span>` : ''}
          </div>
          <div class="item-row-meta">${it.length}×${it.width}×${it.height} ft &nbsp;·&nbsp; ${it.weight.toLocaleString()} lbs${it.packagingWeight ? ` + ${it.packagingWeight.toLocaleString()} pkg` : ''}${it.isDG && it.dgClass ? ` &nbsp;·&nbsp; ${esc(it.dgClass)}` : ''}</div>
        </div>
        <button class="btn-remove" onclick="portalRemoveItem(${it.id})">✕</button>
      </div>`).join('') +
  '</div>';
}

// ── Booking wizard ─────────────────────────────────────────────────────────────
let _wizardShipping = null;
let _bookingEstimate = null;

function openBookingModal() {
  _wizardShipping = null;
  _bookingEstimate = null;
  document.querySelectorAll('.ship-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById('btn-see-charges').disabled = true;
  showBookingStep('shipping');
  document.getElementById('booking-modal').classList.add('open');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
}

function bookingOverlayClick(e) {
  if (e.target === document.getElementById('booking-modal')) closeBookingModal();
}

function showBookingStep(step) {
  ['shipping', 'charges', 'confirm'].forEach(s => {
    document.getElementById('bm-step-' + s).style.display = s === step ? '' : 'none';
  });
}

function selectShipping(type) {
  _wizardShipping = type;
  document.querySelectorAll('.ship-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById('ship-opt-' + type).classList.add('selected');
  document.getElementById('btn-see-charges').disabled = false;
}

async function showChargesStep() {
  showBookingStep('charges');
  const el = document.getElementById('bm-charges-content');
  el.innerHTML = '<p style="text-align:center;color:var(--text2);font-size:13px;padding:20px;">Loading rates…</p>';

  try {
    const data  = await fetch('/api/data').then(r => r.json());
    const truck = (data.trucks || [])[0];

    const totalUnits  = items.reduce((s, i) => s + i.qty, 0);
    const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
    const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);

    if (!truck) {
      _bookingEstimate = { estimate: null, totalUnits, totalWeight };
      el.innerHTML = '<p style="color:var(--text2);font-size:13px;padding:12px 0;">No truck rates available. You can still confirm your booking.</p>';
      return;
    }

    const hasDG    = items.some(i => i.isDG);
    const dgItems  = items.filter(i => i.isDG);

    const truckVol   = truck.length * truck.width * truck.height;
    const fullCost   = truck.baseRate + truck.ratePerMi * 100;
    const pct        = Math.min(totalVol / truckVol, 1);
    const baseCost   = _wizardShipping === 'shared'
      ? Math.max(fullCost * pct, fullCost * 0.25)
      : fullCost;
    const dgSurcharge = hasDG ? baseCost * 0.15 : 0;
    const estimate    = baseCost + dgSurcharge;

    _bookingEstimate = { estimate, totalUnits, totalWeight, hasDG };

    const sharedRow = _wizardShipping === 'shared'
      ? `<div class="charges-row"><span>Your share (${(pct * 100).toFixed(0)}%)</span><span>×${pct.toFixed(2)}</span></div>`
      : '';
    const dgRow = hasDG
      ? `<div class="charges-row-dg"><span>⚠ DG surcharge (15%)</span><span>+$${Math.round(dgSurcharge).toLocaleString()}</span></div>`
      : '';
    const dgWarning = hasDG
      ? `<div class="dg-warning-banner">
           <div class="dg-warning-banner-icon">⚠</div>
           <div class="dg-warning-banner-text">
             <div class="dg-warning-banner-title">Dangerous Goods Detected</div>
             Your shipment contains ${dgItems.length} DG item${dgItems.length !== 1 ? 's' : ''}: ${dgItems.map(i => esc(i.dgClass || 'DG')).join(', ')}.
             A DG-certified truck will be required. A 15% surcharge has been applied.
           </div>
         </div>`
      : '';

    el.innerHTML = `
      ${dgWarning}
      <div class="charges-card">
        <div class="charges-section-lbl">📦 Cargo Summary</div>
        <div class="charges-row"><span>Total items</span><span>${items.length} type${items.length !== 1 ? 's' : ''} · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}</span></div>
        <div class="charges-row"><span>Total weight</span><span>${totalWeight.toLocaleString()} lbs</span></div>
        <div class="charges-row"><span>Total volume</span><span>${totalVol.toFixed(1)} cu ft</span></div>
        <div class="charges-row"><span>Truck utilization</span><span>${(pct * 100).toFixed(0)}% of ${esc(truck.name)}</span></div>
      </div>
      <div class="charges-card">
        <div class="charges-section-lbl">💰 Estimated Charges <span style="font-size:10px;font-weight:400;color:var(--text2);">100-mi base estimate</span></div>
        <div class="charges-row"><span>Base rate</span><span>$${truck.baseRate.toLocaleString()}</span></div>
        <div class="charges-row"><span>Per-mile (100 mi)</span><span>$${(truck.ratePerMi * 100).toLocaleString()}</span></div>
        ${sharedRow}
        ${dgRow}
        <div class="charges-row charges-total">
          <span>Estimated Total</span>
          <span style="color:var(--primary);font-size:22px;letter-spacing:-0.4px;">$${Math.round(estimate).toLocaleString()}</span>
        </div>
        <p style="font-size:10px;color:var(--text2);margin-top:10px;line-height:1.6;">
          * Final price confirmed at pickup based on actual distance and weight.
        </p>
      </div>`;
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);font-size:12px;">Could not load rates: ${esc(e.message)}</p>`;
  }
}

async function confirmWebBooking() {
  const btn = document.querySelector('.btn-bm-confirm');
  btn.textContent = 'Saving…';
  btn.disabled = true;
  try {
    // Items already persisted on add; just record shippingOption on them
    const fresh = await fetch('/api/data').then(r => r.json());
    const myIds = new Set(items.map(i => i.id));
    const updatedItems = (fresh.items || []).map(i =>
      myIds.has(i.id) ? { ...i, shippingOption: _wizardShipping } : i
    );
    await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fresh, items: updatedItems }),
    });

    const { estimate, totalUnits, totalWeight, hasDG } = _bookingEstimate || {};
    const sumEl = document.getElementById('bm-confirm-summary');
    sumEl.innerHTML = `
      <div class="bm-confirm-grid">
        <div class="bcg-row"><span>Items submitted</span><span>${items.length} type${items.length !== 1 ? 's' : ''} · ${totalUnits || 0} units</span></div>
        <div class="bcg-row"><span>Total weight</span><span>${(totalWeight || 0).toLocaleString()} lbs</span></div>
        <div class="bcg-row"><span>Shipping type</span><span>${_wizardShipping === 'shared' ? '🤝 Share Truck (LTL)' : '🚚 Private Truck (FTL)'}</span></div>
        ${estimate != null ? `<div class="bcg-row"><span>Estimated cost</span><span style="color:var(--primary);font-weight:900;font-size:16px;">$${Math.round(estimate).toLocaleString()}</span></div>` : ''}
        ${hasDG ? `<div class="bcg-row"><span>DG note</span><span style="color:#c2410c;">⚠ DG-certified truck required</span></div>` : ''}
      </div>`;

    showBookingStep('confirm');
  } catch (e) {
    alert('Error saving booking: ' + e.message);
  } finally {
    btn.textContent = '✓ Confirm Booking';
    btn.disabled = false;
  }
}

function startNewBooking() {
  closeBookingModal();
  portalResetCategory();
}

function renderCustomerList() {
  const el = document.getElementById('p-customer-list');
  if (!el) return;
  if (!customers.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--text2);">No customers configured.</p>';
    return;
  }

  const termsLabel  = { cod: 'COD', net30: 'Net 30', net60: 'Net 60', net90: 'Net 90' };
  const methodLabel = { invoice: 'Invoice', bank: 'Bank Transfer', card: 'Credit Card', check: 'Check', cod: 'COD' };

  el.innerHTML = '<div class="ctx-list">' +
    customers.map(c => {
      const ps = c.paymentStatus || 'pending';
      const psBadge = ps === 'paid'    ? `<span class="pay-badge pay-paid">✓ Paid</span>`
                    : ps === 'overdue' ? `<span class="pay-badge pay-overdue">⚠ Overdue</span>`
                    :                   `<span class="pay-badge pay-pending">⏳ Pending</span>`;
      const tl = termsLabel[c.paymentTerms]   || c.paymentTerms   || 'Net 30';
      const ml = methodLabel[c.paymentMethod] || c.paymentMethod  || 'Invoice';
      const amt = c.invoiceAmount ? `$${Number(c.invoiceAmount).toLocaleString()}` : '';

      return `
        <div class="ctx-row" style="flex-wrap:wrap;gap:6px;">
          <span class="ctx-dot" style="background:${c.color || '#888'}"></span>
          <div style="flex:1;min-width:0;">
            <div class="ctx-name">${esc(c.name)} ${psBadge}</div>
            <div class="ctx-meta">Stop ${c.stop || '—'} · ${esc(c.zone || '—')}${c.distance ? ' · ' + c.distance + ' mi' : ''}</div>
            <div class="pay-info">${tl} · ${ml}${amt ? ' · <span class="pay-amount">' + amt + '</span>' : ''}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
            <select class="pay-status-sel" onchange="updatePaymentStatus(${c.id}, this.value)">
              <option value="pending" ${ps === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="paid"    ${ps === 'paid'    ? 'selected' : ''}>✓ Paid</option>
              <option value="overdue" ${ps === 'overdue' ? 'selected' : ''}>⚠ Overdue</option>
            </select>
            ${amt ? `<span style="font-size:11px;font-weight:700;color:var(--text);">${amt}</span>` : ''}
            ${(c.invoiceAmount > 0 && ps !== 'paid')
              ? `<button class="btn-pay-now" onclick="openPaymentModal(${c.id})">💳 Pay Now</button>`
              : ''}
          </div>
        </div>`;
    }).join('') +
  '</div>';
}

async function updatePaymentStatus(id, status) {
  const c = customers.find(c => c.id === id);
  if (!c) return;
  c.paymentStatus = status;
  await saveToServer();
  renderCustomerList();
}

function renderFleetList() {
  const el = document.getElementById('p-fleet-list');
  if (!el) return;
  const rows = [];
  for (const t of trucks) {
    rows.push(`
      <div class="ctx-row">
        <span style="font-size:16px;">🚛</span>
        <div>
          <div class="ctx-name">${esc(t.name)}</div>
          <div class="ctx-meta">${t.length}×${t.width}×${t.height} ft · ${(t.maxWt || 0).toLocaleString()} lbs max</div>
        </div>
      </div>`);
  }
  for (const car of carriers) {
    for (const ct of (car.trucks || [])) {
      rows.push(`
        <div class="ctx-row">
          <span style="font-size:16px;">🏢</span>
          <div>
            <div class="ctx-name">${esc(ct.name)} <span style="font-weight:400;color:var(--text2);">via ${esc(car.name)}</span></div>
            <div class="ctx-meta">${ct.length}×${ct.width}×${ct.height} ft · ${(ct.maxWt || 0).toLocaleString()} lbs max</div>
          </div>
        </div>`);
    }
  }
  el.innerHTML = rows.length
    ? '<div class="ctx-list">' + rows.join('') + '</div>'
    : '<p style="font-size:12px;color:var(--text2);">No fleet configured.</p>';
}

// ── Optimize ──────────────────────────────────────────────────────────────────
async function portalOptimize() {
  if (!trucks.length)  { alert('Please configure at least one own-fleet truck in Advanced Settings.'); return; }
  if (!items.length)   { alert('Please add at least one cargo item first.'); return; }

  const btn = document.getElementById('p-opt-btn');
  btn.textContent = 'Optimizing…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/optimize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ trucks, carriers, customers, items }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Optimization failed.'); return; }
    renderResults(data);
  } catch (e) {
    alert('Optimization failed: ' + e.message);
  } finally {
    btn.textContent = '⚡ Optimize Load Now';
    btn.disabled = false;
  }
}

// ── Results rendering ─────────────────────────────────────────────────────────
function renderResults({ packers, unplaced, splitWarn, truckZoneSummary }) {
  const el = document.getElementById('p-results');
  if (!el) return;

  const html = [];

  // ── Summary strip ──
  const totalTrucks  = packers.length;
  const totalPlaced  = packers.reduce((s, p) => s + p.placements.length, 0);
  const totalUnplaced = (unplaced || []).length;
  const totalCost    = (truckZoneSummary || [])
    .reduce((s, ts) => s + (ts.estimatedCost || 0), 0);

  html.push(`
    <div class="summary-strip">
      <div class="sum-card">
        <div class="sum-num">${totalTrucks}</div>
        <div class="sum-lbl">Trucks Used</div>
      </div>
      <div class="sum-card">
        <div class="sum-num">${totalPlaced}</div>
        <div class="sum-lbl">Items Placed</div>
      </div>
      <div class="sum-card">
        <div class="sum-num" style="color:${totalCost > 0 ? 'var(--primary)' : 'var(--text)'}">
          ${totalCost > 0 ? '$' + totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}
        </div>
        <div class="sum-lbl">Est. Fleet Cost</div>
      </div>
    </div>`);

  // ── Savings banner ──
  const consolidations = (truckZoneSummary || []).filter(ts => ts.zones.length > 1);
  if (consolidations.length) {
    const saved = estimateSavings(consolidations);
    if (saved > 0) {
      html.push(`
        <div class="savings-banner">
          <div class="savings-icon">✅</div>
          <div>
            <div class="savings-title">Zone Consolidation Active</div>
            <div class="savings-sub">${consolidations.length} truck${consolidations.length > 1 ? 's' : ''} carry multi-zone loads — fewer runs needed</div>
          </div>
          <div class="savings-amount">~$${saved.toLocaleString('en-US', { maximumFractionDigits: 0 })} saved</div>
        </div>`);
    }
  }

  // ── Warnings ──
  if (splitWarn?.length) {
    html.push(`
      <div class="warn-box">
        <div class="warn-title">⚠ Customer Split Across Trucks</div>
        ${splitWarn.map(w =>
          `<div class="warn-item">• ${esc(w.name)} → ${(w.trucks || []).map(esc).join(', ')}</div>`
        ).join('')}
      </div>`);
  }

  if (unplaced?.length) {
    html.push(`
      <div class="unplaced-box">
        <div class="unplaced-title">✕ Items That Didn't Fit</div>
        ${[...new Map(unplaced.map(u => [u.name, u])).values()].map(u =>
          `<div class="unplaced-item">• ${esc(u.name)} (${u.length}×${u.width}×${u.height} ft)</div>`
        ).join('')}
      </div>`);
  }

  // ── Per-truck cards ──
  for (let i = 0; i < packers.length; i++) {
    const p  = packers[i];
    const t  = p.truck;
    const ts = (truckZoneSummary || [])[i];

    const volCap  = t.length * t.width * t.height;
    const volUsed = p.placements.reduce((s, pl) => s + (pl.length * pl.width * pl.height), 0);
    const volPct  = volCap > 0 ? Math.min(100, Math.round(volUsed / volCap * 100)) : 0;

    const wtPct   = t.maxWt > 0 ? Math.min(100, Math.round((p.usedWeight || 0) / t.maxWt * 100)) : 0;

    const volColor  = volPct >= 90 ? 'var(--danger)' : volPct >= 70 ? 'var(--warning)' : 'var(--success)';
    const wtColor   = wtPct  >= 90 ? 'var(--danger)' : wtPct  >= 70 ? 'var(--warning)' : 'var(--success)';

    const pillCls  = volPct >= 90 ? 'pill-red' : volPct >= 70 ? 'pill-yellow' : 'pill-green';
    const pillText = volPct >= 90 ? 'Full' : volPct >= 70 ? 'Loaded' : 'Open';

    // Zone rows
    let zonesHtml = '';
    if (ts?.zones?.length) {
      zonesHtml = `
        <div class="zones-section">
          <div class="zones-label">Delivery Zones</div>
          ${ts.zones.map(z => {
            const custRows = (z.customers || []).map(zc => {
              const fullCust = customers.find(c => c.id === zc.id);
              const ps = fullCust?.paymentStatus || 'pending';
              const badge = ps === 'paid'    ? `<span class="pay-badge pay-paid">✓ Paid</span>`
                          : ps === 'overdue' ? `<span class="pay-badge pay-overdue">⚠ Overdue</span>`
                          :                   `<span class="pay-badge pay-pending">⏳ Pending</span>`;
              const amt = fullCust?.invoiceAmount
                ? `<span style="font-size:10px;font-weight:700;color:var(--primary);">$${Number(fullCust.invoiceAmount).toLocaleString()}</span>` : '';
              const payBtn = (fullCust?.invoiceAmount > 0 && ps !== 'paid')
                ? `<button class="btn-pay-now" style="font-size:10px;padding:2px 8px;" onclick="openPaymentModal(${zc.id})">💳 Pay</button>` : '';
              return `<div style="display:flex;align-items:center;gap:5px;margin-top:3px;">${badge} <span style="font-size:11px;">${esc(zc.name)}</span> ${amt} ${payBtn}</div>`;
            }).join('');
            return `
              <div class="zone-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
                <div style="display:flex;align-items:center;gap:8px;width:100%;">
                  <span class="zone-row-icon">📍</span>
                  <div class="zone-row-name">${esc(z.zone)}</div>
                  <div class="zone-row-dist" style="margin-left:auto;">${z.distance ? z.distance + ' mi' : ''}</div>
                </div>
                ${custRows}
              </div>`;
          }).join('')}
        </div>`;
    }

    // Trip cost footer
    let costHtml = '';
    if (ts?.estimatedCost != null) {
      const costStr = '$' + ts.estimatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 });
      costHtml = `
        <div class="trip-cost">
          <div class="trip-cost-left">
            <div class="trip-cost-label">Estimated Trip Cost</div>
            ${ts.zones?.length > 1 ? '<div class="trip-cost-savings">Multi-zone consolidated run</div>' : ''}
          </div>
          <div class="trip-cost-value">${costStr}</div>
        </div>`;
    }

    html.push(`
      <div class="truck-card">
        <div class="truck-card-head">
          <div>
            <div class="truck-card-name">🚛 ${esc(t.name)}</div>
            <div class="truck-card-sub">${t.length}×${t.width}×${t.height} ft · max ${(t.maxWt || 0).toLocaleString()} lbs</div>
          </div>
          <div class="truck-pills">
            <span class="pill pill-blue">${p.placements.length} items</span>
            <span class="pill ${pillCls}">${pillText} ${volPct}%</span>
          </div>
        </div>
        <div class="truck-card-body">
          <div class="prog">
            <div class="prog-label">Volume</div>
            <div class="prog-track"><div class="prog-fill" style="width:${volPct}%;background:${volColor}"></div></div>
            <div class="prog-pct" style="color:${volColor}">${volPct}%</div>
          </div>
          <div class="prog">
            <div class="prog-label">Weight</div>
            <div class="prog-track"><div class="prog-fill" style="width:${wtPct}%;background:${wtColor}"></div></div>
            <div class="prog-pct" style="color:${wtColor}">${wtPct}%</div>
          </div>
          ${zonesHtml}
          ${costHtml}
        </div>
      </div>`);
  }

  // ── Fleet total footer ──
  if (totalCost > 0) {
    html.push(`
      <div class="fleet-total">
        <div>
          <div class="fleet-total-label">Total Fleet Cost</div>
          <div class="fleet-total-sub">${totalTrucks} truck${totalTrucks !== 1 ? 's' : ''} · ${totalPlaced} items placed</div>
        </div>
        <div class="fleet-total-value">$${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
      </div>`);
  }

  el.innerHTML = html.join('');
}

// Rough savings estimate: compare consolidated cost vs separate same-zone runs
function estimateSavings(consolidations) {
  let saved = 0;
  for (const ts of consolidations) {
    // Each extra zone on the same truck saves ~1 base rate worth of a separate run
    const t = trucks.find(t => t.id === ts.truckId);
    if (!t) continue;
    const extraZones = ts.zones.length - 1;
    saved += extraZones * (t.baseRate || 400);
  }
  return saved;
}

// ── PayPal Payment Modal ──────────────────────────────────────────────────────
const TERMS_LABEL  = { cod: 'COD', net30: 'Net 30', net60: 'Net 60', net90: 'Net 90' };
const METHOD_LABEL = { invoice: 'Invoice', bank: 'Bank Transfer', card: 'Credit Card', check: 'Check', cod: 'COD' };

async function openPaymentModal(customerId) {
  const c = customers.find(c => c.id === customerId);
  if (!c || !c.invoiceAmount) return;

  document.getElementById('pay-modal-cust-name').textContent = c.name;
  document.getElementById('pay-modal-amount').textContent =
    '$' + Number(c.invoiceAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('pay-modal-terms').textContent =
    `${TERMS_LABEL[c.paymentTerms] || c.paymentTerms || 'Net 30'} · ${METHOD_LABEL[c.paymentMethod] || c.paymentMethod || 'Invoice'}`;
  document.getElementById('pay-modal-msg').innerHTML = '';
  document.getElementById('paypal-button-container').innerHTML =
    '<p style="text-align:center;color:var(--text2);font-size:12px;padding:10px 0;">Loading PayPal…</p>';

  document.getElementById('pay-modal').classList.add('open');

  try {
    await loadPayPalSDK();
    initPayPalButton(c);
  } catch (e) {
    document.getElementById('paypal-button-container').innerHTML =
      `<p style="color:var(--danger);font-size:12px;text-align:center;">
        Could not load PayPal. Check that <strong>PAYPAL_CLIENT_ID</strong> is set correctly on the server.
      </p>`;
  }
}

function closePaymentModal() {
  document.getElementById('pay-modal').classList.remove('open');
  document.getElementById('paypal-button-container').innerHTML = '';
  document.getElementById('pay-modal-msg').innerHTML = '';
}

function payModalOverlayClick(e) {
  if (e.target === document.getElementById('pay-modal')) closePaymentModal();
}

async function loadPayPalSDK() {
  if (window.paypal) return;                         // already loaded
  const { clientId } = await fetch('/api/payment/config').then(r => r.json());
  return new Promise((resolve, reject) => {
    const s  = document.createElement('script');
    s.src    = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`;
    s.onload  = resolve;
    s.onerror = () => reject(new Error('PayPal SDK script failed to load'));
    document.head.appendChild(s);
  });
}

function initPayPalButton(customer) {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';

  if (!window.paypal) {
    container.innerHTML = '<p style="color:var(--danger);font-size:12px;text-align:center;">PayPal SDK unavailable.</p>';
    return;
  }

  paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },

    createOrder: async () => {
      const res = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:       customer.invoiceAmount,
          currency:     'USD',
          customerId:   customer.id,
          customerName: customer.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order creation failed');
      return data.id;
    },

    onApprove: async (data) => {
      const msgEl = document.getElementById('pay-modal-msg');
      msgEl.innerHTML = '<p style="text-align:center;color:var(--text2);font-size:12px;padding:6px 0;">Processing…</p>';
      container.innerHTML = '';

      const res = await fetch('/api/payment/capture-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderID: data.orderID, customerId: customer.id }),
      });
      const result = await res.json();

      if (result.status === 'COMPLETED') {
        // Update local state immediately
        const c = customers.find(c => c.id === customer.id);
        if (c) c.paymentStatus = 'paid';

        msgEl.innerHTML = `
          <div class="pay-success">
            <div class="pay-success-icon">✅</div>
            <div class="pay-success-title">Payment Successful!</div>
            <div class="pay-success-sub">Capture ID: ${result.captureId || '—'}</div>
          </div>`;

        renderAll();                                 // refresh badges everywhere
        setTimeout(closePaymentModal, 3500);
      } else {
        msgEl.innerHTML = `<p style="color:var(--danger);font-size:12px;text-align:center;">
          Unexpected status: ${result.status}. Please contact support.</p>`;
      }
    },

    onError: (err) => {
      document.getElementById('pay-modal-msg').innerHTML =
        `<p style="color:var(--danger);font-size:12px;text-align:center;">
          Payment error — ${err}. Please try again.</p>`;
    },

    onCancel: () => {
      document.getElementById('pay-modal-msg').innerHTML =
        '<p style="color:var(--text2);font-size:12px;text-align:center;">Payment cancelled.</p>';
    },
  }).render('#paypal-button-container');
}

// ── Utility ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
