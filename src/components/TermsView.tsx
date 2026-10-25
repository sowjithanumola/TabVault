import React from 'react';
import { FileText, ArrowLeft, Shield } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
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
          <FileText className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Legal Terms</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Terms and Conditions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Effective Date: January 1, 2026. Version 1.2.
        </p>
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Notice Regarding Cloud Account Storage</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          TabVault syncs your bookmarks and collections to your private Cloud Account.
          You may export local JSON or Netscape HTML backups at any time from Settings.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Acceptance of Terms</h2>
          <p>
            By accessing TabVault and registering or signing in to a Cloud Account, you agree to be bound by these
            Terms and Conditions. If you do not agree to these terms, please discontinue using the application and sign out.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. Software License and Permitted Use</h2>
          <p>
            TabVault is made available for personal, educational, and organizational productivity purposes.
            You are granted a non-exclusive, worldwide, royalty-free license to use the application interface
            to organize your personal bookmarks, URLs, tags, and research materials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. User Responsibility for Content</h2>
          <p>
            You retain sole responsibility for the URLs, links, notes, and content you save within TabVault.
            You agree not to use TabVault to store or organize URLs that facilitate unlawful activities,
            malicious code distribution, or copyright infringement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">4. Third-Party Links & Services</h2>
          <p>
            TabVault displays bookmarks pointing to third-party web pages. TabVault does not control,
            endorse, or verify the safety, security, or accuracy of third-party domains. When you click an
            outbound link, you do so entirely at your own risk.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">5. Disclaimer of Warranties</h2>
          <p>
            TabVault is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind,
            either express or implied. We recommend regularly downloading full JSON backups of your important bookmarks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, in no event shall the creators or contributors
            of TabVault be liable for any direct, indirect, incidental, special, consequential, or punitive damages,
            including but not limited to loss of data or business interruption arising out of your use of this software.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">7. Modifications to the Terms</h2>
          <p>
            We reserve the right to revise these Terms and Conditions at any time. Any changes will be posted
            directly within this application. Continued use of TabVault following any changes signifies your
            acceptance of the revised terms.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">TabVault Terms of Service</span>
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
