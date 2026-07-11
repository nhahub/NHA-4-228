export type Language = 'en' | 'ar';

export const translations = {
  en: {
    appTitle: "Car Performance & Tuning Lab",
    appSubtitle: "Configure, modify, and simulate performance upgrades instantly.",
    languageLabel: "العربية",
    
    // Vehicle Config
    vehicleSpecs: "Vehicle Specifications",
    weight: "Vehicle Weight (kg)",
    horsepower: "Horsepower (HP)",
    torque: "Torque (Nm)",
    drivetrain: "Drivetrain Selection",
    fwd: "FWD (Front-Wheel Drive)",
    rwd: "RWD (Rear-Wheel Drive)",
    awd: "AWD (All-Wheel Drive)",
    
    // Modifications
    perfMods: "Performance Modifications",
    turbo: "Turbo Charger",
    exhaust: "Exhaust Upgrade",
    ecu: "ECU Remap",
    intake: "Cold Air Intake",
    turboDesc: "Adds massive boost pressure (+35% HP, +30% Torque, +12% Fuel)",
    exhaustDesc: "Improves gas flow and reduces weight (+6% HP, +4% Torque, -2% Fuel)",
    ecuDesc: "Optimizes fuel and ignition timing (+15% HP, +18% Torque, +6% Fuel)",
    intakeDesc: "Provides cooler, denser air intake (+3% HP, +2% Torque, -1% Fuel)",
    
    // Results
    resultsDashboard: "Results Dashboard",
    stock: "Stock Value",
    modified: "Modified Value",
    difference: "Difference",
    improved: "Improved",
    compromised: "Compromised",
    noChange: "No Change",
    
    // Performance Metrics
    accel: "0–100 km/h Acceleration",
    topSpeed: "Top Speed",
    fuel: "Fuel Consumption",
    seconds: "sec",
    kmh: "km/h",
    fuelUnit: "L/100km",
    hpUnit: "HP",
    nmUnit: "Nm",
    
    // Saved builds
    saveBuild: "Save Current Build",
    buildNamePlaceholder: "e.g., Stage 2 Golf GTI",
    saveBtn: "Save Build",
    savedBuilds: "Saved Builds & Comparison Workspace",
    noSavedBuilds: "No saved builds yet. Create one above!",
    compareHeader: "Side-by-Side Comparison",
    deleteBtn: "Delete",
    loadBtn: "Load to Panel",
    compareBtn: "Compare",
    stopCompareBtn: "Exit Comparison",
    buildDetails: "Build Details",
    date: "Date",
    actions: "Actions",

    // PDF export
    exportPdf: "Export PDF Report",
    pdfTitle: "Vehicle Performance & Tuning Analysis",
    pdfGenerated: "Generated on",
    pdfHeaderSpecs: "Technical Specifications",
    pdfHeaderMods: "Applied Modifications",
    pdfHeaderPerformance: "Performance Results & Differences",
    pdfFooter: "Car Performance & Tuning Lab - Virtual Simulator Report.",

    // Alerts/Errors
    errorWeight: "Weight must be between 300 and 8000 kg",
    errorHp: "Horsepower must be between 20 and 4000 HP",
    errorTorque: "Torque must be between 20 and 4000 Nm",
    serverError: "Error connecting to physics engine. Using local fallback estimations...",
    successSave: "Build saved successfully!"
  },
  ar: {
    appTitle: "معمل أداء وضبط السيارات",
    appSubtitle: "قم بتهيئة وتعديل ومحاكاة ترقيات الأداء بشكل فوري.",
    languageLabel: "English",
    
    // Vehicle Config
    vehicleSpecs: "مواصفات السيارة الأساسية",
    weight: "وزن السيارة (كجم)",
    horsepower: "القوة الحصانية (حصان)",
    torque: "عزم الدوران (نيوتن متر)",
    drivetrain: "نظام الدفع",
    fwd: "دفع أمامي (FWD)",
    rwd: "دفع خلفي (RWD)",
    awd: "دفع رباعي (AWD)",
    
    // Modifications
    perfMods: "تعديلات الأداء الرياضية",
    turbo: "شاحن توربيني (Turbo)",
    exhaust: "نظام عادم رياضي",
    ecu: "برمجة كمبيوتر المحرك (ECU)",
    intake: "فلتر هواء رياضي بارد",
    turboDesc: "يوفر ضغط هواء هائل (+٣٥٪ قوة حصانية، +٣٠٪ عزم، +١٢٪ استهلاك وقود)",
    exhaustDesc: "يحسن تدفق الغازات ويقلل الوزن (+٦٪ قوة حصانية، +٤٪ عزم، -٢٪ استهلاك وقود)",
    ecuDesc: "يحسن توقيت حقن الوقود والشرارة (+١٥٪ قوة حصانية، +١٨٪ عزم، +٦٪ استهلاك وقود)",
    intakeDesc: "يوفر هواءً بارداً وأكثر كثافة للمحرك (+٣٪ قوة حصانية، +٢٪ عزم، -١٪ استهلاك وقود)",
    
    // Results
    resultsDashboard: "لوحة نتائج الأداء",
    stock: "الوضع الأصلي",
    modified: "بعد التعديل",
    difference: "الفارق",
    improved: "تحسن",
    compromised: "تراجع",
    noChange: "لا تغيير",
    
    // Performance Metrics
    accel: "تسارع ٠–١٠٠ كم/ساعة",
    topSpeed: "السرعة القصوى",
    fuel: "معدل استهلاك الوقود",
    seconds: "ثانية",
    kmh: "كم/ساعة",
    fuelUnit: "لتر/١٠٠كم",
    hpUnit: "حصان",
    nmUnit: "نيوتن متر",
    
    // Saved builds
    saveBuild: "حفظ التعديل الحالي",
    buildNamePlaceholder: "مثال: جولف جي تي آي ستيدج ٢",
    saveBtn: "حفظ التعديل",
    savedBuilds: "التعديلات المحفوظة ومساحة المقارنة",
    noSavedBuilds: "لا توجد تعديلات محفوظة حالياً. قم بإنشاء تعديلك الأول أعلاه!",
    compareHeader: "مقارنة جانبية للمواصفات",
    deleteBtn: "حذف",
    loadBtn: "تحميل للوحة",
    compareBtn: "مقارنة",
    stopCompareBtn: "إنهاء المقارنة",
    buildDetails: "تفاصيل التعديل",
    date: "التاريخ",
    actions: "الإجراءات",

    // PDF export
    exportPdf: "تصدير تقرير PDF",
    pdfTitle: "تقرير تحليل أداء وضبط السيارة",
    pdfGenerated: "تم الإنشاء في",
    pdfHeaderSpecs: "المواصفات الفنية للسيارة",
    pdfHeaderMods: "التعديلات الرياضية المضافة",
    pdfHeaderPerformance: "نتائج الأداء وفروقات التعديل",
    pdfFooter: "معمل أداء وضبط السيارات - تقرير المحاكي الافتراضي.",

    // Alerts/Errors
    errorWeight: "يجب أن يكون الوزن بين ٣٠٠ و ٨٠٠٠ كجم",
    errorHp: "يجب أن تكون القوة الحصانية بين ٢٠ و ٤٠٠٠ حصان",
    errorTorque: "يجب أن يكون العزم بين ٢٠ و ٤٠٠٠ نيوتن متر",
    serverError: "فشل الاتصال بمحرك الفيزياء. يتم استخدام تقديرات محلية احتياطية...",
    successSave: "تم حفظ التعديل بنجاح!"
  }
};
