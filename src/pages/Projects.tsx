import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */
interface ProjectEntry {
  id: string;
  name: string;
  type: 'directory' | 'file';
  permissions: string;
  owner: string;
  size: string;
  date: string;
  icon: string;
  detail: ProjectDetail;
}

interface ProjectDetail {
  title: string;
  status: string;
  tech: string;
  role: string;
  duration: string;
  company: string;
  description: string;
  bullets: string[];
  highlights: string[];
}

/* ────────────────────────────────────────────────────────────────
   Box-drawing constants (64-char total width)
   ──────────────────────────────────────────────────────────────── */
const BOX_WIDTH = 62; // inner content width
const TOP_BORDER = '┏' + '━'.repeat(BOX_WIDTH) + '┓';
const MID_BORDER = '┣' + '━'.repeat(BOX_WIDTH) + '┫';
const BOT_BORDER = '┗' + '━'.repeat(BOX_WIDTH) + '┛';

function padLine(content: string, leftPad = 1): string {
  const inner = ' '.repeat(leftPad) + content;
  const padded = inner.padEnd(BOX_WIDTH, ' ');
  return '┃' + padded.slice(0, BOX_WIDTH) + '┃';
}

/* ────────────────────────────────────────────────────────────────
   Project Data (5 CV-based projects)
   ──────────────────────────────────────────────────────────────── */
const projects: ProjectEntry[] = [
  {
    id: 'ufinet-dashboard',
    name: 'ufinet-dashboard/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'moonsbow',
    size: '4.2K',
    date: 'Jul 15 2024',
    icon: '📁',
    detail: {
      title: 'Web Dashboard & CRM Integration',
      status: 'COMPLETE',
      tech: 'ReactJS, JavaScript, C#, Dynamics 365, REST API',
      role: 'Full-Stack Developer',
      duration: 'JAN 2024 — JUL 2024',
      company: 'Ufinet',
      description:
        'Developed interactive web dashboards for real-time data visualization. Integrated with Dynamics 365 CRM for unified customer data access and automated reporting workflows.',
      bullets: [
        'Built ReactJS dashboards with dynamic charting and real-time feeds',
        'Integrated Dynamics 365 CRM via REST API for unified data access',
        'Developed C# backend services for data aggregation',
        'Automated routine CRM processes reducing manual overhead',
        'Reduced report generation time by 60% through caching',
      ],
      highlights: [
        'ReactJS + TypeScript frontend architecture',
        'Dynamics 365 Web API integration',
        'C# ASP.NET Core backend services',
        'Azure DevOps CI/CD pipeline',
        'Power BI embedded analytics',
      ],
    },
  },
  {
    id: 'telefonica-etl',
    name: 'telefonica-etl/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'moonsbow',
    size: '8.7K',
    date: 'Jan 10 2023',
    icon: '📁',
    detail: {
      title: 'Data Automation & ETL Pipeline',
      status: 'COMPLETE',
      tech: 'SQL Server, SSIS, T-SQL, Python, Azure',
      role: 'Database Automation Developer',
      duration: 'MAR 2020 — JAN 2023',
      company: 'Telefonica',
      description:
        'Built comprehensive database automation solutions handling multi-terabyte datasets. Designed SSIS packages for extraction, transformation, and loading with error handling.',
      bullets: [
        'Implemented SSIS pipelines processing 2M+ records daily',
        'Designed T-SQL stored procedures for automated reporting',
        'Deployed Azure Data Factory for cloud data integration',
        'Reduced manual processing time by 80%',
        'Automated daily ETL workflows for 12 business units',
      ],
      highlights: [
        'SQL Server Integration Services (SSIS)',
        'Azure Data Factory & Blob Storage',
        'Python scripting for data validation',
        'Ola Hallengren maintenance solution',
        'ETL framework with comprehensive logging',
      ],
    },
  },
  {
    id: 'telefonica-reports',
    name: 'telefonica-reports/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'moonsbow',
    size: '6.3K',
    date: 'Dec 05 2022',
    icon: '📁',
    detail: {
      title: 'SSRS Reporting Infrastructure',
      status: 'COMPLETE',
      tech: 'SQL Server, SSRS, SSIS, Power BI, DAX',
      role: 'BI Developer',
      duration: 'MAR 2020 — JAN 2023',
      company: 'Telefonica',
      description:
        'Designed and deployed enterprise reporting infrastructure using SSRS and Power BI. Created parameterized reports for business units with role-based security.',
      bullets: [
        'Built 25+ SSRS reports with dynamic filtering and drill-down',
        'Created Power BI dashboards with DAX measures and KPIs',
        'Implemented row-level security in Power BI for governance',
        'Power Query data transformations for 8 data sources',
        'Automated report distribution via SSIS subscriptions',
      ],
      highlights: [
        'SQL Server Reporting Services (SSRS)',
        'Power BI Desktop & Service',
        'DAX measure optimization',
        'Report Builder parameterized templates',
        'Data-driven subscription automation',
      ],
    },
  },
  {
    id: 'municipal-analytics',
    name: 'municipal-analytics/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'moonsbow',
    size: '3.1K',
    date: 'Feb 28 2020',
    icon: '📁',
    detail: {
      title: 'Municipal Data Analytics Platform',
      status: 'COMPLETE',
      tech: 'SQL Server, Excel VBA, Power Query, Python',
      role: 'Data Analyst',
      duration: 'JAN 2019 — FEB 2020',
      company: 'Town Hall',
      description:
        'Developed data analytics tools and automated reporting for municipal government. Transformed raw administrative data into actionable insights for policy decisions.',
      bullets: [
        'Built automated Excel VBA tools for budget tracking',
        'Designed SQL Server databases for service records',
        'Created Power Query pipelines for data consolidation',
        'Developed Python scripts for statistical analysis',
        'Reduced report preparation time from days to hours',
      ],
      highlights: [
        'Excel VBA macro automation',
        'SQL Server database design',
        'Power Query ETL workflows',
        'Python pandas analytics',
        'Policy dashboard visualization',
      ],
    },
  },
  {
    id: 'crm-dynamics',
    name: 'crm-dynamics/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'moonsbow',
    size: '5.5K',
    date: 'Jun 20 2024',
    icon: '📁',
    detail: {
      title: 'Dynamics 365 CRM Customization',
      status: 'COMPLETE',
      tech: 'Dynamics 365, C#, JavaScript, Power Automate',
      role: 'CRM Developer',
      duration: 'JAN 2024 — JUL 2024',
      company: 'Ufinet',
      description:
        'Customized and extended Dynamics 365 CRM to match business processes. Developed plugins, custom workflows, and client-side scripts to enhance user experience.',
      bullets: [
        'Customized Dynamics 365 entities, forms, and views',
        'Developed C# plugins for server-side business logic',
        'Built JavaScript web resources for form validations',
        'Created Power Automate flows for approval processes',
        'Integrated third-party APIs for data enrichment',
      ],
      highlights: [
        'Dynamics 365 CE customization',
        'C# plugin development',
        'JavaScript form scripting',
        'Power Automate workflow design',
        'Solution packaging & deployment',
      ],
    },
  },
];

/* ────────────────────────────────────────────────────────────────
   Component: Projects (File Browser)
   ──────────────────────────────────────────────────────────────── */
export default function Projects() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Loading sequence ── */
  useEffect(() => {
    const text = 'Loading file manager...';
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setLoadingText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 400);
        }
      }, 30);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (loading || showHelp) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === '?') {
          setShowHelp(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          setMobileDetailOpen(true);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          if (mobileDetailOpen) {
            setMobileDetailOpen(false);
          } else {
            navigate('/terminal');
          }
          break;
        }
        case 'h':
        case '?': {
          e.preventDefault();
          setShowHelp(true);
          break;
        }
        case 'Tab': {
          e.preventDefault();
          break;
        }
        default:
          break;
      }
    },
    [loading, showHelp, mobileDetailOpen, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ── Scroll selected into view ── */
  useEffect(() => {
    const el = rowRefs.current[selectedIndex];
    if (el && listRef.current) {
      const list = listRef.current;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const listTop = list.scrollTop;
      const listBottom = listTop + list.clientHeight;
      if (top < listTop) {
        list.scrollTop = top;
      } else if (bottom > listBottom) {
        list.scrollTop = bottom - list.clientHeight;
      }
    }
  }, [selectedIndex]);

  const selectedProject = projects[selectedIndex];

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="h-[calc(100dvh-68px)] flex items-center justify-center bg-terminal-black">
        <div className="font-mono text-[15px] text-terminal-gray">
          <span className="text-terminal-green font-bold">$</span>{' '}
          {loadingText}
          <span className="animate-cursor-blink inline-block w-[8px] h-[15px] bg-terminal-green ml-[2px] align-middle" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-68px)] flex flex-col bg-terminal-black overflow-hidden relative">
      {/* ── Desktop dual-pane layout ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Pane — File List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-[40%] flex flex-col bg-terminal-black-alt border-r border-terminal-gray-dark"
        >
          {/* Pane Header */}
          <div className="flex items-center h-[32px] px-3 border-b border-terminal-gray-dark shrink-0">
            <span className="font-mono text-[14px] font-bold text-terminal-amber">
              projects/
            </span>
          </div>

          {/* File List */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                ref={(el) => { rowRefs.current[index] = el; }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                onClick={() => setSelectedIndex(index)}
                className={
                  'flex items-center px-3 py-[6px] cursor-pointer select-none transition-colors duration-100 ' +
                  (selectedIndex === index
                    ? 'bg-[rgba(74,246,38,0.08)] border-l-[2px] border-terminal-green'
                    : 'border-l-[2px] border-transparent hover:bg-[rgba(74,246,38,0.05)]')
                }
              >
                <span className="mr-2 text-[14px]">{project.icon}</span>
                <span
                  className={
                    'font-mono text-[13px] ' +
                    (project.type === 'directory'
                      ? 'text-terminal-blue font-bold'
                      : 'text-terminal-cyan')
                  }
                >
                  {project.name}
                </span>
                <span className="ml-auto font-mono text-[11px] text-terminal-gray tabular-nums">
                  {project.size}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Pane — Detail View */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-[60%] flex flex-col bg-terminal-black"
        >
          {/* Pane Header */}
          <div className="flex items-center h-[32px] px-3 border-b border-terminal-gray-dark shrink-0">
            <span className="font-mono text-[14px] font-bold text-terminal-amber">
              README.md
            </span>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectDetailView detail={selectedProject.detail} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile single-pane layout ── */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        {!mobileDetailOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-terminal-black-alt"
          >
            {/* Mobile Header */}
            <div className="flex items-center h-[32px] px-3 border-b border-terminal-gray-dark shrink-0">
              <span className="font-mono text-[14px] font-bold text-terminal-amber">
                projects/
              </span>
            </div>

            {/* Mobile File List */}
            <div ref={listRef} className="flex-1 overflow-y-auto">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  ref={(el) => { rowRefs.current[index] = el; }}
                  onClick={() => {
                    setSelectedIndex(index);
                    setMobileDetailOpen(true);
                  }}
                  className={
                    'flex items-center px-3 py-[8px] cursor-pointer select-none transition-colors duration-100 ' +
                    (selectedIndex === index
                      ? 'bg-[rgba(74,246,38,0.08)] border-l-[2px] border-terminal-green'
                      : 'border-l-[2px] border-transparent hover:bg-[rgba(74,246,38,0.05)]')
                  }
                >
                  <span className="mr-2 text-[14px]">{project.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={
                        'font-mono text-[13px] truncate ' +
                        (project.type === 'directory'
                          ? 'text-terminal-blue font-bold'
                          : 'text-terminal-cyan')
                      }
                    >
                      {project.name}
                    </span>
                    <span className="font-mono text-[11px] text-terminal-gray tabular-nums">
                      {project.permissions} {project.owner} {project.size} {project.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-terminal-black"
          >
            {/* Mobile Detail Header */}
            <div className="flex items-center h-[32px] px-3 border-b border-terminal-gray-dark shrink-0">
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="font-mono text-[12px] text-terminal-green hover:text-terminal-blue transition-colors duration-150 mr-3 shrink-0"
              >
                ← back
              </button>
              <span className="font-mono text-[14px] font-bold text-terminal-amber truncate">
                {selectedProject.name}README.md
              </span>
            </div>

            {/* Mobile Detail Content */}
            <div className="flex-1 overflow-y-auto p-3">
              <ProjectDetailView detail={selectedProject.detail} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Status Bar ── */}
      <div className="h-[24px] bg-terminal-black-alt border-t border-terminal-gray-dark flex items-center justify-between px-3 shrink-0">
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">
          {selectedIndex + 1}/{projects.length}
        </span>
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">
          Help: ?  Exit: ESC  Open: Enter  Nav: ↑↓
        </span>
        <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px] tabular-nums">
          {selectedProject.size}
        </span>
      </div>

      {/* ── Help Overlay ── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[100] bg-[rgba(12,12,12,0.85)] flex items-center justify-center"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-terminal-black-alt border border-terminal-green-dim rounded-[6px] p-6 max-w-[420px] w-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-mono text-[16px] font-bold text-terminal-green mb-4">
                Keyboard Shortcuts
              </h2>
              <div className="space-y-2">
                <HelpRow keys="↑ / ↓" desc="Move selection" />
                <HelpRow keys="Enter" desc="Open / expand project" />
                <HelpRow keys="Tab" desc="Switch focus between panes" />
                <HelpRow keys="ESC" desc="Back to list / exit to terminal" />
                <HelpRow keys="h / ?" desc="Toggle this help overlay" />
              </div>
              <p className="font-mono text-[11px] text-terminal-gray mt-4">
                Press ESC or click outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────────── */

function HelpRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center">
      <span className="font-mono text-[12px] text-terminal-amber w-[80px] shrink-0">
        {keys}
      </span>
      <span className="font-mono text-[12px] text-terminal-white">{desc}</span>
    </div>
  );
}

function ProjectDetailView({ detail }: { detail: ProjectDetail }) {
  // Word-wrap description to fit inside box
  const descLines = wrapText(detail.description, BOX_WIDTH - 2);

  return (
    <div className="font-mono text-[13px] leading-[1.6] text-terminal-green-dim">
      <pre className="m-0 p-0 whitespace-pre overflow-x-auto">
        {TOP_BORDER}
        {'\n'}
        {padLine(`PROJECT: ${detail.title}`, 1)}
        {'\n'}
        {MID_BORDER}
        {'\n'}
        {padLine(`Status:       ${'█'.repeat(8)} ${detail.status}`, 1)}
        {'\n'}
        {padLine(`Tech Stack:   ${detail.tech}`, 1)}
        {'\n'}
        {padLine(`Role:         ${detail.role}`, 1)}
        {'\n'}
        {padLine(`Duration:     ${detail.duration} | ${detail.company}`, 1)}
        {'\n'}
        {MID_BORDER}
        {'\n'}
        {padLine('DESCRIPTION', 1)}
        {'\n'}
        {MID_BORDER}
        {'\n'}
        {descLines.map((line) => (
          <>{padLine(line, 1)}{'\n'}</>
        ))}
        {'\n'}
        {detail.bullets.map((bullet) => (
          <>
            {padLine(`• ${bullet}`, 1)}
            {'\n'}
          </>
        ))}
        {MID_BORDER}
        {'\n'}
        {padLine('TECHNICAL HIGHLIGHTS', 1)}
        {'\n'}
        {MID_BORDER}
        {'\n'}
        {detail.highlights.map((highlight) => (
          <>
            {padLine(`• ${highlight}`, 1)}
            {'\n'}
          </>
        ))}
        {BOT_BORDER}
      </pre>
    </div>
  );
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (test.length <= maxChars) {
      currentLine = test;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word.length > maxChars ? word.slice(0, maxChars) : word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}
