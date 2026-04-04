import { useState, useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useBrands, useBrandPdvs } from "@/hooks/use-merchandising";
import { useEmployees } from "@/hooks/use-rh";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  usePriceResearchRules, useUpsertPriceResearchRule, useDeletePriceResearchRule, useShareRule,
  usePriceResearchCompetitors, useCreateCompetitor,
  usePriceResearchExecutions, useValidateExecution,
} from "@/hooks/use-price-research";
import { useUpload } from "@/hooks/use-upload";
import { resolveMediaUrl } from "@/lib/media";
import {
  DollarSign, Plus, Trash2, Image as ImageIcon, Upload, FileText, List, CheckCircle2,
  Calendar, Building2, Package, Share2, Edit, Clock, BarChart3, CalendarPlus, MapPin, User, ChevronDown, ChevronUp,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

const ALL_BRANDS_VALUE = "__all_brands__";
const ALL_STATUS_VALUE = "__all_status__";

const FREQUENCIES = [
  { value: 'once', label: 'Única (sem recorrência)' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function safeFormatDate(dateStr: any, fmt: string = 'dd/MM/yyyy'): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return isValid(d) ? format(d, fmt) : '-';
  } catch { return '-'; }
}

export default function MerchPesquisaPrecos() {
  const [tab, setTab] = useState('modelos');
  const { data: brands = [] } = useBrands();

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Pesquisa de Preços
          </h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="modelos"><FileText className="h-4 w-4 mr-1" />Modelos</TabsTrigger>
            <TabsTrigger value="agendamentos"><Calendar className="h-4 w-4 mr-1" />Agendamentos</TabsTrigger>
            <TabsTrigger value="resultados"><BarChart3 className="h-4 w-4 mr-1" />Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="modelos">
            <ModelosTab brands={brands} />
          </TabsContent>
          <TabsContent value="agendamentos">
            <AgendamentosTab brands={brands} />
          </TabsContent>
          <TabsContent value="resultados">
            <ResultadosTab brands={brands} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// ===== Modelos Tab =====
function ModelosTab({ brands }: { brands: any[] }) {
  const { data: rules = [] } = usePriceResearchRules();
  const deleteRule = useDeletePriceResearchRule();
  const shareRule = useShareRule();
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState<any>(null);

  const openNew = () => { setEditingRule(null); setShowEditor(true); };
  const openEdit = (rule: any) => { setEditingRule(rule); setShowEditor(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Modelos definem marca, produtos e concorrentes para a pesquisa.</p>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Modelo</Button>
      </div>

      <div className="grid gap-3">
        {rules.map((r: any) => {
          const brandName = brands.find((b: any) => b.id === r.brand_id)?.name || r.brand_name || 'Marca';
          const productCount = r.selected_products?.length || r.products_count || 0;
          const competitorCount = r.selected_competitors?.length || 0;
          return (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{r.name || 'Pesquisa de Preços'}</h3>
                      <Badge variant={r.enabled ? 'default' : 'secondary'}>{r.enabled ? 'Ativa' : 'Inativa'}</Badge>
                      {r.shared_with_brand && <Badge variant="outline" className="text-primary border-primary"><Share2 className="h-3 w-3 mr-1" />Compartilhada</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{brandName}</p>
                    {r.description && <p className="text-xs text-muted-foreground mb-2">{r.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {FREQUENCIES.find(f => f.value === r.frequency)?.label || r.frequency}
                      </span>
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{productCount} produtos</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{competitorCount} concorrentes</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{r.completed_count || 0}/{r.executions_count || 0} pesquisas</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setShowSchedule(r)} title="Agendar pesquisa">
                      <CalendarPlus className="h-4 w-4 mr-1" />Agendar
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => shareRule.mutate({ id: r.id, shared: !r.shared_with_brand }, { onSuccess: () => toast.success(r.shared_with_brand ? 'Compartilhamento removido' : 'Resultados compartilhados com a marca') })} title={r.shared_with_brand ? 'Remover compartilhamento' : 'Compartilhar com marca'}>
                      <Share2 className={`h-4 w-4 ${r.shared_with_brand ? 'text-primary' : ''}`} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm('Excluir modelo?')) deleteRule.mutate(r.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rules.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum modelo de pesquisa criado. Clique em "Novo Modelo" para começar.</CardContent></Card>
        )}
      </div>

      {showEditor && (
        <ModelEditorDialog
          rule={editingRule}
          brands={brands}
          open={showEditor}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showSchedule && (
        <ScheduleResearchDialog
          rule={showSchedule}
          brands={brands}
          open={!!showSchedule}
          onClose={() => setShowSchedule(null)}
        />
      )}
    </div>
  );
}

// ===== Model Editor Dialog (full: brand + products + competitors) =====
function ModelEditorDialog({ rule, brands, open, onClose }: { rule: any; brands: any[]; open: boolean; onClose: () => void }) {
  const upsert = useUpsertPriceResearchRule();
  const qc = useQueryClient();

  // Basic fields
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [brandId, setBrandId] = useState(rule?.brand_id || '');
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [frequency, setFrequency] = useState(rule?.frequency || 'once');
  const [preferredWeekday, setPreferredWeekday] = useState(String(rule?.preferred_weekday ?? 1));
  const [requirePhoto, setRequirePhoto] = useState(rule?.require_photo ?? false);
  const [requireJustification, setRequireJustification] = useState(rule?.require_justification ?? true);
  const [blockRouteCompletion, setBlockRouteCompletion] = useState(rule?.block_route_completion ?? false);

  // Product & competitor selections stored on the model
  const [selectedProducts, setSelectedProducts] = useState<string[]>(rule?.selected_products || []);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(rule?.selected_competitors || []);

  // Section visibility
  const [showProducts, setShowProducts] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompCategory, setNewCompCategory] = useState('');
  const createCompetitor = useCreateCompetitor();

  // Load brand products
  const { data: products = [] } = useQuery({
    queryKey: ['merch-products-brand', brandId],
    queryFn: () => api<any[]>(`/api/merchandising/products?brand_id=${brandId}`),
    enabled: !!brandId,
  });

  // Load brand competitors
  const { data: competitors = [] } = usePriceResearchCompetitors(brandId || undefined);

  const isRecurring = frequency !== 'once';

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleCompetitor = (id: string) => {
    setSelectedCompetitors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!brandId) return toast.error('Selecione uma marca');
    if (!name.trim()) return toast.error('Nome obrigatório');
    if (selectedProducts.length === 0) return toast.error('Selecione pelo menos um produto');

    upsert.mutate({
      id: rule?.id,
      brand_id: brandId,
      name, description, enabled, frequency,
      preferred_weekday: parseInt(preferredWeekday),
      require_photo: requirePhoto,
      require_justification: requireJustification,
      block_route_completion: blockRouteCompletion,
      selected_products: selectedProducts,
      selected_competitors: selectedCompetitors,
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['price-research-rules'] });
        onClose();
        toast.success(rule ? 'Modelo atualizado!' : 'Modelo criado!');
      },
    });
  };

  const handleAddCompetitor = () => {
    if (!brandId) return toast.error('Selecione a marca primeiro');
    if (!newCompName.trim()) return toast.error('Nome obrigatório');
    createCompetitor.mutate({ brand_id: brandId, competitor_name: newCompName, category: newCompCategory }, {
      onSuccess: (data: any) => {
        setShowAddCompetitor(false);
        setNewCompName('');
        setNewCompCategory('');
        if (data?.id) setSelectedCompetitors(prev => [...prev, data.id]);
        toast.success('Concorrente criado e selecionado');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader><DialogTitle>{rule ? 'Editar Modelo' : 'Novo Modelo de Pesquisa'}</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome do modelo *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pesquisa Semanal Limpeza" />
              </div>
              <div className="col-span-2">
                <Label>Descrição (opcional)</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>Marca *</Label>
                <Select value={brandId} onValueChange={(v) => { setBrandId(v); setSelectedProducts([]); setSelectedCompetitors([]); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recorrência</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isRecurring && (
                <div>
                  <Label>Dia preferencial</Label>
                  <Select value={preferredWeekday} onValueChange={setPreferredWeekday}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Products section */}
            {brandId && (
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowProducts(!showProducts)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <Package className="h-4 w-4" />
                    Produtos ({selectedProducts.length} selecionados)
                  </span>
                  {showProducts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showProducts && (
                  <div className="border-t p-3 space-y-2 max-h-60 overflow-y-auto">
                    {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto cadastrado nesta marca</p>}
                    {products.map((p: any) => (
                      <label key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <Checkbox
                          checked={selectedProducts.includes(p.id)}
                          onCheckedChange={() => toggleProduct(p.id)}
                        />
                        {p.photo_url ? (
                          <img src={resolveMediaUrl(p.photo_url) || ''} alt={p.name} className="h-10 w-10 rounded object-cover border flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
                          {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                        </div>
                      </label>
                    ))}
                    {products.length > 0 && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" onClick={() => setSelectedProducts(products.map((p: any) => p.id))}>Selecionar todos</Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedProducts([])}>Limpar</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Competitors section */}
            {brandId && (
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowCompetitors(!showCompetitors)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <Building2 className="h-4 w-4" />
                    Concorrentes ({selectedCompetitors.length} selecionados)
                  </span>
                  {showCompetitors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showCompetitors && (
                  <div className="border-t p-3 space-y-2 max-h-60 overflow-y-auto">
                    {competitors.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum concorrente cadastrado</p>}
                    {competitors.filter((c: any) => c.active).map((c: any) => (
                      <label key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <Checkbox
                          checked={selectedCompetitors.includes(c.id)}
                          onCheckedChange={() => toggleCompetitor(c.id)}
                        />
                        <div>
                          <p className="text-sm font-medium">{c.competitor_name}</p>
                          {c.category && <p className="text-xs text-muted-foreground">{c.category}</p>}
                        </div>
                      </label>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => setShowAddCompetitor(true)} className="w-full mt-2">
                      <Plus className="h-3 w-3 mr-1" />Novo Concorrente
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Execution rules */}
            <div className="space-y-3 border rounded-lg p-3">
              <p className="text-sm font-medium">Regras de execução</p>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Ativa</Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Foto obrigatória</Label>
                <Switch checked={requirePhoto} onCheckedChange={setRequirePhoto} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Exigir justificativa se não executada</Label>
                <Switch checked={requireJustification} onCheckedChange={setRequireJustification} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Bloquear rota sem pesquisa (obrigatória)</Label>
                <Switch checked={blockRouteCompletion} onCheckedChange={setBlockRouteCompletion} />
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>{rule ? 'Salvar' : 'Criar Modelo'}</Button>
        </DialogFooter>

        {/* Inline add competitor mini-dialog */}
        <Dialog open={showAddCompetitor} onOpenChange={setShowAddCompetitor}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Novo Concorrente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="Ex: Marca X" /></div>
              <div><Label>Categoria (opcional)</Label><Input value={newCompCategory} onChange={e => setNewCompCategory(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={handleAddCompetitor} disabled={createCompetitor.isPending}>Criar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

// ===== Schedule Research Dialog =====
function ScheduleResearchDialog({ rule, brands, open, onClose }: { rule: any; brands: any[]; open: boolean; onClose: () => void }) {
  const brandName = brands.find((b: any) => b.id === rule.brand_id)?.name || 'Marca';
  const { data: pdvs = [] } = useBrandPdvs(rule.brand_id);
  const { data: employees = [] } = useEmployees();
  const qc = useQueryClient();
  const [pdvId, setPdvId] = useState('');
  const [promoterId, setPromoterId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!pdvId) return toast.error('Selecione um PDV');
    if (!promoterId) return toast.error('Selecione um promotor');
    if (!scheduleDate) return toast.error('Selecione uma data');
    setIsSubmitting(true);
    try {
      await api('/api/price-research/schedule', {
        method: 'POST',
        body: {
          rule_id: rule.id,
          brand_id: rule.brand_id,
          pdv_id: pdvId,
          promoter_id: promoterId,
          scheduled_date: scheduleDate,
          scheduled_time: scheduleTime || null,
        },
      });
      qc.invalidateQueries({ queryKey: ['price-research-executions'] });
      toast.success('Pesquisa agendada com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao agendar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productCount = rule.selected_products?.length || 0;
  const competitorCount = rule.selected_competitors?.length || 0;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Agendar Pesquisa
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-3 pb-2">
              <p className="font-medium text-sm">{rule.name || 'Pesquisa de Preços'}</p>
              <p className="text-xs text-muted-foreground">{brandName} • {FREQUENCIES.find(f => f.value === rule.frequency)?.label}</p>
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-[10px] h-5">{productCount} produtos</Badge>
                <Badge variant="outline" className="text-[10px] h-5">{competitorCount} concorrentes</Badge>
                {rule.block_route_completion && <Badge variant="destructive" className="text-[10px] h-5">Obrigatória</Badge>}
              </div>
            </CardContent>
          </Card>

          <div>
            <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" />PDV</Label>
            <Select value={pdvId} onValueChange={setPdvId}>
              <SelectTrigger><SelectValue placeholder="Selecione o PDV" /></SelectTrigger>
              <SelectContent>
                {pdvs.map((p: any) => (
                  <SelectItem key={p.pdv_id || p.id} value={p.pdv_id || p.id}>{p.pdv_name || p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-1"><User className="h-3 w-3" />Promotor</Label>
            <Select value={promoterId} onValueChange={setPromoterId}>
              <SelectTrigger><SelectValue placeholder="Selecione o promotor" /></SelectTrigger>
              <SelectContent>
                {employees.filter((e: any) => e.active !== false).map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" />Data</Label>
              <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="h-3 w-3" />Horário (opcional)</Label>
              <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSchedule} disabled={isSubmitting}>
            <CalendarPlus className="h-4 w-4 mr-1" />Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Agendamentos Tab =====
function AgendamentosTab({ brands }: { brands: any[] }) {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: executions = [] } = usePriceResearchExecutions({
    brand_id: selectedBrandId || undefined,
    status: statusFilter || undefined,
  });
  const validate = useValidateExecution();

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Select
          value={selectedBrandId || ALL_BRANDS_VALUE}
          onValueChange={(value) => setSelectedBrandId(value === ALL_BRANDS_VALUE ? '' : value)}
        >
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas as marcas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANDS_VALUE}>Todas</SelectItem>
            {brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || ALL_STATUS_VALUE}
          onValueChange={(value) => setStatusFilter(value === ALL_STATUS_VALUE ? '' : value)}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS_VALUE}>Todos</SelectItem>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="validated">Validada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>PDV</TableHead>
                <TableHead>Promotor</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">
                    {e.scheduled_date ? safeFormatDate(e.scheduled_date + 'T12:00:00') : safeFormatDate(e.created_at)}
                    {e.scheduled_time && <span className="text-xs text-muted-foreground ml-1">{e.scheduled_time.slice(0, 5)}</span>}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{e.rule_name || '-'}</TableCell>
                  <TableCell>{e.brand_name || '-'}</TableCell>
                  <TableCell>{e.pdv_name || '-'}</TableCell>
                  <TableCell>{e.promoter_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${e.progress_pct || 0}%` }} />
                      </div>
                      <span className="text-xs">{e.progress_pct || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      e.status === 'validated' ? 'default' :
                      e.status === 'completed' ? 'secondary' :
                      e.status === 'scheduled' ? 'outline' :
                      e.status === 'in_progress' ? 'outline' : 'outline'
                    }>
                      {e.status === 'validated' ? '✓ Validada' :
                       e.status === 'completed' ? 'Concluída' :
                       e.status === 'scheduled' ? '📅 Agendada' :
                       e.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {e.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => validate.mutate(e.id, { onSuccess: () => toast.success('Pesquisa validada!') })}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Validar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {executions.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado. Crie um modelo e clique em "Agendar".</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Resultados Tab =====
function ResultadosTab({ brands }: { brands: any[] }) {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const { data: rules = [] } = usePriceResearchRules(selectedBrandId || undefined);
  const shareRule = useShareRule();

  const rulesWithResults = rules.filter((r: any) => (r.completed_count || 0) > 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <Select
          value={selectedBrandId || ALL_BRANDS_VALUE}
          onValueChange={(value) => setSelectedBrandId(value === ALL_BRANDS_VALUE ? '' : value)}
        >
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas as marcas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANDS_VALUE}>Todas</SelectItem>
            {brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Pesquisas validadas podem ser compartilhadas na área da marca.</p>
      </div>

      <div className="grid gap-3">
        {rulesWithResults.map((r: any) => {
          const brandName = brands.find((b: any) => b.id === r.brand_id)?.name || r.brand_name;
          return (
            <Card key={r.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{r.name || 'Pesquisa de Preços'}</h3>
                    <p className="text-sm text-muted-foreground">{brandName}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span><CheckCircle2 className="h-3 w-3 inline mr-1" />{r.completed_count} concluídas</span>
                      <span><Package className="h-3 w-3 inline mr-1" />{r.selected_products?.length || r.products_count || 0} produtos</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={r.shared_with_brand ? 'default' : 'outline'}
                    onClick={() => shareRule.mutate({ id: r.id, shared: !r.shared_with_brand }, {
                      onSuccess: () => toast.success(r.shared_with_brand ? 'Compartilhamento removido' : 'Resultados compartilhados com a marca!'),
                    })}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    {r.shared_with_brand ? 'Compartilhada' : 'Compartilhar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rulesWithResults.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma pesquisa com resultados concluídos.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
