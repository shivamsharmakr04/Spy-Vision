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
  Menu,
  X,
  Radio,
  Github,
  UploadCloud
} from 'lucide-react';
import GitPushModal from './GitPushModal';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gitModalOpen, setGitModalOpen] = useState(false);

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
    { id: 'watchlist', label: 'Watchlist', icon: Users },
    { id: 'events', label: 'Surveillance Logs', icon: FileText },
    { id: 'cameras', label: 'Cameras', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs font-sans transition-colors">
      {/* Top Bar Container */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm shadow-emerald-950/20 ring-2 ring-emerald-400/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  SPY-VISION
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                    DEFENSE-04
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold hidden xs:block">
                Border Surveillance & Video Analytics Console
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950/70 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2 font-sans">
          
          {/* Active Alerts Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeAlertCount > 0 
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 animate-pulse' 
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{activeAlertCount} Alert{activeAlertCount === 1 ? '' : 's'}</span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
              audioEnabled
                ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100'
                : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-200'
            }`}
            title={audioEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Git Sync & Direct Push Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setGitModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95"
            title="Git Push & Sync Repository"
            aria-label="Direct Git Push to GitHub"
          >
            <Github className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px] font-bold font-mono">Push</span>
          </button>

          {/* Light/Dark Theme Switcher */}
          <button
            onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* High-Contrast Clock Widget */}
          <div className="hidden xl:block text-right text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
            {timeStr}
          </div>

          {/* Verified Operator Profile Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {currentUser.full_name || currentUser.username}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                  {currentUser.badge_number || 'VERIFIED OPERATOR'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                title="Sign Out Verified Operator"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}

          {/* Mobile Navigation Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-1.5 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white font-extrabold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Direct Git Push Modal */}
      <GitPushModal 
        isOpen={gitModalOpen} 
        onClose={() => setGitModalOpen(false)} 
      />
    </header>
  );
}
