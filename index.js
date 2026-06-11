require('dotenv').config();
require('./utils/http'); // configure axios defaults and retries
const cron     = require('node-cron');
const config   = require('./config');
const scrapers = require('./scrapers');
const db       = require('./db');
const notifier = require('./notifier');
const bot      = require('./bot');
const { closeBrowser } = require('./scrapers/browser');

const RUN_ONCE = process.argv.includes('--once');

async function check() {
  const t0 = Date.now();
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`[Monitor] ${new Date().toLocaleString('es-CO',{timeZone:'America/Bogota'})}`);
  try {
    const { jobs, sources } = await scrapers.runAll();
    db.saveLastJobs(jobs);
    const newJobs = db.filterNew(jobs);
    console.log(`[Monitor] Nuevas: ${newJobs.length}`);
    if (newJobs.length > 0) await notifier.notifyJobs(newJobs);
    if (RUN_ONCE) await notifier.notifySummary({ checked: jobs.length, found: newJobs.length, sources });
    db.saveStats({ found: jobs.length, notified: newJobs.length, source: sources.join(',') });
  } catch (err) {
    console.error('[Monitor] Error:', err.message);
  }
  console.log(`[Monitor] Listo en ${((Date.now()-t0)/1000).toFixed(1)}s`);
}

if (RUN_ONCE) {
  check().then(() => { console.log('Revisa Telegram.'); process.exit(0); });
} else {
  console.log(`[Monitor] 🟢 Activo | Schedule: ${config.schedule}`);
  bot.startPolling().catch(e => console.error('[Bot]', e.message));
  check();
  cron.schedule(config.schedule, check, { timezone: 'America/Bogota' });

  process.on('SIGTERM', async () => {
    console.log('[Monitor] SIGTERM received, exiting gracefully...');
    await closeBrowser();
    process.exit(0);
  });
}
