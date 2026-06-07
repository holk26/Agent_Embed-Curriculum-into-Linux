import type { Line } from './types';

/* ------------------------------------------------------------------ */
/*  Output Renderers                                                   */
/* ------------------------------------------------------------------ */

export function LsOutput({ content }: { content: string }) {
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

export function TreeOutput({ content }: { content: string }) {
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

export function HelpOutput({ content }: { content: string }) {
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

export function NeofetchOutput({ content }: { content: string }) {
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

export function SkillsOutput({ content }: { content: string }) {
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

export function AboutOutput({ content }: { content: string }) {
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

export function ExperienceOutput({ content }: { content: string }) {
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

export function EducationOutput({ content }: { content: string }) {
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

export function LanguagesOutput({ content }: { content: string }) {
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

export function ContactOutput({ content }: { content: string }) {
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

export function CertOutput({ content }: { content: string }) {
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

export function PsOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (i === 0) {
          return <div key={i} className="text-terminal-white font-bold">{line}</div>;
        }
        const parts = line.trim().split(/\s+/);
        const cmd = parts[parts.length - 1];
        const prefix = line.slice(0, line.lastIndexOf(cmd));
        return (
          <div key={i}>
            <span className="text-terminal-gray">{prefix}</span>
            <span className="text-terminal-cyan">{cmd}</span>
          </div>
        );
      })}
    </pre>
  );
}

export function CowsayOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.trim().startsWith('\\') || line.trim().startsWith('(') || line.trim().startsWith('(') || line.includes('(oo)') || line.includes('(__)') || line.includes('||')) {
          return <div key={i} className="text-terminal-green">{line}</div>;
        }
        return <div key={i} className="text-terminal-white">{line}</div>;
      })}
    </pre>
  );
}

export function SshOutput({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('Connecting') || line.startsWith('Connection') || line.startsWith('Handshake') || line.startsWith('Authenticat')) {
          return <div key={i} className="text-terminal-amber">{line}</div>;
        }
        if (line.startsWith('Welcome')) return <div key={i} className="text-terminal-green font-bold">{line}</div>;
        if (line.startsWith('Last login:')) return <div key={i} className="text-terminal-gray">{line}</div>;
        if (line.includes('http')) return <div key={i} className="text-terminal-blue">{line}</div>;
        return <div key={i} className="text-terminal-gray">{line}</div>;
      })}
    </pre>
  );
}

export function CalOutput({ content }: { content: string }) {
  const today = new Date().getDate();
  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (i === 0) return <div key={i} className="text-terminal-white font-bold">{line}</div>;
        if (i === 1) return <div key={i} className="text-terminal-green">{line}</div>;
        const parts = line.split(' ');
        return (
          <div key={i}>
            {parts.map((part, j) => {
              const num = parseInt(part, 10);
              if (num === today) {
                return <span key={j} className="text-terminal-black bg-terminal-green px-0.5">{part.padStart(2, ' ')} </span>;
              }
              return <span key={j} className="text-terminal-gray">{part.padStart(2, ' ')} </span>;
            })}
          </div>
        );
      })}
    </pre>
  );
}

export function DefaultOutput({ content, type }: { content: string; type: string }) {
  if (type === 'error') {
    return <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] text-terminal-red leading-relaxed">{content}</pre>;
  }
  return <pre className="whitespace-pre-wrap font-mono text-[13px] md:text-[14px] text-terminal-gray leading-relaxed">{content}</pre>;
}

export function OutputRenderer({ line }: { line: Line }) {
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
    case 'ps': return <PsOutput content={line.content} />;
    case 'top': return <PsOutput content={line.content} />;
    case 'cowsay': return <CowsayOutput content={line.content} />;
    case 'ssh': return <SshOutput content={line.content} />;
    case 'cal': return <CalOutput content={line.content} />;
    default: return <DefaultOutput content={line.content} type="output" />;
  }
}
