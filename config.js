module.exports = {
  keywords: [
    'full stack developer',
    'desarrollador full stack',
    'node.js developer',
    'react developer',
    'react native developer',
    'backend developer',
    'software developer',
    'software engineer',
  ],
  mySkills: (process.env.MY_SKILLS || 'react,node,full stack,react native,backend')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  titleMustInclude: [],
  titleExclude: ['senior', 'lead', 'architect', 'manager', 'qa', 'tester', 'scrum master'],
  scrapers: {
    getonboard:   true,   // ✅ API oficial
    computrabajo: false,  // ❌ Cloudflare bloquea IPs de datacenter
    torre:        true,   // ✅ API oficial
    remoteok:     false,  // ❌ cobra por aplicar
    elempleo:     false,  // ❌ Cloudflare bloquea IPs de datacenter
    indeed:       false,  // ❌ Cloudflare bloquea IPs de datacenter
    magneto:      true,   // ⚠️  SPA, resultados variables
    bumeran:      false,  // ❌ SPA + Cloudflare
    remotive:     true,   // ✅ API gratuita, jobs remotos dev
    workana:      true,   // ⚠️  SPA, resultados variables
    freelancer:   false,  // ❌ requiere OAuth
    malt:         false,  // ❌ SPA + bloqueo cloud
  },
  schedule: process.env.CHECK_INTERVAL_HOURS
    ? `0 */${process.env.CHECK_INTERVAL_HOURS} * * *`
    : '0 */2 * * *',
};
