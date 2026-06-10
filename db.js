const fs   = require('fs');
const path = require('path');

const DATA_DIR        = path.join(__dirname, 'data');
const DB_FILE         = path.join(DATA_DIR, 'seen_jobs.json');
const STATS_FILE      = path.join(DATA_DIR, 'stats.json');
const LAST_JOBS_FILE  = path.join(DATA_DIR, 'last_jobs.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSeen() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) return new Set();
  try { return new Set(JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); }
  catch { return new Set(); }
}

function saveSeen(set) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify([...set], null, 2));
}

function filterNew(jobs) {
  const seen = loadSeen();
  const newJobs = jobs.filter(j => !seen.has(j.id));
  if (newJobs.length > 0) {
    newJobs.forEach(j => seen.add(j.id));
    saveSeen(seen);
  }
  return newJobs;
}

function saveStats({ found, notified, source }) {
  ensureDir();
  let stats = [];
  if (fs.existsSync(STATS_FILE)) {
    try { stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); } catch { stats = []; }
  }
  stats.push({ date: new Date().toISOString(), found, notified, source });
  if (stats.length > 500) stats = stats.slice(-500);
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); }
  catch { return []; }
}

function saveLastJobs(jobs) {
  ensureDir();
  fs.writeFileSync(LAST_JOBS_FILE, JSON.stringify(jobs, null, 2));
}

function loadLastJobs() {
  if (!fs.existsSync(LAST_JOBS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LAST_JOBS_FILE, 'utf8')); }
  catch { return []; }
}

module.exports = { filterNew, saveStats, loadStats, saveLastJobs, loadLastJobs };
