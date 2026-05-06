import { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { parseImportFile, getImportValue } from "@/lib/merch-import";
import { useImportBrandPdvs } from "@/hooks/use-merchandising";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, Link2, AlertTriangle } from "lucide-react";

interface Pair {
  brand_name: string;
  pdv_name: string;
  _selected: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandPdvLinkImportDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<"upload" | "validate">("upload");
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [fileName, setFileName] = useState("");
  const [autoCreate, setAutoCreate] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportBrandPdvs();

  const reset = () => {
    setStep("upload");
    setPairs([]);
    setFileName("");
    setResult(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const rows = await parseImportFile(file);
      const mapped: Pair[] = rows.map((r) => ({
        brand_name: getImportValue(r, ["cliente", "marca", "brand", "brand_name"]),
        pdv_name: getImportValue(r, ["pdv", "pdv_name", "loja", "store"]),
        _selected: true,
      })).filter(p => p.brand_name && p.pdv_name);

      if (!mapped.length) {
        toast.error("Nenhum vínculo válido encontrado. Esperado colunas: Cliente, PDV");
        return;
      }
      setPairs(mapped);
      setStep("validate");
    } catch (err: any) {
      toast.error(err.message || "Erro ao ler arquivo");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const brandsSummary = useMemo(() => {
    const map = new Map<string, number>();
    pairs.filter(p => p._selected).forEach(p => map.set(p.brand_name, (map.get(p.brand_name) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [pairs]);

  const selectedCount = pairs.filter(p => p._selected).length;

  const toggleAll = () => {
    const all = pairs.every(p => p._selected);
    setPairs(pairs.map(p => ({ ...p, _selected: !all })));
  };

  const toggleOne = (i: number) => {
    setPairs(pairs.map((p, idx) => idx === i ? { ...p, _selected: !p._selected } : p));
  };

  const handleImport = async () => {
    const items = pairs.filter(p => p._selected).map(({ brand_name, pdv_name }) => ({ brand_name, pdv_name }));
    if (!items.length) { toast.error("Selecione ao menos um vínculo"); return; }
    setImporting(true);
    try {
      const res = await importMutation.mutateAsync({ items, auto_create_brands: autoCreate });
      setResult(res);
      toast.success(`${res.linked} vínculo(s) criado(s)`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Importar Vínculos Marca x PDV
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && !result && (
          <div className="space-y-4 py-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique para selecionar a planilha (CSV ou Excel)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Colunas esperadas: <code>Cliente</code> (marca) e <code>PDV</code> (nome do PDV)
              </p>
            </div>
            <Alert className="border-primary/30 bg-primary/5">
              <Link2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs">
                Cada linha vincula um PDV à marca correspondente. Marcas inexistentes serão criadas automaticamente.
                PDVs precisam estar cadastrados antes pela tela de PDVs.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "validate" && !result && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-medium">
                {fileName} — <span className="text-primary">{selectedCount}</span> de {pairs.length} vínculo(s)
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={autoCreate} onCheckedChange={(v) => setAutoCreate(!!v)} />
                  Criar marcas inexistentes
                </label>
                <Button variant="ghost" size="sm" onClick={() => { setStep("upload"); setPairs([]); }}>
                  Trocar arquivo
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 max-h-20 overflow-auto">
              {brandsSummary.map(([name, count]) => (
                <Badge key={name} variant="secondary" className="text-[10px]">
                  {name} ({count})
                </Badge>
              ))}
            </div>

            <ScrollArea className="flex-1 border rounded-lg max-h-[45vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={pairs.length > 0 && selectedCount === pairs.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs">Marca (Cliente)</TableHead>
                    <TableHead className="text-xs">PDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pairs.map((p, i) => (
                    <TableRow key={i} className={p._selected ? "" : "opacity-50"}>
                      <TableCell>
                        <Checkbox checked={p._selected} onCheckedChange={() => toggleOne(i)} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">{p.brand_name}</TableCell>
                      <TableCell className="text-sm">{p.pdv_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {result && (
          <div className="space-y-3 py-4">
            <Alert className="border-green-500/30 bg-green-500/5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <strong>{result.linked}</strong> novo(s) vínculo(s) criado(s).
                {result.already > 0 && <> <strong>{result.already}</strong> já existente(s).</>}
                {result.created_brands > 0 && <> <strong>{result.created_brands}</strong> marca(s) criada(s).</>}
              </AlertDescription>
            </Alert>
            {result.missing_pdvs > 0 && (
              <Alert className="border-yellow-500/30 bg-yellow-500/5">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs">
                  <strong>{result.missing_pdvs}</strong> PDV(s) não encontrado(s) no cadastro. Cadastre-os e reimporte.
                  {result.missing_examples?.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-auto">
                      {result.missing_examples.slice(0, 20).map((m: any, i: number) => (
                        <div key={i} className="text-[11px]">• {m.brand} → {m.pdv}</div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          ) : step === "validate" ? (
            <Button onClick={handleImport} disabled={importing || selectedCount === 0}>
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Importar {selectedCount} Vínculo(s)
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
