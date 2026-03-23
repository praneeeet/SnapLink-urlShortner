export function calculateHealthScore(params: {
  clicksLast7Days: number;
  hasVisitLast24h: boolean;
  distinctDeviceCount: number;
  totalClicks: number;
}): number {
  try {
    const { clicksLast7Days, hasVisitLast24h, distinctDeviceCount, totalClicks } = params;

    const velocity = Math.min(40, clicksLast7Days * 2);
    const recency = hasVisitLast24h ? 25 : 0;
    const diversity = Math.min(20, distinctDeviceCount * 7);

    let milestone = 0;
    if (totalClicks >= 1000) milestone = 15;
    else if (totalClicks >= 100) milestone = 10;
    else if (totalClicks >= 10) milestone = 5;

    return Math.min(100, velocity + recency + diversity + milestone);
  } catch {
    return 0;
  }
}
