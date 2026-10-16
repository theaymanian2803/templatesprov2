/**
 * Lighthouse CI config. Run against a local production build with:
 *   npm run build && npm run lighthouse
 * (Not part of CI — it needs a running server + headless Chrome.)
 */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080/'],
      numberOfRuns: 1,
      startServerCommand: 'npm run preview',
      settings: { preset: 'desktop' },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
}
