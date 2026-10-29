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
  Github
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 dark:bg-[#0c1812]/95 backdrop-blur-md border-b border-oatmeal-300 dark:border-pine-800/80 shadow-xs font-sans transition-colors">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-pine-800 text-white flex items-center justify-center shadow-md shadow-pine-950/30 ring-2 ring-lilac-300/40 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0d1e16] dark:text-[#f5f1e8] flex items-center gap-1.5">
                  SPY-VISION
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-lilac-100 dark:bg-lilac-950/80 border border-lilac-300 dark:border-lilac-800 text-lilac-900 dark:text-lilac-200 font-bold font-mono">
                    DEFENSE-04
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-[#273e31] dark:text-oatmeal-300 font-semibold hidden xs:block">
                Border Surveillance & Video Analytics Console
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-oatmeal-200/70 dark:bg-[#07110c]/80 p-1.5 rounded-2xl border border-oatmeal-300 dark:border-pine-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pine-800 text-white shadow-sm font-extrabold scale-[1.02]'
                    : 'text-[#163e2a] dark:text-[#dceee3] hover:text-[#0d1e16] dark:hover:text-white hover:bg-white/80 dark:hover:bg-pine-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pine-700 dark:text-lilac-300'}`} />
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
              : 'bg-oatmeal-200/80 dark:bg-pine-950/80 text-[#163e2a] dark:text-oatmeal-200 border border-oatmeal-300 dark:border-pine-800'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{activeAlertCount} Alert{activeAlertCount === 1 ? '' : 's'}</span>
          </div>

          {/* Audio Chime Toggle in Soft Lilac */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              audioEnabled
                ? 'bg-lilac-100 dark:bg-lilac-950/60 border-lilac-300 dark:border-lilac-800 text-lilac-900 dark:text-lilac-200 hover:bg-lilac-200 dark:hover:bg-lilac-900/60'
                : 'bg-oatmeal-200/60 dark:bg-pine-950/60 border-oatmeal-300 dark:border-pine-800 text-oatmeal-600'
            }`}
            title={audioEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-lilac-800 dark:text-lilac-300" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* GitHub Repository Icon */}
          <a
            href="https://github.com/shivamsharmakr04/Spy-Vision"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-100 dark:bg-pine-950 text-[#163e2a] dark:text-oatmeal-200 hover:bg-pine-800 hover:text-white dark:hover:bg-pine-800 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
            title="GitHub Repository (shivamsharmakr04/Spy-Vision)"
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Light/Dark Theme Switcher */}
          <button
            onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-100 dark:bg-pine-950 text-[#163e2a] dark:text-oatmeal-200 hover:bg-oatmeal-200 dark:hover:bg-pine-900 cursor-pointer transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#163e2a]" />}
          </button>

          {/* Clock Widget in Oatmeal & Pine */}
          <div className="hidden xl:block text-right text-xs font-bold text-[#0d1e16] dark:text-oatmeal-200 bg-oatmeal-200/80 dark:bg-pine-950/80 px-3 py-1.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 font-mono">
            {timeStr}
          </div>

          {/* Verified Operator Profile Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-oatmeal-300 dark:border-pine-800">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-extrabold text-[#0d1e16] dark:text-oatmeal-50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pine-700 dark:text-pine-400" />
                  {currentUser.full_name || currentUser.username}
                </span>
                <span className="text-[10px] text-lilac-800 dark:text-lilac-300 font-mono font-bold">
                  {currentUser.badge_number || 'VERIFIED OPERATOR'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
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
            className="lg:hidden p-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-100 dark:bg-pine-950 text-[#0d1e16] dark:text-oatmeal-200 hover:bg-oatmeal-200 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-3 bg-oatmeal-50 dark:bg-[#0c1812] border-b border-oatmeal-300 dark:border-pine-800 space-y-1.5">
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
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-pine-800 text-white shadow-xs'
                    : 'text-[#0d1e16] dark:text-oatmeal-100 hover:bg-oatmeal-200 dark:hover:bg-pine-900/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
