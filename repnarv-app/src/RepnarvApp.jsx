import { useState, useEffect, useRef } from "react";

/* ─── Leaflet loaded via CDN in index.html ─── */
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

/* ─── Sample property data ─── */
const PROPERTIES = [
    {
        id: 1, name: "AFFINITY EKDANTA", location: "MAHAL", dist: "7km",
        type: "NewShop", price: "₹1.20 Cr", lat: 21.152, lng: 79.078,
        img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80",
        beds: null, area: "450 sq.ft", status: "Ready to Move",
    },
    {
        id: 2, name: "Tirupati navdurga", location: "SADAR", dist: "3km",
        type: "NewShop", price: "₹47.00 L", lat: 21.138, lng: 79.092,
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80",
        beds: null, area: "280 sq.ft", status: "Under Construction",
    },
    {
        id: 3, name: "Green Valley Residency", location: "DHARAMPETH", dist: "5km",
        type: "NewFlat", price: "₹85.00 L", lat: 21.165, lng: 79.063,
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=80",
        beds: 3, area: "1250 sq.ft", status: "Ready to Move",
    },
    {
        id: 4, name: "Shree Sai Residency", location: "HINGNA", dist: "12km",
        type: "NewFlat", price: "₹55.00 L", lat: 21.122, lng: 79.055,
        img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80",
        beds: 2, area: "950 sq.ft", status: "Under Construction",
    },
    {
        id: 5, name: "Prestige Plaza", location: "WARDHA ROAD", dist: "8km",
        type: "CommercialFlat", price: "₹2.50 Cr", lat: 21.109, lng: 79.088,
        img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80",
        beds: null, area: "2200 sq.ft", status: "Ready to Move",
    },
    {
        id: 6, name: "Lakeview Row House", location: "WATHODA", dist: "15km",
        type: "RowHouse", price: "₹1.80 Cr", lat: 21.172, lng: 79.108,
        img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=80",
        beds: 4, area: "2800 sq.ft", status: "Ready to Move",
    },
];

const FILTERS = [
    "NewFlat", "NewPlot", "NewShop", "RowHouse", "Lease", "FarmLand", "FarmHouse",
    "CommercialFlat", "CommercialPlot", "IndustrialSpace", "Resale", "ResaleFlat",
    "ResaleHouse", "ResaleShop", "ResaleOffice", "ResaleFarmLand",
];

const NAV_LINKS = ["Home", "Properties", "About Us", "Contact Us"];

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CENTER = { lat: 21.1458, lng: 79.0882 };

export default function RepnarvApp() {
    const [activeFilter, setActiveFilter] = useState("NewShop");
    const [radius, setRadius] = useState(50);
    const [search, setSearch] = useState("");
    const [selectedProp, setSelectedProp] = useState(null);
    const [showList, setShowList] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const circleRef = useRef(null);

    /* Load Leaflet */
    useEffect(() => {
        const loadCss = (href) => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href;
                document.head.appendChild(l);
            }
        };
        const loadScript = (src) => new Promise(res => {
            if (document.querySelector(`script[src="${src}"]`)) return res();
            const s = document.createElement("script"); s.src = src; s.onload = res;
            document.head.appendChild(s);
        });
        loadCss(LEAFLET_CSS);
        loadScript(LEAFLET_JS).then(() => setMapLoaded(true));
    }, []);

    /* Init map */
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;
        const L = window.L;
        const map = L.map(mapRef.current, { zoomControl: false }).setView([CENTER.lat, CENTER.lng], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© <a href='https://www.openstreetmap.org'>OpenStreetMap</a>",
            maxZoom: 19,
        }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        mapInstanceRef.current = map;
    }, [mapLoaded]);

    /* Update markers & circle on filter/radius change */
    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;
        const L = window.L;
        const map = mapInstanceRef.current;

        /* Remove old markers */
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

        /* Draw radius circle */
        const circle = L.circle([CENTER.lat, CENTER.lng], {
            radius: radius * 1000, color: "#7C3AED", weight: 2, opacity: 0.6,
            fillColor: "#7C3AED", fillOpacity: 0.05, dashArray: "6 4",
        }).addTo(map);
        circleRef.current = circle;

        /* Filter properties */
        const filtered = PROPERTIES.filter(p => {
            const typeOk = activeFilter === "All" || p.type === activeFilter;
            const distOk = haversineKm(CENTER.lat, CENTER.lng, p.lat, p.lng) <= radius;
            const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
            return typeOk && distOk && searchOk;
        });

        filtered.forEach(prop => {
            const icon = L.divIcon({
                html: `<div style="
          background:#7C3AED;color:#fff;padding:5px 10px;border-radius:20px;
          font-size:11px;font-weight:700;white-space:nowrap;
          box-shadow:0 2px 8px rgba(124,58,237,.45);
          border:2px solid #fff;cursor:pointer;
          font-family:'Segoe UI',sans-serif;
        ">${prop.price}</div>`,
                className: "", iconAnchor: [30, 15],
            });
            const marker = L.marker([prop.lat, prop.lng], { icon }).addTo(map);
            marker.on("click", () => setSelectedProp(prop));
            markersRef.current.push(marker);
        });
    }, [mapLoaded, activeFilter, radius, search]);

    const filteredProps = PROPERTIES.filter(p => {
        const typeOk = activeFilter === "All" || p.type === activeFilter;
        const distOk = haversineKm(CENTER.lat, CENTER.lng, p.lat, p.lng) <= radius;
        const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
        return typeOk && distOk && searchOk;
    });

    const visibleCount = filteredProps.length;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f5f6fa" }}>

            {/* ── Navbar ── */}
            <nav style={{
                display: "flex", alignItems: "center", padding: "0 24px", height: 64,
                background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.08)", zIndex: 200, gap: 32, flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <polygon points="20,4 36,18 36,36 4,36 4,18" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                        <polygon points="20,4 28,12 20,12 12,12" fill="#7C3AED" />
                        <rect x="14" y="22" width="5" height="14" fill="#7C3AED" />
                        <rect x="21" y="22" width="5" height="14" fill="#7C3AED" />
                    </svg>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#7C3AED", letterSpacing: -0.5, lineHeight: 1 }}>repnarv</div>
                        <div style={{ fontSize: 8, color: "#999", letterSpacing: 1 }}>Truth.Trust.Transparency</div>
                    </div>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#7C3AED", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                    <span>📍</span> Nagpur <span style={{ fontSize: 11 }}>▾</span>
                </div>

                {/* Nav links */}
                <div style={{ display: "flex", gap: 32, marginLeft: 8 }}>
                    {NAV_LINKS.map(l => (
                        <span key={l} style={{ fontSize: 14, color: "#333", cursor: "pointer", fontWeight: l === "Home" ? "600" : "400" }}
                            onMouseOver={e => e.target.style.color = "#7C3AED"}
                            onMouseOut={e => e.target.style.color = "#333"}
                        >{l}</span>
                    ))}
                </div>

                <div style={{ flex: 1 }} />

                {/* Download App */}
                <button style={{
                    background: "#7C3AED", color: "#fff", border: "none", borderRadius: 24,
                    padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(124,58,237,.35)", position: "relative",
                }}>
                    <span style={{ position: "absolute", top: -5, left: -5, width: 10, height: 10, background: "#F59E0B", borderRadius: "50%" }} />
                    <span style={{ position: "absolute", top: -5, right: -5, width: 10, height: 10, background: "#7C3AED", borderRadius: "50%", border: "2px solid #fff" }} />
                    ⬇ Download App
                </button>

                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", border: "1.5px solid #ddd", borderRadius: 24, cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f0eafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👤</div>
                    <span style={{ fontSize: 18, color: "#555" }}>☰</span>
                </div>
            </nav>

            {/* ── Search bar ── */}
            <div style={{
                padding: "10px 24px", background: "#fff", borderBottom: "1px solid #eee", zIndex: 150, flexShrink: 0,
            }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#f8f5ff", border: "1.5px solid #e0d6fc", borderRadius: 10 }}>
                        <span style={{ color: "#aaa", fontSize: 16 }}>🔍</span>
                        <input
                            placeholder="Search property, location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#333", flex: 1, fontFamily: "inherit" }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1.5px solid #ddd", borderRadius: 10, cursor: "pointer", background: "#fff" }}>
                        <span style={{ fontSize: 13, color: "#555" }}>Relevance</span>
                        <span style={{ fontSize: 12, color: "#aaa" }}>▾</span>
                    </div>
                    <button style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
                        background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10,
                        fontWeight: 700, fontSize: 14, cursor: "pointer", position: "relative",
                    }}>
                        <span style={{ position: "absolute", top: -4, right: -4, background: "#EF4444", color: "#fff", fontSize: 9, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>1</span>
                        ⚙ Filters
                    </button>
                    <button
                        onClick={() => setShowList(!showList)}
                        style={{ padding: "10px 18px", background: showList ? "#f0eafb" : "#7C3AED", color: showList ? "#7C3AED" : "#fff", border: "1.5px solid #7C3AED", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                    >
                        {showList ? "Hide List" : "Show List"}
                    </button>
                </div>
            </div>

            {/* ── Filter tabs ── */}
            <div style={{
                background: "#fff", padding: "8px 24px", borderBottom: "1px solid #eee",
                display: "flex", gap: 8, overflowX: "auto", flexShrink: 0, alignItems: "center",
                scrollbarWidth: "none",
            }}>
                {FILTERS.map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{
                        padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${activeFilter === f ? "#7C3AED" : "#ddd"}`,
                        background: activeFilter === f ? "#7C3AED" : "#fff",
                        color: activeFilter === f ? "#fff" : "#555",
                        fontWeight: activeFilter === f ? 700 : 400,
                        fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        fontFamily: "inherit",
                    }}>{f}</button>
                ))}
            </div>

            {/* ── Radius slider ── */}
            <div style={{
                background: "#fff", padding: "8px 24px 10px", borderBottom: "1px solid #eee",
                display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
            }}>
                <span style={{ fontSize: 13, color: "#555", fontWeight: 600, flexShrink: 0 }}>Radius:</span>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="range" min={1} max={100} value={radius}
                        onChange={e => setRadius(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#7C3AED", height: 4, cursor: "pointer" }}
                    />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", flexShrink: 0 }}>{radius} km</span>
                <button onClick={() => setRadius(50)} style={{ fontSize: 12, color: "#999", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
            </div>

            {/* ── Main content: map + list ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Map */}
                <div style={{ flex: 1, position: "relative" }}>
                    <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

                    {/* Map count badge */}
                    <div style={{
                        position: "absolute", top: 12, left: 12, zIndex: 999,
                        background: "#fff", borderRadius: 8, padding: "6px 12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,.15)", fontSize: 13,
                        display: "flex", alignItems: "center", gap: 6,
                    }}>
                        <span style={{ color: "#7C3AED", fontWeight: 700 }}>📍</span>
                        <span style={{ fontWeight: 600 }}>{visibleCount} on map</span>
                        <span style={{ color: "#aaa", fontSize: 12 }}>·</span>
                        <span style={{ color: "#7C3AED", fontWeight: 500 }}>Nagpur</span>
                    </div>

                    {/* Locate me */}
                    <div style={{
                        position: "absolute", bottom: 60, right: 12, zIndex: 999,
                        background: "#fff", border: "1px solid #ddd", borderRadius: 8,
                        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.12)", fontSize: 16,
                    }} title="My Location">🎯</div>

                    {/* Loading overlay */}
                    {!mapLoaded && (
                        <div style={{
                            position: "absolute", inset: 0, background: "#ede9fe",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100,
                        }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🏘️</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#7C3AED" }}>Loading Map…</div>
                        </div>
                    )}

                    {/* Selected property popup */}
                    {selectedProp && (
                        <div style={{
                            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                            zIndex: 999, background: "#fff", borderRadius: 14, padding: "14px 16px",
                            boxShadow: "0 6px 24px rgba(0,0,0,.18)", width: 300,
                            display: "flex", gap: 12, alignItems: "center",
                        }}>
                            <img src={selectedProp.img} alt={selectedProp.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{selectedProp.name}</div>
                                <div style={{ fontSize: 11, color: "#888", margin: "2px 0" }}>📍 {selectedProp.location} · {selectedProp.dist}</div>
                                <div style={{ display: "inline-block", background: "#f0eafb", color: "#7C3AED", fontSize: 10, padding: "2px 7px", borderRadius: 9, fontWeight: 600 }}>{selectedProp.type}</div>
                                <div style={{ fontWeight: 800, color: "#7C3AED", fontSize: 15, marginTop: 3 }}>{selectedProp.price}</div>
                            </div>
                            <button onClick={() => setSelectedProp(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa", alignSelf: "flex-start" }}>✕</button>
                        </div>
                    )}
                </div>

                {/* Property list panel */}
                {showList && (
                    <div style={{
                        width: 320, background: "#fff", borderLeft: "1px solid #eee",
                        display: "flex", flexDirection: "column", overflow: "hidden",
                    }}>
                        {/* Header */}
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ fontWeight: 800, fontSize: 17, color: "#222" }}>{visibleCount} Properties</div>
                            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{visibleCount} shown on map</div>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
                            {filteredProps.length === 0 && (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
                                    <div style={{ fontSize: 36, marginBottom: 10 }}>🏚️</div>
                                    <div style={{ fontWeight: 600 }}>No properties found</div>
                                    <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting the radius or filter</div>
                                </div>
                            )}
                            {filteredProps.map(prop => (
                                <PropertyCard
                                    key={prop.id}
                                    prop={prop}
                                    selected={selectedProp?.id === prop.id}
                                    onClick={() => {
                                        setSelectedProp(prop);
                                        if (mapInstanceRef.current) mapInstanceRef.current.setView([prop.lat, prop.lng], 14);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PropertyCard({ prop, selected, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", gap: 10, padding: "10px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                border: `1.5px solid ${selected ? "#7C3AED" : hovered ? "#c4b5fd" : "#eee"}`,
                background: selected ? "#faf7ff" : hovered ? "#fdfcff" : "#fff",
                transition: "all 0.15s", position: "relative",
            }}
        >
            <img src={prop.img} alt={prop.name} style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#222", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prop.name}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}>
                    <span>📍</span> {prop.location} {prop.dist ? `· ${prop.dist}` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#f0eafb", color: "#7C3AED", fontSize: 10, padding: "2px 8px", borderRadius: 9, fontWeight: 600 }}>{prop.type}</span>
                    {prop.status && <span style={{ fontSize: 10, color: prop.status === "Ready to Move" ? "#059669" : "#D97706" }}>● {prop.status}</span>}
                </div>
                <div style={{ fontWeight: 800, color: "#7C3AED", fontSize: 15, marginTop: 4 }}>{prop.price}</div>
                {prop.area && <div style={{ fontSize: 10, color: "#aaa" }}>📐 {prop.area}{prop.beds ? ` · 🛏 ${prop.beds} BHK` : ""}</div>}
            </div>
            <div style={{
                position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%",
                background: selected ? "#7C3AED" : "#e0e0e0",
            }} />
        </div>
    );
}
