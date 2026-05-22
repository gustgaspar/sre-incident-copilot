import React from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

export function RenderMarkdown({ content }: MarkdownProps) {
  if (!content) return null;

  // 1. Dividir por blocos de código (triplos backticks)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-foreground/90 leading-relaxed text-sm">
      {parts.map((part, index) => {
        // Se for um bloco de código
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const firstLine = lines[0] || '';
          const language = firstLine.replace('```', '').trim() || 'code';
          const code = lines.slice(1, -1).join('\n');

          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Caso contrário, renderizar parágrafos, listas e cabeçalhos
        return <TextBlocks key={index} text={part} />;
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="my-4 border border-zinc-800 rounded-lg overflow-hidden bg-black/90 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 text-xs text-zinc-400 font-mono">
        <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          {language.toUpperCase()}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-zinc-800"
          title="Copiar Código"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400 animate-in fade-in zoom-in-50 duration-200" />
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto whitespace-pre leading-relaxed select-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlocks({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-none space-y-2.5 my-3 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(idx);
      return;
    }

    // Títulos H3
    if (trimmed.startsWith('### ')) {
      flushList(idx);
      renderedElements.push(
        <h3 key={idx} className="text-base font-bold text-indigo-400 mt-5 mb-2 flex items-center gap-2 border-b border-zinc-800 pb-1">
          {parseInline(trimmed.substring(4))}
        </h3>
      );
      return;
    }

    // Títulos H2
    if (trimmed.startsWith('## ')) {
      flushList(idx);
      renderedElements.push(
        <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-6 mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-1.5">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
      return;
    }

    // Títulos H1
    if (trimmed.startsWith('# ')) {
      flushList(idx);
      renderedElements.push(
        <h1 key={idx} className="text-xl font-bold text-indigo-200 mt-6 mb-4">
          {parseInline(trimmed.substring(2))}
        </h1>
      );
      return;
    }

    // Listas Não-Ordenadas (- ou *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const content = trimmed.substring(2);
      listItems.push(
        <li key={idx} className="flex items-start gap-2.5 text-zinc-300 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <div className="flex-1">{parseInline(content)}</div>
        </li>
      );
      return;
    }

    // Listas Ordenadas (ex: 1. ou 2. )
    const numberedListMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedListMatch) {
      inList = true;
      const num = numberedListMatch[1];
      const content = numberedListMatch[2];
      listItems.push(
        <li key={idx} className="flex items-start gap-3 text-zinc-300 text-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 leading-relaxed">{parseInline(content)}</div>
        </li>
      );
      return;
    }

    // Linha normal
    flushList(idx);
    renderedElements.push(
      <p key={idx} className="text-zinc-300 mb-2 leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  });

  // Se sobrou alguma lista
  flushList(lines.length);

  return <>{renderedElements}</>;
}

// Analisa formatação inline simples: **negrito** e `código`
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Dividir por negritos e códigos inline simultaneamente
  // Expressão regular para capturar **negrito** ou `codigo`
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-indigo-300">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-xs border border-zinc-700/60 font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
