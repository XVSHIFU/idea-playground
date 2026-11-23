import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
export default defineConfig({base:'./', resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}}, esbuild:{jsx:'automatic'}});
