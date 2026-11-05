import React, { useState, useMemo } from 'react';
import { 
  KPITargetRecord, 
  KPIKey 
} from '../types';
import { 
  COMPANIES, 
  ALL_BRANCHES, 
  KPI_DEFINITIONS, 
  QUARTER_MONTHS 
} from '../data/initialData';
import { 
  Target, 
  Save, 
  CheckCircle, 
  Copy, 
  TrendingUp, 
  Building2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Percent
} from 'lucide-react';

interface ExecutiveKPISettingProps {
  targets: KPITargetRecord[];
  onSaveTargets: (newTargets: KPITargetRecord[]) => void;
  onNavigateToExecutive: () => void;
}

export const ExecutiveKPISetting: React.FC<ExecutiveKPISettingProps> = ({
  targets,
  onSaveTargets,
  onNavigateToExecutive,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(3);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [executiveName, setExecutiveName] = useState<string>('คณะกรรมการบริหาร เครือบ้านดอนปิยะ');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Local state representing the working grid of targets for selectedYear and selectedQuarter
  // Map: `${branchId}_${kpiKey}` -> value string
  const [gridValues, setGridValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const b of ALL_BRANCHES) {
      for (const kpi of KPI_DEFINITIONS) {
        const found = targets.find(t => 
          t.branchId === b.id && 
          t.year === 2026 && 
          t.quarter === 3 && 
          t.kpiKey === kpi.key
        );
        map[`${b.id}_${kpi.key}`] = found ? String(found.targetValue) : String(kpi.defaultQuarterTarget);
      }
    }
    return map;
  });

  // Reload grid when Year or Quarter changes
  const handleYearQuarterChange = (year: number, q: 1 | 2 | 3 | 4) => {
    setSelectedYear(year);
    setSelectedQuarter(q);
    const map: Record<string, string> = {};
    for (const b of ALL_BRANCHES) {
      for (const kpi of KPI_DEFINITIONS) {
        const found = targets.find(t => 
          t.branchId === b.id && 
          t.year === year && 
          t.quarter === q && 
          t.kpiKey === kpi.key
        );
        map[`${b.id}_${kpi.key}`] = found ? String(found.targetValue) : String(kpi.defaultQuarterTarget);
      }
    }
    setGridValues(map);
  };

  const handleCellChange = (branchId: string, kpiKey: KPIKey, val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const updated = { ...gridValues, [`${branchId}_${kpiKey}`]: clean };

    // Auto update total_revenue if labor or parts changes
    if (kpiKey === 'labor_revenue' || kpiKey === 'parts_revenue') {
      const labor = parseFloat(updated[`${branchId}_labor_revenue`] || '0') || 0;
      const parts = parseFloat(updated[`${branchId}_parts_revenue`] || '0') || 0;
      updated[`${branchId}_total_revenue`] = String(Math.round(labor + parts));
    }

    setGridValues(updated);
  };

  // Batch action: Increase revenue targets by percentage (e.g. +5% or +10%)
  const handleBatchAdjust = (percentChange: number) => {
    const updated = { ...gridValues };
    const factor = 1 + (percentChange / 100);

    for (const b of ALL_BRANCHES) {
      if (selectedCompanyFilter !== 'all' && b.companyId !== selectedCompanyFilter) continue;

      for (const kpi of KPI_DEFINITIONS) {
        // Only adjust revenue and ROs, leave % efficiencies as is
        if (!kpi.isPercentage) {
          const key = `${b.id}_${kpi.key}`;
          const current = parseFloat(updated[key] || '0') || 0;
          updated[key] = String(Math.round(current * factor));
        }
      }
    }
    setGridValues(updated);
    setSuccessMsg(`ปรับเป้าหมายรายได้และจำนวนงานซ่อม ${percentChange > 0 ? '+' : ''}${percentChange}% เรียบร้อยแล้ว`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Batch action: Clone from another quarter
  const handleCopyFromQuarter = (sourceQ: 1 | 2 | 3 | 4) => {
    const updated = { ...gridValues };
    for (const b of ALL_BRANCHES) {
      for (const kpi of KPI_DEFINITIONS) {
        const found = targets.find(t => 
          t.branchId === b.id && 
          t.year === selectedYear && 
          t.quarter === sourceQ && 
          t.kpiKey === kpi.key
        );
        if (found) {
          updated[`${b.id}_${kpi.key}`] = String(found.targetValue);
        }
      }
    }
    setGridValues(updated);
    setSuccessMsg(`คัดลอกเป้าหมายจากไตรมาส ${sourceQ} มายังไตรมาส ${selectedQuarter} เรียบร้อยแล้ว`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Save all target records
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();

    // Create new target records list replacing selectedYear and selectedQuarter
    const otherTargets = targets.filter(t => !(t.year === selectedYear && t.quarter === selectedQuarter));
    const newQuarterTargets: KPITargetRecord[] = [];

    for (const b of ALL_BRANCHES) {
      for (const kpi of KPI_DEFINITIONS) {
        const key = `${b.id}_${kpi.key}`;
        const val = parseFloat(gridValues[key] || '0') || 0;
        newQuarterTargets.push({
          id: `target-${b.id}-${selectedYear}-q${selectedQuarter}-${kpi.key}`,
          branchId: b.id,
          year: selectedYear,
          quarter: selectedQuarter,
          kpiKey: kpi.key,
          targetValue: val,
          updatedAt: timestamp,
          updatedBy: executiveName,
        });
      }
    }

    onSaveTargets([...otherTargets, ...newQuarterTargets]);
    setSuccessMsg(`บันทึกเป้าหมาย KPI ประจำไตรมาส ${selectedQuarter} ปี ${selectedYear} เรียบร้อยแล้ว!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredBranches = useMemo(() => {
    if (selectedCompanyFilter === 'all') return ALL_BRANCHES;
    return ALL_BRANCHES.filter(b => b.companyId === selectedCompanyFilter);
  }, [selectedCompanyFilter]);

  const formatNumber = (num: number) => new Intl.NumberFormat('th-TH').format(num);

  return (
    <div className="space-y-6 pb-12">
      {/* Executive KPI Banner */}
      <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-300" />
              <span>การกำหนดทิศทางและเป้าหมายองค์กร (Executive Target Setting)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              กำหนดเป้าหมาย KPI แต่ละสาขา รายไตรมาส
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-3xl">
              ผู้บริหารสามารถกำหนดเป้าหมายฝ่ายศูนย์บริการในแต่ละไตรมาส เพื่อใช้เป็นเกณฑ์ประเมินระดับ เขียว (≥100%), เหลือง (80-99%), และแดง (&lt;80%) สำหรับผู้จัดการสาขา
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToExecutive}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-red-800 hover:bg-rose-50 transition shadow"
            >
              ไปยังแดชบอร์ดสรุปผล →
            </button>
          </div>
        </div>
      </div>

      {/* Control & Batch Adjustments Toolbar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Quarter & Year Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 text-slate-700 font-semibold text-xs uppercase">
              <Target className="w-4 h-4 text-red-600" />
              <span>เลือกงวดไตรมาส:</span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => handleYearQuarterChange(Number(e.target.value), selectedQuarter)}
              className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value={2025}>ปี 2025</option>
              <option value={2026}>ปี 2026 (ปัจจุบัน)</option>
              <option value={2027}>ปี 2027</option>
            </select>

            {/* Quarter Pill selector */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200 text-xs">
              {([1, 2, 3, 4] as const).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleYearQuarterChange(selectedYear, q)}
                  className={`px-3 py-1 rounded-md font-bold transition ${
                    selectedQuarter === q
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q{q} ({q === 1 ? 'ม.ค.-มี.ค.' : q === 2 ? 'เม.ย.-มิ.ย.' : q === 3 ? 'ก.ค.-ก.ย.' : 'ต.ค.-ธ.ค.'})
                </button>
              ))}
            </div>

            {/* Company Filter */}
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">แสดงทุกบริษัท (12 สาขา)</option>
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Batch Tools */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-xs text-slate-500 font-medium">เครื่องมือปรับเป้าด่วน:</span>
            <button
              type="button"
              onClick={() => handleBatchAdjust(5)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              title="เพิ่มเป้าหมายรายได้ทุกสาขา +5%"
            >
              +5% ทั้งกลุ่ม
            </button>
            <button
              type="button"
              onClick={() => handleBatchAdjust(10)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              title="เพิ่มเป้าหมายรายได้ทุกสาขา +10%"
            >
              +10% ทั้งกลุ่ม
            </button>
            <button
              type="button"
              onClick={() => handleBatchAdjust(-5)}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
              title="ลดเป้าหมายรายได้ทุกสาขา -5%"
            >
              -5%
            </button>
            {selectedQuarter > 1 && (
              <button
                type="button"
                onClick={() => handleCopyFromQuarter((selectedQuarter - 1) as 1 | 2 | 3 | 4)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition"
              >
                <Copy className="w-3 h-3 text-slate-500" />
                <span>คัดลอกจาก Q{selectedQuarter - 1}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Setting Matrix Grid Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ตารางกำหนดเป้าหมายรายไตรมาส Q{selectedQuarter} ปี {selectedYear}
            </h3>
            <p className="text-xs text-slate-500">
              * ตัวเลขในตารางคือเป้าหมายรวมประจำไตรมาส (3 เดือน) ระบบจะเฉลี่ยหาร 3 เป็นเป้าหมายรายเดือนให้ผู้จัดการโดยอัตโนมัติ
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกเป้าหมายไตรมาส Q{selectedQuarter}</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 min-w-[200px]">บริษัท & สาขา</th>
                <th className="py-3 px-3 text-right min-w-[140px]">
                  เป้าค่าแรง (บาท)
                </th>
                <th className="py-3 px-3 text-right min-w-[140px]">
                  เป้าอะไหล่ (บาท)
                </th>
                <th className="py-3 px-3 text-right min-w-[150px] bg-red-50/50">
                  เป้ารายได้รวม (บาท)
                </th>
                <th className="py-3 px-3 text-right min-w-[110px]">
                  เป้ารถเข้า (RO)
                </th>
                <th className="py-3 px-3 text-right min-w-[100px]">
                  ประสิทธิภาพ (%)
                </th>
                <th className="py-3 px-3 text-right min-w-[100px]">
                  ความพึงพอใจ CSI (%)
                </th>
                <th className="py-3 px-3 text-right min-w-[100px]">
                  ซ่อมจบ FIR (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((branch) => {
                return (
                  <tr key={branch.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{branch.name}</div>
                      <div className="text-[11px] text-slate-500">{branch.companyName}</div>
                    </td>

                    {/* Labor revenue */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_labor_revenue`] || ''}
                        onChange={(e) => handleCellChange(branch.id, 'labor_revenue', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* Parts revenue */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_parts_revenue`] || ''}
                        onChange={(e) => handleCellChange(branch.id, 'parts_revenue', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* Total revenue */}
                    <td className="py-2 px-2 text-right bg-red-50/30">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_total_revenue`] || ''}
                        onChange={(e) => handleCellChange(branch.id, 'total_revenue', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono font-bold text-xs bg-white text-red-900 border border-red-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* Repair orders */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_repair_orders`] || ''}
                        onChange={(e) => handleCellChange(branch.id, 'repair_orders', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* Efficiency */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_mechanic_efficiency`] || '90'}
                        onChange={(e) => handleCellChange(branch.id, 'mechanic_efficiency', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* CSI */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_csi_score`] || '95'}
                        onChange={(e) => handleCellChange(branch.id, 'csi_score', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>

                    {/* FIR */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={gridValues[`${branch.id}_fir_rate`] || '98'}
                        onChange={(e) => handleCellChange(branch.id, 'fir_rate', e.target.value)}
                        className="w-full text-right px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Audit & Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-semibold">ลงนามผู้บริหาร:</span>
            <input
              type="text"
              value={executiveName}
              onChange={(e) => setExecutiveName(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onNavigateToExecutive}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              กลับสู่แดชบอร์ด
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกเป้าหมายไตรมาส Q{selectedQuarter} ทุกสาขา</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
