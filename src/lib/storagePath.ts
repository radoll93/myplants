export function extractStoragePath(url: string): string | null {
  const marker = "/plant-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
