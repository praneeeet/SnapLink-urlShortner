const geoip = require('geoip-lite');
const ip = '8.8.8.8';
const geo = geoip.lookup(ip);
console.log('Lookup 8.8.8.8:', geo);
if (!geo) {
  console.log('Geoip data might be missing. Try: npm explore geoip-lite -- npm run updatedb');
}
