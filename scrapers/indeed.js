const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-CO,es;q=0.9',
  'Referer':         'https://co.indeed.com/',
};

const QUERIES = [
  'desarrollador full stack',
  'node react developer',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url = `https://co.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Colombia&sort=date`;
      const { data, status } = await axios.get(url, {
        headers: HEADERS, timeout: 15000,
        validateStatus: s => s < 500,
      });
      if (status === 403 || status === 429) { await new Promise(r => setTimeout(r, 8000)); continue; }

      const $ = cheerio.load(data);
      let found = 0;

      $('div.job_seen_beacon, .resultContent, [class*="cardOutline"]').each((_, el) => {
        const $el = $(el);
        const titleEl = $el.find('h2.jobTitle a, [class*="jobTitle"] a').first();
        const title   = titleEl.text().trim();
        if (!title) return;

        const href = titleEl.attr('href') || '';
        const jk   = href.match(/jk=([a-f0-9]+)/)?.[1];
        const id   = `indeed_${jk || Math.random().toString(36).slice(2)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const company  = $el.find('[data-testid="company-name"],.companyName').first().text().trim();
        const location = $el.find('[data-testid="text-location"],.companyLocation').first().text().trim();
        const salary   = $el.find('[class*="salary"],.salary-snippet').first().text().trim() || null;
        const link     = href.startsWith('http') ? href : `https://co.indeed.com${href}`;
        const remote   = /remoto|remote/i.test(location);

        jobs.push({ id, title, company, link, salary, remote, location, source: 'Indeed' });
        found++;
      });
      console.log(`[Indeed] "${query}": ${found}`);
    } catch (e) { console.error(`[Indeed] "${query}":`, e.message); }
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
  }
  return jobs;
}

module.exports = { scrape };
