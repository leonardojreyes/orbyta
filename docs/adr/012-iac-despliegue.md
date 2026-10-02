# ADR 012: IaC y despliegue — OpenTofu + Helm desde GitHub Actions; Argo CD diferido

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
La infraestructura, configuración y pipelines deben ser código (principio 5.2.10), desplegados desde GitHub Actions con un runner autohospedado on-premem (ADR 015), sin depender de servicios gestionados de nube.

## Decisión
**OpenTofu** (fork abierto de Terraform) para namespaces y configuración base de Kubernetes/Keycloak; **Helm** para los despliegues de aplicación, ejecutados directamente desde **GitHub Actions** en Fase 0. **Argo CD** (GitOps) se evalúa después, cuando el número de despliegues o la necesidad de reconciliación continua lo justifique.

## Alternativas consideradas
- **Argo CD desde el inicio:** da reconciliación continua y mejor trazabilidad de despliegues, pero añade un componente más a instalar/aprender en un plazo de 8 días sin que todavía haya múltiples ambientes que lo requieran (se confirmó que por ahora hay un solo ambiente).
- **Terraform (en vez de OpenTofu):** funcionalmente equivalente, pero su licencia BSL no cumple la regla de licencias de la sección 5.10 sin un ADR de excepción; OpenTofu es el fork con licencia abierta (MPL 2.0).

## Consecuencias
- El pipeline del paso 0.4/0.8 ejecuta `tofu plan/apply` y `helm upgrade` como pasos de un mismo workflow.
- Cuando exista separación real de ambientes y más despliegues, se evalúa migrar a Argo CD (registrado en `docs/fase0/deuda-planificada.md`).

## Licencia
OpenTofu: MPL 2.0. Helm: Apache 2.0.
