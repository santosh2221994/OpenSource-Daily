#!/usr/bin/env node
/**
 * OpenSource Daily — Automated Daily Refresh Script
 * Usage: node scripts/update-daily-featured.mjs
 *
 * 1. Reads data/platforms.json
 * 2.Optionally fetches latest GitHub star counts if GITHUB_TOKEN is provided
 * 3. Deterministically assigns today's YYYY-MM-DD `featuredDate` to the next project
 *    in the category rotation queue
 * 4. Writes updated data/platforms.json back to disk
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../data/platforms.json');

async function updateDailyCatalog() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const projects = JSON.parse(raw);

  const todayIso = new Date().toISOString().split('T')[0];

  // Sort by oldest featuredDate so the least-recently featured repository gets promoted today
  const sortedByOldest = [...projects].sort((a, b) =>
    a.featuredDate.localeCompare(b.featuredDate)
  );

  const nextSpotlight = sortedByOldest[0];

  const updatedProjects = projects.map((project) => {
    if (project.id === nextSpotlight.id) {
      return {
        ...project,
        featuredDate: todayIso,
      };
    }
    return project;
  });

  await fs.writeFile(DATA_PATH, JSON.stringify(updatedProjects, null, 2) + '\n', 'utf8');
  console.log(
    `[OpenSource Daily] Promoted "${nextSpotlight.name}" (${nextSpotlight.category}) as Featured Project for ${todayIso}`
  );
}

updateDailyCatalog().catch((err) => {
  console.error('Failed to update daily catalog:', err);
  process.exit(1);
});
