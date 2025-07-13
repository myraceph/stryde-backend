import { build } from 'esbuild';

build({
  entryPoints: [
    './src/functions/signup.ts',
    './src/functions/preSignUpTrigger.ts',
    './src/functions/login.ts',
    // add more as needed
  ],
  entryNames: '[name]/index',
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
}).catch(() => process.exit(1));
