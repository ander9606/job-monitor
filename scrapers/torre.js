const axios = require('axios');

const QUERIES = ['full-stack', 'react', 'node-js', 'react-native'];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const tag of QUERIES) {
    try {
      const { data } = await axios.post(
        'https://torre.co/api/opportunities/_search',
        { and: [{ 'skill/role': [tag] }], size: 20, aggregate: false },
        {
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'JobMonitor/1.0' },
          timeout: 12000,
        }
      );
      for (const opp of data?.results ?? []) {
        const id = `torre_${opp.id ?? opp.publicId}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const comp = opp.compensation;
        const salary = comp
          ? `${comp.currency} ${comp.minAmount ?? '?'}–${comp.maxAmount ?? '?'}/mes`
          : null;
        jobs.push({
          id, salary,
          title:    opp.objective                   ?? 'Sin título',
          company:  opp.organizations?.[0]?.name    ?? 'Sin empresa',
          link:     `https://torre.co/opportunities/${opp.id}`,
          remote:   opp.remote                      ?? false,
          location: opp.locations?.[0]?.name        ?? 'Colombia',
          modality: null,
          source:   'Torre.co',
        });
      }
    } catch (e) { console.error(`[Torre.co] "${tag}":`, e.message); }
    await new Promise(r => setTimeout(r, 600));
  }
  return jobs;
}

module.exports = { scrape };
