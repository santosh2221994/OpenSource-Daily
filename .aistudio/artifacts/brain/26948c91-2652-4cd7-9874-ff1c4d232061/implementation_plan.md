# OpenSource Daily — Compact Workspace & Multi-Source Daily News Scraper

Redesign **OpenSource Daily** into a high-density, minimal split-screen workspace that pairs the categorized open-source software directory (rendered as tight multi-column mini-cards) alongside a live, server-scraped daily open-source news feed with unified search and filtering.

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan reflects your confirmed preferences from our clarification step. Please review the architecture and layout decisions below and click **Proceed** when ready to build.

- **Confirmed Decision 1 — Live News Aggregation Sources**: The backend scraper fetches, normalizes, and caches daily open-source updates across all four selected ecosystems: **GitHub Trending & Releases**, **Hacker News**, **Dev.to & Lobsters**, and **Reddit (`r/opensource` & `r/selfhosted`)**.
- **Confirmed Decision 2 — Split Two-Column Workspace Layout**: The main viewport is organized as an asymmetric split view: a primary left/center canvas for the categorized software directory and a dedicated sticky right sidebar for the live Daily News stream.
- **Confirmed Decision 3 — Tight Multi-Column Mini-Cards**: Oversized hero sections and verbose card blocks are replaced with a compact, minimal control bar and tight multi-column mini-cards displaying only essential unboxed metadata (`Category · Language · ★ Stars`), concise 2-line descriptions, and single-click actions.

---

## 1. Overview & Core Concept

- **What It Does**: Combines a curated 7-category open-source software directory with a real-time daily news scraper that pulls trending repositories, engineering articles, and community discussions into a single compact dashboard.
- **Target Audience / Persona**: Software engineers, DevOps architects, and self-hosting enthusiasts who want a fast, zero-fluff daily briefing on open-source software and releases without scrolling through bloated marketing cards.
- **Key Value**: Cuts visual noise by 60% through compact mini-cards and unifies repository discovery with live community signal in one synchronized search-and-filter interface.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Instant Unified Search & Filtering**: At the top of the workspace, a single compact toolbar houses the global search input (`/` shortcut), interactive category filter buttons, source filters (`All Sources`, `GitHub`, `HN`, `Dev.to/Lobsters`, `Reddit`), and sort controls. Typing a query or selecting a category simultaneously filters both the software directory mini-cards and the live daily news sidebar (with an option to lock/unlock sync).
  2. **Compact "Project of the Day" Strip**: Above the directory grid, a streamlined horizontal strip highlights today's featured repository with date-stepping controls (`Prev`, `Today`, `Next`) and a one-click CLI copy button—preserving daily rotation without consuming vertical screen real estate.
  3. **Scanning Multi-Column Mini-Cards**: Users scan 3 columns of tight mini-cards in the directory area. Each mini-card displays the project title, star count, primary language, a 2-line clamped description, unboxed topic tags, and compact icon/text actions for GitHub, Website, CLI copy, and Bookmarking.
  4. **Browsing & Refreshing Live Daily News**: In the right-hand news sidebar, users scan live scraped items grouped or filtered by source and auto-tagged into the 7 open-source categories. Clicking **Refresh Feed** triggers an on-demand scrape across all four source pipelines.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian developer console meets crisp editorial index—ultra-compact, zero decorative clutter, single-elevation flat surfaces with `1px` structural borders.
  - *Color Palette & Mood*:
    - Light Mode: Crisp slate-white canvas (`#F8FAFC`), pure white card surfaces (`#FFFFFF`), slate hairline borders (`#E2E8F0`), deep slate ink (`#0F172A`), and focused cobalt blue accent (`#2563EB`) strictly for active filter states and primary triggers.
    - Dark Mode: Deep obsidian-slate canvas (`#020617`), elevated slate surfaces (`#0F172A`), muted hairline borders (`#1E293B`), crisp off-white typography (`#F8FAFC`) with optical tracking compensation.
  - *Typography & Hierarchy*:
    - Display & Titles: `Bricolage Grotesque` (`15px–16px` bold for mini-card titles; `20px` for compact section headers).
    - Body Copy: `Plus Jakarta Sans` (`13px` with `1.45` line height and `line-clamp-2` for high-density readability).
    - Metrics, Dates & CLI: `JetBrains Mono` with `tabular-nums` (`11px–12px`) for aligned star counts, timestamps, and score counters.
  - *Zero-Pill Metadata Discipline*: All static metadata on mini-cards and news items (`Category · Language · ★ 41.8k · 3h ago`) is rendered as quiet inline text separated by middle dots (`·`), never wrapped in rounded pill badges.
- **Interactive Feedback & Motion**:
  - Fast `150ms` border and background transitions on mini-card hover.
  - Skeleton shimmer placeholders in the news sidebar during live refresh requests, plus graceful fallback caching if an upstream feed rate-limits.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Multi-Source Scraper & Normalizer with In-Memory + Disk Cache**
  - *Chosen Approach*: Run an Express backend server that concurrently scrapes and normalizes feeds from GitHub (trending repositories created/pushed recently), Hacker News (Algolia front-page open-source stories), Dev.to / Lobsters (open-source tagged articles), and Reddit (`r/opensource` and `r/selfhosted` JSON feeds), categorizing each story into the 7 core categories via keyword/topic matching.
  - *Why*: Fetching directly from the browser hits CORS restrictions on Reddit and Lobsters and exposes rate limits. Server-side aggregation with a 15-minute TTL cache (and manual force-refresh endpoint) ensures sub-50ms loads and zero CORS errors.
  - *Alternatives Considered*: Client-side CORS proxies (unreliable and slow) or static mock news (violates real-time utility).
- **Decision 2: Synchronized + Independent Filter Controls**
  - *Chosen Approach*: The top search bar and 7 category buttons filter the software directory and automatically highlight/filter matching category stories in the news sidebar, while dedicated source tabs (`All`, `GitHub`, `HN`, `Dev/Lobsters`, `Reddit`) inside the news panel let users drill down by news origin.
  - *Why*: Gives users one unified mental model when researching a domain (e.g., clicking *AI & Machine Learning* shows both top AI tools and today's breaking AI open-source releases side-by-side).

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Header (3-Zone)                      │
│   [OpenSource Daily]     [Directory · News · Blueprint · Saved]   [+Add]   │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│                  Compact Unified Search & Filter Control Bar               │
│  [ Search Input (/) ]  [ Category Filter Tabs (7) ]  [ Sort ]  [ ☀ / ☾ ]   │
└───────────────────┬─────────────────────────────────────────┬──────────────┘
                    │                                         │
┌───────────────────▼───────────────────────────┐ ┌───────────▼──────────────┐
│     Left/Main Column (8 Cols - Directory)     │ │ Right Column (4 Cols)    │
│ ┌───────────────────────────────────────────┐ │ │ ┌──────────────────────┐ │
│ │ Compact "Project of the Day" Strip        │ │ │ │ Live Daily News Feed │ │
│ └───────────────────────────────────────────┘ │ │ │ [All|GH|HN|Dev|Red]  │ │
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │ │ ├──────────────────────┤ │
│ │ Mini-Card 1 │ │ Mini-Card 2 │ │Mini-Card 3│ │ │ │ Compact News Item 1  │ │
│ └─────────────┘ └─────────────┘ └───────────┘ │ │ │ Compact News Item 2  │ │
│ ┌───────────────────────────────────────────┐ │ │ │ Compact News Item 3  │ │
│ │ Collapsible Daily Cron Blueprint Drawer   │ │ │ │ [Refresh Live Feed]  │ │
│ └───────────────────────────────────────────┘ │ │ └──────────────────────┘ │
└───────────────────────────────────────────────┘ └──────────────────────────┘
                                                              ▲
                                                              │ GET /api/news
                                                              │ POST /api/news/refresh
┌─────────────────────────────────────────────────────────────┴──────────────┐
│                 Express Backend Scraper & Normalizer Engine                │
│  ┌────────────────┐  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │ GitHub API     │  │ Hacker News   │  │ Dev.to &      │  │ Reddit JSON│  │
│  │ Trending/Repos │  │ Algolia API   │  │ Lobsters JSON │  │ r/selfhost │  │
│  └───────┬────────┘  └───────┬───────┘  └───────┬───────┘  └─────┬──────┘  │
│          └───────────────────┴─────────┬────────┴────────────────┘         │
│                                        ▼                                   │
│                  Category Classifier + Deduplicator + Cache                │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`PlatformProject` (Directory Entity)**: `id`, `name`, `description`, `category` (7 canonical categories), `tags[]`, `githubUrl`, `websiteUrl`, `featuredDate`, `stars`, `language`, `license`, `quickStart`.
- **`ScrapedNewsItem` (Live News Entity)**:
  - `id`: Unique deterministic identifier (`gh-...`, `hn-...`, `dev-...`, `lob-...`, `red-...`)
  - `title`: Story or release headline
  - `url`: Direct external URL to repository, release, or article
  - `discussionUrl`: Optional community thread link (HN comments / Reddit thread)
  - `source`: `'github' | 'hackernews' | 'devto' | 'lobsters' | 'reddit'`
  - `sourceLabel`: Human-readable origin (`GitHub Trending`, `Hacker News`, `Lobsters`, `Dev.to`, `r/selfhosted`, `r/opensource`)
  - `category`: Automatically classified into one of the 7 `CategoryName` buckets (or `'General Open Source'`)
  - `points`: Star velocity, upvotes, or score (`tabular-nums`)
  - `commentsCount`: Number of discussion comments
  - `author`: Repository owner or article author
  - `publishedAt`: ISO timestamp for relative time display (`2h ago`)
  - `summary`: Optional 1-line snippet or repository description

### Interactive Component & State Mapping

- **Unified Search & Filter Bar**:
  - *Search Input*: Filters both `PlatformProject[]` (by name, description, language, tags) and `ScrapedNewsItem[]` (by title, summary, sourceLabel, category) in real time.
  - *Category Filter Bar*: Selecting any of the 7 categories filters the mini-card directory and optionally scopes the news sidebar (via a `Sync with Category` toggle in the news header).
  - *Density & Grouping Toggle*: Switches the 3-column mini-card grid between *Grouped by Category* (compact category headers) and *Unified Flat Grid*.
- **Live Daily News Sidebar**:
  - *Source Filter Bar*: Segmented buttons (`All`, `GitHub`, `HN`, `Dev/Lobsters`, `Reddit`) filter the scraped items by upstream source.
  - *Manual Refresh Button*: Calls `POST /api/news/refresh`, displays a non-blocking loading spinner, updates the `lastUpdated` timestamp, and renders fresh items.
  - *Promote to Directory Action*: Clicking `+ Index` on any GitHub Trending news item pre-fills the **Submit Project Modal** with that repository's title, description, URL, and auto-detected category so users can promote breaking discoveries into the permanent catalog in one click.
