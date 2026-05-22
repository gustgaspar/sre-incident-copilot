'use client';

import { Incident } from '@/lib/incident-store';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, TerminalSquare, Sparkles, Cpu, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, use, useRef } from 'react';
import { RenderMarkdown } from '@/lib/markdown';

export default function IncidentWarRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [incident, setIncident] = useState<Incident | null>(null);
  
  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then(res => res.json())
      .then(data => setIncident(data.incident))
      .catch(() => setIncident(null));
  }, [id]);

  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent/chat',
      body: { incidentId: id },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput('');
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical':
        return <Badge className="bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25">CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500/25">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 text-black">MEDIUM</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25">LOW</Badge>;
      default:
        return <Badge variant="secondary">{severity.toUpperCase()}</Badge>;
    }
  };

  const renderMessageContent = (m: any) => {
    if (m.parts && Array.isArray(m.parts)) {
      return m.parts.map((part: any, partIdx: number) => {
        if (part.type === 'text') {
          return <RenderMarkdown key={partIdx} content={part.text} />;
        }
        if (part.type === 'reasoning') {
          return (
            <div key={partIdx} className="block italic text-zinc-400 bg-zinc-950/60 p-3 my-2 border-l-2 border-indigo-500/50 rounded text-xs font-mono">
              <span className="font-semibold block text-[10px] uppercase tracking-wider text-indigo-400 mb-1.5">Pensamento do Agente:</span>
              <RenderMarkdown content={part.text} />
            </div>
          );
        }
        return null;
      });
    }
    return <RenderMarkdown content={m.content} />;
  };

  if (!incident) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Carregando detalhes do incidente...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-6 min-h-screen">
      {/* Coluna Esquerda: Detalhes do Incidente (ocupa 7/12 no desktop) */}
      <div className="flex flex-col gap-6 md:col-span-7 pb-8">
        <div>
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-4 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800/40">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              {incident.title}
            </h1>
            {getSeverityBadge(incident.severity)}
          </div>
          
          <p className="text-zinc-500 text-xs">
            Detectado em {new Date(incident.createdAt).toLocaleString('pt-BR')} • ID: <span className="font-mono text-zinc-400">{incident.id}</span>
          </p>
        </div>

        {/* Card de Erro Original */}
        <Card className="border-red-950 bg-red-950/10 shadow-lg shadow-red-950/5">
          <CardHeader className="pb-3 border-b border-red-950/40">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm md:text-base font-bold">
              <TerminalSquare className="w-4 h-4" /> Log de Erro Original
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-lg text-xs overflow-x-auto overflow-y-auto max-h-[220px] select-all border border-zinc-900 leading-relaxed font-mono">
              {JSON.stringify(incident.originalError, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Card de Diagnóstico RAG da IA */}
        <Card className="border-zinc-800/60 bg-zinc-900/30 backdrop-blur shadow-md">
          <CardHeader className="border-b border-zinc-800/60 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base text-indigo-400 font-bold">
              <Cpu className="w-4 h-4" /> Diagnóstico do Agente RAG
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Arquivos Identificados no Repositório:</h3>
              <div className="flex flex-wrap gap-2">
                {incident.aiAnalysis.suspectedFiles.map(f => (
                  <Badge key={f} variant="outline" className="font-mono bg-zinc-950 text-indigo-300 border-indigo-500/20 text-[11px] px-2 py-0.5">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/40 pt-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Resumo da Causa Raiz:</h3>
              <p className="text-zinc-200 text-sm leading-relaxed font-sans">{incident.aiAnalysis.summary}</p>
            </div>

            <div className="border-t border-zinc-800/40 pt-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Plano de Mitigação Sugerido:</h3>
              <div className="bg-zinc-950/40 border border-zinc-800/50 p-4 md:p-5 rounded-lg shadow-inner">
                <RenderMarkdown content={incident.aiAnalysis.mitigationPlan} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita: War Room Chat (ocupa 5/12 no desktop, sticky) */}
      <div className="md:col-span-5 md:sticky md:top-8">
        <Card className="flex flex-col h-[550px] md:h-[calc(100vh-6rem)] border-zinc-800 bg-zinc-900/40 backdrop-blur shadow-2xl">
          <CardHeader className="border-b border-zinc-800 bg-zinc-950/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base text-zinc-100 font-bold">
               <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               Sala de Guerra (War Room Chat)
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Converse com o Agente SRE sênior em tempo real. Ele conhece todo o codebase relevante.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col justify-between">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-zinc-400 py-16 px-4">
                    <Sparkles className="w-8 h-8 text-indigo-400/80 mb-3 animate-pulse" />
                    <p className="font-semibold text-sm">Agente SRE Online</p>
                    <p className="text-xs mt-1 text-zinc-500 max-w-xs">
                      Pergunte detalhes sobre a causa, alternativas de correção ou impactos colaterais.
                    </p>
                    <div className="mt-4 flex flex-col gap-1.5 w-full max-w-xs">
                      <button 
                        onClick={() => setInput("Onde no código essa falha de limite é disparada?")}
                        className="text-left text-xs bg-zinc-800/40 hover:bg-zinc-800 hover:text-white transition px-3 py-2 rounded-md border border-zinc-700/30 text-indigo-300 font-medium"
                      >
                        "Onde no código essa falha de limite é disparada?"
                      </button>
                      <button 
                        onClick={() => setInput("Como posso corrigir esse erro sem desativar a regra inteira?")}
                        className="text-left text-xs bg-zinc-800/40 hover:bg-zinc-800 hover:text-white transition px-3 py-2 rounded-md border border-zinc-700/30 text-indigo-300 font-medium"
                      >
                        "Como posso corrigir esse erro?"
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-0 w-full`}>
                      <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-md leading-relaxed min-w-0 ${
                        m.role === 'user' 
                          ? 'bg-indigo-650 text-white font-medium selection:bg-indigo-400 break-words' 
                          : 'bg-zinc-950/40 border border-zinc-850/80 text-zinc-200 w-full'
                      }`}>
                        <span className={`font-semibold text-[10px] uppercase tracking-wider mb-1 block opacity-70 ${
                          m.role === 'user' ? 'text-indigo-200' : 'text-indigo-400'
                        }`}>
                          {m.role === 'user' ? 'Você' : 'Agente SRE'}
                        </span>
                        <div className="font-sans min-w-0 w-full">
                          {renderMessageContent(m)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs font-medium">Investigando código...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {error && (
              <div className="p-3 mx-4 mb-2 text-xs bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg animate-in fade-in">
                Erro de Comunicação: {error.message || 'Verifique as chaves de API no seu arquivo .env'}
              </div>
            )}

            <div className="p-4 border-t border-zinc-800 bg-zinc-950/20">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Envie uma pergunta ou peça sugestões de correção..."
                  className="flex-1 bg-zinc-950 border-zinc-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer px-4 rounded-lg shadow-lg shadow-indigo-650/10 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
