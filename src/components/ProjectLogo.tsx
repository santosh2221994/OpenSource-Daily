import React, { useState, useEffect, useMemo } from 'react';
import { PlatformProject } from '../types/platform';

interface ProjectLogoProps {
  project: Pick<PlatformProject, 'id' | 'name' | 'githubUrl' | 'websiteUrl' | 'logoUrl' | 'category'>;
  ownerAvatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  darkMode: boolean;
  className?: string;
}

const failedLogoUrls = new Set<string>();

export function extractGithubOwner(githubUrl: string): string | null {
  const cleaned = (githubUrl || '').trim().split('#')[0].replace(/\.git$/, '').replace(/\/+$/, '');
  const match = cleaned.match(/github\.com\/([^/]+)\/[^/]+/i);
  return match?.[1] || null;
}

export function extractGithubSlugFromUrl(githubUrl: string): string | null {
  const cleaned = (githubUrl || '').trim().split('#')[0].replace(/\.git$/, '').replace(/\/+$/, '');
  const match = cleaned.match(/github\.com\/([^/]+\/[^/]+)/i);
  return match?.[1] || null;
}

export function getProjectLogoCandidates(
  project: Pick<PlatformProject, 'githubUrl' | 'websiteUrl' | 'logoUrl'>,
  ownerAvatarUrl?: string
): string[] {
  const urls: string[] = [];

  if (project.logoUrl?.trim()) {
    urls.push(project.logoUrl.trim());
  }

  if (ownerAvatarUrl?.trim()) {
    urls.push(ownerAvatarUrl.trim());
  }

  const owner = extractGithubOwner(project.githubUrl);
  if (owner) {
    urls.push(`https://github.com/${owner}.png?size=128`);
  }

  if (project.websiteUrl) {
    try {
      const parsed = new URL(project.websiteUrl.split('#')[0]);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host && !host.includes('github.com') && !host.includes('github.io')) {
        urls.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`);
      }
    } catch {
      // Ignore invalid URL
    }
  }

  return Array.from(new Set(urls)).filter((u) => !failedLogoUrls.has(u));
}

function getProjectInitials(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\s.-]/g, '').trim();
  if (!clean) return 'OS';
  const parts = clean.split(/[\s.-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg', { box: string; img: string; text: string }> = {
  xs: {
    box: 'w-4 h-4 rounded',
    img: 'w-full h-full rounded-[3px] object-contain',
    text: 'text-[8px]',
  },
  sm: {
    box: 'w-8 h-8 rounded-xl p-1',
    img: 'w-full h-full rounded-lg object-contain',
    text: 'text-[10px]',
  },
  md: {
    box: 'w-9 h-9 rounded-xl p-1',
    img: 'w-full h-full rounded-lg object-contain',
    text: 'text-xs',
  },
  lg: {
    box: 'w-12 h-12 rounded-2xl p-1.5',
    img: 'w-full h-full rounded-xl object-contain',
    text: 'text-sm sm:text-base',
  },
};

export const ProjectLogo: React.FC<ProjectLogoProps> = React.memo(
  ({ project, ownerAvatarUrl, size = 'md', darkMode, className = '' }) => {
    const candidates = useMemo(
      () => getProjectLogoCandidates(project, ownerAvatarUrl),
      [project.githubUrl, project.websiteUrl, project.logoUrl, ownerAvatarUrl]
    );

    const [candidateIdx, setCandidateIdx] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
      setCandidateIdx(0);
      setImgLoaded(false);
    }, [project.id, candidates.join('|')]);

    const activeLogoUrl = candidates[candidateIdx];
    const sizeSpec = SIZE_CLASSES[size];
    const initials = useMemo(() => getProjectInitials(project.name), [project.name]);

    return (
      <div
        className={`relative shrink-0 inline-flex items-center justify-center overflow-hidden select-none transition-all ${
          sizeSpec.box
        } ${
          darkMode ? 'neu-inset-dark text-blue-400' : 'neu-inset-light text-blue-600'
        } ${className}`}
      >
        {!imgLoaded && (
          <span className={`font-display font-bold tracking-tight ${sizeSpec.text}`}>
            {initials}
          </span>
        )}
        {activeLogoUrl && (
          <img
            src={activeLogoUrl}
            alt={`${project.name} logo`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => {
              failedLogoUrls.add(activeLogoUrl);
              setImgLoaded(false);
              setCandidateIdx((prev) => prev + 1);
            }}
            onLoad={(e) => {
              if (e.currentTarget.naturalWidth <= 1 && e.currentTarget.naturalHeight <= 1) {
                failedLogoUrls.add(activeLogoUrl);
                setImgLoaded(false);
                setCandidateIdx((prev) => prev + 1);
              } else {
                setImgLoaded(true);
              }
            }}
            className={`${sizeSpec.img} transition-opacity duration-150 ${
              imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        )}
      </div>
    );
  }
);
