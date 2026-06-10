const axios = require('axios');

const QUERIES = [
  'full stack',
  'desarrollador react',
  'node developer',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const { data } = await axios.get('https://api.magneto.co/v1/vacancies', {
        params: { q: query, city: 'Bogotá', limit: 20, page: 1 },
        headers: { Accept: 'application/json', 'User-Agent': 'JobMonitor/1.0' },
        timeout: 12000,
      });

      for (const item of data?.data ?? data?.vacancies ?? data?.results ?? []) {
        const id = `mag_${item.id ?? item._id}`;
        if (seen.has(id) || !id.replace('mag_undefined','')) continue;
        seen.add(id);

        const salary = item.salary_min
          ? `$${Number(item.salary_min).toLocaleString('es-CO')} – $${Number(item.salary_max || item.salary_min).toLocaleString('es-CO')} COP`
          : null;

        jobs.push({
          id,
          title:    item.title ?? item.name      ?? 'Sin título',
          company:  item.company?.name ?? item.company ?? 'Sin empresa',
          link:     item.url ?? `https://magneto.co/empleos/${item.slug ?? item.id}`,
          remote:   /remoto|teletrabajo/i.test(item.modality ?? item.work_mode ?? ''),
          location: item.city ?? item.location ?? 'Colombia',
          salary,
          source:   'Magneto',
        });
      }
    } catch (e) { console.error(`[Magneto] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 800));
  }
  return jobs;
}

module.exports = { scrape };
