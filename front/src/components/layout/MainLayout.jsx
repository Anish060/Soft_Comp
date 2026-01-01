import React from 'react';
import { LayoutPanelLeft, Sparkles, History, Settings, LogOut } from 'lucide-react';

const MainLayout = ({ children, leftPane, rightPane }) => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] overflow-hidden">
      {/* Sidebar Navigation (Slim) */}
      <aside className="w-16 flex flex-col items-center py-6 bg-white border-r border-slate-200">
        <div className="mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Sparkles size={24} />
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-6">
          <NavItem icon={<LayoutPanelLeft size={22} />} active />
          <NavItem icon={<History size={22} />} />
          <NavItem icon={<Settings size={22} />} />
        </nav>
        
        <div className="mt-auto">
          <NavItem icon={<LogOut size={22} />} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Resume Preview */}
        <section className="flex-1 overflow-auto bg-slate-100/50 p-8 flex justify-center">
          <div className="w-full max-w-4xl">
            {leftPane}
          </div>
        </section>

        {/* Right Pane: AI Insights */}
        <section className="w-[450px] bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-2xl shadow-slate-200">
          {rightPane}
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ icon, active = false }) => (
  <button className={`p-3 rounded-xl transition-all duration-200 ${
    active 
      ? 'bg-blue-50 text-blue-600' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
  }`}>
    {icon}
  </button>
);

export default MainLayout;
