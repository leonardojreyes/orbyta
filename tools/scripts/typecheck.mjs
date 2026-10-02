// Chequeo de tipos de todos los proyectos (tsc --noEmit por tsconfig de lib/app/spec).
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = process.cwd();
const ignorar = new Set([
  'node_modules',
  'dist',
  'tmp',
  'coverage',
  '.nx',
  '.next',
  '.git',
]);
const nombres = /^tsconfig\.(lib|app|spec)\.json$/;

const buscar = (dir, salida = []) => {
  for (const entrada of readdirSync(dir)) {
    if (ignorar.has(entrada)) continue;
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) buscar(ruta, salida);
    else if (nombres.test(entrada)) salida.push(ruta);
  }
  return salida;
};

const configs = buscar(join(raiz, 'apps'));
for (const base of ['modules', 'packages']) {
  if (existsSync(join(raiz, base))) buscar(join(raiz, base), configs);
}
// Next.js usa un único tsconfig.json
configs.push(join(raiz, 'apps', 'web', 'tsconfig.json'));

const tsc = join(raiz, 'node_modules', 'typescript', 'bin', 'tsc');
let fallos = 0;
for (const config of configs.sort()) {
  const nombre = relative(raiz, config);
  try {
    execFileSync(process.execPath, [tsc, '-p', config, '--noEmit'], {
      stdio: 'pipe',
    });
    console.log(`ok     ${nombre}`);
  } catch (error) {
    const salida = error.stdout?.toString() ?? error.message;
    if (salida.includes('TS18003')) {
      console.log(`omite  ${nombre} (sin archivos de prueba)`);
      continue;
    }
    fallos += 1;
    console.error(`FALLA  ${nombre}\n${salida}`);
  }
}
if (fallos > 0) {
  console.error(`\n${fallos} proyecto(s) con errores de tipos`);
  process.exit(1);
}
