import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, ShieldCheck, Camera, MapPin, Clock, Users, BarChart3, Bell,
  CheckCircle2, Smartphone, QrCode, Fingerprint, Eye, FileCheck,
  ArrowRight, Star, Zap, Lock, TrendingUp, Award, Building2,
  Monitor, UserCheck, AlertTriangle, CalendarCheck, BadgeCheck,
  ChevronDown, ChevronUp, ExternalLink, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SupermarketLandingPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", store: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Solicitação enviada! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", phone: "", store: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-emerald-600">Ayra</span>
              <span className="text-gray-800">Access</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#beneficios" className="hover:text-emerald-600 transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-emerald-600 transition-colors">Como Funciona</a>
            <a href="#recursos" className="hover:text-emerald-600 transition-colors">Recursos</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => navigate("/supermercado/login")}
            >
              Já sou parceiro
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" })}
            >
              Quero participar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                100% Gratuito para Supermercados
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                Controle total de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  quem entra
                </span>{" "}
                na sua loja
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                Saiba exatamente quais promotores estão na sua loja, de quais agências, representando quais marcas — 
                tudo em tempo real, com validação biométrica e sem custo para o seu PDV.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-emerald-200"
                  onClick={() => document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Cadastrar meu supermercado
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 h-14 rounded-xl border-gray-300"
                  onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Ver como funciona
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Sem mensalidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Sem contratos</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="bg-gradient-to-b from-emerald-600/20 to-transparent rounded-2xl p-6 border border-emerald-500/20">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-center text-emerald-300 text-sm mb-6">Totem de Acesso — Seu PDV</p>
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                    <p className="text-gray-400 text-xs mb-2">CPF do Promotor</p>
                    <div className="bg-gray-600/50 rounded-lg px-4 py-3 text-white font-mono text-lg tracking-wider">
                      123.456.789-00
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1,2,3,4,5,6,7,8,9,"←",0,"✓"].map((k, i) => (
                      <div key={i} className={`rounded-lg py-2.5 text-center font-semibold text-sm ${
                        k === "✓" ? "bg-emerald-500 text-white" : "bg-gray-600/60 text-gray-300"
                      }`}>
                        {k}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                    <Lock className="h-3 w-3" />
                    <span>Validação biométrica ativa</span>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">12 promotores</p>
                  <p className="text-[10px] text-gray-500">ativos agora</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Facial ativo</p>
                  <p className="text-[10px] text-gray-500">100% seguro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Gratuito para PDVs" },
              { value: "24/7", label: "Monitoramento em tempo real" },
              { value: "< 5s", label: "Validação por promotor" },
              { value: "99.9%", label: "Disponibilidade" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-extrabold text-emerald-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Você sabe quem está dentro da sua loja agora?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Se você respondeu "não tenho certeza", você não está sozinho. A maioria dos supermercados enfrenta esses problemas:
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: "Promotores fantasmas",
                desc: "Agências cobram por promotores que nunca aparecem ou ficam menos tempo que o contratado.",
                color: "text-red-500",
                bg: "bg-red-50"
              },
              {
                icon: Eye,
                title: "Zero visibilidade",
                desc: "Cadernos de papel e planilhas desatualizadas não mostram o que realmente acontece no piso de loja.",
                color: "text-amber-500",
                bg: "bg-amber-50"
              },
              {
                icon: Shield,
                title: "Segurança precária",
                desc: "Qualquer pessoa com crachá antigo entra na sua loja. Sem validação de identidade real.",
                color: "text-orange-500",
                bg: "bg-orange-50"
              },
            ].map((p, i) => (
              <Card key={i} className="border-0 shadow-none bg-gray-50 rounded-2xl">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center mb-5`}>
                    <p.icon className={`h-7 w-7 ${p.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              Para o seu PDV
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Tudo isso sem pagar nada
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              As agências e empresas que acessam sua loja é que remuneram a plataforma. Seu supermercado tem acesso completo, gratuito e ilimitado.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Monitor, title: "Totem de Entrada Personalizado", desc: "Terminal digital com a identidade visual da sua loja. Logo, cores e slogan customizados. Impressiona clientes e promotores." },
              { icon: Camera, title: "Validação Biométrica Facial", desc: "Reconhecimento facial com IA compara o rosto do promotor com a foto cadastrada. Elimina fraudes de identidade." },
              { icon: MapPin, title: "Geofencing Inteligente", desc: "Defina o raio de alcance do seu PDV. Promotores só conseguem fazer check-in dentro da área configurada." },
              { icon: Clock, title: "Controle de Permanência", desc: "Saiba exatamente quanto tempo cada promotor ficou na loja. Relatórios de entrada, saída e tempo total." },
              { icon: Users, title: "Visão de Marcas em Tempo Real", desc: "Veja quais marcas estão sendo representadas na sua loja agora, com indicadores de presença ao vivo." },
              { icon: BarChart3, title: "Dashboard Completo", desc: "Painel gerencial com métricas de presença, scores de desempenho, histórico e alertas operacionais." },
              { icon: Bell, title: "Alertas de Irregularidades", desc: "Notificações automáticas para acesso fora de horário, selfie divergente, permanência insuficiente e mais." },
              { icon: CalendarCheck, title: "Agenda de Visitas", desc: "Visualize e aprove as visitas planejadas pelas agências. Saiba quem vem hoje e amanhã com antecedência." },
              { icon: FileCheck, title: "Ocorrências e Auditoria", desc: "Registre ocorrências, acompanhe o histórico completo de acessos e gere relatórios para auditoria." },
            ].map((b, i) => (
              <Card key={i} className="group border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                    <b.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Como funciona em 4 passos
            </h2>
            <p className="mt-4 text-lg text-gray-500">Implementação rápida, sem complicação</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Cadastro gratuito", desc: "Preencha o formulário com os dados do seu supermercado. Em minutos você recebe suas credenciais.", icon: Building2 },
              { step: "02", title: "Configure seu Totem", desc: "Personalize cores, logo e regras de validação pelo painel. Instale em um tablet na entrada.", icon: Smartphone },
              { step: "03", title: "Agências se conectam", desc: "As agências cadastram seus promotores e solicitam acesso à sua loja. Você aprova com um clique.", icon: Users },
              { step: "04", title: "Monitore tudo", desc: "Acompanhe em tempo real quem está na loja, por quanto tempo, representando quais marcas.", icon: BarChart3 },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold shadow-lg shadow-emerald-200">
                  {s.step}
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-emerald-200" />
                )}
                <s.icon className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos Detalhados */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Recursos completos de segurança e gestão
            </h2>
          </div>

          {/* Feature rows */}
          {[
            {
              title: "Totem Digital de Entrada",
              desc: "Substitua cadernos e crachás por um terminal moderno e seguro. O promotor digita o CPF, o sistema valida biometricamente e registra entrada e saída automaticamente. Tudo personalizado com a identidade visual da sua loja.",
              features: ["CPF + Validação facial", "QR Code como alternativa", "Teclado virtual intuitivo", "Detecção automática entrada/saída", "Logo e cores do seu PDV", "Rodapé com marca Ayratech"],
              icon: Monitor,
              reverse: false
            },
            {
              title: "Portal do Supermercado",
              desc: "Painel web exclusivo para a sua loja com visão 360° da operação. Monitore promotores ativos, marcas presentes, histórico de acessos, alertas e ocorrências — tudo em tempo real e com gráficos claros.",
              features: ["Dashboard em tempo real", "Alertas de irregularidades", "Aprovação de visitas", "Histórico e relatórios", "Gestão de ocorrências", "Contatos de agências"],
              icon: BarChart3,
              reverse: true
            },
            {
              title: "Segurança Multicamadas",
              desc: "Combine diferentes métodos de validação conforme o nível de segurança desejado. Configure por rede ou personalize para cada unidade individualmente.",
              features: ["Reconhecimento facial com IA", "Selfie com comparação", "Validação por CPF", "QR Code dinâmico", "Geofencing por GPS", "Controle de horário"],
              icon: ShieldCheck,
              reverse: false
            },
          ].map((feat, i) => (
            <div key={i} className={`flex flex-col ${feat.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 mb-20 last:mb-0`}>
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                  <feat.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{feat.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {feat.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-50 rounded-3xl p-12 flex items-center justify-center min-h-[300px]">
                  <feat.icon className="h-32 w-32 text-emerald-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Antes vs Depois do AyraAccess
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-100 bg-red-50/30 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sem controle digital
                </h3>
                <ul className="space-y-4">
                  {[
                    "Caderno de papel na portaria",
                    "Sem saber quem realmente está na loja",
                    "Promotores fantasmas passam despercebidos",
                    "Nenhum dado para auditorias",
                    "Crachás falsos ou emprestados",
                    "Zero visibilidade para a gestão",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-red-800">
                      <span className="mt-1 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50/30 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-emerald-700 mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Com AyraAccess
                </h3>
                <ul className="space-y-4">
                  {[
                    "Totem digital com validação biométrica",
                    "Monitoramento em tempo real no painel",
                    "Comparação facial elimina fraudes",
                    "Relatórios completos e auditáveis",
                    "Identidade verificada por IA a cada acesso",
                    "Dashboard com alertas e métricas vivas",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {[
              { q: "É realmente gratuito para o supermercado?", a: "Sim, 100%. O modelo é simples: as agências e empresas que precisam acessar sua loja pagam pelo serviço. Seu supermercado tem acesso completo e ilimitado a todos os recursos sem nenhum custo." },
              { q: "Preciso comprar algum equipamento?", a: "Não. O Totem funciona em qualquer tablet ou computador com navegador web e câmera. Basta acessar o sistema pelo link e posicionar na entrada da loja." },
              { q: "Como funciona a validação facial?", a: "Utilizamos inteligência artificial para comparar a selfie tirada no Totem com a foto cadastrada do promotor. A precisão é altíssima e o processo leva menos de 5 segundos." },
              { q: "Posso personalizar o visual do Totem?", a: "Sim! No painel de configurações você define as cores, faz upload do logotipo da sua loja, adiciona um slogan e personaliza o nome exibido no Totem." },
              { q: "E se o promotor não tiver foto cadastrada?", a: "A agência é responsável por cadastrar a foto e biometria do promotor antes de solicitar acesso. Sem foto, o promotor não consegue realizar a validação facial." },
              { q: "Preciso aprovar cada visita manualmente?", a: "Você pode aprovar visitas individualmente ou em massa. Também pode configurar aprovações automáticas para agências de confiança." },
              { q: "O sistema funciona offline?", a: "O Totem precisa de conexão com internet para validação facial e registro de acessos. Recomendamos uma conexão Wi-Fi estável na área de entrada." },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Cadastro */}
      <section id="cadastro" className="py-20 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Cadastre seu supermercado{" "}
                <span className="text-emerald-600">agora mesmo</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Preencha o formulário ao lado e nossa equipe entrará em contato para ativar seu acesso. 
                Em poucos minutos você terá o painel completo funcionando.
              </p>
              <div className="space-y-4">
                {[
                  "Sem custo, sem contrato, sem surpresas",
                  "Suporte dedicado para implementação",
                  "Treinamento gratuito para sua equipe",
                  "Personalização completa do Totem",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="rounded-2xl border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quero participar</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Seu nome</label>
                    <Input
                      required
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
                      <Input
                        required
                        type="email"
                        placeholder="email@loja.com"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
                      <Input
                        required
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nome do supermercado</label>
                    <Input
                      required
                      placeholder="Supermercado X"
                      value={formData.store}
                      onChange={e => setFormData(p => ({ ...p, store: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Mensagem (opcional)</label>
                    <Textarea
                      placeholder="Conte-nos mais sobre sua loja..."
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-xl shadow-lg shadow-emerald-200">
                    Enviar solicitação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Ao enviar, você concorda com nossos termos de uso e política de privacidade.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">
                Ayra<span className="text-emerald-400">Access</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/politica-privacidade" className="hover:text-white transition-colors">Privacidade</a>
              <a href="/termos-servico" className="hover:text-white transition-colors">Termos</a>
              <a href="/exclusao-dados" className="hover:text-white transition-colors">Exclusão de dados</a>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Ayratech. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
