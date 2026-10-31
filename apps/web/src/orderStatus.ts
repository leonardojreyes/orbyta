import { CLOSED_ORDER_STATUS, ORDER_STATUS, TECHNICIAN_ORDER_TARGETS, type ServiceOrder } from "@orbyta/shared";

type Status = ServiceOrder["status"];

/** Estados que puede elegir el usuario; el técnico solo avanza entre asignada, en curso y terminada (la API lo vuelve a validar). */
export const statusChoices = (technician: boolean, current: Status): readonly Status[] =>
  technician ? [...new Set<Status>([current, ...TECHNICIAN_ORDER_TARGETS])] : ORDER_STATUS;

/** El técnico no puede cambiar una orden ya cerrada (terminada o cancelada). */
export const lockedFor = (technician: boolean, current: Status) =>
  technician && (CLOSED_ORDER_STATUS as readonly string[]).includes(current);
