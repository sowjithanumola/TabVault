import React, { useState } from 'react';
import {
  Download,
  Upload,
  Cloud,
  Database,
  Trash2,
  CheckCircle2,
  FileCode,
  Shield,
  FileText,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Bookmark, Collection, StorageStats, CloudUser } from '../types';
import { exportToJson, exportToHtml, parseAndValidateJson } from '../utils/exportImport';

interface SettingsViewProps {
  user: CloudUser;
  bookmarks: Bookmark[];
  collections: Collection[];
  stats: StorageStats;
  onImportData: (newBookmarks: Bookmark[], newCollections: Collection[], replace: boolean) => void;
  onClearAllData: () => void;
  onSignOut: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onNavigate: (tab: 'privacy' | 'terms') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  bookmarks,
  collections,
  stats,
  onImportData,
  onClearAllData,
  onSignOut,
  onShowToast,
  onNavigate,
}) => {
  const [importReplace, setImportReplace] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportJson = () => {
    exportToJson(bookmarks, collections);
    onShowToast('success', 'TabVault backup downloaded as JSON.');
  };

  const handleExportHtml = () => {
    exportToHtml(bookmarks, collections);
    onShowToast('success', 'Bookmarks exported in Netscape HTML format.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseAndValidateJson(content);

      if (result.valid && result.data) {
        onImportData(result.data.bookmarks, result.data.collections, importReplace);
        onShowToast(
          'success',
          `Successfully imported ${result.data.bookmarks.length} bookmarks.`
        );
        setImportStatus(
          `Import complete: ${result.data.bookmarks.length} bookmarks loaded.`
        );
      } else {
        onShowToast('error', result.error || 'Failed to import file.');
        setImportStatus(`Import failed: ${result.error || 'Invalid file format'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formattedKb = (stats.storageSizeBytes / 1024).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100">Settings & Cloud Account</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your cloud profile, data backups, and account preferences.
        </p>
      </div>

      {/* Cloud Account Profile */}
      <section className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">Cloud Account Profile</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Active & Synced
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-lg font-bold shadow-md"
              style={{ backgroundColor: user.avatarColor || '#7c3aed' }}
            >
              {(user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">{user.name || 'Cloud User'}</div>
              <div className="text-xs font-mono text-slate-400">{user.email}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Account ID: <span className="font-mono">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Cloud Sync Active</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Bookmarks and collections automatically sync to your personal account
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Zero Mock Data</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Clean isolated account repository with your real bookmarks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Export & Backup */}
      <section className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2.5">
          <Download className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">Export & Backup Bookmarks</h2>
            <p className="text-xs text-slate-400">
              Download your complete bookmark library in JSON or standard browser HTML format.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                Full JSON Backup (.json)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Contains all bookmarks, collections, tags, notes, and metadata
              </div>
            </div>
            <Download className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
          </button>

          <button
            onClick={handleExportHtml}
            className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                Browser Netscape HTML (.html)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Compatible with Chrome, Safari, Firefox, Edge, and Arc
              </div>
            </div>
            <FileCode className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
          </button>
        </div>
      </section>

      {/* Import Bookmarks */}
      <section className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2.5">
          <Upload className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">Import Bookmarks</h2>
            <p className="text-xs text-slate-400">
              Upload a previously exported TabVault JSON backup file into your account.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replaceData"
              checked={importReplace}
              onChange={(e) => setImportReplace(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="replaceData" className="text-xs text-slate-300 cursor-pointer">
              Replace existing bookmarks and collections (uncheck to merge instead)
            </label>
          </div>

          <label className="block p-6 rounded-lg bg-slate-950 border border-dashed border-slate-700 hover:border-purple-500 text-center cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-200 block">
              Click to browse or drop JSON file
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Supports TabVault backup JSON
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importStatus && (
            <p className="text-xs text-purple-300 font-medium">{importStatus}</p>
          )}
        </div>
      </section>

      {/* Storage & Data Reset */}
      <section className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">Account Repository Footprint</h2>
            <p className="text-xs text-slate-400">
              Statistics and controls for your active Cloud Account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Total Bookmarks</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {stats.bookmarkCount}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Collections</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {stats.collectionCount}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Unique Tags</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {stats.tagCount}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Storage Footprint</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
              {formattedKb} KB
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete ALL bookmarks and collections from your Cloud Account? This cannot be undone.')) {
                onClearAllData();
                onShowToast('error', 'All bookmarks were cleared from your cloud account.');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Account Bookmarks</span>
          </button>
        </div>
      </section>

      {/* Legal & Policy Links */}
      <section className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Legal & Privacy Governance</h2>
          <p className="text-xs text-slate-400">
            Read our complete privacy statement and terms of service.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('privacy')}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => onNavigate('terms')}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms and Conditions</span>
          </button>
        </div>
      </section>
    </div>
  );
};
