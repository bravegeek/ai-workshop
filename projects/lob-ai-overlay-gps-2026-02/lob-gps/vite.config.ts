import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: '/test-pages/messy-app.html',
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LOBGPS',
      fileName: 'lob-gps',
    },
  },
});
