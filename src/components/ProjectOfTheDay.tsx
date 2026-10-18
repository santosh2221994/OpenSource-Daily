import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Terminal,
  Check,
  Star,
  RotateCcw,
  Download,
} from 'lucide-react';
import {
  CATEGORY_SHORT_LABELS,
  getProjectPlatformInfo,
  PlatformProject,
} from '../types/platform';
import { ProjectLogo } from './ProjectLogo';

interface ProjectOfTheDayProps {
  projects: PlatformProject[];
  activeDate: string; // YYYY-MM-DD
  todayDate: string; // YYYY-MM-DD
  onChangeDate: (newDate: string) => void;
  onInspect: (project: PlatformProject) => void;
  darkMode: boolean;
}

export function selectProjectForDate(
  projects: PlatformProject[],
  dateStr: string
): { project: PlatformProject; matchType: 'exact' | 'rotated' } {
  const exactMatch = projects.find((p) => p.featuredDate === dateStr);
  if (exactMatch) {
    return { project: exactMatch, matchType: 'exact' };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDays = Math.floor(Date.UTC(year || 2026, (month || 1) - 1, day || 1) / 86400000);
  const index = Math.abs(utcDays) % projects.length;
  return { project: projects[index], matchType: 'rotated' };
}

export const ProjectOfTheDay: React.FC<ProjectOfTheDayProps> = React.memo(
  ({ projects, activeDate, todayDate, onChangeDate, onInspect, darkMode }) => {
    const [copiedCli, setCopiedCli] = useState(false);

    const selected = useMemo(
      () => (projects.length > 0 ? selectProjectForDate(projects, activeDate) : null),
      [projects, activeDate]
    );

    if (!selected) return null;

    const { project } = selected;
    const platformInfo = getProjectPlatformInfo(project);
    const cleanGithubUrl = project.githubUrl.split('#')[0];
    const cliCommand = project.quickStart || `git clone ${cleanGithubUrl}.git`;

    const shiftDate = (deltaDays: number) => {
      const [y, m, d] = activeDate.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() + deltaDays);
      onChangeDate(dt.toISOString().split('T')[0]);
    };

    const handleCopyCli = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(cliCommand);
        setCopiedCli(true);
        setTimeout(() => setCopiedCli(false), 1500);
      } catch {
        // Ignore
      }
    };

    return (
      <div
        id="project-of-the-day"
        aria-label="Project of the Day Spotlight"
        className={`rounded-2xl px-5 py-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          darkMode ? 'glass-panel-dark text-slate-100' : 'glass-panel-light text-slate-900'
        }`}
      >
        {/* Left + Center: Date Navigation + Spotlight Project Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-[13px] font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
              Spotlight · {activeDate}
            </span>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                data-tooltip="Previous day"
                aria-label="Previous day"
                className={`p-1.5 rounded-lg cursor-pointer ${
                  darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftDate(1)}
                data-tooltip="Next day"
                aria-label="Next day"
                className={`p-1.5 rounded-lg cursor-pointer ${
                  darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {activeDate !== todayDate && (
                <button
                  type="button"
                  onClick={() => onChangeDate(todayDate)}
                  data-tooltip="Return to today"
                  aria-label="Return to today"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <span
            className="hidden sm:inline text-slate-300 dark:text-slate-700"
            aria-hidden="true"
          >
            |
          </span>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onInspect(project)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onInspect(project);
              }
            }}
            className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer group focus:outline-none"
          >
            <ProjectLogo project={project} size="md" darkMode={darkMode} />
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 min-w-0 flex-1">
              <span
                className={`font-display text-base font-bold tracking-tight whitespace-nowrap shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                  darkMode ? 'text-white' : 'text-slate-950'
                }`}
              >
                {project.name}
              </span>
              <span
                className={`text-xs sm:text-sm truncate ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                — {project.description}
              </span>
            </div>
          </div>
        </div>

        {/* Right: OS + Metadata + Tactile Neumorphic Quick Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-300/60 dark:border-white/[0.07]">
          <span
            title={`Available OS: ${platformInfo.fullSummary}`}
            className="hidden xl:inline font-semibold text-slate-700 dark:text-slate-200"
          >
            {platformInfo.shortSummary}
          </span>

          <span className="hidden xl:inline text-slate-400" aria-hidden="true">
            ·
          </span>

          <span className="font-semibold">{CATEGORY_SHORT_LABELS[project.category]}</span>

          {project.stars !== undefined && (
            <span
              data-tooltip={`${project.stars.toLocaleString()} GitHub stars`}
              className="inline-flex items-center gap-1 font-bold tabular-nums text-slate-900 dark:text-white"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{(project.stars / 1000).toFixed(1)}k</span>
            </span>
          )}

          {platformInfo.isDownloadableApp && platformInfo.downloadUrl && (
            <a
              href={platformInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip={`Download (${platformInfo.fullSummary})`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold ${
                darkMode
                  ? 'neu-btn-dark text-blue-400'
                  : 'neu-btn-light text-blue-600'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleCopyCli}
            data-tooltip={`Copy CLI: ${cliCommand}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold cursor-pointer ${
              copiedCli
                ? darkMode
                  ? 'neu-pressed-dark text-emerald-400'
                  : 'neu-pressed-light text-emerald-600'
                : darkMode
                ? 'neu-btn-dark'
                : 'neu-btn-light'
            }`}
          >
            {copiedCli ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI</span>
              </>
            )}
          </button>

          <a
            href={cleanGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-tooltip="Open GitHub repository"
            className="neu-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }
);
