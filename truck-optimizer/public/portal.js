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
  document.getElementById('p-stackable').checked  = true;
  document.getElementById('p-fragile').checked   = false;
  document.getElementById('p-is-dg').checked      = false;
  document.getElementById('p-dg-fields').style.display = 'none';
  document.getElementById('p-dg-class').value     = '';
  document.getElementById('p-dg-combine').value   = 'true';
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
  // Admin button is always visible — not tied to customer login state
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
let rates     = [];
let nextIds   = { truck: 1, carrier: 1, carrierTruck: 1, customer: 1, item: 1, rate: 1 };

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
  rates     = data.rates     || [];
  nextIds   = data.nextIds   || nextIds;
}

// ── Persistence ───────────────────────────────────────────────────────────────
async function saveToServer() {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    trucks, carriers, customers, items, rates, nextIds,
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

  const stackable    = document.getElementById('p-stackable').checked;
  const isFragile    = document.getElementById('p-fragile')?.checked || false;
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
    stackable,
    isFragile,
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
            ${it.isDG      ? `<span class="dg-badge">⚠ DG</span>` : ''}
            ${it.isFragile ? `<span class="fragile-badge">🔔 Fragile</span>` : ''}
            ${it.customerId && _wizardCustomers.find(c => c.id === it.customerId) ? `<span class="customer-badge">👤 ${esc(_wizardCustomers.find(c => c.id === it.customerId).name)}</span>` : ''}
          </div>
          <div class="item-row-meta">${it.length}×${it.width}×${it.height} ft &nbsp;·&nbsp; ${it.weight.toLocaleString()} lbs${it.packagingWeight ? ` + ${it.packagingWeight.toLocaleString()} pkg` : ''}${it.isDG && it.dgClass ? ` &nbsp;·&nbsp; ${esc(it.dgClass)}` : ''}${it.stackable === false ? ' &nbsp;·&nbsp; <span style="color:#c2410c;font-weight:700;">🚫 No Stack</span>' : ''}</div>
        </div>
        <button class="btn-remove" onclick="portalRemoveItem(${it.id})">✕</button>
      </div>`).join('') +
  '</div>';
}

// ── Booking wizard ─────────────────────────────────────────────────────────────
let _wizardShipping = null;
let _bookingEstimate = null;
let _wizardStart = null;   // { label, lat, lng }
let _wizardDest  = null;   // { label, lat, lng }
let _wizardRoute = null;   // { index, distance_km, duration_min, geometry, toll_cost }
let _wizardCustomers = [];   // LTL consignees added in customer step
let _wizardTruck = null;   // { id, name, ... } — override truck selection
let _wizardConsolidateTo = null;  // booking id to consolidate into
let _leafletMap  = null;
let _leafletRouteLayer = null;

function openBookingModal() {
  _wizardShipping = null;
  _bookingEstimate = null;
  _wizardStart = null;
  _wizardDest  = null;
  _wizardRoute = null;
  _wizardCustomers = [];
  _wizardTruck = null;
  _wizardConsolidateTo = null;
  const cb = document.getElementById('bm-consolidation-banner'); if (cb) { cb.style.display = 'none'; cb.innerHTML = ''; }
  document.querySelectorAll('.ship-opt').forEach(el => el.classList.remove('selected'));
  // Reset location inputs
  const si = document.getElementById('bm-start-input'); if (si) si.value = '';
  const di = document.getElementById('bm-dest-input');  if (di) di.value = '';
  const sc = document.getElementById('bm-start-confirmed'); if (sc) sc.style.display = 'none';
  const dc = document.getElementById('bm-dest-confirmed');  if (dc) dc.style.display = 'none';
  const ss = document.getElementById('bm-start-suggestions'); if (ss) ss.style.display = 'none';
  const ds = document.getElementById('bm-dest-suggestions');  if (ds) ds.style.display = 'none';
  updateFindRoutesBtn();
  showBookingStep('location');
  document.getElementById('booking-modal').classList.add('open');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
}

function bookingOverlayClick(e) {
  if (e.target === document.getElementById('booking-modal')) closeBookingModal();
}

function showBookingStep(step) {
  ['location', 'customer', 'route', 'charges', 'confirm'].forEach(s => {
    const el = document.getElementById('bm-step-' + s);
    if (el) el.style.display = s === step ? '' : 'none';
  });
}

function selectShipping(type) {
  _wizardShipping = type;
  document.querySelectorAll('.ship-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById('ship-opt-' + type).classList.add('selected');
  updateFindRoutesBtn();
}

function onLocationInput(field) {
  if (field === 'start') { _wizardStart = null; }
  else                   { _wizardDest  = null; }
  updateFindRoutesBtn();
}

function updateFindRoutesBtn() {
  const btn = document.getElementById('btn-find-routes');
  if (btn) btn.disabled = !(_wizardStart && _wizardDest && _wizardShipping);
}

async function portalGeocode(field) {
  const inputId  = field === 'start' ? 'bm-start-input'       : 'bm-dest-input';
  const sugId    = field === 'start' ? 'bm-start-suggestions'  : 'bm-dest-suggestions';
  const btnId    = field === 'start' ? 'btn-start-search'      : 'btn-dest-search';
  const confId   = field === 'start' ? 'bm-start-confirmed'    : 'bm-dest-confirmed';
  const query    = document.getElementById(inputId)?.value?.trim();
  if (!query) return;

  const btn = document.getElementById(btnId);
  btn.textContent = '⏳'; btn.disabled = true;
  if (field === 'start') _wizardStart = null; else _wizardDest = null;
  updateFindRoutesBtn();

  try {
    const results = await fetch('/api/geocode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(r => r.json());

    const sugEl = document.getElementById(sugId);
    if (!results.length) {
      sugEl.innerHTML = '<div class="location-suggestion-item" style="color:var(--text2);font-style:italic;">No results found</div>';
    } else {
      sugEl.innerHTML = results.map((r, i) =>
        `<div class="location-suggestion-item" onclick="portalSelectLocation('${field}', ${i})" data-idx="${i}">${esc(r.label)}</div>`
      ).join('');
      sugEl._data = results;
    }
    sugEl.style.display = '';
    document.getElementById(confId).style.display = 'none';
  } catch (e) {
    alert('Geocoding failed: ' + e.message);
  } finally {
    btn.textContent = '🔍'; btn.disabled = false;
  }
}

function portalSelectLocation(field, idx) {
  const sugId  = field === 'start' ? 'bm-start-suggestions' : 'bm-dest-suggestions';
  const inputId = field === 'start' ? 'bm-start-input'       : 'bm-dest-input';
  const confId  = field === 'start' ? 'bm-start-confirmed'   : 'bm-dest-confirmed';
  const sugEl  = document.getElementById(sugId);
  const result = sugEl._data?.[idx];
  if (!result) return;

  document.getElementById(inputId).value = result.label;
  sugEl.style.display = 'none';
  sugEl.innerHTML = '';

  const confEl = document.getElementById(confId);
  confEl.textContent = '✓ ' + result.label;
  confEl.style.display = '';

  if (field === 'start') _wizardStart = result;
  else                   _wizardDest  = result;
  updateFindRoutesBtn();
}

function portalFindRoutes() {
  if (_wizardShipping === 'shared') {
    renderWizardCustomers();
    showBookingStep('customer');
    return;
  }
  portalFindRoutesActual();
}

async function portalFindRoutesActual() {
  if (!_wizardStart || !_wizardDest) return;
  const listEl = document.getElementById('bm-routes-list');
  const tollEl = document.getElementById('bm-toll-info');
  const confBtn = document.getElementById('btn-confirm-route');
  listEl.innerHTML = '<p style="text-align:center;color:var(--text2);font-size:13px;padding:16px;">Finding routes…</p>';
  tollEl.style.display = 'none';
  if (confBtn) confBtn.disabled = true;
  document.getElementById('bm-route-sub').textContent =
    `${_wizardStart.label.split(',')[0]} → ${_wizardDest.label.split(',')[0]}`;
  showBookingStep('route');

  // Init map
  if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; _leafletRouteLayer = null; }
  _leafletMap = L.map('bm-map');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(_leafletMap);
  _leafletMap.setView([(_wizardStart.lat + _wizardDest.lat) / 2, (_wizardStart.lng + _wizardDest.lng) / 2], 6);

  try {
    const routes = await fetch('/api/routes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: _wizardStart, to: _wizardDest }),
    }).then(r => r.json());

    if (!Array.isArray(routes) || !routes.length) {
      listEl.innerHTML = '<p style="color:var(--danger);font-size:13px;padding:12px;">No routes found between these locations.</p>';
      return;
    }

    listEl._routes = routes;
    listEl.innerHTML = routes.map((r, i) => `
      <div class="route-card" id="route-card-${i}" onclick="portalSelectRoute(${i})">
        <div class="route-card-left">
          <div class="route-card-label">Route ${i + 1}</div>
        </div>
        <div class="route-card-right">
          <div class="route-card-dist">${r.distance_km} km</div>
          <div class="route-card-dur">${minsToHM(r.duration_min)}</div>
        </div>
      </div>`).join('');
  } catch (e) {
    listEl.innerHTML = `<p style="color:var(--danger);font-size:13px;padding:12px;">Routing failed: ${esc(e.message)}</p>`;
  }
}

function proceedFromCustomers() {
  portalFindRoutesActual();
}

function addWizardCustomer() {
  const name = document.getElementById('wc-name')?.value?.trim();
  if (!name) { alert('Customer name is required.'); return; }
  _wizardCustomers.push({
    id:      Date.now(),
    name,
    phone:   document.getElementById('wc-phone')?.value?.trim()   || '',
    address: document.getElementById('wc-address')?.value?.trim() || '',
    notes:   document.getElementById('wc-notes')?.value?.trim()   || '',
    value:   document.getElementById('wc-value')?.value?.trim()   || '',
  });
  ['wc-name','wc-phone','wc-address','wc-notes','wc-value'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderWizardCustomers();
}

function removeWizardCustomer(id) {
  _wizardCustomers = _wizardCustomers.filter(c => c.id !== id);
  renderWizardCustomers();
}

function renderWizardCustomers() {
  const el = document.getElementById('wc-list');
  if (!el) return;
  if (!_wizardCustomers.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--text2);text-align:center;padding:8px 0;">No customers yet — skip to proceed without LTL customers.</p>';
    return;
  }
  el.innerHTML = _wizardCustomers.map(c => `
    <div class="wc-card">
      <div style="flex:1;min-width:0;">
        <div class="wc-name">${esc(c.name)}</div>
        ${c.phone   ? `<div class="wc-meta">${esc(c.phone)}</div>` : ''}
        ${c.address ? `<div class="wc-meta">${esc(c.address)}</div>` : ''}
        ${c.value   ? `<span class="wc-value-badge">$${esc(c.value)}</span>` : ''}
      </div>
      <button class="btn-remove" onclick="removeWizardCustomer(${c.id})">✕</button>
    </div>
  `).join('');
}

function minsToHM(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function portalSelectRoute(idx) {
  const listEl  = document.getElementById('bm-routes-list');
  const routes  = listEl._routes;
  if (!routes) return;
  const route = routes[idx];
  _wizardRoute = { ...route, toll_cost: 0 };

  // Highlight selected card
  document.querySelectorAll('.route-card').forEach((c, i) => {
    c.classList.toggle('selected', i === idx);
  });

  // Draw on map
  if (_leafletRouteLayer) { _leafletMap.removeLayer(_leafletRouteLayer); _leafletRouteLayer = null; }
  _leafletRouteLayer = L.geoJSON(route.geometry, { style: { color: '#2563eb', weight: 4, opacity: 0.85 } }).addTo(_leafletMap);
  L.marker([_wizardStart.lat, _wizardStart.lng]).bindPopup('📍 Start').addTo(_leafletMap);
  L.marker([_wizardDest.lat, _wizardDest.lng]).bindPopup('🏁 Destination').addTo(_leafletMap);
  _leafletMap.fitBounds(_leafletRouteLayer.getBounds(), { padding: [20, 20] });

  // Fetch tolls
  const tollEl = document.getElementById('bm-toll-info');
  tollEl.innerHTML = '⏳ Calculating toll costs…'; tollEl.style.display = '';
  const confBtn = document.getElementById('btn-confirm-route');
  if (confBtn) confBtn.disabled = true;

  try {
    const vehicleType = '2AxlesTruck'; // default
    const tollData = await fetch('/api/tolls', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geometry: route.geometry, vehicleType }),
    }).then(r => r.json());
    const toll_cost = tollData.toll_cost || 0;
    _wizardRoute = { ...route, toll_cost };
    tollEl.innerHTML = toll_cost > 0
      ? `🚦 <strong>Estimated Tolls: $${toll_cost.toFixed(2)}</strong>`
      : '🚦 No toll data available for this route.';
  } catch (_) {
    tollEl.innerHTML = '🚦 Toll data unavailable.';
  } finally {
    if (confBtn) confBtn.disabled = false;
  }
}

function _portalSuggestTruck(allTrucks, totalWeight, totalVol, hasDG, hasFragile) {
  const semi = allTrucks.find(t => t.maxWt >= 30000) || allTrucks[0];
  const box  = allTrucks.find(t => t.maxWt <  30000) || allTrucks[0];
  if (!semi || !box) return null;
  const boxVol = box.length * box.width * box.height;
  if (hasDG)                    return { truck: semi, reason: 'DG-certified truck required' };
  if (totalWeight > box.maxWt)  return { truck: semi, reason: `weight exceeds box truck limit` };
  if (totalVol > boxVol * 0.9)  return { truck: semi, reason: `volume requires larger truck` };
  if (hasFragile)               return { truck: box,  reason: 'fragile items suit box truck' };
                                 return { truck: box,  reason: 'cargo fits in box truck' };
}

function useTruck(truckId) {
  const data_trucks = trucks; // local state
  const t = data_trucks.find(x => x.id === truckId);
  if (!t) return;
  _wizardTruck = t;
  showChargesStep();
}

function joinShipment(bookingId) {
  _wizardConsolidateTo = bookingId;
  alert('You will join this shipment on confirm. ~15% savings applied.');
}

async function showChargesStep() {
  showBookingStep('charges');
  const el = document.getElementById('bm-charges-content');
  el.innerHTML = '<p style="text-align:center;color:var(--text2);font-size:13px;padding:20px;">Loading rates…</p>';

  const distance_km    = _wizardRoute ? _wizardRoute.distance_km : 160.9;
  const distance_miles = distance_km * 0.621371;
  const toll_cost      = _wizardRoute ? (_wizardRoute.toll_cost || 0) : 0;

  const sub = document.getElementById('bm-charges-sub');
  if (sub) sub.textContent = _wizardRoute
    ? `Based on ${distance_km.toFixed(0)} km (${distance_miles.toFixed(0)} mi) actual route`
    : 'Based on estimated distance';

  try {
    const data      = await fetch('/api/data').then(r => r.json());
    const allTrucks = data.trucks || [];
    const truck     = _wizardTruck || allTrucks[0];

    const totalUnits  = items.reduce((s, i) => s + i.qty, 0);
    const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
    const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
    const hasDG       = items.some(i => i.isDG);
    const hasFragile  = items.some(i => i.isFragile);
    const dgItems     = items.filter(i => i.isDG);

    if (!truck) {
      _bookingEstimate = { estimate: null, totalUnits, totalWeight };
      el.innerHTML = '<p style="color:var(--text2);font-size:13px;padding:12px 0;">No truck rates available. You can still confirm your booking.</p>';
      return;
    }

    const truckVol    = truck.length * truck.width * truck.height;
    const originCity  = _wizardStart?.label?.split(',')[0]?.trim() || '';
    const rateMatch   = findRate(data.rates || [], originCity, null, truck.id);
    const fullCost    = rateMatch
      ? rateMatch.ratePerKm * distance_km
      : truck.baseRate + truck.ratePerMi * distance_miles;
    const pct         = Math.min(totalVol / truckVol, 1);
    const baseCost    = _wizardShipping === 'shared'
      ? Math.max(fullCost * pct, fullCost * 0.25)
      : fullCost;
    const dgSurcharge = hasDG ? baseCost * 0.15 : 0;
    let   estimate    = baseCost + dgSurcharge + toll_cost;
    if (_wizardConsolidateTo) estimate = estimate * 0.85; // ~15% savings for joining

    _bookingEstimate = { estimate, totalUnits, totalWeight, hasDG, distance_km, toll_cost, totalVol, truck };

    // ── B5: Consolidation card ──
    let consolidationHtml = '';
    if (_wizardStart && _wizardDest) {
      try {
        const matches = await fetch('/api/bookings/available-trucks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromLat: _wizardStart.lat, fromLng: _wizardStart.lng,
            toLat:   _wizardDest.lat,  toLng:   _wizardDest.lng,
            neededWeight: totalWeight,  neededVol: totalVol,
          }),
        }).then(r => r.json());
        if (matches.length) {
          const m = matches[0];
          const plate = m.truck.licensePlate ? `· ${esc(m.truck.licensePlate)}` : '';
          consolidationHtml = `
            <div class="consolidation-card">
              <div class="consolidation-header">🚛 Shared truck available on this route</div>
              <div class="consolidation-body">
                <div>${esc(m.truck.name)} ${plate} · ${Math.round(m.remainingPct)}% capacity remaining</div>
                <div style="font-size:11px;color:var(--text2);margin-top:3px;">${esc(m.booking.route?.fromLabel || '')} → ${esc(m.booking.route?.toLabel || '')}</div>
              </div>
              <button class="btn-join-shipment" onclick="joinShipment(${m.booking.id})">Join this shipment → save ~15%</button>
            </div>`;
        }
      } catch (_) { /* consolidation is optional */ }
    }

    // ── B6: Dynamic truck swap card ──
    let truckSwapHtml = '';
    if (allTrucks.length > 1) {
      const suggestion = _portalSuggestTruck(allTrucks, totalWeight, totalVol, hasDG, hasFragile);
      const suggestedId = suggestion?.truck?.id;
      if (suggestion && suggestedId !== truck.id) {
        truckSwapHtml = `
          <div class="truck-swap-card">
            <div class="truck-swap-header">⚡ Suggested: ${esc(suggestion.truck.name)}</div>
            <div class="truck-swap-body">${esc(suggestion.reason)}</div>
            <button class="btn-use-truck" onclick="useTruck(${suggestion.truck.id})">Use this truck</button>
          </div>`;
      }
    }

    const sharedRow = _wizardShipping === 'shared'
      ? `<div class="charges-row"><span>Your share (${(pct * 100).toFixed(0)}%)</span><span>×${pct.toFixed(2)}</span></div>`
      : '';
    const joinRow = _wizardConsolidateTo
      ? `<div class="charges-row" style="color:var(--success);font-weight:700;"><span>🤝 Consolidation discount</span><span>−15%</span></div>`
      : '';
    const dgRow = hasDG
      ? `<div class="charges-row-dg"><span>⚠ DG surcharge (15%)</span><span>+$${Math.round(dgSurcharge).toLocaleString()}</span></div>`
      : '';
    const tollRow = toll_cost > 0
      ? `<div class="charges-row" style="color:#7c3aed;font-weight:700;"><span>🚦 Toll charges</span><span>+$${toll_cost.toFixed(2)}</span></div>`
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
      ${consolidationHtml}
      ${truckSwapHtml}
      ${dgWarning}
      <div class="charges-card">
        <div class="charges-section-lbl">📦 Cargo Summary</div>
        <div class="charges-row"><span>Total items</span><span>${items.length} type${items.length !== 1 ? 's' : ''} · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}</span></div>
        <div class="charges-row"><span>Total weight</span><span>${totalWeight.toLocaleString()} lbs</span></div>
        <div class="charges-row"><span>Total volume</span><span>${totalVol.toFixed(1)} cu ft</span></div>
        <div class="charges-row"><span>Route distance</span><span>${distance_km.toFixed(0)} km (${distance_miles.toFixed(0)} mi)</span></div>
        <div class="charges-row"><span>Truck</span><span>${esc(truck.name)}${truck.licensePlate ? ' · ' + esc(truck.licensePlate) : ''}</span></div>
        <div class="charges-row"><span>Truck utilization</span><span>${(pct * 100).toFixed(0)}% of capacity</span></div>
      </div>
      <div class="charges-card">
        <div class="charges-section-lbl">💰 Estimated Charges</div>
        ${rateMatch ? '' : `<div class="charges-row"><span>Base rate</span><span>$${truck.baseRate.toLocaleString()}</span></div>`}
        ${rateMatch
          ? `<div class="charges-row"><span>Per-km (${distance_km.toFixed(0)} km) — rate override</span><span>$${(rateMatch.ratePerKm * distance_km).toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>`
          : `<div class="charges-row"><span>Per-mile (${distance_miles.toFixed(0)} mi)</span><span>$${(truck.ratePerMi * distance_miles).toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>`
        }
        ${sharedRow}
        ${joinRow}
        ${dgRow}
        ${tollRow}
        <div class="charges-row charges-total">
          <span>Estimated Total</span>
          <span style="color:var(--primary);font-size:22px;letter-spacing:-0.4px;">$${Math.round(estimate).toLocaleString()}</span>
        </div>
        <p style="font-size:10px;color:var(--text2);margin-top:10px;line-height:1.6;">
          * Based on ${distance_km.toFixed(0)} km actual route. Final price confirmed at pickup.
        </p>
      </div>`;
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);font-size:12px;">Could not load rates: ${esc(e.message)}</p>`;
  }
}

async function confirmWebBooking() {
  const btn = document.querySelector('#bm-step-charges .btn-bm-confirm');
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

    const { estimate, totalUnits, totalWeight, hasDG, distance_km, toll_cost, totalVol, truck } = _bookingEstimate || {};

    // B7: Save booking to bookings API
    const truckId = (_wizardTruck || truck)?.id || (fresh.trucks?.[0]?.id);
    let consolidationMatches = [];
    if (truckId) {
      const bookingPayload = {
        truckId,
        shippingOption: _wizardShipping,
        route: {
          fromLabel:    _wizardStart?.label,
          fromLat:      _wizardStart?.lat,
          fromLng:      _wizardStart?.lng,
          toLabel:      _wizardDest?.label,
          toLat:        _wizardDest?.lat,
          toLng:        _wizardDest?.lng,
          distance_km:  _wizardRoute?.distance_km,
          duration_min: _wizardRoute?.duration_min,
          geometry:     _wizardRoute?.geometry,
        },
        customers:   _wizardCustomers,
        items:       items.map(i => ({ name: i.name, length: i.length, width: i.width, height: i.height, weight: i.weight, qty: i.qty })),
        totalWeight: totalWeight || 0,
        totalVol:    totalVol    || 0,
        ...((_wizardConsolidateTo != null) ? { parentBookingId: _wizardConsolidateTo } : {}),
      };
      try {
        const bRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload),
        }).then(r => r.json());
        consolidationMatches = bRes.consolidationMatches || [];
      } catch (_) {}
      // Refresh bookings panel if open
      const adminPanel = document.getElementById('admin-panel');
      if (adminPanel && adminPanel.style.display !== 'none') renderBookings();
    }

    const sumEl = document.getElementById('bm-confirm-summary');
    sumEl.innerHTML = `
      <div class="bm-confirm-grid">
        <div class="bcg-row"><span>Items submitted</span><span>${items.length} type${items.length !== 1 ? 's' : ''} · ${totalUnits || 0} units</span></div>
        <div class="bcg-row"><span>Total weight</span><span>${(totalWeight || 0).toLocaleString()} lbs</span></div>
        <div class="bcg-row"><span>Shipping type</span><span>${_wizardShipping === 'shared' ? '🤝 Share Truck (LTL)' : '🚚 Private Truck (FTL)'}</span></div>
        ${distance_km ? `<div class="bcg-row"><span>Route distance</span><span>${distance_km.toFixed(0)} km</span></div>` : ''}
        ${estimate != null ? `<div class="bcg-row"><span>Estimated cost</span><span style="color:var(--primary);font-weight:900;font-size:16px;">$${Math.round(estimate).toLocaleString()}</span></div>` : ''}
        ${toll_cost > 0 ? `<div class="bcg-row"><span>🚦 Tolls</span><span style="color:#7c3aed;font-weight:700;">$${toll_cost.toFixed(2)}</span></div>` : ''}
        ${hasDG ? `<div class="bcg-row"><span>DG note</span><span style="color:#c2410c;">⚠ DG-certified truck required</span></div>` : ''}
      </div>`;

    // Show consolidation matches banner if any overlapping routes were detected
    if (consolidationMatches.length) {
      const matchItems = consolidationMatches.map(m => {
        const plate = m.truck.licensePlate ? ` · ${esc(m.truck.licensePlate)}` : '';
        const route = m.booking.route ? `${esc(m.booking.route.fromLabel || '')} → ${esc(m.booking.route.toLabel || '')}` : '';
        return `<li style="margin-bottom:4px;">🚛 <strong>${esc(m.truck.name)}${plate}</strong> — ${Math.round(m.remainingPct)}% capacity free · <span style="font-size:11px;color:var(--text2);">${route}</span></li>`;
      }).join('');
      const consolidationBannerEl = document.getElementById('bm-consolidation-banner');
      if (consolidationBannerEl) {
        consolidationBannerEl.innerHTML = `
          <div class="consolidation-card" style="margin-bottom:14px;">
            <div class="consolidation-header">🔁 Route overlap detected — consolidation opportunity</div>
            <div class="consolidation-body">
              <p style="font-size:12px;color:var(--text2);margin:0 0 8px;">The following active bookings share a similar route with this shipment:</p>
              <ul style="margin:0;padding-left:16px;font-size:13px;">${matchItems}</ul>
              <p style="font-size:11px;color:var(--text2);margin:8px 0 0;">Consider scheduling these shipments together to reduce cost.</p>
            </div>
          </div>`;
        consolidationBannerEl.style.display = 'block';
      }
    }

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

// ── 3D Load Visualization ──────────────────────────────────────────────────────
function openViz3DModal() {
  fetch('/api/data').then(r => r.json()).then(data => {
    const trucks = data.trucks || [];
    if (!trucks.length) { alert('No trucks configured on the server yet.'); return; }

    const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
    const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
    const hasDG       = items.some(i => i.isDG);
    const hasFragile  = items.some(i => i.isFragile);
    const semi = trucks.find(t => t.maxWt >= 30000) || trucks[0];
    const box  = trucks.find(t => t.maxWt <  30000) || trucks[0];
    let truck = box;
    if (hasDG || totalWeight > box.maxWt || totalVol > box.length * box.width * box.height * 0.9) truck = semi;

    const html = buildViz3DHTML(items, truck, _wizardCustomers);
    document.getElementById('viz3d-frame').srcdoc = html;
    document.getElementById('viz3d-modal').classList.add('open');
  }).catch(e => alert('Could not load truck data: ' + e.message));
}

function closeViz3DModal() {
  document.getElementById('viz3d-modal').classList.remove('open');
  document.getElementById('viz3d-frame').srcdoc = '';
}

function viz3dOverlayClick(e) {
  if (e.target === document.getElementById('viz3d-modal')) closeViz3DModal();
}

function buildViz3DHTML(items, truck, customers) {
  const COLORS = [
    '#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6',
    '#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa',
  ];
  const nameColors = {};
  let ci = 0;
  items.forEach(i => { if (!nameColors[i.name]) nameColors[i.name] = COLORS[ci++ % COLORS.length]; });

  const hasCustomers = (customers || []).length > 0;
  const customerInfo = {};
  if (hasCustomers) {
    customers.forEach((c, idx) => {
      customerInfo[String(c.id)] = { name: c.name, color: COLORS[idx % COLORS.length] };
    });
  }

  const DATA = JSON.stringify({ items, truck, nameColors, hasCustomers, customerInfo });

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; overflow: hidden; background: #0f172a; font-family: Arial, sans-serif; }
    canvas { display: block; }
    #hint  { position:absolute; top:10px; left:0; right:0; text-align:center;
             color:#94a3b8; font-size:13px; pointer-events:none; }
    #info  { position:absolute; top:10px; left:10px; right:10px; display:none;
             align-items:center; gap:10px; background:rgba(15,23,42,0.92);
             padding:8px 14px; border-radius:10px; border:1px solid #3b82f6; }
    #iname { color:#f1f5f9; font-size:13px; font-weight:700; flex:1; }
    #ireset{ background:#1e3a5f; border:1px solid #3b82f6; color:#60a5fa;
             font-size:11px; font-weight:700; padding:5px 12px; border-radius:6px;
             cursor:pointer; white-space:nowrap; }
    #ireset:hover { background:#2563eb; color:#fff; }
    #stats { position:absolute; bottom:10px; left:12px; right:12px;
             color:#94a3b8; font-size:13px; background:rgba(15,23,42,0.8);
             padding:8px 14px; border-radius:10px; pointer-events:none; }
    #legend{ position:absolute; top:50px; right:12px; max-width:180px;
             background:rgba(15,23,42,0.9); border-radius:10px; padding:10px 12px;
             border:1px solid #1e3a5f; }
    .lrow  { display:flex; align-items:center; gap:7px; margin-bottom:5px; }
    .ldot  { width:13px; height:13px; border-radius:4px; flex-shrink:0; }
    .lname { color:#cbd5e1; font-size:12px; white-space:nowrap; overflow:hidden;
             text-overflow:ellipsis; max-width:145px; }
  </style>
</head>
<body>
<div id="hint">🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click a box to move it</div>
<div id="info"><span id="iname"></span><button id="ireset" onclick="resetPositions()">↺ Reset All</button><button id="ireset" onclick="deselect()" style="background:#1e3a5f;border:1px solid #475569;color:#94a3b8;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;cursor:pointer;">✕ Done</button></div>
<div id="stats">Packing…</div>
<div id="legend"></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.134/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.134/examples/js/controls/OrbitControls.js"></script>
<script>
const DATA = ${DATA};
const truck = DATA.truck;
const TL = truck.length, TH = truck.height, TW = truck.width;

function pack(items) {
  const boxes = [];
  items.forEach(item => {
    const qty = Math.max(1, parseInt(item.qty) || 1);
    for (let q = 0; q < qty; q++) {
      boxes.push({
        name:       item.name,
        customerId: item.customerId || null,
        il: parseFloat(item.length) || 1,
        ih: parseFloat(item.height) || 1,
        iw: parseFloat(item.width)  || 1,
        stackable: item.stackable !== false,
        isFragile: item.isFragile || false,
        isDG:      item.isDG || false,
      });
    }
  });

  boxes.sort((a, b) => {
    if (!a.stackable && b.stackable) return -1;
    if (a.stackable && !b.stackable) return  1;
    if (!a.isFragile && b.isFragile) return -1;
    if (a.isFragile && !b.isFragile) return  1;
    return (b.il * b.ih * b.iw) - (a.il * a.ih * a.iw);
  });

  const placements = [], unplaced = [];
  let spaces = [{ x:0, y:0, z:0, l:TL, h:TH, w:TW }];

  for (const box of boxes) {
    const orients = [
      [box.il, box.ih, box.iw], [box.iw, box.ih, box.il],
      [box.il, box.iw, box.ih], [box.iw, box.il, box.ih],
      [box.ih, box.il, box.iw], [box.ih, box.iw, box.il],
    ];
    const sorted = spaces.slice().sort((a, b) => {
      if (box.isFragile) return b.y - a.y || (a.l*a.h*a.w) - (b.l*b.h*b.w);
      return a.y - b.y || (a.l*a.h*a.w) - (b.l*b.h*b.w);
    });
    let placed = false;
    for (const sp of sorted) {
      for (const [ol, oh, ow] of orients) {
        if (ol > sp.l + 0.001 || oh > sp.h + 0.001 || ow > sp.w + 0.001) continue;
        placements.push({ x:sp.x, y:sp.y, z:sp.z, l:ol, h:oh, w:ow,
          name: box.name, customerId: box.customerId,
          stackable: box.stackable, isFragile: box.isFragile, isDG: box.isDG });
        spaces = spaces.filter(s => s !== sp);
        const rl = sp.l - ol, rw = sp.w - ow, rh = sp.h - oh;
        if (rl >= rw) {
          if (rl > 0.01) spaces.push({ x:sp.x+ol, y:sp.y, z:sp.z, l:rl, h:sp.h, w:sp.w });
          if (rw > 0.01) spaces.push({ x:sp.x, y:sp.y, z:sp.z+ow, l:ol, h:sp.h, w:rw });
        } else {
          if (rw > 0.01) spaces.push({ x:sp.x, y:sp.y, z:sp.z+ow, l:sp.l, h:sp.h, w:rw });
          if (rl > 0.01) spaces.push({ x:sp.x+ol, y:sp.y, z:sp.z, l:rl, h:oh, w:ow });
        }
        if (rh > 0.01 && box.stackable && !box.isFragile) {
          spaces.push({ x:sp.x, y:sp.y+oh, z:sp.z, l:ol, h:rh, w:ow });
        }
        placed = true; break;
      }
      if (placed) break;
    }
    if (!placed) unplaced.push(box);
  }
  return { placements, unplaced };
}

const { placements, unplaced } = pack(DATA.items);

const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
const camera   = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.12;
controls.minDistance = 1; controls.maxDistance = 500;
controls.zoomSpeed = 1.5;

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const sun = new THREE.DirectionalLight(0xffffff, 0.85);
sun.position.set(TL*0.8, TH*3, TW*1.5); scene.add(sun);
const fill = new THREE.DirectionalLight(0x6688cc, 0.3);
fill.position.set(-TL, TH, -TW); scene.add(fill);

const truckCenter = new THREE.Vector3(TL/2, TH/2, TW/2);
const wallMat = new THREE.MeshLambertMaterial({ color:0x1e3a5f, opacity:0.12, transparent:true, side:THREE.BackSide });
const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(TL,TH,TW), wallMat);
wallMesh.position.copy(truckCenter); scene.add(wallMesh);
const truckEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(TL,TH,TW));
const truckLine  = new THREE.LineSegments(truckEdges, new THREE.LineBasicMaterial({ color:0x3b82f6, opacity:0.7, transparent:true }));
truckLine.position.copy(truckCenter); scene.add(truckLine);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(TL,TW), new THREE.MeshLambertMaterial({ color:0x0f2a4a, side:THREE.DoubleSide }));
floor.rotation.x = -Math.PI/2; floor.position.set(TL/2, 0.001, TW/2); scene.add(floor);
const grid = new THREE.GridHelper(Math.max(TL,TW)*1.05, 20, 0x1e3a5f, 0x1e3a5f);
grid.position.set(TL/2, 0.002, TW/2); scene.add(grid);

// Truck dimension annotations (permanent, amber) — one on each side
const truckDimGrp = new THREE.Group();
// LENGTH — bottom edge of the visible long side (z=TW face), pushed downward
dimLine(truckDimGrp,
  new THREE.Vector3(0, 0, TW), new THREE.Vector3(TL, 0, TW),
  new THREE.Vector3(0, -1, 0));
// BREADTH — bottom edge of the right end face (x=TL), pushed outward in +X
dimLine(truckDimGrp,
  new THREE.Vector3(TL, 0, 0), new THREE.Vector3(TL, 0, TW),
  new THREE.Vector3(1, 0, 0));
// HEIGHT — near-right vertical edge (x=TL, z=TW), pushed out diagonally
dimLine(truckDimGrp,
  new THREE.Vector3(TL, 0, TW), new THREE.Vector3(TL, TH, TW),
  new THREE.Vector3(1, 0, 1));
scene.add(truckDimGrp);

function hexToRgb(hex) { const n=parseInt(hex.replace('#',''),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function makeLabel(text, hexColor, lineTwo, dimText) {
  // Canvas height depends on how many lines: name / subLabel / dimensions
  const CW = 1024;
  const CH = lineTwo ? (dimText ? 430 : 320) : (dimText ? 290 : 200);
  const canvas=document.createElement('canvas'); canvas.width=CW; canvas.height=CH;
  const ctx=canvas.getContext('2d');
  const [r,g,b]=hexToRgb(hexColor);
  const dr=Math.max(0,r-60),dg=Math.max(0,g-60),db=Math.max(0,b-60);
  ctx.fillStyle='rgba('+dr+','+dg+','+db+',0.93)';
  const rd=20; ctx.beginPath();
  ctx.moveTo(rd,0); ctx.lineTo(CW-rd,0); ctx.quadraticCurveTo(CW,0,CW,rd);
  ctx.lineTo(CW,CH-rd); ctx.quadraticCurveTo(CW,CH,CW-rd,CH);
  ctx.lineTo(rd,CH); ctx.quadraticCurveTo(0,CH,0,CH-rd);
  ctx.lineTo(0,rd); ctx.quadraticCurveTo(0,0,rd,0); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba('+r+','+g+','+b+',0.7)'; ctx.fillRect(0,0,CW,10);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  // Line 1 — item name
  ctx.fillStyle='#ffffff'; ctx.font='bold 72px Arial';
  let t=text; while(t.length>1&&ctx.measureText(t).width>CW-40) t=t.slice(0,-1);
  if(t!==text) t+='\u2026';
  const nameY = lineTwo ? 85 : (dimText ? 85 : CH/2);
  ctx.fillText(t, CW/2, nameY);
  // Line 2 — customer / DG / fragile sub-label
  if(lineTwo) {
    ctx.fillStyle='rgba(255,255,255,0.80)'; ctx.font='bold 54px Arial';
    let t2=lineTwo; while(t2.length>1&&ctx.measureText(t2).width>CW-40) t2=t2.slice(0,-1);
    if(t2!==lineTwo) t2+='\u2026';
    ctx.fillText(t2, CW/2, dimText ? 205 : 220);
  }
  // Line 3 — dimensions
  if(dimText) {
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='40px Arial';
    ctx.fillText(dimText, CW/2, lineTwo ? 340 : 205);
  }
  const tex=new THREE.CanvasTexture(canvas);
  const mat=new THREE.SpriteMaterial({ map:tex, transparent:true, depthTest:false, depthWrite:false });
  const sprite=new THREE.Sprite(mat);
  return sprite;
}

// ── Dimension annotation helpers ─────────────────────────────────────────────
function makeDimSprite(text, lineLen) {
  const CW=320, CH=72;
  const canvas=document.createElement('canvas'); canvas.width=CW; canvas.height=CH;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='rgba(10,18,36,0.82)';
  const rd=10; ctx.beginPath();
  ctx.moveTo(rd,0); ctx.lineTo(CW-rd,0); ctx.quadraticCurveTo(CW,0,CW,rd);
  ctx.lineTo(CW,CH-rd); ctx.quadraticCurveTo(CW,CH,CW-rd,CH);
  ctx.lineTo(rd,CH); ctx.quadraticCurveTo(0,CH,0,CH-rd);
  ctx.lineTo(0,rd); ctx.quadraticCurveTo(0,0,rd,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(251,191,36,0.6)'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#fbbf24'; ctx.font='bold 44px Arial';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, CW/2, CH/2);
  const t=new THREE.CanvasTexture(canvas);
  const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,depthWrite:false});
  const sp=new THREE.Sprite(m);
  const w=Math.max(lineLen*0.55, 1.1); sp.scale.set(w, w*(CH/CW), 1);
  return sp;
}

function dimLine(grp, from, to, perpDir, color) {
  const clr = color || 0xfbbf24;
  const pd  = perpDir.clone().normalize();
  const OFF = 0.55, TICK = 0.32;
  const f   = from.clone().add(pd.clone().multiplyScalar(OFF));
  const t2  = to.clone().add(pd.clone().multiplyScalar(OFF));
  const lm  = new THREE.LineBasicMaterial({color:clr});
  const em  = new THREE.LineBasicMaterial({color:clr, opacity:0.35, transparent:true});
  // main line
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([f,t2]), lm));
  // extension lines from surface corners to the dim line
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from.clone(),f.clone()]), em));
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([to.clone(),t2.clone()]), em));
  // tick marks (perpendicular to dim line, lying in the offset plane)
  const lineDir = t2.clone().sub(f).normalize();
  const tickDir = new THREE.Vector3().crossVectors(lineDir, pd).normalize().multiplyScalar(TICK);
  [f,t2].forEach(pt => {
    grp.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([pt.clone().sub(tickDir), pt.clone().add(tickDir)]), lm
    ));
  });
  // measurement label at midpoint, pushed a little further out
  const mid = f.clone().add(t2).multiplyScalar(0.5).add(pd.clone().multiplyScalar(0.35));
  const dist = parseFloat(from.distanceTo(to).toFixed(1));
  const sp = makeDimSprite(dist + ' ft', dist);
  sp.position.copy(mid);
  grp.add(sp);
}
// ─────────────────────────────────────────────────────────────────────────────

const boxObjects = [];
placements.forEach(p => {
  const custKey = p.customerId != null ? String(p.customerId) : null;
  const color = DATA.hasCustomers && custKey && DATA.customerInfo[custKey]
    ? DATA.customerInfo[custKey].color : (DATA.nameColors[p.name] || '#64748b');
  const gap=0.04;
  const geo=new THREE.BoxGeometry(Math.max(p.l-gap,0.05),Math.max(p.h-gap,0.05),Math.max(p.w-gap,0.05));
  const mat=new THREE.MeshLambertMaterial({ color, opacity:0.80, transparent:true });
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(p.x+p.l/2, p.y+p.h/2, p.z+p.w/2); scene.add(mesh);
  const edgeMat=new THREE.LineBasicMaterial({ color:0xffffff, opacity:0.18, transparent:true });
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMat);
  edges.position.copy(mesh.position); scene.add(edges);
  const custName = DATA.hasCustomers && custKey && DATA.customerInfo[custKey] ? DATA.customerInfo[custKey].name : null;
  const subLabel = custName ? '\uD83D\uDC64 '+custName : p.isDG ? '\u26a0 Dangerous Goods' : p.isFragile ? '\uD83D\uDD14 Handle with care' : null;
  const dimText  = p.l + '\xD7' + p.w + '\xD7' + p.h + ' ft';
  const sprite=makeLabel(p.name, color, subLabel, dimText);
  const sw=Math.max(Math.min(p.l,p.w)*1.1, 1.8);
  const CH = subLabel ? 430 : 290;
  sprite.scale.set(sw, sw*(CH/1024), 1);
  sprite.position.set(p.x+p.l/2, p.y+p.h/2, p.z+p.w/2); scene.add(sprite);
  // store for drag interaction
  const origPos = new THREE.Vector3(p.x+p.l/2, p.y+p.h/2, p.z+p.w/2);
  boxObjects.push({ mesh, edges, sprite, mat, placement:p, origPos });
});

const legendEl=document.getElementById('legend');
if(DATA.hasCustomers) {
  Object.values(DATA.customerInfo).forEach(function(ci) {
    const row=document.createElement('div'); row.className='lrow';
    row.innerHTML='<div class="ldot" style="background:'+ci.color+'"></div><span class="lname">'+ci.name+'</span>';
    legendEl.appendChild(row);
  });
} else {
  const seen={};
  placements.forEach(p => { seen[p.name]=DATA.nameColors[p.name]||'#64748b'; });
  Object.entries(seen).forEach(function([name,color]) {
    const row=document.createElement('div'); row.className='lrow';
    row.innerHTML='<div class="ldot" style="background:'+color+'"></div><span class="lname">'+name+'</span>';
    legendEl.appendChild(row);
  });
}

const totalUnits=DATA.items.reduce((s,i)=>s+(parseInt(i.qty)||1),0);
const placedVol=placements.reduce((s,p)=>s+p.l*p.h*p.w,0);
const truckVol=TL*TH*TW;
const utilPct=Math.min(Math.round(placedVol/truckVol*100),100);
const statsEl=document.getElementById('stats');
statsEl.innerHTML=
  '<span style="color:#60a5fa;font-weight:700;">\uD83D\uDE9B '+truck.name+'</span>'
  +' &nbsp;\u00B7&nbsp; <span style="color:#94a3b8;">'+TL+'\xD7'+TW+'\xD7'+TH+' ft</span>'
  +' &nbsp;\u00B7&nbsp; <span style="color:#cbd5e1;">'+truck.maxWt.toLocaleString()+' lbs max</span>'
  +' &nbsp;|\u2009 '+placements.length+'/'+totalUnits+' units placed'
  +' &nbsp;\u00B7&nbsp; '+utilPct+'% vol used'
  +(unplaced.length?' &nbsp;\u00B7&nbsp; <span style="color:#fbbf24">\u26a0 '+unplaced.length+' unplaced</span>':'');

// Position camera so truck CROSS-SECTION (H×W face) fills 70% of viewport.
// Using cross-section diagonal instead of full 3D diagonal prevents the truck's
// length from pushing the camera too far away (which made the truck look tiny).
const crossDiag = Math.sqrt(TH*TH + TW*TW);
const fovRad    = 28 * Math.PI / 180;
const camDist   = crossDiag / (2 * Math.tan(fovRad / 2) * 0.70);
const dn        = Math.sqrt(0.55*0.55 + 0.55*0.55 + 0.85*0.85); // ≈ 1.152
camera.position.set(
  truckCenter.x + camDist * 0.55 / dn,
  truckCenter.y + camDist * 0.55 / dn,
  truckCenter.z + camDist * 0.85 / dn
);
camera.lookAt(truckCenter); controls.target.copy(truckCenter); controls.update();

// ── Drag-to-move interaction ──────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse2d   = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const dragStart = new THREE.Vector3();
const objStart  = new THREE.Vector3();
let selected    = null;
let isDragging  = false;

// ── Box dimension annotations (shown on select, hidden on deselect) ──────────
let boxDimGrp = null;
function showBoxDims(obj) {
  if (boxDimGrp) { scene.remove(boxDimGrp); boxDimGrp = null; }
  const p = obj.placement;
  // Use current mesh position so dims follow if box was moved
  const mx = obj.mesh.position.x - p.l/2;
  const my = obj.mesh.position.y - p.h/2;
  const mz = obj.mesh.position.z - p.w/2;
  boxDimGrp = new THREE.Group();
  // Length — bottom front edge, offset -Z (cyan to distinguish from truck)
  dimLine(boxDimGrp,
    new THREE.Vector3(mx,      my, mz),
    new THREE.Vector3(mx+p.l,  my, mz),
    new THREE.Vector3(0, 0, -1), 0x22d3ee);
  // Width — bottom right edge, offset +X
  dimLine(boxDimGrp,
    new THREE.Vector3(mx+p.l, my,    mz),
    new THREE.Vector3(mx+p.l, my,    mz+p.w),
    new THREE.Vector3(1, 0, 0), 0x22d3ee);
  // Height — right front vertical edge, offset +X -Z
  dimLine(boxDimGrp,
    new THREE.Vector3(mx+p.l, my,    mz),
    new THREE.Vector3(mx+p.l, my+p.h, mz),
    new THREE.Vector3(1, 0, -1), 0x22d3ee);
  scene.add(boxDimGrp);
}
function hideBoxDims() {
  if (boxDimGrp) { scene.remove(boxDimGrp); boxDimGrp = null; }
}
// ─────────────────────────────────────────────────────────────────────────────

function deselect() {
  if (selected) {
    selected.mat.emissive.set(0x000000);
    selected.mat.opacity = 0.80;
    selected.edges.material.opacity = 0.18;
    selected = null;
  }
  hideBoxDims();
  document.getElementById('hint').style.display = '';
  document.getElementById('info').style.display = 'none';
  controls.enabled = true;
}

function selectObj(obj) {
  if (selected && selected !== obj) deselect();
  selected = obj;
  obj.mat.emissive = new THREE.Color(0x334466);
  obj.mat.opacity = 1.0;
  obj.edges.material.opacity = 0.6;
  showBoxDims(obj);
  document.getElementById('hint').style.display = 'none';
  document.getElementById('info').style.display = 'flex';
  const p2=obj.placement;
  document.getElementById('iname').textContent = '✏ ' + p2.name + '  \u2014  ' + p2.l + '\xD7' + p2.w + '\xD7' + p2.h + ' ft  \u00B7  drag to reposition';
}

function resetPositions() {
  boxObjects.forEach(o => {
    o.mesh.position.copy(o.origPos);
    o.edges.position.copy(o.origPos);
    o.sprite.position.copy(o.origPos);
  });
  deselect();
}

function getMouseNDC(e) {
  const r = renderer.domElement.getBoundingClientRect();
  mouse2d.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
  mouse2d.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  getMouseNDC(e);
  raycaster.setFromCamera(mouse2d, camera);
  const hits = raycaster.intersectObjects(boxObjects.map(o => o.mesh));
  if (hits.length) {
    const obj = boxObjects.find(o => o.mesh === hits[0].object);
    selectObj(obj);
    controls.enabled = false;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), hits[0].point);
    raycaster.ray.intersectPlane(dragPlane, dragStart);
    objStart.copy(obj.mesh.position);
    isDragging = true;
    e.stopPropagation();
  } else {
    deselect();
  }
});

renderer.domElement.addEventListener('pointermove', e => {
  if (!isDragging || !selected) return;
  getMouseNDC(e);
  raycaster.setFromCamera(mouse2d, camera);
  const pt = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(dragPlane, pt)) return;
  const delta = pt.clone().sub(dragStart);
  const np = objStart.clone().add(delta);
  const p = selected.placement;
  np.x = Math.max(p.l/2, Math.min(TL - p.l/2, np.x));
  np.y = Math.max(p.h/2, Math.min(TH - p.h/2, np.y));
  np.z = Math.max(p.w/2, Math.min(TW - p.w/2, np.z));
  selected.mesh.position.copy(np);
  selected.edges.position.copy(np);
  selected.sprite.position.copy(np);
});

renderer.domElement.addEventListener('pointerup', () => { isDragging = false; });
window.addEventListener('keydown', e => { if (e.key === 'Escape') deselect(); });
// ─────────────────────────────────────────────────────────────────────────────

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }
animate();
window.addEventListener('resize',()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
</script>
</body>
</html>`;
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
    const plateBadge = t.licensePlate
      ? `<span class="plate-badge">${esc(t.licensePlate)}</span>`
      : `<span class="plate-badge" style="color:var(--text2);">—</span>`;
    rows.push(`
      <div class="ctx-row">
        <span style="font-size:16px;">🚛</span>
        <div style="flex:1;min-width:0;">
          <div class="ctx-name">${esc(t.name)} ${plateBadge}</div>
          <div class="ctx-meta">${t.length}×${t.width}×${t.height} ft · ${(t.maxWt || 0).toLocaleString()} lbs max · $${t.baseRate}/base + $${t.ratePerMi}/mi</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn-fleet-edit" onclick="openTruckForm(${t.id})">✏</button>
          <button class="btn-fleet-del"  onclick="deleteTruck(${t.id})">🗑</button>
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

// ── Admin Panel ───────────────────────────────────────────────────────────────
function toggleAdminPanel() {
  const p = document.getElementById('admin-panel');
  if (!p) return;
  p.style.display = p.style.display === 'none' ? 'flex' : 'none';
  if (p.style.display === 'flex') renderBookings();
}

function adminPanelBackdropClick(e) {
  if (e.target === document.getElementById('admin-panel')) toggleAdminPanel();
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('active'));
  const pane = document.getElementById('tab-' + tab);
  if (pane) pane.style.display = 'block';
  const btns = document.querySelectorAll('.admin-tab-btn');
  btns.forEach(b => { if (b.textContent.toLowerCase().includes(tab.slice(0, 4))) b.classList.add('active'); });
  if (tab === 'bookings') renderBookings();
  if (tab === 'rates') renderRates();
}

function openTruckForm(truckId) {
  const t = trucks.find(x => x.id === truckId);
  if (!t) return;
  document.getElementById('tf-form-title').textContent = '✏ Edit Truck';
  document.getElementById('tf-name').value         = t.name || '';
  document.getElementById('tf-length').value       = t.length || 53;
  document.getElementById('tf-width').value        = t.width  || 8.5;
  document.getElementById('tf-height').value       = t.height || 9;
  document.getElementById('tf-maxwt').value        = t.maxWt  || 44000;
  document.getElementById('tf-base-rate').value   = t.baseRate   || 600;
  document.getElementById('tf-rate-per-mi').value = t.ratePerMi  || 3.50;
  document.getElementById('tf-plate').value        = t.licensePlate || '';
  document.getElementById('tf-edit-id').value      = truckId;
  document.getElementById('tf-cancel-btn').style.display = 'inline-block';
  showAdminTab('fleet');
}

function closeTruckForm() {
  document.getElementById('tf-form-title').textContent = '＋ Add Truck';
  document.getElementById('tf-name').value         = '';
  document.getElementById('tf-length').value       = 53;
  document.getElementById('tf-width').value        = 8.5;
  document.getElementById('tf-height').value       = 9;
  document.getElementById('tf-maxwt').value        = 44000;
  document.getElementById('tf-base-rate').value   = 600;
  document.getElementById('tf-rate-per-mi').value = 3.50;
  document.getElementById('tf-plate').value        = '';
  document.getElementById('tf-edit-id').value      = '';
  document.getElementById('tf-cancel-btn').style.display = 'none';
}

async function saveTruck() {
  const name         = document.getElementById('tf-name').value.trim();
  const length       = parseFloat(document.getElementById('tf-length').value)       || 53;
  const width        = parseFloat(document.getElementById('tf-width').value)        || 8.5;
  const height       = parseFloat(document.getElementById('tf-height').value)       || 9;
  const maxWt        = parseFloat(document.getElementById('tf-maxwt').value)        || 44000;
  const baseRate     = parseFloat(document.getElementById('tf-base-rate').value)   || 600;
  const ratePerMi   = parseFloat(document.getElementById('tf-rate-per-mi').value) || 3.50;
  const licensePlate = document.getElementById('tf-plate').value.trim().toUpperCase();
  const editId       = parseInt(document.getElementById('tf-edit-id').value, 10) || 0;

  if (!name) { alert('Truck name is required.'); return; }

  const existing = trucks.find(t => t.id === editId);
  if (existing) {
    Object.assign(existing, { name, length, width, height, maxWt, baseRate, ratePerMi, licensePlate });
  } else {
    trucks.push({ id: nextIds.truck++, name, length, width, height, maxWt, baseRate, ratePerMi, licensePlate });
  }
  await saveToServer();
  closeTruckForm();
  renderFleetList();
}

async function deleteTruck(id) {
  if (!confirm('Delete this truck?')) return;
  trucks = trucks.filter(t => t.id !== id);
  await saveToServer();
  renderFleetList();
}

// ── Rates CRUD ────────────────────────────────────────────────────────────────

function findRate(rateList, city, carrierId, truckRef) {
  const score = r =>
    (r.city      ? (r.city === city                            ? 4 : -99) : 0) +
    (r.carrierId != null ? (r.carrierId === carrierId          ? 2 : -99) : 0) +
    (r.truckRef  != null ? (r.truckRef  === truckRef           ? 1 : -99) : 0);
  const matches = (rateList || []).filter(r => score(r) >= 0);
  if (!matches.length) return null;
  return matches.reduce((best, r) => score(r) > score(best) ? r : best, matches[0]);
}

function renderRates() {
  // Populate carrier dropdown
  const carrierSel = document.getElementById('rf-carrier');
  if (carrierSel) {
    // Preserve existing value
    const cur = carrierSel.value;
    carrierSel.innerHTML = '<option value="">— Any carrier (incl. own fleet) —</option><option value="own">Own Fleet</option>';
    carriers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      carrierSel.appendChild(opt);
    });
    carrierSel.value = cur;
  }
  populateRateTruckDropdown(document.getElementById('rf-carrier')?.value || '');

  const list = document.getElementById('p-rates-list');
  if (!list) return;
  if (!rates.length) {
    list.innerHTML = '<p style="font-size:12px;color:var(--text2);">No rates configured. Add one above.</p>';
    return;
  }
  const rows = rates.map(r => {
    const carrierName = r.carrierId === null
      ? (r.truckRef != null ? 'Own Fleet' : 'Any carrier')
      : (carriers.find(c => c.id === r.carrierId)?.name || `Carrier #${r.carrierId}`);
    let truckName = 'Any truck';
    if (r.truckRef != null) {
      if (r.carrierId === null) {
        truckName = trucks.find(t => t.id === r.truckRef)?.name || `Truck #${r.truckRef}`;
      } else {
        const carr = carriers.find(c => c.id === r.carrierId);
        truckName = carr?.trucks?.find(t => t.tid === r.truckRef)?.name || `Truck #${r.truckRef}`;
      }
    }
    return `<div class="ctx-row">
      <div style="flex:1;min-width:0;">
        <div class="ctx-name">${esc(r.city || 'Any city')}</div>
        <div class="ctx-meta">${esc(carrierName)} · ${esc(truckName)}</div>
        <div class="ctx-meta">$${r.ratePerKm}/km</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button class="btn-fleet-edit" onclick="openRateForm(${r.id})">✏</button>
        <button class="btn-fleet-del"  onclick="deleteRate(${r.id})">🗑</button>
      </div>
    </div>`;
  });
  list.innerHTML = '<div class="ctx-list">' + rows.join('') + '</div>';
}

function populateRateTruckDropdown(carrierVal) {
  const sel = document.getElementById('rf-truck');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Any truck —</option>';
  if (carrierVal === 'own') {
    trucks.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
  } else if (carrierVal) {
    const carr = carriers.find(c => c.id === Number(carrierVal));
    (carr?.trucks || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.tid;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
  }
}

function onRateCarrierChange() {
  populateRateTruckDropdown(document.getElementById('rf-carrier').value);
}

function openRateForm(rateId) {
  const r = rates.find(x => x.id === rateId);
  if (!r) return;

  // Show tab first — renderRates() rebuilds the carrier dropdown, so set values after
  showAdminTab('rates');

  document.getElementById('rf-form-title').textContent = '✏ Edit Rate';
  document.getElementById('rf-city').value        = r.city || '';
  document.getElementById('rf-rate-per-km').value = r.ratePerKm;
  document.getElementById('rf-edit-id').value     = rateId;
  document.getElementById('rf-cancel-btn').style.display = 'inline-block';

  // Set carrier dropdown then repopulate trucks based on it
  const carrierSel = document.getElementById('rf-carrier');
  if (r.carrierId === null && r.truckRef != null) carrierSel.value = 'own';
  else if (r.carrierId != null) carrierSel.value = r.carrierId;
  else carrierSel.value = '';
  populateRateTruckDropdown(carrierSel.value);

  // Set truck dropdown after options are populated
  const truckSel = document.getElementById('rf-truck');
  truckSel.value = r.truckRef != null ? r.truckRef : '';
}

function closeRateForm() {
  document.getElementById('rf-form-title').textContent = '＋ Add Rate';
  document.getElementById('rf-city').value        = '';
  document.getElementById('rf-carrier').value     = '';
  document.getElementById('rf-rate-per-km').value = '2.50';
  document.getElementById('rf-edit-id').value     = '';
  document.getElementById('rf-cancel-btn').style.display = 'none';
  populateRateTruckDropdown('');
}

async function saveRate() {
  const city       = document.getElementById('rf-city').value.trim();
  const carrierVal = document.getElementById('rf-carrier').value;
  const truckVal   = document.getElementById('rf-truck').value;
  const ratePerKm  = parseFloat(document.getElementById('rf-rate-per-km').value);
  const editId     = document.getElementById('rf-edit-id').value;

  if (isNaN(ratePerKm) || ratePerKm <= 0) {
    alert('Please enter a valid rate per km.');
    return;
  }

  const carrierId = carrierVal === '' ? null : (carrierVal === 'own' ? null : Number(carrierVal));
  const truckRef  = truckVal === '' ? null : Number(truckVal);
  // For own-fleet trucks, carrierId stays null but truckRef points to truck.id
  // For carrier trucks, carrierId is set and truckRef is the tid

  // Dedup check
  const dupId = rates.find(r =>
    (r.city || '') === city &&
    r.carrierId === carrierId &&
    r.truckRef  === truckRef &&
    r.id !== Number(editId || -1)
  )?.id;

  if (dupId != null) {
    if (!confirm('A rate with the same city + carrier + truck already exists. Replace it?')) return;
    rates = rates.filter(r => r.id !== dupId);
  }

  if (editId) {
    const existing = rates.find(r => r.id === Number(editId));
    if (existing) Object.assign(existing, { city: city || null, carrierId, truckRef, ratePerKm });
  } else {
    if (!nextIds.rate) nextIds.rate = 1;
    rates.push({ id: nextIds.rate++, city: city || null, carrierId, truckRef, ratePerKm });
  }

  await saveToServer();
  closeRateForm();
  renderRates();
}

async function deleteRate(id) {
  if (!confirm('Delete this rate?')) return;
  rates = rates.filter(r => r.id !== id);
  await saveToServer();
  renderRates();
}

// ── Bookings ──────────────────────────────────────────────────────────────────
async function renderBookings() {
  const el = document.getElementById('bookings-list');
  if (!el) return;
  el.innerHTML = '<p style="font-size:12px;color:var(--text2);text-align:center;padding:12px;">Loading…</p>';
  try {
    const [bookingsList, storeData] = await Promise.all([
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/data').then(r => r.json()),
    ]);
    if (!bookingsList.length) {
      el.innerHTML = '<p style="font-size:12px;color:var(--text2);padding:12px 0;">No bookings yet.</p>';
      return;
    }
    const allTrucks = storeData.trucks || [];
    el.innerHTML = bookingsList.map(b => {
      const t        = allTrucks.find(x => x.id === b.truckId);
      const tName    = t ? esc(t.name) : '<em style="color:var(--text2);">[Truck deleted]</em>';
      const plate    = t?.licensePlate ? `<span class="plate-badge">${esc(t.licensePlate)}</span>` : '';
      const truckVol = t ? t.length * t.width * t.height : 0;
      const wtPct    = t ? Math.min(100, Math.round((b.totalWeight || 0) / t.maxWt * 100)) : 0;
      const volPct   = truckVol > 0 ? Math.min(100, Math.round((b.totalVol || 0) / truckVol * 100)) : 0;
      const dist     = b.route?.distance_km ? `${b.route.distance_km} km` : '—';
      const statusCls = b.status === 'active' ? 'status-active' : b.status === 'completed' ? 'status-completed' : 'status-cancelled';
      const date     = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—';
      const fromLbl  = esc(b.route?.fromLabel || '—');
      const toLbl    = esc(b.route?.toLabel   || '—');
      const cancelBtn = b.status === 'active'
        ? `<button class="btn-cancel-booking" onclick="cancelBooking(${b.id})">Cancel</button>` : '';
      return `
        <div class="booking-card">
          <div class="booking-card-head">
            <div>
              <span class="booking-truck-name">${tName}</span> ${plate}
              <span class="booking-status ${statusCls}">${b.status}</span>
            </div>
            <span class="booking-date">${date}</span>
          </div>
          <div class="booking-route">${fromLbl} → ${toLbl} · ${dist}</div>
          <div class="booking-load-row">
            <span class="booking-load-label">Weight: ${(b.totalWeight || 0).toLocaleString()} lbs${t ? ' / ' + t.maxWt.toLocaleString() + ' lbs' : ''}</span>
            <div class="load-bar-wrap"><div class="load-bar" style="width:${wtPct}%;background:${wtPct >= 90 ? 'var(--danger)' : wtPct >= 70 ? 'var(--warning)' : 'var(--success)'};"></div></div>
          </div>
          <div class="booking-load-row">
            <span class="booking-load-label">Volume: ${(b.totalVol || 0).toFixed(0)} cu ft${truckVol ? ' / ' + truckVol.toFixed(0) + ' cu ft' : ''}</span>
            <div class="load-bar-wrap"><div class="load-bar" style="width:${volPct}%;background:${volPct >= 90 ? 'var(--danger)' : volPct >= 70 ? 'var(--warning)' : 'var(--primary)'};"></div></div>
          </div>
          <div class="booking-card-foot">${cancelBtn}</div>
        </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);font-size:12px;">Could not load bookings: ${esc(e.message)}</p>`;
  }
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  renderBookings();
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

// ── Excel Import ─────────────────────────────────────────────────────────────

const IMPORT_SCHEMAS = {
  trucks: {
    headers: ['Name', 'Length (ft)', 'Width (ft)', 'Height (ft)', 'Max Weight (lbs)', 'Base Rate ($)', 'Rate/Mile ($/mi)', 'License Plate'],
    example:  ['Semi Truck A', 53, 8.5, 9, 44000, 600, 3.50, 'TRK-001'],
    map: r => ({
      name:         String(r['Name'] || '').trim(),
      length:       parseFloat(r['Length (ft)'])      || 0,
      width:        parseFloat(r['Width (ft)'])       || 0,
      height:       parseFloat(r['Height (ft)'])      || 0,
      maxWt:        parseFloat(r['Max Weight (lbs)']) || 0,
      baseRate:     parseFloat(r['Base Rate ($)'])    || 0,
      ratePerMi:    parseFloat(r['Rate/Mile ($/mi)']) || 0,
      licensePlate: String(r['License Plate'] || '').trim().toUpperCase(),
    }),
    validate: r => r.name && r.length > 0 && r.width > 0 && r.height > 0,
    display:  r => [r.name, r.length, r.width, r.height, r.maxWt.toLocaleString(), '$' + r.baseRate, '$' + r.ratePerMi + '/mi', r.licensePlate || '—'],
  },
  items: {
    headers: ['Name', 'Length (ft)', 'Width (ft)', 'Height (ft)', 'Weight (lbs)', 'Qty', 'Stackable', 'Dangerous Goods'],
    example:  ['Standard Pallet', 4, 4, 5, 2000, 8, 'yes', 'no'],
    map: r => ({
      name:      String(r['Name'] || '').trim(),
      length:    parseFloat(r['Length (ft)'])   || 0,
      width:     parseFloat(r['Width (ft)'])    || 0,
      height:    parseFloat(r['Height (ft)'])   || 0,
      weight:    parseFloat(r['Weight (lbs)'])  || 0,
      qty:       parseInt(r['Qty'])             || 1,
      stackable: String(r['Stackable'] || 'yes').toLowerCase() !== 'no',
      isDG:      String(r['Dangerous Goods'] || 'no').toLowerCase() === 'yes',
    }),
    validate: r => r.name && r.length > 0,
    display:  r => [r.name, r.length, r.width, r.height, r.weight + ' lbs', r.qty, r.stackable ? 'yes' : 'no', r.isDG ? '⚠ yes' : 'no'],
  },
  carriers: {
    headers: ['Carrier Name', 'Truck Name', 'Length (ft)', 'Width (ft)', 'Height (ft)', 'Max Weight (lbs)', 'Base Rate ($)', 'Rate/Mile ($/mi)'],
    example:  ['FastFreight LLC', '53ft Dry Van', 53, 8.5, 9, 44000, 520, 3.20],
    map: r => ({
      carrierName: String(r['Carrier Name'] || '').trim(),
      name:        String(r['Truck Name']   || '').trim(),
      length:      parseFloat(r['Length (ft)'])      || 0,
      width:       parseFloat(r['Width (ft)'])       || 0,
      height:      parseFloat(r['Height (ft)'])      || 0,
      maxWt:       parseFloat(r['Max Weight (lbs)']) || 0,
      baseRate:    parseFloat(r['Base Rate ($)'])    || 0,
      ratePerMi:   parseFloat(r['Rate/Mile ($/mi)']) || 0,
    }),
    validate: r => r.carrierName && r.name,
    display:  r => [r.carrierName, r.name, r.length, r.width, r.height, r.maxWt.toLocaleString(), '$' + r.baseRate, '$' + r.ratePerMi + '/mi'],
  },
  rates: {
    headers: ['City', 'Carrier', 'Truck', 'Rate per km ($/km)'],
    example:  ['Chicago', 'Any', '', 2.50],
    map: r => ({
      city:       String(r['City'] || '').trim(),
      carrier:    String(r['Carrier'] || '').trim(),
      truck:      String(r['Truck'] || '').trim(),
      ratePerKm:  parseFloat(r['Rate per km ($/km)']) || 0,
    }),
    validate: r => r.ratePerKm > 0,
    display:  r => [r.city || '(any city)', r.carrier || 'Any', r.truck || '(any truck)', '$' + r.ratePerKm + '/km'],
  },
};

const _importData = { trucks: [], items: [], carriers: [], rates: [] };

function importDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('import-drop-hover'); }
function importDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('import-drop-hover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  parseImportFile(type, file);
}

function handleImportFile(type, input) {
  const file = input.files[0];
  if (!file) return;
  parseImportFile(type, file);
}

function parseImportFile(type, file) {
  const reader = new FileReader();
  reader.onload = e => {
    const wb = XLSX.read(e.target.result, { type: 'binary' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const schema  = IMPORT_SCHEMAS[type];
    const mapped  = rawRows.map(r => schema.map(r)).filter(schema.validate);
    _importData[type] = mapped;
    renderImportPreview(type, mapped);
  };
  reader.readAsBinaryString(file);
}

function renderImportPreview(type, rows) {
  const schema   = IMPORT_SCHEMAS[type];
  const countEl  = document.getElementById(`import-count-${type}`);
  const tableEl  = document.getElementById(`import-table-${type}`);
  const previewEl = document.getElementById(`import-preview-${type}`);

  if (!rows.length) {
    countEl.textContent = '0 valid rows found — make sure column headers match the template exactly';
    countEl.style.color = 'var(--danger)';
    tableEl.innerHTML   = '';
    previewEl.style.display = 'block';
    return;
  }

  countEl.textContent = `${rows.length} row${rows.length !== 1 ? 's' : ''} ready to import`;
  countEl.style.color = 'var(--success, #16a34a)';

  const shown = rows.slice(0, 25);
  const head  = schema.headers.map(h => `<th>${esc(h)}</th>`).join('');
  const body  = shown.map(r => `<tr>${schema.display(r).map(v => `<td>${esc(String(v ?? ''))}</td>`).join('')}</tr>`).join('');
  const more  = rows.length > 25
    ? `<tr><td colspan="${schema.headers.length}" class="import-more-row">… and ${rows.length - 25} more rows</td></tr>`
    : '';
  tableEl.innerHTML = `<thead><tr>${head}</tr></thead><tbody>${body}${more}</tbody>`;
  previewEl.style.display = 'block';
}

function cancelImport(type) {
  _importData[type] = [];
  document.getElementById(`import-preview-${type}`).style.display = 'none';
  const fi = document.getElementById(`import-file-${type}`);
  if (fi) fi.value = '';
}

async function confirmImport(type) {
  const rows = _importData[type];
  if (!rows.length) return;
  const btn = document.querySelector(`#import-preview-${type} .btn-import-confirm`);
  btn.textContent = 'Importing…';
  btn.disabled    = true;
  try {
    const res  = await fetch(`/api/import/${type}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rows }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    alert(`✅ Successfully imported ${data.imported} ${type}.`);
    cancelImport(type);
    // Refresh the relevant admin list
    const fresh = await fetch('/api/data').then(r => r.json());
    if (type === 'trucks')   { trucks = fresh.trucks || [];   renderFleetList(); }
    if (type === 'items')    { /* items shown in cargo panel */               }
    if (type === 'carriers') { carriers = fresh.carriers || []; renderFleetList(); }
    if (type === 'rates')    { rates = fresh.rates || [];    renderRates();   }
    // Update stats
    document.getElementById('s-trucks').textContent    = (fresh.trucks    || []).length;
    document.getElementById('s-carriers').textContent  = (fresh.carriers  || []).length;
    document.getElementById('s-customers').textContent = (fresh.customers || []).length;
    document.getElementById('s-units').textContent     = (fresh.items     || []).length;
  } catch (e) {
    alert('Import error: ' + e.message);
  } finally {
    btn.textContent = '✓ Import';
    btn.disabled    = false;
  }
}

function downloadTemplate(type) {
  const schema = IMPORT_SCHEMAS[type];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([schema.headers, schema.example]);
  // Style header row (column widths)
  ws['!cols'] = schema.headers.map(h => ({ wch: Math.max(h.length + 4, 14) }));
  XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));
  XLSX.writeFile(wb, `import-template-${type}.xlsx`);
}

// ── AI Assistant ─────────────────────────────────────────────────────────────
const _aiHistory = [];

function toggleAIChat() {
  const panel = document.getElementById('ai-chat-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  if (panel.style.display === 'flex') {
    document.getElementById('ai-chat-input')?.focus();
  }
}

function aiAppendMessage(role, text) {
  const msgs = document.getElementById('ai-chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'ai-msg ' + (role === 'user' ? 'ai-msg-user' : 'ai-msg-bot');
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.querySelector('.ai-chat-send');
  const text = input?.value.trim();
  if (!text) return;

  input.value = '';
  aiAppendMessage('user', text);
  _aiHistory.push({ role: 'user', content: text });

  // Show thinking indicator
  const msgs = document.getElementById('ai-chat-messages');
  const thinking = document.createElement('div');
  thinking.className = 'ai-msg ai-msg-thinking';
  thinking.textContent = 'AI is thinking…';
  msgs.appendChild(thinking);
  msgs.scrollTop = msgs.scrollHeight;
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: _aiHistory }),
    });
    const data = await res.json();
    thinking.remove();

    if (!res.ok) throw new Error(data.error || 'AI error');

    const reply = data.reply;
    _aiHistory.push({ role: 'assistant', content: reply });

    // Check if AI returned cargo data to auto-add
    const cargoMatch = reply.match(/<cargo_data>([\s\S]*?)<\/cargo_data>/);
    const cleanReply = reply.replace(/<cargo_data>[\s\S]*?<\/cargo_data>/g, '').trim();
    aiAppendMessage('assistant', cleanReply);

    if (cargoMatch) {
      try {
        const cargo = JSON.parse(cargoMatch[1]);
        // Fill the custom item form
        portalEnterCustomItem();
        if (cargo.name)   document.getElementById('p-name').value   = cargo.name;
        if (cargo.length) document.getElementById('p-length').value = cargo.length;
        if (cargo.width)  document.getElementById('p-width').value  = cargo.width;
        if (cargo.height) document.getElementById('p-height').value = cargo.height;
        if (cargo.weight) document.getElementById('p-weight').value = cargo.weight;
        if (cargo.qty)    document.getElementById('p-qty').value    = cargo.qty;
        aiAppendMessage('assistant', '✅ I\'ve filled in the cargo form for you — review and click "+ Add" to add it.');
      } catch (_) {}
    }
  } catch (err) {
    thinking.remove();
    aiAppendMessage('assistant', '⚠ ' + (err.message || 'Could not reach AI service. Make sure ANTHROPIC_API_KEY is set.'));
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

async function getAIAdvice() {
  const btn = document.querySelector('.ai-advise-btn');
  if (btn) { btn.textContent = '⏳ …'; btn.disabled = true; }

  // Ensure chat panel is open
  const panel = document.getElementById('ai-chat-panel');
  if (panel) panel.style.display = 'flex';

  try {
    const res = await fetch('/api/ai/advise', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI error');
    aiAppendMessage('assistant', '💡 Load Optimization Tips:\n\n' + data.advice);
  } catch (err) {
    aiAppendMessage('assistant', '⚠ Could not get advice: ' + err.message);
  } finally {
    if (btn) { btn.textContent = '💡 Advise'; btn.disabled = false; }
    const msgs = document.getElementById('ai-chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

async function aiAutoFill() {
  const desc = prompt('Describe your cargo item (e.g. "10 steel pallets, 500kg each, 120×80×100cm"):');
  if (!desc) return;
  try {
    const res = await fetch('/api/ai/parse-cargo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Parse error');
    portalEnterCustomItem();
    if (data.name)   document.getElementById('p-name').value   = data.name;
    if (data.length) document.getElementById('p-length').value = data.length;
    if (data.width)  document.getElementById('p-width').value  = data.width;
    if (data.height) document.getElementById('p-height').value = data.height;
    if (data.weight) document.getElementById('p-weight').value = data.weight;
    if (data.qty)    document.getElementById('p-qty').value    = data.qty;
    if (data.stackable === false) {
      const cb = document.getElementById('p-stackable');
      if (cb) cb.checked = false;
    }
    if (data.isDG) {
      const dg = document.getElementById('p-is-dg');
      if (dg) dg.checked = true;
    }
  } catch (err) {
    alert('AI Auto-Fill error: ' + err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
