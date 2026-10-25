import React from 'react';
import { Bookmark, Plus, Menu, X, LogOut, Cloud, User as UserIcon } from 'lucide-react';
import { ActiveTab, CloudUser } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewBookmark: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  bookmarkCount: number;
  user?: CloudUser | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewBookmark,
  mobileMenuOpen,
  onToggleMobileMenu,
  bookmarkCount,
  user,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single wordmark with icon */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('vault')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-md cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
                <Bookmark className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                TabVault
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onSelectTab('vault')}
              className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
                activeTab === 'vault' ? 'text-white border-b-2 border-purple-500 pb-0.5' : 'text-slate-400'
              }`}
            >
              Vault
            </button>
            <button
              onClick={() => onSelectTab('collections')}
              className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
                activeTab === 'collections' ? 'text-white border-b-2 border-purple-500 pb-0.5' : 'text-slate-400'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => onSelectTab('tags')}
              className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
                activeTab === 'tags' ? 'text-white border-b-2 border-purple-500 pb-0.5' : 'text-slate-400'
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => onSelectTab('settings')}
              className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
                activeTab === 'settings' ? 'text-white border-b-2 border-purple-500 pb-0.5' : 'text-slate-400'
              }`}
            >
              Settings & Backup
            </button>
            <button
              onClick={() => onSelectTab('privacy')}
              className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
                activeTab === 'privacy' ? 'text-white border-b-2 border-purple-500 pb-0.5' : 'text-slate-400'
              }`}
            >
              Privacy Policy
            </button>
          </nav>

          {/* Zone 3: 1 primary action + User profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewBookmark}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-lg transition-colors whitespace-nowrap shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Bookmark</span>
            </button>

            {user && (
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div
                  className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: user.avatarColor || '#7c3aed' }}
                  title={user.name || user.email}
                >
                  {(user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase()}
                </div>

                <div className="text-left hidden lg:block max-w-[130px]">
                  <div className="text-xs font-semibold text-slate-200 truncate leading-tight">
                    {user.name || 'Cloud User'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {user.email}
                  </div>
                </div>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-4 space-y-1">
          {user && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-md text-white flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: user.avatarColor || '#7c3aed' }}
                >
                  {(user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">{user.email}</div>
                </div>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer ml-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => {
              onSelectTab('vault');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'vault' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Vault ({bookmarkCount})
          </button>
          <button
            onClick={() => {
              onSelectTab('collections');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'collections' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => {
              onSelectTab('tags');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'tags' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => {
              onSelectTab('settings');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'settings' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Settings & Backup
          </button>
          <button
            onClick={() => {
              onSelectTab('privacy');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'privacy' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              onSelectTab('terms');
              onToggleMobileMenu();
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === 'terms' ? 'bg-purple-950/60 text-purple-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Terms & Conditions
          </button>
        </div>
      )}
    </header>
  );
};
