<!-- Presupuesto: máximo 40 líneas. Se importa en CLAUDE.md, así que se carga siempre.
     Solo el presente. Lo cerrado pasa al documento de la fase con /cerrar-fase. -->
**Fase:** 0 — Fundación · **Paso:** 0.3 en curso · **Actualizado:** 2026-10-12

**En curso:** Paso 0.3 (pipeline). Hecho: `.github/workflows/ci.yml` (calidad, semgrep, osv, gitleaks, trivy), CODEOWNERS, plantilla de PR, dependabot, `iniciar.mjs --sin-instalar`, ADR 011 ajustado. `FASE0.md` excluido del repo (en .gitignore). Commit local en `chore/fundacion`; sin remoto, nada empujado.

**Próximo:** con el repo público creado: `git remote add origin`, push de `chore/fundacion`, commit inicial de `main`, protección de `main` (checks `calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`; 0 aprobaciones), PR limpio (debe pasar) y PR violador (debe bloquearse).

**Pendientes y bloqueos:**
- Usuario: crear `leonardojreyes/orbyta` **público** y vacío (cuenta Free: la protección de ramas exige público).
- Usuario: token de `gh` con Contents, Pull requests, Workflows y Administration en lectura y escritura sobre ese repo.
- Primer CI real sin probar: pueden fallar la lista de licencias de OSV o reglas de Semgrep/Trivy.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,1 GB con apps abiertas.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 011: `main` protegida con PR y checks, sin aprobación obligatoria (un revisor).
- Repo de GitHub público mientras se desarrolla (cuenta Free).
- 009: IA con puerto y adaptador Anthropic (Claude), diferido.

**Recursos medidos:** RAM total 8 GB (0,1 GB libres) · disco libre 53 GB · proyecto 0,21 GB · 0 servidores de desarrollo
