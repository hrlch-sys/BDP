import React, { useState, useEffect, useMemo } from 'react';
import { 
  KPITargetRecord, 
  ActualRecord, 
  KPIKey 
} from '../types';
import { 
  COMPANIES, 
  ALL_BRANCHES, 
  KPI_DEFINITIONS, 
  MONTH_NAMES_TH, 
  calculatePerformanceLevel, 
  PERFORMANCE_CONFIG,
  getQuarterFromMonth
} from '../data/initialData';
import { 
  Save, 
  CheckCircle, 
  Calendar, 
  Building2, 
  HelpCircle, 
  History, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ManagerEntryProps {
  targets: KPITargetRecord[];
  actuals: ActualRecord[];
  onSaveActuals: (records: ActualRecord[]) => void;
  onNavigateToExecutive: () => void;
}

export const ManagerEntry: React.FC<ManagerEntryProps> = ({
  targets,
  actuals,
  onSaveActuals,
  onNavigateToExecutive,
}) => {
  // Selection
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('nissan');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('nissan-surat');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // October
  const [managerName, setManagerName] = useState<string>('ผู้จัดการฝ่ายศูนย์บริการ');
  const [notes, setNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Values being entered: [kpiKey] -> number string
  const [formValues, setFormValues] = useState<Record<string, string>>({
    labor_revenue: '420000',
    parts_revenue: '850000',
    total_revenue: '1270000',
    repair_orders: '160',
    mechanic_efficiency: '92',
    csi_score: '96',
    fir_rate: '98',
  });

  // Filter branches by selected company
  const availableBranches = useMemo(() => {
    return ALL_BRANCHES.filter(b => b.companyId === selectedCompanyId);
  }, [selectedCompanyId]);

  // When company changes, pick first branch
  const handleCompanyChange = (compId: string) => {
    setSelectedCompanyId(compId);
    const firstBranch = ALL_BRANCHES.find(b => b.companyId === compId);
    if (firstBranch) {
      setSelectedBranchId(firstBranch.id);
    }
  };

  const currentQuarter = getQuarterFromMonth(selectedMonth);

  // Load existing actuals if already recorded for this branch, year, month
  useEffect(() => {
    const existing = actuals.filter(a => 
      a.branchId === selectedBranchId && 
      a.year === selectedYear && 
      a.month === selectedMonth
    );

    if (existing.length > 0) {
      const newVals: Record<string, string> = {};
      let existingNotes = '';
      for (const rec of existing) {
        newVals[rec.kpiKey] = String(rec.actualValue);
        if (rec.notes) existingNotes = rec.notes;
      }
      setFormValues(prev => ({ ...prev, ...newVals }));
      if (existingNotes) setNotes(existingNotes);
    }
  }, [selectedBranchId, selectedYear, selectedMonth, actuals]);

  // Get Targets for current branch in this month (Quarter Target / 3)
  const currentTargets = useMemo(() => {
    const targetMap: Record<string, number> = {};
    for (const kpi of KPI_DEFINITIONS) {
      const tRecord = targets.find(t => 
        t.branchId === selectedBranchId && 
        t.year === selectedYear && 
        t.quarter === currentQuarter && 
        t.kpiKey === kpi.key
      );
      const qVal = tRecord ? tRecord.targetValue : kpi.defaultQuarterTarget;
      // Monthly target is roughly qVal / 3 (except percentages)
      targetMap[kpi.key] = kpi.isPercentage ? qVal : Math.round(qVal / 3);
    }
    return targetMap;
  }, [targets, selectedBranchId, selectedYear, currentQuarter]);

  // Auto calculate total revenue when labor or parts change
  const handleValueChange = (kpiKey: KPIKey, rawVal: string) => {
    const numericStr = rawVal.replace(/[^0-9.]/g, '');
    const newVals = { ...formValues, [kpiKey]: numericStr };

    if (kpiKey === 'labor_revenue' || kpiKey === 'parts_revenue') {
      const labor = parseFloat(newVals['labor_revenue'] || '0') || 0;
      const parts = parseFloat(newVals['parts_revenue'] || '0') || 0;
      newVals['total_revenue'] = String(Math.round(labor + parts));
    }

    setFormValues(newVals);
  };

  // Quick fill sample data
  const handleQuickFillRealistic = () => {
    const newVals: Record<string, string> = {};
    for (const kpi of KPI_DEFINITIONS) {
      const target = currentTargets[kpi.key] || 100;
      // generate 85-105% performance
      const factor = 0.95 + Math.random() * 0.15;
      newVals[kpi.key] = String(Math.round(target * factor));
    }
    // ensure total revenue matches
    const labor = parseFloat(newVals['labor_revenue']) || 0;
    const parts = parseFloat(newVals['parts_revenue']) || 0;
    newVals['total_revenue'] = String(labor + parts);
    setFormValues(newVals);
  };

  // Submit form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const currentBranch = ALL_BRANCHES.find(b => b.id === selectedBranchId);
    if (!currentBranch) return;

    const newRecords: ActualRecord[] = [];
    const timestamp = new Date().toISOString();

    for (const kpi of KPI_DEFINITIONS) {
      const val = parseFloat(formValues[kpi.key] || '0') || 0;
      newRecords.push({
        id: `actual-${selectedBranchId}-${selectedYear}-m${selectedMonth}-${kpi.key}`,
        branchId: selectedBranchId,
        year: selectedYear,
        month: selectedMonth,
        quarter: currentQuarter,
        kpiKey: kpi.key,
        actualValue: val,
        notes: notes.trim() || undefined,
        updatedAt: timestamp,
        updatedBy: `${managerName} (${currentBranch.name})`,
      });
    }

    onSaveActuals(newRecords);
    setSaveSuccessMsg(`บันทึกผลงานเดือน ${MONTH_NAMES_TH[selectedMonth - 1]} เรียบร้อยแล้ว!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const selectedBranchObj = ALL_BRANCHES.find(b => b.id === selectedBranchId);

  // Format number
  const formatNum = (val: number) => new Intl.NumberFormat('th-TH').format(val);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-red-400" />
              <span>พอร์ทัลบันทึกผลการดำเนินงาน (Service Manager Portal)</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              บันทึกตัวเลขผลดำเนินงานรายเดือน
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              กรอกผลงานจริงฝ่ายศูนย์บริการ ระบบจะเปรียบเทียบกับเป้าหมายไตรมาสที่ผู้บริหารกำหนด และคำนวณระดับไฟเขียว เหลือง แดง ให้โดยอัตโนมัติ
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToExecutive}
            className="self-start md:self-auto inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition shadow"
          >
            <span>ดูหน้าแดชบอร์ดสรุปผล</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Selector Section */}
        <div className="bg-slate-50/80 p-5 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            ข้อมูลสาขาและงวดเวลาที่ต้องการบันทึก
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บริษัทในเครือ *
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Branch Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สาขาศูนย์บริการ *
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปี พ.ศ. / ค.ศ.
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026 (ปัจจุบัน)</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประจำเดือน *
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {MONTH_NAMES_TH.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    เดือน {m} (ไตรมาส {getQuarterFromMonth(idx + 1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="font-semibold text-slate-800">สาขาที่เลือก:</span>
              <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                {selectedBranchObj?.companyName} - {selectedBranchObj?.name}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                เป้าหมายมาจาก: ไตรมาส {currentQuarter} (ปี {selectedYear})
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickFillRealistic}
              className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-700 transition"
              title="สุ่มตัวเลขทดสอบใกล้เคียงเป้าหมาย"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>สุ่มตัวเลขทดสอบ</span>
            </button>
          </div>
        </div>

        {/* Data Entry Fields with Real-time Traffic Light */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              กรอกตัวเลขผลการดำเนินงานจริง (Actuals)
            </h3>
            <span className="text-xs text-slate-400">
              * ระบบแสดงสถานะ เขียว / เหลือง / แดง ทันทีที่กรอก
            </span>
          </div>

          <div className="space-y-4">
            {KPI_DEFINITIONS.map((kpi) => {
              const currentVal = parseFloat(formValues[kpi.key] || '0') || 0;
              const targetVal = currentTargets[kpi.key] || 1;
              const pct = targetVal > 0 ? Math.round((currentVal / targetVal) * 100) : 0;
              const level = calculatePerformanceLevel(pct);
              const status = PERFORMANCE_CONFIG[level];

              return (
                <div 
                  key={kpi.key}
                  className={`p-4 rounded-xl border transition-all ${
                    kpi.key === 'total_revenue' 
                      ? 'bg-red-50/40 border-red-200 ring-1 ring-red-100' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* KPI Info */}
                    <div className="sm:w-1/3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">
                          {kpi.label}
                        </span>
                        {kpi.key === 'total_revenue' && (
                          <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                            คำนวณอัตโนมัติ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {kpi.description}
                      </p>
                      <div className="text-xs text-slate-600 font-medium mt-1">
                        เป้าหมายเดือนนี้: <span className="font-bold text-slate-800">{formatNum(targetVal)}</span> {kpi.unit}
                      </div>
                    </div>

                    {/* Input Field */}
                    <div className="sm:w-1/3">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formValues[kpi.key] || ''}
                          onChange={(e) => handleValueChange(kpi.key, e.target.value)}
                          placeholder="0"
                          className="w-full text-right font-mono font-bold text-base px-3 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>

                    {/* Real-time Achievement & Badge */}
                    <div className="sm:w-1/3 flex items-center justify-end space-x-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">ผลงานเทียบเป้า:</div>
                        <div className="text-base font-extrabold text-slate-900">
                          {pct}%
                        </div>
                      </div>

                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 ${status.badgeBg}`}>
                        <span className={`w-2 h-2 rounded-full ${
                          level === 'green' ? 'bg-emerald-600' :
                          level === 'yellow' ? 'bg-amber-600' : 'bg-rose-600'
                        }`} />
                        <span>{status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manager Notes & Sign-off */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้บันทึก / ตำแหน่งผู้จัดการ
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="ระบุชื่อผู้จัดการฝ่ายบริการ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเหตุ / ชี้แจงผลดำเนินงาน (ถ้ามี)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ช่างขาด 2 อัตรา, มีแคมเปญตรวจเช็กฟรี 24 รายการ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Success Message */}
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onNavigateToExecutive}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกผลงานเดือน {MONTH_NAMES_TH[selectedMonth - 1]}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
