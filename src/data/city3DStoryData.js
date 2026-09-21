// This procedural model is a visual concept, pending official Ministry data.
// Positions are local scene units, not survey coordinates or official GIS data.
export const city3DStory = [
  { id: "vision", label: "الرؤية", number: "١", title: "مدينة تُصمَّم للإنسان", description: "رؤية عمرانية تجمع جودة الحياة والاستدامة والتقنية في مدينة متكاملة." },
  { id: "neighbourhoods", label: "الأحياء السكنية", number: "٢", title: "أحياء تنبض بالحياة", description: "مجتمعات سكنية مترابطة تقرّب الإنسان من احتياجاته اليومية." },
  { id: "nature", label: "الطبيعة", number: "٣", title: "الطبيعة في قلب المدينة", description: "حدائق ومسارات خضراء تمنح السكان مساحة للحياة والحركة والتواصل." },
  { id: "services", label: "الخدمات الذكية", number: "٤", title: "كل ما تحتاجه أقرب", description: "تعليم وصحة وخدمات ومرافق موزعة لدعم حياة يومية أكثر سهولة." },
  { id: "future", label: "المستقبل", number: "٥", title: "مدينة تتحرك نحو المستقبل", description: "بنية متكاملة تنمو على مراحل لصناعة تجربة حضرية أكثر استدامة." },
];

// Extra waypoints give the services chapter a school → clinic → shops passage.
export const cityCameraPath = [
  { at: 0, position: [100, 86, 112], target: [0, 0, 0] },
  { at: 0.65, position: [88, 80, 119], target: [0, 0, 0] },
  { at: 1.35, position: [-62, 34, 63], target: [-29, 1, 10] },
  { at: 1.85, position: [-58, 31, 57], target: [-29, 1, 7] },
  { at: 2.45, position: [35, 43, 54], target: [0, 0, 0] },
  { at: 2.85, position: [31, 39, 49], target: [0, 0, -3] },
  { at: 3.2, position: [69, 35, 9], target: [29, 1, -22] },
  { at: 3.55, position: [71, 34, 21], target: [43, 1, -3] },
  { at: 3.9, position: [72, 37, 48], target: [30, 1, 21] },
  { at: 4.6, position: [105, 98, 120], target: [0, 0, 0] },
  { at: 5, position: [109, 104, 115], target: [0, 0, 0] },
];

export const cityPalette = {
  background: "#061d16", ground: "#324b3b", lawn: "#466348",
  road: "#39423c", sidewalk: "#b9b49e", ivory: "#f3eee2",
  stone: "#d1c7ad", roof: "#c8bc9d", glass: "#547068",
  gold: "#d2ad55", water: "#477f79", leaf: "#526a3c", trunk: "#8c7957",
};
