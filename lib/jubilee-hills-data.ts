import { getDefaultRegion } from './location-data';

export function getJubileeHillsFallback() {
  return getDefaultRegion().businesses;
}

export function getMissingWebsiteCount(): number {
  return getDefaultRegion().businesses.filter((b) => !b.website).length;
}
