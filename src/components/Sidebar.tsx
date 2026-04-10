import { 
  Home, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  TrendingUp, 
  Lock, 
  Bot, 
  FileText, 
  User, 
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { NavLink, Link } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/lib/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sidebarItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Dompet', path: '/dompet' },
  { icon: ArrowLeftRight, label: 'Trans', path: '/trans' },
  { icon: PieChart, label: 'Budget', path: '/budget' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: TrendingUp, label: 'Aset', path: '/aset' },
  { icon: Lock, label: 'Utang', path: '/utang' },
  { icon: Lock, label: 'Investasi', path: '/investasi' },
  { icon: Bot, label: 'AI Advisor', path: '/ai-advisor' },
  { icon: FileText, label: 'Laporan', path: '/laporan' },
  { icon: User, label: 'Profil', path: '/profil' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin, signOut } = useAuth();
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white flex flex-col p-4 border-r border-white/10 shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between mb-8 px-2 shrink-0">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 bg-neon rounded-lg flex items-center justify-center text-dark font-black">K.</div>
          <span className="text-xl font-bold tracking-tight">Kalola.</span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
              isActive ? "bg-neon text-dark" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive ? "text-dark" : "text-white/40 group-hover:text-white")} />
                <span className="flex-1 text-left">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-500/10 mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
