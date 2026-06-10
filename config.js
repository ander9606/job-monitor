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
    getonboard:   true,
    computrabajo: true,
    torre:        true,
    remoteok:     false,
    elempleo:     true,
    indeed:       true,
    workana:      true,
    freelancer:   true,
    malt:         true,
  },
  schedule: process.env.CHECK_INTERVAL_HOURS
    ? `0 */${process.env.CHECK_INTERVAL_HOURS} * * *`
    : '0 */2 * * *',
};
