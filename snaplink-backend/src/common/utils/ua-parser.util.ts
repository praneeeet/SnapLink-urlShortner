import * as UAParser from 'ua-parser-js';

export function parseUA(userAgent: string): { device: string; browser: string; os: string } {
  try {
    const parser = new (UAParser as any)(userAgent);
    const result = parser.getResult();
    return {
      device: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
    };
  } catch {
    return { device: 'desktop', browser: 'Unknown', os: 'Unknown' };
  }
}
