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
    <div className="relative rounded-lg bg-gray-900 overflow-hidden my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1 focus:outline-none"
          title="Copiar código"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
