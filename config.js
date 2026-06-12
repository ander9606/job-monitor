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
  titleMustInclude: [
    // English
    'react', 'node', 'full stack', 'fullstack', 'full-stack',
    'frontend', 'front-end', 'front end',
    'backend', 'back-end', 'back end',
    'javascript', 'typescript', 'next.js', 'nextjs',
    'react native', 'mobile developer', 'web developer',
    'software developer', 'software engineer',
    // Spanish
    'desarrollador', 'desarrolladora', 'desarrollo web',
    'ingeniero de software', 'programador',
  ],
  titleExclude: [
    // Non-dev roles
    'manager', 'tester', 'scrum master', 'product owner',
    'qa engineer', 'qa analyst', 'quality assurance', 'recruiter',
    // Irrelevant tech stacks
    'devops', 'data scientist', 'data engineer', 'machine learning',
    'java developer', 'java engineer', 'desarrollador java',
    'python developer', 'desarrollador python',
    '.net developer', 'desarrollador .net', 'c# developer',
    'ruby developer', 'php developer', 'desarrollador php',
    'android developer', 'ios developer',
    'salesforce', 'sap', 'blockchain', 'wordpress developer',
  ],
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
