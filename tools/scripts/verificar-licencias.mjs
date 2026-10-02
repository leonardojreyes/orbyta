// Verifica que las licencias de las dependencias sean las permitidas (CLAUDE.md, regla 6).
// Las excepciones viven en tools/licencias-excepciones.json y se justifican en un ADR.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const permitidas = new Set([
  'MIT',
  'MIT-0',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'MPL-2.0',
  // Permisivas equivalentes a MIT/BSD
  'ISC',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
  'CC-BY-4.0',
  'BlueOak-1.0.0',
  'Python-2.0',
  'WTFPL',
]);

const excepciones = JSON.parse(
  readFileSync(
    join(process.cwd(), 'tools', 'licencias-excepciones.json'),
    'utf8',
  ),
).excepciones;
const excepcionadas = new Set(excepciones.map((e) => e.paquete));

// "A OR B" es válida si alguna alternativa lo es; "A AND B" si todas lo son.
const esPermitida = (expresion) => {
  const limpia = expresion.replace(/[()]/g, ' ').trim();
  return limpia
    .split(/\s+AND\s+/)
    .every((conjunto) =>
      conjunto
        .split(/\s+OR\s+/)
        .some((licencia) => permitidas.has(licencia.trim())),
    );
};

const salida = execFileSync('pnpm', ['licenses', 'list', '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === 'win32',
});
const porLicencia = JSON.parse(salida);

const infracciones = [];
for (const [licencia, paquetes] of Object.entries(porLicencia)) {
  if (esPermitida(licencia)) continue;
  for (const paquete of paquetes) {
    if (!excepcionadas.has(paquete.name))
      infracciones.push(`${paquete.name} (${licencia})`);
  }
}

if (infracciones.length > 0) {
  console.error(
    'Licencias no permitidas (agregar a la excepción con ADR o quitar la dependencia):',
  );
  for (const infraccion of infracciones) console.error(`  - ${infraccion}`);
  process.exit(1);
}
console.log(
  `Licencias verificadas: ${Object.keys(porLicencia).length} tipos, ${excepciones.length} excepciones documentadas.`,
);
