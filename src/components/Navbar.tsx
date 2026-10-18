import React from 'react';
import {
  Sun,
  Moon,
  Layers,
  Bookmark,
} from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  showingSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  onResetAndHome: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

function scrollToSection(id: string) {
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export const Navbar: React.FC<NavbarProps> = React.memo(
  ({
    savedCount,
    showingSavedOnly,
    onToggleSavedOnly,
    onResetAndHome,
    darkMode,
    onToggleDarkMode,
  }) => {
    return (
      <header
        className={`sticky top-0 z-30 transition-colors duration-200 ${
          darkMode ? 'glass-header-dark text-white' : 'glass-header-light text-slate-950'
        }`}
      >
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 h-15">
          {/* Zone 1: Brand Wordmark with Tactile Neumorphic Emblem */}
          <button
            type="button"
            onClick={() => {
              onResetAndHome();
              scrollToSection('top');
            }}
            data-tooltip="Reset filters & return to top"
            data-tooltip-pos="bottom"
            className={`group inline-flex items-center gap-2.5 font-display text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer ${
              darkMode ? 'text-white' : 'text-slate-950'
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                darkMode
                  ? 'neu-btn-dark text-blue-400'
                  : 'neu-btn-light text-blue-600'
              }`}
            >
              <Layers className="w-4 h-4" />
            </span>
            <span>OpenSource Daily</span>
          </button>

          {/* Zone 2: Clean Single-Line Text Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden sm:flex items-center gap-8 text-xs sm:text-sm font-semibold h-full"
          >
            <button
              type="button"
              onClick={() => {
                if (showingSavedOnly) onToggleSavedOnly();
                scrollToSection('directory');
              }}
              className={`relative h-full inline-flex items-center whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                !showingSavedOnly
                  ? darkMode
                    ? 'text-white font-bold'
                    : 'text-slate-950 font-bold'
                  : darkMode
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>Directory</span>
              {!showingSavedOnly && (
                <span
                  className={`absolute bottom-0 inset-x-0 h-0.5 rounded-full ${
                    darkMode ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('project-of-the-day')}
              className={`h-full inline-flex items-center whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                darkMode
                  ? 'text-slate-200 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>Spotlight</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('live-news')}
              className={`h-full inline-flex items-center whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                darkMode
                  ? 'text-slate-200 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>Pulse</span>
            </button>

            <button
              type="button"
              onClick={onToggleSavedOnly}
              className={`relative h-full inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                showingSavedOnly
                  ? darkMode
                    ? 'text-blue-400 font-bold'
                    : 'text-blue-600 font-bold'
                  : darkMode
                  ? 'text-slate-200 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={showingSavedOnly ? 'currentColor' : 'none'}
              />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="font-mono tabular-nums text-xs font-bold">
                  · {savedCount}
                </span>
              )}
              {showingSavedOnly && (
                <span
                  className={`absolute bottom-0 inset-x-0 h-0.5 rounded-full ${
                    darkMode ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                />
              )}
            </button>
          </nav>

          {/* Zone 3: Minimal Neumorphic Utility Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleSavedOnly}
              aria-label="Toggle saved repositories"
              className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                showingSavedOnly
                  ? darkMode
                    ? 'neu-pressed-dark'
                    : 'neu-pressed-light'
                  : darkMode
                  ? 'neu-btn-dark'
                  : 'neu-btn-light'
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={showingSavedOnly ? 'currentColor' : 'none'}
              />
              <span className="font-mono tabular-nums">{savedCount}</span>
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              data-tooltip={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              data-tooltip-pos="left"
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                darkMode ? 'neu-btn-dark' : 'neu-btn-light'
              }`}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-800" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  }
);
