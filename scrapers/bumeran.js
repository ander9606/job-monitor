const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const QUERIES = [
  'full stack developer',
  'desarrollador react',
  'node developer colombia',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url  = `https://www.bumeran.com.co/empleos.html?q=${encodeURIComponent(query)}&reciente=true`;
      const html = await getHtml(url, '[class*="PostingCard"], article, [data-qa="posting-list-item"]');
      const $    = cheerio.load(html);
      let found  = 0;

      $('[class*="PostingCard"], [data-qa="posting-list-item"], article[class*="posting"]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('a[data-qa="posting-title-link"], h2 a, h3 a, [class*="title"] a').first();
        const title   = (titleEl.text() || $el.find('h2,h3').first().text()).trim();
        if (!title) return;

        const href = titleEl.attr('href') || $el.find('a').first().attr('href') || '';
        const id   = `bum_${href.split('-').pop()?.replace(/\D/g,'') || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[data-qa="posting-company-name"],[class*="company"]').first().text().trim();
        const location = $el.find('[data-qa="posting-location"],[class*="location"]').first().text().trim();
        const salary   = $el.find('[data-qa="posting-salary"],[class*="salary"]').first().text().trim() || null;
        const remote   = /remoto|teletrabajo/i.test($el.text());
        const link     = href.startsWith('http') ? href : `https://www.bumeran.com.co${href}`;

        jobs.push({ id, title, company, link, salary, remote, location: location || 'Colombia', source: 'Bumeran' });
        found++;
      });
      console.log(`[Bumeran] "${query}": ${found}`);
    } catch (e) { console.error(`[Bumeran] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 2000));
  }
  return jobs;
}

module.exports = { scrape };
