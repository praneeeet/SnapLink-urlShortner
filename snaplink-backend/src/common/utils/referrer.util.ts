export function classifyReferrer(referer: string | undefined): string {
  try {
    if (!referer) return 'direct';
    const cleanUrl = new URL(referer);
    const hostname = cleanUrl.hostname.toLowerCase();
    
    if (hostname.includes('google.')) return 'google';
    if (hostname.includes('twitter.com') || hostname.includes('t.co') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('whatsapp.com')) return 'whatsapp';

    return hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
}
