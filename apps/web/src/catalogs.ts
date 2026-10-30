import { useEffect, useState } from "react";
import type { Customer, Technician } from "@orbyta/shared";
import { api } from "./api";

/** Clientes y técnicos de la empresa activa, para los selectores de las órdenes. */
export function useCatalogs() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const fail = () => setError("No se pudieron cargar los catálogos de clientes y técnicos.");
    api<Customer[]>("/customers").then(setCustomers).catch(fail);
    api<Technician[]>("/technicians").then(setTechnicians).catch(fail);
  }, []);
  return { customers, technicians, error };
}
