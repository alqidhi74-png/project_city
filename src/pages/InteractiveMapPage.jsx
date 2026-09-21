import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ArrowRight, Search, X, Layers, LocateFixed, Compass, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { cityProfile, mapEntities, mapLayers, phases, sources } from "../data/sultan-haitham-city-map-data";
import { mapGeoData, collection, DISPLAY_BOUNDS, DISPLAY_CENTER, entityCoordinates } from "../data/sultan-haitham-city-map-geo";
import "mapbox-gl/dist/mapbox-gl.css";
import "../style/InteractiveMapPage.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
// mapbox-gl refuses to construct a Map without any token, including for the keyless OSM fallback.
mapboxgl.accessToken = MAPBOX_TOKEN || "fallback-only";
// Arabic labels need the RTL plugin loaded eagerly; deferred loading never fires here and drops
// every Arabic label. A repeat call throws, so guard against HMR and StrictMode remounts.
if (mapboxgl.getRTLTextPluginStatus() === "unavailable") {
  mapboxgl.setRTLTextPlugin("https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.3.0/mapbox-gl-rtl-text.js", null, false);
}

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
const CASING_COLOR = "#06231a";
const ROAD_COLOR = "#e0c477";

// Progressive disclosure: the city story reads at low zoom, facilities and footprints arrive later.
const PRIMARY_CATEGORIES = ["neighborhood", "project"];
const SECONDARY_CATEGORIES = mapLayers.map(layer => layer.id).filter(id => !PRIMARY_CATEGORIES.includes(id));
const inCategories = list => ["in", ["get", "category"], ["literal", list]];
const unclustered = list => ["all", ["!", ["has", "point_count"]], inCategories(list)];
const LAYER_RULES = {
  "city-areas": inCategories(PRIMARY_CATEGORIES),
  "city-areas-detail": inCategories(SECONDARY_CATEGORIES),
  "city-borders-casing": inCategories(PRIMARY_CATEGORIES),
  "city-borders": inCategories(PRIMARY_CATEGORIES),
  "city-borders-detail": inCategories(SECONDARY_CATEGORIES),
  "city-roads": ["!=", ["get", "subtype"], "illustrative-street"],
  "city-roads-detail": ["==", ["get", "subtype"], "illustrative-street"],
  "building-footprints": null,
  "city-buildings": null,
  "site-markers": unclustered(PRIMARY_CATEGORIES),
  "site-facilities": unclustered(SECONDARY_CATEGORIES),
};
const HIT_LAYERS = ["clusters", "site-markers", "site-facilities", "city-areas", "city-areas-detail", "city-buildings"];
// Fills stay translucent so satellite imagery keeps reading through the illustrative geometry.
// A zoom expression is only valid as the input of a top-level interpolate, hence the shape here.
const areaOpacity = scale => ["interpolate", ["linear"], ["zoom"],
  12, ["*", 0.09, scale], 15, ["*", 0.14, scale], 17.5, ["*", 0.2, scale]];
const hovered = ["boolean", ["feature-state", "hover"], false];

const SEARCHBOX_URL = "https://api.mapbox.com/search/searchbox/v1/forward";
const GEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/forward";
const GEOCODE_TYPES = "country,region,district,place,locality,neighborhood,street,address";
const PLACE_TYPE_NAMES = {
  country: "دولة", region: "محافظة", district: "ولاية", place: "مدينة", locality: "منطقة",
  neighborhood: "حي", block: "مجمع", postcode: "رمز بريدي", street: "شارع", address: "عنوان", poi: "مكان",
};
const PLACE_ZOOM = {
  country: 5, region: 7.5, district: 9.5, place: 12, locality: 13.5, postcode: 13,
  neighborhood: 15, block: 15.5, street: 16, address: 17, poi: 17,
};

function placeResult(feature) {
  const properties = feature.properties || {};
  const featureType = properties.feature_type || "poi";
  const coordinates = feature.geometry?.coordinates
    || [properties.coordinates?.longitude, properties.coordinates?.latitude];
  return {
    kind: "place",
    id: "place-" + (properties.mapbox_id || feature.id || properties.name + featureType),
    name: properties.name_preferred || properties.name || "",
    // Mapbox sometimes returns an empty leading context slot, which reads as a stray comma.
    detail: (properties.place_formatted || properties.full_address || "").replace(/^[\s،,]+/, ""),
    typeName: properties.poi_category?.[0] || PLACE_TYPE_NAMES[featureType] || "مكان",
    zoom: PLACE_ZOOM[featureType] || 15,
    inOman: properties.context?.country?.country_code?.toLowerCase() === "om",
    coordinates,
  };
}

async function requestFeatures(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("mapbox-search-" + response.status);
  const body = await response.json();
  return body.features || [];
}

// Geocoding covers administrative places and streets; Search Box covers POIs such as
// schools, hospitals and mosques. Oman is preferred through proximity, never restricted.
async function searchMapbox(query, signal) {
  const shared = { q: query, access_token: MAPBOX_TOKEN, language: "ar", proximity: DISPLAY_CENTER.join(",") };
  const [geocoded, points] = await Promise.allSettled([
    requestFeatures(GEOCODE_URL + "?" + new URLSearchParams({ ...shared, limit: "4", types: GEOCODE_TYPES }), signal),
    requestFeatures(SEARCHBOX_URL + "?" + new URLSearchParams({ ...shared, limit: "6" }), signal),
  ]);
  if (geocoded.status === "rejected" && points.status === "rejected") throw geocoded.reason;
  const seen = new Set();
  return [...(geocoded.value || []), ...(points.value || [])].map(placeResult).filter(item => {
    if (!item.name || !Number.isFinite(item.coordinates?.[0])) return false;
    const key = normalize(item.name) + "@" + item.coordinates.map(value => value.toFixed(3)).join();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
    // Oman rises to the top without excluding the wider world from a generic query.
  }).sort((first, second) => Number(second.inOman) - Number(first.inOman));
}

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

// Locally drawn icons/count labels keep the keyless fallback independent of a glyph API.
function makeSprite(id) {
  const canvas = document.createElement("canvas");
  canvas.width = 80; canvas.height = 80;
  const ctx = canvas.getContext("2d");
  const count = id.startsWith("count-");
  const category = id.replace("icon-", "");
  const color = mapLayers.find(layer => layer.id === category)?.color || "#e0c477";
  ctx.fillStyle = "rgba(6,32,24,0.88)"; ctx.strokeStyle = count ? "#d2ad55" : color; ctx.lineWidth = count ? 2.5 : 2;
  ctx.beginPath(); ctx.arc(40, 40, count ? 31 : 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 2.6; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  if (count) {
    ctx.fillStyle = "#f3eee2"; ctx.font = "600 27px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(id.slice(6), 40, 41);
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
    ? { top: 80, bottom: 60, left: 330, right: 290 }
    : { top: 70, bottom: 190, left: 25, right: 25 };
}

export default function InteractiveMapPage() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const searchRef = useRef(null);
  const layersButtonRef = useRef(null);
  const chosenRef = useRef("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [baseNotice, setBaseNotice] = useState(MAPBOX_TOKEN ? "" : "لم يُعثر على VITE_MAPBOX_TOKEN؛ تُعرض خريطة OpenStreetMap الاحتياطية.");
  const [mode, setMode] = useState("2D");
  const [enabled, setEnabled] = useState(initialLayers);
  const [selectedId, setSelectedId] = useState(null);
  const [place, setPlace] = useState(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultIndex, setResultIndex] = useState(-1);
  const [places, setPlaces] = useState([]);
  const [searchState, setSearchState] = useState("idle");
  const [layersOpen, setLayersOpen] = useState(false);
  const selected = byId.get(selectedId);
  const localResults = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return mapEntities.filter(entity => normalize([
      entity.name, entity.category, categories[entity.category], entity.subtype, typeName(entity), entity.status,
    ].join(" ")).includes(needle)).slice(0, 5).map(entity => ({
      kind: "local", id: entity.id, name: entity.name,
      typeName: typeName(entity), detail: entity.status,
    }));
  }, [query]);
  const results = useMemo(() => [...places, ...localResults], [places, localResults]);

  useEffect(() => {
    const term = query.trim();
    const controller = new AbortController();
    // Debounced so typing never fires a request per keystroke.
    const timer = setTimeout(() => {
      if (term.length < 2 || term === chosenRef.current || !MAPBOX_TOKEN) {
        setPlaces([]); setSearchState("idle");
        return;
      }
      setSearchState("loading");
      searchMapbox(term, controller.signal)
        .then(items => { setPlaces(items); setSearchState("ready"); })
        .catch(requestError => {
          if (requestError.name === "AbortError") return;
          setPlaces([]); setSearchState("error");
        });
    }, 320);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  useEffect(() => {
    let alive = true;
    let map;
    let fallback = !MAPBOX_TOKEN;
    let styleTimer;
    let errorTimer;
    let hoveredArea = null;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const model = { enabled: { ...initialLayers }, mode: "2D", selected: null, focus: null, reduced: motion.matches };
    const duration = value => model.reduced ? 0 : value;
    const enabledCategories = () => Object.keys(model.enabled).filter(id => model.enabled[id]);
    const activeFilter = () => ["in", ["get", "category"], ["literal", enabledCategories()]];
    const pointData = () => collection(mapGeoData.points.features.filter(feature => model.enabled[feature.properties.category]));
    const pinData = target => collection(target
      ? [{ type: "Feature", geometry: { type: "Point", coordinates: target.coordinates }, properties: { name: target.name } }]
      : []);
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
      for (const [id, rule] of Object.entries(LAYER_RULES)) {
        map.setFilter(id, rule ? ["all", activeFilter(), rule] : activeFilter());
      }
      map.setLayoutProperty("city-buildings", "visibility", model.mode === "3D" ? "visible" : "none");
      updateSelection();
    };
    const clearPin = () => {
      if (map.getSource("search-pin")) map.getSource("search-pin").setData(pinData(null));
      setPlace(null);
    };
    const flyTo = (center, zoom, length) => map.flyTo({
      center, zoom, pitch: model.mode === "3D" ? 57 : 0, bearing: model.mode === "3D" ? -25 : 0,
      padding: cameraPadding(), duration: duration(length), curve: 1.42, essential: false,
    });
    const selectEntity = id => {
      const entity = byId.get(id);
      if (!entity) return;
      model.enabled[entity.category] = true;
      model.selected = id;
      clearPin();
      setEnabled({ ...model.enabled }); setSelectedId(id); setLayersOpen(false);
      applyLayers();
      const coordinates = mapGeoData.points.features.find(point => point.properties.id === id)?.geometry.coordinates || entityCoordinates(entity);
      const zoom = model.mode === "3D" ? 17.2 : 16.4;
      model.focus = { center: coordinates, zoom };
      flyTo(coordinates, zoom, 1500);
    };
    // Mapbox Streets carries Arabic names; builds without setLanguage need the text-field rewrite.
    const localizeLabels = () => {
      if (fallback) return;
      if (typeof map.setLanguage === "function") { map.setLanguage("ar"); return; }
      for (const layer of map.getStyle().layers) {
        if (layer.type !== "symbol" || !layer.layout?.["text-field"]) continue;
        map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name_ar"], ["get", "name"]]);
      }
    };
    const installLayers = () => {
      if (!alive || map.getSource("sites")) return;
      clearTimeout(styleTimer);
      hoveredArea = null;
      localizeLabels();
      // A touch of desaturation lets the gold palette read over imagery without darkening it.
      if (map.getLayer("satellite")) map.setPaintProperty("satellite", "raster-saturation", -0.12);
      // Illustrative geometry sits under the basemap labels so street names stay legible.
      const anchor = map.getStyle().layers.find(layer => layer.type === "symbol")?.id;
      mapLayers.forEach(layer => { if (!map.hasImage("icon-" + layer.id)) map.addImage("icon-" + layer.id, makeSprite("icon-" + layer.id), { pixelRatio: 2 }); });
      map.addSource("areas", { type: "geojson", data: mapGeoData.areas, generateId: true });
      map.addSource("roads", { type: "geojson", data: mapGeoData.roads });
      map.addSource("buildings", { type: "geojson", data: mapGeoData.buildings });
      map.addSource("sites", { type: "geojson", data: pointData(), cluster: true, clusterRadius: 62, clusterMaxZoom: 14 });
      map.addSource("selected-site", { type: "geojson", data: collection([]) });
      map.addSource("search-pin", { type: "geojson", data: pinData(null) });
      map.addLayer({ id: "city-areas", type: "fill", source: "areas", minzoom: 11.5,
        paint: { "fill-color": categoryColor, "fill-opacity": areaOpacity(["match", ["get", "category"], "project", 1.35, 1]) } }, anchor);
      map.addLayer({ id: "city-areas-detail", type: "fill", source: "areas", minzoom: 14.5,
        paint: { "fill-color": categoryColor, "fill-opacity": areaOpacity(1.6) } }, anchor);
      map.addLayer({ id: "city-borders-casing", type: "line", source: "areas", minzoom: 11.5,
        paint: { "line-color": CASING_COLOR, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 17, 5.5], "line-opacity": 0.45 } }, anchor);
      map.addLayer({ id: "city-borders", type: "line", source: "areas", minzoom: 11.5,
        paint: { "line-color": categoryColor, "line-opacity": ["case", hovered, 1, 0.9],
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, ["case", hovered, 3, 1.8], 17, ["case", hovered, 4.5, 2.8]] } }, anchor);
      map.addLayer({ id: "city-borders-detail", type: "line", source: "areas", minzoom: 14.5,
        paint: { "line-color": categoryColor, "line-width": ["case", hovered, 2.4, 1.3], "line-opacity": 0.85 } }, anchor);
      map.addLayer({ id: "city-roads", type: "line", source: "roads", minzoom: 12,
        paint: { "line-color": ROAD_COLOR, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.9, 18, 3.6], "line-opacity": 0.8 } }, anchor);
      map.addLayer({ id: "city-roads-detail", type: "line", source: "roads", minzoom: 16,
        paint: { "line-color": ROAD_COLOR, "line-width": ["interpolate", ["linear"], ["zoom"], 16, 0.6, 19, 2.2], "line-opacity": 0.45 } }, anchor);
      map.addLayer({ id: "building-footprints", type: "fill", source: "buildings", minzoom: 16,
        paint: { "fill-color": categoryColor, "fill-opacity": 0.45 } }, anchor);
      map.addLayer({ id: "city-buildings", type: "fill-extrusion", source: "buildings", minzoom: 15, layout: { visibility: "none" },
        paint: { "fill-extrusion-color": categoryColor, "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.85 } }, anchor);
      map.addLayer({ id: "selection-boundary", type: "line", source: "areas", filter: ["==", ["get", "entityId"], ""], paint: { "line-color": "#e0c477", "line-width": 3 } });
      map.addLayer({ id: "selection-buildings", type: "line", source: "buildings", minzoom: 15, filter: ["==", ["get", "entityId"], ""], paint: { "line-color": "#e0c477", "line-width": 1.6 } });
      map.addLayer({ id: "selection-glow", type: "circle", source: "selected-site", paint: { "circle-radius": 26, "circle-color": "#d2ad55", "circle-opacity": 0.24, "circle-blur": 0.7 } });
      map.addLayer({ id: "selection-ring", type: "circle", source: "selected-site", paint: { "circle-radius": 17, "circle-color": "#d2ad55", "circle-opacity": 0, "circle-stroke-width": 2, "circle-stroke-color": "#e0c477" } });
      map.addLayer({ id: "clusters", type: "symbol", source: "sites", filter: ["has", "point_count"],
        layout: { "icon-image": ["concat", "count-", ["to-string", ["get", "point_count"]]], "icon-allow-overlap": true,
          "icon-size": ["step", ["get", "point_count"], 0.78, 25, 0.9, 100, 1.04] } });
      map.addLayer({ id: "site-markers", type: "symbol", source: "sites", minzoom: 12.5,
        layout: { "icon-image": ["concat", "icon-", ["get", "category"]], "icon-allow-overlap": true,
          "icon-size": ["interpolate", ["linear"], ["zoom"], 12.5, 0.66, 16, 0.88] } });
      map.addLayer({ id: "site-facilities", type: "symbol", source: "sites", minzoom: 15,
        layout: { "icon-image": ["concat", "icon-", ["get", "category"]], "icon-allow-overlap": false, "icon-padding": 3,
          "icon-size": ["interpolate", ["linear"], ["zoom"], 15, 0.56, 17.5, 0.76] } });
      map.addLayer({ id: "search-pin-halo", type: "circle", source: "search-pin",
        paint: { "circle-radius": 21, "circle-color": "#d2ad55", "circle-opacity": 0.22, "circle-blur": 0.65 } });
      map.addLayer({ id: "search-pin-dot", type: "circle", source: "search-pin",
        paint: { "circle-radius": 6.5, "circle-color": "#e0c477", "circle-stroke-width": 2.5, "circle-stroke-color": "#061d16" } });
      applyLayers();
      setReady(true); setError("");
    };
    const switchToFallback = () => {
      if (!alive || fallback) return;
      fallback = true; clearTimeout(styleTimer);
      setBaseNotice("تعذر تحميل نمط Mapbox؛ تُعرض خريطة OpenStreetMap الاحتياطية.");
      map.setStyle(rasterStyle());
    };
    const onClick = event => {
      if (!map.getLayer("site-markers")) return;
      const hit = map.queryRenderedFeatures(event.point, { layers: HIT_LAYERS.filter(id => map.getLayer(id)) })[0];
      if (!hit) return;
      if (hit.properties.cluster) {
        // mapbox-gl reports the expansion zoom through a callback rather than a promise.
        map.getSource("sites").getClusterExpansionZoom(hit.properties.cluster_id, (clusterError, zoom) => {
          // A category change can invalidate an in-flight cluster.
          if (!alive || clusterError || zoom == null) return;
          map.easeTo({ center: hit.geometry.coordinates, zoom, duration: duration(900) });
        });
        return;
      }
      selectEntity(hit.properties.entityId);
    };
    const setHover = id => {
      if (hoveredArea === id || !map.getSource("areas")) return;
      if (hoveredArea != null) map.setFeatureState({ source: "areas", id: hoveredArea }, { hover: false });
      hoveredArea = id;
      if (hoveredArea != null) map.setFeatureState({ source: "areas", id: hoveredArea }, { hover: true });
    };
    const onMove = event => {
      if (!map.getLayer("site-markers")) return;
      const features = map.queryRenderedFeatures(event.point, { layers: HIT_LAYERS.filter(id => map.getLayer(id)) });
      map.getCanvas().style.cursor = features.length ? "pointer" : "";
      setHover(features.find(feature => feature.source === "areas")?.id ?? null);
    };
    const onImageMissing = event => {
      if (/^count-\d+$/.test(event.id) && !map.hasImage(event.id)) map.addImage(event.id, makeSprite(event.id), { pixelRatio: 2 });
    };
    const onError = event => {
      if (!alive) return;
      if (!fallback) {
        switchToFallback();
        if (event.error?.status === 401) setBaseNotice("توكن Mapbox مرفوض؛ تُعرض خريطة OpenStreetMap الاحتياطية.");
        return;
      }
      if (event.sourceId === "osm") setBaseNotice("تعذر تحميل بعض مربعات الخريطة الأساسية. تحقق من الاتصال؛ تبقى الطبقات التوضيحية قابلة للاستكشاف.");
    };
    const onMotionChange = event => { model.reduced = event.matches; if (event.matches) map.stop(); };
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_TOKEN ? MAPBOX_STYLE : rasterStyle(),
        bounds: DISPLAY_BOUNDS, fitBoundsOptions: { padding: cameraPadding() },
        maxPitch: 70, maxZoom: 20, attributionControl: false, renderWorldCopies: false,
        locale: { "NavigationControl.ZoomIn": "تكبير", "NavigationControl.ZoomOut": "تصغير", "NavigationControl.ResetBearing": "إعادة اتجاه الشمال" },
      });
    } catch {
      errorTimer = setTimeout(() => { if (alive) setError("تعذر تشغيل WebGL. فعّل تسريع الرسومات في المتصفح ثم أعد المحاولة."); }, 0);
      return () => { alive = false; clearTimeout(errorTimer); };
    }
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: false }), "bottom-left");
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
      focusPlace(target) {
        model.selected = null;
        setSelectedId(null); setLayersOpen(false); setPlace(target);
        updateSelection();
        if (map.getSource("search-pin")) map.getSource("search-pin").setData(pinData(target));
        model.focus = { center: target.coordinates, zoom: target.zoom };
        flyTo(target.coordinates, target.zoom, 1800);
      },
      zoomToFocus() {
        if (!model.focus) return;
        flyTo(model.focus.center, Math.min(18.5, model.focus.zoom + 1.6), 1200);
      },
      toggle(id) {
        model.enabled[id] = !model.enabled[id];
        if (!model.enabled[byId.get(model.selected)?.category]) { model.selected = null; setSelectedId(null); }
        setEnabled({ ...model.enabled }); applyLayers();
      },
      setAll(value) {
        Object.keys(model.enabled).forEach(id => { model.enabled[id] = value; });
        if (!value) { model.selected = null; setSelectedId(null); }
        setEnabled({ ...model.enabled }); applyLayers();
      },
      mode(next) {
        model.mode = next; setMode(next);
        if (map.getLayer("city-buildings")) map.setLayoutProperty("city-buildings", "visibility", next === "3D" ? "visible" : "none");
        map.easeTo({ pitch: next === "3D" ? 57 : 0, bearing: next === "3D" ? -25 : 0,
          zoom: next === "3D" ? Math.max(map.getZoom(), 15.2) : map.getZoom(), duration: duration(1500), essential: false });
      },
      overview() {
        map.fitBounds(DISPLAY_BOUNDS, { padding: cameraPadding(), pitch: model.mode === "3D" ? 57 : 0,
          bearing: model.mode === "3D" ? -25 : 0, duration: duration(1400) });
      },
      rotate() { map.easeTo({ bearing: map.getBearing() + 30, duration: duration(900) }); },
      tilt(delta) { map.easeTo({ pitch: Math.max(0, Math.min(70, map.getPitch() + delta)), duration: duration(600) }); },
      clear() { model.selected = null; setSelectedId(null); updateSelection(); clearPin(); },
      clearPin,
    };
    return () => {
      alive = false; clearTimeout(styleTimer); resize.disconnect();
      motion.removeEventListener("change", onMotionChange);
      map.off("style.load", installLayers); map.off("styleimagemissing", onImageMissing);
      map.off("error", onError); map.off("click", onClick); map.off("mousemove", onMove);
      engineRef.current = null; map.remove();
    };
  }, []);

  function choose(item) {
    chosenRef.current = item.name;
    setQuery(item.name); setSearchOpen(false); setResultIndex(-1);
    if (item.kind === "place") engineRef.current?.focusPlace(item);
    else engineRef.current?.select(item.id);
    searchRef.current?.focus();
  }
  function editQuery(value) {
    setQuery(value); setSearchOpen(true); setResultIndex(-1);
    // A fresh search retires the previous result marker instead of stacking pins.
    if (place) engineRef.current?.clearPin();
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
  function closeLayers() { setLayersOpen(false); layersButtonRef.current?.focus(); }
  const option = (item, index) => <li key={item.id} role="option" id={"map-result-" + index} aria-selected={resultIndex === index}>
    <button type="button" disabled={!ready} onClick={() => choose(item)} onMouseDown={event => event.preventDefault()}>
      <span>{item.name}</span>
      <small>{[item.typeName, item.detail].filter(Boolean).join(" · ")}</small>
    </button>
  </li>;
  const info = selected || place;

  return <main className="interactive-map-page" dir="rtl">
    <header className="imap-header">
      <div className="imap-brand"><span className="imap-brand-mark" aria-hidden="true"><MapPin size={19} /></span>
        <div><p>{cityProfile.name}</p><h1>الخريطة التفاعلية</h1></div>
      </div>
      <div className="imap-search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
        <Search size={18} aria-hidden="true" />
        <input ref={searchRef} type="search" value={query}
          placeholder="ابحث عن مكان، حي، شارع، مدرسة، مستشفى أو مشروع..."
          aria-label="ابحث عن مكان، حي، شارع، مدرسة، مستشفى أو مشروع"
          role="combobox" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())}
          aria-controls="map-search-results" aria-activedescendant={searchOpen && resultIndex >= 0 ? "map-result-" + resultIndex : undefined}
          onChange={event => editQuery(event.target.value)}
          onFocus={() => setSearchOpen(true)} onKeyDown={searchKeys} />
        {query && <button type="button" aria-label="مسح البحث" onClick={() => { editQuery(""); searchRef.current?.focus(); }}><X size={17} /></button>}
        {searchOpen && query.trim() && <div className="imap-search-dropdown">
          <ul id="map-search-results" role="listbox" aria-label="نتائج البحث">
            {Boolean(places.length) && <li className="imap-result-group" role="presentation">أماكن على الخريطة</li>}
            {places.map((item, index) => option(item, index))}
            {Boolean(localResults.length) && <li className="imap-result-group" role="presentation">بيانات المنصة (توضيحية)</li>}
            {localResults.map((item, index) => option(item, places.length + index))}
          </ul>
          {searchState === "loading" && <p className="imap-search-state" role="status">جارٍ البحث…</p>}
          {searchState === "error" && <p className="imap-search-state" role="status">تعذر الوصول إلى بحث Mapbox؛ تُعرض نتائج المنصة فقط.</p>}
          {searchState !== "loading" && !results.length && <p className="imap-search-state" role="status">لا توجد نتائج مطابقة.</p>}
        </div>}
      </div>
      <Link to="/" className="imap-home"><ArrowRight size={16} aria-hidden="true" /><span>الرئيسية</span></Link>
    </header>
    <div className="imap-stage">
      <div ref={containerRef} className="imap-canvas" />
      <div className="imap-toolbar" aria-label="أدوات الخريطة">
        <div className="imap-mode" role="group" aria-label="وضع عرض الخريطة">
          {["2D", "3D"].map(value => <button key={value} type="button" disabled={!ready} aria-pressed={mode === value}
            aria-label={value === "2D" ? "عرض ثنائي الأبعاد" : "عرض ثلاثي الأبعاد"} onClick={() => engineRef.current?.mode(value)}>{value}</button>)}
        </div>
        <button type="button" disabled={!ready} title="عرض المخطط كاملًا" aria-label="عرض المخطط كاملًا" onClick={() => engineRef.current?.overview()}><LocateFixed size={18} /></button>
        <button type="button" disabled={!ready} title="تدوير الخريطة" aria-label="تدوير الخريطة" onClick={() => engineRef.current?.rotate()}><Compass size={18} /></button>
        <button type="button" disabled={!ready} title="زيادة الإمالة" aria-label="زيادة الإمالة" onClick={() => engineRef.current?.tilt(10)}><ChevronUp size={18} /></button>
        <button type="button" disabled={!ready} title="تقليل الإمالة" aria-label="تقليل الإمالة" onClick={() => engineRef.current?.tilt(-10)}><ChevronDown size={18} /></button>
      </div>
      <button ref={layersButtonRef} type="button" className={"imap-layers-toggle" + (layersOpen ? " is-open" : "")}
        aria-expanded={layersOpen} aria-controls="map-layer-panel" onClick={() => setLayersOpen(value => !value)}>
        <Layers size={17} aria-hidden="true" /> الطبقات
      </button>
      {layersOpen && <aside className="imap-layers imap-panel" id="map-layer-panel" aria-labelledby="map-layers-title"
        onKeyDown={event => { if (event.key === "Escape") closeLayers(); }}>
        <div className="imap-panel-heading"><h2 id="map-layers-title">طبقات الخريطة</h2>
          <button type="button" aria-label="إغلاق طبقات الخريطة" onClick={closeLayers}><X size={17} /></button>
        </div>
        <div className="imap-layer-bulk">
          <button type="button" disabled={!ready} onClick={() => engineRef.current?.setAll(true)}>إظهار الكل</button>
          <button type="button" disabled={!ready} onClick={() => engineRef.current?.setAll(false)}>إخفاء الكل</button>
        </div>
        <div className="imap-layer-list">{mapLayers.map(layer => <label key={layer.id} className="imap-layer-row">
          <span className="imap-layer-color" style={{ backgroundColor: layer.color }} aria-hidden="true" />
          <span>{layer.name}<small>{layer.entityCount} عنصرًا</small></span>
          <input type="checkbox" role="switch" checked={enabled[layer.id]} disabled={!ready}
            onChange={() => engineRef.current?.toggle(layer.id)} aria-label={layer.name} />
        </label>)}</div>
        <p className="imap-layer-note">تظهر المرافق تدريجيًا مع التكبير لتبقى الخريطة مقروءة.</p>
      </aside>}
      {info && <aside className={"imap-info imap-panel" + (layersOpen ? " drawer-obscured" : "")} aria-label="معلومات الموقع">
        <div className="imap-panel-heading">
          <span className="imap-kicker">{selected ? categories[selected.category] : place.typeName}</span>
          <button type="button" aria-label="إغلاق معلومات الموقع" onClick={() => engineRef.current?.clear()}><X size={17} /></button>
        </div>
        <h2>{info.name}</h2>
        {selected ? <>
          <div className="imap-badges"><span>موقع توضيحي</span>
            {["public-source", "public-name-location-pending"].includes(selected.verificationStatus) && <span>معلومة منشورة</span>}
          </div>
          <p className="imap-description">{selected.description}</p>
          <dl><div><dt>النوع</dt><dd>{typeName(selected)}</dd></div><div><dt>الحالة</dt><dd>{selected.status}</dd></div>
            {selected.phase && <div><dt>المرحلة</dt><dd>{phases.find(phase => phase.id === selected.phase)?.name || selected.phase}</dd></div>}
          </dl>
          {Boolean(selected.sourceIds?.length) && <div className="imap-sources"><h3>مصدر البيانات</h3>
            {selected.sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean).map(source =>
              <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher}<span>{source.title}</span></a>)}
          </div>}
          <p className="imap-location-note">المصدر يخص المعلومة المنشورة؛ ولا يثبت دقة الموقع أو الحدود المعروضة.</p>
        </> : <>
          {place.detail && <p className="imap-description">{place.detail}</p>}
          <dl><div><dt>النوع</dt><dd>{place.typeName}</dd></div></dl>
          <p className="imap-location-note">نتيجة من بحث Mapbox على الخريطة الأساسية.</p>
        </>}
        <button type="button" className="imap-zoom-to" onClick={() => engineRef.current?.zoomToFocus()}>
          <LocateFixed size={15} aria-hidden="true" /> تكبير إلى الموقع
        </button>
      </aside>}
      {!ready && !error && <div className="imap-loading" role="status">جارٍ تجهيز الخريطة…</div>}
      {error && <div className="imap-loading imap-error" role="alert"><p>{error}</p><button type="button" onClick={() => window.location.reload()}>إعادة المحاولة</button></div>}
      {baseNotice && <p className="imap-base-notice" role="status">{baseNotice}</p>}
      <div className="imap-sr-only" role="status" aria-live="polite">{info ? "تم تحديد " + info.name : ""}</div>
    </div>
    <footer className="imap-disclaimer">تصوّر تفاعلي توضيحي — بيانات المنصة بانتظار بيانات GIS الرسمية.</footer>
  </main>;
}
