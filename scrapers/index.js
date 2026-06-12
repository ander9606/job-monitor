const config       = require('../config');
const getonboard   = require('./getonboard');
const computrabajo = require('./computrabajo');
const torre        = require('./torre');
const remoteok     = require('./remoteok');
const elempleo     = require('./elempleo');
const indeed       = require('./indeed');
const magneto      = require('./magneto');
const bumeran      = require('./bumeran');
const remotive     = require('./remotive');
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

const SCRAPERS = [
  { key: 'getonboard',   mod: getonboard,   name: 'Get on Board'   },
  { key: 'computrabajo', mod: computrabajo, name: 'Computrabajo'   },
  { key: 'torre',        mod: torre,        name: 'Torre.co'       },
  { key: 'remoteok',     mod: remoteok,     name: 'Remote OK'      },
  { key: 'elempleo',     mod: elempleo,     name: 'ElEmpleo'       },
  { key: 'indeed',       mod: indeed,       name: 'Indeed'         },
  { key: 'magneto',      mod: magneto,      name: 'Magneto'        },
  { key: 'bumeran',      mod: bumeran,      name: 'Bumeran'        },
  { key: 'remotive',     mod: remotive,     name: 'Remotive'       },
  { key: 'workana',      mod: workana,      name: 'Workana'        },
  { key: 'freelancer',   mod: freelancer,   name: 'Freelancer.com' },
  { key: 'malt',         mod: malt,         name: 'Malt'           },
];

async function runAll() {
  const allJobs = [], sources = [];
  for (const { key, mod, name } of SCRAPERS) {
    if (!config.scrapers[key]) continue;
    try {
      const jobs = await mod.scrape();
      allJobs.push(...jobs);
      sources.push(name);
      console.log(`[Scrapers] ${name}: ${jobs.length}`);
    } catch (e) {
      console.error(`[Scrapers] ${name}:`, e.message);
    }
  }
  const filtered = applyFilters(allJobs);
  console.log(`[Scrapers] Total tras filtros: ${filtered.length}/${allJobs.length}`);
  return { jobs: filtered, sources };
}

module.exports = { runAll };
