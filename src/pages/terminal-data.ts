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
    all.push('freelancer-ufinet.md', 'telefonica-bo.md', 'town-hall.md');
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
    content: 'homerocabrera',
  }),

  pwd: (_args, currentDir) => ({
    type: 'output',
    content: currentDir === '~' ? '/home/homerocabrera' : '/home/homerocabrera/cv',
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
        formatLsLine('drwxr-xr-x', '6', 'homerocabrera', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'homerocabrera', 'dev', '4096', '..'),
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', 'certifications'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '2847', 'about.txt'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1563', 'contact.txt'),
        formatLsLine('drwxr-xr-x', '4', 'homerocabrera', 'dev', '4096', 'education'),
        formatLsLine('drwxr-xr-x', '3', 'homerocabrera', 'dev', '4096', 'experience'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '892', 'languages.txt'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '3421', 'skills.txt'),
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', 'projects'),
      ];
    } else if (dir === '~/cv/certifications' || dir.endsWith('/certifications')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '4', 'homerocabrera', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1024', 'foundational-csharp.cert'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1024', 'cybersecurity-telework.cert'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1024', 'google-tools.cert'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1024', 'html-css.cert'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1024', 'react-guide.cert'),
      ];
    } else if (dir === '~/cv/education' || dir.endsWith('/education')) {
      lines = [
        formatLsLine('drwxr-xr-x', '4', 'homerocabrera', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'homerocabrera', 'dev', '4096', '..'),
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', 'bachelor-software-engineering'),
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', 'mobile-apps-specialization'),
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', 'technologist-info-systems'),
      ];
    } else if (dir === '~/cv/experience' || dir.endsWith('/experience')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '4', 'homerocabrera', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '1245', 'freelancer-ufinet.md'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '2156', 'telefonica-bo.md'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '987', 'town-hall.md'),
      ];
    } else if (dir === '~/cv/projects' || dir.endsWith('/projects')) {
      lines = [
        formatLsLine('drwxr-xr-x', '2', 'homerocabrera', 'dev', '4096', '.'),
        formatLsLine('drwxr-xr-x', '3', 'homerocabrera', 'dev', '4096', '..'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '2048', 'data-automation.md'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '2048', 'ssis-pipeline.md'),
        formatLsLine('-rw-r--r--', '1', 'homerocabrera', 'dev', '2048', 'web-dashboard.md'),
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
    content: `.\n├── about.txt\n├── certifications/\n│   ├── foundational-csharp.cert\n│   ├── cybersecurity-telework.cert\n│   ├── google-tools.cert\n│   ├── html-css.cert\n│   └── react-guide.cert\n├── contact.txt\n├── education/\n│   ├── bachelor-software-engineering/\n│   ├── mobile-apps-specialization/\n│   └── technologist-info-systems/\n├── experience/\n│   ├── freelancer-ufinet/\n│   ├── telefonica-bo/\n│   └── town-hall/\n├── languages.txt\n├── projects/\n│   ├── data-automation.md\n│   ├── ssis-pipeline.md\n│   └── web-dashboard.md\n└── skills.txt\n\n5 directories, 13 files`,
  }),

  cat: (args) => {
    const file = args[0];
    if (!file) return { type: 'error', content: 'cat: missing operand' };

    switch (file) {
      case 'about.txt': {
        return {
          type: 'output',
          content: `${header('ABOUT HOMERO CABRERA')}\n\nName:        Homero Cabrera Araque\nLocation:    Burnaby, BC, Canada\nPhone:       (1) 604 754-6694\nEmail:       homero9726@gmail.com\nStatus:      Open Work Permit — Available to join dynamic teams in Canada\n\n${header('SUMMARY')}\n\nExperienced data solutions developer with a strong foundation in SQL\nServer, SSRS/SSIS, backup and restore strategies, performance tuning,\nand database monitoring. Background in software development using\nJavaScript (ReactJS), C#, and Dynamics 365 CRM.\n\nSkilled in data encryption, masking, and automation solutions.\nProficient with cloud tools (Azure), Python, DAX, and Power Query.\n\n${header('QUICK LINKS')}\n\n[LinkedIn]  → linkedin.com/in/homero-cabrera-araque\n[GitHub]    → github.com/homero-cabrera\n[Email]     → mailto:homero9726@gmail.com\n\n${'━'.repeat(70)}`,
        };
      }
      case 'skills.txt': {
        return {
          type: 'output',
          content: `${header('TECHNICAL SKILLS MATRIX')}\n\n${subheader('DATABASE SOLUTIONS & ADMINISTRATION')}\n${bar('SQL Server', 95)}\n${bar('SSRS / SSIS', 90)}\n${bar('Backup & Restore', 88)}\n${bar('Performance Tuning', 85)}\n${bar('Database Monitoring', 88)}\n${bar('Data Encryption', 82)}\n${bar('Data Masking', 82)}\n${bar('Ola Hallengren Scripts', 85)}\n\n${subheader('PROGRAMMING LANGUAGES')}\n${bar('JavaScript', 92)}\n${bar('C#', 88)}\n${bar('Python', 85)}\n${bar('DAX', 82)}\n${bar('Power Query', 88)}\n\n${subheader('WEB DEVELOPMENT')}\n${bar('ReactJS', 90)}\n${bar('HTML / CSS', 92)}\n${bar('Django', 78)}\n${bar('ASP.NET', 82)}\n\n${subheader('CLOUD SERVICES & AUTOMATION')}\n${bar('Azure', 85)}\n${bar('Jenkins', 78)}\n${bar('Docker', 78)}\n${bar('RPA (UiPath/BluePrism)', 85)}\n\n${subheader('DEVOPS & METHODOLOGIES')}\n${bar('Git / GitHub', 95)}\n${bar('CI/CD Pipelines', 88)}\n${bar('Agile / Scrum', 90)}\n\n${'━'.repeat(70)}`,
        };
      }
      case 'contact.txt': {
        return {
          type: 'output',
          content: `${header('CONTACT INFORMATION')}\n\n  Name:      Homero Cabrera Araque\n  Location:  Burnaby, British Columbia, Canada\n  Phone:     (1) 604 754-6694\n  Email:     homero9726@gmail.com\n  LinkedIn:  linkedin.com/in/homero-cabrera-araque\n  GitHub:    github.com/homero-cabrera\n\n  Work Status: Open Work Permit Holder — Ready to join Canadian teams\n\n  Best contact method: Email or LinkedIn message\n\n${'━'.repeat(70)}\n\nType 'contact-form' to send a message directly.`,
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
    content: `${header('WORK EXPERIENCE')}\n\n[1] Freelancer — Software Developer\n    Ufinet, Bogotá COL | Vancouver CA\n    JAN 2024 ───────── JUL 2024\n    ─────────────────────────────────────────────────────────────────\n    • Developed and maintained software applications using JavaScript\n      and C#.\n    • Collaborated with cross-functional teams to design and implement\n      new features.\n    • Automated routine processes, enhancing efficiency and accuracy.\n\n[2] Telefonica — BO Automation & Multicountry Analysis\n    Bogotá COL\n    MAR 2020 ───────── JAN 2023\n    ─────────────────────────────────────────────────────────────────\n    • Implemented database automation solutions using SSIS and T-SQL.\n    • Designed and deployed reports with SSRS for business units.\n    • Managed backup/restore procedures and applied encryption/masking.\n    • Tuned SQL performance and implemented monitoring solutions.\n    • Utilized Ola Hallengren scripts for maintenance and health checks.\n    • Contributed to cloud-based data integration using Azure.\n    • Built reports and dashboards with Power BI, Power Query, DAX,\n      and Python.\n\n[3] Town Hall — Analyst\n    Gigante, Huila COL\n    JAN 2018 ───────── DEC 2019\n    ─────────────────────────────────────────────────────────────────\n    • Analyzed data to support municipal projects and initiatives.\n    • Developed software tools to improve data collection and analysis.\n    • Collaborated with departments to optimize workflows.\n\n${'━'.repeat(70)}`,
  }),

  education: () => ({
    type: 'output',
    content: `${header('EDUCATION')}\n\n[1] Bachelor of Software Engineering\n    Politécnico Grancolombiano — Bogotá, Colombia\n    2021 ───────── 2025 (In Progress)\n    ─────────────────────────────────────────────────────────────────\n    Studying advanced software engineering principles and practices.\n    Working on projects involving software development and systems\n    analysis.\n\n[2] Technological Specialization in Mobile Application Development\n    National Learning Service (SENA) — Garzón, Huila, Colombia\n    JUL 2019 ───────── JUN 2020\n    ─────────────────────────────────────────────────────────────────\n    • Specialized in developing mobile applications for various\n      platforms.\n    • Gained hands-on experience in designing and implementing mobile\n      solutions.\n\n[3] Technologist in Information Systems Analysis and Development\n    National Learning Service (SENA) — Garzón, Huila, Colombia\n    JUL 2015 ───────── DEC 2017\n    ─────────────────────────────────────────────────────────────────\n    • Focused on information systems analysis and development.\n    • Developed skills in system design, implementation, and\n      maintenance.\n\n${'━'.repeat(70)}`,
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
      ['OS', 'homerocabrera OS 6.8.0'],
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
        output += art + 'homerocabrera@dev\n';
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
