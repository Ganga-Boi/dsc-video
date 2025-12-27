# Misbrugsskolen Video POC

Simpel statisk video-side med sprogvalg og betalingsmur.

## Struktur

```
video-poc/
├── index.html      # UI
├── script.js       # Logik
├── vercel.json     # Vercel config
└── videos/         # Video-filer (du uploader selv)
    ├── video_da.mp4
    ├── video_ur.mp4
    └── video_ar.mp4
```

## Sådan virker det

1. **Dansk** er gratis - spiller direkte
2. **Urdu/Arabisk** kræver betaling
3. Ved betaling → redirect til Stripe → tilbage med `?paid=ur`
4. Køb gemmes i `localStorage`

## Lokal test

```bash
# Simpel HTTP server
npx serve .

# Eller Python
python -m http.server 8000
```

Åbn http://localhost:3000 (eller 8000).

I demo-mode (localhost) kan du "købe" uden rigtig betaling.

## Vercel Deploy

```bash
# Installer Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Stripe Setup

1. Opret konto på [stripe.com](https://stripe.com)
2. Gå til **Payment Links** i Dashboard
3. Opret 2 links:
   - Urdu adgang - 29 kr
   - Arabisk adgang - 29 kr
4. Under "After payment" → Redirect til: `https://din-side.vercel.app/?paid=ur`
5. Kopier links til `script.js`:

```javascript
stripeLinks: {
  ur: 'https://buy.stripe.com/din-urdu-link',
  ar: 'https://buy.stripe.com/din-arabisk-link',
},
```

## Video-filer

Upload dine video-filer til `/videos/` mappen:

- `video_da.mp4` - Dansk version
- `video_ur.mp4` - Urdu version  
- `video_ar.mp4` - Arabisk version

**OBS:** Store video-filer (>100MB) bør hostes på ekstern CDN (Cloudflare R2, Bunny CDN, etc.)

## Tilpasning

Ændr pris i `script.js`:

```javascript
languages: {
  da: { name: 'Dansk', flag: '🇩🇰', free: true },
  ur: { name: 'Urdu', flag: '🇵🇰', free: false, price: 29 },
  ar: { name: 'Arabisk', flag: '🇸🇦', free: false, price: 29 },
},
```
