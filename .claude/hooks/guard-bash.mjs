// PreToolUse (Bash): bloquea comandos destructivos.
import { block, isMain, readInput } from './lib.mjs';

const rules = [
  [/\brm\s+(-[a-z]*r[a-z]*\s+-[a-z]*f|-[a-z]*f[a-z]*\s+-[a-z]*r|-[a-z]*(rf|fr)[a-z]*|--recursive\b.*--force|--force\b.*--recursive)/i, 'rm recursivo y forzado'],
  [/\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-f\b|\s\+\S)/, 'git push --force'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard'],
  [/\bkubectl\b.*(prod|production|produccion)/i, 'kubectl contra producción'],
  [/\b(helm|tofu|terraform)\b.*(prod|production|produccion)/i, 'despliegue contra producción'],
];

export const checkBash = (command) => {
  for (const [re, label] of rules) if (re.test(command)) return label;
  return null;
};

if (isMain(import.meta.url)) {
  const input = await readInput();
  const label = checkBash(input.tool_input?.command ?? '');
  if (label) block(`${label}. Pide aprobación explícita al usuario.`);
}
