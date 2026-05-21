# Truck Load Optimizer

A single-file web app for optimizing truck loads, consolidating customer deliveries, and comparing carrier costs — no installation required.

## Features

### Load Optimization
- 3D bin-packing algorithm (Height-Map First Fit Decreasing) with 6-orientation item rotation
- Packs items across multiple trucks, minimizing wasted space
- Visual load plan: top, side, and front views rendered on HTML5 Canvas
- Weight and volume utilization stats per truck

### Customer Consolidation
- Assign items to customers with delivery stop numbers
- Items are packed in reverse stop order so first-stop cargo is closest to the doors
- Color-coded zones on the load view show each customer's items at a glance
- Split warning when a customer's items span multiple trucks

### Carrier & Route Cost Analysis
- Add your own fleet trucks with base rate ($/trip) and rate per mile ($/mi)
- Add external carriers (e.g. FastFreight LLC) with their own truck types and rates
- Assign customers a destination zone and distance from depot
- After optimizing, the app groups customers by zone and ranks every carrier option by cost and fit
- Consolidation opportunities: if two zones are within 200 miles of each other, the app checks whether a single larger truck is cheaper than two separate runs and shows the savings

### Save / Load
- Data auto-saves to browser `localStorage` on every change
- Export a dated JSON backup (`truck-optimizer-YYYY-MM-DD.json`)
- Import a JSON file to restore a previous session
- Clear all data and start fresh

### Print / PDF
- Print-optimized layout (A4 landscape) with a light theme
- Each truck card stays on one page
- Trigger via the Print button in the header or `Ctrl+P`

## Usage

1. Download `truck-optimizer.html`
2. Open it in any modern browser (Chrome, Edge, Firefox)
3. Use the sidebar tabs to manage your **Fleet**, **Carriers**, **Customers**, and **Items**
4. Click **Optimize** to run the packing algorithm and see the route analysis

No server, no dependencies, no install — everything runs locally in the browser.

## Demo Data

The app loads with pre-seeded data on first open:

| What | Detail |
|---|---|
| Own fleet | Semi Truck 1 (53 ft), Box Truck 1 (20 ft) |
| Carriers | FastFreight LLC, QuickHaul Express |
| Customers | Acme Corp (Chicago, 320 mi), Beta Supplies (Chicago, 320 mi), Gamma Retail (Milwaukee, 180 mi) |
| Items | 6 item types spread across the 3 customers |

## Tech

- Vanilla HTML + CSS + JavaScript — single file, ~1,600 lines
- No frameworks or external libraries
- LocalStorage for persistence
- HTML5 Canvas for 3D visualizations
