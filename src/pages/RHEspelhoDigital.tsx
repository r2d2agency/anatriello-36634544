import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  useMirrorAcceptances, useGenerateMirrors, useDeleteMirror,
} from "@/hooks/use-timeclock";
import { useCompanies } from "@/hooks/use-companies";
import {
  FileSignature, Send, Trash2, CheckCircle2, XCircle, Clock, Loader2, ShieldCheck, Eye,
} from "lucide-react";

const fmtHM = (min: number) => {
  const n = Math.abs(min || 0);
  const sign = (min || 0) < 0 ? "-" : "";
  return `${sign}${Math.floor(n / 60)}h${String(n % 60).padStart(2, "0")}`;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function RHEspelhoDigital() {
  const { toast } = useToast();
  const { companies = [] } = useCompanies();

  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [genOpen, setGenOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const { data: mirrors = [], isLoading } = useMirrorAcceptances({
    month: month || undefined,
    status: status || undefined,
    company_id: companyId || undefined,
  });
  const generate = useGenerateMirrors();
  const del = useDeleteMirror();

  const kpis = useMemo(() => {
    const t = { total: 0, pending: 0, accepted: 0, rejected: 0 };
    for (const m of mirrors as any[]) {
      t.total++;
      if (m.status === "pending") t.pending++;
      if (m.status === "accepted") t.accepted++;
      if (m.status === "rejected") t.rejected++;
    }
    return t;
  }, [mirrors]);

  const acceptRate = kpis.total ? Math.round((kpis.accepted / kpis.total) * 100) : 0;

  async function runGenerate(companyOnly: string | null) {
    const res = await generate.mutateAsync({
      reference_month: month,
      company_id: companyOnly || undefined,
    });
    toast({
      title: `${res.created} espelho(s) gerado(s)`,
      description: res.skipped > 0 ? `${res.skipped} pulado(s) — já aceitos.` : undefined,
    });
    setGenOpen(false);
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSignature className="w-6 h-6 text-primary" /> Espelho Digital com Aceite
            </h1>
            <p className="text-sm text-muted-foreground">
              Assinatura mensal do colaborador com registro auditável (SHA-256, IP e dispositivo)
            </p>
          </div>
          <Button onClick={() => setGenOpen(true)}>
            <Send className="w-4 h-4 mr-2" /> Gerar Espelhos
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI title="Total" value={kpis.total} icon={<FileSignature className="w-5 h-5" />} />
          <KPI title="Pendentes" value={kpis.pending} icon={<Clock className="w-5 h-5 text-amber-600" />} />
          <KPI title="Aceitos" value={kpis.accepted} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <KPI title="Taxa de Aceite" value={`${acceptRate}%`} icon={<ShieldCheck className="w-5 h-5 text-blue-600" />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Competência</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="accepted">Aceitos</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Empresa</Label>
                <Select value={companyId || "all"} onValueChange={(v) => setCompanyId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {companies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.trade_name || c.legal_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Espelhos de {month}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assinado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(mirrors as any[]).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.full_name}</TableCell>
                        <TableCell className="text-xs">{m.registration_number || "—"}</TableCell>
                        <TableCell className="text-right">{fmtHM(m.totals_json?.worked_min || 0)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={(m.totals_json?.balance_min || 0) >= 0 ? "default" : "destructive"}>
                            {fmtHM(m.totals_json?.balance_min || 0)}
                          </Badge>
                        </TableCell>
                        <TableCell><StatusBadge status={m.status} /></TableCell>
                        <TableCell className="text-xs">
                          {m.accepted_at
                            ? new Date(m.accepted_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                            : m.rejected_at
                              ? <span className="text-destructive">Rejeitado {new Date(m.rejected_at).toLocaleString("pt-BR")}</span>
                              : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setDetail(m)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {m.status !== "accepted" && (
                              <Button size="sm" variant="ghost"
                                onClick={async () => {
                                  if (confirm("Excluir este espelho?")) {
                                    await del.mutateAsync(m.id);
                                    toast({ title: "Excluído" });
                                  }
                                }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!mirrors.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          Nenhum espelho para os filtros selecionados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Gerar */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar Espelhos Mensais</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Competência</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div>
              <Label>Empresa (opcional)</Label>
              <Select value={companyId || "all"} onValueChange={(v) => setCompanyId(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Todas as empresas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.trade_name || c.legal_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Um espelho será gerado para cada colaborador ativo. Aceitos anteriormente não são sobrescritos.
              Os colaboradores serão notificados no app.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancelar</Button>
            <Button onClick={() => runGenerate(companyId || null)} disabled={generate.isPending}>
              {generate.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhes */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalhes do Espelho</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Colaborador" value={detail.full_name} />
                <Info label="CPF" value={detail.cpf || "—"} />
                <Info label="Competência" value={detail.reference_month} />
                <Info label="Período" value={`${detail.period_start?.slice(0, 10)} → ${detail.period_end?.slice(0, 10)}`} />
                <Info label="Status" value={<StatusBadge status={detail.status} />} />
                <Info label="Gerado em" value={new Date(detail.generated_at).toLocaleString("pt-BR")} />
              </div>
              <div className="border-t pt-3">
                <p className="font-medium mb-2">Totais</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Metric label="Horas Trab." value={fmtHM(detail.totals_json?.worked_min)} />
                  <Metric label="Previsto" value={fmtHM(detail.totals_json?.expected_min)} />
                  <Metric label="Saldo" value={fmtHM(detail.totals_json?.balance_min)} />
                  <Metric label="Extras" value={fmtHM(detail.totals_json?.overtime_min)} />
                  <Metric label="Faltas" value={detail.totals_json?.absences || 0} />
                  <Metric label="Atrasos" value={detail.totals_json?.lates || 0} />
                </div>
              </div>
              {detail.status === "accepted" && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-medium flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" /> Assinatura digital
                  </p>
                  <Info label="Aceito em" value={new Date(detail.accepted_at).toLocaleString("pt-BR")} />
                  <Info label="IP" value={detail.signature_ip || "—"} />
                  <div>
                    <p className="text-xs text-muted-foreground">Hash SHA-256</p>
                    <code className="text-[10px] break-all block bg-muted p-2 rounded">{detail.signature_hash}</code>
                  </div>
                  {detail.employee_comments && <Info label="Observações" value={detail.employee_comments} />}
                </div>
              )}
              {detail.status === "rejected" && (
                <div className="border-t pt-3">
                  <p className="font-medium text-destructive">Motivo da rejeição</p>
                  <p className="text-sm">{detail.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

function KPI({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any; icon?: any }> = {
    pending: { label: "Pendente", variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
    accepted: { label: "Aceito", variant: "default", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
    rejected: { label: "Rejeitado", variant: "destructive", icon: <XCircle className="w-3 h-3 mr-1" /> },
  };
  const s = map[status] || { label: status, variant: "outline" };
  return <Badge variant={s.variant} className="text-xs">{s.icon}{s.label}</Badge>;
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-2 rounded bg-muted">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
