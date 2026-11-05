import React from 'react';
import { 
  Building2, 
  BarChart3, 
  FileEdit, 
  Target, 
  FileSpreadsheet, 
  RefreshCw, 
  Printer, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'executive' | 'manager' | 'kpi_setting' | 'gas_docs';
  setActiveTab: (tab: 'executive' | 'manager' | 'kpi_setting' | 'gas_docs') => void;
  userRole: 'executive' | 'manager';
  setUserRole: (role: 'executive' | 'manager') => void;
  onResetData: () => void;
  onOpenGasModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onResetData,
  onOpenGasModal,
}) => {
  return (
    <header className="bg-white border-b border-red-100 shadow-sm sticky top-0 z-40">
      {/* Top Bar with Brand & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-100">
          {/* Logo & Program Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                  BANDON PIYA GROUP
                </span>
                <span className="text-xs text-slate-400">ระบบบริหารศูนย์บริการ</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                รายงานผลดำเนินงานศูนย์บริการ <span className="text-red-600">เครือบ้านดอนปิยะ</span>
              </h1>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="no-print hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="พิมพ์รายงานสรุปผู้บริหาร"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>พิมพ์รายงาน</span>
            </button>

            {/* Google Apps Script Integration button */}
            <button
              onClick={onOpenGasModal}
              className="no-print inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              title="ดูโค้ดและเชื่อมต่อ Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Google Apps Script</span>
              <span className="md:hidden">ชีต</span>
            </button>

            {/* Reset sample data */}
            <button
              onClick={onResetData}
              className="no-print p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="คืนค่าข้อมูลตัวอย่างตั้งต้น"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Role Switcher Pill */}
            <div className="no-print bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setUserRole('executive');
                  if (activeTab === 'manager') setActiveTab('executive');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition ${
                  userRole === 'executive'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ผู้บริหาร</span>
              </button>
              <button
                onClick={() => {
                  setUserRole('manager');
                  if (activeTab === 'kpi_setting' || activeTab === 'executive') setActiveTab('manager');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition ${
                  userRole === 'manager'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ผู้จัดการ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (White & Red styling) */}
        <nav className="no-print flex space-x-2 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('executive')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'executive'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. แดชบอร์ดรายงานผลดำเนินงาน (ผู้บริหาร)</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'manager'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>2. บันทึกผลดำเนินงานรายเดือน (ผู้จัดการ)</span>
          </button>

          <button
            onClick={() => setActiveTab('kpi_setting')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'kpi_setting'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. กำหนดเป้าหมาย KPI รายไตรมาส (ผู้บริหาร)</span>
          </button>

          <button
            onClick={() => setActiveTab('gas_docs')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'gas_docs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>โครงสร้าง Google Sheet & Code.gs</span>
          </button>
        </nav>
      </div>

      {/* Traffic Light Rules Notification Banner */}
      <div className="bg-red-50/70 border-t border-red-100 px-4 py-1.5 text-xs text-slate-600 flex items-center justify-between max-w-7xl mx-auto overflow-x-auto">
        <div className="flex items-center space-x-4 min-w-max">
          <span className="font-semibold text-red-900">เกณฑ์ประเมินระดับผลดำเนินงาน:</span>
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>🟢 เขียว: ได้เกินเป้า (≥ 100%)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>🟡 เหลือง: ได้ 80 - 99%</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>🔴 แดง: ต่ำกว่า 80%</span>
          </span>
        </div>
        <div className="hidden lg:block text-slate-500 text-right text-[11px]">
          6 บริษัท • 12 สาขาบริการในเครือบ้านดอนปิยะ
        </div>
      </div>
    </header>
  );
};
