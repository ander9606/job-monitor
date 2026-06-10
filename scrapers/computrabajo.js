const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
  'Cache-Control':   'no-cache',
};

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
      const url = `https://co.computrabajo.com/ofertas-de-trabajo?q=${encodeURIComponent(query)}&l=bogota-dc`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status === 403) { await new Promise(r=>setTimeout(r,5000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;
      let $cards = $([]);
      for (const sel of ['article.box_offer','div[data-code]','.offerList article','article[data-code]']) {
        $cards = $(sel);
        if ($cards.length) break;
      }

      if (!$cards.length) {
        $('a[href*="/oferta-de-trabajo"]').each((_,el) => {
          const href = $(el).attr('href') || '';
          const id   = `ct_${href.split('/').pop()}`;
          if (seen.has(id) || !href) return;
          seen.add(id);
          jobs.push({ id, title: $(el).text().trim() || 'Ver oferta', company: '',
            link: href.startsWith('http') ? href : `https://co.computrabajo.com${href}`,
            remote: false, source: 'Computrabajo' });
          found++;
        });
      } else {
        $cards.each((_,el) => {
          const $el  = $(el);
          const code = $el.attr('data-code') || $el.find('a').first().attr('href') || '';
          const id   = `ct_${code.toString().replace(/\D/g,'').slice(-10)||Math.random()}`;
          if (seen.has(id)) return;
          seen.add(id);
          const title   = $el.find('h2,.fs18,[class*="title"]').first().text().trim();
          const company = $el.find('.fs16,[class*="company"],[class*="empresa"]').first().text().trim();
          const href    = $el.find('a[href*="oferta"]').first().attr('href') || code;
          const link    = href.startsWith('http') ? href : `https://co.computrabajo.com${href}`;
          const salary  = $el.find(
            '[class*="salary"],[class*="salario"],[class*="remuner"],[itemprop*="salary"],' +
            'p.fs11,.tag.green,.tag.blue,[class*="tag_sal"]'
          ).first().text().trim() || null;
          const remote  = $el.text().toLowerCase().includes('remoto');
          if (!title) return;
          jobs.push({ id, title, company, link, salary, remote, source: 'Computrabajo' });
          found++;
        });
      }
      console.log(`[Computrabajo] "${query}": ${found}`);
    } catch (e) { console.error(`[Computrabajo] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 2500 + Math.random()*1500));
  }
  return jobs;
}

module.exports = { scrape };
