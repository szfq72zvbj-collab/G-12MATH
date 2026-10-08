import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/G-12MATH/',
  plugins: [react()],
  build: {
    outDir: '../../dist/apps/web',
  },
});
