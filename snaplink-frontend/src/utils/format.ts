export function formatNumber(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(iso: string | undefined): string {
  if (!iso) return '';
  const now = new Date();
  const past = new Date(iso);
  const diff = now.getTime() - past.getTime();
  const sec = Math.floor(diff / 1000);

  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} hour${hour > 1 ? 's' : ''} ago`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} day${day > 1 ? 's' : ''} ago`;

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function truncateUrl(url: string | undefined, max: number): string {
  if (!url) return '';
  let str = url.replace(/(^\w+:|^)\/\//, ''); // remove protocol
  if (str.length <= max) return str;
  return str.substring(0, max) + '...';
}

export function getShortUrl(shortCode: string | undefined): string {
  if (!shortCode) return '';
  const baseUrl = import.meta.env.SHORT_URL_BASE || window.location.origin;
  // Ensure baseUrl doesn't end with a slash for consistent joining
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/${shortCode}`;
}

export function healthColor(score: number | undefined): string {
  if (score === undefined || isNaN(score)) return '#F87171'; // Handle NaN explicitly as requested
  if (score >= 71) return '#4ADE80';
  if (score >= 41) return '#FBB040';
  return '#F87171';
}

export function formatCountry(code: string | undefined): string {
  if (!code) return 'Unknown';
  if (code.toLowerCase() === 'local') return 'Local';
  if (code.length > 2) return code;

  const map: Record<string, string> = {
    'IN': 'India',
    'US': 'USA',
    'GB': 'UK',
    'CA': 'Canada',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'RU': 'Russia',
    'AU': 'Australia',
  };

  return map[code.toUpperCase()] || code;
}
