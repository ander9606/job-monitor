require('dotenv').config();
const axios = require('axios');

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const SOURCE_EMOJI = {
  'Get on Board': '🟢',
  'Computrabajo': '🔵',
};

function escapeHtml(str = '') {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatJob(job) {
  const emoji    = SOURCE_EMOJI[job.source] || '⚪';
  const salary   = job.salary   ? `\n💰 ${job.salary}`   : '';
  const remote   = job.remote   ? '\n🏠 <b>Remoto</b>'   : (job.location ? `\n📍 ${job.location}` : '');
  const modality = job.modality ? ` · ${job.modality}`   : '';
  return [
    `${emoji} <b>${escapeHtml(job.title)}</b>`,
    `🏢 ${escapeHtml(job.company || 'Sin especificar')}`,
    `📌 ${job.source}${salary}${remote}${modality}`,
    `🔗 <a href="${job.link}">Ver oferta</a>`,
  ].join('\n');
}

async function sendMessage(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[Notifier] Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en .env');
    return false;
  }
  try {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID, text, parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
    return true;
  } catch (err) {
    console.error('[Notifier]', err.response?.data?.description || err.message);
    return false;
  }
}

async function notifyJobs(jobs) {
  if (!jobs.length) return;
  await sendMessage(
    `🚨 <b>${jobs.length} nueva${jobs.length>1?'s':''} oferta${jobs.length>1?'s':''}</b>\n` +
    `<i>${new Date().toLocaleString('es-CO',{timeZone:'America/Bogota'})}</i>`
  );
  for (const job of jobs) {
    await sendMessage(formatJob(job));
    await new Promise(r => setTimeout(r, 400));
  }
}

async function notifySummary({ checked, found, sources }) {
  await sendMessage([
    `✅ <b>Revisión completada</b>`,
    `📊 Fuentes: ${sources.join(', ')}`,
    `🔍 Encontradas: ${checked}`,
    `🆕 Nuevas: ${found}`,
    `🕐 ${new Date().toLocaleString('es-CO',{timeZone:'America/Bogota'})}`,
  ].join('\n'));
}

module.exports = { notifyJobs, notifySummary };
