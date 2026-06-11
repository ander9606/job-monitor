const cheerio = require('cheerio');
const { getHtml } = require('./browser');

const QUERIES = [
  'desarrollador full stack',
  'node react developer',
  'software developer',
];

async function scrape() {
  const jobs = [], seen = new Set();
  for (const query of QUERIES) {
    try {
      const url  = `https://co.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Colombia&sort=date`;
      const html = await getHtml(url, '.job_seen_beacon, .resultContent');
      const $    = cheerio.load(html);
      let found  = 0;

      $('div.job_seen_beacon, .resultContent, [class*="cardOutline"]').each((_, el) => {
        const $el     = $(el);
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
    await new Promise(r => setTimeout(r, 2000));
  }
  return jobs;
}

module.exports = { scrape };
