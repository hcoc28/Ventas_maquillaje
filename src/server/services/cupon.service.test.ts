import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/cupon.repository", () => ({
  getCuponPorCodigo: vi.fn(),
}));

import * as cuponRepo from "@/server/repositories/cupon.repository";
import { validarCupon } from "./cupon.service";

function cuponMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    codigo: "TEST10",
    porcentajeDescuento: 10,
    fechaInicio: new Date(Date.now() - 86_400_000),
    fechaFin: new Date(Date.now() + 86_400_000),
    usoMaximo: null,
    vecesUsado: 0,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("validarCupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("valida un cupón activo y vigente", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(cuponMock() as any);

    const resultado = await validarCupon("test10");

    expect(resultado.valido).toBe(true);
  });

  it("rechaza un cupón inexistente", async () => {
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(null);

    const resultado = await validarCupon("NOEXISTE");

    expect(resultado.valido).toBe(false);
  });

  it("rechaza un cupón desactivado", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(cuponMock({ activo: false }) as any);

    const resultado = await validarCupon("TEST10");

    expect(resultado.valido).toBe(false);
  });

  it("rechaza un cupón que aún no inicia su vigencia", async () => {
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cuponMock({ fechaInicio: new Date(Date.now() + 86_400_000) }) as any
    );

    const resultado = await validarCupon("TEST10");

    expect(resultado.valido).toBe(false);
  });

  it("rechaza un cupón ya expirado", async () => {
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cuponMock({ fechaFin: new Date(Date.now() - 86_400_000) }) as any
    );

    const resultado = await validarCupon("TEST10");

    expect(resultado.valido).toBe(false);
  });

  it("rechaza un cupón que ya alcanzó su límite de usos", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(cuponMock({ usoMaximo: 5, vecesUsado: 5 }) as any);

    const resultado = await validarCupon("TEST10");

    expect(resultado.valido).toBe(false);
  });

  it("acepta un cupón con usos restantes disponibles", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(cuponMock({ usoMaximo: 5, vecesUsado: 3 }) as any);

    const resultado = await validarCupon("TEST10");

    expect(resultado.valido).toBe(true);
  });
});
