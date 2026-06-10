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
  titleMustInclude: [],
  titleExclude: ['senior', 'lead', 'architect', 'manager', 'qa', 'tester', 'scrum master'],
  scrapers: {
    getonboard:   true,
    computrabajo: true,
    torre:        true,
    remoteok:     true,
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
