import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const RBASE = '/api/smartroute/reports';
const OBASE = '/api/smartroute/ops';

// ============ REPORTS ============
function qs(params: Record<string, any>) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)); });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function useSRReportKpis(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any>({ queryKey: ['sr-rep-kpis', params], queryFn: () => api(`${RBASE}/kpis${qs(params)}`) });
}
export function useSRReportTimeseries(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-ts', params], queryFn: () => api(`${RBASE}/timeseries${qs(params)}`) });
}
export function useSRReportSlaDrivers(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-sla-d', params], queryFn: () => api(`${RBASE}/sla/drivers${qs(params)}`) });
}
export function useSRReportSlaPdvs(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-sla-p', params], queryFn: () => api(`${RBASE}/sla/pdvs${qs(params)}`) });
}
export function useSRReportHeatmap(params: { from?: string; to?: string; days?: number; kind?: string } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-heat', params], queryFn: () => api(`${RBASE}/heatmap${qs(params)}`) });
}
export function useSRReportHourly(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-hour', params], queryFn: () => api(`${RBASE}/hourly${qs(params)}`) });
}
export function useSRReportFailures(params: { from?: string; to?: string; days?: number } = {}) {
  return useQuery<any[]>({ queryKey: ['sr-rep-fail', params], queryFn: () => api(`${RBASE}/failure-reasons${qs(params)}`) });
}

// ============ OPS: Vehicle Types ============
export function useSRVehicleTypes() {
  return useQuery<any[]>({ queryKey: ['sr-ops-vt'], queryFn: () => api(`${OBASE}/vehicle-types`) });
}
export function useSRSaveVehicleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => id
      ? api(`${OBASE}/vehicle-types/${id}`, { method: 'PUT', body })
      : api(`${OBASE}/vehicle-types`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-vt'] }),
  });
}
export function useSRDeleteVehicleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`${OBASE}/vehicle-types/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-vt'] }),
  });
}

// ============ OPS: Delivery Windows ============
export function useSRWindows() {
  return useQuery<any[]>({ queryKey: ['sr-ops-win'], queryFn: () => api(`${OBASE}/windows`) });
}
export function useSRSaveWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => id
      ? api(`${OBASE}/windows/${id}`, { method: 'PUT', body })
      : api(`${OBASE}/windows`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-win'] }),
  });
}
export function useSRDeleteWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`${OBASE}/windows/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-win'] }),
  });
}

// ============ OPS: Exceptions ============
export function useSRExceptions() {
  return useQuery<any[]>({ queryKey: ['sr-ops-exc'], queryFn: () => api(`${OBASE}/exceptions`) });
}
export function useSRSaveException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api(`${OBASE}/exceptions`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-exc'] }),
  });
}
export function useSRDeleteException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`${OBASE}/exceptions/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sr-ops-exc'] }),
  });
}
