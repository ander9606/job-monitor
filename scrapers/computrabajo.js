const axios   = require('axios');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BASE_HEADERS = {
  'User-Agent':                UA,
  'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language':           'es-CO,es;q=0.9,en;q=0.8',
  'Accept-Encoding':           'gzip, deflate, br',
  'Cache-Control':             'no-cache',
  'Pragma':                    'no-cache',
  'Sec-Ch-Ua':                 '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile':          '?0',
  'Sec-Ch-Ua-Platform':        '"Windows"',
  'Sec-Fetch-Dest':            'document',
  'Sec-Fetch-Mode':            'navigate',
  'Sec-Fetch-Site':            'same-origin',
  'Sec-Fetch-User':            '?1',
  'Upgrade-Insecure-Requests': '1',
};

const QUERIES = [
  'desarrollador full stack',
  'node.js developer',
  'react developer',
  'software developer colombia',
];

function isBlocked(html) {
  return /just a moment|cf-browser-verification|_cf_chl|cf_clearance|enable javascript/i.test(html);
}

async function getSession() {
  try {
    const res = await axios.get('https://co.computrabajo.com/', {
      headers: { ...BASE_HEADERS, 'Sec-Fetch-Site': 'none' },
      timeout: 10000, validateStatus: s => s < 500,
    });
    return (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  } catch { return ''; }
}

async function scrape() {
  const jobs = [], seen = new Set();
  const cookie = await getSession();
  const headers = { ...BASE_HEADERS, ...(cookie ? { Cookie: cookie } : {}) };

  for (const query of QUERIES) {
    try {
      const url = `https://co.computrabajo.com/ofertas-de-trabajo?q=${encodeURIComponent(query)}&l=bogota-dc`;
      const { data, status } = await axios.get(url, {
        headers: { ...headers, Referer: 'https://www.google.com/' },
        timeout: 15000, validateStatus: s => s < 500,
      });

      if (status === 403 || status === 429) { await new Promise(r => setTimeout(r, 6000)); continue; }
      if (isBlocked(data)) { console.warn(`[Computrabajo] Cloudflare bloqueó "${query}"`); continue; }

      const $ = cheerio.load(data);
      let found = 0, $cards = $([]);

      for (const sel of ['article.box_offer', 'div[data-code]', '.offerList article', 'article[data-code]', 'article']) {
        $cards = $(sel).filter((_, el) => $(el).find('h2,h3').length > 0);
        if ($cards.length) break;
      }

      if (!$cards.length) {
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
      } else {
        $cards.each((_, el) => {
          const $el  = $(el);
          const code = $el.attr('data-code') || $el.find('a').first().attr('href') || '';
          const id   = `ct_${code.toString().replace(/\D/g, '').slice(-10) || Math.random().toString(36).slice(2)}`;
          if (seen.has(id)) return;
          seen.add(id);
          const title   = $el.find('h2, h3, .fs18, [class*="title"]').first().text().trim();
          const company = $el.find('.fs16, [class*="company"], [class*="empresa"]').first().text().trim();
          const href    = $el.find('a[href*="oferta"]').first().attr('href') || code;
          const link    = href.startsWith('http') ? href : `https://co.computrabajo.com${href}`;
          const salary  = $el.find(
            '[class*="salary"],[class*="salario"],[class*="remuner"],[itemprop*="salary"],p.fs11,.tag.green,.tag.blue'
          ).first().text().trim() || null;
          const remote  = /remoto/i.test($el.text());
          if (!title) return;
          jobs.push({ id, title, company, link, salary, remote, source: 'Computrabajo' });
          found++;
        });
      }
      console.log(`[Computrabajo] "${query}": ${found}`);
    } catch (e) { console.error(`[Computrabajo] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
  }
  return jobs;
}

module.exports = { scrape };
