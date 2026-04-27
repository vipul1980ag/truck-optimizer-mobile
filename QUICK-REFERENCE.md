# Truck Load Optimizer — Quick Reference Card

## Live URL
https://toc.dnw-ai.com

## Local Path
C:/Users/vipul/truck-optimizer/

## GitHub Repos
| Remote  | URL |
|---------|-----|
| origin  | https://github.com/vipul1980ag/VipulAgrawal.git (subfolder: truck-optimizer/) |
| mobile  | https://github.com/vipul1980ag/truck-optimizer-mobile.git (Railway watches this) |

## Push Updates
```bash
git push origin master && git push mobile master
```

## Restore Stable Version
```bash
git checkout v1.0-stable
```

## Railway Deployment
- Repo: truck-optimizer-mobile → branch: master → Root Directory: (blank)
- Start: node server.js
- Port: 8081 (Railway overrides with PORT env var)
- Required env var: ANTHROPIC_API_KEY

## Key Files
| File | Purpose |
|------|---------|
| server.js | Express backend (port 8081) |
| public/index.html | Web app UI (photo scan, AI chat, optimizer) |
| public/app.js | Frontend logic |
| public/style.css | Styles |
| engine/packer.js | 3D bin packing algorithm |
| engine/optimizer.js | Load optimizer |
| engine/routes.js | Route & carrier cost analysis |
| mobile/src/api.js | Mobile API — BASE_URL = https://toc.dnw-ai.com |

## Features
- 3D bin packing optimizer
- Route & carrier cost analysis
- Photo scan (AI identifies items & sizes)
- AI chat assistant + AI auto-fill
- Customer & payment management
- PayPal integration
- Mobile app (React Native / Expo 54)

## Start Server Locally
```bash
cd C:/Users/vipul/truck-optimizer
npm start
# → http://localhost:8081
```

## Copyright
© 2024-2026 Vipul Agrawal. All Rights Reserved. See LICENSE file.
