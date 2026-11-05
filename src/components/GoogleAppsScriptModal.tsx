import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  Table, 
  HelpCircle, 
  Link2, 
  RefreshCw,
  Sparkles 
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE, GOOGLE_SHEET_SCHEMA_GUIDE } from '../services/googleAppsScriptCode';
import { getStoredGasUrl, saveStoredGasUrl } from '../services/storage';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'schema' | 'guide' | 'connect'>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [gasUrl, setGasUrl] = useState<string>(getStoredGasUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResultMsg, setTestResultMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(GOOGLE_SHEET_SCHEMA_GUIDE);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleSaveGasUrl = () => {
    saveStoredGasUrl(gasUrl);
    setTestResultMsg('บันทึก Web App URL เรียบร้อยแล้ว');
  };

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestStatus('error');
      setTestResultMsg('กรุณากรอก Web App URL ของ Google Apps Script');
      return;
    }

    setTestStatus('testing');
    setTestResultMsg('กำลังทดสอบการเชื่อมต่อ...');

    try {
      const resp = await fetch(gasUrl);
      const data = await resp.json();
      if (data && data.status === 'success') {
        setTestStatus('success');
        setTestResultMsg(`เชื่อมต่อสำเร็จ! ตรวจพบ: ${data.appName || 'Google Sheet'} (ข้อมูลเป้าหมาย: ${data.targetsCount} รายการ, ผลงานจริง: ${data.actualsCount} รายการ)`);
        saveStoredGasUrl(gasUrl);
      } else {
        setTestStatus('error');
        setTestResultMsg('เชื่อมต่อได้ แต่ไม่ได้รับข้อมูลสถานะที่ถูกต้อง กรุณาตรวจสอบโค้ด doGet()');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestResultMsg('ไม่สามารถเชื่อมต่อได้: โปรดตรวจสอบว่าได้ตั้งค่าสิทธิ์ Web App เป็น "Anyone" (ทุกคน) หรือยัง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-red-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-red-200 font-semibold uppercase tracking-wider">
                คู่มือและโค้ดเชื่อมต่อระบบจริง
              </div>
              <h3 className="text-lg font-bold">
                Google Apps Script & โครงสร้าง Google Sheet เครือบ้านดอนปิยะ
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 space-x-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'code' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>1. โค้ด Google Apps Script (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'schema' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>2. ตารางจัดเก็บข้อมูล (Sheet Structure)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'guide' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. ขั้นตอนการติดตั้ง 5 สเต็ป</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'connect' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>4. เชื่อมต่อ Web App URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {/* Tab 1: Code.gs */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    ไฟล์โค้ด Google Apps Script: Code.gs
                  </h4>
                  <p className="text-xs text-slate-500">
                    มีฟังก์ชัน setupSheetDatabase() เพื่อสร้างชีตอัตโนมัติ และ doGet / doPost สำหรับเชื่อมต่อเว็บแอป
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ดทั้งหมด (Copy Code)'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800">
                  <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Schema Guide */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    ตารางจัดเก็บข้อมูลและคอลัมน์ใน Google Sheets
                  </h4>
                  <p className="text-xs text-slate-500">
                    แบ่งเป็น 3 ชีต: เป้าหมาย KPI, ผลดำเนินงานจริงรายเดือน, และตารางสรุปผู้บริหาร
                  </p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition"
                >
                  {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSchema ? 'คัดลอกแล้ว' : 'คัดลอกโครงสร้างตาราง'}</span>
                </button>
              </div>

              {/* Visual Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded">
                    ชีตที่ 1: KPI_Targets (เป้าหมายจากผู้บริหาร)
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong className="text-slate-800">A-C:</strong> ID, ปี (Year), ไตรมาส (Quarter)</li>
                    <li><strong className="text-slate-800">D-F:</strong> บริษัท, รหัสสาขา, ชื่อสาขา (12 สาขา)</li>
                    <li><strong className="text-slate-800">G-H:</strong> รหัส KPI, ชื่อตัวชี้วัด</li>
                    <li><strong className="text-slate-800">I-J:</strong> เป้าหมาย (Target Value), หน่วยวัด</li>
                    <li><strong className="text-slate-800">K-L:</strong> ผู้กำหนดเป้า (ผู้บริหาร), วันที่บันทึก</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded">
                    ชีตที่ 2: Monthly_Actuals (ผลงานจริงจากผู้จัดการ)
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong className="text-slate-800">A-D:</strong> ID, ปี, เดือน (1-12), ชื่อเดือนภาษาไทย</li>
                    <li><strong className="text-slate-800">E-H:</strong> ไตรมาส, บริษัท, รหัสสาขา, ชื่อสาขา</li>
                    <li><strong className="text-slate-800">I-J:</strong> KPI Key, ชื่อตัวชี้วัด</li>
                    <li><strong className="text-slate-800">K-M:</strong> เป้าหมายเดือน, ผลงานจริง, % บรรลุเป้า</li>
                    <li><strong className="text-slate-800">N:</strong> ระดับสี (🟢 เขียว, 🟡 เหลือง, 🔴 แดง)</li>
                    <li><strong className="text-slate-800">O-Q:</strong> หมายเหตุชี้แจง, ผู้บันทึก, วันเวลา</li>
                  </ul>
                </div>
              </div>

              <pre className="bg-white text-slate-800 p-4 rounded-xl text-xs font-mono border border-slate-200 max-h-[300px] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {GOOGLE_SHEET_SCHEMA_GUIDE}
              </pre>
            </div>
          )}

          {/* Tab 3: Step-by-step Setup Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                5 ขั้นตอนการนำโค้ดไปติดตั้งใน Google Sheets ใช้งานจริง
              </h4>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">สร้าง Google Sheets ใหม่</h5>
                    <p className="mt-0.5 text-slate-600">เปิด Google Drive แล้วสร้าง Google Sheet ใหม่ ตั้งชื่อว่า <span className="font-bold text-red-700">"รายงานผลดำเนินงานศูนย์บริการ เครือบ้านดอนปิยะ"</span></p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">เปิด Apps Script</h5>
                    <p className="mt-0.5 text-slate-600">ไปที่เมนูด้านบนของ Google Sheet: <strong className="text-slate-800">ส่วนขยาย (Extensions)</strong> &gt; <strong className="text-slate-800">Apps Script</strong></p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">วางโค้ดและรันสร้างตารางอัตโนมัติ</h5>
                    <p className="mt-0.5 text-slate-600">ลบโค้ดเดิมใน <code className="bg-slate-100 px-1 py-0.5 rounded">Code.gs</code> แล้ววางโค้ดจากแท็บ 1 ทั้งหมด กดบันทึก (Ctrl+S) จากนั้นเลือกฟังก์ชัน <code className="bg-slate-100 px-1 py-0.5 rounded text-red-700 font-bold">setupSheetDatabase</code> แล้วกดปุ่ม <strong>"เรียกใช้" (Run)</strong> 1 ครั้ง</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Deploy เผยแพร่เป็น Web App</h5>
                    <p className="mt-0.5 text-slate-600">กดปุ่มสีฟ้าด้านขวาบน: <strong className="text-slate-800">ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong className="text-slate-800">การทำให้ใช้งานได้รายการใหม่ (New deployment)</strong>
                    <br />• เลือกประเภท: <strong>เว็บแอป (Web app)</strong>
                    <br />• เรียกใช้ในฐานะ: <strong>ฉัน (Me)</strong>
                    <br />• ผู้มีสิทธิ์เข้าถึง: <strong>ทุกคน (Anyone)</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">5</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">นำ Web App URL มาเชื่อมต่อ</h5>
                    <p className="mt-0.5 text-slate-600">คัดลอก URL ที่ได้ (ขึ้นต้นด้วย https://script.google.com/macros/s/...) มาใส่ในแท็บ <strong className="text-red-700">"4. เชื่อมต่อ Web App URL"</strong> เพื่อเชื่อมระบบบันทึกและแดชบอร์ดเข้ากับชีตจริง</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Live URL Connection */}
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  เชื่อมต่อ Google Apps Script Web App
                </h4>
                <p className="text-xs text-slate-500">
                  ระบุ URL เว็บแอปที่ได้จากการ Deploy เพื่อซิงค์ข้อมูลจริงระหว่างหน้าเว็บนี้กับ Google Sheets
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Apps Script Web App URL:
                  </label>
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                    <span>{testStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                  </button>

                  <button
                    onClick={handleSaveGasUrl}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    บันทึก URL
                  </button>
                </div>

                {testResultMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium border ${
                    testStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    testStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {testResultMsg}
                  </div>
                )}
              </div>

              <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600">
                💡 <strong>หมายเหตุ:</strong> ระบบหน้าเว็บนี้มีฐานข้อมูลจำลองและ LocalStorage ในตัวอยู่แล้ว แม้ยังไม่ได้ต่อ Google Sheet ก็สามารถทดสอบดูแดชบอร์ด บันทึกผลงาน และตั้งเป้าหมายได้เต็มระบบทันที 100%!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ระบบรายงานผลดำเนินงานศูนย์บริการ เครือบ้านดอนปิยะ
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
