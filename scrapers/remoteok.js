const axios = require('axios');

const TAGS = ['javascript', 'react', 'node', 'full-stack'];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const tag of TAGS) {
    try {
      const { data } = await axios.get(`https://remoteok.com/api?tag=${tag}`, {
        headers: { 'User-Agent': 'JobMonitor/1.0', Accept: 'application/json' },
        timeout: 12000,
      });
      const items = Array.isArray(data) ? data.slice(1) : [];
      for (const item of items) {
        const id = `rok_${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        jobs.push({
          id,
          title:    item.position ?? 'Sin título',
          company:  item.company  ?? 'Sin empresa',
          link:     item.url      ?? `https://remoteok.com/l/${item.slug}`,
          remote:   true,
          location: 'Remoto',
          salary:   item.salary   ?? null,
          modality: 'Remoto',
          source:   'Remote OK',
        });
      }
    } catch (e) { console.error(`[Remote OK] "${tag}":`, e.message); }
    await new Promise(r => setTimeout(r, 800));
  }
  return jobs;
}

module.exports = { scrape };
