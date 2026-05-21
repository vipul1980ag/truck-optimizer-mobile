# Truck Optimizer — AI Agent Instructions

**Project**: Hybrid logistics platform (web SPA + React Native mobile + Node.js backend) for optimizing truck loads, consolidating deliveries, and comparing carrier costs.

---

## 🏗️ Project Architecture

```
truck-optimizer/
├── server.js                 # Express backend (port 8081)
├── public/                   # Web SPA (vanilla JS, ~1,600 lines)
├── engine/                   # Core algorithms (no UI coupling)
│   ├── optimizer.js          # Orchestrates consolidation & packing
│   ├── packer.js (TruckPacker) # 3D bin-packing algorithm
│   └── routes.js             # Zone-based routing & carrier cost analysis
├── mobile/                   # React Native app (Expo 54)
│   ├── App.js                # Navigation: tabs + stack
│   ├── src/
│   │   ├── api.js            # HTTP client (BASE_URL injection)
│   │   ├── *Context.js       # Auth, Wizard, Theme state management
│   │   ├── screens/          # Full-page views
│   │   └── components/       # Reusable React components
│   ├── eas.json              # Expo build config (iOS/Android)
│   └── package.json          # React Native dependencies
├── android/                  # Native Gradle build files
├── data/                     # Persistent state (store.json)
└── [configs: Dockerfile, railway.json, render.yaml, app.json]
```

**Tech Stack Summary**:
- **Backend**: Node.js 18+, Express, Anthropic SDK (Claude AI), Twilio (SMS), Nodemailer, PayPal integration
- **Frontend**: Vanilla HTML5/CSS3/JS, Leaflet (mapping), SheetJS (Excel)
- **Mobile**: Expo 54, React 19, React Native 0.81, React Navigation, AsyncStorage

See [mobile/README.md](mobile/README.md) for feature details and [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for live URL & repo links.

---

## 🚀 Running the Project

### **Backend Server**
```bash
cd c:\Users\vipul\truck-optimizer
npm start                    # Starts Express on http://localhost:8081
```
✅ Required: `ANTHROPIC_API_KEY` environment variable

### **Web App**
- Access at **http://localhost:8081** after `npm start`
- Single-page app served from `public/index.html` via Express static middleware
- No build step needed; changes in `public/` are live

### **Mobile App (React Native)**
```bash
cd mobile
npm start                    # Expo dev server + QR code
npm run android              # Build & run on Android
npm run ios                  # Build & run on iOS
```
✅ Uses **EAS** for production builds (GitHub Actions integration available)

### **Production Builds**
- **Railway**: Watches `truck-optimizer-mobile` repo → `node server.js` (see [QUICK-REFERENCE.md](QUICK-REFERENCE.md))
- **Docker**: `docker build . && docker run -p 8081:8081`
- **Render**: Alternative PaaS deployment (see `render.yaml`)

---

## 📋 Development Conventions

### **File Naming**
- **Backend**: camelCase (`optimizer.js`, `packer.js`, `routes.js`)
- **Mobile components**: PascalCase (`AuthScreen.js`, `DashboardScreen.js`)
- **Folders**: lowercase (`engine`, `screens`, `components`, `mobile`)
- **React Contexts**: `*Context.js` (e.g., `AuthContext.js`, `WizardContext.js`)

### **Key Patterns**
| Pattern | Location | Purpose |
|---------|----------|---------|
| **State Management** | `mobile/src/*Context.js` | Auth, booking wizard (multi-step form), theme |
| **API Layer** | `mobile/src/api.js` | Single source of truth for server communication; supports env-based BASE_URL |
| **Pure Algorithms** | `engine/` | No UI coupling; testable in isolation |
| **Screen-based views** | `mobile/src/screens/` | One file per full-page view |
| **Reusable UI** | `mobile/src/components/` | Shared React Native components |

### **Environment Variables**
**Required for production:**
```
ANTHROPIC_API_KEY          # Claude AI for photo scanning
TWILIO_SID, TWILIO_TOKEN   # SMS notifications
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM  # Email
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV      # Payments
NODE_ENV                    # "production" or "development"
PORT                        # Default 8081 (Railway/Render override)
DATA_PATH                   # Persistent data directory (default: ./data)
```

---

## 🧠 Core Algorithms

### **3D Bin Packing** (`engine/packer.js` — `TruckPacker` class)
- **Algorithm**: Height-Map First Fit Decreasing (HMFFD)
- **Grid Resolution**: 0.5 ft (precision for small items)
- **Item Rotation**: 6-orientation support (x, y, z permutations)
- **Configuration Options**:
  - `stackAxis`: height_first | length_first | width_first
  - `centerMass`: Load distribution balancing
  - `loadFrom`: "back" (rear door) | "front" (cab)

**Key API**:
```js
const packer = new TruckPacker(truckDimensions, config);
packer.pack(itemsList);  // Returns packed state & summary
```

### **Load Optimization** (`engine/optimizer.js`)
1. **Groups** items by customer delivery zone (reverse stop order for pack sequencing)
2. **Packs** items across multiple trucks using `TruckPacker`
3. **Returns** consolidated load plan with utilization stats per truck

**Key API**:
```js
const result = optimizer.run(trucks, items, customers, routes);
// result.trucks → array of packed truck objects with utilization %
// result.summary → total volume/weight used vs available
```

### **Route & Carrier Analysis** (`engine/routes.js`)
1. **Groups** customers by delivery zone
2. **Ranks** own fleet + external carriers by total cost (base + distance)
3. **Detects consolidation** opportunities (zones ≤200 miles → suggests larger truck vs. two runs)

---

## 🔧 API Endpoints

**Data Management**:
- `GET /api/data` — Fetch workspace (trucks, customers, items, carriers)
- `PUT /api/data` — Save workspace state

**Optimization**:
- `POST /api/optimize` — Run packing + route analysis

**Authentication**:
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

**Payments**:
- `POST /api/payment/create-order`, `POST /api/payment/capture-order`, `GET /api/payment/config`

**Geocoding & Routes**:
- `POST /api/geocode` — Address → coordinates
- `POST /api/routes` — Route geometry between points
- `POST /api/tolls` — Toll cost calculation

**Bookings (Shared Mode)**:
- `POST /api/bookings/available-trucks` — Find available carrier trucks
- `POST /api/bookings/optimize-shared` — Optimize shared shipments
- `POST /api/bookings` — Create booking (requires auth token)

See `server.js` for full routing.

---

## 📱 Mobile App State Flow

**Navigation Structure** (from `mobile/App.js`):
1. **Auth Stack** → `AuthScreen` (login/register)
2. **Main Tabs** (after auth):
   - **Dashboard** → `DashboardScreen`
   - **Bookings** → `BookingsScreen` → Multi-step wizard (`wizard/` folder) → `WizardContext` manages state
   - **Admin** → `AdminScreen` (fleet, carriers, optimization)
   - **Other** → `CargoScreen`, `CustomersScreen`, `FleetScreen`, `OptimizeScreen`, etc.

**Context-based State** (in `mobile/src/`):
- `AuthContext.js` — User login, token, role-based access
- `WizardContext.js` — Multi-step booking form (captures customer, items, destination)
- `ThemeContext.js` — Dark/light mode toggle

**API Communication**:
- All HTTP calls go through `mobile/src/api.js`
- `BASE_URL` injected via `EAS` environment (see `eas.json`)
- Mobile backend: `https://toc.dnw-ai.com` (production)

---

## 🚨 Important Gotchas & Conventions

### **Data Persistence**
- **Backend**: Persists to `data/store.json` (filesystem-based, not a database)
- **Mobile**: Uses `AsyncStorage` (local device storage) + sync to backend
- **Web**: Browser `localStorage` + manual sync to server

### **Deployment Targets**
| Target | Config File | Status |
|--------|-------------|--------|
| Railway | `railway.json` | Primary (watches GitHub) |
| Render | `render.yaml` | Fallback PaaS |
| Docker | `Dockerfile` | Multi-stage Node 20-slim |
| EAS (Mobile) | `mobile/eas.json` | Dev, preview, production profiles |

**Before deploying**: Update environment variables in the deployment platform's dashboard.

### **Mobile Build Quirks**
- **EAS Config** (`mobile/eas.json`): Separate dev/preview/production profiles; API URL injected at build time
- **Android Build**: Gradle in `mobile/android/` + `android/` (both exist; prefer `mobile/android`)
- **iOS**: App Store Connect credentials placeholder in `eas.json` (update before submitting)

### **Versioning**
- Stable releases tagged as `v1.0-stable` (see [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for restore steps)
- Two Git remotes: `origin` (main repo), `mobile` (Railway watches this for deployments)

---

## 📖 When to Reference Existing Docs

| Topic | Doc | When to Use |
|-------|-----|-----------|
| **Feature overview, usage flow** | [mobile/README.md](mobile/README.md) | Understanding "what" the app does |
| **Live URL, repos, quick commands** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Local setup, git push workflow, Railway config |
| **License & copyright** | `LICENSE` | Legal restrictions (proprietary software) |
| **Demo data, algorithm details** | `mobile/README.md` | Load optimization logic, 3D packing explanation |

---

## 🎯 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm start` fails: `Cannot find module` | Run `npm install` in root and `cd mobile && npm install` |
| Port 8081 already in use | Change `PORT=8082 npm start` or kill existing process |
| Mobile app can't reach backend | Check `BASE_URL` in `eas.json` and `mobile/src/api.js` |
| EAS build fails with Kotlin error | Run `gradlew clean` in `mobile/android/` then retry |
| Railway deploy hangs | Check `ANTHROPIC_API_KEY` is set; see [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |

---

## 💡 Agent Workflow Tips

1. **Before coding**: Check `server.js` for existing endpoints; don't duplicate logic
2. **Modifying algorithms**: Test in `engine/` in isolation (no React Native dependencies)
3. **Adding mobile features**: Use `*Context.js` for state; keep `screens/` focused on UI
4. **Debugging optimization**: Print intermediate `packer.js` state and truck utilization %
5. **Merging branches**: Always sync both `origin` and `mobile` remotes (see [QUICK-REFERENCE.md](QUICK-REFERENCE.md))

---

**For questions about codebase structure, see [mobile/README.md](mobile/README.md) and [QUICK-REFERENCE.md](QUICK-REFERENCE.md).**
