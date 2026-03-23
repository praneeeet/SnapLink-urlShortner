const fetch = require('node-fetch');
import * as cheerio from 'cheerio';

export async function fetchOGMetadata(url: string): Promise<{ title: string | null; faviconUrl: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { title: null, faviconUrl: null };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let title: string | null | undefined = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                $('title').text();
    
    if (title) {
      title = title.substring(0, 200);
    } else {
      title = null;
    }

    let faviconUrl: string | null | undefined = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
    
    if (faviconUrl) {
      try {
        faviconUrl = new URL(faviconUrl, url).href;
      } catch {
        faviconUrl = null;
      }
    } else {
      faviconUrl = null;
    }

    return { title: title || null, faviconUrl: faviconUrl || null };
  } catch {
    return { title: null, faviconUrl: null };
  }
}
