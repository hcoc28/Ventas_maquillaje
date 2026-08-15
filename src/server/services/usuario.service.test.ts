import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/usuario.repository", () => ({
  getUsuarioPorEmail: vi.fn(),
  getUsuarioPorId: vi.fn(),
  crearUsuario: vi.fn(),
  actualizarPerfil: vi.fn(),
  getTodosLosUsuarios: vi.fn(),
  actualizarEstadoUsuario: vi.fn(),
  actualizarPassword: vi.fn(),
  crearTokenRecuperacion: vi.fn(),
  getTokenRecuperacionValido: vi.fn(),
  marcarTokenUsado: vi.fn(),
  invalidarTokensRecuperacion: vi.fn(),
}));

vi.mock("@/server/services/email.service", () => ({
  enviarEmail: vi.fn(),
  plantillaBase: vi.fn((html: string) => html),
}));

vi.mock("@/config/site", () => ({
  siteConfig: { nombreCompleto: "Amour Bloom", url: "https://amourbloom.com" },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (valor: string) => `hash(${valor})`),
    compare: vi.fn(async (valor: string, hash: string) => hash === `hash(${valor})`),
  },
}));

import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { enviarEmail } from "@/server/services/email.service";
import {
  cambiarPassword,
  registrarUsuario,
  restablecerPassword,
  solicitarRecuperacionPassword,
} from "./usuario.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registrarUsuario", () => {
  const datos = { nombre: "María", apellido: "González", email: "maria@test.com", telefono: "55511122", password: "clave1234" };

  it("rechaza con un mensaje generico si el correo ya existe, sin confirmar cual es el motivo", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorEmail).mockResolvedValue({ id: 1 } as never);

    const resultado = await registrarUsuario(datos);

    expect(resultado.exitoso).toBe(false);
    expect(resultado.errores?.[0]).not.toMatch(/ya existe|ya está registrado/i);
    expect(usuarioRepo.crearUsuario).not.toHaveBeenCalled();
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("crea la cuenta con el rol Cliente y envia el correo de bienvenida", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorEmail).mockResolvedValue(null);
    vi.mocked(usuarioRepo.crearUsuario).mockResolvedValue({ id: 7 } as never);

    const resultado = await registrarUsuario(datos);

    expect(resultado).toEqual({ exitoso: true, valor: { id: 7 } });
    expect(usuarioRepo.crearUsuario).toHaveBeenCalledWith(
      expect.objectContaining({ email: datos.email, roleNombre: "Cliente", passwordHash: "hash(clave1234)" })
    );
    expect(enviarEmail).toHaveBeenCalledWith(expect.objectContaining({ to: datos.email }));
  });
});

describe("solicitarRecuperacionPassword", () => {
  it("no revela si el correo existe: no envia correo ni falla cuando no hay cuenta", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorEmail).mockResolvedValue(null);

    await expect(solicitarRecuperacionPassword("desconocido@test.com")).resolves.toBeUndefined();
    expect(usuarioRepo.crearTokenRecuperacion).not.toHaveBeenCalled();
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("invalida tokens previos, crea uno nuevo y envia el correo cuando la cuenta existe", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorEmail).mockResolvedValue({ id: 3, email: "maria@test.com" } as never);

    await solicitarRecuperacionPassword("maria@test.com");

    expect(usuarioRepo.invalidarTokensRecuperacion).toHaveBeenCalledWith(3);
    expect(usuarioRepo.crearTokenRecuperacion).toHaveBeenCalledWith(3, expect.any(String), expect.any(Date));
    expect(enviarEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "maria@test.com" }));
  });
});

describe("restablecerPassword", () => {
  it("rechaza un token invalido o expirado", async () => {
    vi.mocked(usuarioRepo.getTokenRecuperacionValido).mockResolvedValue(null);

    const resultado = await restablecerPassword("token-invalido", "nuevaClave123");

    expect(resultado.exitoso).toBe(false);
    expect(usuarioRepo.actualizarPassword).not.toHaveBeenCalled();
  });

  it("actualiza la contraseña, marca el token usado e invalida los demas tokens del usuario", async () => {
    vi.mocked(usuarioRepo.getTokenRecuperacionValido).mockResolvedValue({ id: 9, userId: 3 } as never);

    const resultado = await restablecerPassword("token-valido", "nuevaClave123");

    expect(resultado).toEqual({ exitoso: true, valor: true });
    expect(usuarioRepo.actualizarPassword).toHaveBeenCalledWith(3, "hash(nuevaClave123)");
    expect(usuarioRepo.marcarTokenUsado).toHaveBeenCalledWith(9);
    expect(usuarioRepo.invalidarTokensRecuperacion).toHaveBeenCalledWith(3);
  });
});

describe("cambiarPassword", () => {
  it("falla si el usuario no existe", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorId).mockResolvedValue(null);

    const resultado = await cambiarPassword(99, "actual", "nueva1234");

    expect(resultado.exitoso).toBe(false);
  });

  it("falla si la contraseña actual no coincide", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorId).mockResolvedValue({ id: 3, passwordHash: "hash(otra)" } as never);

    const resultado = await cambiarPassword(3, "actual", "nueva1234");

    expect(resultado.exitoso).toBe(false);
    expect(usuarioRepo.actualizarPassword).not.toHaveBeenCalled();
  });

  it("actualiza la contraseña cuando la actual es correcta", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorId).mockResolvedValue({ id: 3, passwordHash: "hash(actual)" } as never);

    const resultado = await cambiarPassword(3, "actual", "nueva1234");

    expect(resultado).toEqual({ exitoso: true, valor: true });
    expect(usuarioRepo.actualizarPassword).toHaveBeenCalledWith(3, "hash(nueva1234)");
  });
});
