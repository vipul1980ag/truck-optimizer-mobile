// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
let useMetric = false;
let trucks = [], items = [], customers = [], carriers = [];
let nextTruckId = 1, nextItemId = 1, nextCustomerId = 1, nextCarrierId = 1, nextCarrierTruckId = 1;
let colorIdx = 0;
const CUST_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#a855f7','#84cc16','#0ea5e9','#d946ef','#fb923c','#34d399'];
const CORRIDOR_THRESHOLD = 200; // used only in renderRouteAnalysis for display label

// ═══════════════════════════════════════════════════
//  UNITS
// ═══════════════════════════════════════════════════
function toggleUnits() {
  useMetric = document.getElementById('metricToggle').checked;
  const du = useMetric ? 'm' : 'ft', wu = useMetric ? 'kg' : 'lbs', du2 = useMetric ? 'km' : 'mi';
  [['lbl-tl','Length'],['lbl-tw','Width'],['lbl-th','Height']].forEach(([id,lbl]) => {
    document.getElementById(id).textContent = `${lbl} (${du})`;
  });
  document.getElementById('lbl-tmw').textContent = `Max Weight (${wu})`;
  [['lbl-il','Length'],['lbl-iw','Width'],['lbl-ih','Height']].forEach(([id,lbl]) => {
    document.getElementById(id).textContent = `${lbl} (${du})`;
  });
  document.getElementById('lbl-iwt').textContent = `Weight (${wu})`;
  document.getElementById('lbl-cdist').textContent = `Distance (${du2})`;
  renderSidebar();
}
const dimUnit  = () => useMetric ? 'm' : 'ft';
const wtUnit   = () => useMetric ? 'kg' : 'lbs';
const distUnit = () => useMetric ? 'km' : 'mi';

// ═══════════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════════
function showTab(name) {
  ['trucks','carriers','customers','items'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === name);
    document.getElementById('tab-btn-' + t).classList.toggle('active', t === name);
  });
}

// ═══════════════════════════════════════════════════
//  ADD / REMOVE
// ═══════════════════════════════════════════════════
async function addTruck() {
  const name      = val('t-name')     || `Truck ${nextTruckId}`;
  const length    = num('t-length')   || 53;
  const width     = num('t-width')    || 8.5;
  const height    = num('t-height')   || 9;
  const maxWt     = num('t-maxwt')    || 44000;
  const baseRate  = num('t-baserate') || 0;
  const ratePerMi = num('t-rpermile') || 0;
  trucks.push({ id: nextTruckId++, name, length, width, height, maxWt, baseRate, ratePerMi });
  document.getElementById('t-name').value = `Semi Truck ${nextTruckId}`;
  renderSidebar(); await saveToServer();
}
async function removeTruck(id) { trucks = trucks.filter(t => t.id !== id); renderSidebar(); await saveToServer(); }

async function addCarrier() {
  const name = val('ca-name') || `Carrier ${nextCarrierId}`;
  carriers.push({ id: nextCarrierId++, name, trucks: [] });
  document.getElementById('ca-name').value = '';
  renderSidebar(); await saveToServer();
}
async function removeCarrier(id) { carriers = carriers.filter(c => c.id !== id); renderSidebar(); await saveToServer(); }

function toggleCarrierTruckForm(cid) {
  const el = document.getElementById(`ct-form-${cid}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

async function addCarrierTruck(cid) {
  const carrier = carriers.find(c => c.id === cid);
  if (!carrier) return;
  const name      = val(`ct-name-${cid}`)     || 'Truck';
  const length    = num(`ct-length-${cid}`)   || 48;
  const width     = num(`ct-width-${cid}`)    || 8.5;
  const height    = num(`ct-height-${cid}`)   || 9;
  const maxWt     = num(`ct-maxwt-${cid}`)    || 44000;
  const baseRate  = num(`ct-baserate-${cid}`) || 0;
  const ratePerMi = num(`ct-rpm-${cid}`)      || 0;
  carrier.trucks.push({ tid: nextCarrierTruckId++, name, length, width, height, maxWt, baseRate, ratePerMi });
  [`ct-name-${cid}`,`ct-length-${cid}`,`ct-width-${cid}`,`ct-height-${cid}`,`ct-maxwt-${cid}`,`ct-baserate-${cid}`,`ct-rpm-${cid}`].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderSidebar(); await saveToServer();
}
async function removeCarrierTruck(cid, tid) {
  const carrier = carriers.find(c => c.id === cid);
  if (carrier) carrier.trucks = carrier.trucks.filter(t => t.tid !== tid);
  renderSidebar(); await saveToServer();
}

async function addCustomer() {
  const name          = val('c-name')     || `Customer ${nextCustomerId}`;
  const stop          = parseInt(document.getElementById('c-stop').value) || nextCustomerId;
  const color         = document.getElementById('c-color').value || CUST_COLORS[colorIdx % CUST_COLORS.length];
  const zone          = val('c-zone')     || '';
  const distance      = num('c-distance') || 0;
  const paymentTerms  = document.getElementById('c-pay-terms').value  || 'net30';
  const paymentMethod = document.getElementById('c-pay-method').value || 'invoice';
  const invoiceAmount = num('c-invoice') || 0;
  colorIdx++;
  customers.push({ id: nextCustomerId++, name, stop, color, zone, distance,
    paymentStatus: 'pending', paymentTerms, paymentMethod, invoiceAmount });
  customers.sort((a, b) => a.stop - b.stop);
  document.getElementById('c-name').value    = '';
  document.getElementById('c-stop').value    = customers.length + 1;
  document.getElementById('c-zone').value    = '';
  document.getElementById('c-invoice').value = '0';
  renderSidebar(); await saveToServer();
}
async function setPaymentStatus(id, status) {
  const c = customers.find(c => c.id === id);
  if (c) { c.paymentStatus = status; renderSidebar(); await saveToServer(); }
}
async function removeCustomer(id) {
  customers = customers.filter(c => c.id !== id);
  items.forEach(i => { if (i.customerId === id) i.customerId = null; });
  renderSidebar(); await saveToServer();
}

async function addItem() {
  const name       = val('i-name')   || `Item ${nextItemId}`;
  const length     = num('i-length') || 4;
  const width      = num('i-width')  || 4;
  const height     = num('i-height') || 4;
  const weight     = num('i-weight') || 0;
  const qty        = parseInt(document.getElementById('i-qty').value) || 1;
  const rotate     = document.getElementById('i-rotate').checked;
  const custId     = document.getElementById('i-customer').value;
  const customerId = custId ? parseInt(custId) : null;
  items.push({ id: nextItemId++, name, length, width, height, weight, qty, rotate, customerId });
  document.getElementById('i-name').value = '';
  renderSidebar(); await saveToServer();
}
async function removeItem(id) { items = items.filter(i => i.id !== id); renderSidebar(); await saveToServer(); }

// ═══════════════════════════════════════════════════
//  SIDEBAR RENDER
// ═══════════════════════════════════════════════════
function renderSidebar() {
  // Fleet trucks
  const tl = document.getElementById('truck-list');
  tl.innerHTML = trucks.length === 0
    ? '<div class="no-items">No trucks added yet.</div>'
    : trucks.map(t => `
      <div class="entity-card">
        <div class="entity-header">
          <div>
            <div class="entity-name">🚛 ${esc(t.name)}</div>
            <div class="entity-dims">${t.length}×${t.width}×${t.height} ${dimUnit()} · Max ${fmt(t.maxWt)} ${wtUnit()}</div>
            <div class="entity-dims">${t.baseRate||t.ratePerMi ? `$${t.baseRate||0} base · $${t.ratePerMi||0}/${distUnit()}` : 'No cost set'}</div>
          </div>
          <button class="btn btn-danger" onclick="removeTruck(${t.id})">✕</button>
        </div>
      </div>`).join('');

  // Carriers
  const cl = document.getElementById('carrier-list');
  cl.innerHTML = carriers.length === 0
    ? '<div class="no-items">No external carriers added yet.</div>'
    : carriers.map(c => `
      <div class="entity-card">
        <div class="entity-header">
          <div>
            <div class="entity-name">🏢 ${esc(c.name)}</div>
            <div class="entity-dims">${c.trucks.length} truck type${c.trucks.length!==1?'s':''}</div>
          </div>
          <div style="display:flex;gap:5px;align-items:center">
            <button class="btn btn-success btn-sm" onclick="toggleCarrierTruckForm(${c.id})">+ Truck</button>
            <button class="btn btn-danger btn-sm" onclick="removeCarrier(${c.id})">✕</button>
          </div>
        </div>
        <!-- Inline add-truck form -->
        <div id="ct-form-${c.id}" class="ct-add-form" style="display:none">
          <div style="font-size:11px;font-weight:700;color:#86efac;margin-bottom:7px">Add Truck Type</div>
          <div class="form-grid">
            <div class="form-group full"><label>Name</label>
              <input type="text" id="ct-name-${c.id}" placeholder="e.g. 48ft Dry Van"></div>
            <div class="form-group"><label>${dimUnit()}</label>
              <input type="number" id="ct-length-${c.id}" placeholder="Length" value="48" step="0.5"></div>
            <div class="form-group"><label>${dimUnit()}</label>
              <input type="number" id="ct-width-${c.id}" placeholder="Width" value="8.5" step="0.5"></div>
            <div class="form-group"><label>${dimUnit()}</label>
              <input type="number" id="ct-height-${c.id}" placeholder="Height" value="9" step="0.5"></div>
            <div class="form-group"><label>${wtUnit()}</label>
              <input type="number" id="ct-maxwt-${c.id}" placeholder="Max weight" value="44000"></div>
            <div class="form-group"><label>Base $</label>
              <input type="number" id="ct-baserate-${c.id}" placeholder="Base rate" value="500" step="10"></div>
            <div class="form-group"><label>$/${distUnit()}</label>
              <input type="number" id="ct-rpm-${c.id}" placeholder="Per mile" value="3.00" step="0.05"></div>
          </div>
          <button class="btn btn-success btn-full" onclick="addCarrierTruck(${c.id})">Add This Truck Type</button>
        </div>
        <!-- Truck list -->
        ${c.trucks.length > 0 ? `<div class="ct-list">
          ${c.trucks.map(t => `<div class="ct-row">
            <div><span class="ct-row-name">${esc(t.name)}</span>
              <span style="margin-left:6px;color:var(--text2)">${t.length}×${t.width}×${t.height} ${dimUnit()} · ${fmt(t.maxWt)} ${wtUnit()}</span>
              <span style="margin-left:6px;color:#86efac">$${t.baseRate||0}+$${t.ratePerMi||0}/${distUnit()}</span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="removeCarrierTruck(${c.id},${t.tid})">✕</button>
          </div>`).join('')}
        </div>` : ''}
      </div>`).join('');

  // Customers
  const custl = document.getElementById('customer-list');
  custl.innerHTML = customers.length === 0
    ? '<div class="no-items">No customers added yet.</div>'
    : customers.map(c => {
        const cItems = items.filter(i => i.customerId === c.id);
        const totalQty = cItems.reduce((s, i) => s + i.qty, 0);
        const ps = c.paymentStatus || 'pending';
        const psBadge = ps === 'paid'    ? `<span class="pay-badge pay-paid">✓ Paid</span>`
                      : ps === 'overdue' ? `<span class="pay-badge pay-overdue">⚠ Overdue</span>`
                      :                   `<span class="pay-badge pay-pending">⏳ Pending</span>`;
        const termsLabel = { cod:'COD', net30:'Net 30', net60:'Net 60', net90:'Net 90' }[c.paymentTerms || 'net30'] || c.paymentTerms;
        const methodLabel = { invoice:'Invoice', bank:'Bank Transfer', card:'Credit Card', check:'Check', cod:'COD' }[c.paymentMethod || 'invoice'] || c.paymentMethod;
        return `<div class="entity-card">
          <div class="entity-header">
            <div style="display:flex;align-items:flex-start;gap:7px">
              <div class="color-swatch" style="background:${c.color};margin-top:2px"></div>
              <div>
                <div class="entity-name">${esc(c.name)} <span class="stop-badge" style="background:${c.color}22;color:${c.color}">Stop #${c.stop}</span> ${psBadge}</div>
                <div class="entity-dims">${c.zone ? `📍 ${esc(c.zone)}` : 'No zone'} ${c.distance ? `· ${c.distance} ${distUnit()}` : ''}</div>
                <div class="entity-dims">${termsLabel} · ${methodLabel}${c.invoiceAmount ? ` · $${Number(c.invoiceAmount).toLocaleString()}` : ''} · ${totalQty} unit${totalQty!==1?'s':''}</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">
              <button class="btn btn-danger" onclick="removeCustomer(${c.id})">✕</button>
              <select style="font-size:10px;padding:2px 4px;border-radius:5px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer"
                      onchange="setPaymentStatus(${c.id}, this.value)">
                <option value="pending"  ${ps==='pending' ?'selected':''}>Pending</option>
                <option value="paid"     ${ps==='paid'    ?'selected':''}>Paid</option>
                <option value="overdue"  ${ps==='overdue' ?'selected':''}>Overdue</option>
              </select>
            </div>
          </div>
        </div>`;
      }).join('');

  // Items
  const il = document.getElementById('item-list');
  il.innerHTML = items.length === 0
    ? '<div class="no-items">No items added yet.</div>'
    : items.map(i => {
        const cust = customers.find(c => c.id === i.customerId);
        const custBadge = cust
          ? `<span style="font-size:10px;padding:1px 5px;border-radius:8px;background:${cust.color}22;color:${cust.color};font-weight:700">${esc(cust.name)}</span>`
          : `<span style="font-size:10px;color:var(--text2)">Unassigned</span>`;
        const dotColor = cust ? cust.color : '#64748b';
        return `<div class="entity-card">
          <div class="entity-header">
            <div style="display:flex;align-items:flex-start;gap:7px">
              <div class="color-swatch" style="background:${dotColor};margin-top:2px"></div>
              <div>
                <div class="entity-name">${esc(i.name)} ${custBadge}</div>
                <div class="entity-dims">${i.length}×${i.width}×${i.height} ${dimUnit()} · ${fmt(i.weight)} ${wtUnit()} · Qty ${i.qty}</div>
                <div class="entity-dims">${i.rotate ? '↻ rotatable' : '⚠ fixed orient.'}</div>
              </div>
            </div>
            <button class="btn btn-danger" onclick="removeItem(${i.id})">✕</button>
          </div>
        </div>`;
      }).join('');

  // Customer dropdown in items tab
  const sel = document.getElementById('i-customer');
  const prev = sel.value;
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    customers.map(c => `<option value="${c.id}">${esc(c.name)} (Stop #${c.stop}${c.zone?' · '+c.zone:''})</option>`).join('');
  sel.value = prev;

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  document.getElementById('opt-counts').textContent =
    `${totalItems} items · ${trucks.length} truck${trucks.length!==1?'s':''} · ${customers.length} customer${customers.length!==1?'s':''} · ${carriers.length} carrier${carriers.length!==1?'s':''}`;
}

// ═══════════════════════════════════════════════════
//  ROUTE ANALYSIS RENDERING
// ═══════════════════════════════════════════════════
function renderRouteAnalysis(zoneGroups, consolidations) {
  if (zoneGroups.length === 0) return '';
  const hasAnyCost = zoneGroups.some(zg => zg.options.some(o => o.cost != null));

  const chips = zoneGroups.map(zg => {
    const custNames = zg.customers.map(c => `<span class="color-dot" style="background:${c.color}"></span>${esc(c.name)}`).join(' ');
    let costLine = '';
    if (zg.bestFit && zg.bestFit.cost != null) {
      costLine = `<div class="zone-chip-cost">Best: $${Math.round(zg.bestFit.cost).toLocaleString()}/run <span style="font-size:10px;opacity:0.8">(${esc(zg.bestFit.carrierName)})</span></div>`;
    } else if (zg.options.some(o => o.fits)) {
      costLine = `<div class="zone-chip-nocost">Fits (no rates set)</div>`;
    } else {
      costLine = `<div class="zone-chip-warn">⚠ No truck fits!</div>`;
    }
    return `<div class="zone-chip">
      <div class="zone-chip-name">📍 ${esc(zg.zone)}</div>
      <div class="zone-chip-sub">${custNames}</div>
      <div class="zone-chip-sub">${fmt(zg.totalWt)} lbs · ${fmt(zg.totalVol)} ${dimUnit()}³ ${zg.distance ? `· ${zg.distance} ${distUnit()}` : ''}</div>
      ${costLine}
    </div>`;
  }).join('');

  const tables = zoneGroups.map(zg => {
    const dist = zg.distance;
    const rows = zg.options.slice(0, 8).map(o => {
      const rowCls = o.recommended ? 'row-best' : !o.fits ? 'row-no' : '';
      const statusCls = o.recommended ? 'status-best' : !o.fits ? 'status-no' : 'status-ok';
      const statusLbl = o.recommended ? '★ Cheapest fit' : !o.fits
        ? (o.volPct > 100 && o.wtPct > 100 ? 'too small (vol+wt)' : o.volPct > 100 ? 'vol overflow' : 'wt overflow')
        : 'fits';
      return `<tr class="${rowCls}">
        <td><span class="${o.carrierType==='own'?'badge-own':'badge-ext'}">${o.carrierType==='own'?'Own':'Ext'}</span>${esc(o.carrierName)}</td>
        <td>${esc(o.truckName)}</td>
        ${hasAnyCost ? `<td class="cell-cost">${o.cost!=null ? '$'+Math.round(o.cost).toLocaleString() : '—'}</td>` : ''}
        <td class="${o.volPct>100?'cell-red':o.volPct>85?'cell-yellow':'cell-green'}">${o.volPct}%</td>
        <td class="${o.wtPct>100?'cell-red':o.wtPct>85?'cell-yellow':'cell-green'}">${o.wtPct}%</td>
        <td><span class="status-tag ${statusCls}">${statusLbl}</span></td>
      </tr>`;
    }).join('');

    const custMeta = zg.customers.map(c => esc(c.name)).join(', ');
    return `<div class="zone-table-section">
      <div class="zone-table-hdr">
        📍 ${esc(zg.zone)}
        ${dist > 0 ? `<span class="zone-dist">${dist} ${distUnit()}</span>` : ''}
        <span class="meta">— ${custMeta} · ${fmt(zg.totalVol)} ${dimUnit()}³ · ${fmt(zg.totalWt)} lbs</span>
      </div>
      <table class="carrier-table">
        <thead><tr>
          <th>Carrier</th><th>Truck</th>
          ${hasAnyCost ? '<th>Trip Cost</th>' : ''}
          <th>Vol %</th><th>Wt %</th><th>Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');

  const consolidationHtml = consolidations.length > 0 ? `
    <div class="consolidation-section">
      <div class="consolidation-hdr">💰 Consolidation Opportunities</div>
      <div class="consolidation-sub">Zones within the same delivery corridor (≤${CORRIDOR_THRESHOLD} ${distUnit()}) where one truck beats separate runs</div>
      ${consolidations.map(opp => `
        <div class="opp-card">
          <div class="opp-zones">
            ${opp.zones.map(z => `<span class="zone-tag">📍 ${esc(z)}</span>`).join('<span style="color:var(--text2);margin:0 4px;font-size:13px">+</span>')}
            <span class="savings-badge">SAVE $${Math.round(opp.savings).toLocaleString()} / run</span>
            ${opp.distDiff > 0 ? `<span style="font-size:11px;color:var(--text2)">(zones ${opp.distDiff} ${distUnit()} apart)</span>` : ''}
          </div>
          <div class="opp-detail">
            Separate runs: <strong>$${Math.round(opp.g1Best.cost).toLocaleString()}</strong> + <strong>$${Math.round(opp.g2Best.cost).toLocaleString()}</strong> = <strong>$${Math.round(opp.separateCost).toLocaleString()}</strong>
            <span style="margin:0 8px;color:var(--text2)">→</span>
            One <strong>${esc(opp.recommendation.truckName)}</strong> (${esc(opp.recommendation.carrierName)}): <strong style="color:var(--success)">$${Math.round(opp.combinedCost).toLocaleString()}</strong>
          </div>
        </div>`).join('')}
    </div>` : '';

  return `<div class="route-analysis">
    <div class="ra-header">
      <h3>🗺 Route &amp; Carrier Analysis</h3>
      <span class="sub">${zoneGroups.length} zone${zoneGroups.length!==1?'s':''} · ${carriers.length} external carrier${carriers.length!==1?'s':''} · comparing ${trucks.length + carriers.reduce((s,c)=>s+c.trucks.length,0)} truck options</span>
    </div>
    <div class="zone-chips">${chips}</div>
    ${tables}
    ${consolidationHtml}
  </div>`;
}

// ═══════════════════════════════════════════════════
//  OPTIMIZE (calls backend)
// ═══════════════════════════════════════════════════
async function runOptimize() {
  if (trucks.length === 0) { alert('Please add at least one own-fleet truck.'); return; }
  if (items.length === 0)  { alert('Please add at least one item.'); return; }

  const btn = document.querySelector('.btn-optimize');
  btn.textContent = 'Optimizing…'; btn.disabled = true;
  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trucks, carriers, customers, items })
    });
    const data = await res.json();
    if (!res.ok) { alert('Optimization failed: ' + (data.error || res.statusText)); return; }
    const { packers, unplaced, splitWarn, analysis, truckZoneSummary } = data;
    renderResults(packers, unplaced, splitWarn, analysis, truckZoneSummary);
  } catch(e) {
    alert('Optimization failed: ' + e.message);
  } finally {
    btn.textContent = '⚡ Optimize & Analyze Routes'; btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════
//  CONSOLIDATED LOAD PLAN
// ═══════════════════════════════════════════════════
function renderConsolidatedPlan(truckZoneSummary, analysis) {
  if (!truckZoneSummary || truckZoneSummary.length === 0) return '';

  // Only show trucks that actually have items
  const active = truckZoneSummary.filter(ts => ts.zones.length > 0);
  if (active.length === 0) return '';

  // Build a quick lookup: zone name → bestFit cost from route analysis
  const zoneBestCost = {};
  if (analysis?.zoneGroups) {
    for (const zg of analysis.zoneGroups) {
      if (zg.bestFit?.cost != null) zoneBestCost[zg.zone] = zg.bestFit.cost;
    }
  }

  const cards = active.map(ts => {
    // Per-zone rows
    const zoneRows = ts.zones.map(z => {
      const custDots = z.customers
        .sort((a, b) => a.stop - b.stop)
        .map(c => `<span style="display:inline-flex;align-items:center;gap:3px;margin-right:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${c.color};display:inline-block;flex-shrink:0"></span>
            <span style="font-size:11px;font-weight:600;color:${c.color}">${esc(c.name)}</span>
            <span style="font-size:10px;color:var(--text2)">(Stop ${c.stop})</span>
          </span>`).join('');
      return `<div style="margin-top:6px;padding:6px 9px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">
        <div style="font-size:11px;font-weight:700;margin-bottom:3px">
          📍 ${esc(z.zone)}${z.distance ? `<span style="margin-left:6px;font-size:10px;font-weight:400;color:var(--text2)">${z.distance} mi</span>` : ''}
        </div>
        <div style="line-height:1.8">${custDots}</div>
      </div>`;
    }).join('');

    // Separate cost from combined to show savings potential
    const separateCostTotal = ts.zones.reduce((s, z) => {
      return s + (zoneBestCost[z.zone] ?? 0);
    }, 0);
    const multiZone = ts.zones.length > 1;
    let costHtml = '';
    if (ts.estimatedCost != null) {
      costHtml = `<div style="margin-top:8px;padding:6px 9px;background:rgba(59,130,246,0.08);border-radius:6px;border:1px solid rgba(59,130,246,0.2)">
        <div style="font-size:11px;color:var(--text2)">Own-fleet trip cost</div>
        <div style="font-size:15px;font-weight:800;color:var(--primary)">$${Math.round(ts.estimatedCost).toLocaleString()}</div>
        <div style="font-size:10px;color:var(--text2)">${ts.maxDist} mi · ${(() => { const t = trucks.find(t => t.id === ts.truckId); return t ? `$${t.baseRate||0} base + $${t.ratePerMi||0}/mi` : ''; })()}</div>
        ${multiZone && separateCostTotal > ts.estimatedCost
          ? `<div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--success)">
               💰 Saves $${Math.round(separateCostTotal - ts.estimatedCost).toLocaleString()} vs separate runs ($${Math.round(separateCostTotal).toLocaleString()})
             </div>`
          : ''}
      </div>`;
    } else if (ts.maxDist > 0) {
      costHtml = `<div style="margin-top:8px;font-size:10px;color:var(--text2);padding:4px 8px;background:var(--bg);border-radius:5px">${ts.maxDist} mi — no rate set for this truck</div>`;
    }

    const label = multiZone ? '🔗 Consolidated' : '📦 Single Zone';
    const labelColor = multiZone ? 'var(--success)' : 'var(--primary)';

    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
        <span style="font-size:13px;font-weight:800">🚛 ${esc(ts.truckName)}</span>
        <span style="font-size:10px;font-weight:700;color:${labelColor};padding:1px 7px;border-radius:10px;background:${labelColor}22">${label}</span>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:2px">${ts.zones.length} zone${ts.zones.length!==1?'s':''} · ${ts.zones.reduce((s,z)=>s+z.customers.length,0)} customer${ts.zones.reduce((s,z)=>s+z.customers.length,0)!==1?'s':''}</div>
      ${zoneRows}
      ${costHtml}
    </div>`;
  }).join('');

  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:16px">
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px">
      <h3 style="font-size:16px;font-weight:800">🔗 Consolidated Load Plan</h3>
      <span style="font-size:12px;color:var(--text2)">Same-zone customers packed together · farther zones loaded near cab</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px">
      ${cards}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════
//  RENDER RESULTS
// ═══════════════════════════════════════════════════
function renderResults(packers, unplaced, splitWarn, analysis, truckZoneSummary) {
  document.getElementById('empty-state').style.display = 'none';
  const resultsEl = document.getElementById('results');
  resultsEl.style.display = 'block';

  const totalVol   = trucks.reduce((s, t) => s + t.length * t.width * t.height, 0);
  const usedVol    = packers.reduce((s, p) => s + p.placements.reduce((sv, pl) => sv + pl.w * pl.h * pl.d, 0), 0);
  const totalWt    = trucks.reduce((s, t) => s + t.maxWt, 0);
  const usedWt     = packers.reduce((s, p) => s + p.usedWeight, 0);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const placed     = totalItems - unplaced.length;
  const vPct = totalVol > 0 ? Math.round(usedVol / totalVol * 100) : 0;
  const wPct = totalWt  > 0 ? Math.round(usedWt  / totalWt  * 100) : 0;

  const routeHtml = renderRouteAnalysis(analysis.zoneGroups, analysis.consolidations);

  let html = `
  <div style="margin-bottom:16px">
    <h2 style="font-size:19px;font-weight:800;margin-bottom:3px">Optimization Results</h2>
    <div style="color:var(--text2);font-size:11px">3D bin packing · delivery-stop ordering · ${customers.length} customer${customers.length!==1?'s':''} · ${carriers.length} external carrier${carriers.length!==1?'s':''} compared</div>
  </div>

  <div class="summary-grid">
    <div class="sum-card">
      <div class="sum-label">Volume Used</div>
      <div class="sum-val" style="color:${vPct>85?'#22c55e':vPct>55?'#f59e0b':'#3b82f6'}">${vPct}%</div>
      <div class="sum-sub">${fmt(usedVol)} / ${fmt(totalVol)} ${dimUnit()}³</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Weight Used</div>
      <div class="sum-val" style="color:${wPct>90?'#ef4444':wPct>70?'#f59e0b':'#22c55e'}">${wPct}%</div>
      <div class="sum-sub">${fmt(usedWt)} / ${fmt(totalWt)} ${wtUnit()}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Items Placed</div>
      <div class="sum-val" style="color:${unplaced.length===0?'#22c55e':'#f59e0b'}">${placed}/${totalItems}</div>
      <div class="sum-sub">${unplaced.length>0?unplaced.length+' items unplaced':'All placed ✓'}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Consolidation</div>
      <div class="sum-val">${analysis.consolidations.length > 0 ? analysis.consolidations.length : '—'}</div>
      <div class="sum-sub">${analysis.consolidations.length > 0
        ? `$${Math.round(analysis.consolidations.reduce((s,c)=>s+c.savings,0)).toLocaleString()} possible savings`
        : 'No opportunities found'}</div>
    </div>
  </div>

  ${renderConsolidatedPlan(truckZoneSummary, analysis)}
  ${routeHtml}`;

  if (splitWarn.length > 0) {
    html += `<div class="split-warn">⚠️ <strong>${splitWarn.length} customer${splitWarn.length!==1?'s':''} split across multiple trucks:</strong>
      ${splitWarn.map(s=>`<div style="margin-top:3px">• ${esc(s.name)} → ${s.trucks.map(esc).join(' + ')}</div>`).join('')}
    </div>`;
  }

  if (unplaced.length > 0) {
    const grouped = {};
    unplaced.forEach(i => { grouped[i.name] = (grouped[i.name] || 0) + 1; });
    html += `<div class="unplaced">
      <div class="unplaced-title">⚠️ ${unplaced.length} Item${unplaced.length!==1?'s':''} Could Not Be Placed</div>
      <div style="font-size:12px;color:var(--text2)">
        ${Object.entries(grouped).map(([n,c]) => {
          const cu = customers.find(cu => cu.id === items.find(i=>i.name===n)?.customerId);
          return `<span style="margin-right:10px"><span class="color-dot" style="background:${cu?.color||'#64748b'}"></span>${n}: ${c}${cu?` <span style="font-size:10px;color:${cu.color}">(${cu.name})</span>`:''}</span>`;
        }).join('')}
      </div>
      <div style="font-size:11px;color:var(--text2);margin-top:6px">Tip: Add more trucks, increase capacity, or check carrier options above.</div>
    </div>`;
  }

  // ── Per-truck load plans ──
  html += `<div class="load-plan-heading" style="margin:18px 0 8px"><h3 style="font-size:15px;font-weight:800">📦 Load Plans</h3><div style="font-size:11px;color:var(--text2)">Physical bin packing per own-fleet truck</div></div>`;

  packers.forEach((packer, idx) => {
    const truck = packer.truck;
    const truckVol = truck.length * truck.width * truck.height;
    const usedV = packer.placements.reduce((s, p) => s + p.w * p.h * p.d, 0);
    const vp = truckVol > 0 ? Math.round(usedV / truckVol * 100) : 0;
    const wp = truck.maxWt > 0 ? Math.round(packer.usedWeight / truck.maxWt * 100) : 0;
    const pillV = vp > 85 ? 'pill-green' : vp > 50 ? 'pill-yellow' : 'pill-blue';
    const pillW = wp > 90 ? 'pill-red' : wp > 70 ? 'pill-yellow' : 'pill-green';

    const custPlacementMap = {};
    packer.placements.forEach(p => {
      const cid = p.customerId;
      if (!custPlacementMap[cid]) custPlacementMap[cid] = { count: 0, vol: 0 };
      custPlacementMap[cid].count++;
      custPlacementMap[cid].vol += p.w * p.h * p.d;
    });
    const truckCusts = Object.entries(custPlacementMap).map(([cid, data]) => {
      const cust = cid === 'null' ? null : customers.find(c => c.id === parseInt(cid));
      const zone = packer.customerZones[cid];
      return { cust, ...data, zone };
    }).sort((a, b) => (a.cust?.stop ?? 999) - (b.cust?.stop ?? 999));

    const colorMap = {};
    packer.placements.forEach(p => {
      const c = customers.find(cu => cu.id === p.customerId);
      colorMap[p.customerId] = c ? c.color : '#64748b';
    });

    const canTopId = `cv-top-${idx}`, canSideId = `cv-side-${idx}`, canFrontId = `cv-front-${idx}`;

    const deliveryRows = truckCusts.map(tc => {
      const color = tc.cust ? tc.cust.color : '#64748b';
      const label = tc.cust ? tc.cust.name : 'Unassigned';
      const stop  = tc.cust ? `Stop #${tc.cust.stop}` : '—';
      const zone  = tc.cust?.zone ? `📍 ${tc.cust.zone}` : '';
      const zoneDepth = tc.zone ? ` · z=${fmt(tc.zone.minZ)}–${fmt(tc.zone.maxZ)} ${dimUnit()}` : '';
      return `<div class="cust-delivery-row">
        <div class="cust-stop">${stop}</div>
        <div style="display:flex;align-items:center;gap:6px;flex:1">
          <div class="color-swatch" style="background:${color}"></div>
          <span style="font-weight:600;font-size:12px">${esc(label)}</span>
          <span style="font-size:11px;color:var(--text2)">${zone}${zoneDepth}</span>
        </div>
        <div style="font-size:11px;color:var(--text2)">${tc.count} item${tc.count!==1?'s':''} · ${fmt(tc.vol)} ${dimUnit()}³</div>
      </div>`;
    }).join('');

    const legendItems = truckCusts.map(tc => ({
      color: tc.cust ? tc.cust.color : '#64748b',
      label: tc.cust ? `${tc.cust.name}${tc.cust.zone?' ('+tc.cust.zone+')':''}` : 'Unassigned'
    }));

    const iGroups = {};
    packer.placements.forEach(p => {
      const key = `${p.customerId}::${p.name}`;
      if (!iGroups[key]) iGroups[key] = { customerId: p.customerId, name: p.name, color: colorMap[p.customerId], count: 0 };
      iGroups[key].count++;
    });

    html += `
    <div class="truck-result">
      <div class="tr-header">
        <div>
          <div class="tr-name">🚛 ${esc(truck.name)}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">${truck.length}×${truck.width}×${truck.height} ${dimUnit()} · ${fmt(truck.maxWt)} ${wtUnit()} · ${packer.placements.length} items · ${truckCusts.length} customer${truckCusts.length!==1?'s':''}</div>
        </div>
        <div class="tr-pills">
          <span class="pill ${pillV}">Vol ${vp}%</span>
          <span class="pill ${pillW}">Wt ${wp}%</span>
          <span class="pill pill-blue">${packer.placements.length} items</span>
        </div>
      </div>
      <div class="tr-body">
        <div class="prog-row">
          <div class="prog-label">Volume</div>
          <div class="prog-bar"><div class="prog-fill" style="width:${vp}%;background:${vp>85?'var(--success)':vp>50?'var(--warning)':'var(--primary)'}"></div></div>
          <div class="prog-pct" style="color:${vp>85?'#22c55e':vp>50?'#f59e0b':'#3b82f6'}">${vp}%</div>
        </div>
        <div class="prog-row">
          <div class="prog-label">Weight</div>
          <div class="prog-bar"><div class="prog-fill" style="width:${wp}%;background:${wp>90?'var(--danger)':wp>70?'var(--warning)':'var(--success)'}"></div></div>
          <div class="prog-pct" style="color:${wp>90?'#ef4444':wp>70?'#f59e0b':'#22c55e'}">${wp}%</div>
        </div>

        <div class="viz-grid">
          <div class="viz-box" style="grid-column:1/-1">
            <div class="viz-title">📐 Top View — Length × Width (color = customer · zone brackets)</div>
            <canvas id="${canTopId}" width="700" height="200"></canvas>
            <div class="viz-legend">
              ${legendItems.map(li=>`<div class="legend-item"><div class="legend-dot" style="background:${li.color}"></div>${esc(li.label)}</div>`).join('')}
            </div>
          </div>
          <div class="viz-box">
            <div class="viz-title">📏 Side View — Length × Height</div>
            <canvas id="${canSideId}" width="400" height="180"></canvas>
          </div>
          <div class="viz-box">
            <div class="viz-title">🖼 Front View — Width × Height</div>
            <canvas id="${canFrontId}" width="400" height="180"></canvas>
          </div>
        </div>

        ${truckCusts.length > 0 ? `
        <div class="customer-section">
          <div class="cust-section-title">🚚 Delivery Order (unload sequence)</div>
          ${deliveryRows}
        </div>` : ''}

        <div class="section-hdr">Items by Customer</div>
        <table class="items-table">
          <thead><tr><th>Customer</th><th>Item</th><th>Qty</th><th>Vol each</th></tr></thead>
          <tbody>
            ${Object.values(iGroups).map(g => {
              const cust = customers.find(c => c.id === g.customerId);
              const custLbl = cust ? cust.name : 'Unassigned';
              const itemDef = items.find(i => i.name === g.name);
              const eVol = itemDef ? itemDef.length * itemDef.width * itemDef.height : 0;
              return `<tr><td><span class="color-dot" style="background:${g.color}"></span>${esc(custLbl)}</td>
                <td>${esc(g.name)}</td><td>${g.count}</td><td>${fmt(eVol)} ${dimUnit()}³</td></tr>`;
            }).join('')}
            ${packer.placements.length === 0 ? '<tr><td colspan="4" style="color:var(--text2);text-align:center">No items loaded</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>`;
  });

  resultsEl.innerHTML = html;

  requestAnimationFrame(() => {
    packers.forEach((packer, idx) => {
      const colorMap = {};
      packer.placements.forEach(p => {
        const c = customers.find(cu => cu.id === p.customerId);
        colorMap[p.customerId] = c ? c.color : '#64748b';
      });
      const custZones = Object.entries(packer.customerZones).map(([cid, zone]) => {
        const c = customers.find(cu => cu.id === parseInt(cid));
        return { color: c ? c.color : '#64748b', label: c ? `${c.name}${c.zone?' ('+c.zone+')':''}` : 'N/A', ...zone };
      });
      drawTopView(document.getElementById(`cv-top-${idx}`),    packer.truck, packer.placements, colorMap, custZones);
      drawSideView(document.getElementById(`cv-side-${idx}`),  packer.truck, packer.placements, colorMap);
      drawFrontView(document.getElementById(`cv-front-${idx}`), packer.truck, packer.placements, colorMap);
    });
  });
}

// ═══════════════════════════════════════════════════
//  VISUALIZATION
// ═══════════════════════════════════════════════════
const PAD = 14;

function drawTopView(canvas, truck, placements, colorMap, custZones) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = Math.min((W - PAD*2) / truck.length, (H - PAD*2 - 20) / truck.width);
  const ox = PAD, oy = PAD + 10, tw = truck.length * scale, th = truck.width * scale;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#07101e'; ctx.fillRect(ox, oy, tw, th);

  ctx.strokeStyle = 'rgba(71,85,105,0.25)'; ctx.lineWidth = 0.5;
  for (let z = 1; z < truck.length; z++) { const px = ox + z * scale; ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, oy+th); ctx.stroke(); }
  for (let x = 1; x < truck.width; x++) { const py = oy + x * scale; ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(ox+tw, py); ctx.stroke(); }

  for (const p of placements) {
    const color = colorMap[p.customerId] || '#64748b';
    const px = ox + p.z * scale, py = oy + p.x * scale, pw = p.d * scale, ph = p.w * scale;
    ctx.fillStyle = color + 'bb'; ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, ph);
    if (pw > 22 && ph > 12) {
      ctx.fillStyle = '#ffffffcc';
      ctx.font = `bold ${Math.min(9, Math.floor(Math.min(pw,ph)*0.32))}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.name.substring(0, 6), px + pw/2, py + ph/2);
    }
  }

  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, tw, th);

  for (const zone of custZones) {
    if (zone.minZ === Infinity) continue;
    const zx1 = ox + zone.minZ * scale, zx2 = ox + zone.maxZ * scale;
    ctx.strokeStyle = zone.color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(zx1, oy - 2); ctx.lineTo(zx2, oy - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(zx1, oy - 6); ctx.lineTo(zx1, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(zx2, oy - 6); ctx.lineTo(zx2, oy); ctx.stroke();
    ctx.fillStyle = zone.color; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const labelX = Math.max(zx1 + 20, Math.min(zx2 - 20, (zx1 + zx2) / 2));
    ctx.fillText(zone.label.substring(0, 20), labelX, oy - 6);
    if (zone.minZ > 0.1) {
      ctx.strokeStyle = zone.color + '88'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(zx1, oy); ctx.lineTo(zx1, oy + th); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.fillStyle = '#475569'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('CAB', ox + 2, oy + th + 2);
  ctx.textAlign = 'right'; ctx.fillText('DOORS ▶', ox + tw - 2, oy + th + 2);
}

function drawSideView(canvas, truck, placements, colorMap) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = Math.min((W - PAD*2) / truck.length, (H - PAD*2) / truck.height);
  const ox = PAD, oy = PAD, tw = truck.length * scale, th = truck.height * scale;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#07101e'; ctx.fillRect(ox, oy, tw, th);

  ctx.strokeStyle = 'rgba(71,85,105,0.25)'; ctx.lineWidth = 0.5;
  for (let z = 1; z < truck.length; z++) { const px = ox + z * scale; ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, oy+th); ctx.stroke(); }
  for (let y = 1; y < truck.height; y++) { const py = oy + y * scale; ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(ox+tw, py); ctx.stroke(); }

  for (const p of placements) {
    const color = colorMap[p.customerId] || '#64748b';
    const px = ox + p.z * scale, py = oy + (truck.height - p.y - p.h) * scale;
    ctx.fillStyle = color + '88'; ctx.fillRect(px, py, p.d * scale, p.h * scale);
    ctx.strokeStyle = color; ctx.lineWidth = 0.7; ctx.strokeRect(px, py, p.d * scale, p.h * scale);
  }

  ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(ox, oy+th); ctx.lineTo(ox+tw, oy+th); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, tw, th);
  ctx.fillStyle = '#475569'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('CAB', ox+2, oy+th+2);
  ctx.textAlign = 'right'; ctx.fillText('DOORS', ox+tw-2, oy+th+2);
}

function drawFrontView(canvas, truck, placements, colorMap) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = Math.min((W - PAD*2) / truck.width, (H - PAD*2) / truck.height);
  const ox = PAD + ((W - PAD*2) - truck.width * scale) / 2, oy = PAD;
  const tw = truck.width * scale, th = truck.height * scale;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#07101e'; ctx.fillRect(ox, oy, tw, th);

  ctx.strokeStyle = 'rgba(71,85,105,0.25)'; ctx.lineWidth = 0.5;
  for (let x = 1; x < truck.width; x++) { const px = ox + x * scale; ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, oy+th); ctx.stroke(); }
  for (let y = 1; y < truck.height; y++) { const py = oy + y * scale; ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(ox+tw, py); ctx.stroke(); }

  for (const p of placements) {
    const color = colorMap[p.customerId] || '#64748b';
    const px = ox + p.x * scale, py = oy + (truck.height - p.y - p.h) * scale;
    ctx.fillStyle = color + '88'; ctx.fillRect(px, py, p.w * scale, p.h * scale);
    ctx.strokeStyle = color; ctx.lineWidth = 0.7; ctx.strokeRect(px, py, p.w * scale, p.h * scale);
  }

  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, tw, th);
  ctx.fillStyle = '#475569'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('LEFT', ox+2, oy+th+2);
  ctx.textAlign = 'right'; ctx.fillText('RIGHT', ox+tw-2, oy+th+2);
}

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const esc  = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmt  = n => Number(n.toFixed(1)).toLocaleString();
const val  = id => document.getElementById(id).value.trim();
const num  = id => parseFloat(document.getElementById(id).value);

// ═══════════════════════════════════════════════════
//  SAVE / LOAD (server API)
// ═══════════════════════════════════════════════════
async function saveToServer() {
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      trucks, carriers, customers, items,
      nextIds: { truck: nextTruckId, carrier: nextCarrierId, carrierTruck: nextCarrierTruckId, customer: nextCustomerId, item: nextItemId, color: colorIdx }
    };
    const res = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showSaveStatus('💾 Saved', 'ok');
    } else {
      showSaveStatus('⚠ Save failed', 'err');
    }
  } catch(e) {
    showSaveStatus('⚠ Save failed', 'err');
  }
}

function applyPayload(data) {
  if (!data || data.version !== 1) return false;
  trucks    = data.trucks    || [];
  carriers  = data.carriers  || [];
  customers = data.customers || [];
  items     = data.items     || [];
  if (data.nextIds) {
    nextTruckId         = data.nextIds.truck        || 1;
    nextCarrierId       = data.nextIds.carrier      || 1;
    nextCarrierTruckId  = data.nextIds.carrierTruck || 1;
    nextCustomerId      = data.nextIds.customer     || 1;
    nextItemId          = data.nextIds.item         || 1;
    colorIdx            = data.nextIds.color        || 0;
  }
  return true;
}

function exportJSON() {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    trucks, carriers, customers, items,
    nextIds: { truck: nextTruckId, carrier: nextCarrierId, carrierTruck: nextCarrierTruckId, customer: nextCustomerId, item: nextItemId, color: colorIdx }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `truck-optimizer-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showSaveStatus('📥 Exported', 'ok');
}

function importJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!applyPayload(data)) throw new Error('Invalid format');
      renderSidebar();
      document.getElementById('results').style.display = 'none';
      document.getElementById('empty-state').style.display = 'block';
      await saveToServer();
      showSaveStatus('📂 Imported ' + file.name, 'ok');
    } catch(err) {
      showSaveStatus('⚠ Import failed — invalid file', 'err');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

async function clearAll() {
  if (!confirm('Clear all trucks, carriers, customers and items?')) return;
  trucks = []; carriers = []; customers = []; items = [];
  nextTruckId = nextCarrierId = nextCarrierTruckId = nextCustomerId = nextItemId = 1;
  colorIdx = 0;
  renderSidebar();
  document.getElementById('results').style.display = 'none';
  document.getElementById('empty-state').style.display = 'block';
  await saveToServer();
  showSaveStatus('🗑 Cleared', 'ok');
}

let _saveTimer;
function showSaveStatus(msg, cls) {
  const el = document.getElementById('save-status');
  el.textContent = msg;
  el.className = 'save-status ' + (cls || '');
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, 3000);
}

// ═══════════════════════════════════════════════════
//  ITEM CATALOG
// ═══════════════════════════════════════════════════
const CATALOG = [
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

const INDUSTRIAL_CATALOG = [
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

let _catalogTab = 'household'; // 'household' | 'industrial'

function initCatalog() {
  const el = document.getElementById('item-catalog');
  if (!el) return;
  const totalHousehold   = CATALOG.reduce((s,c) => s + c.items.length, 0);
  const totalIndustrial  = INDUSTRIAL_CATALOG.reduce((s,c) => s + c.items.length, 0);
  const html = `
    <div class="catalog-wrap">
      <button class="catalog-toggle" onclick="toggleCatalog()" id="catalog-toggle-btn">
        📋 Item Catalog <small style="font-weight:400;color:var(--text2)">(${totalHousehold + totalIndustrial} items)</small>
        <span class="ct-arrow">▶</span>
      </button>
      <div class="catalog-body" id="catalog-body">
        <div class="catalog-tabs">
          <button class="ctab active" id="ctab-household" onclick="switchCatalogTab('household')">🏠 Household</button>
          <button class="ctab" id="ctab-industrial" onclick="switchCatalogTab('industrial')">🏭 Industrial</button>
        </div>
        <input type="text" class="catalog-search" placeholder="Search items…" oninput="filterCatalog(this.value)" id="catalog-search">
        <div id="catalog-groups"></div>
      </div>
    </div>`;
  el.innerHTML = html;
  _catalogTab = 'household';
  renderCatalogGroups(CATALOG);
}

function switchCatalogTab(tab) {
  _catalogTab = tab;
  document.getElementById('ctab-household').classList.toggle('active', tab === 'household');
  document.getElementById('ctab-industrial').classList.toggle('active', tab === 'industrial');
  document.getElementById('catalog-search').value = '';
  renderCatalogGroups(tab === 'household' ? CATALOG : INDUSTRIAL_CATALOG);
}

function renderCatalogGroups(catalog) {
  const container = document.getElementById('catalog-groups');
  if (!container) return;
  let html = '';
  catalog.forEach(cat => {
    html += `<div class="cat-group" data-cat="${cat.cat}">
      <div class="cat-label">${cat.cat}</div>
      <div class="cat-items-grid">`;
    cat.items.forEach(item => {
      const dims = `${item.l}×${item.w}×${item.h} ft · ${item.wt} lbs`;
      html += `<button class="cat-btn" onclick="pickCatalogItem('${item.name.replace(/'/g,"\\'")}',${item.l},${item.w},${item.h},${item.wt})" title="${dims}">
        ${item.name}<span class="cat-dims">${dims}</span>
      </button>`;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
}

function toggleCatalog() {
  const body = document.getElementById('catalog-body');
  const btn  = document.getElementById('catalog-toggle-btn');
  if (!body) return;
  body.classList.toggle('open');
  btn.classList.toggle('open');
}

function filterCatalog(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('#catalog-groups .cat-group').forEach(grp => {
    let anyVisible = false;
    grp.querySelectorAll('.cat-btn').forEach(btn => {
      const match = !q || btn.textContent.toLowerCase().includes(q);
      btn.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    grp.style.display = anyVisible ? '' : 'none';
  });
}

function pickCatalogItem(name, l, w, h, wt) {
  document.getElementById('i-name').value   = name;
  document.getElementById('i-length').value = l;
  document.getElementById('i-width').value  = w;
  document.getElementById('i-height').value = h;
  document.getElementById('i-weight').value = wt;
  document.getElementById('i-qty').value    = 1;
  document.getElementById('i-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('i-name').focus();
}

// ═══════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeBtn();
}
function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light');
  btn.textContent = isLight ? '🌙' : '☀️';
  btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}

// ═══════════════════════════════════════════════════
//  PRINT / PDF
// ═══════════════════════════════════════════════════
function printReport() {
  if (document.getElementById('results').style.display === 'none') {
    alert('Please run Optimize & Analyze Routes first, then print.');
    return;
  }
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  document.getElementById('print-meta').innerHTML =
    `Generated: ${dateStr} at ${timeStr} &nbsp;·&nbsp; ` +
    `${trucks.length} truck${trucks.length!==1?'s':''} &nbsp;·&nbsp; ` +
    `${carriers.length} carrier${carriers.length!==1?'s':''} &nbsp;·&nbsp; ` +
    `${customers.length} customer${customers.length!==1?'s':''} &nbsp;·&nbsp; ` +
    `${totalItems} item unit${totalItems!==1?'s':''}`;
  window.print();
}

// ═══════════════════════════════════════════════════
//  STARTUP — load from server
// ═══════════════════════════════════════════════════
async function init() {
  try {
    const data = await fetch('/api/data').then(r => r.json());
    applyPayload(data);
    showSaveStatus('💾 Restored from server', 'ok');
  } catch(e) {
    showSaveStatus('⚠ Could not load data', 'err');
  }
  renderSidebar();
  initCatalog();
  updateThemeBtn();
}

init();
