import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function pwaAndStaticFilesPlugin() {
  return {
    name: 'pwa-static-files',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      const buildTimestamp = Date.now().toString();

      // 1. Process and copy sw.js with auto-generated CACHE_VERSION
      const swSrc = path.resolve(__dirname, 'sw.js');
      if (fs.existsSync(swSrc)) {
        let swContent = fs.readFileSync(swSrc, 'utf-8');
        swContent = swContent.replace(
          /this\.CACHE_VERSION\s*=\s*["'][^"']+["']/,
          `this.CACHE_VERSION = "${buildTimestamp}"`
        );
        fs.writeFileSync(path.join(distDir, 'sw.js'), swContent, 'utf-8');
        console.log(`[PWA Plugin] Generated dist/sw.js with CACHE_VERSION = ${buildTimestamp}`);
      }

      // 2. Copy static standalone files needed at root
      const filesToCopy = [
        'CNAME',
        'offline.html',
        'manifest.json',
        'assetlinks.json'
      ];
      for (const file of filesToCopy) {
        const src = path.resolve(__dirname, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(distDir, file));
        }
      }

      // 3. Copy .well-known directory if exists
      const wellKnownSrc = path.resolve(__dirname, '.well-known');
      const wellKnownDist = path.join(distDir, '.well-known');
      if (fs.existsSync(wellKnownSrc)) {
        fs.cpSync(wellKnownSrc, wellKnownDist, { recursive: true });
      }

      // 4. Ensure assets/icons and assets/screenshots are copied to dist/assets/
      const assetsDir = path.resolve(__dirname, 'assets');
      if (fs.existsSync(assetsDir)) {
        for (const sub of ['icons', 'screenshots']) {
          const srcSub = path.join(assetsDir, sub);
          const distSub = path.join(distDir, 'assets', sub);
          if (fs.existsSync(srcSub)) {
            fs.cpSync(srcSub, distSub, { recursive: true });
          }
        }
      }
    }
  };
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  plugins: [pwaAndStaticFilesPlugin()]
});
