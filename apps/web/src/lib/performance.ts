export function markPortalTiming(name: string, startedAt = performance.now()): number {
  const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
  console.debug('[portal-timing]', { name, durationMs });
  return durationMs;
}
