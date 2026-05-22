import { getIncidents } from '@/lib/incident-store';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, Cpu, Activity, Zap } from 'lucide-react';

// Força a página a ser dinâmica para sempre pegar os incidentes em memória mais recentes
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const incidents = getIncidents();

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': 
        return <Badge className="bg-red-500/15 border-red-500/30 text-red-400 font-bold hover:bg-red-500/25">CRITICAL</Badge>;
      case 'high': 
        return <Badge className="bg-orange-500/15 border-orange-500/30 text-orange-400 font-bold hover:bg-orange-500/25">HIGH</Badge>;
      case 'medium': 
        return <Badge className="bg-yellow-500/15 border-yellow-500/30 text-yellow-400 font-bold hover:bg-yellow-500/25 text-black">MEDIUM</Badge>;
      case 'low': 
        return <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/25">LOW</Badge>;
      default: 
        return <Badge variant="secondary">{severity.toUpperCase()}</Badge>;
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open': 
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />;
      case 'investigating': 
        return <Clock className="w-5 h-5 text-yellow-500 shrink-0" />;
      case 'resolved': 
        return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
      default: 
        return null;
    }
  }

  // Estatísticas para os cards
  const totalCount = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-8 h-8 text-indigo-500" />
            Incident Command Center
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Triagem automatizada de exceções e investigação assistida por Agente RAG.
          </p>
        </div>
        
        {/* Status Geral */}
        <div className="flex items-center gap-2.5 bg-zinc-900/50 border border-zinc-850 px-4 py-2 rounded-full self-start md:self-auto shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            {activeCount > 0 ? `${activeCount} Incidentes Ativos` : 'Todos os Sistemas Operacionais'}
          </span>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/20 border-zinc-850/80 backdrop-blur shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total de Alertas</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-100">{totalCount}</h3>
            </div>
            <Activity className="w-5 h-5 text-indigo-400" />
          </CardContent>
        </Card>

        <Card className={`bg-zinc-900/20 border-zinc-850/80 backdrop-blur shadow-md ${criticalCount > 0 ? 'border-red-900/30 bg-red-950/5' : ''}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Severidade Alta/Crítica</p>
              <h3 className={`text-2xl font-bold mt-1 ${criticalCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                {criticalCount}
              </h3>
            </div>
            <AlertCircle className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-450' : 'text-zinc-500'}`} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/20 border-zinc-850/80 backdrop-blur shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Status do Agente RAG</p>
              <h3 className="text-sm font-semibold mt-2 text-emerald-450 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </h3>
            </div>
            <Cpu className="w-5 h-5 text-indigo-450" />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/20 border-zinc-850/80 backdrop-blur shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">MTTR Médio (Simulado)</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-100">14.2m</h3>
            </div>
            <Zap className="w-5 h-5 text-amber-450" />
          </CardContent>
        </Card>
      </div>

      {/* Listagem de Incidentes */}
      <div>
        <h2 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <span>Logs de Alertas Triados</span>
          {totalCount > 0 && (
            <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {totalCount}
            </span>
          )}
        </h2>

        {incidents.length === 0 ? (
          <Card className="border-dashed border-zinc-800 bg-zinc-900/10">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-zinc-650" />
              </div>
              <h3 className="text-lg font-bold text-zinc-200">Sua infraestrutura está saudável</h3>
              <p className="text-zinc-500 text-xs mt-1.5 max-w-sm">
                Nenhum incidente ativo no momento. Rode o script <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-indigo-300">node test-webhook.js</code> no terminal para simular e gerar uma análise por IA.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incidents.map((incident) => (
              <Link key={incident.id} href={`/incident/${incident.id}`}>
                <Card className="hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-550/5 transition-all duration-300 cursor-pointer bg-zinc-900/30 border-zinc-850/80 backdrop-blur group">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2.5 group-hover:text-indigo-350 transition-colors">
                        {getStatusIcon(incident.status)}
                        {incident.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">
                        Detectado em: {new Date(incident.createdAt).toLocaleString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="self-start sm:self-auto shrink-0">
                      {getSeverityBadge(incident.severity)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                      {incident.aiAnalysis.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {incident.aiAnalysis.suspectedFiles.map(file => (
                        <Badge key={file} variant="outline" className="text-[10px] font-mono bg-zinc-950/60 text-zinc-400 border-zinc-800">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
