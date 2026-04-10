import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <AdminSidebar />
      
      <main className="pl-64 min-h-screen relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto p-8 relative z-10">
          <header className="mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{title}</h1>
            {description && <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{description}</p>}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
