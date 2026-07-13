import type { Database } from '../types';
import { assetPath } from './githubPages';

export async function loadPortfolioData(): Promise<Database> {
  try {
    const apiResponse = await fetch('/api/portfolio');
    if (apiResponse.ok) {
      return normalizeAssetUrls(await apiResponse.json());
    }
  } catch {
    // GitHub Pages has no API server, so fall through to the static export.
  }

  const staticResponse = await fetch(assetPath('portfolio.json'));
  if (!staticResponse.ok) {
    throw new Error(`Failed to load static portfolio data: ${staticResponse.status}`);
  }

  return normalizeAssetUrls(await staticResponse.json());
}

function normalizeAssetUrls(data: Database): Database {
  return {
    ...data,
    profile: {
      ...data.profile,
      profileImage: assetPath(data.profile.profileImage),
      resumeUrl: assetPath(data.profile.resumeUrl),
    },
  };
}

