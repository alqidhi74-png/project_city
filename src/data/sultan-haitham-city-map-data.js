/**
 * Sultan Haitham City — Map data seed
 * Date prepared: 2026-09-19
 *
 * Important:
 * - This file is a source-aware content seed for a visual 3D map prototype.
 * - visualAnchor uses a 0–100 canvas coordinate only; it is NOT a geographic coordinate.
 * - Do not convert a visualAnchor to a real location or claim map accuracy.
 * - Replace coordinates and geometry with official Ministry GIS/GeoJSON/KML data when supplied.
 */

export const DATASET_VERSION = '0.1.0';

export const sources = [
  {
    id: 'gov-om-land-service',
    publisher: 'Gov.om / Ministry of Housing and Urban Planning',
    title: 'Request a Residential Land in Sultan Haitham City',
    url: 'https://gov.om/en/w/request-a-residential-land-in-future-cities-or-sultan-haitham-city',
    sourceType: 'official',
    accessedAt: '2026-09-19',
  },
  {
    id: 'oman-tv-city-model',
    publisher: 'Oman TV News',
    title: 'Sultan Haitham City: model of sustainable smart cities',
    url: 'https://www.youtube.com/watch?v=FTbQr-zlL_E',
    sourceType: 'state-media',
    accessedAt: '2026-09-19',
  },
  {
    id: 'oman-tv-phase-one',
    publisher: 'Oman TV News',
    title: 'Sultan Haitham City: 1st phase agreements signed',
    url: 'https://www.youtube.com/watch?v=iV7wXKY0ITc',
    sourceType: 'state-media',
    accessedAt: '2026-09-19',
  },
];

const visualAnchor = (index, total, ring = 0) => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const radiusX = 30 - ring * 5;
  const radiusY = 22 - ring * 4;
  return {
    x: Number((50 + Math.cos(angle) * radiusX).toFixed(1)),
    y: Number((50 + Math.sin(angle) * radiusY).toFixed(1)),
    kind: 'illustrative-canvas-anchor',
  };
};

const futureEntity = ({ id, name, category, index, total, sourceId, phase = null, subtype = null }) => ({
  id,
  name,
  category,
  subtype,
  phase,
  status: 'مخطط',
  verificationStatus: 'aggregate-published-detail-location-pending',
  sourceIds: [sourceId],
  coordinates: null,
  geometry: null,
  visualAnchor: visualAnchor(index, total, index % 3),
  locationAccuracy: 'illustrative-only',
  description: 'عنصر مخطط ضمن بيانات المدينة. الموقع المرئي توضيحي إلى حين استلام بيانات مكانية رسمية.',
});

export const cityProfile = {
  id: 'sultan-haitham-city',
  name: 'مدينة السلطان هيثم',
  wilayat: 'السيب',
  governorate: 'مسقط',
  terrainNote: 'مدينة مخططة على أرض مستوية في نطاق السيب؛ لا تستخدم تضاريس جبلية في النموذج البصري.',
  sourceIds: ['gov-om-land-service', 'oman-tv-city-model'],
  verificationStatus: 'public-source',
};

export const cityIndicators = [
  { id: 'area', label: 'المساحة الإجمالية المخططة', value: 14.8, unit: 'مليون م²', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'population', label: 'السكان المستهدفون', value: 100000, unit: 'نسمة', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'homes', label: 'الوحدات السكنية المستهدفة', value: 20000, unit: 'وحدة', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'neighborhoods', label: 'الأحياء المتكاملة المستهدفة', value: 19, unit: 'حيًا', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'green-space', label: 'المساحات الخضراء المخططة', value: 2.9, unit: 'مليون م²', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'phase-one-units', label: 'وحدات المرحلة الأولى', value: 6743, unit: 'وحدة', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'phase-one-population', label: 'سعة المرحلة الأولى', value: 35000, unit: 'نسمة تقريبًا', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'boulevard', label: 'طول البوليفارد المخطط', value: 3.4, unit: 'كم', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'main-streets', label: 'الشوارع الرئيسية المخططة', value: 32, unit: 'كم', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'walkways', label: 'مسارات المشي والحركة الخفيفة', value: 25, unit: 'كم', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
];

export const phases = [
  { id: 'phase-1', name: 'المرحلة الأولى', startYear: 2024, endYear: 2030, status: 'قيد التنفيذ/التطوير', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'public-source' },
  { id: 'phase-2', name: 'المرحلة الثانية', startYear: 2028, endYear: 2035, status: 'مخطط', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'phase-3', name: 'المرحلة الثالثة', startYear: 2033, endYear: 2040, status: 'مخطط', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
  { id: 'phase-4', name: 'المرحلة الرابعة', startYear: 2038, endYear: 2045, status: 'مخطط', sourceIds: ['oman-tv-city-model'], verificationStatus: 'needs-official-dataset-validation' },
];

export const neighborhoods = Array.from({ length: 19 }, (_, index) => futureEntity({
  id: `neighborhood-${String(index + 1).padStart(2, '0')}`,
  name: `حي متكامل ${String(index + 1).padStart(2, '0')}`,
  category: 'neighborhood',
  subtype: 'integrated-neighborhood',
  index,
  total: 19,
  phase: index < 6 ? 'phase-1' : index < 10 ? 'phase-2' : index < 14 ? 'phase-3' : 'phase-4',
  sourceId: 'oman-tv-city-model',
}));

export const schools = [
  ...Array.from({ length: 30 }, (_, index) => futureEntity({
    id: `public-school-${String(index + 1).padStart(2, '0')}`,
    name: `مدرسة حكومية مخططة ${String(index + 1).padStart(2, '0')}`,
    category: 'education',
    subtype: 'public-school',
    index,
    total: 30,
    sourceId: 'oman-tv-city-model',
  })),
  ...Array.from({ length: 9 }, (_, index) => futureEntity({
    id: `private-school-${String(index + 1).padStart(2, '0')}`,
    name: `مدرسة خاصة مخططة ${String(index + 1).padStart(2, '0')}`,
    category: 'education',
    subtype: 'private-school',
    index: index + 30,
    total: 39,
    sourceId: 'oman-tv-city-model',
  })),
];

export const healthFacilities = [
  ...Array.from({ length: 8 }, (_, index) => futureEntity({
    id: `health-center-${String(index + 1).padStart(2, '0')}`,
    name: `مركز صحي مخطط ${String(index + 1).padStart(2, '0')}`,
    category: 'health',
    subtype: 'health-center',
    index,
    total: 8,
    sourceId: 'oman-tv-city-model',
  })),
  futureEntity({ id: 'reference-hospital', name: 'مستشفى مرجعي مخطط', category: 'health', subtype: 'reference-hospital', index: 8, total: 11, sourceId: 'oman-tv-city-model' }),
  futureEntity({ id: 'private-hospital', name: 'مستشفى خاص مخطط', category: 'health', subtype: 'private-hospital', index: 9, total: 11, sourceId: 'oman-tv-city-model' }),
  futureEntity({ id: 'care-center', name: 'مركز رعاية كبار السن والأشخاص ذوي الإعاقة', category: 'health', subtype: 'care-center', index: 10, total: 11, sourceId: 'oman-tv-city-model' }),
];

export const worshipFacilities = Array.from({ length: 25 }, (_, index) => futureEntity({
  id: `worship-${String(index + 1).padStart(2, '0')}`,
  name: `موقع عبادة مخطط ${String(index + 1).padStart(2, '0')}`,
  category: 'community',
  subtype: 'worship',
  index,
  total: 25,
  sourceId: 'oman-tv-city-model',
}));

export const greenSpaces = [
  futureEntity({ id: 'central-park', name: 'الحديقة المركزية', category: 'green', subtype: 'central-park', index: 0, total: 25, sourceId: 'oman-tv-city-model' }),
  futureEntity({ id: 'central-valley', name: 'الوادي المركزي', category: 'green', subtype: 'central-valley', index: 1, total: 25, sourceId: 'oman-tv-city-model' }),
  ...Array.from({ length: 23 }, (_, index) => futureEntity({
    id: `green-space-${String(index + 1).padStart(2, '0')}`,
    name: `مساحة خضراء مخططة ${String(index + 1).padStart(2, '0')}`,
    category: 'green',
    subtype: 'green-space',
    index: index + 2,
    total: 25,
    sourceId: 'oman-tv-city-model',
  })),
];

export const mobility = [
  futureEntity({ id: 'boulevard', name: 'البوليفارد', category: 'mobility', subtype: 'boulevard', index: 0, total: 27, sourceId: 'oman-tv-city-model' }),
  ...Array.from({ length: 23 }, (_, index) => futureEntity({
    id: `access-${String(index + 1).padStart(2, '0')}`,
    name: `مدخل مدينة مخطط ${String(index + 1).padStart(2, '0')}`,
    category: 'mobility',
    subtype: 'access-point',
    index: index + 1,
    total: 27,
    sourceId: 'oman-tv-city-model',
  })),
  ...Array.from({ length: 3 }, (_, index) => futureEntity({
    id: `mobility-corridor-${String(index + 1).padStart(2, '0')}`,
    name: `مسار حركة خفيفة مخطط ${String(index + 1).padStart(2, '0')}`,
    category: 'mobility',
    subtype: 'active-mobility-corridor',
    index: index + 24,
    total: 27,
    sourceId: 'oman-tv-city-model',
  })),
];

export const namedProjects = [
  { id: 'hay-al-wafa', name: 'حي الوفاء', category: 'project', status: 'معلن', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'public-name-location-pending', coordinates: null, geometry: null, visualAnchor: { x: 62, y: 57, kind: 'illustrative-canvas-anchor' }, locationAccuracy: 'illustrative-only', description: 'مشروع/حي يظهر في المواد العامة المتاحة؛ يتطلب موقعًا رسميًا قبل إظهاره على خريطة جغرافية.' },
  { id: 'al-sarooj-oasis', name: 'واحة السروج', category: 'project', status: 'معلن', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'public-name-location-pending', coordinates: null, geometry: null, visualAnchor: { x: 42, y: 39, kind: 'illustrative-canvas-anchor' }, locationAccuracy: 'illustrative-only', description: 'مشروع معلن؛ موقع العرض المرئي توضيحي.' },
  { id: 'wadi-zaha', name: 'وادي زها', category: 'project', status: 'معلن', sourceIds: ['oman-tv-phase-one'], verificationStatus: 'public-name-location-pending', coordinates: null, geometry: null, visualAnchor: { x: 55, y: 67, kind: 'illustrative-canvas-anchor' }, locationAccuracy: 'illustrative-only', description: 'مشروع معلن؛ موقع العرض المرئي توضيحي.' },
];

export const mapEntities = [
  ...neighborhoods,
  ...schools,
  ...healthFacilities,
  ...worshipFacilities,
  ...greenSpaces,
  ...mobility,
  ...namedProjects,
];

export const mapLayers = [
  { id: 'neighborhood', name: 'الأحياء السكنية', icon: 'House', color: '#E0C477', entityCount: neighborhoods.length },
  { id: 'project', name: 'المشاريع', icon: 'Building2', color: '#D2AD55', entityCount: namedProjects.length },
  { id: 'education', name: 'التعليم', icon: 'GraduationCap', color: '#5D8CA3', entityCount: schools.length },
  { id: 'health', name: 'الصحة', icon: 'Cross', color: '#C88C7A', entityCount: healthFacilities.length },
  { id: 'community', name: 'المجتمع', icon: 'Landmark', color: '#B79A65', entityCount: worshipFacilities.length },
  { id: 'green', name: 'المساحات الخضراء', icon: 'Leaf', color: '#719C58', entityCount: greenSpaces.length },
  { id: 'mobility', name: 'النقل والحركة', icon: 'Route', color: '#5F9EA0', entityCount: mobility.length },
];

export const mapDataSummary = {
  totalEntities: mapEntities.length,
  visibleByDefault: ['central-park', 'central-valley', 'boulevard', 'hay-al-wafa', 'reference-hospital'],
  sourceAware: true,
  geographicAccuracy: 'not-ready-for-operational-map',
  prototypeRule: 'Show visual anchors only with the label “تصوّر توضيحي” until GIS geometry is supplied.',
};
