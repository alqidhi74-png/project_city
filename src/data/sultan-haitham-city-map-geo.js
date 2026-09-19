import { mapEntities } from "./sultan-haitham-city-map-data";

// Display frame in the Seeb area, NOT a surveyed city boundary or official location.
// This adapter is the only place that maps canvas anchors to geographic coordinates.
export const DISPLAY_BOUNDS = [[58.12, 23.55], [58.18, 23.60]];
export const DISPLAY_CENTER = [58.15, 23.575];
export const collection = features => ({ type: "FeatureCollection", features });

export function anchorToCoordinates({ x, y }) {
  return [
    DISPLAY_BOUNDS[0][0] + x / 100 * (DISPLAY_BOUNDS[1][0] - DISPLAY_BOUNDS[0][0]),
    DISPLAY_BOUNDS[1][1] - y / 100 * (DISPLAY_BOUNDS[1][1] - DISPLAY_BOUNDS[0][1]),
  ];
}

function geometryCenter(geometry) {
  if (geometry.type === "Point") return geometry.coordinates;
  const points = [];
  const visit = coords => {
    if (typeof coords[0] === "number") points.push(coords);
    else coords.forEach(visit);
  };
  if (geometry.type === "GeometryCollection") return geometryCenter(geometry.geometries[0]);
  visit(geometry.coordinates);
  return [
    (Math.min(...points.map(p => p[0])) + Math.max(...points.map(p => p[0]))) / 2,
    (Math.min(...points.map(p => p[1])) + Math.max(...points.map(p => p[1]))) / 2,
  ];
}

export function entityCoordinates(entity) {
  if (entity.coordinates) return entity.coordinates;
  if (entity.geometry) return geometryCenter(entity.geometry);
  // Small deterministic canvas offsets separate co-located seed categories, never GIS data.
  const offsets = { neighborhood: [0, 0], project: [0, 0], education: [1.1, 0.8],
    health: [-1.1, 0.8], community: [0, -1.1], green: [1.2, -0.9], mobility: [-1.2, -0.9] };
  const [dx, dy] = offsets[entity.category] || [0, 0];
  return anchorToCoordinates({ x: entity.visualAnchor.x + dx, y: entity.visualAnchor.y + dy });
}

function properties(entity, extra = {}) {
  return {
    id: entity.id, entityId: entity.id, name: entity.name,
    category: entity.category, subtype: entity.subtype || entity.category,
    status: entity.status || "", verificationStatus: entity.verificationStatus,
    // Remains conservative until the replacement GIS dataset is verified.
    isIllustrative: true, ...extra,
  };
}
function feature(entity, geometry, extra = {}) {
  return { type: "Feature", geometry, properties: properties(entity, extra) };
}
function rectangle([x, y], width, height) {
  return { type: "Polygon", coordinates: [[
    [x - width / 2, y - height / 2], [x + width / 2, y - height / 2],
    [x + width / 2, y + height / 2], [x - width / 2, y + height / 2],
    [x - width / 2, y - height / 2],
  ]] };
}

// Future official GeoJSON can be supplied here (KML must first be converted to GeoJSON).
// Join features by properties.id; page components and map interaction stay unchanged.
export function createMapGeoData(entities = mapEntities, officialGeoJSON = collection([])) {
  const supplied = new Map(officialGeoJSON.features.map(item => [item.properties.id, item.geometry]));
  const resolved = entities.map(entity => supplied.has(entity.id)
    ? { ...entity, geometry: supplied.get(entity.id), coordinates: null }
    : entity);
  const points = [], areas = [], roads = [], buildings = [];
  resolved.forEach((entity, index) => {
    const center = entityCoordinates(entity);
    points.push(feature(entity, { type: "Point", coordinates: center }));
    const polygon = entity.geometry && ["Polygon", "MultiPolygon"].includes(entity.geometry.type);
    if (polygon) areas.push(feature(entity, entity.geometry));
    else if (["neighborhood", "project", "green"].includes(entity.category)) {
      const width = entity.category === "neighborhood" ? 0.0028 : entity.category === "green" ? 0.00125 : 0.0018;
      areas.push(feature(entity, rectangle(center, width, width * 0.72)));
    }
    if (entity.category === "mobility") {
      const geometry = entity.geometry && ["LineString", "MultiLineString"].includes(entity.geometry.type)
        ? entity.geometry
        : { type: "LineString", coordinates: [
          [center[0] - 0.0015, center[1] - 0.0007], center,
          [center[0] + 0.0015, center[1] + 0.0007],
        ] };
      roads.push(feature(entity, geometry));
    }
    // Synthetic footprints are never generated on top of a supplied GIS geometry.
    if (entity.geometry || entity.coordinates) return;
    if (entity.category === "neighborhood") {
      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const apartment = (row + col + index) % 7 === 0;
          buildings.push(feature(entity, rectangle([
            center[0] + (col - 2.5) * 0.0004,
            center[1] + (row - 2.5) * 0.00028,
          ], 0.00023, 0.00016), {
            id: entity.id + "-building-" + row + "-" + col,
            subtype: apartment ? "illustrative-apartment" : "illustrative-villa",
            height: apartment ? 16 + (row + col) % 10 : 7 + (row + col) % 6,
          }));
        }
      }
      for (let lane = 0; lane < 7; lane += 1) {
        roads.push(feature(entity, { type: "LineString", coordinates: [
          [center[0] - 0.00135, center[1] + (lane - 3) * 0.00028],
          [center[0] + 0.00135, center[1] + (lane - 3) * 0.00028],
        ] }, { id: entity.id + "-lane-" + lane, category: "mobility", subtype: "illustrative-street" }));
      }
    } else if (["education", "health", "community", "project"].includes(entity.category)) {
      const heights = { education: 12, health: 14, community: 16, project: 18 };
      buildings.push(feature(entity, rectangle(center, 0.0005, 0.00035), {
        id: entity.id + "-building", height: heights[entity.category],
        subtype: entity.category === "project" ? "illustrative-commercial" : entity.subtype,
      }));
    }
  });
  // Connect neighborhood streets into a readable demonstration network.
  const districts = resolved.filter(entity => entity.category === "neighborhood");
  if (districts.length > 1) {
    const roadEntity = resolved.find(entity => entity.id === "boulevard") || districts[0];
    roads.push(feature(roadEntity, { type: "LineString", coordinates: [
      ...districts.map(entityCoordinates), entityCoordinates(districts[0]),
    ] }, { id: "illustrative-ring-road", category: "mobility", subtype: "illustrative-road" }));
  }
  return { points: collection(points), areas: collection(areas), roads: collection(roads), buildings: collection(buildings) };
}

export const mapGeoData = createMapGeoData();
