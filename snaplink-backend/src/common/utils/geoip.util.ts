const geoip = require('geoip-lite');

export function lookupGeo(ip: string): { country: string | null; city: string | null } {
  try {
    if (!ip) return { country: 'Unknown', city: 'Unknown' };
    
    // Clean up IPv6 mapped IPv4
    let cleanIp = ip.replace(/^::ffff:/, '');

    // Skip localhost
    if (cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('127.')) {
      return { country: 'Local', city: 'Dev Environment' };
    }

    const geo = geoip.lookup(cleanIp);
    if (!geo) {
      return { country: 'Unknown', city: 'Unknown' };
    }

    return {
      country: geo.country || 'Unknown',
      city: geo.city || 'Unknown',
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}
