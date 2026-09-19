import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { ArrowRight, Search, X, Layers, LocateFixed, Compass, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { cityProfile, mapEntities, mapLayers, phases, sources } from "../data/sultan-haitham-city-map-data";
import { mapGeoData, collection, DISPLAY_BOUNDS, entityCoordinates } from "../data/sultan-haitham-city-map-geo";
import "maplibre-gl/dist/maplibre-gl.css";
import "../style/InteractiveMapPage.css";

// Explicitly bundle the module worker so Vite development and production use the same asset.
maplibregl.setWorkerUrl(mapWorkerUrl);

const initialLayers = Object.fromEntries(mapLayers.map(layer => [layer.id, true]));
const byId = new Map(mapEntities.map(entity => [entity.id, entity]));
const categories = Object.fromEntries(mapLayers.map(layer => [layer.id, layer.name]));
const subtypeNames = {
  "integrated-neighborhood": "حي متكامل", "public-school": "مدرسة حكومية",
  "private-school": "مدرسة خاصة", "health-center": "مركز صحي",
  "reference-hospital": "مستشفى مرجعي", "private-hospital": "مستشفى خاص",
  "care-center": "مركز رعاية", worship: "موقع عبادة", "central-park": "حديقة مركزية",
  "central-valley": "وادٍ مركزي", "green-space": "مساحة خضراء",
  boulevard: "بوليفارد", "access-point": "مدخل مدينة",
  "active-mobility-corridor": "مسار حركة خفيفة", project: "مشروع",
};
const typeName = entity => subtypeNames[entity.subtype || entity.category] || categories[entity.category];
const normalize = value => String(value || "").normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").toLowerCase();
const categoryColor = ["match", ["get", "category"], ...mapLayers.flatMap(layer => [layer.id, layer.color]), "#d2ad55"];

function rasterStyle() {
  return {
    version: 8,
    sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>' } },
    layers: [
      { id: "base-background", type: "background", paint: { "background-color": "#173b2d" } },
      { id: "base-osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.7, "raster-opacity": 0.78 } },
    ],
  };
}

// Locally drawn icons/count labels keep the keyless style independent of a glyph API.
function makeSprite(id) {
  const canvas = document.createElement("canvas");
  canvas.width = 80; canvas.height = 80;
  const ctx = canvas.getContext("2d");
  const count = id.startsWith("count-");
  const category = id.replace("icon-", "");
  const color = mapLayers.find(layer => layer.id === category)?.color || "#e0c477";
  ctx.fillStyle = "#0b281e"; ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(40, 40, count ? 31 : 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  if (count) {
    ctx.fillStyle = "#f3eee2"; ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(id.slice(6), 40, 41);
  } else if (category === "education") {
    ctx.moveTo(40, 31); ctx.lineTo(26, 28); ctx.lineTo(26, 48); ctx.lineTo(40, 51); ctx.lineTo(54, 48); ctx.lineTo(54, 28); ctx.lineTo(40, 31); ctx.lineTo(40, 51); ctx.stroke();
  } else if (category === "health") {
    ctx.moveTo(40, 27); ctx.lineTo(40, 53); ctx.moveTo(27, 40); ctx.lineTo(53, 40); ctx.stroke();
  } else if (category === "green") {
    ctx.ellipse(40, 39, 10, 16, Math.PI / 4, 0, Math.PI * 2); ctx.moveTo(30, 52); ctx.lineTo(47, 31); ctx.stroke();
  } else if (category === "community") {
    ctx.moveTo(27, 49); ctx.lineTo(27, 39); ctx.quadraticCurveTo(40, 19, 53, 39); ctx.lineTo(53, 49); ctx.closePath(); ctx.moveTo(40, 25); ctx.lineTo(40, 20); ctx.stroke();
  } else if (category === "mobility") {
    ctx.moveTo(28, 54); ctx.lineTo(35, 26); ctx.moveTo(52, 54); ctx.lineTo(45, 26); ctx.moveTo(40, 48); ctx.lineTo(40, 41); ctx.moveTo(40, 34); ctx.lineTo(40, 29); ctx.stroke();
  } else {
    ctx.moveTo(25, 37); ctx.lineTo(40, 25); ctx.lineTo(55, 37); ctx.moveTo(30, 34); ctx.lineTo(30, 53); ctx.lineTo(50, 53); ctx.lineTo(50, 34); ctx.moveTo(37, 53); ctx.lineTo(37, 43); ctx.lineTo(43, 43); ctx.lineTo(43, 53); ctx.stroke();
  }
  return ctx.getImageData(0, 0, 80, 80);
}

function cameraPadding() {
  return window.innerWidth > 1050
    ? { top: 85, bottom: 75, left: 310, right: 280 }
    : { top: 85, bottom: 220, left: 35, right: 35 };
}

export default function InteractiveMapPage() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const searchRef = useRef(null);
  const drawerButtonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [baseNotice, setBaseNotice] = useState("");
  const [mode, setMode] = useState("2D");
  const [enabled, setEnabled] = useState(initialLayers);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultIndex, setResultIndex] = useState(-1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selected = byId.get(selectedId);
  const results = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return mapEntities.filter(entity => normalize([
      entity.name, entity.category, categories[entity.category], entity.subtype, typeName(entity), entity.status,
    ].join(" ")).includes(needle));
  }, [query]);

  useEffect(() => {
    let alive = true;
    let map;
    let fallback = !import.meta.env.VITE_MAPTILER_KEY;
    let styleTimer;
    let errorTimer;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const model = { enabled: { ...initialLayers }, mode: "2D", selected: null, reduced: motion.matches };
    const duration = () => model.reduced ? 0 : 1100;
    const enabledCategories = () => Object.keys(model.enabled).filter(id => model.enabled[id]);
    const activeFilter = () => ["in", ["get", "category"], ["literal", enabledCategories()]];
    const pointData = () => collection(mapGeoData.points.features.filter(feature => model.enabled[feature.properties.category]));
    const updateSelection = () => {
      if (!map.getSource("selected-site")) return;
      map.getSource("selected-site").setData(collection(mapGeoData.points.features.filter(feature =>
        feature.properties.id === model.selected && model.enabled[feature.properties.category])));
      const filter = ["all", activeFilter(), ["==", ["get", "entityId"], model.selected || ""]];
      map.setFilter("selection-boundary", filter);
      map.setFilter("selection-buildings", filter);
    };
    const applyLayers = () => {
      if (!map.getSource("sites")) return;
      map.getSource("sites").setData(pointData());
      for (const id of ["city-areas", "city-borders", "city-roads", "building-footprints", "city-buildings"]) map.setFilter(id, activeFilter());
      map.setLayoutProperty("city-buildings", "visibility", model.mode === "3D" ? "visible" : "none");
      updateSelection();
    };
    const selectEntity = id => {
      const entity = byId.get(id);
      if (!entity) return;
      model.enabled[entity.category] = true;
      model.selected = id;
      setEnabled({ ...model.enabled }); setSelectedId(id); setDrawerOpen(false);
      applyLayers();
      const coordinates = mapGeoData.points.features.find(point => point.properties.id === id)?.geometry.coordinates || entityCoordinates(entity);
      map.flyTo({ center: coordinates, zoom: model.mode === "3D" ? 17.2 : 16,
        pitch: model.mode === "3D" ? 56 : 0, bearing: model.mode === "3D" ? -30 : 0,
        padding: cameraPadding(), duration: duration(), essential: false });
    };
    const installLayers = () => {
      if (!alive || map.getSource("sites")) return;
      clearTimeout(styleTimer);
      mapLayers.forEach(layer => { if (!map.hasImage("icon-" + layer.id)) map.addImage("icon-" + layer.id, makeSprite("icon-" + layer.id), { pixelRatio: 2 }); });
      map.addSource("areas", { type: "geojson", data: mapGeoData.areas });
      map.addSource("roads", { type: "geojson", data: mapGeoData.roads });
      map.addSource("buildings", { type: "geojson", data: mapGeoData.buildings });
      map.addSource("sites", { type: "geojson", data: pointData(), cluster: true, clusterRadius: 52, clusterMaxZoom: 14 });
      map.addSource("selected-site", { type: "geojson", data: collection([]) });
      map.addLayer({ id: "city-areas", type: "fill", source: "areas", paint: { "fill-color": categoryColor, "fill-opacity": ["match", ["get", "category"], "green", 0.65, "project", 0.32, 0.19] } });
      map.addLayer({ id: "city-borders", type: "line", source: "areas", paint: { "line-color": categoryColor, "line-width": 1.5, "line-opacity": 0.8 } });
      map.addLayer({ id: "city-roads", type: "line", source: "roads", paint: { "line-color": "#e0c477", "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 18, 5], "line-opacity": 0.8 } });
      map.addLayer({ id: "building-footprints", type: "fill", source: "buildings", minzoom: 14, paint: { "fill-color": categoryColor, "fill-opacity": 0.7 } });
      map.addLayer({ id: "city-buildings", type: "fill-extrusion", source: "buildings", minzoom: 13,
        layout: { visibility: "none" }, paint: { "fill-extrusion-color": categoryColor, "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.92 } });
      map.addLayer({ id: "selection-boundary", type: "line", source: "areas", filter: ["==", ["get", "entityId"], ""], paint: { "line-color": "#e0c477", "line-width": 4 } });
      map.addLayer({ id: "selection-buildings", type: "line", source: "buildings", filter: ["==", ["get", "entityId"], ""], paint: { "line-color": "#e0c477", "line-width": 2 } });
      map.addLayer({ id: "selection-glow", type: "circle", source: "selected-site", paint: { "circle-radius": 30, "circle-color": "#d2ad55", "circle-opacity": 0.26, "circle-blur": 0.7 } });
      map.addLayer({ id: "selection-ring", type: "circle", source: "selected-site", paint: { "circle-radius": 20, "circle-color": "#d2ad55", "circle-opacity": 0, "circle-stroke-width": 2, "circle-stroke-color": "#e0c477" } });
      map.addLayer({ id: "clusters", type: "symbol", source: "sites", filter: ["has", "point_count"],
        layout: { "icon-image": ["concat", "count-", ["to-string", ["get", "point_count"]]], "icon-allow-overlap": true } });
      map.addLayer({ id: "site-markers", type: "symbol", source: "sites", filter: ["!", ["has", "point_count"]],
        layout: { "icon-image": ["concat", "icon-", ["get", "category"]], "icon-allow-overlap": true, "icon-padding": 4 } });
      applyLayers();
      setReady(true); setError("");
    };
    const switchToFallback = () => {
      if (!alive || fallback) return;
      fallback = true; clearTimeout(styleTimer);
      setBaseNotice("تعذر تحميل نمط MapTiler؛ تُعرض خريطة OpenStreetMap الاحتياطية.");
      map.setStyle(rasterStyle());
    };
    const onClick = async event => {
      if (!map.getLayer("site-markers")) return;
      const features = map.queryRenderedFeatures(event.point, { layers: ["clusters", "site-markers", "city-areas", "city-buildings"] });
      const hit = features[0];
      if (!hit) return;
      if (hit.properties.cluster) {
        try {
          const zoom = await map.getSource("sites").getClusterExpansionZoom(hit.properties.cluster_id);
          if (alive) map.easeTo({ center: hit.geometry.coordinates, zoom, duration: duration() });
        } catch { /* A category change can invalidate an in-flight cluster. */ }
      } else selectEntity(hit.properties.entityId);
    };
    const onMove = event => {
      if (!map.getLayer("site-markers")) return;
      map.getCanvas().style.cursor = map.queryRenderedFeatures(event.point, { layers: ["clusters", "site-markers", "city-areas", "city-buildings"] }).length ? "pointer" : "";
    };
    const onImageMissing = event => {
      if (/^count-\d+$/.test(event.id) && !map.hasImage(event.id)) map.addImage(event.id, makeSprite(event.id), { pixelRatio: 2 });
    };
    const onError = event => {
      if (!alive) return;
      if (!fallback) { switchToFallback(); return; }
      if (event.sourceId === "osm") setBaseNotice("تعذر تحميل بعض مربعات الخريطة الأساسية. تحقق من الاتصال؛ تبقى الطبقات التوضيحية قابلة للاستكشاف.");
    };
    const onMotionChange = event => { model.reduced = event.matches; if (event.matches) map.stop(); };
    try {
      const key = import.meta.env.VITE_MAPTILER_KEY;
      map = new maplibregl.Map({
        container: containerRef.current,
        style: key ? "https://api.maptiler.com/maps/streets-v2/style.json?key=" + encodeURIComponent(key) : rasterStyle(),
        bounds: DISPLAY_BOUNDS, fitBoundsOptions: { padding: cameraPadding() },
        maxPitch: 70, maxZoom: 20, attributionControl: false, renderWorldCopies: false,
        locale: { "NavigationControl.ZoomIn": "تكبير", "NavigationControl.ZoomOut": "تصغير", "NavigationControl.ResetBearing": "إعادة اتجاه الشمال" },
      });
    } catch {
      errorTimer = setTimeout(() => { if (alive) setError("تعذر تشغيل WebGL. فعّل تسريع الرسومات في المتصفح ثم أعد المحاولة."); }, 0);
      return () => { alive = false; clearTimeout(errorTimer); };
    }
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-left");
    map.touchZoomRotate.enableRotation();
    map.getCanvas().setAttribute("aria-label", "خريطة تفاعلية توضيحية. استخدم الأسهم للتحريك، وزري الجمع والطرح للتكبير والتصغير.");
    map.on("style.load", installLayers);
    map.on("styleimagemissing", onImageMissing);
    map.on("error", onError);
    map.on("click", onClick);
    map.on("mousemove", onMove);
    motion.addEventListener("change", onMotionChange);
    if (!fallback) styleTimer = setTimeout(switchToFallback, 12000);
    const resize = new ResizeObserver(() => {
      map.resize();
      map.setPadding(cameraPadding());
    });
    resize.observe(containerRef.current);
    engineRef.current = {
      select: selectEntity,
      toggle(id) {
        model.enabled[id] = !model.enabled[id];
        if (!model.enabled[byId.get(model.selected)?.category]) { model.selected = null; setSelectedId(null); }
        setEnabled({ ...model.enabled }); applyLayers();
      },
      mode(next) {
        model.mode = next; setMode(next);
        if (map.getLayer("city-buildings")) map.setLayoutProperty("city-buildings", "visibility", next === "3D" ? "visible" : "none");
        map.easeTo({ pitch: next === "3D" ? 56 : 0, bearing: next === "3D" ? -30 : 0,
          zoom: next === "3D" ? Math.max(map.getZoom(), 14.5) : map.getZoom(), duration: duration() });
      },
      overview() { map.fitBounds(DISPLAY_BOUNDS, { padding: cameraPadding(), pitch: model.mode === "3D" ? 56 : 0, bearing: model.mode === "3D" ? -30 : 0, duration: duration() }); },
      rotate() { map.easeTo({ bearing: map.getBearing() + 30, duration: duration() }); },
      tilt(delta) { map.easeTo({ pitch: Math.max(0, Math.min(70, map.getPitch() + delta)), duration: duration() }); },
      clear() { model.selected = null; setSelectedId(null); updateSelection(); },
    };
    return () => {
      alive = false; clearTimeout(styleTimer); resize.disconnect();
      motion.removeEventListener("change", onMotionChange);
      map.off("style.load", installLayers); map.off("styleimagemissing", onImageMissing);
      map.off("error", onError); map.off("click", onClick); map.off("mousemove", onMove);
      engineRef.current = null; map.remove();
    };
  }, []);

  function choose(entity) {
    engineRef.current?.select(entity.id); setQuery(entity.name); setSearchOpen(false); setResultIndex(-1);
    searchRef.current?.focus();
  }
  function searchKeys(event) {
    if (event.key === "Escape") { setSearchOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); setSearchOpen(true);
      const next = results.length ? (resultIndex + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : -1;
      setResultIndex(next);
      document.getElementById("map-result-" + next)?.scrollIntoView({ block: "nearest" });
    }
    if (event.key === "Enter" && results.length && ready) { event.preventDefault(); choose(results[Math.max(0, resultIndex)]); }
  }
  function closeDrawer() { setDrawerOpen(false); drawerButtonRef.current?.focus(); }

  return <main className="interactive-map-page" dir="rtl">
    <header className="imap-header">
      <div className="imap-brand"><span className="imap-brand-mark" aria-hidden="true"><MapPin size={24} /></span>
        <div><p>{cityProfile.name}</p><h1>الخريطة التفاعلية</h1></div>
      </div>
      <div className="imap-search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
        <Search size={19} aria-hidden="true" />
        <input ref={searchRef} type="search" value={query} placeholder="ابحث عن حي أو مشروع أو مرفق" aria-label="ابحث عن حي أو مشروع أو مرفق"
          role="combobox" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())}
          aria-controls="map-search-results" aria-activedescendant={searchOpen && resultIndex >= 0 ? "map-result-" + resultIndex : undefined}
          onChange={event => { setQuery(event.target.value); setSearchOpen(true); setResultIndex(-1); }}
          onFocus={() => setSearchOpen(true)} onKeyDown={searchKeys} />
        {query && <button type="button" aria-label="مسح البحث" onClick={() => { setQuery(""); setResultIndex(-1); searchRef.current?.focus(); }}><X size={18} /></button>}
        {searchOpen && query.trim() && <div className="imap-search-dropdown">
          <ul id="map-search-results" role="listbox" aria-label="نتائج البحث">
            {results.map((entity, index) => <li key={entity.id} role="option" id={"map-result-" + index} aria-selected={resultIndex === index}>
              <button type="button" disabled={!ready} onClick={() => choose(entity)} onMouseDown={event => event.preventDefault()}>
                <span>{entity.name}</span><small>{typeName(entity)} · {entity.status}</small>
              </button>
            </li>)}
          </ul>
          {!results.length && <p role="status">لا توجد نتائج مطابقة.</p>}
        </div>}
      </div>
      <Link to="/" className="imap-home"><ArrowRight size={17} aria-hidden="true" /><span>العودة للرئيسية</span></Link>
    </header>
    <div className="imap-stage">
      <div ref={containerRef} className="imap-canvas" />
      <div className="imap-toolbar" aria-label="أدوات الخريطة">
        <div className="imap-mode" role="group" aria-label="وضع عرض الخريطة">
          {["2D", "3D"].map(value => <button key={value} type="button" disabled={!ready} aria-pressed={mode === value}
            aria-label={value === "2D" ? "عرض ثنائي الأبعاد" : "عرض ثلاثي الأبعاد"} onClick={() => engineRef.current?.mode(value)}>{value}</button>)}
        </div>
        <button type="button" disabled={!ready} title="عرض المخطط كاملًا" aria-label="عرض المخطط كاملًا" onClick={() => engineRef.current?.overview()}><LocateFixed size={19} /></button>
        <button type="button" disabled={!ready} title="تدوير الخريطة" aria-label="تدوير الخريطة" onClick={() => engineRef.current?.rotate()}><Compass size={19} /></button>
        <button type="button" disabled={!ready} title="زيادة الإمالة" aria-label="زيادة الإمالة" onClick={() => engineRef.current?.tilt(10)}><ChevronUp size={19} /></button>
        <button type="button" disabled={!ready} title="تقليل الإمالة" aria-label="تقليل الإمالة" onClick={() => engineRef.current?.tilt(-10)}><ChevronDown size={19} /></button>
      </div>
      <button ref={drawerButtonRef} type="button" className="imap-layers-toggle" aria-expanded={drawerOpen} aria-controls="map-layer-panel"
        onClick={() => setDrawerOpen(value => !value)}><Layers size={18} aria-hidden="true" /> الطبقات</button>
      <aside className={"imap-layers imap-panel" + (drawerOpen ? " is-open" : "")} id="map-layer-panel" aria-labelledby="map-layers-title"
        onKeyDown={event => { if (event.key === "Escape") closeDrawer(); }}>
        <div className="imap-panel-heading"><h2 id="map-layers-title"><Layers size={18} aria-hidden="true" /> طبقات الخريطة</h2>
          <button type="button" className="imap-drawer-close" aria-label="إغلاق طبقات الخريطة" onClick={closeDrawer}><X size={18} /></button>
        </div>
        <p className="imap-panel-intro">اختر ما تودّ استكشافه</p>
        <div className="imap-layer-list">{mapLayers.map(layer => <label key={layer.id} className="imap-layer-row">
          <span className="imap-layer-color" style={{ backgroundColor: layer.color }} aria-hidden="true" />
          <span>{layer.name}<small>{layer.entityCount} عنصرًا</small></span>
          <input type="checkbox" role="switch" checked={enabled[layer.id]} disabled={!ready}
            onChange={() => engineRef.current?.toggle(layer.id)} aria-label={layer.name} />
        </label>)}</div>
        <p className="imap-layer-note">الألوان تميّز الفئات، والحد الذهبي يحدّد العنصر المختار.</p>
      </aside>
      <aside className={"imap-info imap-panel" + (drawerOpen ? " drawer-obscured" : "")} aria-label="معلومات الموقع">
        {selected ? <>
          <div className="imap-panel-heading"><span className="imap-kicker">{categories[selected.category]}</span>
            <button type="button" aria-label="إغلاق معلومات الموقع" onClick={() => engineRef.current?.clear()}><X size={18} /></button>
          </div>
          <h2>{selected.name}</h2>
          <div className="imap-badges"><span>موقع توضيحي</span>
            {["public-source", "public-name-location-pending"].includes(selected.verificationStatus) && <span>معلومة منشورة</span>}
          </div>
          <p className="imap-description">{selected.description}</p>
          <dl><div><dt>النوع</dt><dd>{typeName(selected)}</dd></div><div><dt>الحالة</dt><dd>{selected.status}</dd></div>
            {selected.phase && <div><dt>المرحلة</dt><dd>{phases.find(phase => phase.id === selected.phase)?.name || selected.phase}</dd></div>}
          </dl>
          <div className="imap-sources"><h3>مصدر البيانات</h3>
            {(selected.sourceIds || []).map(id => sources.find(source => source.id === id)).filter(Boolean).map(source =>
              <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher}<span>{source.title}</span></a>)}
          </div>
          <p className="imap-location-note">المصدر يخص المعلومة المنشورة؛ ولا يثبت دقة الموقع أو الحدود المعروضة.</p>
        </> : <div className="imap-empty"><MapPin size={28} aria-hidden="true" /><h2>استكشف المدينة</h2><p>اختر حيًا أو مشروعًا أو مرفقًا لاستكشاف معلوماته.</p><small>ابحث بالاسم، أو اضغط على علامة في الخريطة.</small></div>}
      </aside>
      {!ready && !error && <div className="imap-loading" role="status">جارٍ تجهيز الخريطة…</div>}
      {error && <div className="imap-loading imap-error" role="alert"><p>{error}</p><button type="button" onClick={() => window.location.reload()}>إعادة المحاولة</button></div>}
      {baseNotice && <p className="imap-base-notice" role="status">{baseNotice}</p>}
      <div className="imap-sr-only" role="status" aria-live="polite">{selected ? "تم تحديد " + selected.name : ""}</div>
    </div>
    <footer className="imap-disclaimer">تصوّر تفاعلي توضيحي — المواقع والحدود بانتظار بيانات GIS الرسمية.</footer>
  </main>;
}
