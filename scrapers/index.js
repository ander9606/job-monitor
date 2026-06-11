const config       = require('../config');
const getonboard   = require('./getonboard');
const computrabajo = require('./computrabajo');
const torre        = require('./torre');
const remoteok     = require('./remoteok');
const elempleo     = require('./elempleo');
const indeed       = require('./indeed');
const magneto      = require('./magneto');
const bumeran      = require('./bumeran');
const workana      = require('./workana');
const freelancer   = require('./freelancer');
const malt         = require('./malt');

const EXCLUDE = config.titleExclude.map(w => w.toLowerCase());
const MUST    = config.titleMustInclude.map(w => w.toLowerCase());

function applyFilters(jobs) {
  return jobs.filter(({ title }) => {
    const t = title.toLowerCase();
    if (EXCLUDE.some(w => t.includes(w))) return false;
    if (MUST.length > 0 && !MUST.some(w => t.includes(w))) return false;
    return true;
  });
}

async function runAll() {
  const allJobs = [], sources = [];
  if (config.scrapers.getonboard) {
    try {
      const jobs = await getonboard.scrape();
      allJobs.push(...jobs); sources.push('Get on Board');
      console.log(`[Scrapers] Get on Board: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] GetOnBoard:', e.message); }
  }
  if (config.scrapers.computrabajo) {
    try {
      const jobs = await computrabajo.scrape();
      allJobs.push(...jobs); sources.push('Computrabajo');
      console.log(`[Scrapers] Computrabajo: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Computrabajo:', e.message); }
  }
  if (config.scrapers.torre) {
    try {
      const jobs = await torre.scrape();
      allJobs.push(...jobs); sources.push('Torre.co');
      console.log(`[Scrapers] Torre.co: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Torre.co:', e.message); }
  }
  if (config.scrapers.remoteok) {
    try {
      const jobs = await remoteok.scrape();
      allJobs.push(...jobs); sources.push('Remote OK');
      console.log(`[Scrapers] Remote OK: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Remote OK:', e.message); }
  }
  if (config.scrapers.elempleo) {
    try {
      const jobs = await elempleo.scrape();
      allJobs.push(...jobs); sources.push('ElEmpleo');
      console.log(`[Scrapers] ElEmpleo: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] ElEmpleo:', e.message); }
  }
  if (config.scrapers.indeed) {
    try {
      const jobs = await indeed.scrape();
      allJobs.push(...jobs); sources.push('Indeed');
      console.log(`[Scrapers] Indeed: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Indeed:', e.message); }
  }
  if (config.scrapers.magneto) {
    try {
      const jobs = await magneto.scrape();
      allJobs.push(...jobs); sources.push('Magneto');
      console.log(`[Scrapers] Magneto: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Magneto:', e.message); }
  }
  if (config.scrapers.bumeran) {
    try {
      const jobs = await bumeran.scrape();
      allJobs.push(...jobs); sources.push('Bumeran');
      console.log(`[Scrapers] Bumeran: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Bumeran:', e.message); }
  }
  if (config.scrapers.workana) {
    try {
      const jobs = await workana.scrape();
      allJobs.push(...jobs); sources.push('Workana');
      console.log(`[Scrapers] Workana: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Workana:', e.message); }
  }
  if (config.scrapers.freelancer) {
    try {
      const jobs = await freelancer.scrape();
      allJobs.push(...jobs); sources.push('Freelancer.com');
      console.log(`[Scrapers] Freelancer.com: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Freelancer.com:', e.message); }
  }
  if (config.scrapers.malt) {
    try {
      const jobs = await malt.scrape();
      allJobs.push(...jobs); sources.push('Malt');
      console.log(`[Scrapers] Malt: ${jobs.length}`);
    } catch (e) { console.error('[Scrapers] Malt:', e.message); }
  }
  const filtered = applyFilters(allJobs);
  console.log(`[Scrapers] Total tras filtros: ${filtered.length}/${allJobs.length}`);
  return { jobs: filtered, sources };
}

module.exports = { runAll };
