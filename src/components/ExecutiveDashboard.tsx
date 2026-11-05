import React, { useState, useMemo } from 'react';
import { 
  KPITargetRecord, 
  ActualRecord, 
  PerformanceLevel, 
  CompanyId 
} from '../types';
import { 
  COMPANIES, 
  ALL_BRANCHES, 
  KPI_DEFINITIONS, 
  MONTH_NAMES_TH, 
  QUARTER_MONTHS, 
  calculatePerformanceLevel, 
  PERFORMANCE_CONFIG,
  getQuarterFromMonth
} from '../data/initialData';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Building2, 
  Layers, 
  Award, 
  Download, 
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';

interface ExecutiveDashboardProps {
  targets: KPITargetRecord[];
  actuals: ActualRecord[];
  onNavigateToManager: () => void;
  onNavigateToKPISetting: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  targets,
  actuals,
  onNavigateToManager,
  onNavigateToKPISetting,
}) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'quarterly' | 'monthly'>('monthly');
  const [selectedQuarter, setSelectedQuarter] = useState<number>(3); // Default Q3 or All
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // September or 0 for All
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'companies' | 'matrix' | 'alerts'>('branches');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Determine active months based on filters
  const effectiveMonths = useMemo(() => {
    if (viewMode === 'monthly') {
      if (selectedMonth > 0) return [selectedMonth];
      if (selectedQuarter > 0) return QUARTER_MONTHS[selectedQuarter];
      return Array.from({ length: 12 }, (_, i) => i + 1);
    } else {
      // Quarterly
      if (selectedQuarter > 0) return QUARTER_MONTHS[selectedQuarter];
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  }, [viewMode, selectedQuarter, selectedMonth]);

  // Compute performance for each branch in the selected time scope
  const branchPerformances = useMemo(() => {
    return ALL_BRANCHES.map(branch => {
      // Filter actuals for this branch and year and selected months
      const branchActuals = actuals.filter(a => 
        a.branchId === branch.id && 
        a.year === selectedYear && 
        effectiveMonths.includes(a.month)
      );

      // Compute targets for this branch in the selected months
      // If viewing monthly, monthly target is roughly quarter target / 3
      const kpiStats: Record<string, { target: number; actual: number; pct: number; level: PerformanceLevel }> = {};

      for (const kpi of KPI_DEFINITIONS) {
        // Calculate target sum
        let totalTargetForScope = 0;
        
        for (const m of effectiveMonths) {
          const q = getQuarterFromMonth(m);
          const tRecord = targets.find(t => 
            t.branchId === branch.id && 
            t.year === selectedYear && 
            t.quarter === q && 
            t.kpiKey === kpi.key
          );
          const qTarget = tRecord ? tRecord.targetValue : kpi.defaultQuarterTarget;
          
          if (kpi.isPercentage) {
            // For percentage (like CSI or efficiency), the target is average
            totalTargetForScope = qTarget;
          } else {
            // Target for 1 month is Q target / 3
            totalTargetForScope += qTarget / 3;
          }
        }

        if (kpi.isPercentage) {
          // average target
          // totalTargetForScope is already the average target
        }

        // Calculate actual sum
        const records = branchActuals.filter(a => a.kpiKey === kpi.key);
        let totalActual = 0;
        if (records.length > 0) {
          if (kpi.isPercentage) {
            const sum = records.reduce((acc, r) => acc + r.actualValue, 0);
            totalActual = Math.round(sum / records.length);
          } else {
            totalActual = records.reduce((acc, r) => acc + r.actualValue, 0);
          }
        }

        const effectiveTarget = Math.round(totalTargetForScope);
        const achievementPct = effectiveTarget > 0 ? Math.round((totalActual / effectiveTarget) * 100) : 0;
        const level = calculatePerformanceLevel(achievementPct);

        kpiStats[kpi.key] = {
          target: effectiveTarget,
          actual: totalActual,
          pct: achievementPct,
          level,
        };
      }

      // Overall branch revenue achievement
      const totalRevStat = kpiStats['total_revenue'] || { target: 1, actual: 0, pct: 0, level: 'red' };
      const roStat = kpiStats['repair_orders'] || { target: 1, actual: 0, pct: 0, level: 'red' };

      // Overall score is weighted or total revenue achievement
      const overallPct = totalRevStat.pct;
      const overallLevel = calculatePerformanceLevel(overallPct);

      return {
        branchId: branch.id,
        branchName: branch.name,
        companyId: branch.companyId,
        companyName: branch.companyName,
        kpis: kpiStats,
        overallPct,
        overallLevel,
        totalRevenueActual: totalRevStat.actual,
        totalRevenueTarget: totalRevStat.target,
        totalROActual: roStat.actual,
        totalROTarget: roStat.target,
      };
    });
  }, [targets, actuals, selectedYear, effectiveMonths]);

  // Apply filters
  const filteredBranchPerformances = useMemo(() => {
    return branchPerformances.filter(item => {
      // Company filter
      if (selectedCompany !== 'all' && item.companyId !== selectedCompany) {
        return false;
      }
      // Level filter
      if (selectedLevelFilter !== 'all' && item.overallLevel !== selectedLevelFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return item.branchName.toLowerCase().includes(query) || item.companyName.toLowerCase().includes(query);
      }
      return true;
    });
  }, [branchPerformances, selectedCompany, selectedLevelFilter, searchQuery]);

  // Aggregate Company performance
  const companyPerformances = useMemo(() => {
    return COMPANIES.map(company => {
      const branchesOfCompany = branchPerformances.filter(b => b.companyId === company.id);
      const totalRevTarget = branchesOfCompany.reduce((sum, b) => sum + b.totalRevenueTarget, 0);
      const totalRevActual = branchesOfCompany.reduce((sum, b) => sum + b.totalRevenueActual, 0);
      const totalROTarget = branchesOfCompany.reduce((sum, b) => sum + b.totalROTarget, 0);
      const totalROActual = branchesOfCompany.reduce((sum, b) => sum + b.totalROActual, 0);

      const overallPct = totalRevTarget > 0 ? Math.round((totalRevActual / totalRevTarget) * 100) : 0;
      const overallLevel = calculatePerformanceLevel(overallPct);

      const greenCount = branchesOfCompany.filter(b => b.overallLevel === 'green').length;
      const yellowCount = branchesOfCompany.filter(b => b.overallLevel === 'yellow').length;
      const redCount = branchesOfCompany.filter(b => b.overallLevel === 'red').length;

      return {
        ...company,
        branchesCount: branchesOfCompany.length,
        totalRevTarget,
        totalRevActual,
        totalROTarget,
        totalROActual,
        overallPct,
        overallLevel,
        greenCount,
        yellowCount,
        redCount,
        branches: branchesOfCompany,
      };
    });
  }, [branchPerformances]);

  // Group-wide summary metrics
  const groupSummary = useMemo(() => {
    const totalRevTarget = branchPerformances.reduce((acc, b) => acc + b.totalRevenueTarget, 0);
    const totalRevActual = branchPerformances.reduce((acc, b) => acc + b.totalRevenueActual, 0);
    const totalROTarget = branchPerformances.reduce((acc, b) => acc + b.totalROTarget, 0);
    const totalROActual = branchPerformances.reduce((acc, b) => acc + b.totalROActual, 0);

    const overallPct = totalRevTarget > 0 ? Math.round((totalRevActual / totalRevTarget) * 100) : 0;
    const overallLevel = calculatePerformanceLevel(overallPct);

    const greenBranches = branchPerformances.filter(b => b.overallLevel === 'green');
    const yellowBranches = branchPerformances.filter(b => b.overallLevel === 'yellow');
    const redBranches = branchPerformances.filter(b => b.overallLevel === 'red');

    // Sorted top branch
    const sorted = [...branchPerformances].sort((a, b) => b.overallPct - a.overallPct);
    const topBranch = sorted[0];

    return {
      totalRevTarget,
      totalRevActual,
      totalROTarget,
      totalROActual,
      overallPct,
      overallLevel,
      greenCount: greenBranches.length,
      yellowCount: yellowBranches.length,
      redCount: redBranches.length,
      topBranch,
      totalBranches: branchPerformances.length,
    };
  }, [branchPerformances]);

  // Format currency helper
  const formatBaht = (val: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(val);
  };

  const getPeriodLabel = () => {
    if (viewMode === 'monthly') {
      if (selectedMonth > 0) {
        return `ประจำเดือน ${MONTH_NAMES_TH[selectedMonth - 1]} ${selectedYear}`;
      }
      if (selectedQuarter > 0) {
        return `ประจำไตรมาส ${selectedQuarter} (3 เดือน) ปี ${selectedYear}`;
      }
      return `สะสมทั้งปี ${selectedYear}`;
    } else {
      return `ประจำไตรมาส ${selectedQuarter} ปี ${selectedYear}`;
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['บริษัท', 'สาขา', 'รายได้เป้าหมาย(บาท)', 'รายได้จริง(บาท)', '%ผลสำเร็จ', 'สถานะ', 'จำนวนROเป้า', 'จำนวนROจริง'];
    const rows = filteredBranchPerformances.map(b => [
      `"${b.companyName}"`,
      `"${b.branchName}"`,
      b.totalRevenueTarget,
      b.totalRevenueActual,
      `${b.overallPct}%`,
      b.overallLevel === 'green' ? 'เขียว(>=100%)' : b.overallLevel === 'yellow' ? 'เหลือง(80-99%)' : 'แดง(<80%)',
      b.totalROTarget,
      b.totalROActual,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานผลดำเนินงานศูนย์บริการ_เครือบ้านดอนปิยะ_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome & Context Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 rounded-2xl p-6 text-white shadow-xl shadow-red-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>แดชบอร์ดระดับผู้บริหารสูงสุด (Executive Dashboard)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ภาพรวมผลการดำเนินงานฝ่ายศูนย์บริการ
            </h2>
            <p className="text-red-100 text-sm mt-1">
              {getPeriodLabel()} • ครอบคลุม 6 บริษัทตัวแทนจำหน่าย และ 12 ศูนย์บริการในเครือบ้านดอนปิยะ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              onClick={onNavigateToKPISetting}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-red-700 hover:bg-red-50 transition shadow-sm"
            >
              <span>ตั้งเป้าหมายไตรมาส</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Clean White Card) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Main Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-red-600" />
              <span>ตัวกรองรายงาน:</span>
            </div>

            {/* View Mode */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'monthly' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => setViewMode('quarterly')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'quarterly' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                รายไตรมาส
              </button>
            </div>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="เลือกปี"
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={2025}>ปี 2025</option>
              <option value={2026}>ปี 2026 (ปัจจุบัน)</option>
              <option value={2027}>ปี 2027</option>
            </select>

            {/* Quarter Selector */}
            <select
              value={selectedQuarter}
              onChange={(e) => {
                const q = Number(e.target.value);
                setSelectedQuarter(q);
                if (q > 0) {
                  // Select first month of quarter
                  setSelectedMonth(QUARTER_MONTHS[q][0]);
                }
              }}
              aria-label="เลือกไตรมาส"
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={1}>ไตรมาส 1 (Q1: ม.ค.-มี.ค.)</option>
              <option value={2}>ไตรมาส 2 (Q2: เม.ย.-มิ.ย.)</option>
              <option value={3}>ไตรมาส 3 (Q3: ก.ค.-ก.ย.)</option>
              <option value={4}>ไตรมาส 4 (Q4: ต.ค.-ธ.ค.)</option>
            </select>

            {/* Month Selector (if in monthly view) */}
            {viewMode === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setSelectedMonth(m);
                  if (m > 0) {
                    setSelectedQuarter(getQuarterFromMonth(m));
                  }
                }}
                aria-label="เลือกเดือน"
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {MONTH_NAMES_TH.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    เดือน {name}
                  </option>
                ))}
              </select>
            )}

            {/* Company Selector */}
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              aria-label="เลือกบริษัท"
              className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">ทุกบริษัท (6 บริษัท)</option>
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Performance Level Filter */}
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              aria-label="เลือกระดับผลงาน"
              className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">ทุกระดับผลงาน</option>
              <option value="green">🟢 เกินเป้า (≥ 100%)</option>
              <option value="yellow">🟡 ตามเป้า 80 - 99%</option>
              <option value="red">🔴 ต่ำกว่าเป้า (&lt; 80%)</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสาขาหรือบริษัท..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Group Overview High-Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Service Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              รายได้รวมศูนย์บริการทั้งหมด
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${PERFORMANCE_CONFIG[groupSummary.overallLevel].badgeBg}`}>
              {groupSummary.overallPct}%
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ฿{formatBaht(groupSummary.totalRevActual)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>เป้าหมาย: ฿{formatBaht(groupSummary.totalRevTarget)}</span>
              <span className={`font-semibold ${
                groupSummary.totalRevActual >= groupSummary.totalRevTarget ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {groupSummary.totalRevActual >= groupSummary.totalRevTarget ? '+' : ''}
                {formatBaht(groupSummary.totalRevActual - groupSummary.totalRevTarget)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                groupSummary.overallLevel === 'green' ? 'bg-emerald-500' :
                groupSummary.overallLevel === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, groupSummary.overallPct)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Repair Orders (RO) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              จำนวนรถเข้าซ่อม (ROs)
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {groupSummary.totalROTarget > 0 ? Math.round((groupSummary.totalROActual / groupSummary.totalROTarget) * 100) : 0}%
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatBaht(groupSummary.totalROActual)} <span className="text-sm font-normal text-slate-500">คัน</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              เป้าหมาย: {formatBaht(groupSummary.totalROTarget)} คัน
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, groupSummary.totalROTarget > 0 ? (groupSummary.totalROActual / groupSummary.totalROTarget) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Traffic Light Performance Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-3">
            การกระจายตัวของสถานะสาขา (12 สาขา)
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
              <div className="text-lg font-bold text-emerald-700">{groupSummary.greenCount}</div>
              <div className="text-[11px] font-medium text-emerald-800">🟢 เกินเป้า</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{groupSummary.yellowCount}</div>
              <div className="text-[11px] font-medium text-amber-800">🟡 80-99%</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center">
              <div className="text-lg font-bold text-rose-700">{groupSummary.redCount}</div>
              <div className="text-[11px] font-medium text-rose-800">🔴 ต่ำ 80%</div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 text-center">
            {groupSummary.greenCount >= 6 ? 'สถานะโดยรวมอยู่ในเกณฑ์ดีเยี่ยม' : 'มีสาขาที่ต้องเร่งผลักดันยอด'}
          </div>
        </div>

        {/* Card 4: Top Performing Branch */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-red-500/10 rounded-2xl p-5 border border-amber-200/80 shadow-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide flex items-center space-x-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>สาขาผลงานสูงสุด (TOP)</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {groupSummary.topBranch?.overallPct}%
            </span>
          </div>

          <div className="mt-2.5">
            <div className="font-bold text-slate-900 text-base leading-snug">
              {groupSummary.topBranch?.branchName}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {groupSummary.topBranch?.companyName}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              รายได้: ฿{formatBaht(groupSummary.topBranch?.totalRevenueActual || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-2 sm:space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('branches')}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeSubTab === 'branches'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. เปรียบเทียบตามสาขา ({filteredBranchPerformances.length} สาขา)
            </button>

            <button
              onClick={() => setActiveSubTab('companies')}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeSubTab === 'companies'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. เปรียบเทียบตามบริษัท (6 บริษัท)
            </button>

            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeSubTab === 'matrix'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              3. ตาราง Matrix ตัวชี้วัดครบทุก KPI
            </button>

            <button
              onClick={() => setActiveSubTab('alerts')}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === 'alerts'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>4. รายการสาขาต้องปรับปรุง ({groupSummary.redCount + groupSummary.yellowCount} สาขา)</span>
            </button>
          </div>

          <div className="pb-3 text-xs text-slate-400 hidden sm:block">
            คลิกที่แถวเพื่อดูรายละเอียดเชิงลึก
          </div>
        </div>

        {/* Tab 1 Content: Branch Comparison & Ranking */}
        {activeSubTab === 'branches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">อันดับ</th>
                  <th className="py-3 px-4">บริษัท</th>
                  <th className="py-3 px-4">สาขา</th>
                  <th className="py-3 px-4 text-right">เป้าหมายรายได้</th>
                  <th className="py-3 px-4 text-right">ผลรายได้จริง</th>
                  <th className="py-3 px-4 text-right">ส่วนต่าง</th>
                  <th className="py-3 px-4 text-center">รถเข้าซ่อม (RO)</th>
                  <th className="py-3 px-4 text-center">% บรรลุเป้าหมาย</th>
                  <th className="py-3 px-4 text-center">ระดับผลงาน</th>
                  <th className="py-3 px-4 text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranchPerformances
                  .sort((a, b) => b.overallPct - a.overallPct)
                  .map((branch, index) => {
                    const statusConfig = PERFORMANCE_CONFIG[branch.overallLevel];
                    const diff = branch.totalRevenueActual - branch.totalRevenueTarget;

                    return (
                      <tr 
                        key={branch.branchId} 
                        className="hover:bg-slate-50/80 transition group"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          {index === 0 && <span className="text-amber-500 font-black">🥇 #1</span>}
                          {index === 1 && <span className="text-slate-500 font-bold">🥈 #2</span>}
                          {index === 2 && <span className="text-amber-700 font-bold">🥉 #3</span>}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">
                            {branch.companyName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 group-hover:text-red-700 transition">
                            {branch.branchName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                          ฿{formatBaht(branch.totalRevenueTarget)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          ฿{formatBaht(branch.totalRevenueActual)}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {diff >= 0 ? '+' : ''}{formatBaht(diff)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700">
                          <span className="font-semibold">{branch.totalROActual}</span> / <span className="text-slate-400">{branch.totalROTarget}</span> คัน
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-1.5">
                            <span className="font-bold text-sm text-slate-800">
                              {branch.overallPct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeBg}`}>
                            {branch.overallLevel === 'green' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {branch.overallLevel === 'yellow' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                            {branch.overallLevel === 'red' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={onNavigateToManager}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline"
                          >
                            บันทึก/แก้ไข
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2 Content: Company Comparison */}
        {activeSubTab === 'companies' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyPerformances.map((comp) => {
              const statusCfg = PERFORMANCE_CONFIG[comp.overallLevel];
              return (
                <div 
                  key={comp.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-red-200 hover:shadow-md transition p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        {comp.shortName}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {comp.name}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeBg}`}>
                      {comp.overallPct}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    จำนวนสาขา: <span className="font-semibold text-slate-800">{comp.branchesCount} สาขา</span>
                  </div>

                  {/* Revenue comparison */}
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">เป้าหมายรวม:</span>
                      <span className="font-medium text-slate-700">฿{formatBaht(comp.totalRevTarget)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ผลจริงรวม:</span>
                      <span className="font-bold text-slate-900">฿{formatBaht(comp.totalRevActual)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          comp.overallLevel === 'green' ? 'bg-emerald-500' :
                          comp.overallLevel === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, comp.overallPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Branches in this company */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      สถานะรายสาขา:
                    </div>
                    {comp.branches.map(b => (
                      <div key={b.branchId} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <span className="text-slate-700 truncate max-w-[150px]">{b.branchName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{b.overallPct}%</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            b.overallLevel === 'green' ? 'bg-emerald-500' :
                            b.overallLevel === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3 Content: Matrix of all KPIs */}
        {activeSubTab === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3">บริษัท / สาขา</th>
                  <th className="py-3 px-3 text-center">รายได้ค่าแรง</th>
                  <th className="py-3 px-3 text-center">รายได้อะไหล่</th>
                  <th className="py-3 px-3 text-center">รายได้รวมศูนย์</th>
                  <th className="py-3 px-3 text-center">จำนวนรถ (RO)</th>
                  <th className="py-3 px-3 text-center">ประสิทธิภาพช่าง</th>
                  <th className="py-3 px-3 text-center">ความพึงพอใจ CSI</th>
                  <th className="py-3 px-3 text-center">ซ่อมจบครั้งเดียว FIR</th>
                  <th className="py-3 px-3 text-center">สรุปผลงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranchPerformances.map((b) => (
                  <tr key={b.branchId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{b.branchName}</div>
                      <div className="text-[11px] text-slate-500">{b.companyName}</div>
                    </td>

                    {/* Labor Revenue */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        ฿{formatBaht(b.kpis['labor_revenue']?.actual || 0)}
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['labor_revenue']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['labor_revenue']?.pct || 0}%
                      </span>
                    </td>

                    {/* Parts Revenue */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        ฿{formatBaht(b.kpis['parts_revenue']?.actual || 0)}
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['parts_revenue']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['parts_revenue']?.pct || 0}%
                      </span>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3 px-2 text-center bg-slate-50/50">
                      <div className="font-bold text-slate-900">
                        ฿{formatBaht(b.kpis['total_revenue']?.actual || 0)}
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['total_revenue']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['total_revenue']?.pct || 0}%
                      </span>
                    </td>

                    {/* Repair Orders */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        {b.kpis['repair_orders']?.actual || 0} คัน
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['repair_orders']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['repair_orders']?.pct || 0}%
                      </span>
                    </td>

                    {/* Efficiency */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        {b.kpis['mechanic_efficiency']?.actual || 0}%
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['mechanic_efficiency']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['mechanic_efficiency']?.pct || 0}%
                      </span>
                    </td>

                    {/* CSI */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        {b.kpis['csi_score']?.actual || 0}%
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['csi_score']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['csi_score']?.pct || 0}%
                      </span>
                    </td>

                    {/* FIR */}
                    <td className="py-3 px-2 text-center">
                      <div className="font-medium text-slate-900">
                        {b.kpis['fir_rate']?.actual || 0}%
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 rounded font-bold ${
                        PERFORMANCE_CONFIG[b.kpis['fir_rate']?.level || 'red'].badgeBg
                      }`}>
                        {b.kpis['fir_rate']?.pct || 0}%
                      </span>
                    </td>

                    {/* Overall Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold border ${
                        PERFORMANCE_CONFIG[b.overallLevel].badgeBg
                      }`}>
                        <span>{b.overallPct}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4 Content: Underperforming Branches Alerts */}
        {activeSubTab === 'alerts' && (
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-amber-900 text-sm">
                  รายงานวิเคราะห์สาขาที่ผลงานต่ำกว่าเป้าหมาย (ต้องการการสนับสนุนจากผู้บริหาร)
                </h4>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                รายการสาขาที่มีผลสัมฤทธิ์ระดับสีแดง (&lt;80%) หรือสีเหลือง (80-99%) ควรจัดประชุมร่วมกับผู้จัดการสาขาเพื่อวางแผนแก้ปัญหายอดรายได้และปริมาณงานซ่อม
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchPerformances
                .filter(b => b.overallLevel === 'red' || b.overallLevel === 'yellow')
                .sort((a, b) => a.overallPct - b.overallPct)
                .map((b) => {
                  const isRed = b.overallLevel === 'red';
                  const gap = b.totalRevenueTarget - b.totalRevenueActual;

                  return (
                    <div 
                      key={b.branchId}
                      className={`p-4 rounded-xl border ${
                        isRed ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`text-[11px] font-bold uppercase ${isRed ? 'text-rose-700' : 'text-amber-700'}`}>
                            {b.companyName}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {b.branchName}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          PERFORMANCE_CONFIG[b.overallLevel].badgeBg
                        }`}>
                          {b.overallPct}%
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 mt-3">
                        <div className="flex justify-between">
                          <span>รายได้ขาดจากเป้าหมาย:</span>
                          <span className="font-bold text-rose-600">-฿{formatBaht(gap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>รถเข้าซ่อมจริง:</span>
                          <span className="font-medium">{b.totalROActual} / {b.totalROTarget} คัน</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          สถานะ: {isRed ? '🔴 วิกฤต ต่ำกว่า 80%' : '🟡 เฝ้าระวัง 80-99%'}
                        </span>
                        <button
                          onClick={onNavigateToManager}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
                        >
                          ตรวจเช็กข้อมูลสาขานี้ →
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
