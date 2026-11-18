import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * Root ESLint flat config.
 *
 * NOTE: Workspace-level linting lives in `server/eslint.config.mjs` and
 * `client/eslint.config.mjs` — run `yarn lint:all` from the repo root.
 * This root config exists only so that editors/CLI invoked from the repo
 * root don't fail; it intentionally lints nothing.
 */
export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.config.js',
    '**/*.config.mjs',
    '**/*.config.ts',
    'server/**',
    'client/**',
  ]),
]);
