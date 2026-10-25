import React from 'react';
import { Shield, ArrowLeft, Lock, Cloud, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vault</span>
        </button>
      </div>

      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 text-purple-400 mb-2">
          <Shield className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Privacy Governance</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-1">
          Effective Date: January 1, 2026. Last Updated: October 2026.
        </p>
      </div>

      {/* Summary Highlight Box */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Our Privacy Commitment: User-Isolated Cloud Account</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          TabVault provides personal bookmark management powered by your TabVault Cloud Account.
          Your saved URLs, tags, personal notes, and collections are associated exclusively with your authenticated
          account. We do not sell user data and do not track your browsing activity across the web.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Information We Store</h2>
          <p>
            When you create or sign in to your TabVault Cloud Account, data stored includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Bookmarked URLs, page titles, and optional descriptions or personal annotations.</li>
            <li>Custom collection categories and user-defined tags.</li>
            <li>Visit timestamps and counter metrics.</li>
            <li>Your account profile (display name and registered email address).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. Account Data Isolation</h2>
          <p>
            Every Cloud Account operates in an isolated environment. Your bookmarks and collections are indexed
            strictly under your private account ID. No cross-account data leakage is possible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. Telemetry and Analytics</h2>
          <p>
            TabVault does not include third-party advertising SDKs, tracking pixels, or session replay recorders.
            We do not monitor which links you open or how often you visit external sites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">4. Title Retrieval & External Requests</h2>
          <p>
            When you enter a URL, the app can query public metadata to retrieve the target page's title and description.
            This request only contains the destination URL and does not transmit your personal notes, identity, or cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">5. Data Portability and Erasure</h2>
          <p>
            You retain complete ownership of your data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Export your entire library at any time in structured JSON format.</li>
            <li>Export bookmarks in Netscape HTML format for importing into any web browser.</li>
            <li>Delete individual bookmarks, collections, or clear all account data via the Settings panel.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">6. External Links</h2>
          <p>
            Bookmarks point to external websites. When navigating to an external domain, your interaction is subject
            to the terms and privacy practices of that respective third-party destination.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">TabVault Cloud Account Architecture</span>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer"
        >
          Return to Bookmarks
        </button>
      </div>
    </div>
  );
};
