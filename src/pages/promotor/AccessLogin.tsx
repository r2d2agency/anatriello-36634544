import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Smartphone, QrCode } from "lucide-react";

export default function AccessLogin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/api/promotor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no login');

      localStorage.setItem('promotor_token', data.token);
      localStorage.setItem('promotor_employee', JSON.stringify(data.employee));

      navigate('/acesso/promotor/home');
      toast({ title: 'Acesso Liberado!', description: 'Bem-vindo ao Ayratech Access' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ayratech Access</h1>
          <p className="text-slate-400 text-sm">Controle de acesso para promotores</p>
        </div>

        <Card className="border-none bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Entrar no Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">CPF ou E-mail</Label>
                <Input
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-primary"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Senha</Label>
                <Input
                  type="password"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-primary"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Smartphone className="h-5 w-5 mr-2" />}
                ENTRAR
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-1 opacity-50">
                <QrCode className="h-5 w-5 text-white" />
                <span className="text-[10px] text-white uppercase font-bold tracking-widest">QR Access</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center gap-1 opacity-50">
                <ShieldCheck className="h-5 w-5 text-white" />
                <span className="text-[10px] text-white uppercase font-bold tracking-widest">Secure</span>
            </div>
        </div>
      </div>
    </div>
  );
}
