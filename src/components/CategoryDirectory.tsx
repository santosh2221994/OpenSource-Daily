import React, { useState, useEffect } from 'react';
import { CategoryName, PlatformProject } from '../types/platform';
import { ProjectCard } from './ProjectCard';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { OSFilterValue } from './HeroSearchFilter';

interface CategoryDirectoryProps {
  projects: PlatformProject[];
  selectedCategory: CategoryName | 'All';
  searchQuery: string;
  selectedLanguage: string;
  selectedOS: OSFilterValue;
  savedIdSet: ReadonlySet<string>;
  onToggleSave: (id: string) => void;
  onTagClick: (tag: string) => void;
  onLanguageClick: (lang: string) => void;
  onInspect: (project: PlatformProject) => void;
  onResetFilters: () => void;
  darkMode: boolean;
  spotlightProjectId?: string;
  showingSavedOnly: boolean;
}

const GRID_STEP = 36;

export const CategoryDirectory: React.FC<CategoryDirectoryProps> = React.memo(
  ({
    projects,
    selectedCategory,
    searchQuery,
    selectedLanguage,
    selectedOS,
    savedIdSet,
    onToggleSave,
    onTagClick,
    onLanguageClick,
    onInspect,
    onResetFilters,
    darkMode,
    spotlightProjectId,
    showingSavedOnly,
  }) => {
    const [visibleCount, setVisibleCount] = useState<number>(GRID_STEP);

    useEffect(() => {
      setVisibleCount(GRID_STEP);
    }, [selectedCategory, searchQuery, selectedLanguage, selectedOS, showingSavedOnly]);

    const hasActiveFilters =
      selectedCategory !== 'All' ||
      searchQuery.trim() !== '' ||
      selectedLanguage !== 'All' ||
      selectedOS !== 'All' ||
      showingSavedOnly;

    if (projects.length === 0) {
      return (
        <div
          id="directory"
          aria-label="Project Directory Empty State"
          className={`rounded-2xl p-10 text-center ${
            darkMode ? 'glass-panel-dark text-white' : 'glass-panel-light text-slate-900'
          }`}
        >
          <h2
            className={`font-display text-base font-bold mb-1.5 ${
              darkMode ? 'text-white' : 'text-slate-950'
            }`}
          >
            No matching repositories found
          </h2>
          <p
            className={`text-xs sm:text-sm font-medium max-w-sm mx-auto mb-5 ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Try clearing your search or category filter to browse all indexed libraries.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="neu-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      );
    }

    const visibleProjects = projects.slice(0, visibleCount);
    const hasMore = visibleCount < projects.length;

    const headingLabel = showingSavedOnly
      ? 'Saved Repositories'
      : selectedCategory !== 'All'
      ? selectedCategory
      : 'Directory';

    const activeFilterParts: string[] = [];
    if (selectedOS !== 'All') {
      activeFilterParts.push(selectedOS === 'Downloadable' ? 'Downloadable Apps' : selectedOS);
    }
    if (selectedLanguage !== 'All') activeFilterParts.push(selectedLanguage);
    if (searchQuery.trim()) activeFilterParts.push(`"${searchQuery.trim()}"`);

    return (
      <div id="directory">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0">
            <h2
              className={`font-display text-base sm:text-lg font-bold tracking-tight truncate ${
                darkMode ? 'text-white' : 'text-slate-950'
              }`}
            >
              {headingLabel}
            </h2>
            {activeFilterParts.length > 0 && (
              <span
                className={`text-xs sm:text-sm font-mono font-bold ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                · {activeFilterParts.join(' · ')}
              </span>
            )}
            <span
              className={`text-xs sm:text-sm font-mono font-bold tabular-nums shrink-0 ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              · {projects.length.toLocaleString()}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer shrink-0 ${
                darkMode ? 'neu-btn-dark' : 'neu-btn-light'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSaved={savedIdSet.has(project.id)}
              onToggleSave={onToggleSave}
              onTagClick={onTagClick}
              onLanguageClick={onLanguageClick}
              onInspect={onInspect}
              darkMode={darkMode}
              isSpotlightToday={project.id === spotlightProjectId}
              showCategoryLabel={selectedCategory === 'All'}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + GRID_STEP)}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl cursor-pointer ${
                darkMode ? 'neu-btn-dark' : 'neu-btn-light'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
              <span>
                Show More ({Math.min(GRID_STEP, projects.length - visibleCount)} of{' '}
                {(projects.length - visibleCount).toLocaleString()} remaining)
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }
);
