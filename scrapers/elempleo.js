const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const QUERIES = [
  'desarrollador full stack',
  'desarrollador node',
  'desarrollador react',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url  = `https://www.elempleo.com/co/ofertas-empleo/colombia/?q=${encodeURIComponent(query)}`;
      const html = await getHtml(url, '.item-oferta, [class*="oferta"], article');
      const $    = cheerio.load(html);
      let found  = 0;

      $('.item-oferta, .job-item, [class*="oferta"], article[id]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('h2,h3,[class*="titulo"],[class*="title"]').first();
        const title   = titleEl.text().trim();
        if (!title) return;

        const href = titleEl.find('a').attr('href') || $el.find('a').first().attr('href') || '';
        const id   = `ee_${href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[class*="empresa"],[class*="company"]').first().text().trim();
        const location = $el.find('[class*="ciudad"],[class*="location"]').first().text().trim();
        const link     = href.startsWith('http') ? href : `https://www.elempleo.com${href}`;
        const remote   = /remoto|teletrabajo/i.test($el.text());

        jobs.push({ id, title, company, link, remote, location: location || 'Colombia', source: 'ElEmpleo' });
        found++;
      });
      console.log(`[ElEmpleo] "${query}": ${found}`);
    } catch (e) { console.error(`[ElEmpleo] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 2000));
  }
  return jobs;
}

module.exports = { scrape };
