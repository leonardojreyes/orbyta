# Glosario — Orbyta

> Validado en el paso 0.1. Español de Ecuador por defecto (sección 5.7).

| Término | Definición |
| --- | --- |
| **Proyecto** | Trabajo de construcción o instalación con alcance, tareas e hitos propios (ej. construir la red de agua potable de una ciudadela). |
| **Tarea** | Unidad de trabajo dentro de un proyecto. |
| **Hito** | Punto de control relevante dentro de un proyecto (fecha o entregable significativo). |
| **Contrato** | Acuerdo con un cliente que habilita un conjunto de órdenes de servicio durante un periodo determinado, con precios acordados por tipo de orden (ej. contrato de 1 año para n órdenes de servicio). Agregado en el paso 0.1 a partir de la validación con el usuario. |
| **Orden de servicio (OS)** | Atención puntual a un abonado por una falla o solicitud sobre el servicio ya instalado (ej. reclamo por falla de agua potable). Puede consumir/facturarse contra un contrato. |
| **Abonado** | Cliente final que recibe el servicio y sobre el cual se abren órdenes de servicio. |
| **Punto de servicio** | Ubicación física asociada a un abonado donde se presta o falla el servicio. |
| **Técnico** | Persona de campo que ejecuta órdenes de servicio. |
| **Cuadrilla** | Grupo de técnicos que trabaja junto en campo. |
| **Tipo de falla** | Categoría de la causa reportada en una orden de servicio; es el campo que clasifica la IA local (paso 0.7). |
| **Estado de la OS** | Situación actual de una orden de servicio: registrada, en curso, cerrada (mínimo de la Fase 0; puede ampliarse después). |
| **SLA** | Acuerdo de nivel de servicio: tiempo u otro compromiso de atención asociado a una orden de servicio o contrato. |

## Cambios respecto al glosario inicial del prompt
- Se agrega **Contrato**, a partir de la respuesta del usuario en la ronda de preguntas: "Contratos es la manera como el cliente contrata las órdenes de servicio. Por ejemplo, hago un contrato de 1 año para hacer n órdenes de servicio con precios acordados por tipo de orden."
