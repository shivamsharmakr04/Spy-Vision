import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  User, 
  BadgeCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  IdCard, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Fingerprint
} from 'lucide-react';
import { api } from '../api/client';

export default function AuthPage({ onAuthSuccess, theme }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [role, setRole] = useState('OPERATOR');

  const handleQuickDemoFill = (type) => {
    setError('');
    setSuccessMsg('');
    if (type === 'register') {
      setIsRegistering(true);
      setUsername('operator_ravi');
      setPassword('BorderGuard@2026');
      setConfirmPassword('BorderGuard@2026');
      setFullName('Inspector Ravi Varma');
      setBadgeNumber('BSF-NORTH-409');
      setRole('SURVEILLANCE_OFFICER');
    } else {
      setIsRegistering(false);
      setUsername('operator_ravi');
      setPassword('BorderGuard@2026');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    if (isRegistering) {
      if (!fullName.trim()) {
        setError('Please enter operator full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const payload = {
          username: username.trim(),
          password,
          full_name: fullName.trim(),
          badge_number: badgeNumber.trim() || `BSF-OP-${Math.floor(1000 + Math.random() * 9000)}`,
          role: role || 'OPERATOR',
        };
        const res = await api.register(payload);
        setSuccessMsg('Operator account created & verified! Redirecting to Command Console...');
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } else {
        const res = await api.login({
          username: username.trim(),
          password,
        });
        setSuccessMsg('Operator verified. Authorizing access...');
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans ${
      theme === 'dark' ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        
        {/* Top Header Card */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-2 ring-4 ring-blue-500/20">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            SPY-VISION <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">IBVAP Core</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Intelligent Border Video Analytics & Perimeter Defense Platform
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURE VERIFIED OPERATOR GATEWAY
          </div>
        </div>

        {/* Auth Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950/80 m-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isRegistering
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Operator Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isRegistering
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              Create Operator Account
            </button>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
            
            {/* Notifications */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Registration Extra Fields */}
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Officer / Operator Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Commander Rajesh Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Badge / Security ID
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="e.g. BSF-OP-8820"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Clearance Designation
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OPERATOR">Surveillance Operator</option>
                      <option value="DUTY_OFFICER">Duty Station Officer</option>
                      <option value="COMMANDER">Sector Commander</option>
                      <option value="ANALYST">Threat & ANPR Analyst</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Username / Operator ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Operator Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. op_sharma"
                  autoComplete="username"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegistering ? 'Minimum 6 secure characters' : 'Enter security password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Register */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegistering ? (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  Register & Verify Operator ID
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Verify Credentials & Access Dashboard
                </>
              )}
            </button>

            {/* Security Verification Footnote */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                PBKDF2-SHA256 Encrypted Auth
              </span>
              <button
                type="button"
                onClick={() => handleQuickDemoFill(isRegistering ? 'register' : 'login')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Auto-Fill Test Operator
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-500 font-mono">
          Authorized Military & Border Police Personnel Only • IP & Session Logged
        </p>

      </div>
    </div>
  );
}

