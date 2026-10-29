import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  Video, 
  Layers, 
  Users, 
  FileText, 
  Volume2, 
  VolumeX, 
  Server, 
  Sun, 
  Moon, 
  LogOut, 
  UserCheck 
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  wsStatus, 
  activeAlertCount = 0, 
  audioEnabled, 
  setAudioEnabled, 
  theme, 
  setTheme,
  currentUser,
  onLogout
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeMs = String(now.getMilliseconds()).padStart(3, '0');
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + '.' + timeMs + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Video },
    { id: 'zones', label: 'Detection Zones', icon: Layers },
    { id: 'watchlist', label: 'Watchlist Manager', icon: Users },
    { id: 'events', label: 'Surveillance Logs', icon: FileText },
    { id: 'cameras', label: 'Camera Registry', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs font-sans transition-colors">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between gap-2">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                SPY-VISION <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">Node 04-Alpha</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Border Surveillance & Video Analytics Control Center
            </p>
          </div>
        </div>

        {/* Navigation Tabs (AI Simulator Removed) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 font-sans">
          
          {/* Real-time Alerts Counter Banner */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs ${
            activeAlertCount > 0 
              ? 'bg-rose-600 text-white animate-pulse' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{activeAlertCount} Active Alert{activeAlertCount === 1 ? '' : 's'}</span>
          </div>

          {/* Alert Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              audioEnabled
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Toggle Alert Audio Chime"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline text-xs">{audioEnabled ? 'Audio' : 'Muted'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Real-time Clock */}
          <div className="hidden xl:block text-right text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono">
            {timeStr}
          </div>

          {/* Authenticated Operator Badge & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {currentUser.full_name || currentUser.username}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentUser.badge_number || 'VERIFIED OPERATOR'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                title="Sign Out Verified Operator"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
