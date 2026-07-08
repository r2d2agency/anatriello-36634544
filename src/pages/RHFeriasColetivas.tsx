import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  useCollectiveVacations, useCollectiveVacation, usePreviewCollectiveVacation,
  useCreateCollectiveVacation, useUpdateCollectiveVacation, useCancelCollectiveVacation,
  useEmployees, useBranches, useRhDepartments,
} from "@/hooks/use-rh";
import {
  CalendarDays, Plus, Users, AlertTriangle, Eye, Trash2, Bell, Check, Loader2, FileText, Building2,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  planejada: "Planejada", ativa: "Em andamento", concluida: "Concluída", cancelada: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  planejada: "bg-blue-100 text-blue-700",
  ativa: "bg-green-100 text-green-700",
  concluida: "bg-gray-100 text-gray-700",
  cancelada: "bg-red-100 text-red-700",
};

const fmtDate = (d?: string) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "-";

export default function RHFeriasColetivas() {
  const { toast } = useToast();
  const [tab, setTab] = useState("lista");
  const [openNew, setOpenNew] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: list = [], isLoading } = useCollectiveVacations();
  const { data: detail } = useCollectiveVacation(detailId || undefined);
  const { data: employees = [] } = useEmployees();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useRhDepartments();

  const previewMut = usePreviewCollectiveVacation();
  const createMut = useCreateCollectiveVacation();
  const updateMut = useUpdateCollectiveVacation();
  const cancelMut = useCancelCollectiveVacation();

  // form state
  const emptyForm = {
    title: "", description: "", start_date: "", end_date: "",
    scope: "company" as "company" | "branch" | "department" | "custom",
    branch_ids: [] as string[], department_ids: [] as string[], employee_ids: [] as string[],
    exclude_employee_ids: [] as string[],
    abono_pecuniario: false, abono_days: 0,
    union_notified: false, mte_notified: false,
    override_conflicts: false, notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState<any>(null);

  const kpis = useMemo(() => {
    const total = list.length;
    const ativa = list.filter((c: any) => c.status === "ativa").length;
    const planejada = list.filter((c: any) => c.status === "planejada").length;
    const employees_affected = list.reduce((s: number, c: any) => s + Number(c.employees_count || 0), 0);
    return { total, ativa, planejada, employees_affected };
  }, [list]);

  const runPreview = async () => {
    if (!form.start_date || !form.end_date) {
      toast({ title: "Informe início e fim", variant: "destructive" });
      return;
    }
    try {
      const r = await previewMut.mutateAsync(form);
      setPreview(r);
    } catch (e: any) {
      toast({ title: "Erro ao simular", description: e.message, variant: "destructive" });
    }
  };

  const submit = async () => {
    if (!form.title || !form.start_date || !form.end_date) {
      toast({ title: "Preencha título, início e fim", variant: "destructive" });
      return;
    }
    try {
      const r: any = await createMut.mutateAsync(form);
      toast({
        title: "Férias coletivas criadas",
        description: `${r.created} colaboradores agendados${r.skipped ? `, ${r.skipped} ignorados por conflito` : ""}.`,
      });
      setOpenNew(false);
      setForm(emptyForm);
      setPreview(null);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="w-6 h-6" /> Férias Coletivas
            </h1>
            <p className="text-sm text-muted-foreground">
              CLT art. 139 — mínimo 5 dias, aviso ao sindicato e MTE com 15 dias de antecedência.
            </p>
          </div>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Férias Coletiva
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total de planos", value: kpis.total, icon: FileText },
            { label: "Planejadas", value: kpis.planejada, icon: CalendarDays },
            { label: "Em andamento", value: kpis.ativa, icon: Check },
            { label: "Colaboradores afetados", value: kpis.employees_affected, icon: Users },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold">{k.value}</p>
                </div>
                <k.icon className="w-6 h-6 text-primary/60" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Planos de férias coletivas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader2 className="animate-spin" /></div>
            ) : list.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum plano cadastrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Colaboradores</TableHead>
                    <TableHead>Avisos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</TableCell>
                      <TableCell>{c.days_total}</TableCell>
                      <TableCell>{c.employees_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={c.union_notified ? "default" : "outline"} className="text-xs">Sindicato</Badge>
                          <Badge variant={c.mte_notified ? "default" : "outline"} className="text-xs">MTE</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR[c.status] || ""}>{STATUS_LABEL[c.status] || c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetailId(c.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {c.status !== "cancelada" && c.status !== "concluida" && (
                          <Button size="sm" variant="ghost" onClick={() => {
                            if (confirm(`Cancelar "${c.title}"? Férias já iniciadas serão mantidas.`))
                              cancelMut.mutate(c.id);
                          }}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: nova férias coletivas */}
      <Dialog open={openNew} onOpenChange={(o) => { setOpenNew(o); if (!o) { setForm(emptyForm); setPreview(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Férias Coletivas</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="abrangencia">Abrangência</TabsTrigger>
              <TabsTrigger value="avisos">Avisos legais</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-3 mt-4">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Férias coletivas de fim de ano 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Início</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center justify-between border rounded p-2">
                <Label className="cursor-pointer">Converter 1/3 em abono pecuniário</Label>
                <Switch checked={form.abono_pecuniario} onCheckedChange={(v) => setForm({ ...form, abono_pecuniario: v })} />
              </div>
              {form.abono_pecuniario && (
                <div>
                  <Label>Dias de abono</Label>
                  <Input type="number" min={0} max={10} value={form.abono_days}
                    onChange={(e) => setForm({ ...form, abono_days: Number(e.target.value) })} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="abrangencia" className="space-y-3 mt-4">
              <div>
                <Label>Escopo</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[
                    { v: "company", l: "Toda a empresa" },
                    { v: "branch", l: "Por filial" },
                    { v: "department", l: "Por departamento" },
                    { v: "custom", l: "Selecionar colaboradores" },
                  ].map((s) => (
                    <Button key={s.v} type="button" size="sm"
                      variant={form.scope === s.v ? "default" : "outline"}
                      onClick={() => setForm({ ...form, scope: s.v as any })}>
                      {s.l}
                    </Button>
                  ))}
                </div>
              </div>

              {form.scope === "branch" && (
                <div className="border rounded p-2 max-h-48 overflow-y-auto space-y-1">
                  {branches.map((b: any) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.branch_ids.includes(b.id)}
                        onCheckedChange={() => setForm({ ...form, branch_ids: toggleId(form.branch_ids, b.id) })} />
                      <Building2 className="w-3 h-3" /> {b.name}
                    </label>
                  ))}
                </div>
              )}

              {form.scope === "department" && (
                <div className="border rounded p-2 max-h-48 overflow-y-auto space-y-1">
                  {departments.map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.department_ids.includes(d.id)}
                        onCheckedChange={() => setForm({ ...form, department_ids: toggleId(form.department_ids, d.id) })} />
                      {d.name}
                    </label>
                  ))}
                </div>
              )}

              {form.scope === "custom" && (
                <div className="border rounded p-2 max-h-64 overflow-y-auto space-y-1">
                  {employees.map((e: any) => (
                    <label key={e.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.employee_ids.includes(e.id)}
                        onCheckedChange={() => setForm({ ...form, employee_ids: toggleId(form.employee_ids, e.id) })} />
                      {e.full_name} <span className="text-xs text-muted-foreground">({e.position})</span>
                    </label>
                  ))}
                </div>
              )}

              {form.scope !== "custom" && employees.length > 0 && (
                <details className="border rounded p-2">
                  <summary className="text-sm cursor-pointer">Excluir colaboradores específicos ({form.exclude_employee_ids.length})</summary>
                  <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
                    {employees.map((e: any) => (
                      <label key={e.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.exclude_employee_ids.includes(e.id)}
                          onCheckedChange={() => setForm({ ...form, exclude_employee_ids: toggleId(form.exclude_employee_ids, e.id) })} />
                        {e.full_name}
                      </label>
                    ))}
                  </div>
                </details>
              )}

              <div className="flex items-center justify-between border rounded p-2">
                <div>
                  <Label className="cursor-pointer">Sobrepor conflitos</Label>
                  <p className="text-xs text-muted-foreground">Ignorar colaboradores com férias já agendadas no período</p>
                </div>
                <Switch checked={form.override_conflicts} onCheckedChange={(v) => setForm({ ...form, override_conflicts: v })} />
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={runPreview} disabled={previewMut.isPending}>
                {previewMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                Simular impacto
              </Button>

              {preview && (
                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertTitle>{preview.total} colaboradores serão afetados ({preview.days_total} dias)</AlertTitle>
                  <AlertDescription>
                    {preview.conflicts?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-600 font-medium">{preview.conflicts.length} conflitos detectados:</p>
                        <ul className="text-xs mt-1 list-disc pl-4">
                          {preview.conflicts.slice(0, 5).map((c: any) => (
                            <li key={c.id}>{c.full_name} — {fmtDate(c.start_date)} a {fmtDate(c.end_date)}</li>
                          ))}
                          {preview.conflicts.length > 5 && <li>... e mais {preview.conflicts.length - 5}</li>}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="avisos" className="space-y-3 mt-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Obrigações legais (CLT art. 139)</AlertTitle>
                <AlertDescription className="text-xs">
                  Aviso ao sindicato e ao MTE com no mínimo 15 dias de antecedência. Comunicação por escrito aos colaboradores.
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between border rounded p-2">
                <Label className="cursor-pointer flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Sindicato notificado
                </Label>
                <Switch checked={form.union_notified} onCheckedChange={(v) => setForm({ ...form, union_notified: v })} />
              </div>
              <div className="flex items-center justify-between border rounded p-2">
                <Label className="cursor-pointer flex items-center gap-2">
                  <Bell className="w-4 h-4" /> MTE notificado
                </Label>
                <Switch checked={form.mte_notified} onCheckedChange={(v) => setForm({ ...form, mte_notified: v })} />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Férias Coletivas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhe */}
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.title || "Detalhes"}</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Período:</span> {fmtDate(detail.start_date)} → {fmtDate(detail.end_date)}</div>
                <div><span className="text-muted-foreground">Dias:</span> {detail.days_total}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={STATUS_COLOR[detail.status] || ""}>{STATUS_LABEL[detail.status]}</Badge></div>
                <div><span className="text-muted-foreground">Colaboradores:</span> {detail.employees?.length || 0}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={detail.union_notified ? "default" : "outline"}
                  onClick={() => updateMut.mutate({ id: detail.id, union_notified: !detail.union_notified })}>
                  <Bell className="w-3 h-3 mr-1" /> Sindicato
                </Button>
                <Button size="sm" variant={detail.mte_notified ? "default" : "outline"}
                  onClick={() => updateMut.mutate({ id: detail.id, mte_notified: !detail.mte_notified })}>
                  <Bell className="w-3 h-3 mr-1" /> MTE
                </Button>
                {detail.status === "planejada" && (
                  <Button size="sm" onClick={() => updateMut.mutate({ id: detail.id, status: "ativa" })}>
                    Marcar como em andamento
                  </Button>
                )}
                {detail.status === "ativa" && (
                  <Button size="sm" onClick={() => updateMut.mutate({ id: detail.id, status: "concluida" })}>
                    Concluir
                  </Button>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Colaboradores</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail.employees || []).map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.employee_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{v.position}</TableCell>
                        <TableCell><Badge variant="outline">{v.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {detail.notes && (
                <div className="text-sm border-t pt-2">
                  <span className="text-muted-foreground">Observações:</span> {detail.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin" /></div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
