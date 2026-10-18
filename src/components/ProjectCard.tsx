import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  Star,
  Terminal,
  Check,
  Globe,
  Download,
} from 'lucide-react';
import {
  CATEGORY_SHORT_LABELS,
  getProjectPlatformInfo,
  PlatformProject,
} from '../types/platform';
import { ProjectLogo } from './ProjectLogo';

interface ProjectCardProps {
  project: PlatformProject;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onTagClick: (tag: string) => void;
  onLanguageClick?: (lang: string) => void;
  onInspect: (project: PlatformProject) => void;
  darkMode: boolean;
  isSpotlightToday?: boolean;
  showCategoryLabel?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(
  ({
    project,
    isSaved,
    onToggleSave,
    onLanguageClick,
    onInspect,
    darkMode,
    showCategoryLabel = true,
  }) => {
    const [copiedCli, setCopiedCli] = useState(false);

    const platformInfo = getProjectPlatformInfo(project);
    const cleanGithubUrl = project.githubUrl.split('#')[0];
    const cleanWebsiteUrl = project.websiteUrl ? project.websiteUrl.split('#')[0] : '';
    const cliCommand = project.quickStart || `git clone ${cleanGithubUrl}.git`;

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInspect(project);
      }
    };

    return (
      <article
        tabIndex={0}
        role="button"
        aria-label={`Inspect ${project.name}`}
        onClick={() => onInspect(project)}
        onKeyDown={handleKeyDown}
        className={`group h-full flex flex-col justify-between rounded-2xl p-4 sm:p-5 cursor-pointer focus:outline-none ${
          darkMode ? 'glass-card-dark text-slate-100' : 'glass-card-light text-slate-900'
        }`}
      >
        <div>
          {/* Header: Recessed Neumorphic Logo + Name/Category + Stars + Tactile Bookmark */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <ProjectLogo project={project} size="md" darkMode={darkMode} />
              <div className="min-w-0">
                {showCategoryLabel && (
                  <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 leading-tight truncate mb-0.5">
                    {CATEGORY_SHORT_LABELS[project.category]}
                  </div>
                )}
                <h3
                  className={`font-display text-[15px] sm:text-base font-bold tracking-tight leading-snug truncate transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {project.name}
                </h3>
              </div>
            </div>

            <div
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {project.stars !== undefined && (
                <span
                  data-tooltip={`${project.stars.toLocaleString()} GitHub stars`}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold tabular-nums text-slate-800 dark:text-slate-100"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span>{(project.stars / 1000).toFixed(1)}k</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => onToggleSave(project.id)}
                data-tooltip={isSaved ? 'Remove bookmark' : 'Save repository'}
                aria-label={isSaved ? `Remove ${project.name} from saved` : `Save ${project.name}`}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isSaved
                    ? darkMode
                      ? 'neu-pressed-dark'
                      : 'neu-pressed-light'
                    : darkMode
                    ? 'neu-btn-dark text-slate-300'
                    : 'neu-btn-light text-slate-600'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* High-Legibility 2-Line Description */}
          <p
            className={`text-xs sm:text-[13px] leading-relaxed line-clamp-2 mb-4 ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            {project.description}
          </p>
        </div>

        {/* Footer: Language · Available OS on left, Tactile Micro-Buttons on right */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-2 text-xs font-mono pt-3 border-t border-slate-200/80 dark:border-white/[0.07]"
        >
          <div className="flex items-center gap-1.5 truncate min-w-0">
            {project.language && onLanguageClick ? (
              <button
                type="button"
                onClick={() => onLanguageClick(project.language!)}
                title={`Filter by ${project.language}`}
                className="font-semibold text-slate-800 dark:text-slate-100 hover:underline cursor-pointer shrink-0"
              >
                {project.language}
              </button>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-100 shrink-0">
                {project.language || 'OSS'}
              </span>
            )}

            <span aria-hidden="true" className="text-slate-400 dark:text-slate-500 shrink-0">
              ·
            </span>

            <span
              title={`Available OS: ${platformInfo.fullSummary}`}
              className="truncate font-medium text-slate-600 dark:text-slate-300"
            >
              {platformInfo.shortSummary}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 font-sans font-semibold">
            {platformInfo.isDownloadableApp && platformInfo.downloadUrl && (
              <a
                href={platformInfo.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-tooltip={`Download (${platformInfo.fullSummary})`}
                data-tooltip-pos="left"
                aria-label={`Download ${project.name}`}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] ${
                  darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                }`}
              >
                <Download className="w-3 h-3" />
                <span className="hidden xl:inline">Get</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyCli}
              data-tooltip={copiedCli ? 'Copied CLI!' : `Copy: ${cliCommand}`}
              data-tooltip-pos="left"
              aria-label="Copy CLI command"
              className={`p-1.5 rounded-lg cursor-pointer ${
                copiedCli
                  ? darkMode
                    ? 'neu-pressed-dark text-emerald-400'
                    : 'neu-pressed-light text-emerald-600'
                  : darkMode
                  ? 'neu-btn-dark'
                  : 'neu-btn-light'
              }`}
            >
              {copiedCli ? <Check className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
            </button>

            {cleanWebsiteUrl && cleanWebsiteUrl !== cleanGithubUrl && (
              <a
                href={cleanWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-tooltip="Official website"
                data-tooltip-pos="left"
                aria-label={`Open ${project.name} website`}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={cleanGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip="Open GitHub repository"
              data-tooltip-pos="left"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] ${
                darkMode ? 'neu-btn-dark' : 'neu-btn-light'
              }`}
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </article>
    );
  }
);
