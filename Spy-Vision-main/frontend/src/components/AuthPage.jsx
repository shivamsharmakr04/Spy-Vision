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
      theme === 'dark' ? 'bg-[#0c1511] text-oatmeal-50' : 'bg-[#f5f1e8] text-oatmeal-950'
    }`}>
      {/* Background Matrix in Pine */}
      <div className="absolute inset-0 bg-[radial-gradient(#296f4b18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        
        {/* Top Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pine-800 text-white shadow-xl shadow-pine-900/30 mb-2 ring-4 ring-lilac-300/40">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-pine-950 dark:text-oatmeal-50 flex items-center justify-center gap-2">
            SPY-VISION <span className="text-xs px-2.5 py-0.5 rounded-full bg-lilac-100 dark:bg-lilac-950 text-lilac-800 dark:text-lilac-200 font-bold border border-lilac-300 dark:border-lilac-800">Defense Node</span>
          </h1>
          <p className="text-xs text-pine-800/80 dark:text-oatmeal-300 font-medium">
            Border Video Analytics & Operator Control Center
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-pine-100 dark:bg-pine-950/60 text-pine-900 dark:text-pine-200 border border-pine-300 dark:border-pine-800">
            <ShieldCheck className="w-3.5 h-3.5 text-pine-700 dark:text-pine-300" />
            SECURE VERIFIED ACCESS GATEWAY
          </div>
        </div>

        {/* Auth Main Card */}
        <div className="bg-[#fcfbf8] dark:bg-[#0e1c16] border border-oatmeal-300/80 dark:border-pine-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-oatmeal-200/60 dark:bg-[#07110c] m-3 rounded-2xl border border-oatmeal-300 dark:border-pine-800">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isRegistering
                  ? 'bg-pine-800 text-white shadow-sm'
                  : 'text-oatmeal-800 dark:text-oatmeal-300 hover:text-pine-800 dark:hover:text-white'
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
                  ? 'bg-pine-800 text-white shadow-sm'
                  : 'text-oatmeal-800 dark:text-oatmeal-300 hover:text-pine-800 dark:hover:text-white'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              Create Operator ID
            </button>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
            
            {/* Notifications */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div role="status" className="p-3 rounded-xl bg-pine-50 dark:bg-pine-950/40 border border-pine-300 dark:border-pine-800 text-pine-900 dark:text-pine-200 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-pine-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Registration Extra Fields */}
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                    Officer / Operator Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-oatmeal-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Commander Rajesh Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                      Badge / Security ID
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-oatmeal-500" />
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="e.g. BSF-OP-8820"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                      Clearance Designation
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500 cursor-pointer"
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
              <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                Operator Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3.5 top-3 w-4 h-4 text-oatmeal-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. op_sharma"
                  autoComplete="username"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-oatmeal-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegistering ? 'Minimum 6 secure characters' : 'Enter security password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-oatmeal-500 hover:text-pine-800 dark:hover:text-lilac-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Register */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-oatmeal-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-xs font-semibold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button in Pine Green */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pine-800 hover:bg-pine-700 text-white font-extrabold text-xs rounded-xl shadow-md ring-2 ring-lilac-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegistering ? (
                <>
                  <BadgeCheck className="w-4 h-4 text-lilac-300" />
                  Register & Verify Operator ID
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-lilac-300" />
                  Verify Credentials & Access Dashboard
                </>
              )}
            </button>

            {/* Security Verification Footnote in Soft Lilac & Pine */}
            <div className="p-3 rounded-xl bg-oatmeal-100/90 dark:bg-[#08120d] border border-oatmeal-300 dark:border-pine-800 flex items-center justify-between text-[11px] text-oatmeal-800 dark:text-oatmeal-300">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-pine-700 dark:text-pine-400" />
                PBKDF2-SHA256 Encrypted Auth
              </span>
              <button
                type="button"
                onClick={() => handleQuickDemoFill(isRegistering ? 'register' : 'login')}
                className="text-lilac-700 dark:text-lilac-300 hover:underline font-bold cursor-pointer"
              >
                Auto-Fill Test Operator
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-oatmeal-600 dark:text-oatmeal-400 font-mono">
          Authorized Military & Border Police Personnel Only • IP & Session Logged
        </p>

      </div>
    </div>
  );
}
