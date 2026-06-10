const axios = require('axios');

const BASE = 'https://www.getonbrd.com/api/v0';
const QUERIES = [
  'full stack node react',
  'react native developer',
  'backend node.js',
  'frontend react',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const { data } = await axios.get(`${BASE}/search/jobs`, {
        params: { query, country: 'co', per_page: 20, page: 1 },
        timeout: 12000,
        headers: { Accept: 'application/json', 'User-Agent': 'JobMonitor/1.0' },
      });
      for (const item of data?.data ?? []) {
        const a = item.attributes ?? {};
        const id = `gob_${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        let salary = null;
        if (a.salary_min && a.salary_max)
          salary = `$${(a.salary_min/1000).toFixed(0)}k – $${(a.salary_max/1000).toFixed(0)}k USD/mes`;
        else if (a.salary_min)
          salary = `Desde $${(a.salary_min/1000).toFixed(0)}k USD/mes`;
        else if (a.salary)
          salary = a.salary;
        jobs.push({
          id, salary,
          title:    a.title        ?? 'Sin título',
          company:  a.company_name ?? 'Sin empresa',
          link:     a.url
            ? `https://www.getonbrd.com${a.url}`
            : `https://www.getonbrd.com/jobs/${item.id}`,
          remote:   a.remote       ?? false,
          location: a.country      ?? 'Colombia',
          modality: a.modality     ?? null,
          source:   'Get on Board',
        });
      }
    } catch (e) { console.error(`[GetOnBoard] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 800));
  }
  return jobs;
}

module.exports = { scrape };
