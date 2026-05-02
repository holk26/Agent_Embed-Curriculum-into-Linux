import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'home.md', num: '1' },
  { path: '/terminal', label: 'terminal.sh', num: '2' },
  { path: '/projects', label: 'projects/', num: '3' },
  { path: '/contact', label: 'contact.txt', num: '4' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[40px] bg-terminal-black-alt border-b border-terminal-gray-dark flex items-center px-0 select-none">
      <div className="flex items-center px-4 h-full shrink-0">
        <span className="text-terminal-green font-mono text-[13px] font-bold">
          moonsbow@dev:~$
        </span>
      </div>
      <div className="flex items-end h-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={
                'relative flex items-center h-[36px] px-4 font-mono text-[12px] whitespace-nowrap transition-colors duration-150 ' +
                (isActive
                  ? 'bg-terminal-black text-terminal-green border-t-2 border-terminal-green'
                  : 'text-terminal-gray hover:text-terminal-white')
              }
            >
              <span className="mr-1 opacity-60">[{tab.num}]</span>
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
