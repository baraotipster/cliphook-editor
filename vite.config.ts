import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* base relativa: o resultado roda em qualquer subpasta (no portfólio, /editor/). */
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
