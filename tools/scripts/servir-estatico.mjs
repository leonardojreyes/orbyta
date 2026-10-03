// Servidor estático mínimo para revisar el Storybook construido (dist/storybook) en pruebas de accesibilidad.
// Uso: node tools/scripts/servir-estatico.mjs <carpeta> <puerto>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [, , carpeta = 'dist/storybook', puerto = '6007'] = process.argv;
const raiz = resolve(carpeta);
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let ruta = resolve(join(raiz, normalize(decodeURIComponent(url.pathname))));
    if (ruta !== raiz && !ruta.startsWith(raiz + sep)) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(ruta)).isDirectory()) ruta = join(ruta, 'index.html');
    res.writeHead(200, {
      'content-type': tipos[extname(ruta)] ?? 'application/octet-stream',
    });
    res.end(await readFile(ruta));
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(Number(puerto), () =>
  console.log(`Sirviendo ${raiz} en http://localhost:${puerto}`),
);
