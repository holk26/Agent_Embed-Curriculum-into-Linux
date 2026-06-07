import type { ReactNode } from 'react';

export interface CommandResult {
  type: 'output' | 'error' | 'navigate';
  content: string | ReactNode;
  navigateTo?: string;
  newDir?: string;
}

export type CommandHandler = (args: string[], currentDir: string, historyList?: string[]) => CommandResult;

export function getPromptPath(currentDir: string): string {
  if (currentDir === '~') return '~';
  if (currentDir === '~/cv') return '~/cv';
  return currentDir.replace('~/cv/', '~/cv/');
}

const ALL_COMMANDS = [
  'about', 'cat', 'cd', 'clear', 'contact', 'contact-form', 'date',
  'education', 'experience', 'exit', 'help', 'history', 'languages', 'ls', 'logout',
  'neofetch', 'projects', 'pwd', 'skills', 'tree', 'whoami'
];

const DIRS_ROOT = ['certifications/', 'education/', 'experience/', 'projects/'];
const FILES_ROOT = ['about.txt', 'contact.txt', 'languages.txt', 'skills.txt'];

export function getCompletions(partial: string, currentDir: string): string[] {
  const all: string[] = [...ALL_COMMANDS];
  if (currentDir === '~/cv' || currentDir === '~') {
    all.push(...FILES_ROOT, ...DIRS_ROOT);
  } else if (currentDir === '~/cv/certifications') {
    all.push('foundational-csharp.cert', 'cybersecurity-telework.cert', 'google-tools.cert', 'html-css.cert', 'react-guide.cert');
  } else if (currentDir === '~/cv/education') {
    all.push('bachelor-software-engineering/', 'mobile-apps-specialization/', 'technologist-info-systems/');
  } else if (currentDir === '~/cv/experience') {
    all.push('moonsbow.md', 'ufinet-senior.md', 'ufinet-dev.md', 'azteca.md', 'digital-solutions.md', 'telefonica-bo.md', 'town-hall.md');
  } else if (currentDir === '~/cv/projects') {
    all.push('data-automation.md', 'ssis-pipeline.md', 'web-dashboard.md');
  }
  const unique = [...new Set(all)];
  return unique.filter(c => c.startsWith(partial)).sort();
}

function bar(skill: string, pct: number): string {
  const filled = Math.round((pct / 100) * 38);
  const empty = 38 - filled;
  const label = skill.padEnd(24, ' ');
  return `${label} ${'█'.repeat(filled)}${'░'.repeat(empty)}  ${pct}%`;
}

function header(title: string): string {
  const pad = Math.max(0, 70 - title.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return '━'.repeat(70) + '\n' + ' '.repeat(left) + title + ' '.repeat(right) + '\n' + '━'.repeat(70);
}

function subheader(title: string): string {
  return title + '\n' + '─'.repeat(70);
}

function formatLsLine(perms: string, links: string, user: string, group: string, size: string, name: string): string {
  return `${perms}  ${links.padStart(2)} ${user} ${group} ${size.padStart(6)} Jan 10 09:00 ${name}`;
}

export const commands: Record<string, CommandHandler> = {
  help: () => ({
    type: 'output',
    content: `╔══════════════════════════════════════════════════════════════════════════╗
║                          AVAILABLE COMMANDS                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Command          │ Description                                           ║
╠═══════════════════╪═══════════════════════════════════════════════════════╣
║  about            │ Display personal information and summary              ║
║  cat <file>       │ View file contents (try: about.txt, skills.txt)       ║
║  cd <dir>         │ Change directory                                      ║
║  clear            │ Clear the terminal screen                             ║
║  contact          │ Show contact information and links                    ║
║  date             │ Display current date and time                         ║
║  education        │ List education history                                 ║
║  experience       │ Show work experience                                  ║
║  help             │ Show this help message                                ║
║  ls [dir]         │ List directory contents                               ║
║  neofetch         │ Display system info with ASCII art                    ║
║  projects         │ Navigate to projects page                             ║
║  pwd              │ Print working directory                               ║
║  skills           │ Display technical skills with proficiency bars        ║
║  tree [dir]       │ Display directory tree                                ║
║  whoami           │ Display current user info                             ║
╚══════════════════════════════════════════════════════════════════════════╝

Tip: Use TAB for command completion. Use ↑/↓ for history.`,
  }),

  '?': () => commands.help([], ''),

  whoami: () => ({
    type: 'output',
    content: 'moonsbow',
  }),

  pwd: (_args, currentDir) => ({
    type: 'output',
    content: currentDir === '~' ? '/home/moonsbow' : '/home/moonsbow/cv',
  }),

  date: () => {
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
    return {
      type: 'output',
      content: `${day} ${month} ${date} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm} PST ${year}`,
    };
  },

  ls: (args, currentDir) => {
    const target = args[0] || '.';
    let dir = currentDir;
    if (target !== '.') {
      if (target.startsWith('/')) dir = target;
      else if (target === '~') dir = '~';
      else if (target === '..') dir = dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) || '~' : '~';
      else dir = dir === '~' ? `~/cv/${target}` : `${dir}/${target}`;
    }

    let lines: string[] = [];
    if (dir === '~' || dir === '~/cv') {
      lines = [
        formatLsLine('drwxr-xr-x', '6', 'moonsbow', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'moonsbow', 'dev', '4096', '..'),
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', 'certifications'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '2847', 'about.txt'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1563', 'contact.txt'),
        formatLsLine('drwxr-xr-x', '4', 'moonsbow', 'dev', '4096', 'education'),
        formatLsLine('drwxr-xr-x', '3', 'moonsbow', 'dev', '4096', 'experience'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '892', 'languages.txt'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '3421', 'skills.txt'),
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', 'projects'),
      ];
    } else if (dir === '~/cv/certifications' || dir.endsWith('/certifications')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '4', 'moonsbow', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'foundational-csharp.cert'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'cybersecurity-telework.cert'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'google-tools.cert'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'html-css.cert'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'react-guide.cert'),
      ];
    } else if (dir === '~/cv/education' || dir.endsWith('/education')) {
      lines = [
        formatLsLine('drwxr-xr-x', '4', 'moonsbow', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'moonsbow', 'dev', '4096', '..'),
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', 'bachelor-software-engineering'),
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', 'mobile-apps-specialization'),
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', 'technologist-info-systems'),
      ];
    } else if (dir === '~/cv/experience' || dir.endsWith('/experience')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '4', 'moonsbow', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1847', 'moonsbow.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1562', 'ufinet-senior.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1245', 'ufinet-dev.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1432', 'azteca.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '1024', 'digital-solutions.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '2156', 'telefonica-bo.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '987', 'town-hall.md'),
      ];
    } else if (dir === '~/cv/projects' || dir.endsWith('/projects')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'moonsbow', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'moonsbow', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '2048', 'data-automation.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '2048', 'ssis-pipeline.md'),
        formatLsLine('-rw-r--r--', '1', 'moonsbow', 'dev', '2048', 'web-dashboard.md'),
      ];
    } else {
      return { type: 'error', content: `ls: cannot access '${args[0]}': No such file or directory` };
    }

    if (args.includes('-la') || args.includes('-al') || args.includes('-a')) {
      return { type: 'output', content: lines.join('\n') };
    }
    const filtered = lines.filter(l => !l.endsWith(' .') && !l.endsWith(' ..'));
    return { type: 'output', content: filtered.join('\n') };
  },

  tree: () => ({
    type: 'output',
    content: `.\n├── about.txt\n├── certifications/\n│   ├── foundational-csharp.cert\n│   ├── cybersecurity-telework.cert\n│   ├── google-tools.cert\n│   ├── html-css.cert\n│   └── react-guide.cert\n├── contact.txt\n├── education/\n│   ├── bachelor-software-engineering/\n│   ├── mobile-apps-specialization/\n│   └── technologist-info-systems/\n├── experience/\n│   ├── moonsbow.md\n│   ├── ufinet-senior.md\n│   ├── ufinet-dev.md\n│   ├── azteca.md\n│   ├── digital-solutions.md\n│   ├── telefonica-bo.md\n│   └── town-hall.md\n├── languages.txt\n├── projects/\n│   ├── data-automation.md\n│   ├── ssis-pipeline.md\n│   └── web-dashboard.md\n└── skills.txt\n\n5 directories, 18 files`,
  }),

  cat: (args) => {
    const file = args[0];
    if (!file) return { type: 'error', content: 'cat: missing operand' };

    switch (file) {
      case 'about.txt': {
        return {
          type: 'output',
          content: `${header('ABOUT HOMERO CABRERA')}\n\nName:        Homero Cabrera\nLocation:    Canada\nPhone:       (1) 604 754-6694\nEmail:       homero9726@gmail.com\nStatus:      Senior Software Engineer | Expert in AI-Driven Automation\n             & Full Stack Development | Agent AI | Python | C# | React | Cloud\n\n${header('SUMMARY')}\n\nSoftware Engineer and Automation Specialist with an extensive track\nrecord in process optimization, API development, and AI integration.\nAt UFINET, I spearheaded the optimization of business applications\nusing C#, Power Apps, and custom APIs, significantly enhancing workflow\nefficiency and system interoperability.\n\nMy experience at AZTECA INTERNACIONAL INC involved architecting CI/CD\npipelines and developing advanced AI-driven automation by integrating\nOpenAI/ChatGPT APIs to streamline complex business processes. I am\ncommitted to delivering scalable, high-performance solutions, leveraging\nmy expertise in full-stack development and autonomous agents to empower\norganizations through transformative technologies.\n\n${header('QUICK LINKS')}\n\n[LinkedIn]  → linkedin.com/in/homero-dev\n[GitHub]    → github.com/homero-cabrera\n[Email]     → mailto:homero9726@gmail.com\n\n${'━'.repeat(70)}`,
        };
      }
      case 'skills.txt': {
        return {
          type: 'output',
          content: `${header('TECHNICAL SKILLS MATRIX')}\n\n${subheader('CORE COMPETENCIES')}\n${bar('TypeScript', 95)}\n${bar('Python', 90)}\n${bar('C#', 88)}\n${bar('React / ReactJS', 90)}\n${bar('AI & Agent Development', 92)}\n${bar('Full Stack Development', 90)}\n\n${subheader('CLOUD & DEVOPS')}\n${bar('Azure', 85)}\n${bar('CI/CD Pipelines', 88)}\n${bar('Docker', 78)}\n${bar('Git / GitHub', 95)}\n\n${subheader('DATA & AUTOMATION')}\n${bar('SQL Server', 90)}\n${bar('SSRS / SSIS', 85)}\n${bar('Power Apps / Power Automate', 88)}\n${bar('API Development', 90)}\n\n${subheader('WEB & MOBILE')}\n${bar('JavaScript', 92)}\n${bar('HTML / CSS', 90)}\n${bar('Mobile Design', 85)}\n${bar('WAMP', 82)}\n\n${subheader('METHODOLOGIES')}\n${bar('Agile / Scrum', 90)}\n${bar('Process Optimization', 92)}\n${bar('System Integration', 88)}\n\n${'━'.repeat(70)}`,
        };
      }
      case 'contact.txt': {
        return {
          type: 'output',
          content: `${header('CONTACT INFORMATION')}\n\n  Name:      Homero Cabrera\n  Location:  Canada\n  Phone:     (1) 604 754-6694\n  Email:     homero9726@gmail.com\n  LinkedIn:  linkedin.com/in/homero-dev\n  GitHub:    github.com/homero-cabrera\n\n  Work Status: Senior Software Engineer — Open to opportunities\n\n  Best contact method: Email or LinkedIn message\n\n${'━'.repeat(70)}\n\nType 'contact-form' to send a message directly.`,
        };
      }
      case 'languages.txt': {
        return {
          type: 'output',
          content: `${header('LANGUAGE PROFICIENCY')}\n\nSpanish    ████████████████████████████████████████████████████  Native\nEnglish    ███████████████████████████░░░░░░░░░░░░░░░░░░░░░░░  Basic\n           |←────── spoken ──────→|←──── reading ──────────→|\n           Reading comprehension: Excellent\n           Conversational: Basic\n\n${'━'.repeat(70)}`,
        };
      }
      case 'certifications/foundational-csharp.cert':
      case 'certifications/':
      case 'certifications': {
        return {
          type: 'output',
          content: `certifications/\n├── foundational-csharp.cert          Microsoft          2023\n├── cybersecurity-telework.cert       Telework Security  2022\n├── google-tools.cert                 Google Tools       2021\n├── html-css.cert                     Web Development    2021\n└── react-guide.cert                  React.js           2022`,
        };
      }
      default:
        return { type: 'error', content: `cat: ${file}: No such file or directory` };
    }
  },

  experience: () => ({
    type: 'output',
    content: `${header('WORK EXPERIENCE')}\n\n[1] Moonsbow.com — Senior Software Engineer\n    Canadá\n    JAN 2023 ───────── PRESENT\n    ─────────────────────────────────────────────────────────────────\n    • Leading full-stack development projects with React, TypeScript,\n      and Python.\n    • Developing AI-driven automation solutions and autonomous agents.\n    • Architecting scalable cloud solutions on Azure.\n    • Building APIs and integrations for business process optimization.\n\n[2] UFINET — Senior Software Developer\n    Colombia\n    JAN 2024 ───────── JUL 2024\n    ─────────────────────────────────────────────────────────────────\n    • Developed and optimized business applications using C# and\n      Power Apps.\n    • Created custom APIs to enhance workflow efficiency and system\n      interoperability.\n    • Collaborated with cross-functional teams to design and implement\n      new features.\n    • Automated routine processes, enhancing efficiency and accuracy.\n\n[3] AZTECA INTERNACIONAL INC — Software Developer\n    Bogotá, Colombia\n    OCT 2023 ───────── JAN 2024\n    ─────────────────────────────────────────────────────────────────\n    • Architected CI/CD pipelines to streamline development workflows.\n    • Developed AI-driven automation by integrating OpenAI/ChatGPT APIs.\n    • Optimized business processes through intelligent automation\n      solutions.\n    • Focused on improving efficiency, scalability, and system\n      functionality.\n\n[4] Digital Solutions 324 SL — .NET Developer\n    Barcelona, Spain\n    FEB 2023 ───────── MAR 2023\n    ─────────────────────────────────────────────────────────────────\n    • Developed .NET applications for business solutions.\n    • Collaborated with international teams on software development\n      projects.\n    • Implemented best practices for code quality and maintainability.\n\n[5] Telefónica — BO Automation & Multicountry Analysis\n    Bogotá, Colombia\n    MAR 2020 ───────── JAN 2023\n    ─────────────────────────────────────────────────────────────────\n    • Implemented automation solutions to streamline business\n      operations.\n    • Conducted multicountry analysis to support decision-making\n      processes.\n    • Developed reports and dashboards to provide actionable insights.\n    • Utilized Visual Studio, C#, and automation tools for\n      cross-country operations.\n\n[6] TOWN HALL — Analyst\n    Colombia\n    JAN 2018 ───────── DEC 2019\n    ─────────────────────────────────────────────────────────────────\n    • Analyzed data to support municipal projects and initiatives.\n    • Developed software tools to improve data collection and analysis.\n    • Collaborated with various departments to optimize workflows.\n\n${'━'.repeat(70)}`,
  }),

  education: () => ({
    type: 'output',
    content: `${header('EDUCATION')}\n\n[1] Bachelor of Software Engineering\n    Politécnico Grancolombiano — Bogotá, Colombia\n    FEB 2021 ───────── MAY 2026\n    ─────────────────────────────────────────────────────────────────\n    Studying advanced software engineering principles and practices.\n    Focused on software development, systems analysis, and AI\n    integration.\n\n[2] Professional Certificate in Mobile Application Development\n    National Learning Service (SENA) — Colombia\n    JUL 2019 ───────── JUN 2020\n    ─────────────────────────────────────────────────────────────────\n    • Specialized in developing mobile applications for various\n      platforms.\n    • Gained hands-on experience in designing and implementing mobile\n      solutions.\n\n[3] Associate's Degree in Systems Analysis and Development\n    National Learning Service (SENA) — Colombia\n    JUL 2015 ───────── DEC 2017\n    ─────────────────────────────────────────────────────────────────\n    • Focused on information systems analysis and development.\n    • Developed skills in system design, implementation, and\n      maintenance.\n\n${'━'.repeat(70)}`,
  }),

  about: () => commands.cat(['about.txt'], '~/cv'),

  skills: () => commands.cat(['skills.txt'], '~/cv'),

  contact: () => commands.cat(['contact.txt'], '~/cv'),

  languages: () => commands.cat(['languages.txt'], '~/cv'),

  neofetch: () => {
    const now = new Date();
    const startTime = (typeof window !== 'undefined' && (window as any).__terminalStartTime) ? (window as any).__terminalStartTime : now.getTime();
    const uptimeMs = now.getTime() - startTime;
    const uptimeMin = Math.floor(uptimeMs / 60000);
    const uptimeStr = uptimeMin < 1 ? 'just now' : `${uptimeMin} mins`;
    const memUsed = Math.floor(900 + Math.random() * 100);

    const ascii = `                    .OMMMMMMMMMMMMMMMO.                   \n                 .MMMMMMMMMMMMMMMMMMMMM.                \n                MMMMMMMM'            'MMMM                \n               MMMMMM                  MM               \n              MMMMM'                    'M              \n             MMMMM                       M              \n            .MMMM                        .              \n            MMMM'                                       \n           MMMM'                                        \n          MMMM'                                         \n          MMMM                                          \n          MMMM                                          \n         .MMM'                                          \n          MMM'                                          \n          MMMM                                          \n          MMMM                                          \n          MMMM.                                         \n           MMM:                    .M'                   \n            MMM.                  .M'                    \n             'MMM.               .M'                     \n               'MMMMMMMMMMMMMMMMMM'                     \n                 ''MMMMMMMMMMM''                       `;

    const info = [
      ['OS', 'moonsbow OS 6.8.0'],
      ['Host', 'Virtual Developer Workstation'],
      ['Kernel', '6.8.0-homero'],
      ['Uptime', uptimeStr],
      ['Packages', '42 (dpkg)'],
      ['Shell', 'bash 5.2.15'],
      ['Resolution', '1920x1080'],
      ['DE', 'Terminal'],
      ['WM', 'React.js'],
      ['WM Theme', 'Dark Green'],
      ['Terminal', 'tty'],
      ['Terminal Font', 'JetBrains Mono'],
      ['CPU', 'Brain @ 2.40GHz (2 cores)'],
      ['GPU', 'Knowledge & Experience'],
      ['Memory', `${memUsed}MiB / 1024MiB`],
    ];

    const asciiLines = ascii.split('\n');
    let output = '';
    for (let i = 0; i < Math.max(asciiLines.length, info.length + 2); i++) {
      const art = (asciiLines[i] || '').padEnd(55, ' ');
      if (i === 0) {
        output += art + 'moonsbow@dev\n';
      } else if (i === 1) {
        output += art + '─────────────────\n';
      } else {
        const inf = info[i - 2];
        if (inf) {
          output += art + `${inf[0]}: ${inf[1]}\n`;
        } else {
          output += art + '\n';
        }
      }
    }
    return { type: 'output', content: output };
  },

  cd: (args, currentDir) => {
    const dir = args[0] || '~';
    if (dir === '~' || dir === '/') return { type: 'output', content: '', newDir: '~/cv' };
    if (dir === '..') {
      const parent = currentDir.includes('/') ? currentDir.slice(0, currentDir.lastIndexOf('/')) || '~' : '~';
      return { type: 'output', content: '', newDir: parent };
    }
    const validDirs = ['certifications', 'education', 'experience', 'projects', 'cv'];
    const base = dir.replace(/\/$/, '');
    if (validDirs.includes(base)) {
      const newDir = base === 'cv' ? '~/cv' : `~/cv/${base}`;
      return { type: 'output', content: '', newDir };
    }
    return { type: 'error', content: `bash: cd: ${dir}: No such file or directory` };
  },

  clear: () => ({ type: 'output', content: '__CLEAR__' }),

  exit: () => ({
    type: 'output',
    content: `logout\n\nSaving session...\n...copying shared history...\n...saving history...truncating history files...\n...completed.\n\n[Process completed]`,
  }),

  logout: () => commands.exit([], ''),

  projects: () => ({
    type: 'navigate',
    content: 'Navigating to projects directory...',
    navigateTo: '/projects',
  }),

  'contact-form': () => ({
    type: 'navigate',
    content: 'Opening contact form...',
    navigateTo: '/contact',
  }),

  history: (_args, _currentDir, historyList = []) => ({
    type: 'output',
    content: historyList.length === 0 ? 'No history yet.' : historyList.map((h, i) => ` ${(i + 1).toString().padStart(3)}  ${h}`).join('\n'),
  }),
};
