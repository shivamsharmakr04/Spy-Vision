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
      <div className="bg-[#fcfbf8] dark:bg-[#0e1c16] rounded-3xl border border-oatmeal-300 dark:border-pine-800 max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-oatmeal-200 dark:border-pine-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pine-800 text-white flex items-center justify-center shadow-xs">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-pine-950 dark:text-oatmeal-50">
                Direct Git Push & Repository Sync
              </h3>
              <p className="text-[11px] text-pine-700 dark:text-oatmeal-300">
                Deploy current codebase directly to GitHub origin/main
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-oatmeal-500 hover:text-pine-800 dark:hover:text-lilac-200 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts & Errors */}
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="p-3 rounded-xl bg-pine-50 dark:bg-pine-950/40 border border-pine-300 dark:border-pine-800 text-pine-900 dark:text-pine-200 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-pine-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Repository Telemetry Status */}
        <div className="p-3.5 rounded-2xl bg-oatmeal-100 dark:bg-[#08120d] border border-oatmeal-200 dark:border-pine-900 space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-oatmeal-600 dark:text-oatmeal-400 font-bold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-pine-700 dark:text-lilac-300" />
              Branch:
            </span>
            <span className="font-bold text-pine-950 dark:text-oatmeal-50 bg-oatmeal-200 dark:bg-pine-950 px-2 py-0.5 rounded border border-oatmeal-300 dark:border-pine-800">
              {gitStatus?.branch || 'main'}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-oatmeal-600 dark:text-oatmeal-400 font-bold">Remote Target:</span>
            <a 
              href="https://github.com/shivamsharmakr04/Spy-Vision" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pine-800 dark:text-lilac-300 font-bold hover:underline flex items-center gap-1 truncate max-w-[260px]"
            >
              shivamsharmakr04/Spy-Vision
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          {gitStatus?.last_commit?.hash && (
            <div className="pt-2 border-t border-oatmeal-200 dark:border-pine-900/80 font-mono text-[11px] text-oatmeal-700 dark:text-oatmeal-300">
              <span className="font-bold text-pine-900 dark:text-lilac-300">Latest Commit:</span>{' '}
              <span className="px-1.5 py-0.2 rounded bg-oatmeal-200 dark:bg-pine-950 text-pine-950 dark:text-oatmeal-100 font-bold">
                {gitStatus.last_commit.hash}
              </span>{' '}
              — {gitStatus.last_commit.message} ({gitStatus.last_commit.date})
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-oatmeal-600 dark:text-oatmeal-400">
              Working State: {gitStatus?.clean ? 'All files committed' : `${gitStatus?.changed_files_count || 0} modified/untracked files`}
            </span>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="text-[11px] font-bold text-lilac-700 dark:text-lilac-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Commit Message Input */}
        <div>
          <label className="block font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
            Commit & Deployment Message
          </label>
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="e.g. feat: update surveillance console and UI components"
            className="w-full px-3 py-2.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-pine-950 dark:text-oatmeal-50 font-medium focus:ring-2 focus:ring-lilac-500"
          />
        </div>

        {/* Push Action Button */}
        <div className="flex items-center gap-2 pt-2">
          <a
            href="https://github.com/shivamsharmakr04/Spy-Vision"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-oatmeal-100 dark:bg-pine-950 border border-oatmeal-300 dark:border-pine-800 text-pine-900 dark:text-oatmeal-200 hover:bg-oatmeal-200 dark:hover:bg-pine-900 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Open Repo
          </a>

          <button
            type="button"
            onClick={handlePush}
            disabled={pushing}
            className="flex-2 py-2.5 bg-pine-800 hover:bg-pine-700 text-white font-extrabold rounded-xl shadow-md ring-2 ring-lilac-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pushing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Pushing Code to GitHub...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-lilac-300" />
                Push Code to GitHub
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
