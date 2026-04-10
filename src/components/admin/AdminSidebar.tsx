import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  BarChart3,
  Bell
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/lib/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Pengguna', path: '/admin/users' },
  { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Bell, label: 'Broadcast', path: '/admin/broadcast' },
  { icon: Settings, label: 'System Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="w-64 h-screen bg-dark/50 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* Admin Branding */}
      <div className="p-8">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight group-hover:text-indigo-400 transition-colors">KALOLA</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-indigo-400")} />
                <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-2">
        <Link 
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <LayoutDashboard className="w-4 h-4" />
          Back to User App
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
