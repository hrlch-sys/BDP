import { KPITargetRecord, ActualRecord } from '../types';
import { generateInitialData } from '../data/initialData';

const TARGETS_STORAGE_KEY = 'bandon_piya_kpi_targets_v1';
const ACTUALS_STORAGE_KEY = 'bandon_piya_actuals_v1';
const GAS_URL_STORAGE_KEY = 'bandon_piya_gas_endpoint_v1';

export function getStoredTargets(): KPITargetRecord[] {
  try {
    const raw = localStorage.getItem(TARGETS_STORAGE_KEY);
    if (!raw) {
      const { initialTargets } = generateInitialData();
      localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(initialTargets));
      return initialTargets;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading targets from localStorage', err);
    return generateInitialData().initialTargets;
  }
}

export function saveStoredTargets(targets: KPITargetRecord[]): void {
  try {
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets));
  } catch (err) {
    console.error('Error saving targets to localStorage', err);
  }
}

export function getStoredActuals(): ActualRecord[] {
  try {
    const raw = localStorage.getItem(ACTUALS_STORAGE_KEY);
    if (!raw) {
      const { initialActuals } = generateInitialData();
      localStorage.setItem(ACTUALS_STORAGE_KEY, JSON.stringify(initialActuals));
      return initialActuals;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading actuals from localStorage', err);
    return generateInitialData().initialActuals;
  }
}

export function saveStoredActuals(actuals: ActualRecord[]): void {
  try {
    localStorage.setItem(ACTUALS_STORAGE_KEY, JSON.stringify(actuals));
  } catch (err) {
    console.error('Error saving actuals to localStorage', err);
  }
}

export function getStoredGasUrl(): string {
  try {
    return localStorage.getItem(GAS_URL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveStoredGasUrl(url: string): void {
  try {
    localStorage.setItem(GAS_URL_STORAGE_KEY, url);
  } catch (err) {
    console.error('Error saving GAS URL', err);
  }
}

export function resetAllDataToDefault(): { targets: KPITargetRecord[]; actuals: ActualRecord[] } {
  const { initialTargets, initialActuals } = generateInitialData();
  localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(initialTargets));
  localStorage.setItem(ACTUALS_STORAGE_KEY, JSON.stringify(initialActuals));
  return { targets: initialTargets, actuals: initialActuals };
}
