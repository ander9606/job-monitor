const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
};

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
      const url = `https://www.elempleo.com/co/ofertas-empleo/colombia/?q=${encodeURIComponent(query)}`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status === 403 || status === 429) { await new Promise(r => setTimeout(r, 5000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      $('.item-oferta, .job-item, [class*="oferta"], article[id]').each((_, el) => {
        const $el = $(el);
        const titleEl = $el.find('h2,h3,[class*="titulo"],[class*="title"]').first();
        const title = titleEl.text().trim();
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
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
  }
  return jobs;
}

module.exports = { scrape };
