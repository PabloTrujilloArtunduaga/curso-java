import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'java' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden my-6 shadow-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          </span>
          <span className="uppercase text-[10px] font-semibold text-slate-400">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none text-xs font-medium px-2 py-1 rounded hover:bg-slate-800"
          title="Copiar código"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
