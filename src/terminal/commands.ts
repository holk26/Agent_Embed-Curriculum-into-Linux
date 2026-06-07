import type { CommandHandler } from './types';

export type { CommandResult, CommandHandler } from './types';

export function getPromptPath(currentDir: string): string {
  if (currentDir === '~') return '~';
  if (currentDir === '~/cv') return '~/cv';
  return currentDir.replace('~/cv/', '~/cv/');
}

const ALL_COMMANDS = [
  'about', 'cal', 'cat', 'cd', 'clear', 'contact', 'contact-form', 'cowsay', 'curl', 'date',
  'echo', 'education', 'experience', 'exit', 'fortune', 'hackerman', 'help', 'history', 'languages', 'ls', 'logout',
  'man', 'matrix', 'mkdir', 'neofetch', 'pong', 'ps', 'projects', 'pwd', 'reboot', 'rm', 'shutdown', 'skills', 'sl', 'snake', 'ssh', 'sudo',
  'theme', 'top', 'touch', 'tree', 'uname', 'uptime', 'who', 'whoami'
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

function formatUptime(): string {
  const now = Date.now();
  const start = (typeof window !== 'undefined' && (window as any).__terminalStartTime) ? (window as any).__terminalStartTime : now;
  const diff = now - start;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const loads = [0.52, 0.58, 0.49];
  if (hours > 0) {
    return `up ${hours} hours, ${mins} mins, 3 users, load average: ${loads.join(', ')}`;
  }
  return `up ${mins} mins, 3 users, load average: ${loads.join(', ')}`;
}

function generateCal(): string {
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const title = `${monthNames[month]} ${year}`;
  const lines: string[] = [];
  lines.push('    ' + title);
  lines.push('Su Mo Tu We Th Fr Sa');

  let row = ' '.repeat(firstDay * 3);
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d.toString().padStart(2, ' ');
    if ((firstDay + d - 1) % 7 === 0 && d !== 1) {
      lines.push(row.trimEnd());
      row = dayStr + ' ';
    } else {
      row += dayStr + ' ';
    }
  }
  if (row.trim()) lines.push(row.trimEnd());
  return lines.join('\n');
}

function cowsayText(text: string): string {
  const msg = text || 'moo';
  const len = Math.min(msg.length, 38);
  const border = '-'.repeat(len + 2);
  const padded = msg.padEnd(len, ' ');
  return ` ${border}
< ${padded} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
}

function slFrames(): string {
  const frames = [
`      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|   
   /     |  |   H  |  |     |   |         ||_| |_||     
  |      |  |   H  |__--------------------| [___] |   
  | ________|___H__/__|_____/[][]~\\_______|       |   
  |/ |   |-----------I_____I [][] []  D   |=======|___`,

`        ====      ________              ___________
    _D _|  |_____/        \\__I_I_____===__|_________|
     |(_)---  | H\\________/ |   |      =|___ ___|     
     /     |  | H  |  |     |   |       ||_| |_||       
    |      |  | H  |__------------------| [___] |     
    | ________|_H__/__|_____/[][]~\\_____|       |     
    |/ |   |---------I_____I [][] []  D |=======|___`,

`          ====    ________            ___________
      _D _|  |___/        \\__I_I_____===__|_________|
       |(_)---  |\\________/ |   |    =|___ ___|       
       /     |  |  |  |     |   |     ||_| |_||         
      |      |  |  |__----------------| [___] |       
      | ________|__/__|_____/[][]~\\__|       |       
      |/ |   |-------I_____I [][] []  D=======|___`,

`            ====  ________          ___________
        _D _|  |_ /        \\__I_I_____===__|_________|
         |(_)---  |________/ |   |  =|___ ___|         
         /     |  ||  |     |   |   ||_| |_||           
        |      |  ||__--------------| [___] |         
        | ________|/__|_____/[][]~\\|       |         
        |/ |   |-----I_____I [][] []D=======|___`,

`              =====_______        ___________
          _D _|  | |        \\__I_I_____===__|_________|
           |(_)---  |________/ |   |=|___ ___|           
           /     |  ||  |     |   | ||_| |_||             
          |      |  ||__------------| [___] |           
          | ________|/__|_____/[][]~|       |           
          |/ |   |---I_____I [][] []=======|___`
  ];
  return frames.join('\n\n');
}

const FORTUNES = [
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Experience is the name everyone gives to their mistakes. — Oscar Wilde',
  'Knowledge is power. — Francis Bacon',
  'Simplicity is the soul of efficiency. — Austin Freeman',
  'Code is like humor. When you have to explain it, it’s bad. — Cory House',
  'Fix the cause, not the symptom. — Steve Maguire',
  'Make it work, make it right, make it fast. — Kent Beck',
];

const MAN_PAGES: Record<string, string> = {
  about: 'about - display personal information and summary',
  cal: 'cal - display a simple ASCII calendar of the current month',
  cat: 'cat [FILE] - concatenate and display file contents',
  cd: 'cd [DIR] - change the current directory',
  clear: 'clear - clear the terminal screen',
  contact: 'contact - show contact information and links',
  'contact-form': "contact-form - open the sendmail contact form",
  cowsay: 'cowsay [TEXT] - ASCII cow with a speech bubble',
  curl: 'curl [URL] - simulate a file download with progress bar',
  date: 'date - display current date and time',
  echo: 'echo [TEXT] - display a line of text',
  education: 'education - list education history',
  experience: 'experience - show work experience',
  exit: 'exit - exit the terminal session',
  fortune: 'fortune - print a random developer quote',
  help: 'help - show available commands',
  history: 'history - show command history',
  languages: 'languages - display language proficiency',
  ls: 'ls [DIR] - list directory contents',
  logout: 'logout - alias for exit',
  man: 'man [COMMAND] - display manual page for a command',
  mkdir: 'mkdir [DIR] - create a directory (read-only filesystem)',
  neofetch: 'neofetch - display system info with ASCII art',
  ps: 'ps - report a snapshot of current processes',
  projects: 'projects - navigate to projects page',
  pwd: 'pwd - print working directory',
  rm: 'rm [FILE] - remove a file (read-only filesystem)',
  skills: 'skills - display technical skills with proficiency bars',
  sl: 'sl - display a steam locomotive animation',
  ssh: 'ssh [HOST] - connect to a remote host via SSH',
  sudo: 'sudo [COMMAND] - execute a command as another user',
  top: 'top - display Linux processes',
  touch: 'touch [FILE] - change file timestamps (read-only filesystem)',
  tree: 'tree [DIR] - display directory tree',
  uname: 'uname - print system information',
  uptime: 'uptime - tell how long the system has been running',
  who: 'who - show who is logged on',
  whoami: 'whoami - print effective user ID',
};

export const commands: Record<string, CommandHandler> = {
  help: () => ({
    type: 'output',
    content: `╔══════════════════════════════════════════════════════════════════════════╗
║                          AVAILABLE COMMANDS                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Command          │ Description                                           ║
╠═══════════════════╪═══════════════════════════════════════════════════════╣
║  about            │ Display personal information and summary              ║
║  cal              │ Display a calendar of the current month               ║
║  cat <file>       │ View file contents (try: about.txt, skills.txt)       ║
║  cd <dir>         │ Change directory                                      ║
║  clear            │ Clear the terminal screen                             ║
║  contact          │ Show contact information and links                    ║
║  cowsay <text>    │ ASCII cow with a speech bubble                        ║
║  curl <url>       │ Simulate a file download                              ║
║  date             │ Display current date and time                         ║
║  echo <text>      │ Display a line of text                                ║
║  education        │ List education history                                ║
║  experience       │ Show work experience                                  ║
║  exit             │ Exit the terminal session                             ║
║  fortune          │ Print a random developer quote                        ║
║  help             │ Show this help message                                ║
║  history          │ Show command history                                  ║
║  ls [dir]         │ List directory contents                               ║
║  man <cmd>        │ Show manual for a command                             ║
║  mkdir <dir>      │ Create a directory                                    ║
║  neofetch         │ Display system info with ASCII art                    ║
║  ps               │ Report a snapshot of current processes                ║
║  projects         │ Navigate to projects page                             ║
║  pwd              │ Print working directory                               ║
║  rm <file>        │ Remove a file                                         ║
║  skills           │ Display technical skills with proficiency bars        ║
║  sl               │ Steam locomotive animation                            ║
║  ssh <host>       │ Connect to a remote host                              ║
║  sudo <cmd>       │ Execute a command as superuser                        ║
║  top              │ Display Linux processes                               ║
║  touch <file>     │ Change file timestamps                                ║
║  tree [dir]       │ Display directory tree                                ║
║  uname            │ Print system information                              ║
║  uptime           │ Show how long the system has been running             ║
║  who              │ Show who is logged on                                 ║
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
    content: `${header('WORK EXPERIENCE')}\n\n[1] Moonsbow.com — Senior Software Engineer\n    Canadá\n    JAN 2023 ───────── PRESENT\n    ─────────────────────────────────────────────────────────────────\n    • Leading full-stack development projects with React, TypeScript,\n      and Python.\n    • Developing AI-driven automation solutions and autonomous agents.\n    • Architecting scalable cloud solutions on Azure.\n    • Building APIs and integrations for business process optimization.\n\n[2] UFINET — Senior Software Developer\n    Colombia\n    JAN 2024 ───────── JUL 2024\n    ─────────────────────────────────────────────────────────────────\n    • Developed and optimized business applications using C# and\n      Power Apps.\n    • Created custom APIs to enhance workflow efficiency and system\n      interoperability.\n    • Collaborated with cross-functional teams to design and implement\n      new features.\n    • Automated routine processes, enhancing efficiency and accuracy.\n\n[3] AZTECA INTERNACIONAL INC — Software Developer\n    Bogotá, Colombia\n    OCT 2023 ───────── JAN 2024\n    ─────────────────────────────────────────────────────────────────\n    • Architected CI/CD pipelines to streamline development workflows.\n    • Developed AI-driven automation by integrating OpenAI/ChatGPT APIs.\n    • Optimized business processes through intelligent automation\n      solutions.\n    • Focused on improving efficiency, scalability, and system\n      functionality.\n\n[4] Digital Solutions 324 SL — .NET Developer\n    Barcelona, Spain\n    FEB 2023 ───────── MAR 2023\n    ─────────────────────────────────────────────────────────────────\n    • Developed .NET applications for business solutions.\n    • Collaborated with international teams on software development\n      projects.\n    • Implemented best practices for code quality and maintainability.\n\n[5] Telefónica — BO Automation & Multicountry Analysis\n    Bogotá, Colombia\n    MAR 2020 ───────── JAN 2023\n    ─────────────────────────────────────────────────────────────────\n    • Led automation initiatives for business operations.\n    • Developed multicountry analysis tools and dashboards.\n    • Streamlined reporting and data processing workflows.\n\n[6] Town Hall — Systems Analyst & Developer\n    Bogotá, Colombia\n    JUL 2017 ───────── MAR 2020\n    ─────────────────────────────────────────────────────────────────\n    • Analyzed and developed information systems.\n    • Maintained and optimized existing software solutions.\n    • Provided technical support and system integration.\n\n${'━'.repeat(70)}`,
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

  /* ------------------------------------------------------------------ */
  /*  New Commands                                                       */
  /* ------------------------------------------------------------------ */

  uname: () => ({
    type: 'output',
    content: 'moonsbow OS 6.8.0 x86_64 GNU/Linux',
  }),

  uptime: () => ({
    type: 'output',
    content: formatUptime(),
  }),

  who: () => ({
    type: 'output',
    content: `moonsbow   tty1   ${new Date().toUTCString()}`,
  }),

  echo: (args) => ({
    type: 'output',
    content: args.join(' '),
  }),

  cal: () => ({
    type: 'output',
    content: generateCal(),
  }),

  ps: () => ({
    type: 'output',
    content: `  PID TTY          TIME CMD\n    1 ?        00:00:01 systemd\n  215 tty1     00:00:00 bash\n  342 tty1     00:00:00 node\n  891 tty1     00:00:02 chrome\n 1023 ?        00:00:00 sshd\n 1456 tty1     00:00:00 vim\n 2100 ?        00:00:00 dockerd\n 2847 tty1     00:00:00 ps`,
  }),

  sudo: (args) => {
    if (args.length === 0) {
      return { type: 'error', content: 'sudo: no command specified' };
    }
    return {
      type: 'error',
      content: 'sudo: permission denied: you are not in the sudoers file. This incident will be reported.',
    };
  },

  cowsay: (args) => ({
    type: 'output',
    content: cowsayText(args.join(' ')),
  }),

  sl: () => ({
    type: 'output',
    content: slFrames(),
  }),

  fortune: () => ({
    type: 'output',
    content: FORTUNES[Math.floor(Math.random() * FORTUNES.length)],
  }),

  curl: (args) => {
    if (args.length === 0) {
      return {
        type: 'error',
        content: "curl: try 'curl --help' or 'curl --manual' for more information",
      };
    }
    const url = args[0];
    return {
      type: 'output',
      content: `* Connected to ${url} port 443\n* ALPN: curl offers h2,http/1.1\n> GET / HTTP/2\n> Host: ${url}\n> User-Agent: curl/8.5.0\n> Accept: */*\n> \n< HTTP/2 200\n< content-type: text/html; charset=utf-8\n< content-length: 1337\n< \n{ [1337 bytes data]\n######################################################################## 100.0%\n* Connection #0 to host ${url} left intact`,
    };
  },

  ssh: (args) => {
    const host = args[0];
    if (!host) {
      return { type: 'error', content: 'ssh: usage: ssh [user@]hostname [command]' };
    }
    const knownHosts = ['github.com', 'localhost', 'dev.moonsbow.com'];
    if (!knownHosts.includes(host)) {
      return { type: 'error', content: `ssh: Could not resolve hostname ${host}: Name or service not known` };
    }
    return {
      type: 'output',
      content: `Connecting to ${host}...\nConnection established.\nHandshake complete (ECDSA).\nAuthenticating...\nAuthenticated.\n\nWelcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0 x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/pro\n\n  System information as of ${new Date().toUTCString()}\n\n  System load:  0.52              Processes:           89\n  Usage of /:   34.2% of 50GB     Users logged in:     1\n  Memory usage: 42%               IPv4 address for eth0: 10.0.2.15\n  Swap usage:   0%\n\n0 updates can be applied immediately.\n\nLast login: ${new Date().toUTCString()} from 192.168.1.100`,
    };
  },

  top: () => ({
    type: 'output',
    content: `top - ${new Date().toLocaleTimeString()} up ${formatUptime().replace('up ', '').split(',')[0]},  3 users,  load average: 0.52, 0.58, 0.49\nTasks:  89 total,   1 running,  88 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  4.2 us,  2.1 sy,  0.0 ni, 93.2 id,  0.0 wa,  0.0 hi,  0.5 si,  0.0 st\nMiB Mem :   1024.0 total,    124.0 free,    456.0 used,    444.0 buff/cache\nMiB Swap:    512.0 total,    512.0 free,      0.0 used.    568.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n  342 moonsbow  20   0  612340  89012  23456 S   8.3   8.7   0:12.34 node\n  891 moonsbow  20   0 1245678 234567  45678 S   4.1  22.9   0:45.67 chrome\n 2100 root      20   0  456789  67890  12345 S   2.1   6.6   0:03.21 dockerd\n  215 moonsbow  20   0   23456   4567   1234 S   0.0   0.4   0:00.05 bash\n 1456 moonsbow  20   0   12345   3456    789 S   0.0   0.3   0:01.23 vim\n    1 root      20   0  167890  12345   6789 S   0.0   1.2   0:00.01 systemd\n 1023 root      20   0   34567   5678   2345 S   0.0   0.6   0:00.02 sshd`,
  }),

  man: (args) => {
    const cmd = args[0];
    if (!cmd) {
      return { type: 'error', content: 'man: what manual page do you want?' };
    }
    const entry = MAN_PAGES[cmd];
    if (!entry) {
      return { type: 'error', content: `No manual entry for ${cmd}` };
    }
    return {
      type: 'output',
      content: `${header(cmd.toUpperCase())}\n\nNAME\n    ${entry}\n\nSYNOPSIS\n    ${entry.split(' - ')[0]}\n\nDESCRIPTION\n    ${entry.split(' - ')[1] || 'No detailed description available.'}\n\n${'━'.repeat(70)}`,
    };
  },

  mkdir: (args) => {
    const dir = args[0];
    if (!dir) return { type: 'error', content: 'mkdir: missing operand' };
    return { type: 'error', content: `mkdir: cannot create directory '${dir}': Permission denied` };
  },

  rm: (args) => {
    const file = args[0];
    if (!file) return { type: 'error', content: 'rm: missing operand' };
    return { type: 'error', content: `rm: cannot remove '${file}': Permission denied` };
  },

  touch: (args) => {
    const file = args[0];
    if (!file) return { type: 'error', content: 'touch: missing file operand' };
    return { type: 'error', content: `touch: cannot touch '${file}': Permission denied` };
  },

  snake: () => ({
    type: 'navigate',
    content: 'Launching snake.exe...',
    navigateTo: '/snake',
  }),

  pong: () => ({
    type: 'navigate',
    content: 'Launching pong.exe...',
    navigateTo: '/pong',
  }),

  matrix: () => ({
    type: 'navigate',
    content: 'Entering the Matrix...',
    navigateTo: '/matrix',
  }),

  reboot: () => ({
    type: 'navigate',
    content: `[ OK ] Stopping target network
[ OK ] Unmounting remote filesystems
[ OK ] Stopping Network Manager
[ OK ] Stopping OpenBSD Secure Shell server
[ OK ] Stopping system logging service
[ OK ] Stopping cron daemon
[ OK ] Stopping target basic system
[ OK ] Stopping Remain After Exit service
[ OK ] Stopping D-Bus System Message Bus
[ OK ] Stopped target basic system
[ OK ] Stopped target paths
[ OK ] Stopped target slices
[ OK ] Stopped target sockets
[ OK ] Reached target shutdown
[ OK ] Rebooting...`,
    navigateTo: '/',
  }),

  shutdown: () => ({
    type: 'navigate',
    content: `[ OK ] Stopping target network
[ OK ] Unmounting remote filesystems
[ OK ] Stopping Network Manager
[ OK ] Stopping OpenBSD Secure Shell server
[ OK ] Stopping system logging service
[ OK ] Stopping cron daemon
[ OK ] Stopping target basic system
[ OK ] Reached target shutdown
[ OK ] Powering off...`,
    navigateTo: '/shutdown',
  }),

  hackerman: () => {
    const lines: string[] = [];
    const actions = ['SCANNING', 'BYPASSING', 'INJECTING', 'DECRYPTING', 'HANDSHAKING', 'UPLOADING'];
    const statuses = ['OK', 'WARN', 'OK', 'OK', 'OK'];
    for (let i = 0; i < 20; i++) {
      const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const port = Math.floor(Math.random() * 65535);
      const action = actions[Math.floor(Math.random() * actions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      lines.push(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${action} ${ip}:${port} ... ${status}`);
    }
    lines.push('');
    lines.push('██████████████████████████████████████████████████');
    lines.push('██                                              ██');
    lines.push('██         A C C E S S   G R A N T E D          ██');
    lines.push('██                                              ██');
    lines.push('██████████████████████████████████████████████████');
    return {
      type: 'output',
      content: lines.join('\n'),
    };
  },

  theme: (args) => {
    const available = ['green', 'amber', 'white', 'red', 'blue'];
    const t = args[0];
    if (!t) {
      return {
        type: 'output',
        content: `Available themes: ${available.join(', ')}
Usage: theme <name>`,
      };
    }
    if (!available.includes(t)) {
      return { type: 'error', content: `theme: '${t}' is not a valid theme. Available: ${available.join(', ')}` };
    }
    return {
      type: 'output',
      content: `Theme changed to: ${t}`,
      theme: t,
    };
  },
};
