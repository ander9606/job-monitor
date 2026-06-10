const axios = require('axios');

const QUERIES = [
  'full stack react nodejs',
  'react native mobile developer',
  'backend nodejs express api',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const { data } = await axios.get('https://www.freelancer.com/api/projects/0.1/projects/active/', {
        params: { query, limit: 20, job_details: true, full_description: false, sort_field: 'time_updated' },
        headers: { 'User-Agent': 'JobMonitor/1.0', Accept: 'application/json' },
        timeout: 12000,
      });
      for (const proj of data?.result?.projects ?? []) {
        const id = `fl_${proj.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const b      = proj.budget;
        const salary = b ? `$${b.minimum ?? '?'}–$${b.maximum ?? '?'} USD` : null;
        jobs.push({
          id, salary,
          title:    proj.title    ?? 'Sin título',
          company:  'Proyecto freelance',
          link:     `https://www.freelancer.com/projects/${proj.seo_url ?? proj.id}`,
          remote:   true,
          location: 'Remoto',
          modality: 'Freelance',
          source:   'Freelancer.com',
        });
      }
    } catch (e) { console.error(`[Freelancer.com] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 1000));
  }
  return jobs;
}

module.exports = { scrape };
