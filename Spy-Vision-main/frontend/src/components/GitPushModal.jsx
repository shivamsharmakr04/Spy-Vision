import React, { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  RefreshCw,
  FileCode2
} from 'lucide-react';
import { api } from '../api/client';

export default function GitPushModal({ isOpen, onClose }) {
  const [gitStatus, setGitStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [commitMessage, setCommitMessage] = useState('feat: update surveillance console and UI components');

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getGitStatus();
      setGitStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve Git repository status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSuccessMsg('');
      setError('');
    }
  }, [isOpen]);

  const handlePush = async () => {
    setPushing(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.pushGitCode({ message: commitMessage });
      setSuccessMsg(`Successfully pushed to origin/${res.branch}! Commit: ${res.commit_hash || 'latest'}`);
      await fetchStatus();
    } catch (err) {
      setError(err.message || 'Git push encountered an error.');
    } finally {
      setPushing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Direct Git Push & Repository Sync
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Push current codebase directly to GitHub origin/main
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts & Errors */}
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Repository Telemetry Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Branch:
            </span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              {gitStatus?.branch || 'main'}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-bold">Remote Target:</span>
            <a 
              href="https://github.com/shivamsharmakr04/Spy-Vision" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 truncate max-w-[260px]"
            >
              shivamsharmakr04/Spy-Vision
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          {gitStatus?.last_commit?.hash && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Latest Commit:</span>{' '}
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">
                {gitStatus.last_commit.hash}
              </span>{' '}
              — {gitStatus.last_commit.message} ({gitStatus.last_commit.date})
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Working State: {gitStatus?.clean ? 'All files committed' : `${gitStatus?.changed_files_count || 0} modified/untracked files`}
            </span>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Commit Message Input */}
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
            Commit & Deployment Message
          </label>
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="e.g. feat: update surveillance console and UI components"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Push Action Button */}
        <div className="flex items-center gap-2 pt-2">
          <a
            href="https://github.com/shivamsharmakr04/Spy-Vision"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Open Repo
          </a>

          <button
            type="button"
            onClick={handlePush}
            disabled={pushing}
            className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {pushing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Pushing to GitHub...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-white" />
                Push Code to GitHub
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
