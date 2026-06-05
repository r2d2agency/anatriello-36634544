import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { useAyratechAIConfig, useSaveAyratechAIConfig, useTestAyratechAI } from '@/hooks/use-ayratech-ai';

const MODEL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (visão, recomendado)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini (mais barato)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  gemini: [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (visão, recomendado)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o', label: 'OpenAI GPT-4o' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
  ],
};

export default function AyratechAIConfig() {
  const { data, isLoading } = useAyratechAIConfig();
  const saveMut = useSaveAyratechAIConfig();
  const testMut = useTestAyratechAI();
  const { toast } = useToast();

  const [provider, setProvider] = useState<'openai' | 'gemini' | 'openrouter'>('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (data) {
      setProvider(data.provider as any);
      setModel(data.model);
      setEnabled(data.enabled);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await saveMut.mutateAsync({ provider, model, api_key: apiKey || undefined, enabled });
      setApiKey('');
      toast({ title: 'Configuração salva' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleTest = async () => {
    try {
      const r = await testMut.mutateAsync();
      if (r.success) toast({ title: 'Conexão OK', description: `Provedor ${provider} respondeu corretamente.` });
      else toast({ title: 'Falha', description: r.error, variant: 'destructive' });
    } catch (e: any) {
      toast({ title: 'Falha', description: e.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">IA Ayratech</h1>
          <p className="text-sm text-muted-foreground">
            Provedor global usado para validação automática de documentos de promotores.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Provedor de IA
            {data?.has_key && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Chave configurada
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Esta configuração é única para todo o Ayratech e usada por features cross-organização
            (validação de documentos, biometria, anti-fraude).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-base">Ativar IA</Label>
              <p className="text-xs text-muted-foreground">Desative para suspender análises automáticas</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provedor</Label>
              <Select value={provider} onValueChange={(v) => { setProvider(v as any); setModel(MODEL_OPTIONS[v][0].value); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS[provider].map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={data?.has_key ? '••••••••••••  (digite para substituir)' : 'sk-...'}
            />
            <p className="text-xs text-muted-foreground">
              A chave é armazenada criptografada e nunca exibida novamente.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saveMut.isPending} className="flex-1">
              {saveMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar configuração
            </Button>
            <Button onClick={handleTest} disabled={testMut.isPending || !data?.has_key} variant="outline">
              {testMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Testar conexão'}
            </Button>
          </div>
          {data?.updated_at && (
            <p className="text-xs text-muted-foreground">Atualizado em {new Date(data.updated_at).toLocaleString('pt-BR')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Cada rede de supermercado define quais documentos exigir (CNH, contrato, etc) na tela de Redes.</p>
          <p>2. Quando o promotor envia os documentos, a IA cruza nome, CPF, empresa contratante e datas.</p>
          <p>3. Se tudo bater (score ≥ limite configurado), o promotor é aprovado automaticamente.</p>
          <p>4. Divergências críticas são notificadas à agência para revisão manual.</p>
        </CardContent>
      </Card>
    </div>
  );
}
