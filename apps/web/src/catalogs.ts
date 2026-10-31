import { useEffect, useState } from "react";
import type { Customer, Project, Technician } from "@orbyta/shared";
import { api } from "./api";

/** Clientes, técnicos y proyectos de la empresa activa, para los selectores de las órdenes. */
export function useCatalogs(enabled = true) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const fail = () => setError("No se pudieron cargar clientes, técnicos y proyectos.");
    api<Customer[]>("/customers").then(setCustomers).catch(fail);
    api<Technician[]>("/technicians").then(setTechnicians).catch(fail);
    api<Project[]>("/projects").then(setProjects).catch(fail);
  }, []);
  return { customers, technicians, projects, error };
}
