const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es,en;q=0.9',
};

const QUERIES = [
  { q: 'full-stack-developer', label: 'full stack' },
  { q: 'react-developer',      label: 'react'      },
  { q: 'nodejs-developer',     label: 'nodejs'     },
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const { q, label } of QUERIES) {
    try {
      const url = `https://www.malt.com/s?q=${q}&type=mission`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status !== 200) { await new Promise(r => setTimeout(r, 3000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      $('[class*="mission"], [class*="card-mission"], article[data-id]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2 a, h3 a, [class*="title"] a').first();
        const title   = titleEl.text().trim();
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
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
  }
  return jobs;
}

module.exports = { scrape };
