require('dotenv').config();
const axios       = require('axios');
const recommender = require('./recommender');

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const SOURCE_EMOJI = {
  'Get on Board':   '🟢',
  'Computrabajo':   '🔵',
  'Torre.co':       '🟡',
  'Remote OK':      '🟠',
  'ElEmpleo':       '🔴',
  'Indeed':         '🟣',
  'Magneto':        '🟩',
  'Bumeran':        '🫐',
  'Remotive':       '🌐',
  'Workana':        '🟤',
  'Freelancer.com': '⚫',
  'Malt':           '🔷',
};

function escapeHtml(str = '') {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatJob(job) {
  const emoji    = SOURCE_EMOJI[job.source] || '⚪';
  const salary   = job.salary   ? `\n💰 ${escapeHtml(job.salary)}`  : '';
  const remote   = job.remote   ? '\n🏠 <b>Remoto</b>'              : (job.location ? `\n📍 ${escapeHtml(job.location)}` : '');
  const modality = job.modality ? ` · ${job.modality}`              : '';

  const tips     = recommender.getRecommendations(job);
  const tipsText = '\n\n📚 <b>Practica para esta entrevista:</b>\n' + tips.map(t => `• ${t}`).join('\n');

  return [
    `${emoji} <b>${escapeHtml(job.title)}</b>`,
    `🏢 ${escapeHtml(job.company || 'Sin especificar')}`,
    `📌 ${job.source}${salary}${remote}${modality}`,
    tipsText,
  ].join('\n');
}

async function sendMessage(text, replyMarkup = null) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[Notifier] Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en .env');
    return false;
  }
  try {
    const payload = {
      chat_id: CHAT_ID, text, parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, payload);
    return true;
  } catch (err) {
    console.error('[Notifier]', err.response?.data?.description || err.message);
    return false;
  }
}

async function notifyJobs(jobs) {
  if (!jobs.length) return;
  await sendMessage(
    `🚨 <b>${jobs.length} nueva${jobs.length > 1 ? 's' : ''} oferta${jobs.length > 1 ? 's' : ''}</b>\n` +
    `<i>${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</i>`
  );
  for (const job of jobs) {
    await sendMessage(formatJob(job), {
      inline_keyboard: [[{ text: '📝 Ver y Aplicar', url: job.link }]],
    });
    await new Promise(r => setTimeout(r, 400));
  }
}

async function notifySummary({ checked, found, sources }) {
  await sendMessage([
    `✅ <b>Revisión completada</b>`,
    `📊 Fuentes: ${sources.join(', ')}`,
    `🔍 Encontradas: ${checked}`,
    `🆕 Nuevas: ${found}`,
    `🕐 ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`,
  ].join('\n'));
}

async function sendJobCard(job) {
  await sendMessage(formatJob(job), {
    inline_keyboard: [[{ text: '📝 Ver y Aplicar', url: job.link }]],
  });
}

module.exports = { notifyJobs, notifySummary, sendMessage, sendJobCard };
