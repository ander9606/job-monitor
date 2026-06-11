require('dotenv').config();
const axios    = require('axios');
const config   = require('./config');
const db       = require('./db');
const notifier = require('./notifier');
const scrapers = require('./scrapers');

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID?.toString();

const COLOMBIA_SOURCES  = new Set(['Get on Board', 'Computrabajo', 'ElEmpleo', 'Indeed', 'Torre.co']);
const FREELANCE_SOURCES = new Set(['Workana', 'Freelancer.com', 'Malt']);
const MAX_CARDS = 8;

const SOURCE_CMD = {
  '/getonboard':   'Get on Board',
  '/computrabajo': 'Computrabajo',
  '/torre':        'Torre.co',
  '/elempleo':     'ElEmpleo',
  '/indeed':       'Indeed',
  '/magneto':      'Magneto',
  '/bumeran':      'Bumeran',
  '/workana':      'Workana',
  '/freelancer':   'Freelancer.com',
  '/malt':         'Malt',
};

let offset   = 0;
let scanning = false;

async function getUpdates() {
  try {
    const { data } = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`, {
      params: { offset, timeout: 30, allowed_updates: ['message'] },
      timeout: 35000,
    });
    return data.result ?? [];
  } catch { return []; }
}

async function sendCards(jobs, emptyMsg) {
  if (!jobs.length) { await notifier.sendMessage(emptyMsg); return; }
  const slice = jobs.slice(0, MAX_CARDS);
  await notifier.sendMessage(
    `📋 <b>${jobs.length} oferta${jobs.length > 1 ? 's' : ''} encontrada${jobs.length > 1 ? 's' : ''}</b>` +
    (jobs.length > MAX_CARDS ? ` (mostrando ${MAX_CARDS})` : '')
  );
  for (const job of slice) {
    await notifier.sendJobCard(job);
    await new Promise(r => setTimeout(r, 300));
  }
}

async function handleCommand(text) {
  const cmd = text.trim().toLowerCase().split(/\s+/)[0];

  switch (cmd) {
    case '/start':
    case '/ayuda':
      await notifier.sendMessage(
        `🤖 <b>Job Monitor — Comandos</b>\n\n` +
        `<b>Por filtro:</b>\n` +
        `/colombia — Empleos en Colombia\n` +
        `/remoto — Solo trabajos 100% remotos\n` +
        `/freelance — Proyectos Workana · Freelancer · Malt\n` +
        `/habilidades — Ofertas según tu stack (MY_SKILLS)\n\n` +
        `<b>Por portal:</b>\n` +
        `/getonboard · /computrabajo · /torre\n` +
        `/elempleo · /indeed · /magneto · /bumeran\n` +
        `/workana · /freelancer · /malt\n\n` +
        `<b>Acciones:</b>\n` +
        `/ahora — Revisar todos los portales ya\n` +
        `/stats — Historial de revisiones\n` +
        `/ayuda — Este mensaje`
      );
      break;

    case '/colombia': {
      const jobs = db.loadLastJobs().filter(j => COLOMBIA_SOURCES.has(j.source));
      await sendCards(jobs, '😔 Sin ofertas de Colombia en caché. Usa /ahora para revisar.');
      break;
    }

    case '/remoto': {
      const jobs = db.loadLastJobs().filter(j => j.remote);
      await sendCards(jobs, '😔 Sin ofertas remotas en caché. Usa /ahora para revisar.');
      break;
    }

    case '/freelance': {
      const jobs = db.loadLastJobs().filter(j => FREELANCE_SOURCES.has(j.source));
      await sendCards(jobs, '😔 Sin proyectos freelance en caché. Usa /ahora para revisar.');
      break;
    }

    case '/habilidades': {
      const skills = config.mySkills;
      const jobs = db.loadLastJobs().filter(j =>
        skills.some(s => j.title.toLowerCase().includes(s))
      );
      await sendCards(
        jobs,
        `😔 Sin ofertas para tu stack (<code>${skills.join(', ')}</code>).\n` +
        `Edita MY_SKILLS en .env o usa /ahora.`
      );
      break;
    }

    case '/ahora': {
      if (scanning) { await notifier.sendMessage('⏳ Ya hay una revisión en curso, espera un momento.'); break; }
      scanning = true;
      await notifier.sendMessage('🔍 Revisando todos los portales...');
      try {
        const { jobs, sources } = await scrapers.runAll();
        db.saveLastJobs(jobs);
        const newJobs = db.filterNew(jobs);
        if (newJobs.length > 0) {
          await notifier.notifyJobs(newJobs);
        } else {
          await notifier.sendMessage(
            `✅ <b>Revisión completada</b>\n` +
            `📊 Fuentes: ${sources.join(', ')}\n` +
            `🔍 Encontradas: ${jobs.length}\n` +
            `🆕 Nuevas: 0\n` +
            `🕐 ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`
          );
        }
        db.saveStats({ found: jobs.length, notified: newJobs.length, source: sources.join(',') });
      } catch (e) {
        await notifier.sendMessage(`❌ Error en la revisión: ${e.message}`);
      } finally {
        scanning = false;
      }
      break;
    }

    case '/stats': {
      const stats = db.loadStats();
      if (!stats.length) { await notifier.sendMessage('📊 Sin estadísticas aún. Usa /ahora para hacer la primera revisión.'); break; }
      const lines = stats.slice(-5).reverse().map(s =>
        `📅 ${new Date(s.date).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n` +
        `   🔍 ${s.found} encontradas · 🆕 ${s.notified} nuevas`
      );
      await notifier.sendMessage(`📊 <b>Últimas 5 revisiones:</b>\n\n${lines.join('\n\n')}`);
      break;
    }

    default: {
      const sourceName = SOURCE_CMD[cmd];
      if (sourceName) {
        const jobs = db.loadLastJobs().filter(j => j.source === sourceName);
        const emoji = { 'Get on Board':'🟢','Computrabajo':'🔵','Torre.co':'🟡',
          'ElEmpleo':'🔴','Indeed':'🟣','Magneto':'🟩','Bumeran':'🫐','Workana':'🟤','Freelancer.com':'⚫','Malt':'🔷' }[sourceName] || '⚪';
        await sendCards(jobs, `${emoji} Sin ofertas de <b>${sourceName}</b> en caché. Usa /ahora para revisar.`);
      } else {
        await notifier.sendMessage(`❓ Comando desconocido. Usa /ayuda para ver las opciones.`);
      }
    }
  }
}

async function startPolling() {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[Bot] No configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
    return;
  }
  console.log('[Bot] 🤖 Polling activo — escuchando comandos');
  while (true) {
    const updates = await getUpdates();
    for (const update of updates) {
      offset = update.update_id + 1;
      const msg = update.message;
      if (!msg?.text?.startsWith('/')) continue;
      if (msg.chat.id.toString() !== CHAT_ID) continue;
      console.log(`[Bot] Comando recibido: ${msg.text}`);
      try { await handleCommand(msg.text); }
      catch (e) { console.error('[Bot] Error:', e.message); }
    }
  }
}

module.exports = { startPolling };
