import React, { useEffect, useRef } from 'react';
import {
  Search,
  X,
  Code2,
  Monitor,
  Download,
  ChevronDown,
  RotateCcw,
  Star,
  Clock,
  ArrowDownAZ,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_SHORT_LABELS,
  CategoryName,
  OS_PLATFORMS,
  OSPlatform,
} from '../types/platform';

export type OSFilterValue = 'All' | 'Downloadable' | OSPlatform;

interface HeroSearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryName | 'All';
  onSelectCategory: (cat: CategoryName | 'All') => void;
  categoryCounts: Record<string, number>;
  totalProjects: number;
  filteredCount: number;
  darkMode: boolean;
  sortBy: 'stars' | 'featured' | 'name';
  onSortChange: (sort: 'stars' | 'featured' | 'name') => void;
  selectedLanguage: string;
  availableLanguages: string[];
  onSelectLanguage: (lang: string) => void;
  selectedOS: OSFilterValue;
  onSelectOS: (os: OSFilterValue) => void;
  onResetFilters: () => void;
}

const SORT_OPTIONS: {
  id: 'stars' | 'featured' | 'name';
  label: string;
  tip: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'stars',
    label: 'Stars',
    tip: 'Sort by most GitHub stars',
    icon: <Star className="w-3.5 h-3.5" />,
  },
  {
    id: 'featured',
    label: 'Recent',
    tip: 'Sort by recently featured',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    id: 'name',
    label: 'A–Z',
    tip: 'Sort alphabetically',
    icon: <ArrowDownAZ className="w-3.5 h-3.5" />,
  },
];

export const HeroSearchFilter: React.FC<HeroSearchFilterProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onSelectCategory,
    categoryCounts,
    totalProjects,
    filteredCount,
    darkMode,
    sortBy,
    onSortChange,
    selectedLanguage,
    availableLanguages,
    onSelectLanguage,
    selectedOS,
    onSelectOS,
    onResetFilters,
  }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === '/' &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          document.activeElement?.tagName !== 'SELECT'
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
          if (searchQuery) {
            onSearchChange('');
          } else {
            searchInputRef.current?.blur();
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, onSearchChange]);

    const hasActiveFilters =
      selectedCategory !== 'All' ||
      selectedLanguage !== 'All' ||
      selectedOS !== 'All' ||
      searchQuery.trim() !== '';

    const isDownloadableFilter = selectedOS === 'Downloadable';

    return (
      <section
        id="top"
        aria-label="Search and Category Filters"
        className={`transition-colors duration-200 ${
          darkMode ? 'glass-toolbar-dark' : 'glass-toolbar-light'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 space-y-3.5">
          {/* Row 1: Neumorphic Command Bar (Precision Search Input + Tactile Controls) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Precision Recessed Search Input Box */}
            <div
              onClick={() => searchInputRef.current?.focus()}
              className={`group relative flex-1 flex items-center min-w-0 rounded-xl px-4 h-11 cursor-text ${
                darkMode ? 'neu-input-dark' : 'neu-input-light'
              }`}
            >
              <Search className="w-4 h-4 shrink-0 pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search repositories, languages, OS, or #topics..."
                aria-label="Search open-source projects and daily news"
                className={`w-full h-full pl-3 pr-3 text-sm font-medium bg-transparent border-none focus:outline-none ${
                  darkMode
                    ? 'text-white placeholder:text-slate-400'
                    : 'text-slate-900 placeholder:text-slate-500'
                }`}
              />

              {hasActiveFilters && (
                <span className="hidden sm:inline-block mr-2.5 text-xs font-mono font-semibold tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0">
                  {filteredCount.toLocaleString()} / {totalProjects.toLocaleString()}
                </span>
              )}

              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearchChange('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  title="Clear search (Esc)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd
                  title="Press '/' to focus search"
                  className={`hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md pointer-events-none shrink-0 ${
                    darkMode
                      ? 'neu-btn-dark text-slate-300'
                      : 'neu-btn-light text-slate-600'
                  }`}
                >
                  /
                </kbd>
              )}
            </div>

            {/* Right Tactile Controls: 1-Click Apps Toggle + OS Filter + Language Filter + Sort + Reset */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
              {/* 1-Click Downloadable Apps Filter Toggle */}
              <button
                type="button"
                onClick={() => onSelectOS(isDownloadableFilter ? 'All' : 'Downloadable')}
                title="Show repositories with direct desktop/mobile installers"
                className={`inline-flex items-center gap-1.5 h-11 px-3.5 text-xs sm:text-[13px] font-semibold rounded-xl cursor-pointer whitespace-nowrap shrink-0 ${
                  isDownloadableFilter
                    ? darkMode
                      ? 'neu-pressed-dark'
                      : 'neu-pressed-light'
                    : darkMode
                    ? 'neu-btn-dark'
                    : 'neu-btn-light'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Apps</span>
              </button>

              {/* OS Platform Dropdown */}
              <div className="relative flex items-center">
                <Monitor
                  className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${
                    selectedOS !== 'All' && selectedOS !== 'Downloadable'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <select
                  aria-label="Filter by operating system"
                  value={selectedOS}
                  onChange={(e) => onSelectOS(e.target.value as OSFilterValue)}
                  className={`appearance-none h-11 pl-8 pr-8 text-xs sm:text-[13px] font-semibold rounded-xl cursor-pointer focus:outline-none ${
                    selectedOS !== 'All' && selectedOS !== 'Downloadable'
                      ? darkMode
                        ? 'neu-pressed-dark'
                        : 'neu-pressed-light'
                      : darkMode
                      ? 'neu-btn-dark'
                      : 'neu-btn-light'
                  }`}
                >
                  <option value="All">All OS</option>
                  <option value="Downloadable">Downloadable Apps</option>
                  {OS_PLATFORMS.map((os) => (
                    <option key={os} value={os}>
                      {os}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-500 dark:text-slate-400" />
              </div>

              {/* Language Filter Dropdown */}
              <div className="relative flex items-center">
                <Code2
                  className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${
                    selectedLanguage !== 'All'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <select
                  aria-label="Filter by language"
                  value={selectedLanguage}
                  onChange={(e) => onSelectLanguage(e.target.value)}
                  className={`appearance-none h-11 pl-8 pr-8 text-xs sm:text-[13px] font-semibold rounded-xl cursor-pointer focus:outline-none ${
                    selectedLanguage !== 'All'
                      ? darkMode
                        ? 'neu-pressed-dark'
                        : 'neu-pressed-light'
                      : darkMode
                      ? 'neu-btn-dark'
                      : 'neu-btn-light'
                  }`}
                >
                  <option value="All">All Languages</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-500 dark:text-slate-400" />
              </div>

              {/* Recessed Segmented Sort Switcher */}
              <div
                role="group"
                aria-label="Sort repositories"
                className={`inline-flex items-center p-1 h-11 rounded-xl ${
                  darkMode ? 'neu-inset-dark' : 'neu-inset-light'
                }`}
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSortChange(opt.id)}
                      title={opt.tip}
                      className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs sm:text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? darkMode
                            ? 'neu-btn-dark text-blue-400'
                            : 'neu-btn-light text-blue-600'
                          : darkMode
                          ? 'text-slate-300 hover:text-white'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reset Active Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  title="Reset search and filters"
                  className={`inline-flex items-center gap-1.5 h-11 px-3.5 text-xs sm:text-[13px] font-semibold rounded-xl cursor-pointer whitespace-nowrap shrink-0 ${
                    darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Tactile Neumorphic Category Filter Strip */}
          <div
            className="flex items-center gap-2 overflow-x-auto sm:flex-wrap py-1 text-xs sm:text-[13px] thin-scrollbar"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'All'}
              onClick={() => onSelectCategory('All')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'All'
                  ? darkMode
                    ? 'neu-pressed-dark'
                    : 'neu-pressed-light'
                  : darkMode
                  ? 'neu-btn-dark'
                  : 'neu-btn-light'
              }`}
            >
              <span>All</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                {totalProjects}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={cat}
                  onClick={() => onSelectCategory(active ? 'All' : cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? darkMode
                        ? 'neu-pressed-dark'
                        : 'neu-pressed-light'
                      : darkMode
                      ? 'neu-btn-dark'
                      : 'neu-btn-light'
                  }`}
                >
                  <span>{CATEGORY_SHORT_LABELS[cat]}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);
