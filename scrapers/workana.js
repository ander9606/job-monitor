const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const PAGES = [
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=web-development',    label: 'web dev'     },
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=mobile-development', label: 'mobile dev'  },
  { url: 'https://www.workana.com/jobs?area=it-programming&language=es&subcategory=software-development',label: 'software dev'},
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const { url, label } of PAGES) {
    try {
      const html = await getHtml(url, '.project-item, [class*="project"], a[href*="/job/"]');
      const $    = cheerio.load(html);
      let found  = 0, $cards = $([]);

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
    await new Promise(r => setTimeout(r, 1500));
  }
  return jobs;
}

module.exports = { scrape };
