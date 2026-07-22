import * as cuponRepo from "@/server/repositories/cupon.repository";
import type { CuponAdminInput } from "@/validators/admin";

export interface CuponValidado {
  id: number;
  codigo: string;
  porcentajeDescuento: number;
}

export type ResultadoValidacionCupon = { valido: true; cupon: CuponValidado } | { valido: false; mensaje: string };

export async function validarCupon(codigo: string): Promise<ResultadoValidacionCupon> {
  const cupon = await cuponRepo.getCuponPorCodigo(codigo.trim().toUpperCase());
  if (!cupon || !cupon.activo) {
    return { valido: false, mensaje: "Cupón no válido." };
  }

  const ahora = new Date();
  if (ahora < cupon.fechaInicio || ahora > cupon.fechaFin) {
    return { valido: false, mensaje: "Este cupón no está vigente." };
  }

  if (cupon.usoMaximo !== null && cupon.vecesUsado >= cupon.usoMaximo) {
    return { valido: false, mensaje: "Este cupón ya alcanzó su límite de usos." };
  }

  return {
    valido: true,
    cupon: { id: cupon.id, codigo: cupon.codigo, porcentajeDescuento: Number(cupon.porcentajeDescuento) },
  };
}

export async function getTodosLosCuponesAdmin() {
  return cuponRepo.getTodosLosCupones();
}

export async function getCuponPorIdAdmin(id: number) {
  return cuponRepo.getCuponPorId(id);
}

function datosCupon(data: CuponAdminInput) {
  return {
    codigo: data.codigo.toUpperCase(),
    porcentajeDescuento: data.porcentajeDescuento,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),
    usoMaximo: data.usoMaximo || null,
    activo: data.activo,
  };
}

export async function crearCuponAdmin(data: CuponAdminInput) {
  return cuponRepo.crearCupon(datosCupon(data));
}

export async function actualizarCuponAdmin(id: number, data: CuponAdminInput) {
  return cuponRepo.actualizarCupon(id, datosCupon(data));
}

export async function desactivarCuponAdmin(id: number) {
  return cuponRepo.desactivarCupon(id);
}

export async function registrarUsoCupon(id: number) {
  return cuponRepo.incrementarUso(id);
}
