export type CompanyId = 'nissan' | 'byd' | 'geely' | 'lepas' | 'zeekr' | 'bandon_piya';

export interface Branch {
  id: string;
  name: string;
  companyId: CompanyId;
  companyName: string;
}

export interface Company {
  id: CompanyId;
  name: string;
  shortName: string;
  color: string;
  branches: Branch[];
}

export type KPIKey = 
  | 'labor_revenue'       // รายได้ค่าแรง (บาท)
  | 'parts_revenue'       // รายได้อะไหล่/เคมีภัณฑ์ (บาท)
  | 'total_revenue'       // รายได้รวมศูนย์บริการ (บาท)
  | 'repair_orders'       // จำนวนรถเข้าซ่อม / RO (คัน)
  | 'mechanic_efficiency' // ประสิทธิภาพช่าง (%)
  | 'csi_score'           // ความพึงพอใจลูกค้า CSI (%)
  | 'fir_rate';           // อัตราการซ่อมจบครั้งเดียว FIR (%)

export interface KPIDefinition {
  key: KPIKey;
  label: string;
  unit: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
  isCount?: boolean;
  higherIsBetter: boolean;
  description: string;
  defaultQuarterTarget: number;
}

export type PerformanceLevel = 'green' | 'yellow' | 'red';

export interface PerformanceStatusInfo {
  level: PerformanceLevel;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  colorHex: string;
  icon: string;
}

export interface KPITargetRecord {
  id: string;
  branchId: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  kpiKey: KPIKey;
  targetValue: number;
  updatedAt: string;
  updatedBy: string;
}

export interface ActualRecord {
  id: string;
  branchId: string;
  year: number;
  month: number; // 1 - 12
  quarter: 1 | 2 | 3 | 4;
  kpiKey: KPIKey;
  actualValue: number;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface BranchPerformanceSummary {
  branchId: string;
  branchName: string;
  companyId: CompanyId;
  companyName: string;
  kpis: {
    [key in KPIKey]?: {
      target: number;
      actual: number;
      achievementPct: number;
      level: PerformanceLevel;
    };
  };
  overallAchievement: number;
  overallLevel: PerformanceLevel;
  totalRevenueTarget: number;
  totalRevenueActual: number;
  totalROTarget: number;
  totalROActual: number;
}
