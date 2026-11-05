/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KPITargetRecord, ActualRecord } from './types';
import { 
  getStoredTargets, 
  saveStoredTargets, 
  getStoredActuals, 
  saveStoredActuals, 
  resetAllDataToDefault,
  getStoredGasUrl
} from './services/storage';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ManagerEntry } from './components/ManagerEntry';
import { ExecutiveKPISetting } from './components/ExecutiveKPISetting';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'executive' | 'manager' | 'kpi_setting' | 'gas_docs'>('executive');
  const [userRole, setUserRole] = useState<'executive' | 'manager'>('executive');
  const [targets, setTargets] = useState<KPITargetRecord[]>([]);
  const [actuals, setActuals] = useState<ActualRecord[]>([]);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Initialize data from LocalStorage
  useEffect(() => {
    const loadedTargets = getStoredTargets();
    const loadedActuals = getStoredActuals();
    setTargets(loadedTargets);
    setActuals(loadedActuals);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Save actuals from Manager
  const handleSaveActuals = async (records: ActualRecord[]) => {
    // Merge or replace
    const recordIds = new Set(records.map(r => r.id));
    const filteredOld = actuals.filter(a => !recordIds.has(a.id));
    const updated = [...filteredOld, ...records];
    
    setActuals(updated);
    saveStoredActuals(updated);
    showToast('บันทึกผลงานฝ่ายศูนย์บริการเข้าสู่ระบบเรียบร้อยแล้ว');

    // Background sync to Google Sheet if GAS URL is configured
    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_actuals',
            rows: records.map(r => ({
              ...r,
              achievementPct: 100, // sample
            })),
          }),
          mode: 'no-cors' // Google Apps Script Web App redirects
        });
      } catch (e) {
        console.warn('Background sync to Google Sheets skipped or offline', e);
      }
    }
  };

  // Save targets from Executive
  const handleSaveTargets = async (newTargets: KPITargetRecord[]) => {
    setTargets(newTargets);
    saveStoredTargets(newTargets);
    showToast('บันทึกเป้าหมาย KPI จากผู้บริหารเรียบร้อยแล้ว');

    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_targets',
            rows: newTargets,
          }),
          mode: 'no-cors',
        });
      } catch (e) {
        console.warn('Background sync to Google Sheets skipped or offline', e);
      }
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('คุณต้องการคืนค่าข้อมูลตัวอย่างผลดำเนินงานทั้ง 12 สาขา หรือไม่?')) {
      const { targets: initT, actuals: initA } = resetAllDataToDefault();
      setTargets(initT);
      setActuals(initA);
      showToast('คืนค่าข้อมูลตัวอย่างตั้งต้นเรียบร้อยแล้ว', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-slate-700">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Branded Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'gas_docs') {
            setIsGasModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        onResetData={handleResetData}
        onOpenGasModal={() => setIsGasModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page 1: Executive Dashboard */}
        {activeTab === 'executive' && (
          <ExecutiveDashboard
            targets={targets}
            actuals={actuals}
            onNavigateToManager={() => setActiveTab('manager')}
            onNavigateToKPISetting={() => setActiveTab('kpi_setting')}
          />
        )}

        {/* Page 2: Manager Entry */}
        {activeTab === 'manager' && (
          <ManagerEntry
            targets={targets}
            actuals={actuals}
            onSaveActuals={handleSaveActuals}
            onNavigateToExecutive={() => setActiveTab('executive')}
          />
        )}

        {/* Page 3: Executive KPI Setting */}
        {activeTab === 'kpi_setting' && (
          <ExecutiveKPISetting
            targets={targets}
            onSaveTargets={handleSaveTargets}
            onNavigateToExecutive={() => setActiveTab('executive')}
          />
        )}
      </main>

      {/* Google Apps Script Modal */}
      <GoogleAppsScriptModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-red-700">เครือบ้านดอนปิยะ</span>
            <span>•</span>
            <span>ระบบรายงานผลดำเนินงานศูนย์บริการรายเดือน</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>นิสสัน • บีวายดี • จีลี่ • เลพาส • ซีกเกอร์ • บ้านดอนปิยะ</span>
            <button
              onClick={() => setIsGasModalOpen(true)}
              className="text-red-700 hover:underline font-semibold"
            >
              Google Sheet Integration
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
