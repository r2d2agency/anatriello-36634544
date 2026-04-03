import { useState } from 'react';
import { useSupermarketAuth } from '@/contexts/SupermarketAuthContext';
import { useIncidents } from '@/hooks/use-incidents';
import { IncidentCreateDialog } from '@/components/incidents/IncidentCreateDialog';
import { IncidentDetailDialog } from '@/components/incidents/IncidentDetailDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberta', variant: 'destructive' },
  under_review: { label: 'Em Análise', variant: 'secondary' },
  responded: { label: 'Respondida', variant: 'outline' },
  resolved: { label: 'Resolvida', variant: 'default' },
  escalated: { label: 'Escalada', variant: 'destructive' },
};

const SEVERITY_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: 'Leve', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  medium: { label: 'Médio', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  high: { label: 'Grave', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function SupermarketIncidents() {
  const { user } = useSupermarketAuth();
  const { incidents, isLoading, createIncident, respondIncident } = useIncidents('supermarket');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = incidents.filter((i: any) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search && !(i.promoter_name?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
          <p className="text-muted-foreground">Registre e acompanhe problemas com promotores</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Ocorrência
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="under_review">Em Análise</SelectItem>
            <SelectItem value="responded">Respondidas</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
            <SelectItem value="escalated">Escaladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhuma ocorrência encontrada</p>
        ) : filtered.map((inc: any) => {
          const st = STATUS_LABELS[inc.status] || STATUS_LABELS.open;
          const sv = SEVERITY_LABELS[inc.severity] || SEVERITY_LABELS.low;
          return (
            <div key={inc.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelected(inc)}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${inc.severity === 'high' ? 'text-destructive' : inc.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium">{inc.promoter_name || 'Promotor'}</p>
                  <p className="text-xs text-muted-foreground">{inc.agency_name} • {inc.description?.slice(0, 80)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inc.incident_date ? format(new Date(inc.incident_date), 'dd/MM/yyyy HH:mm') : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={sv.className}>{sv.label}</Badge>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>

      <IncidentCreateDialog open={showCreate} onOpenChange={setShowCreate}
        onSubmit={(data) => { createIncident.mutate(data); setShowCreate(false); }}
        isSubmitting={createIncident.isPending} />

      <IncidentDetailDialog open={!!selected} onOpenChange={() => setSelected(null)}
        incident={selected} canRespond responderType="supermarket" responderName={user?.unit_name}
        onRespond={(data) => respondIncident.mutate(data)} />
    </div>
  );
}
