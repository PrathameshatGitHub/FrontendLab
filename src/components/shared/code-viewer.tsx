'use client';

import * as React from 'react';
import { Card ,Button} from '@/components/ui/primitives';
import { File, Folder, ChevronRight, Copy, Check } from 'lucide-react';


interface CodeFile {
  path: string;
  code: string;
  language?: string;
}

interface CodeViewerProps {
  files: CodeFile[];
}

// Lightweight custom regex syntax highlighter for TSX/JSX/JS/CSS code
function highlightCode(code: string, language = 'typescript') {
  if (!code) return '';
  
  let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const placeholders: string[] = [];
  const push = (html: string) => {
    placeholders.push(html);
    return `__TOKEN_${placeholders.length - 1}__`;
  };

  // 1. Comments
  escaped = escaped.replace(/(\/\/.*)/g, m => push(`<span class="text-stone-500 italic">${m}</span>`));
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, m => push(`<span class="text-stone-500 italic">${m}</span>`));

  // 2. Strings
  escaped = escaped.replace(/(['"`])([\s\S]*?)\1/g, (m, q, inner) => push(`<span class="text-emerald-400">${q}${inner}${q}</span>`));

  if (language === 'css') {
    escaped = escaped
      .replace(/(@[a-zA-Z0-9_-]+)/g, m => push(`<span class="text-indigo-400 font-semibold">${m}</span>`))
      .replace(/(\.[a-zA-Z0-9_-]+)/g, m => push(`<span class="text-yellow-300">${m}</span>`))
      .replace(/(#[a-zA-Z0-9_-]+)/g, m => push(`<span class="text-amber-400">${m}</span>`))
      .replace(/([a-zA-Z0-9_-]+)(?=\s*:)/g, m => push(`<span class="text-sky-400">${m}</span>`));
  } else {
    // 3. Components
    escaped = escaped.replace(/&lt;([A-Z][a-zA-Z0-9]*)/g, (m, p1) => `&lt;${push(`<span class="text-yellow-300 font-medium">${p1}</span>`)}`);
    escaped = escaped.replace(/\/([A-Z][a-zA-Z0-9]*)&gt;/g, (m, p1) => `/${push(`<span class="text-yellow-300 font-medium">${p1}</span>`)}&gt;`);

    // 4. Hooks
    const hooks = /\b(useState|useEffect|useMemo|useCallback|useRef|useReducer|useContext|useTransition|useDeferredValue|useQuery|useMutation|useStore|useRerender)\b/g;
    escaped = escaped.replace(hooks, m => push(`<span class="text-cyan-400 font-medium">${m}</span>`));

    // 5. Keywords
    const keywords = /\b(const|let|var|function|return|import|export|from|default|class|interface|type|extends|implements|if|else|for|while|async|await|try|catch|finally|throw|new|this|typeof|void|as|keyof|readonly|public|private|protected)\b/g;
    escaped = escaped.replace(keywords, m => push(`<span class="text-purple-400 font-semibold">${m}</span>`));

    // 6. Numbers
    escaped = escaped.replace(/\b(\d+)\b/g, m => push(`<span class="text-amber-400">${m}</span>`));
  }

  // Restore placeholders
  for (let i = placeholders.length - 1; i >= 0; i--) {
    escaped = escaped.replace(`__TOKEN_${i}__`, placeholders[i]);
  }

  return escaped;
}

export const CodeViewer = React.memo(function CodeViewer({ files }: CodeViewerProps) {
  const [selectedFileIndex, setSelectedFileIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const selectedFile = files[selectedFileIndex] || files[0];

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group files by directories to make a collapsible folder list
  const getFileTree = () => {
    const root: Record<string, any> = {};
    files.forEach((file, index) => {
      const parts = file.path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = { _index: index, _path: file.path };
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });
    return root;
  };

  const renderTree = (node: any, depth = 0, name = '') => {
    return Object.entries(node).map(([key, value]: [string, any]) => {
      const isFile = value._index !== undefined;
      const isSelected = isFile && value._index === selectedFileIndex;

      if (isFile) {
        return (
          <button
            key={value._path}
            onClick={() => setSelectedFileIndex(value._index)}
            className={`w-full text-left py-1.5 px-3 flex items-center space-x-2 text-xs transition-colors rounded-md ${
              isSelected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
            }`}
            style={{ paddingLeft: `${(depth + 1) * 12}px` }}
          >
            <File className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-mono">{key}</span>
          </button>
        );
      }

      return (
        <div key={key} className="space-y-1">
          <div
            className="py-1 px-3 flex items-center space-x-2 text-xs font-semibold text-stone-300 font-mono"
            style={{ paddingLeft: `${depth * 12}px` }}
          >
            <ChevronRight className="w-3 h-3 text-stone-500" />
            <Folder className="w-3.5 h-3.5 text-stone-500" />
            <span>{key}</span>
          </div>
          <div className="space-y-0.5">{renderTree(value, depth + 1, key)}</div>
        </div>
      );
    });
  };

  const fileTree = getFileTree();

  return (
    <Card className="border-stone-800 bg-stone-950 flex flex-col md:flex-row h-[550px] overflow-hidden">
      {/* File Tree Explorer (Left) */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-800 bg-stone-900/15 overflow-y-auto p-4 flex flex-col space-y-3">
        <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest px-1 font-bold">
          Workspace Files
        </div>
        <div className="space-y-1 flex-1">{renderTree(fileTree)}</div>
      </div>

      {/* Code Editor Panel (Right) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-950/70">
        {selectedFile && (
          <>
            <div className="h-11 border-b border-stone-800 bg-stone-950/90 px-4 flex items-center justify-between flex-shrink-0">
              <div className="text-xs font-mono text-stone-400 truncate">
                {selectedFile.path}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-stone-300 select-text leading-relaxed">
              <pre className="inline-block min-w-full">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(selectedFile.code, selectedFile.language),
                  }}
                />
              </pre>
            </div>
          </>
        )}
      </div>
    </Card>
  );
});
