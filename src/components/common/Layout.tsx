import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Settings,
  Users,
  Wrench,
  Github
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Chat', href: '/', icon: MessageSquare },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Setup', href: '/setup', icon: Wrench },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-discord-dark">
      {/* Sidebar */}
      <div className="w-[72px] bg-discord-darkest flex flex-col items-center py-3 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                w-12 h-12 rounded-[24px] flex items-center justify-center
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-discord-blue rounded-[16px]'
                  : 'bg-discord-darker hover:bg-discord-blue hover:rounded-[16px]'
                }
              `}
              title={item.name}
            >
              <item.icon
                size={24}
                className={isActive ? 'text-white' : 'text-discord-gray group-hover:text-white'}
              />

              {/* Tooltip */}
              <span className="
                absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-md
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                whitespace-nowrap z-50
              ">
                {item.name}
              </span>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 w-1 h-8 bg-white rounded-r -translate-x-3" />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="flex-1" />

        {/* GitHub Link */}
        <a
          href="https://github.com/stevenyu113228/multi-agent-chat"
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-12 h-12 rounded-[24px] flex items-center justify-center
            bg-discord-darker hover:bg-discord-blue hover:rounded-[16px]
            transition-all duration-200 group relative
          "
          title="GitHub"
        >
          <Github size={24} className="text-discord-gray group-hover:text-white" />

          <span className="
            absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-md
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
            whitespace-nowrap z-50
          ">
            View on GitHub
          </span>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}