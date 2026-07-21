interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Limitador en memoria por instancia (sin Redis disponible en este entorno). Suficiente para un
 * único proceso; en un despliegue multi-instancia debería sustituirse por un almacén compartido.
 */
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
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
