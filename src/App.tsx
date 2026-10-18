import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import initialPlatformsData from '../data/platforms.json';
import fallbackNewsData from '../data/daily-news-cache.json';
import {
  CATEGORIES,
  CategoryName,
  getProjectPlatformInfo,
  getProjectSearchIndex,
  NewsFeedResponse,
  PlatformProject,
  ScrapedNewsItem,
} from './types/platform';
import { Navbar } from './components/Navbar';
import { HeroSearchFilter, OSFilterValue } from './components/HeroSearchFilter';
import { ProjectOfTheDay, selectProjectForDate } from './components/ProjectOfTheDay';
import { CategoryDirectory } from './components/CategoryDirectory';
import { LiveNewsSidebar } from './components/LiveNewsSidebar';
import { ProjectInspectorModal } from './components/ProjectInspectorModal';

const STORAGE_KEY_SAVED = 'opensource_daily_saved_ids_v1';
const STORAGE_KEY_CUSTOM = 'opensource_daily_custom_projects_v1';
const STORAGE_KEY_THEME = 'opensource_daily_theme_v1';

const BASE_PROJECT_IDS = new Set(
  (initialPlatformsData as PlatformProject[]).map((p) => p.id)
);

export default function App() {
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Ensure # is removed from the browser URL on initial load and any hashchange event
  useEffect(() => {
    const stripUrlHash = () => {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    };
    stripUrlHash();
    window.addEventListener('hashchange', stripUrlHash);
    return () => window.removeEventListener('hashchange', stripUrlHash);
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });

  const [projects, setProjects] = useState<PlatformProject[]>(() => {
    const base = initialPlatformsData as PlatformProject[];
    try {
      const customRaw = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (customRaw) {
        const customProjects = JSON.parse(customRaw) as PlatformProject[];
        return [...customProjects, ...base];
      }
    } catch {
      // Ignore storage error
    }
    return base;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      return raw ? JSON.parse(raw) : ['artcraft', 'ollama', 'supabase'];
    } catch {
      return ['artcraft', 'ollama', 'supabase'];
    }
  });

  const savedIdSet = useMemo(() => new Set(savedIds), [savedIds]);

  // Live Scraped Daily News State
  const [newsItems, setNewsItems] = useState<ScrapedNewsItem[]>(
    () => fallbackNewsData as ScrapedNewsItem[]
  );
  const [lastScrapedAt, setLastScrapedAt] = useState<string>('');
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);
  const [isNewsRefreshing, setIsNewsRefreshing] = useState<boolean>(false);

  // Unified Filter State
  const [activeDate, setActiveDate] = useState<string>(todayDate);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'All'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedOS, setSelectedOS] = useState<OSFilterValue>('All');
  const [sortBy, setSortBy] = useState<'stars' | 'featured' | 'name'>('stars');
  const [showingSavedOnly, setShowingSavedOnly] = useState<boolean>(false);

  // Inspector Modal State
  const [inspectedProject, setInspectedProject] = useState<PlatformProject | null>(null);

  const fetchDailyNews = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsNewsRefreshing(true);
    }
    try {
      const res = await fetch(forceRefresh ? '/api/news/refresh' : '/api/news', {
        method: forceRefresh ? 'POST' : 'GET',
      });
      if (res.ok) {
        const data = (await res.json()) as NewsFeedResponse;
        if (Array.isArray(data.items) && data.items.length > 0) {
          setNewsItems(data.items);
          setLastScrapedAt(data.lastScrapedAt || new Date().toISOString());
        }
      }
    } catch {
      // Keep seed cache if offline
    } finally {
      setIsNewsLoading(false);
      setIsNewsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyNews(false);
  }, [fetchDailyNews]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, darkMode ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedIds));
    } catch {
      // Ignore
    }
  }, [savedIds]);

  const handleToggleSave = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSavedOnly = useCallback(() => {
    setShowingSavedOnly((prev) => !prev);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Instant 1-click promotion of a live Pulse item into the directory
  const handlePromoteNewsToDirectory = useCallback(
    (item: ScrapedNewsItem) => {
      const extractedName = item.title.split('—')[0].split(':')[0].trim() || item.title;
      const cleanUrl = item.url.split('#')[0].trim();

      const newProj: PlatformProject = {
        id: `${extractedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: extractedName,
        description: item.summary || item.title,
        category: item.category,
        tags: item.tags && item.tags.length > 0 ? item.tags : ['open-source', 'trending'],
        githubUrl: cleanUrl,
        websiteUrl: cleanUrl,
        featuredDate: todayDate,
        stars: item.points && item.points > 50 ? item.points : 1200,
        language: item.language || 'Open Source',
        license: 'MIT',
        quickStart: cleanUrl.includes('github.com') ? `git clone ${cleanUrl}.git` : undefined,
      };

      setProjects((prev) => {
        const updated = [newProj, ...prev];
        try {
          const customOnly = updated.filter((p) => !BASE_PROJECT_IDS.has(p.id));
          localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customOnly));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [todayDate]
  );

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.language) set.add(p.language);
    }
    return Array.from(set).sort();
  }, [projects]);

  // Single-pass computation of categoryCounts and filteredProjects using WeakMap-cached indexes
  const { categoryCounts, filteredProjects } = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase().replace(/^#/, '');
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat] = 0;
    }

    const matched: PlatformProject[] = [];

    for (const project of projects) {
      if (showingSavedOnly && !savedIdSet.has(project.id)) continue;
      if (selectedLanguage !== 'All' && project.language !== selectedLanguage) continue;

      if (selectedOS !== 'All') {
        const platformInfo = getProjectPlatformInfo(project);
        if (selectedOS === 'Downloadable' && !platformInfo.isDownloadableApp) continue;
        if (
          selectedOS !== 'Downloadable' &&
          !platformInfo.platforms.includes(selectedOS)
        ) {
          continue;
        }
      }

      if (query && !getProjectSearchIndex(project).includes(query)) {
        continue;
      }

      counts[project.category] = (counts[project.category] || 0) + 1;

      if (selectedCategory === 'All' || project.category === selectedCategory) {
        matched.push(project);
      }
    }

    matched.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.featuredDate.localeCompare(a.featuredDate);
    });

    return { categoryCounts: counts, filteredProjects: matched };
  }, [
    projects,
    deferredSearchQuery,
    selectedCategory,
    selectedLanguage,
    selectedOS,
    sortBy,
    showingSavedOnly,
    savedIdSet,
  ]);

  const currentSpotlight = useMemo(
    () => selectProjectForDate(projects, activeDate).project,
    [projects, activeDate]
  );

  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
  }, []);

  const handleLanguageClick = useCallback((lang: string) => {
    setSelectedLanguage((prev) => (prev === lang ? 'All' : lang));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedOS('All');
    setShowingSavedOnly(false);
  }, []);

  const handleCloseInspector = useCallback(() => {
    setInspectedProject(null);
  }, []);

  const handleRefreshNews = useCallback(() => {
    fetchDailyNews(true);
  }, [fetchDailyNews]);

  const handleSyncLiveStars = useCallback((projectId: string, liveStars: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId && p.stars !== liveStars ? { ...p, stars: liveStars } : p
      )
    );
    setInspectedProject((prev) =>
      prev && prev.id === projectId && prev.stars !== liveStars
        ? { ...prev, stars: liveStars }
        : prev
    );
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        darkMode
          ? 'glass-ambient-dark text-slate-100'
          : 'glass-ambient-light text-slate-900'
      }`}
    >
      {/* 1. Minimal Top Bar */}
      <Navbar
        savedCount={savedIds.length}
        showingSavedOnly={showingSavedOnly}
        onToggleSavedOnly={handleToggleSavedOnly}
        onResetAndHome={handleResetFilters}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* 2. Clean Search & Category Filter Bar */}
      <HeroSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        totalProjects={projects.length}
        filteredCount={filteredProjects.length}
        darkMode={darkMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedLanguage={selectedLanguage}
        availableLanguages={availableLanguages}
        onSelectLanguage={setSelectedLanguage}
        selectedOS={selectedOS}
        onSelectOS={setSelectedOS}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Main Workspace with Optimized Whitespace */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Compact Full-Width Daily Spotlight Strip */}
        <ProjectOfTheDay
          projects={projects}
          activeDate={activeDate}
          todayDate={todayDate}
          onChangeDate={setActiveDate}
          onInspect={setInspectedProject}
          darkMode={darkMode}
        />

        {/* Main Content Grid: Directory (8 cols) + Daily Pulse Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 min-w-0">
            <CategoryDirectory
              projects={filteredProjects}
              selectedCategory={selectedCategory}
              searchQuery={deferredSearchQuery}
              selectedLanguage={selectedLanguage}
              selectedOS={selectedOS}
              savedIdSet={savedIdSet}
              onToggleSave={handleToggleSave}
              onTagClick={handleTagClick}
              onLanguageClick={handleLanguageClick}
              onInspect={setInspectedProject}
              onResetFilters={handleResetFilters}
              darkMode={darkMode}
              spotlightProjectId={currentSpotlight?.id}
              showingSavedOnly={showingSavedOnly}
            />
          </div>

          <div className="lg:col-span-4 min-w-0">
            <LiveNewsSidebar
              items={newsItems}
              projects={projects}
              lastScrapedAt={lastScrapedAt}
              isLoading={isNewsLoading}
              isRefreshing={isNewsRefreshing}
              onRefresh={handleRefreshNews}
              selectedCategory={selectedCategory}
              searchQuery={deferredSearchQuery}
              onPromoteToDirectory={handlePromoteNewsToDirectory}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>

      {/* Quick Repository Inspector Modal */}
      <ProjectInspectorModal
        project={inspectedProject}
        allProjects={projects}
        isSaved={inspectedProject ? savedIdSet.has(inspectedProject.id) : false}
        onClose={handleCloseInspector}
        onSelectProject={setInspectedProject}
        onToggleSave={handleToggleSave}
        onTagClick={handleTagClick}
        onSyncLiveStars={handleSyncLiveStars}
        darkMode={darkMode}
      />
    </div>
  );
}
