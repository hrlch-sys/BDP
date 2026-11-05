import { Company, KPIDefinition, KPITargetRecord, ActualRecord, PerformanceLevel, PerformanceStatusInfo } from '../types';

export const COMPANIES: Company[] = [
  {
    id: 'nissan',
    name: 'บริษัท นิสสัน',
    shortName: 'NISSAN',
    color: '#c51d24',
    branches: [
      { id: 'nissan-nakhon', name: 'สาขา นครศรีธรรมราช', companyId: 'nissan', companyName: 'บริษัท นิสสัน' },
      { id: 'nissan-surat', name: 'สาขา สุราษฎร์ธานี', companyId: 'nissan', companyName: 'บริษัท นิสสัน' },
      { id: 'nissan-samui', name: 'สาขา เกาะสมุย', companyId: 'nissan', companyName: 'บริษัท นิสสัน' },
    ],
  },
  {
    id: 'byd',
    name: 'บริษัท บีวายดี',
    shortName: 'BYD',
    color: '#0066b2',
    branches: [
      { id: 'byd-bangkung', name: 'สาขา บางกุ้ง', companyId: 'byd', companyName: 'บริษัท บีวายดี' },
      { id: 'byd-bangyai', name: 'สาขา บางใหญ่', companyId: 'byd', companyName: 'บริษัท บีวายดี' },
    ],
  },
  {
    id: 'geely',
    name: 'บริษัท จีลี่',
    shortName: 'GEELY',
    color: '#0f4c81',
    branches: [
      { id: 'geely-hq', name: 'สาขา สำนักงานใหญ่', companyId: 'geely', companyName: 'บริษัท จีลี่' },
    ],
  },
  {
    id: 'lepas',
    name: 'บริษัท เลพาส',
    shortName: 'LEPAS',
    color: '#107c41',
    branches: [
      { id: 'lepas-hq', name: 'สาขา สำนักงานใหญ่', companyId: 'lepas', companyName: 'บริษัท เลพาส' },
    ],
  },
  {
    id: 'zeekr',
    name: 'บริษัท ซีกเกอร์',
    shortName: 'ZEEKR',
    color: '#d97706',
    branches: [
      { id: 'zeekr-hq', name: 'สาขา สำนักงานใหญ่', companyId: 'zeekr', companyName: 'บริษัท ซีกเกอร์' },
      { id: 'zeekr-bp', name: 'สาขา ศูนย์บริการ สีและตัวถัง', companyId: 'zeekr', companyName: 'บริษัท ซีกเกอร์' },
      { id: 'zeekr-nakhon', name: 'สาขา นครศรีธรรมราช', companyId: 'zeekr', companyName: 'บริษัท ซีกเกอร์' },
      { id: 'zeekr-surat', name: 'สาขา สุราษฎร์ธานี', companyId: 'zeekr', companyName: 'บริษัท ซีกเกอร์' },
    ],
  },
  {
    id: 'bandon_piya',
    name: 'บริษัท บ้านดอนปิยะ',
    shortName: 'BANDON PIYA',
    color: '#8b0000',
    branches: [
      { id: 'bandon-hq', name: 'สาขา สำนักงานใหญ่', companyId: 'bandon_piya', companyName: 'บริษัท บ้านดอนปิยะ' },
    ],
  },
];

export const ALL_BRANCHES = COMPANIES.flatMap(c => c.branches);

export const KPI_DEFINITIONS: KPIDefinition[] = [
  {
    key: 'labor_revenue',
    label: 'รายได้ค่าแรงบริการ',
    unit: 'บาท',
    isCurrency: true,
    higherIsBetter: true,
    description: 'ยอดรายได้จากค่าแรงช่างซ่อมบำรุงและเช็กระยะ',
    defaultQuarterTarget: 1200000,
  },
  {
    key: 'parts_revenue',
    label: 'รายได้อะไหล่และเคมีภัณฑ์',
    unit: 'บาท',
    isCurrency: true,
    higherIsBetter: true,
    description: 'ยอดขายอะไหล่แท้ น้ำมันเครื่อง และเคมีภัณฑ์ศูนย์บริการ',
    defaultQuarterTarget: 2400000,
  },
  {
    key: 'total_revenue',
    label: 'รายได้รวมศูนย์บริการ',
    unit: 'บาท',
    isCurrency: true,
    higherIsBetter: true,
    description: 'ผลรวมรายได้ค่าแรง + ค่าอะไหล่ศูนย์บริการ',
    defaultQuarterTarget: 3600000,
  },
  {
    key: 'repair_orders',
    label: 'จำนวนรถเข้าซ่อม (RO)',
    unit: 'คัน',
    isCount: true,
    higherIsBetter: true,
    description: 'จำนวนใบสั่งซ่อม (Repair Orders) ที่เปิดบริการในงวด',
    defaultQuarterTarget: 450,
  },
  {
    key: 'mechanic_efficiency',
    label: 'ประสิทธิภาพช่าง (Productivity)',
    unit: '%',
    isPercentage: true,
    higherIsBetter: true,
    description: 'อัตราผลผลิตและประสิทธิภาพเวลาทำงานของช่างบริการ',
    defaultQuarterTarget: 90,
  },
  {
    key: 'csi_score',
    label: 'ความพึงพอใจลูกค้า (CSI)',
    unit: '%',
    isPercentage: true,
    higherIsBetter: true,
    description: 'คะแนนการสำรวจความพึงพอใจลูกค้าหลังการส่งมอบรถ (CSI)',
    defaultQuarterTarget: 95,
  },
  {
    key: 'fir_rate',
    label: 'อัตราซ่อมจบครั้งเดียว (FIR)',
    unit: '%',
    isPercentage: true,
    higherIsBetter: true,
    description: 'อัตราส่วนงานซ่อมที่ส่งมอบแล้วไม่พบงานเคลมซ่อมซ้ำ (Fix It Right)',
    defaultQuarterTarget: 98,
  },
];

export const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const MONTH_SHORT_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const QUARTER_MONTHS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

export function getQuarterFromMonth(month: number): 1 | 2 | 3 | 4 {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export function calculatePerformanceLevel(achievementPct: number): PerformanceLevel {
  if (achievementPct >= 100) return 'green';
  if (achievementPct >= 80) return 'yellow';
  return 'red';
}

export const PERFORMANCE_CONFIG: Record<PerformanceLevel, PerformanceStatusInfo> = {
  green: {
    level: 'green',
    label: 'เกินเป้า (≥ 100%)',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-500',
    colorHex: '#10b981',
    icon: 'CheckCircle2',
  },
  yellow: {
    level: 'yellow',
    label: 'ได้ 80 - 99%',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-500',
    colorHex: '#f59e0b',
    icon: 'AlertTriangle',
  },
  red: {
    level: 'red',
    label: 'ต่ำกว่า 80%',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-500',
    colorHex: '#ef4444',
    icon: 'XCircle',
  },
};

// Generate realistic initial targets and actuals for 2026
export function generateInitialData() {
  const currentYear = 2026;
  const initialTargets: KPITargetRecord[] = [];
  const initialActuals: ActualRecord[] = [];

  // Branch scale multipliers to make numbers realistic based on branch type
  const branchMultipliers: Record<string, number> = {
    'nissan-nakhon': 1.1,
    'nissan-surat': 1.3,
    'nissan-samui': 0.7,
    'byd-bangkung': 1.4,
    'byd-bangyai': 1.2,
    'geely-hq': 1.0,
    'lepas-hq': 0.85,
    'zeekr-hq': 1.25,
    'zeekr-bp': 1.6, // Body & paint has higher parts & labor
    'zeekr-nakhon': 0.95,
    'zeekr-surat': 1.15,
    'bandon-hq': 1.5,
  };

  // Populate Quarterly Targets for Q1, Q2, Q3, Q4 for 2026
  for (const branch of ALL_BRANCHES) {
    const mult = branchMultipliers[branch.id] || 1.0;
    for (let q = 1; q <= 4; q++) {
      for (const kpi of KPI_DEFINITIONS) {
        let baseVal = kpi.defaultQuarterTarget * mult;
        // Minor seasonal adjustments
        if (q === 2) baseVal *= 1.05; // Songkran maintenance peak
        if (q === 4) baseVal *= 1.1; // Year end bonus/service surge

        if (kpi.key === 'mechanic_efficiency') baseVal = 90;
        if (kpi.key === 'csi_score') baseVal = 95;
        if (kpi.key === 'fir_rate') baseVal = 98;

        initialTargets.push({
          id: `target-${branch.id}-${currentYear}-q${q}-${kpi.key}`,
          branchId: branch.id,
          year: currentYear,
          quarter: q as 1 | 2 | 3 | 4,
          kpiKey: kpi.key,
          targetValue: Math.round(baseVal),
          updatedAt: '2026-01-05T08:00:00Z',
          updatedBy: 'ผู้บริหารกลุ่มบ้านดอนปิยะ (CEO/GM)',
        });
      }
    }
  }

  // Populate Monthly Actuals for months 1 to 10 of 2026 with diverse performance (Green, Yellow, Red)
  // so the executive dashboard demonstrates all colors realistically
  const performanceProfiles: Record<string, number> = {
    'byd-bangkung': 1.08,   // Strong performer (Green)
    'byd-bangyai': 1.04,    // Good (Green)
    'nissan-surat': 1.02,   // Over target (Green)
    'zeekr-bp': 1.12,       // Body & paint over target (Green)
    'bandon-hq': 1.01,      // On target (Green)
    'geely-hq': 0.92,       // Moderate (Yellow: 92%)
    'zeekr-hq': 0.88,       // Moderate (Yellow: 88%)
    'nissan-nakhon': 0.85,  // Borderline (Yellow: 85%)
    'zeekr-surat': 0.82,    // Yellow
    'nissan-samui': 0.72,   // Tourism seasonal slowdown (Red: 72%)
    'lepas-hq': 0.76,       // New EV ramp-up (Red: 76%)
    'zeekr-nakhon': 0.78,   // Red
  };

  // We populate actuals for months 1 to 10
  for (const branch of ALL_BRANCHES) {
    const mult = branchMultipliers[branch.id] || 1.0;
    const perfRate = performanceProfiles[branch.id] || 0.95;

    for (let m = 1; m <= 10; m++) {
      const q = getQuarterFromMonth(m);
      
      // Monthly target is roughly quarter target / 3
      const laborTargetMonthly = (1200000 * mult) / 3;
      const partsTargetMonthly = (2400000 * mult) / 3;
      const roTargetMonthly = (450 * mult) / 3;

      // Add a slight monthly fluctuation
      const fluctuation = 0.96 + Math.sin(m * 1.5) * 0.08;
      const effectivePerf = perfRate * fluctuation;

      const laborActual = Math.round(laborTargetMonthly * effectivePerf);
      const partsActual = Math.round(partsTargetMonthly * effectivePerf);
      const totalActual = laborActual + partsActual;
      const roActual = Math.round(roTargetMonthly * effectivePerf);
      
      // % metrics
      const effActual = Math.min(100, Math.max(65, Math.round(90 * (effectivePerf > 1 ? 1.05 : effectivePerf))));
      const csiActual = Math.min(100, Math.max(70, Math.round(95 * (effectivePerf > 1 ? 1.02 : effectivePerf))));
      const firActual = Math.min(100, Math.max(80, Math.round(98 * (effectivePerf > 1 ? 1.01 : effectivePerf * 0.98))));

      const kpiValues: Record<string, number> = {
        labor_revenue: laborActual,
        parts_revenue: partsActual,
        total_revenue: totalActual,
        repair_orders: roActual,
        mechanic_efficiency: effActual,
        csi_score: csiActual,
        fir_rate: firActual,
      };

      for (const [kpiKey, val] of Object.entries(kpiValues)) {
        initialActuals.push({
          id: `actual-${branch.id}-${currentYear}-m${m}-${kpiKey}`,
          branchId: branch.id,
          year: currentYear,
          month: m,
          quarter: q,
          kpiKey: kpiKey as any,
          actualValue: val,
          notes: m === 10 ? 'ผลดำเนินงานเดือนตุลาคม บันทึกโดยผู้จัดการฝ่ายบริการ' : undefined,
          updatedAt: `2026-${String(m).padStart(2, '0')}-28T17:30:00Z`,
          updatedBy: `ผู้จัดการศูนย์บริการ (${branch.name})`,
        });
      }
    }
  }

  return { initialTargets, initialActuals };
}
