export type OSPlatform =
  | 'Windows'
  | 'macOS'
  | 'Linux'
  | 'Docker'
  | 'Web'
  | 'Android'
  | 'iOS';

export const OS_PLATFORMS: OSPlatform[] = [
  'Windows',
  'macOS',
  'Linux',
  'Docker',
  'Web',
  'Android',
  'iOS',
];

export const OS_SHORT_LABELS: Record<OSPlatform, string> = {
  Windows: 'Win',
  macOS: 'Mac',
  Linux: 'Linux',
  Docker: 'Docker',
  Web: 'Web',
  Android: 'Android',
  iOS: 'iOS',
};

export type CategoryName =
  | 'Artcraft, Design & Creative Media'
  | 'Open-Source Software Clones & Alternatives'
  | 'Productivity & Collaboration'
  | 'CMS & E-Commerce'
  | 'Analytics & Monitoring'
  | 'Cybersecurity & Privacy'
  | 'Reverse Engineering & Binary Analysis'
  | 'AI & Machine Learning'
  | 'Developer Tools, IDEs & Runtimes'
  | 'Databases & Data Management'
  | 'Cloud, DevOps & Infrastructure';

export const CATEGORIES: CategoryName[] = [
  'Artcraft, Design & Creative Media',
  'Open-Source Software Clones & Alternatives',
  'Productivity & Collaboration',
  'CMS & E-Commerce',
  'Analytics & Monitoring',
  'Cybersecurity & Privacy',
  'Reverse Engineering & Binary Analysis',
  'AI & Machine Learning',
  'Developer Tools, IDEs & Runtimes',
  'Databases & Data Management',
  'Cloud, DevOps & Infrastructure',
];

export const CATEGORY_SHORT_LABELS: Record<CategoryName, string> = {
  'Artcraft, Design & Creative Media': 'Artcraft & Creative',
  'Open-Source Software Clones & Alternatives': 'Software Clones',
  'Productivity & Collaboration': 'Productivity',
  'CMS & E-Commerce': 'CMS & Commerce',
  'Analytics & Monitoring': 'Analytics',
  'Cybersecurity & Privacy': 'Security & Privacy',
  'Reverse Engineering & Binary Analysis': 'Reverse Engineering',
  'AI & Machine Learning': 'AI & ML',
  'Developer Tools, IDEs & Runtimes': 'DevTools & IDEs',
  'Databases & Data Management': 'Databases',
  'Cloud, DevOps & Infrastructure': 'Cloud & DevOps',
};

export interface PlatformProject {
  id: string;
  name: string;
  description: string;
  category: CategoryName;
  tags: string[];
  githubUrl: string;
  websiteUrl: string;
  featuredDate: string; // YYYY-MM-DD
  stars?: number;
  language?: string;
  license?: string;
  quickStart?: string;
  useCase?: string;
  logoUrl?: string;
  platforms?: OSPlatform[];
  downloadUrl?: string;
}

export interface ProjectPlatformInfo {
  platforms: OSPlatform[];
  shortSummary: string;
  fullSummary: string;
  isDownloadableApp: boolean;
  downloadUrl: string | null;
  downloadLabel: string;
}

const CUSTOM_DOWNLOAD_URLS: Record<string, string> = {
  ollama: 'https://ollama.com/download',
  jan: 'https://jan.ai',
  gpt4all: 'https://gpt4all.io',
  anythingllm: 'https://anythingllm.com/download',
  blender: 'https://www.blender.org/download/',
  godot: 'https://godotengine.org/download/',
  krita: 'https://krita.org/en/download/',
  inkscape: 'https://inkscape.org/release/',
  darktable: 'https://www.darktable.org/install/',
  gimp: 'https://www.gimp.org/downloads/',
  audacity: 'https://www.audacityteam.org/download/',
  'obs-studio': 'https://obsproject.com/download',
  kdenlive: 'https://kdenlive.org/en/download/',
  shotcut: 'https://shotcut.org/download/',
  freecad: 'https://www.freecad.org/downloads.php',
  openscad: 'https://openscad.org/downloads.html',
  musescore: 'https://musescore.org/en/download',
  mixxx: 'https://mixxx.org/download/',
  lmms: 'https://lmms.io/download',
  artcraft: 'https://getartcraft.com',
  photocraft: 'https://getartcraft.com',
  vectorcraft: 'https://getartcraft.com',
  filmcraft: 'https://getartcraft.com',
  effectcraft: 'https://getartcraft.com',
  lightcraft: 'https://getartcraft.com',
  designcraft: 'https://getartcraft.com',
  pdfcraft: 'https://getartcraft.com',
};

const WINDOWS_ONLY_REGEX =
  /\b(x64dbg|systeminformer|processhacker|winmerge|sharex|powertoys|autohotkey|scoop|winget|pe-bear|dnspy|ilspy|windbg|cmder|everything-toolbar)\b/i;

const MACOS_ONLY_REGEX =
  /\b(rectangle|iina|sketchybar|aerospace|yabai|hammerspoon|raycast|karabiner|stats-mac|alt-tab-macos|maccy|utm-mac)\b/i;

const LINUX_ONLY_REGEX =
  /\b(hyprland|sway|waybar|i3wm|rofi|dunst|polybar|systemd|ufw|fail2ban|proxmox|archinstall|timeshift|wireplumber|pipewire|flatpak|snapd|iptables|nftables|ebpf|bpftrace)\b/i;

const MOBILE_ANDROID_REGEX =
  /\b(android|apk|newpipe|antennapod|termux|k-9|lawnchair|mihon|tachiyomi|fdroid|f-droid|obtainium|magisk|kernelsu|grapheneos|lineageos)\b/i;

const CROSS_PLATFORM_MOBILE_REGEX =
  /\b(localsend|immich|bitwarden|joplin|element|signal|briar|syncthing|jellyfin|nextcloud|ente|standard-notes|appflowy|logseq|flutter|react-native|tauri|capacitor)\b/i;

const DOWNLOADABLE_APP_REGEX =
  /\b(desktop|studio|editor|engine|ide|browser|client|player|daw|cad|compositor|darkroom|painting|animation|tracker|debugger|disassembler|decompiler|hex-editor|terminal|emulator|wallet|vault|password-manager|launcher|screen-recorder|streaming|video-editing|artcraft|photocraft|vectorcraft|filmcraft|effectcraft|lightcraft|designcraft|pdfcraft|blender|godot|krita|inkscape|darktable|gimp|audacity|ardour|obs-studio|kdenlive|shotcut|olive|opentoonz|synfig|pencil2d|libresprite|pixelorama|blockbench|meshlab|freecad|openscad|solvespace|librecad|mixxx|lmms|musescore|surge|vital|processing|fontforge|ghidra|imhex|cutter|detect-it-easy|x64dbg|jadx|apktool|wireshark|zed|helix|neovim|wezterm|alacritty|kitty|ghostty|lapce|vscodium|vscode|cursor|obsidian|logseq|joplin|appflowy|affine|focalboard|thunderbird|localsend|rustdesk|syncthing|bitwarden|keepassxc|vlc|mpv|handbrake|calibre|qgis|stellarium|kicad|prismlauncher|retroarch|ppsspp|dolphin|pcsx2|rpcs3|ryujinx|ollama|jan|gpt4all|anything-llm|koboldcpp|lm-studio|dbeaver|beekeeper|bruno|hoppscotch|insomnia|yaak|lens|k9s|lazygit|podman-desktop|rancher-desktop|balena-etcher|ventoy|rufus|nmap|burp|zap)\b/i;

const DOWNLOADABLE_CLI_INSTALL_REGEX =
  /\b(flatpak install|brew install --cask|snap install|choco install|winget install|\.exe|\.dmg|\.AppImage|cargo tauri)\b/i;

const platformInfoCache = new WeakMap<PlatformProject, ProjectPlatformInfo>();
const searchIndexCache = new WeakMap<PlatformProject, string>();

export function getProjectPlatformInfo(project: PlatformProject): ProjectPlatformInfo {
  const cached = platformInfoCache.get(project);
  if (cached) return cached;

  const combined = `${project.id} ${project.name} ${project.description} ${project.tags.join(' ')} ${
    project.quickStart || ''
  }`;
  const cleanGithub = (project.githubUrl || '').split('#')[0].replace(/\.git$/, '').replace(/\/+$/, '');
  const isGithubRepo = cleanGithub.includes('github.com/');

  let platforms: OSPlatform[] = [];

  if (project.platforms && project.platforms.length > 0) {
    platforms = [...project.platforms];
  } else if (WINDOWS_ONLY_REGEX.test(combined)) {
    platforms = ['Windows'];
  } else if (MACOS_ONLY_REGEX.test(combined)) {
    platforms = ['macOS'];
  } else if (LINUX_ONLY_REGEX.test(combined)) {
    platforms = ['Linux'];
  } else {
    platforms = ['Windows', 'macOS', 'Linux'];

    if (
      /\b(docker|self-hosted|compose|kubernetes|k8s|helm|container|server)\b/i.test(combined) ||
      project.category === 'Cloud, DevOps & Infrastructure' ||
      project.category === 'CMS & E-Commerce' ||
      project.category === 'Analytics & Monitoring'
    ) {
      if (!platforms.includes('Docker')) platforms.push('Docker');
    }

    if (
      /\b(web|browser|webgl|webgpu|wasm|canvas|react|vue|svelte|nextjs|pwa|frontend|dashboard|ui)\b/i.test(
        combined
      )
    ) {
      if (!platforms.includes('Web')) platforms.push('Web');
    }

    if (MOBILE_ANDROID_REGEX.test(combined)) {
      if (!platforms.includes('Android')) platforms.push('Android');
    }

    if (CROSS_PLATFORM_MOBILE_REGEX.test(combined)) {
      if (!platforms.includes('Android')) platforms.push('Android');
      if (!platforms.includes('iOS')) platforms.push('iOS');
    }
  }

  const isDownloadableApp = Boolean(
    project.downloadUrl ||
      CUSTOM_DOWNLOAD_URLS[project.id.toLowerCase()] ||
      DOWNLOADABLE_CLI_INSTALL_REGEX.test(project.quickStart || '') ||
      DOWNLOADABLE_APP_REGEX.test(combined)
  );

  let downloadUrl: string | null = null;
  const lowerId = project.id.toLowerCase();

  if (project.downloadUrl) {
    downloadUrl = project.downloadUrl;
  } else if (CUSTOM_DOWNLOAD_URLS[lowerId]) {
    downloadUrl = CUSTOM_DOWNLOAD_URLS[lowerId];
  } else if (isDownloadableApp && isGithubRepo) {
    downloadUrl = `${cleanGithub}/releases/latest`;
  } else if (isDownloadableApp && project.websiteUrl) {
    downloadUrl = project.websiteUrl.split('#')[0];
  }

  const coreOs = platforms.slice(0, 3).map((os) => OS_SHORT_LABELS[os]);
  const extraCount = platforms.length - coreOs.length;
  const shortSummary =
    extraCount > 0 ? `${coreOs.join(' · ')} +${extraCount}` : coreOs.join(' · ');
  const fullSummary = platforms.join(', ');

  const info: ProjectPlatformInfo = {
    platforms,
    shortSummary,
    fullSummary,
    isDownloadableApp,
    downloadUrl,
    downloadLabel: CUSTOM_DOWNLOAD_URLS[lowerId] ? 'Download App' : 'Releases',
  };

  platformInfoCache.set(project, info);
  return info;
}

export function getProjectSearchIndex(project: PlatformProject): string {
  const cached = searchIndexCache.get(project);
  if (cached !== undefined) return cached;

  const platformInfo = getProjectPlatformInfo(project);
  const index = [
    project.name,
    project.description,
    project.category,
    project.language || '',
    platformInfo.fullSummary,
    ...project.tags,
  ]
    .join(' ')
    .toLowerCase();

  searchIndexCache.set(project, index);
  return index;
}

export interface GitHubContributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

export interface GitHubRepoRealtimeStats {
  repoSlug: string;
  ownerAvatarUrl?: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  totalContributors: number;
  topContributors: GitHubContributor[];
  pushedAt: string;
  defaultBranch: string;
  license?: string;
  language?: string;
  latestReleaseTag?: string;
  latestReleaseUrl?: string;
  fetchedAt: string;
  source: 'github-api' | 'cached';
}

export type NewsSourceId = 'github' | 'hackernews' | 'devto' | 'lobsters' | 'reddit';

export interface ScrapedNewsItem {
  id: string;
  title: string;
  url: string;
  discussionUrl?: string;
  source: NewsSourceId;
  sourceLabel: string;
  category: CategoryName;
  points: number;
  commentsCount: number;
  author: string;
  publishedAt: string; // ISO string
  summary?: string;
  language?: string;
  tags?: string[];
}

export interface NewsFeedResponse {
  items: ScrapedNewsItem[];
  lastScrapedAt: string;
  sourcesStatus: Record<NewsSourceId, { count: number; status: 'live' | 'cached' }>;
}
