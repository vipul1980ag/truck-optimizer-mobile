'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let trucks    = [];
let carriers  = [];
let customers = [];
let items     = [];
let nextIds   = { truck: 1, carrier: 1, carrierTruck: 1, customer: 1, item: 1 };

// ── Boot ──────────────────────────────────────────────────────────────────────
async function init() {
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
  const weight        = parseFloat(document.getElementById('p-weight').value)     || 0;
  const packagingWeight = parseFloat(document.getElementById('p-pkg-weight').value) || 0;
  const qty    = parseInt(document.getElementById('p-qty').value, 10)  || 1;
  const custId = parseInt(document.getElementById('p-customer').value, 10) || null;

  if (!name) { alert('Please enter an item name.'); return; }
  if (length <= 0 || width <= 0 || height <= 0) { alert('Dimensions must be positive.'); return; }

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
    customerId:     custId || null,
  });

  // Reset form
  document.getElementById('p-name').value       = '';
  document.getElementById('p-length').value     = '4';
  document.getElementById('p-width').value      = '4';
  document.getElementById('p-height').value     = '4';
  document.getElementById('p-weight').value     = '500';
  document.getElementById('p-pkg-weight').value = '0';
  document.getElementById('p-qty').value        = '1';

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
  if (!sel) return;
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
  if (!items.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--text2);padding:8px 2px;">No items yet — add some above.</p>';
    return;
  }
  const custMap = Object.fromEntries(customers.map(c => [c.id, c]));
  el.innerHTML = '<div class="item-list">' +
    items.map(it => {
      const cust = it.customerId ? custMap[it.customerId] : null;
      const custDot = cust
        ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cust.color || '#888'};margin-right:4px;"></span>`
        : '';
      return `
        <div class="item-row">
          <div class="item-row-info">
            <div class="item-row-name">${esc(it.name)} <span style="font-weight:400;color:var(--text2);">×${it.qty}</span></div>
            <div class="item-row-meta">${it.length}×${it.width}×${it.height} ft &nbsp;·&nbsp; ${it.weight.toLocaleString()} lbs item${it.packagingWeight ? ` + ${it.packagingWeight.toLocaleString()} lbs pkg = ${(it.weight + it.packagingWeight).toLocaleString()} lbs total` : ''}</div>
            ${cust ? `<div class="item-row-cust">${custDot}${esc(cust.name)}</div>` : ''}
          </div>
          <button class="btn-remove" onclick="portalRemoveItem(${it.id})">✕</button>
        </div>`;
    }).join('') +
  '</div>';
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
