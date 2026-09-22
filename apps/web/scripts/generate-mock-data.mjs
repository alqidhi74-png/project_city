/**
 * Regenerates everything in ../data. Deterministic: the seed below fixes the
 * PRNG, so re-running reproduces the committed files byte for byte.
 *
 *   node scripts/generate-mock-data.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data');
mkdirSync(OUT, { recursive: true });

const YEARS = Array.from({ length: 12 }, (_, i) => 2024 + i);

// Deterministic PRNG so regenerating gives identical files.
let seed = 20260921;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const jitter = (amp) => 1 + (rnd() - 0.5) * 2 * amp;
const round = (n, p = 0) => { const f = 10 ** p; return Math.round(n * f) / f; };

const DISTRICTS = [
  {
    id: 'waha', ar: 'حي الواحة', en: 'Al Waha District',
    svgPath: 'M70,60 L330,45 L360,180 L250,250 L90,215 Z',
    centroid: [212, 142], establishedYear: 2024,
    matureP: 46000, energyPerCap: 4.1, waterPerCap: 0.082, baseAir: 78, reqPerK: 12.5,
  },
  {
    id: 'rimal', ar: 'حي الرمال', en: 'Al Rimal District',
    svgPath: 'M330,45 L620,70 L700,190 L520,245 L360,180 Z',
    centroid: [505, 148], establishedYear: 2024,
    matureP: 52000, energyPerCap: 4.6, waterPerCap: 0.091, baseAir: 71, reqPerK: 14.2,
  },
  {
    id: 'nahda', ar: 'حي النهضة', en: 'Al Nahda District',
    svgPath: 'M90,215 L250,250 L300,400 L150,450 L55,330 Z',
    centroid: [172, 325], establishedYear: 2026,
    matureP: 38000, energyPerCap: 3.8, waterPerCap: 0.076, baseAir: 82, reqPerK: 10.8,
  },
  {
    id: 'sidra', ar: 'حي السدرة', en: 'Al Sidra District',
    svgPath: 'M360,180 L520,245 L700,190 L730,360 L560,430 L400,370 Z',
    centroid: [545, 302], establishedYear: 2028,
    matureP: 61000, energyPerCap: 4.3, waterPerCap: 0.088, baseAir: 74, reqPerK: 13.1,
  },
  {
    id: 'fanar', ar: 'حي الفنار', en: 'Al Fanar District',
    svgPath: 'M150,450 L300,400 L420,500 L330,560 L160,545 Z',
    centroid: [268, 487], establishedYear: 2031,
    matureP: 29000, energyPerCap: 3.4, waterPerCap: 0.069, baseAir: 86, reqPerK: 9.4,
  },
  {
    id: 'marjan', ar: 'حي المرجان', en: 'Al Marjan District',
    svgPath: 'M420,500 L560,430 L730,360 L745,520 L600,570 Z',
    centroid: [612, 478], establishedYear: 2033,
    matureP: 34000, energyPerCap: 3.2, waterPerCap: 0.064, baseAir: 88, reqPerK: 8.7,
  },
];

const districts = DISTRICTS.map((d) => {
  const byYear = {};
  for (const y of YEARS) {
    if (y < d.establishedYear) {
      byYear[y] = { population: 0, energy: 0, water: 0, air: 0, requests: 0 };
      continue;
    }
    // Logistic ramp: ~8 years from opening to near-maturity.
    const t = y - d.establishedYear;
    const growth = 1 / (1 + Math.exp(-(t - 3.2) / 1.9));
    const population = Math.max(900, d.matureP * growth * jitter(0.03));
    // Per-capita demand falls ~1.6%/yr as efficiency programmes land.
    const eff = 0.984 ** (y - 2024);
    const energy = (population * d.energyPerCap * eff * jitter(0.04)) / 1000; // MWh
    const water = population * d.waterPerCap * eff * jitter(0.04); // thousand m³
    // Air improves slowly city-wide but dips while a district is building out.
    const buildPenalty = t < 3 ? (3 - t) * 3.5 : 0;
    const air = Math.min(97, Math.max(45, d.baseAir + (y - 2024) * 0.55 - buildPenalty + (rnd() - 0.5) * 4));
    const requests = (population / 1000) * d.reqPerK * jitter(0.07);
    byYear[y] = {
      population: round(population),
      energy: round(energy),
      water: round(water, 1),
      air: round(air),
      requests: round(requests),
    };
  }
  return {
    id: d.id,
    name: { ar: d.ar, en: d.en },
    svgPath: d.svgPath,
    centroid: d.centroid,
    establishedYear: d.establishedYear,
    byYear,
  };
});

// ---------------------------------------------------------------- KPIs
const FLOW = { today: 0.00274, week: 0.01918, month: 0.08333, year: 1 };
const STOCK = { today: 1, week: 1, month: 1, year: 1 };
const kpis = [
  { id: 'population', label: { ar: 'عدد السكان', en: 'Residents' }, unit: { ar: 'نسمة', en: 'residents' },
    metric: 'population', aggregate: 'sum', periodFactor: STOCK, precision: 0, goodWhen: 'up' },
  { id: 'energy', label: { ar: 'استهلاك الطاقة', en: 'Energy use' }, unit: { ar: 'ميغاواط/ساعة', en: 'MWh' },
    metric: 'energy', aggregate: 'sum', periodFactor: FLOW, precision: 0, goodWhen: 'down' },
  { id: 'water', label: { ar: 'استهلاك المياه', en: 'Water use' }, unit: { ar: 'ألف م³', en: 'k m³' },
    metric: 'water', aggregate: 'sum', periodFactor: FLOW, precision: 1, goodWhen: 'down' },
  { id: 'requests', label: { ar: 'طلبات الخدمة', en: 'Service requests' }, unit: { ar: 'طلب', en: 'requests' },
    metric: 'requests', aggregate: 'sum', periodFactor: FLOW, precision: 0, goodWhen: 'down' },
];

// ---------------------------------------------------------------- requests
const CATEGORIES = [
  { key: 'permits', ar: 'تراخيص البناء', en: 'Building permits',
    services: [['طلب رخصة بناء', 'Building permit application'], ['تعديل مخطط', 'Site plan amendment'], ['شهادة إتمام', 'Completion certificate']] },
  { key: 'utilities', ar: 'الخدمات والمرافق', en: 'Utilities',
    services: [['توصيل كهرباء', 'Electricity connection'], ['توصيل مياه', 'Water connection'], ['تسرب في الشبكة', 'Network leak report']] },
  { key: 'maintenance', ar: 'الصيانة', en: 'Maintenance',
    services: [['إصلاح إنارة شارع', 'Street light repair'], ['صيانة رصيف', 'Pavement repair'], ['إصلاح حفرة', 'Pothole repair']] },
  { key: 'environment', ar: 'البيئة', en: 'Environment',
    services: [['شكوى ضوضاء', 'Noise complaint'], ['جمع نفايات', 'Waste collection'], ['تشجير حديقة', 'Park landscaping']] },
  { key: 'transport', ar: 'النقل', en: 'Transport',
    services: [['طلب موقف', 'Parking permit'], ['إشارة مرورية', 'Traffic signal request'], ['مسار حافلة', 'Bus route request']] },
];
const FIRST_AR = ['أحمد', 'فاطمة', 'سالم', 'مريم', 'خالد', 'نورة', 'يوسف', 'عائشة', 'ماجد', 'هدى', 'بدر', 'ريم'];
const FIRST_EN = ['Ahmed', 'Fatma', 'Salim', 'Maryam', 'Khalid', 'Noura', 'Yousuf', 'Aisha', 'Majid', 'Huda', 'Badr', 'Reem'];
const LAST_AR = ['البلوشي', 'الحارثي', 'الرواحي', 'الكندي', 'المعمري', 'الهنائي', 'السيابي', 'الشكيلي'];
const LAST_EN = ['Al Balushi', 'Al Harthy', 'Al Rawahi', 'Al Kindi', 'Al Maamari', 'Al Hinai', 'Al Siyabi', 'Al Shukaili'];
const STATUSES = ['open', 'open', 'in-progress', 'in-progress', 'resolved'];
const PRIORITIES = ['low', 'medium', 'medium', 'high'];

// The operational queue sits in the portal's "now" (late 2026), so only the
// districts that exist by then can appear in it.
const LIVE_DISTRICTS = districts.filter((d) => d.establishedYear <= 2026).map((d) => d.id);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const requests = Array.from({ length: 30 }, (_, i) => {
  const cat = pick(CATEGORIES);
  const svc = pick(cat.services);
  const fi = Math.floor(rnd() * FIRST_AR.length);
  const li = Math.floor(rnd() * LAST_AR.length);
  const daysAgo = Math.floor(rnd() * 88);
  const date = new Date(Date.UTC(2026, 8, 21) - daysAgo * 86400000);
  return {
    id: `REQ-2026-${String(1043 + i * 7).padStart(4, '0')}`,
    districtId: pick(LIVE_DISTRICTS),
    service: { ar: svc[0], en: svc[1] },
    category: cat.key,
    categoryLabel: { ar: cat.ar, en: cat.en },
    status: pick(STATUSES),
    priority: pick(PRIORITIES),
    submittedAt: date.toISOString().slice(0, 10),
    applicant: { ar: `${FIRST_AR[fi]} ${LAST_AR[li]}`, en: `${FIRST_EN[fi]} ${LAST_EN[li]}` },
    year: 2026,
  };
}).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

// ---------------------------------------------------------------- alerts
const ALL = districts.map((d) => d.id);
const alerts = [
  { id: 'a-traffic-1', category: 'traffic', severity: 'warning', ar: ['ازدحام على المحور الرئيسي', 'ارتفع زمن الرحلة على المحور الرئيسي بنسبة ٣٤٪ خلال آخر ٢٠ دقيقة.'], en: ['Congestion on the main corridor', 'Travel time on the main corridor rose 34% in the last 20 minutes.'] },
  { id: 'a-traffic-2', category: 'traffic', severity: 'info', ar: ['إغلاق مؤقت لمسار', 'أُغلق مسار واحد لأعمال صيانة حتى الساعة ١٦:٠٠.'], en: ['Temporary lane closure', 'One lane closed for maintenance until 16:00.'] },
  { id: 'a-traffic-3', category: 'traffic', severity: 'critical', ar: ['حادث مروري', 'حادث مروري يعيق حركة السير عند التقاطع الشمالي.'], en: ['Road incident', 'A collision is blocking traffic at the north junction.'] },
  { id: 'a-air-1', category: 'air', severity: 'warning', ar: ['انخفاض جودة الهواء', 'تجاوز تركيز الجسيمات الدقيقة الحد الموصى به.'], en: ['Air quality dip', 'Fine particulate levels exceeded the recommended threshold.'] },
  { id: 'a-air-2', category: 'air', severity: 'info', ar: ['غبار عالق', 'رياح محمّلة بالغبار تؤثر على القراءات مؤقتًا.'], en: ['Airborne dust', 'Dust-laden winds are temporarily affecting readings.'] },
  { id: 'a-air-3', category: 'air', severity: 'critical', ar: ['تحذير صحي', 'يُنصح بتقليل الأنشطة الخارجية في هذا الحي.'], en: ['Health advisory', 'Outdoor activity should be reduced in this district.'] },
  { id: 'a-energy-1', category: 'energy', severity: 'warning', ar: ['ذروة في الحمل الكهربائي', 'بلغ الحمل ٩٢٪ من الطاقة المتاحة للمحوّل.'], en: ['Peak electrical load', 'Load reached 92% of available transformer capacity.'] },
  { id: 'a-energy-2', category: 'energy', severity: 'critical', ar: ['انقطاع في التغذية', 'انقطاع غير مخطط يؤثر على عدة مبانٍ.'], en: ['Supply interruption', 'An unplanned outage is affecting several buildings.'] },
  { id: 'a-energy-3', category: 'energy', severity: 'info', ar: ['إنتاج شمسي قياسي', 'سجّلت الألواح الشمسية أعلى إنتاج يومي هذا الشهر.'], en: ['Record solar output', 'Rooftop solar recorded its highest daily output this month.'] },
  { id: 'a-water-1', category: 'water', severity: 'warning', ar: ['انخفاض ضغط المياه', 'انخفاض ملحوظ في ضغط الشبكة بالقطاع الشرقي.'], en: ['Low water pressure', 'A noticeable pressure drop in the eastern sector.'] },
  { id: 'a-water-2', category: 'water', severity: 'critical', ar: ['تسرب رئيسي', 'تسرب في خط ناقل يتطلب تدخلًا فوريًا.'], en: ['Main line leak', 'A transmission main leak requires immediate intervention.'] },
  { id: 'a-water-3', category: 'water', severity: 'info', ar: ['اكتمال الصيانة', 'انتهت أعمال صيانة الخزان وعادت الخدمة لطبيعتها.'], en: ['Maintenance complete', 'Reservoir maintenance finished and service is normal.'] },
  { id: 'a-security-1', category: 'security', severity: 'info', ar: ['دورية إضافية', 'تم تعزيز الدوريات في المنطقة التجارية.'], en: ['Additional patrol', 'Patrols have been increased in the commercial area.'] },
  { id: 'a-security-2', category: 'security', severity: 'warning', ar: ['إنذار حريق', 'تفعيل إنذار حريق في مبنى خدمي، الفرق في الموقع.'], en: ['Fire alarm', 'A fire alarm was triggered at a service building; crews on site.'] },
].map((a) => ({
  id: a.id, category: a.category, severity: a.severity,
  title: { ar: a.ar[0], en: a.en[0] },
  message: { ar: a.ar[1], en: a.en[1] },
  districts: ALL,
}));

// ---------------------------------------------------------------- ask the city
const ask = [
  { id: 'q-water-high', compute: 'highestWater',
    kw: { ar: ['اكثر', 'اعلى', 'مياه', 'ماء', 'استهلاك'], en: ['most', 'highest', 'water', 'usage', 'consumption'] },
    ar: 'أعلى استهلاك للمياه في {district} بواقع {value}.', en: 'The highest water use is in {district}, at {value}.',
    sAr: 'أي حي يستهلك أكثر كمية من المياه؟', sEn: 'Which district uses the most water?',
    highlight: { kind: 'chart', id: 'water' } },
  { id: 'q-water-low', compute: 'lowestWater',
    kw: { ar: ['اقل', 'ادنى', 'مياه', 'ماء'], en: ['least', 'lowest', 'water'] },
    ar: 'أقل استهلاك للمياه في {district} بواقع {value}.', en: 'The lowest water use is in {district}, at {value}.',
    sAr: 'أي حي يستهلك أقل كمية من المياه؟', sEn: 'Which district uses the least water?',
    highlight: { kind: 'chart', id: 'water' } },
  { id: 'q-energy-high', compute: 'highestEnergy',
    kw: { ar: ['اكثر', 'اعلى', 'طاقه', 'كهرباء', 'استهلاك'], en: ['most', 'highest', 'energy', 'electricity', 'power'] },
    ar: 'أعلى استهلاك للطاقة في {district} بواقع {value}.', en: 'The highest energy use is in {district}, at {value}.',
    sAr: 'أي حي يستهلك أكثر طاقة؟', sEn: 'Which district uses the most energy?',
    highlight: { kind: 'chart', id: 'energy' } },
  { id: 'q-requests-period', compute: 'requestsThisPeriod',
    kw: { ar: ['طلبات', 'عدد', 'الشهر', 'شهر'], en: ['requests', 'month', 'logged', 'period'] },
    ar: 'سُجّل {value} ضمن {district} في الفترة المحددة.', en: '{value} were logged across {district} in the selected period.',
    sAr: 'كم عدد الطلبات هذا الشهر؟', sEn: 'How many requests this month?',
    highlight: { kind: 'kpi', id: 'requests' } },
  { id: 'q-requests-open', compute: 'openRequests',
    kw: { ar: ['مفتوح', 'مفتوحه', 'معلق', 'يزال'], en: ['open', 'pending', 'outstanding', 'unresolved', 'still'] },
    ar: 'هناك {value} ما تزال مفتوحة في {district}.', en: 'There are {value} still open in {district}.',
    sAr: 'كم طلبًا ما يزال مفتوحًا؟', sEn: 'How many requests are still open?',
    highlight: { kind: 'chart', id: 'services' } },
  { id: 'q-air-today', compute: 'airToday',
    kw: { ar: ['هواء', 'جوده', 'تلوث', 'اليوم'], en: ['air', 'quality', 'pollution', 'today'] },
    ar: 'مؤشر جودة الهواء في {district} يبلغ {value}.', en: 'Air quality in {district} is {value}.',
    sAr: 'ما جودة الهواء اليوم؟', sEn: 'What is the air quality today?',
    highlight: { kind: 'district', id: '' } },
  { id: 'q-air-best', compute: 'bestAir',
    kw: { ar: ['انظف', 'افضل', 'هواء', 'جوده'], en: ['cleanest', 'best', 'air', 'quality'] },
    ar: 'أنظف هواء في {district} بمؤشر {value}.', en: 'The cleanest air is in {district}, at {value}.',
    sAr: 'أي حي يتمتع بأنظف هواء؟', sEn: 'Which district has the cleanest air?',
    highlight: { kind: 'district', id: '' } },
  { id: 'q-largest', compute: 'largestDistrict',
    kw: { ar: ['اكبر', 'سكان', 'كثافه', 'حي'], en: ['largest', 'biggest', 'population', 'district'] },
    ar: '{district} هو الأكبر سكانيًا بـ {value}.', en: '{district} is the largest by population, with {value}.',
    sAr: 'ما أكبر حي من حيث السكان؟', sEn: 'Which is the largest district by population?',
    highlight: { kind: 'kpi', id: 'population' } },
  { id: 'q-total-pop', compute: 'totalPopulation',
    kw: { ar: ['اجمالي', 'مجموع', 'سكان', 'عدد'], en: ['total', 'overall', 'population', 'residents'] },
    ar: 'إجمالي سكان {district} يبلغ {value}.', en: 'The total population of {district} is {value}.',
    sAr: 'كم يبلغ إجمالي عدد السكان؟', sEn: 'What is the total population?',
    highlight: { kind: 'kpi', id: 'population' } },
  { id: 'q-busiest-service', compute: 'busiestService',
    kw: { ar: ['اكثر', 'خدمه', 'فئه', 'طلبا', 'شيوعا'], en: ['most', 'common', 'service', 'category', 'popular'] },
    ar: 'أكثر فئة طلبًا هي {district} بواقع {value}.', en: 'The busiest category is {district}, with {value}.',
    sAr: 'ما أكثر الخدمات طلبًا؟', sEn: 'What is the most requested service?',
    highlight: { kind: 'chart', id: 'services' } },
].map((q) => ({
  id: q.id, compute: q.compute, keywords: q.kw,
  answer: { ar: q.ar, en: q.en },
  suggestion: { ar: q.sAr, en: q.sEn },
  highlight: q.highlight.id === '' ? null : q.highlight,
}));

// ---------------------------------------------------------------- properties
// Appended after every other array above is fully built, so this block's
// extra rnd() calls can never shift districts.json/requests.json's values —
// only districts that exist by the portal's "now" (2026) get listings, same
// constraint as the request queue above.
const PROPERTY_DISTRICTS = [
  { id: 'waha', count: 55 },
  { id: 'rimal', count: 60 },
  { id: 'nahda', count: 20 },
];
const TYPE_WEIGHTS = ['residential', 'residential', 'residential', 'commercial', 'commercial', 'land'];
const STATUS_WEIGHTS = ['available', 'available', 'reserved', 'reserved', 'sold', 'sold', 'sold'];
const BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TYPE_LABEL = {
  residential: { ar: 'سكني', en: 'Residential' },
  commercial: { ar: 'تجاري', en: 'Commercial' },
  land: { ar: 'أرض', en: 'Land' },
};
const KIND_LABEL = {
  residential: { ar: 'شقة', en: 'Apartment' },
  commercial: { ar: 'مكتب', en: 'Office' },
  land: { ar: 'قطعة أرض', en: 'Plot' },
};

function randomDateBetween(startIso, endIso) {
  const start = new Date(`${startIso}T00:00:00Z`).getTime();
  const end = new Date(`${endIso}T00:00:00Z`).getTime();
  return new Date(start + rnd() * (end - start)).toISOString().slice(0, 10);
}

let propSeq = 1;
const properties = [];
for (const pd of PROPERTY_DISTRICTS) {
  const district = districts.find((d) => d.id === pd.id);
  const establishedIso = `${district.establishedYear}-01-01`;

  for (let i = 0; i < pd.count; i++) {
    const type = pick(TYPE_WEIGHTS);
    const status = pick(STATUS_WEIGHTS);
    const block = pick(BLOCKS);
    const unitNo = 100 + Math.floor(rnd() * 400);

    let areaSqm, price, bedrooms;
    if (type === 'residential') {
      bedrooms = 1 + Math.floor(rnd() * 5);
      areaSqm = round(90 + bedrooms * 32 + rnd() * 40);
      price = round((45000 + bedrooms * 16000 + areaSqm * 180) * jitter(0.08), -2);
    } else if (type === 'commercial') {
      areaSqm = round(60 + rnd() * 440);
      price = round((80000 + areaSqm * 520) * jitter(0.1), -2);
    } else {
      areaSqm = round(200 + rnd() * 1000);
      price = round((30000 + areaSqm * 95) * jitter(0.12), -2);
    }

    const listedDate = randomDateBetween(establishedIso, '2026-08-15');
    let saleDate;
    let buyer;
    if (status === 'sold' || status === 'reserved') {
      const fi = Math.floor(rnd() * FIRST_AR.length);
      const li = Math.floor(rnd() * LAST_AR.length);
      buyer = { ar: `${FIRST_AR[fi]} ${LAST_AR[li]}`, en: `${FIRST_EN[fi]} ${LAST_EN[li]}` };
    }
    if (status === 'sold') {
      saleDate = randomDateBetween(listedDate, '2026-09-20');
    }

    properties.push({
      id: `PR-${String(propSeq).padStart(4, '0')}`,
      districtId: pd.id,
      type,
      typeLabel: TYPE_LABEL[type],
      status,
      unitLabel: { ar: `${KIND_LABEL[type].ar} ${block}-${unitNo}`, en: `${KIND_LABEL[type].en} ${block}-${unitNo}` },
      price,
      areaSqm,
      ...(bedrooms ? { bedrooms } : {}),
      listedDate,
      ...(saleDate ? { saleDate } : {}),
      ...(buyer ? { buyer } : {}),
    });
    propSeq++;
  }
}

const write = (name, data) => {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('wrote', name);
};
write('districts.json', districts);
write('kpis.json', kpis);
write('requests.json', requests);
write('alerts.json', alerts);
write('ask-the-city.json', ask);
write('properties.json', properties);

// sanity
const y2035 = districts.reduce((s, d) => s + d.byYear[2035].population, 0);
const y2024 = districts.reduce((s, d) => s + d.byYear[2024].population, 0);
console.log('population 2024:', y2024, '-> 2035:', y2035);
console.log('statuses:', requests.reduce((m, r) => ({ ...m, [r.status]: (m[r.status] || 0) + 1 }), {}));
console.log('districts in queue:', [...new Set(requests.map(r => r.districtId))].join(','));
console.log('properties:', properties.length, '| statuses:', properties.reduce((m, p) => ({ ...m, [p.status]: (m[p.status] || 0) + 1 }), {}));
