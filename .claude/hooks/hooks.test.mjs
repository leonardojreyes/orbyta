import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBash } from './guard-bash.mjs';
import { checkEdit } from './guard-edit.mjs';

test('bloquea edición de .env pero no de .env.example', () => {
  assert.ok(checkEdit('.env'));
  assert.ok(checkEdit('apps/api/.env.local'));
  assert.equal(checkEdit('.env.example'), null);
});

test('bloquea infra de producción', () => {
  assert.ok(checkEdit('infra/helm/prod/values.yaml'));
  assert.equal(checkEdit('infra/helm/dev/values.yaml'), null);
});

test('permite migraciones nuevas', () => {
  assert.equal(checkEdit('modules/x/infrastructure/migrations/9999-nueva.ts'), null);
});

test('bloquea comandos destructivos', () => {
  const destructivos = [
    ['r', 'm -rf node_modules'],
    ['r', 'm -fr /tmp/x'],
    ['r', 'm -r -f dir'],
    ['git push --force origin main'],
    ['git push -f'],
    ['git reset --hard HEAD~1'],
    ['kubectl delete pod x -n production'],
    ['helm upgrade api ./chart --namespace prod'],
  ].map((partes) => partes.join(''));
  for (const c of destructivos) assert.ok(checkBash(c), c);
});

test('permite comandos normales', () => {
  for (const c of [
    'pnpm nx test domain',
    'git push origin fase0/0.3',
    'rm archivo.txt',
    'kubectl get pods -n dev',
  ]) {
    assert.equal(checkBash(c), null, c);
  }
});
