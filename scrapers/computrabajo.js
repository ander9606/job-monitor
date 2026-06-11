const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const QUERIES = [
  'desarrollador full stack',
  'node.js developer',
  'react developer',
  'software developer colombia',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url  = `https://co.computrabajo.com/ofertas-de-trabajo?q=${encodeURIComponent(query)}&l=bogota-dc`;
      const html = await getHtml(url, 'article, [data-code]');
      const $    = cheerio.load(html);
      let found  = 0, $cards = $([]);

      for (const sel of ['article.box_offer', 'div[data-code]', '.offerList article', 'article[data-code]', 'article']) {
        $cards = $(sel).filter((_, el) => $(el).find('h2,h3').length > 0);
        if ($cards.length) break;
      }

      $cards.each((_, el) => {
        const $el   = $(el);
        const code  = $el.attr('data-code') || $el.find('a').first().attr('href') || '';
        const id    = `ct_${code.toString().replace(/\D/g, '').slice(-10) || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);
        const title   = $el.find('h2, h3, .fs18, [class*="title"]').first().text().trim();
        const company = $el.find('.fs16, [class*="company"], [class*="empresa"]').first().text().trim();
        const href    = $el.find('a[href*="oferta"]').first().attr('href') || code;
        const link    = href.startsWith('http') ? href : `https://co.computrabajo.com${href}`;
        const salary  = $el.find('[class*="salary"],[class*="salario"],p.fs11,.tag.green,.tag.blue').first().text().trim() || null;
        const remote  = /remoto/i.test($el.text());
        if (!title) return;
        jobs.push({ id, title, company, link, salary, remote, source: 'Computrabajo' });
        found++;
      });

      if (!found) {
        $('a[href*="/oferta-de-trabajo"]').each((_, el) => {
          const href = $(el).attr('href') || '';
          const id   = `ct_${href.split('/').pop()}`;
          if (seen.has(id) || !href) return;
          seen.add(id);
          jobs.push({ id, title: $(el).text().trim() || 'Ver oferta', company: '',
            link: href.startsWith('http') ? href : `https://co.computrabajo.com${href}`,
            remote: false, source: 'Computrabajo' });
          found++;
        });
      }
      console.log(`[Computrabajo] "${query}": ${found}`);
    } catch (e) { console.error(`[Computrabajo] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 2000));
  }
  return jobs;
}

module.exports = { scrape };
