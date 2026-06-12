const axios = require('axios');

const CATEGORIES = ['software-dev', 'frontend', 'backend', 'fullstack'];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const category of CATEGORIES) {
    try {
      const { data } = await axios.get('https://remotive.com/api/remote-jobs', {
        params: { category, limit: 25 },
        headers: { Accept: 'application/json', 'User-Agent': 'JobMonitor/1.0' },
        timeout: 12000,
      });
      for (const item of data?.jobs ?? []) {
        const id = `rem_${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        jobs.push({
          id,
          title:    item.title            ?? 'Sin título',
          company:  item.company_name     ?? 'Sin empresa',
          link:     item.url              ?? '',
          remote:   true,
          location: item.candidate_required_location || 'Worldwide',
          salary:   item.salary           ?? null,
          modality: 'Remoto',
          source:   'Remotive',
        });
      }
    } catch (e) { console.error(`[Remotive] "${category}":`, e.message); }
    await new Promise(r => setTimeout(r, 600));
  }
  return jobs;
}

module.exports = { scrape };
