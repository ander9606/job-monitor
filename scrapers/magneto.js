const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Dest':  'document',
  'Sec-Fetch-Mode':  'navigate',
  'Sec-Fetch-Site':  'none',
};

const QUERIES = [
  'full stack developer',
  'react developer',
  'node developer',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url = `https://magneto.co/empleos?q=${encodeURIComponent(query)}`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status !== 200) { await new Promise(r => setTimeout(r, 3000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      // Magneto usa SSR con Next.js — buscar tarjetas de empleo
      $('article, [class*="JobCard"], [class*="job-card"], [class*="vacancy"]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2 a, h3 a, [class*="title"] a, a[href*="/empleo"]').first();
        const title   = (titleEl.text() || $el.find('h2,h3').first().text()).trim();
        if (!title) return;

        const href = titleEl.attr('href') || $el.find('a[href*="/empleo"]').first().attr('href') || '';
        const id   = `mag_${href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[class*="company"], [class*="empresa"]').first().text().trim();
        const location = $el.find('[class*="city"], [class*="location"], [class*="lugar"]').first().text().trim();
        const salary   = $el.find('[class*="salary"], [class*="salario"]').first().text().trim() || null;
        const remote   = /remoto|teletrabajo/i.test($el.text());
        const link     = href.startsWith('http') ? href : `https://magneto.co${href}`;

        jobs.push({ id, title, company, link, salary, remote, location: location || 'Colombia', source: 'Magneto' });
        found++;
      });

      // Fallback: cualquier link de empleo en la página
      if (!found) {
        $('a[href*="/empleo/"]').each((_, el) => {
          const href  = $(el).attr('href') || '';
          const title = $(el).text().trim();
          if (!title || title.length < 5) return;
          const id = `mag_${href.split('/').filter(Boolean).pop()}`;
          if (seen.has(id)) return;
          seen.add(id);
          jobs.push({ id, title, company: '', link: href.startsWith('http') ? href : `https://magneto.co${href}`,
            remote: false, location: 'Colombia', source: 'Magneto' });
          found++;
        });
      }

      console.log(`[Magneto] "${query}": ${found}`);
    } catch (e) { console.error(`[Magneto] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 1200));
  }
  return jobs;
}

module.exports = { scrape };
