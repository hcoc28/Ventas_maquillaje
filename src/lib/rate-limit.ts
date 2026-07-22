import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Bucket {
  count: number;
  resetAt: number;
}

/** Limitador en memoria por proceso — solo se usa como respaldo cuando no hay Redis configurado. */
const buckets = new Map<string, Bucket>();

function rateLimitMemoria(key: string, limit: number, windowMs: number): boolean {
  const ahora = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || ahora > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: ahora + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const limitadoresPorVentana = new Map<string, Ratelimit>();

function obtenerLimitadorUpstash(limit: number, windowMs: number): Ratelimit {
  const clave = `${limit}:${windowMs}`;
  let limitador = limitadoresPorVentana.get(clave);
  if (!limitador) {
    limitador = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
      prefix: "eclat-ratelimit",
    });
    limitadoresPorVentana.set(clave, limitador);
  }
  return limitador;
}

/**
 * Con UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN configurados, usa un almacén compartido
 * en Redis — necesario en Vercel, donde cada invocación puede correr en una instancia serverless
 * distinta y un límite en memoria local no serviría de nada. Sin esas variables (ej. desarrollo
 * local) cae automáticamente a un limitador en memoria de un solo proceso.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redis) return rateLimitMemoria(key, limit, windowMs);

  const limitador = obtenerLimitadorUpstash(limit, windowMs);
  const resultado = await limitador.limit(key);
  return resultado.success;
}
