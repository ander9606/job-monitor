const FREELANCE_SOURCES = new Set(['Workana', 'Freelancer.com', 'Malt']);

const FREELANCE_TIPS = [
  'Propuesta: abre con el problema del cliente, no con tu perfil',
  'Tarifa: revisa proyectos similares cerrados antes de ofertar',
  'Portafolio: enlaza 1-2 proyectos relevantes directamente en la propuesta',
  'Timeline: sé específico ("5 días hábiles") — los vagos generan dudas',
  'Cierre: termina con una pregunta concreta ("¿Tienes el diseño listo o lo definimos juntos?")',
];

const TECH_MAP = [
  {
    match: ['react native', 'react-native'],
    topics: [
      'React Native: navigation (React Navigation), FlatList, StyleSheet',
      'Expo vs CLI: diferencias y cuándo usar cada uno',
      'Estado global en mobile: Redux Toolkit o Zustand',
      'Animaciones: Animated API, Reanimated 2',
      'Publicación: App Store / Play Store, builds con EAS',
    ],
  },
  {
    match: ['react', 'frontend', 'front-end', 'front end'],
    topics: [
      'React: hooks (useState, useEffect, useCallback, useMemo, useRef)',
      'Estado global: Context API, Redux Toolkit o Zustand',
      'Performance: React.memo, lazy/Suspense, code splitting',
      'Testing: React Testing Library + Jest',
      'CSS: Flexbox, Grid, responsive, CSS-in-JS o Tailwind',
    ],
  },
  {
    match: ['node', 'backend', 'back-end', 'back end', 'express', 'api rest'],
    topics: [
      'Node.js: event loop, streams, async/await, manejo de errores',
      'REST APIs: diseño, versionado, status codes, paginación',
      'Auth: JWT, refresh tokens, OAuth2 básico',
      'Bases de datos: ORM (Prisma/Sequelize), índices, transacciones',
      'Testing: Jest + Supertest para endpoints',
    ],
  },
  {
    match: ['full stack', 'fullstack'],
    topics: [
      'React: hooks esenciales, ciclo de vida, estado',
      'Node.js / Express: APIs REST, middleware, autenticación JWT',
      'Base de datos: SQL (joins, índices) o MongoDB (agregaciones)',
      'Git: branching, merge vs rebase, pull requests',
      'Algoritmos: arrays, strings, objetos — LeetCode easy/medium',
    ],
  },
  {
    match: ['typescript', ' ts '],
    topics: [
      'TypeScript: tipos primitivos, interfaces vs type aliases',
      'Generics y utility types (Partial, Pick, Omit, Record)',
      'TypeScript en React: tipado de props, hooks, eventos',
      'Configuración: tsconfig, strict mode',
    ],
  },
  {
    match: ['python', 'django', 'flask', 'fastapi'],
    topics: [
      'Python: list comprehensions, decorators, context managers',
      'Framework usado: rutas, ORM, migraciones, serializers',
      'Testing: pytest, fixtures',
      'Async con FastAPI o Celery para tareas background',
    ],
  },
  {
    match: ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'gcp', 'azure'],
    topics: [
      'Docker: Dockerfile optimizado, docker-compose, multi-stage builds',
      'CI/CD: GitHub Actions — lint, test, build, deploy',
      'Cloud: EC2/Compute, S3/Storage, variables de entorno en producción',
      'Kubernetes básico: pods, services, deployments',
    ],
  },
  {
    match: ['software engineer', 'software developer'],
    topics: [
      'Estructuras de datos: arrays, maps, sets, pilas, colas',
      'Algoritmos: búsqueda, ordenamiento, complejidad O(n)',
      'SOLID y Clean Code: principios con ejemplos concretos',
      'Sistema de diseño: REST vs GraphQL, microservicios básico',
      'Git: flujo de trabajo en equipo, code review',
    ],
  },
];

const DEFAULT_TOPICS = [
  'Algoritmos: arrays, strings, recursión — LeetCode easy',
  'SOLID y Clean Code: di un ejemplo real de tu experiencia',
  'Git: explica tu flujo de trabajo habitual en equipo',
  '"¿Cuéntame de un proyecto del que estés orgulloso?" — prepara 2 min',
];

function getRecommendations(job) {
  const text  = `${job.title} ${job.source}`.toLowerCase();
  const found = [];
  for (const entry of TECH_MAP) {
    if (entry.match.some(kw => text.includes(kw))) {
      found.push(...entry.topics);
    }
  }
  const techTips = [...new Set(found)].slice(0, FREELANCE_SOURCES.has(job.source) ? 3 : 5);

  if (FREELANCE_SOURCES.has(job.source)) {
    return [...techTips.length ? techTips : DEFAULT_TOPICS.slice(0, 2), ...FREELANCE_TIPS.slice(0, 3)];
  }
  return techTips.length > 0 ? techTips : DEFAULT_TOPICS;
}

module.exports = { getRecommendations };
