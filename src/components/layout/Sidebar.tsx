import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, TrendingUp, Server, Globe, Users } from 'lucide-react';
import logo from '../../assets/logo.png';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/upcoming', label: 'Upcoming', icon: TrendingUp },
  { path: '/servers', label: 'Servers', icon: Server },
  { path: '/domains', label: 'Domains', icon: Globe },
  { path: '/team', label: 'Team', icon: Users },
];

export default function Sidebar() {

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Nirvi Track Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Nirvi Track</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Project Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          © 2025 Nirvi Track
        </div>
      </div>
    </motion.aside>
  );
}
