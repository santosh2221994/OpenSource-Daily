import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Plus,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import {
  CategoryName,
  NewsSourceId,
  PlatformProject,
  ScrapedNewsItem,
} from '../types/platform';

interface LiveNewsSidebarProps {
  items: ScrapedNewsItem[];
  projects: PlatformProject[];
  lastScrapedAt: string;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  selectedCategory: CategoryName | 'All';
  searchQuery: string;
  onPromoteToDirectory: (item: ScrapedNewsItem) => void;
  darkMode: boolean;
}

type SourceTab = 'all' | NewsSourceId;

const SOURCE_TABS: { id: SourceTab; label: string; tip: string }[] = [
  { id: 'all', label: 'All', tip: 'All community sources' },
  { id: 'github', label: 'GitHub', tip: 'GitHub Trending repositories' },
  { id: 'hackernews', label: 'HN', tip: 'Hacker News Show HN & stories' },
  { id: 'reddit', label: 'Reddit', tip: 'r/opensource & r/selfhosted' },
  { id: 'lobsters', label: 'Lobsters', tip: 'Lobste.rs engineering stories' },
  { id: 'devto', label: 'Dev.to', tip: 'Dev.to open-source articles' },
];

function formatRelativeTime(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return 'today';
  const diffMinutes = Math.max(1, Math.floor((Date.now() - parsed) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export const LiveNewsSidebar: React.FC<LiveNewsSidebarProps> = React.memo(
  ({
    items,
    projects,
    isLoading,
    isRefreshing,
    onRefresh,
    selectedCategory,
    searchQuery,
    onPromoteToDirectory,
    darkMode,
  }) => {
    const [activeSource, setActiveSource] = useState<SourceTab>('all');

    const indexedUrls = useMemo(() => {
      return new Set(
        projects.map((p) => p.githubUrl.split('#')[0].toLowerCase().replace(/\/$/, ''))
      );
    }, [projects]);

    const filteredNews = useMemo(() => {
      const q = searchQuery.trim().toLowerCase().replace(/^#/, '');

      return items
        .filter((item) => {
          if (activeSource !== 'all' && item.source !== activeSource) return false;
          if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
          if (!q) return true;

          return (
            item.title.toLowerCase().includes(q) ||
            (item.summary || '').toLowerCase().includes(q) ||
            item.sourceLabel.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => b.points - a.points);
    }, [items, activeSource, selectedCategory, searchQuery]);

    return (
      <aside
        id="live-news"
        aria-label="Daily Open-Source News"
        className={`rounded-2xl p-5 lg:sticky lg:top-20 transition-all ${
          darkMode ? 'glass-panel-dark text-white' : 'glass-panel-light text-slate-950'
        }`}
      >
        {/* Clean Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-base sm:text-lg font-bold tracking-tight">
              Daily Pulse
            </h2>
            <span
              className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              · {filteredNews.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-tooltip="Refresh live stories"
            data-tooltip-pos="left"
            aria-label="Refresh news"
            className={`p-2 rounded-xl cursor-pointer disabled:opacity-50 ${
              darkMode ? 'neu-btn-dark' : 'neu-btn-light'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Recessed Neumorphic Source Filter Strip */}
        <div
          className={`flex items-center gap-1 overflow-x-auto p-1 mb-3.5 rounded-xl thin-scrollbar ${
            darkMode ? 'neu-inset-dark' : 'neu-inset-light'
          }`}
          role="tablist"
        >
          {SOURCE_TABS.map((tab) => {
            const active = activeSource === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={tab.tip}
                onClick={() => setActiveSource(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? darkMode
                      ? 'neu-btn-dark text-blue-400'
                      : 'neu-btn-light text-blue-600'
                    : darkMode
                    ? 'text-slate-200 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Minimal Feed List */}
        {isLoading ? (
          <div className="space-y-3 py-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`rounded-xl h-16 animate-pulse ${
                  darkMode ? 'neu-inset-dark' : 'neu-inset-light'
                }`}
              />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div
            className={`py-10 text-center text-xs sm:text-sm font-medium ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            No stories match this filter.
          </div>
        ) : (
          <div
            className={`divide-y max-h-[680px] overflow-y-auto pr-1 thin-scrollbar ${
              darkMode ? 'divide-white/10' : 'divide-slate-300/75'
            }`}
          >
            {filteredNews.map((item) => {
              const cleanItemUrl = item.url.split('#')[0];
              const cleanDiscussionUrl = item.discussionUrl ? item.discussionUrl.split('#')[0] : '';
              const isAlreadyIndexed = indexedUrls.has(
                cleanItemUrl.toLowerCase().replace(/\/$/, '')
              );

              return (
                <article key={item.id} className="py-3.5 first:pt-1.5 last:pb-1">
                  <a
                    href={cleanItemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-start justify-between gap-2 text-[13px] sm:text-sm font-bold leading-snug transition-colors mb-2 ${
                      darkMode
                        ? 'text-white hover:text-blue-400'
                        : 'text-slate-950 hover:text-blue-600'
                    }`}
                  >
                    <span>{item.title}</span>
                    <ArrowUpRight
                      className={`w-4 h-4 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity mt-0.5 ${
                        darkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    />
                  </a>

                  <div
                    className={`flex items-center justify-between gap-2 text-xs font-mono tabular-nums ${
                      darkMode ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold">{item.sourceLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold">
                        {item.source === 'github'
                          ? `★ ${(item.points / 1000).toFixed(1)}k`
                          : `▲ ${item.points}`}
                      </span>
                      {item.commentsCount > 0 && cleanDiscussionUrl && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a
                            href={cleanDiscussionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold hover:underline"
                          >
                            {item.commentsCount}c
                          </a>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold">
                        {formatRelativeTime(item.publishedAt)}
                      </span>
                    </div>

                    {isAlreadyIndexed ? (
                      <span
                        title="Indexed in directory"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-sans font-bold shrink-0 ${
                          darkMode
                            ? 'neu-pressed-dark text-emerald-400'
                            : 'neu-pressed-light text-emerald-700'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Indexed</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPromoteToDirectory(item)}
                        title="Add to directory"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold cursor-pointer shrink-0 ${
                          darkMode ? 'neu-btn-dark' : 'neu-btn-light'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Index</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </aside>
    );
  }
);
