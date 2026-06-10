const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
};

const PAGES = [
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=web-development', label: 'web dev' },
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=mobile-development', label: 'mobile dev' },
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=software-development', label: 'software dev' },
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const { url, label } of PAGES) {
    try {
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status !== 200) { await new Promise(r => setTimeout(r, 4000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      let $cards = $([]);
      for (const sel of ['.project-item', '[class*="project"]', '.job-card', 'article']) {
        $cards = $(sel).filter((_, el) => $(el).find('a[href*="/job/"]').length > 0);
        if ($cards.length) break;
      }

      $cards.each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2 a, h3 a, [class*="title"] a, a[href*="/job/"]').first();
        const title   = titleEl.text().trim();
        if (!title) return;

        const href   = titleEl.attr('href') || '';
        const id     = `wk_${href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const budget = $el.find('[class*="budget"],[class*="price"],[class*="amount"]').first().text().trim() || null;
        const link   = href.startsWith('http') ? href : `https://www.workana.com${href}`;

        jobs.push({ id, title, company: 'Proyecto freelance', link, salary: budget,
          remote: true, location: 'Remoto', modality: 'Freelance', source: 'Workana' });
        found++;
      });
      console.log(`[Workana] "${label}": ${found}`);
    } catch (e) { console.error(`[Workana] "${label}":`, e.message); }
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));
  }
  return jobs;
}

module.exports = { scrape };
