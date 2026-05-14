# google-map-navigator

# 🏘️ Repnarv — Real Estate Property Search App

> A React.js clone of the Repnarv property search platform with interactive map, filters, radius search, and property listings.

---

## 📸 Features

- 🗺️ **Interactive Map** — OpenStreetMap via Leaflet with property price markers
- 🔍 **Live Search** — Search by property name or location instantly
- 🏷️ **16 Property Type Filters** — NewFlat, NewShop, RowHouse, CommercialFlat, and more
- 📏 **Radius Slider** — Filter properties within 1–100 km radius with live circle on map
- 📋 **Property List Panel** — Cards with image, price, type, status, area
- 🖱️ **Click Interactions** — Click marker or card to highlight and show popup
- 👁️ **Hide/Show List** — Toggle the property panel
- 📱 **Responsive Layout** — Works on desktop and tablet

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend framework |
| Leaflet.js | Interactive map |
| OpenStreetMap | Free map tiles (no API key needed) |
| CSS-in-JS | Inline styles for components |

---

## 📁 Project Structure

```
repnarv-app/
├── public/
│   └── index.html          ← Add Leaflet CDN links here
├── src/
│   ├── App.js              ← Entry point, imports RepnarvApp
│   └── RepnarvApp.jsx      ← Main app component
├── package.json
└── README.md
```

---

## 🚀 How to Run

### Step 1 — Install Node.js
Download from **https://nodejs.org** (choose LTS version)

Verify:
```bash
node -v
npm -v
```

---

### Step 2 — Create React Project

Open terminal and run:
```bash
cd Desktop
npx create-react-app repnarv-app
cd repnarv-app
```

> ⏳ Wait 2–3 minutes for installation to complete.

---

### Step 3 — Add the Component File

Copy `RepnarvApp.jsx` into the `src` folder:
```
repnarv-app/
└── src/
    └── RepnarvApp.jsx   ✅ paste here
```

---

### Step 4 — Update `src/App.js`

Open `src/App.js` and **replace everything** with:
```jsx
import RepnarvApp from './RepnarvApp';

function App() {
  return <RepnarvApp />;
}

export default App;
```

---

### Step 5 — Update `public/index.html`

Open `public/index.html` and add these **2 lines** before `</head>`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

Your `index.html` should look like this:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Repnarv</title>

    <!-- ADD THESE 2 LINES -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

### Step 6 — Start the App

```bash
npm start
```

✅ Browser will open at **http://localhost:3000**

---

## ❌ Common Errors & Fixes

### Error: `Cannot find module './RepnarvApp'`
**Fix:** Make sure the file is named exactly `RepnarvApp.jsx` (capital R, capital N, capital A) inside the `src/` folder.

---

### Error: `npm error ENOENT: no such file or directory, open 'package.json'`
**Fix:** You are in the wrong folder. Run:
```bash
cd repnarv-app
npm start
```
Or if you only have a plain folder without package.json, run:
```bash
npx create-react-app .
npm start
```

---

### Error: Map not showing / blank white box
**Fix:** Make sure the Leaflet CSS link is added in `public/index.html` inside `<head>` tag.

---

### Error: `npm start` port already in use
**Fix:** Run on a different port:
```bash
# Windows
set PORT=3001 && npm start

# Mac/Linux
PORT=3001 npm start
```

---

### Error: Node version too old
**Fix:** Check your version:
```bash
node -v
```
You need **v16 or higher**. Download latest LTS from https://nodejs.org

---

## 🗂️ How to Add More Properties

Open `RepnarvApp.jsx` and find the `PROPERTIES` array at the top. Add a new object:

```jsx
{
  id: 7,
  name: "My New Property",
  location: "SITABULDI",
  dist: "2km",
  type: "NewFlat",          // must match one of the filter tabs
  price: "₹75.00 L",
  lat: 21.1490,             // latitude (Nagpur area)
  lng: 79.0850,             // longitude (Nagpur area)
  img: "https://your-image-url.jpg",
  beds: 2,
  area: "1100 sq.ft",
  status: "Ready to Move",  // or "Under Construction"
},
```

---

## 🎨 How to Change the Theme Color

The app uses **purple `#7C3AED`** as the primary color. To change it, open `RepnarvApp.jsx` and find & replace all instances of `#7C3AED` with your preferred color.

---

## 📦 Dependencies

No extra npm packages needed! Everything is loaded via CDN.

| Package | Version | CDN |
|---|---|---|
| leaflet | 1.9.4 | unpkg.com |
| React | 18.x | included in create-react-app |

---

## 👨‍💻 Author

Built with React.js + Leaflet + OpenStreetMap  
Inspired by **Repnarv** — Truth. Trust. Transparency.

---

## 📄 License

This project is for educational purposes only.
