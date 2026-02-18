import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    target: 'esnext',
    outDir: 'dist',
  },
  {
    entry: { 'lob-gps': 'src/boot.ts' },
    format: ['iife'],
    globalName: 'LobGPS',
    noExternal: [/.*/],
    splitting: false,
    sourcemap: true,
    minify: true,
    target: 'esnext',
    outDir: 'dist',
  },
]);
