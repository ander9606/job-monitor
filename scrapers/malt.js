const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const QUERIES = [
  { q: 'full-stack-developer', label: 'full stack' },
  { q: 'react-developer',      label: 'react'      },
  { q: 'nodejs-developer',     label: 'nodejs'     },
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const { q, label } of QUERIES) {
    try {
      const url  = `https://www.malt.com/s?q=${q}&type=mission`;
      const html = await getHtml(url, '[class*="mission"], [class*="card"], article');
      const $    = cheerio.load(html);
      let found  = 0;

      $('[class*="mission"], [class*="card-mission"], article[data-id], article').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2 a, h3 a, [class*="title"] a').first();
        const title   = (titleEl.text() || $el.find('h2,h3').first().text()).trim();
        if (!title) return;

        const href = titleEl.attr('href') || $el.find('a').first().attr('href') || '';
        const id   = `malt_${href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const budget = $el.find('[class*="budget"],[class*="rate"],[class*="price"]').first().text().trim() || null;
        const link   = href.startsWith('http') ? href : `https://www.malt.com${href}`;

        jobs.push({ id, title, company: 'Proyecto freelance', link, salary: budget,
          remote: true, location: 'Remoto', modality: 'Freelance', source: 'Malt' });
        found++;
      });
      console.log(`[Malt] "${label}": ${found}`);
    } catch (e) { console.error(`[Malt] "${label}":`, e.message); }
    await new Promise(r => setTimeout(r, 1500));
  }
  return jobs;
}

module.exports = { scrape };
