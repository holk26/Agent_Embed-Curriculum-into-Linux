import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { commands, getCompletions, getPromptPath } from './terminal-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Line {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  commandName?: string;
}

/* ------------------------------------------------------------------ */
/*  Output Renderers                                                   */
/* ------------------------------------------------------------------ */

function LsOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        const isDir = line.startsWith('d');
        const isHidden = line.endsWith(' .') || line.endsWith(' ..');
        const parts = line.split(' ').filter(Boolean);
        const name = parts[parts.length - 1] || '';
        const rest = line.slice(0, line.lastIndexOf(name)).replace(/\s+$/, '');
        return (
          <div key={i}>
            <span className="text-terminal-gray">{rest}</span>
            <span className={isHidden ? 'text-terminal-gray-dark' : isDir ? 'text-terminal-blue font-bold' : 'text-terminal-cyan'}>
              {name}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

function TreeOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed text-terminal-gray">
      {content.split('\n').map((line, i) => {
        const isDir = line.trim().endsWith('/');
        const isSummary = line.includes('directories') || line.includes('files');
        const isTreeChar = /^[│├└──\s]+$/.test(line.trim());
        if (isTreeChar) return <div key={i} className="text-terminal-gray">{line}</div>;
        if (isSummary) return <div key={i} className="text-terminal-gray">{line}</div>;
        const nameMatch = line.match(/[├└]──\s(.+)$/);
        if (!nameMatch) return <div key={i}>{line}</div>;
        const prefix = line.slice(0, line.lastIndexOf(nameMatch[1]));
        const name = nameMatch[1];
        return (
          <div key={i}>
            <span>{prefix}</span>
            <span className={isDir ? 'text-terminal-blue font-bold' : 'text-terminal-cyan'}>
              {name}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

function HelpOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed text-terminal-gray">
      {content.split('\n').map((line, i) => {
        if (line.includes('═')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.includes('║')) {
          const cmdMatch = line.match(/║\s{2}(\w[\w\s-]*)/);
          if (cmdMatch) {
            const idx = line.indexOf(cmdMatch[1]);
            return (
              <div key={i}>
                <span className="text-terminal-green">{line.slice(0, idx)}</span>
                <span className="text-terminal-cyan font-bold">{cmdMatch[1]}</span>
                <span className="text-terminal-green">{line.slice(idx + cmdMatch[1].length)}</span>
              </div>
            );
          }
          return <div key={i} className="text-terminal-green">{line}</div>;
        }
        if (line.includes('Tip:')) return <div key={i} className="text-terminal-amber">{line}</div>;
        return <div key={i}>{line}</div>;
      })}
    </pre>
  );
}

function NeofetchOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[12px] md:text-[13px] leading-snug">
      {content.split('\n').map((line, i) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 40 && colonIdx < 60) {
          const label = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return (
            <div key={i}>
              <span className="text-terminal-green font-bold">{label}</span>
              <span className="text-terminal-white">{value}</span>
            </div>
          );
        }
        return <div key={i} className="text-terminal-green">{line}</div>;
      })}
    </pre>
  );
}

function SkillsOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.includes('─') && !line.includes('█')) return <div key={i} className="text-terminal-gray">{line}</div>;
        if (line.includes('█') || line.includes('░')) {
          const labelMatch = line.match(/^(.{24})\s/);
          const pctMatch = line.match(/(\d+)%$/);
          const barStart = line.indexOf('█');
          const barEnd = pctMatch ? line.lastIndexOf(pctMatch[1] + '%') : line.length;
          return (
            <div key={i}>
              {labelMatch && <span className="text-terminal-white">{labelMatch[1]}</span>}
              {barStart > -1 && (
                <>
                  <span className="text-terminal-green">{line.slice(barStart, barEnd)}</span>
                  {pctMatch && <span className="text-terminal-gray">{'  ' + pctMatch[1] + '%'}</span>}
                </>
              )}
            </div>
          );
        }
        if (line.trim() && !line.startsWith(' ')) return <div key={i} className="text-terminal-amber font-bold">{line}</div>;
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function AboutOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.startsWith('Name:') || line.startsWith('Location:') || line.startsWith('Phone:') || line.startsWith('Email:') || line.startsWith('Status:')) {
          const colonIdx = line.indexOf(':');
          return (
            <div key={i}>
              <span className="text-terminal-white font-bold">{line.slice(0, colonIdx + 1)}</span>
              <span className="text-terminal-gray">{line.slice(colonIdx + 1)}</span>
            </div>
          );
        }
        if (line.includes('→')) {
          const parts = line.split('→');
          return (
            <div key={i}>
              <span className="text-terminal-green">{parts[0]}</span>
              <span className="text-terminal-blue underline">{parts[1]}</span>
            </div>
          );
        }
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function ExperienceOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.includes('────')) return <div key={i} className="text-terminal-gray-dark">{line}</div>;
        if (line.startsWith('[')) {
          const close = line.indexOf(']');
          return (
            <div key={i}>
              <span className="text-terminal-green font-bold">{line.slice(0, close + 1)}</span>
              <span className="text-terminal-white font-bold">{line.slice(close + 1)}</span>
            </div>
          );
        }
        if (line.includes('─') && line.includes('JAN') || line.includes('MAR') || line.includes('DEC')) {
          return <div key={i} className="text-terminal-amber">{line}</div>;
        }
        if (line.trim().startsWith('•')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.trim() && !line.startsWith('    ') && !line.startsWith('  •')) {
          return <div key={i} className="text-terminal-cyan">{line}</div>;
        }
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function EducationOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.includes('────')) return <div key={i} className="text-terminal-gray-dark">{line}</div>;
        if (line.startsWith('[')) {
          const close = line.indexOf(']');
          return (
            <div key={i}>
              <span className="text-terminal-green font-bold">{line.slice(0, close + 1)}</span>
              <span className="text-terminal-white font-bold">{line.slice(close + 1)}</span>
            </div>
          );
        }
        if (line.includes('─') && (line.includes('JUL') || line.includes('DEC') || line.includes('2021') || line.includes('2025'))) {
          return <div key={i} className="text-terminal-amber">{line}</div>;
        }
        if (line.trim().startsWith('•')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.trim() && !line.startsWith('    ') && !line.trim().startsWith('•') && !line.includes('──')) {
          return <div key={i} className="text-terminal-cyan">{line}</div>;
        }
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function LanguagesOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.startsWith('Spanish')) {
          return (
            <div key={i}>
              <span className="text-terminal-white">Spanish    </span>
              <span className="text-terminal-green">{line.replace('Spanish    ', '').replace('  Native', '')}</span>
              <span className="text-terminal-gray">  Native</span>
            </div>
          );
        }
        if (line.startsWith('English')) {
          return (
            <div key={i}>
              <span className="text-terminal-white">English    </span>
              <span className="text-terminal-amber">{line.replace('English    ', '').replace('  Basic', '')}</span>
              <span className="text-terminal-gray">  Basic</span>
            </div>
          );
        }
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function ContactOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('━')) return <div key={i} className="text-terminal-green">{line}</div>;
        if (line.includes(':') && (line.includes('Name:') || line.includes('Location:') || line.includes('Phone:') || line.includes('Email:') || line.includes('LinkedIn:') || line.includes('GitHub:') || line.includes('Work Status:') || line.includes('Best contact'))) {
          const colonIdx = line.indexOf(':');
          return (
            <div key={i}>
              <span className="text-terminal-white font-bold">{line.slice(0, colonIdx + 1)}</span>
              <span className="text-terminal-gray">{line.slice(colonIdx + 1)}</span>
            </div>
          );
        }
        if (line.includes("'contact-form'")) return <div key={i} className="text-terminal-amber">{line}</div>;
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

function CertOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.includes('├──') || line.includes('└──')) {
          const arrow = line.includes('├──') ? '├── ' : '└── ';
          const rest = line.split(arrow)[1] || '';
          const parts = rest.split(/\s{2,}/);
          return (
            <div key={i}>
              <span className="text-terminal-gray">{arrow}</span>
              <span className="text-terminal-cyan">{parts[0]}</span>
              <span className="text-terminal-gray">{'  ' + (parts[1] || '')}</span>
              <span className="text-terminal-amber">{'  ' + (parts[2] || '')}</span>
            </div>
          );
        }
        return <div key={i} className="text-terminal-blue font-bold">{line}</div>;
      })}
    </pre>
  );
}

function DefaultOutput({ content, type }: { content: string; type: string }) {
  if (type === 'error') {
    return <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] text-terminal-red leading-relaxed">{content}</pre>;
  }
  return <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] text-terminal-gray leading-relaxed">{content}</pre>;
}

function OutputRenderer({ line }: { line: Line }) {
  if (line.type === 'command') {
    return <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] text-terminal-white leading-relaxed">{line.content}</pre>;
  }
  if (line.type === 'error') {
    return <DefaultOutput content={line.content} type="error" />;
  }

  switch (line.commandName) {
    case 'ls': return <LsOutput content={line.content} />;
    case 'tree': return <TreeOutput content={line.content} />;
    case 'help': return <HelpOutput content={line.content} />;
    case 'neofetch': return <NeofetchOutput content={line.content} />;
    case 'skills': return <SkillsOutput content={line.content} />;
    case 'about': return <AboutOutput content={line.content} />;
    case 'cat':
      if (line.content.includes('ABOUT HOMERO CABRERA')) return <AboutOutput content={line.content} />;
      if (line.content.includes('TECHNICAL SKILLS MATRIX')) return <SkillsOutput content={line.content} />;
      if (line.content.includes('CONTACT INFORMATION')) return <ContactOutput content={line.content} />;
      if (line.content.includes('LANGUAGE PROFICIENCY')) return <LanguagesOutput content={line.content} />;
      if (line.content.includes('certifications/')) return <CertOutput content={line.content} />;
      return <DefaultOutput content={line.content} type="output" />;
    case 'experience': return <ExperienceOutput content={line.content} />;
    case 'education': return <EducationOutput content={line.content} />;
    case 'contact': return <ContactOutput content={line.content} />;
    case 'languages': return <LanguagesOutput content={line.content} />;
    default: return <DefaultOutput content={line.content} type="output" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Terminal Component                                            */
/* ------------------------------------------------------------------ */

export default function Terminal() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('~/cv');
  const [isTyping, setIsTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [hasInit, setHasInit] = useState(false);

  // Track start time for neofetch uptime
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__terminalStartTime = Date.now();
    }
  }, []);

  /* Blinking cursor */
  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, input, suggestions]);

  /* Keep input focused */
  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  /* Welcome / Init sequence */
  useEffect(() => {
    if (hasInit) return;
    setHasInit(true);

    const initSequence = async () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[now.getDay()];
      const month = months[now.getMonth()];
      const date = now.getDate().toString().padStart(2, '0');
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const year = now.getFullYear();
      const loginMsg = `Last login: ${day} ${month} ${date} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm} PST ${year} from 192.168.1.100`;

      await typeText(loginMsg, 'output', 30);
      await sleep(400);
      await typeText('Welcome to moonsbow OS 6.8.0', 'output', 30);
      await sleep(200);
    };

    initSequence();
  }, [hasInit]);

  /* Helpers */
  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const typeText = useCallback((text: string, type: 'output' | 'error', speed = 15) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      const id = Date.now().toString() + Math.random();
      setLines(prev => [...prev, { id, type, content: '', commandName: type === 'output' ? undefined : undefined }]);

      let i = 0;
      const chars = text.split('');

      const step = () => {
        i++;
        if (i > chars.length) {
          setLines(prev => prev.map(l => l.id === id ? { ...l, content: text } : l));
          setIsTyping(false);
          resolve();
          return;
        }
        setLines(prev => prev.map(l => l.id === id ? { ...l, content: text.slice(0, i) } : l));
        setTimeout(step, speed);
      };

      setTimeout(step, speed);
    });
  }, []);

  const executeCommand = useCallback(async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Add to history
    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Add command line to scrollback
    const promptText = `moonsbow@dev:${getPromptPath(currentDir)}$ ${trimmed}`;
    setLines(prev => [...prev, { id: Date.now().toString(), type: 'command', content: promptText }]);

    // Parse command
    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Tab completion cleanup
    setSuggestions([]);
    setTabIndex(0);

    // Look up handler
    const handler = commands[cmdName];

    if (!handler) {
      await typeText(`bash: ${cmdName}: command not found`, 'error');
      return;
    }

    // Special: handle exit navigation after typing
    if (cmdName === 'exit' || cmdName === 'logout') {
      const result = handler(args, currentDir);
      await typeText(result.content as string, 'output', 15);
      await sleep(800);
      navigate('/');
      return;
    }

    // Special: handle navigation commands
    if (cmdName === 'projects' || cmdName === 'contact-form') {
      const result = handler(args, currentDir);
      await typeText(result.content as string, 'output', 15);
      await sleep(600);
      navigate(result.navigateTo || '/');
      return;
    }

    const result = handler(args, currentDir, cmdHistory);

    if (result.newDir) {
      setCurrentDir(result.newDir);
    }

    if (result.content === '__CLEAR__') {
      setLines([]);
      return;
    }

    if (typeof result.content === 'string') {
      const lineId = Date.now().toString() + Math.random();
      // Add line immediately with empty content for typing
      setLines(prev => [...prev, { id: lineId, type: result.type as 'output' | 'error', content: '', commandName: cmdName }]);

      setIsTyping(true);
      const text = result.content;
      let i = 0;
      const step = () => {
        i++;
        if (i > text.length) {
          setLines(prev => prev.map(l => l.id === lineId ? { ...l, content: text } : l));
          setIsTyping(false);
          return;
        }
        setLines(prev => prev.map(l => l.id === lineId ? { ...l, content: text.slice(0, i) } : l));
        setTimeout(step, 15);
      };
      setTimeout(step, 400); // 400ms processing delay per design
    }
  }, [currentDir, cmdHistory, navigate]);

  /* Keyboard handlers */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping) {
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        setIsTyping(false);
        setLines(prev => [...prev, { id: Date.now().toString(), type: 'output', content: '^C' }]);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
      setInput('');
      setSuggestions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIdx);
      setInput(cmdHistory[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIdx = historyIndex + 1;
      if (newIdx >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim().split(/\s+/).pop() || '';
      if (partial.length === 0) return;

      const matches = getCompletions(partial, currentDir);
      if (matches.length === 0) return;

      const newTabIndex = (tabIndex + 1) % matches.length;
      setTabIndex(newTabIndex);
      setSuggestions(matches);

      const match = matches[newTabIndex];
      const parts = input.trim().split(/\s+/);
      if (parts.length === 1) {
        setInput(match + ' ');
      } else {
        parts[parts.length - 1] = match;
        setInput(parts.join(' ') + ' ');
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
      setLines(prev => [...prev, { id: Date.now().toString(), type: 'output', content: '^C' }]);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setLines([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setTabIndex(0);
    setSuggestions([]);
  };

  const promptStr = `moonsbow@dev:${getPromptPath(currentDir)}$ `;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-terminal-black pt-[40px] pb-[28px]">
      {/* Terminal Window */}
      <div className="w-full max-w-[960px] flex-1 flex flex-col mx-0 md:mx-4 mt-0 md:mt-4 md:mb-4 md:rounded-t-[6px] border-0 md:border md:border-terminal-green-dim bg-terminal-black-alt overflow-hidden">
        {/* Header bar — hidden on mobile */}
        <div className="hidden md:flex items-center h-[32px] bg-terminal-black border-b border-terminal-gray-dark px-3 shrink-0">
          <div className="flex items-center gap-[6px]">
            <span className="w-[10px] h-[10px] rounded-full bg-terminal-red inline-block" />
            <span className="w-[10px] h-[10px] rounded-full bg-terminal-amber inline-block" />
            <span className="w-[10px] h-[10px] rounded-full bg-terminal-green inline-block" />
          </div>
          <div className="flex-1 text-center">
            <span className="font-mono text-[12px] text-terminal-gray">moonsbow@dev: ~/cv</span>
          </div>
          <div className="shrink-0">
            <span className="font-mono text-[12px] text-terminal-gray-dark">bash</span>
          </div>
        </div>

        {/* Scrollback area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 md:p-4 font-mono text-[13px] md:text-[15px] leading-relaxed"
          style={{ maxHeight: 'calc(100dvh - 40px - 28px - 32px)' }}
        >
          {lines.map((line) => (
            <div key={line.id} className="mb-1">
              <OutputRenderer line={line} />
            </div>
          ))}

          {/* Prompt */}
          <div className="flex items-start mt-2">
            <span className="text-terminal-green font-bold whitespace-pre shrink-0">{promptStr}</span>
            <div className="flex-1 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-terminal-white font-mono text-[13px] md:text-[15px] leading-relaxed outline-none caret-transparent"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              {/* Blinking cursor block overlay */}
              <span
                className={`absolute top-0 pointer-events-none text-terminal-white ${cursorVisible && !isTyping ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${input.length}ch`,
                  transition: 'opacity 530ms',
                }}
              >
                ▋
              </span>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 1 && (
            <div className="mt-1 flex flex-wrap gap-2" style={{ marginLeft: `${promptStr.length}ch` }}>
              {suggestions.map((s, i) => (
                <span
                  key={s}
                  className={`font-mono text-[12px] px-2 py-0.5 rounded ${i === tabIndex ? 'bg-terminal-green text-terminal-black' : 'text-terminal-gray'}`}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile status bar (visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[24px] bg-terminal-black-alt border-t border-terminal-gray-dark flex items-center justify-between px-3 z-40">
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">bash</span>
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">{getPromptPath(currentDir)}</span>
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">UTF-8 | unix</span>
      </div>
    </div>
  );
}
