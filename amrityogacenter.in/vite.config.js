import { resolve, join } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = join(src, entry.name);
    let destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getHtmlInputs() {
  const inputs = {
    main: resolve(__dirname, 'index.html'),
    admin: resolve(__dirname, 'admin.html'),
    certificates: resolve(__dirname, 'certificates.html'),
    certificate: resolve(__dirname, 'certificate.html'),
    blog: resolve(__dirname, 'blog.html'),
  };

  // Dynamically scan root directory for all .html files
  const rootFiles = fs.readdirSync(__dirname);
  rootFiles.forEach(file => {
    if (file.endsWith('.html') && 
        file !== 'index.html' && 
        file !== 'admin.html' && 
        file !== 'certificates.html' && 
        file !== 'certificate.html' && 
        file !== 'blog.html') {
      const name = file.replace('.html', '');
      inputs[name] = resolve(__dirname, file);
    }
  });

  const servicesDir = resolve(__dirname, 'services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir);
    serviceFiles.forEach(file => {
      if (file.endsWith('.html')) {
        const name = file.replace('.html', '');
        inputs[`services/${name}`] = resolve(servicesDir, file);
      }
    });
  }

  const blogDir = resolve(__dirname, 'blog');
  if (fs.existsSync(blogDir)) {
    const scanDir = (dir, prefix = 'blog') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullpath = join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullpath, `${prefix}/${entry.name}`);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          const name = entry.name.replace('.html', '');
          inputs[`${prefix}/${name}`] = fullpath;
        }
      }
    };
    scanDir(blogDir);
  }

  return inputs;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlInputs(),
    },
  },
  plugins: [
    {
      name: 'clean-urls-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const urlPath = req.url.split('?')[0];
          const queryStr = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
          
          if (urlPath === '/blog') {
            req.url = '/blog.html' + queryStr;
          } else if (urlPath === '/certificates') {
            req.url = '/certificates.html' + queryStr;
          } else if (urlPath === '/admin') {
            req.url = '/admin.html' + queryStr;
          } else if (!urlPath.endsWith('.html') && !urlPath.includes('.')) {
            // Check if matching HTML file exists in root or service/blog folders
            const rootHtmlPath = join(__dirname, urlPath + '.html');
            if (fs.existsSync(rootHtmlPath)) {
              req.url = urlPath + '.html' + queryStr;
            } else if (urlPath.startsWith('/services/') || urlPath.startsWith('/blog/')) {
              req.url = urlPath + '.html' + queryStr;
            }
          }
          next();
        });
      }
    },
    {
      name: 'copy-assets',
      closeBundle() {
        copyDir(resolve(__dirname, 'js'), resolve(__dirname, 'dist/js'));
        copyDir(resolve(__dirname, 'images'), resolve(__dirname, 'dist/images'));
        console.log('Successfully copied js and images directories to dist! ✅');
      }
    }
  ]
});
