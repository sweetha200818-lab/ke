import React from 'react';
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Search,
  FileText,
  GitCompare,
  KeyRound,
  Library,
  Settings,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export type ActiveView =
  | 'welcome'
  | 'dashboard'
  | 'upload'
  | 'chat'
  | 'search'
  | 'summarize'
  | 'compare'
  | 'keywords'
  | 'library'
  | 'settings';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  paperCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  paperCount,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as ActiveView, label: 'Upload Papers', icon: Upload },
    { id: 'chat' as ActiveView, label: 'AI Research Chat', icon: MessageSquare },
    { id: 'search' as ActiveView, label: 'Semantic Search', icon: Search },
    { id: 'summarize' as ActiveView, label: 'Paper Summarizer', icon: FileText },
    { id: 'compare' as ActiveView, label: 'Paper Comparison', icon: GitCompare },
    { id: 'keywords' as ActiveView, label: 'Keyword Extraction', icon: KeyRound },
    { id: 'library' as ActiveView, label: 'Document Library', icon: Library, badge: paperCount },
    { id: 'settings' as ActiveView, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-18 px-5 flex items-center gap-3 border-b border-slate-800/80">
          <img
            src="/src/assets/images/academic_assistant_emblem_1793892553986.jpg"
            alt="Emblem"
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-indigo-500/30"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white whitespace-nowrap">
              AI Research Assistant
            </span>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              Academic Knowledge RAG
            </span>
          </div>
        </div>

        {/* Welcome Banner Action */}
        <div className="px-4 py-3">
          <button
            onClick={() => {
              setActiveView('welcome');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'welcome'
                ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 text-indigo-100 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Project Welcome Guide</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">Overview</span>
          </button>
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-mono tabular-nums ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>RAG Engine Active</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span>Gemini 3.8 Flash</span>
              <span>·</span>
              <span className="tabular-nums">768d Vector</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
