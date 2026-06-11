const cheerio = require('cheerio');
const { getHtml } = require('./browser');

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
      const url  = `https://magneto.co/empleos?q=${encodeURIComponent(query)}`;
      const html = await getHtml(url, 'article, [class*="JobCard"], [class*="job-card"]');
      const $    = cheerio.load(html);
      let found  = 0;

      $('article, [class*="JobCard"], [class*="job-card"], [class*="vacancy"]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2 a, h3 a, [class*="title"] a, a[href*="/empleo"]').first();
        const title   = (titleEl.text() || $el.find('h2,h3').first().text()).trim();
        if (!title) return;

        const href = titleEl.attr('href') || $el.find('a[href*="/empleo"]').first().attr('href') || '';
        const id   = `mag_${href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[class*="company"],[class*="empresa"]').first().text().trim();
        const location = $el.find('[class*="city"],[class*="location"],[class*="lugar"]').first().text().trim();
        const salary   = $el.find('[class*="salary"],[class*="salario"]').first().text().trim() || null;
        const remote   = /remoto|teletrabajo/i.test($el.text());
        const link     = href.startsWith('http') ? href : `https://magneto.co${href}`;

        jobs.push({ id, title, company, link, salary, remote, location: location || 'Colombia', source: 'Magneto' });
        found++;
      });
      console.log(`[Magneto] "${query}": ${found}`);
    } catch (e) { console.error(`[Magneto] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 1200));
  }
  return jobs;
}

module.exports = { scrape };
