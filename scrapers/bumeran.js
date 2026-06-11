const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Ch-Ua':       '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Fetch-Dest':  'document',
  'Sec-Fetch-Mode':  'navigate',
  'Sec-Fetch-Site':  'none',
};

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
      const url = `https://www.bumeran.com.co/empleos.html?q=${encodeURIComponent(query)}&reciente=true`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status !== 200) { await new Promise(r => setTimeout(r, 4000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      $('[class*="PostingCard"], [data-qa="posting-list-item"], article[class*="posting"]').each((_, el) => {
        const $el     = $(el);
        const titleEl = $el.find('a[data-qa="posting-title-link"], h2 a, h3 a, [class*="title"] a').first();
        const title   = (titleEl.text() || $el.find('h2,h3').first().text()).trim();
        if (!title) return;

        const href = titleEl.attr('href') || $el.find('a').first().attr('href') || '';
        const id   = `bum_${href.split('-').pop()?.replace(/\D/g,'') || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[data-qa="posting-company-name"], [class*="company"]').first().text().trim();
        const location = $el.find('[data-qa="posting-location"], [class*="location"]').first().text().trim();
        const salary   = $el.find('[data-qa="posting-salary"], [class*="salary"]').first().text().trim() || null;
        const remote   = /remoto|teletrabajo/i.test($el.text());
        const link     = href.startsWith('http') ? href : `https://www.bumeran.com.co${href}`;

        jobs.push({ id, title, company, link, salary, remote, location: location || 'Colombia', source: 'Bumeran' });
        found++;
      });

      // Fallback por links directos
      if (!found) {
        $('a[href*="/empleos-"]').each((_, el) => {
          const href  = $(el).attr('href') || '';
          const title = $(el).text().trim();
          if (!title || title.length < 5) return;
          const id = `bum_${href.split('-').pop()?.replace(/\D/g,'') || Math.random().toString(36).slice(2)}`;
          if (seen.has(id)) return;
          seen.add(id);
          jobs.push({ id, title, company: '', link: href.startsWith('http') ? href : `https://www.bumeran.com.co${href}`,
            remote: false, location: 'Colombia', source: 'Bumeran' });
          found++;
        });
      }

      console.log(`[Bumeran] "${query}": ${found}`);
    } catch (e) { console.error(`[Bumeran] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
  }
  return jobs;
}

module.exports = { scrape };
