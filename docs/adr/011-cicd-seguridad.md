# 011 — CI/CD y seguridad

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Todo cambio debe llegar a producción por un pipeline con controles automáticos.

## Decisión
GitHub Actions: lint, tipos, pruebas, límites, Semgrep CE, OSV-Scanner (dependencias y licencias), gitleaks y Trivy. Acciones de terceros fijadas por SHA; main protegida.

## Alternativas consideradas
- Controles solo locales: la MacBook no los soporta en RAM.

## Consecuencias
- Checks requeridos en `main`: `calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`. PR obligatorio, sin push directo, force-push ni borrado.
- Con un único revisor humano no se exige aprobación (0 aprobaciones): quien abre el PR puede fusionarlo. Riesgo aceptado hasta sumar otro revisor; entonces se exigirá 1 aprobación.
- Herramientas de licencias abiertas.
