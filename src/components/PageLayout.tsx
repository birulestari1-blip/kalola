import Sidebar from '@/src/components/Sidebar';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageLayout({ children, title, description, actions }: PageLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon rounded-lg flex items-center justify-center text-dark font-bold">K.</div>
          <span className="text-xl font-bold tracking-tight">Kalola.</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
            {description && <p className="text-white/60 text-xs md:text-sm mt-1">{description}</p>}
          </div>
          {actions && <div className="flex gap-2 md:gap-3">{actions}</div>}
        </header>
        {children}
      </main>
    </div>
  );
}
