# 001 — Estilo arquitectónico

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Equipo pequeño y 8 GB de RAM: microservicios multiplicarían procesos y operación sin una razón medida.

## Decisión
Un monolito modular; cada módulo con capas domain, application, infrastructure e interface. Límites verificados con dependency-cruiser en CI. Un módulo se separa solo con una razón medible.

## Alternativas consideradas
- Microservicios: costo operativo y de RAM sin necesidad medida.
- Monolito en capas sin módulos: se degrada en acoplamiento.

## Consecuencias
- Despliegue y depuración simples; el dominio queda libre de frameworks.
- Exige disciplina de límites: vigilar con dependency-cruiser y el subagente arquitecto.
- Sin licencia propia.
